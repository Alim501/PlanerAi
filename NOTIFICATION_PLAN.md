# NOTIFICATION_PLAN.md
# Plan realization: Notification Service via Kafka

## 1. Architecture Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│                     Angular Frontend (4200)                          │
│             REST polling: GET /api/notifications/count               │
└──────────────────────────────┬───────────────────────────────────────┘
                               │ HTTP/JSON (JWT cookie)
┌──────────────────────────────▼───────────────────────────────────────┐
│              Spring Boot Backend (8080)                              │
│                                                                      │
│  DeadlineScheduler (@Scheduled cron)                                 │
│       └─► KafkaNotificationProducer                                 │
│                                                                      │
│  NotificationController ──► NotificationService                     │
│       └─► NotificationRepository (reads from notification table)    │
└─────────────────┬────────────────────────────────────────────────────┘
                  │ Kafka topic: notification.events
                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│              Notification-Service (8081)                            │
│                                                                     │
│  NotificationConsumer (Kafka @KafkaListener)                        │
│       ├─► NotificationPersistenceService ──► PostgreSQL             │
│       └─► EmailService (Spring Mail / SMTP)                         │
└─────────────────────────────────────────────────────────────────────┘
                  │
          ┌───────┴──────┐
          ▼              ▼
     PostgreSQL       Kafka (KRaft)
   (shared DB)       (port 9092)
```

## 2. Design Decisions

### Why Kafka over RabbitMQ
- Log-based: events can be replayed (useful for debugging and retries)
- Consumer groups: easy to add new consumers in the future (e.g., push notifications, analytics)
- KRaft mode: no Zookeeper required since Kafka 3.3+

### Shared Database pattern
Notification-Service writes to the `notification` table in the same PostgreSQL DB.
Main Backend reads from the same table via its own `NotificationRepository`.
Flyway migrations run ONLY in Main Backend (Notification-Service disables Flyway).

**Trade-off:** tight DB coupling, acceptable at this scale.

### No JWT in Notification-Service
Notification-Service has no public REST API — it is purely event-driven (Kafka consumer).
All user-facing notification endpoints remain in Main Backend (already has JWT/Spring Security).

### REST polling instead of SSE
Frontend polls `GET /api/notifications/count` every 30 seconds.
SSE is future work (Phase 2).

## 3. Notification Events

| Type                | Trigger                               | Channels       |
|---------------------|---------------------------------------|----------------|
| DEADLINE_WARNING    | Task deadline = today + 3 days        | In-app + Email |
| DEADLINE_URGENT     | Task deadline = today                 | In-app + Email |
| TASK_OVERDUE        | Task deadline < today, status != DONE | In-app         |
| PLAN_ENDING         | UserPlanProgress.endDate = today + 3  | In-app + Email |
| PROGRESS_MILESTONE  | progress reaches 50% or 100%          | In-app         |

## 4. Kafka Event Payload: NotificationEvent

```json
{
  "eventId": "uuid-v4",
  "type": "DEADLINE_WARNING",
  "userId": 42,
  "userEmail": "student@example.com",
  "title": "Дедлайн задачи через 3 дня",
  "message": "Задача «Изучить производные» истекает 01.05.2026",
  "link": "/plans/5",
  "notifyEmail": true,
  "notifyInApp": true,
  "occurredAt": "2026-04-28T09:00:00"
}
```

## 5. Database Changes

### V6 — task.deadline
```sql
ALTER TABLE task ADD COLUMN deadline DATE;
```
Nullable. Backward compatible. Frontend optionally sends deadline when creating/updating a task.

### V7 — user notification preferences
```sql
ALTER TABLE users
    ADD COLUMN notify_email BOOLEAN DEFAULT TRUE,
    ADD COLUMN notify_inapp BOOLEAN DEFAULT TRUE;
```
All existing users default to TRUE.

### V8 — notification table
```sql
CREATE TABLE notification (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT       NOT NULL,
    type        VARCHAR(50)  NOT NULL,
    title       VARCHAR(255),
    message     TEXT,
    link        VARCHAR(500),
    is_read     BOOLEAN      DEFAULT FALSE,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_notification_user_read ON notification (user_id, is_read);
```
No FK on user_id — decoupled from users table for service independence.

## 6. API Endpoints (Main Backend)

| Method  | Path                            | Description                |
|---------|---------------------------------|----------------------------|
| GET     | /api/notifications              | List (param: unreadOnly)   |
| GET     | /api/notifications/count        | Unread count               |
| PATCH   | /api/notifications/{id}/read    | Mark one as read           |
| PATCH   | /api/notifications/read-all     | Mark all as read           |

## 7. Scheduler Jobs (Main Backend)

| Cron              | Job                    | Query target               |
|-------------------|------------------------|----------------------------|
| 0 0 9 * * *       | checkTaskDeadlines     | task.deadline in next 3d   |
| 0 0 9 * * *       | checkPlanEndDates      | user_plan_progress.end_date|
| 0 0 8 * * MON     | sendWeeklyDigest       | all active plans (future)  |

## 8. Implementation Phases

### Phase 1 — DB Schema + Backend Scaffolding (this PR)
- [x] V6, V7, V8 Flyway migrations
- [x] Task entity: add deadline field
- [x] TaskDTO: add deadline field
- [x] User entity: add notifyEmail, notifyInApp
- [x] Notification entity (JPA)
- [x] NotificationType enum
- [x] NotificationEvent (Kafka payload POJO)
- [x] NotificationRepository (reads)
- [x] NotificationService + NotificationController
- [x] Updated TaskRepository, ProgressRepository queries
- [x] TaskService handles deadline in addTask/updateTask

### Phase 2 — Kafka Producer + Scheduler (this PR)
- [x] Add spring-kafka to Back/pom.xml
- [x] KafkaNotificationProducer
- [x] DeadlineScheduler (@Scheduled cron jobs)
- [x] @EnableScheduling on TaskApiApplication

### Phase 3 — Notification-Service (this PR)
- [x] New Spring Boot app in Notification-Service/
- [x] Kafka consumer
- [x] EmailService (Spring Mail)
- [x] NotificationPersistenceService
- [x] docker-compose.yml with Kafka (KRaft)

### Phase 4 — Frontend integration (future work)
- [ ] Notification bell component in Angular navbar
- [ ] Polling GET /api/notifications/count every 30s
- [ ] Notification dropdown with mark-as-read
- [ ] Task create/edit form: deadline datepicker
- [ ] User profile: toggle notify_email / notify_inapp

### Phase 5 — SSE real-time push (future work)
- [ ] SseEmitterService in Main Backend
- [ ] GET /api/notifications/stream endpoint
- [ ] Angular EventSource subscription

## 9. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Kafka unavailable at startup | Medium | High | Spring Kafka retries; Backend continues without notifications |
| Email SMTP failure | Medium | Low | Catch exception in EmailService, log error, notification still saved in DB |
| Duplicate notifications (scheduler crash/restart) | Low | Medium | eventId UUID deduplication can be added to notification table (future) |
| Shared DB coupling | Low | Medium | Acceptable at this scale; migrate to separate DB when services grow |
| Task has no user (orphaned week/plan) | Low | Low | UserPlanProgress JOIN filters orphans |
| N+1 queries in scheduler | Low | Low | JOIN FETCH in custom @Query prevents N+1 |
| Builder.Default for Boolean fields in User | Certain | Low | Use @Builder.Default private Boolean notifyEmail = true |

## 10. Local Development Setup

### Prerequisites
- Docker Desktop (for Kafka)
- Java 21, Maven
- PostgreSQL running on 5432
- SMTP credentials (Gmail App Password recommended)

### Start order
```
1. docker-compose up kafka -d     # Start Kafka
2. Start PostgreSQL
3. cd Back && ./mvnw spring-boot:run    # Runs Flyway migrations + starts backend
4. cd Notification-Service && ./mvnw spring-boot:run  # Starts consumer
5. cd Front && npm start
```

### Environment variables added

**Back/.env (additions):**
```
KAFKA_BOOTSTRAP_SERVERS=localhost:9092
```

**Notification-Service/.env:**
```
KAFKA_BOOTSTRAP_SERVERS=localhost:9092
DB_URL=jdbc:postgresql://localhost:5432/task_service
DB_USERNAME=...
DB_PASSWORD=...
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
```