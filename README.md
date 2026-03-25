## Task API

REST API для управления задачами с поддержкой аутентификации (JWT), фильтрацией и документацией Swagger.

---

### Технологии

* Java 21
* Spring Boot 3.5.0
* Spring Security + JWT
* Spring Data JPA
* PostgreSQL
* Swagger для документации
* Maven
* Lombok

---

### Как запустить проект локально

#### 1. Склонировать репозиторий

```bash
git clone https://github.com/Alim501/PlanerAi.git
cd PlanerAi
```

#### 2. Создать .env файл в папке Back на основе .env.example:

Укажите в нём необходимые переменные

#### 3. Настроить базу данных PostgreSQL

Создай БД вручную или выполнить:

```sql
CREATE DATABASE task_service;
```

#### 4. Запустить проект

Для запуска бека с папки Back выполнить команду
```bash
mvn spring-boot:run
```
Для запуска фронта с папки Front выполнить команду
```bash
npm run start
```

---


### Swagger-документация

Для удобного просмотра и тестирования эндпоинтов была добавлена документация Swagger

Доступна по адресу: http://localhost:8080/swagger-ui/index.html

---
#### Заметки
- `User` ↔ `Plan` через `UserPlanProgress` (ManyToMany) — каждый пользователь может подписаться на любой план; здесь же хранится прогресс
- `Plan` → `Week[]` → `Task[]` — план разбит по неделям, каждая неделя содержит задачи
- `Task` ↔ `Note[]` через таблицу `tasks_notes` — к задаче прикреплены конспекты из базы (внутренние ресурсы)
- `Task.externalResources` — таблица `task_external_resources` — строки с внешними ресурсами (учебники, ссылки), предложенными AI когда конспектов недостаточно
- `Note.keywords` — ключевые слова (уникальные, case-insensitive) — именно по ним происходит авто-подбор конспектов при генерации плана


- **Фильтрация** по нескольким параметрам (title, subject) добавлена в PlanController
- Фильтрация и **сортировка** (subject, createdAt) в NoteController
- Реализована работа с **профилем** пользователя (смена имени фамилии, пароля, получение данных)

В NoteController (api/notes)
- Добавлена возможность оценивания конспектов (/{noteId}/rate)
- Увеличения числа просмотров (/{noteId}/view)
- Есть функционал добавления ключевых слов (/{noteId}/keywords) и поиск конспектов по ним (/byKeywords)
- Ключевые слова являются уникальными и case insensitive, если слово существует в базе оно будет привязано, иначе создано новое; получение всех ключевых слов (/keywords)

- улучшена обработка исключений
---
#### Процесс создания плана

Есть два способа создать план:

---

**Способ 1 — Вручную** `POST /api/plans`

```json
{
  "title": "Подготовка к экзамену по Java",
  "subjectId": 2,
  "startDate": "2025-10-15",
  "endDate": "2025-12-15",
  "weeks": [
    {
      "weekNumber": 1,
      "title": "Основы",
      "estimatedHours": 8,
      "tasks": [
        { "title": "Изучить типы данных", "description": "..." }
      ]
    }
  ]
}
```

---

**Способ 2 — Генерация через AI** `POST /api/ai/plans/generate`

Полная документация: см. **AI-QUICKSTART.md**

Краткий запрос:
```json
{
  "subject": "Java",
  "durationWeeks": 8,
  "level": "intermediate",
  "topics": ["ООП", "коллекции", "многопоточность"],
  "subjectId": 2
}
```

Что происходит автоматически:
1. Система находит конспекты пользователя, подходящие по темам
2. AI генерирует план, используя найденные конспекты как ресурсы
3. Каждая задача получает `relatedNotes` (конспекты из базы) и/или `externalResources` (книги, ссылки)
4. Всё сохраняется в БД и возвращается как готовый объект плана

---

Независимо от способа:
- Каждая задача имеет статус `PENDING`
- Пользователь привязывается к плану через `UserPlanProgress`
- `startDate` = дата создания, `endDate` = startDate + N недель

---
#### To do:
- ✅ AI интеграция (Google Gemini — генерация планов, анализ конспектов, улучшение задач)
- ✅exception handler
- User info problem: JWT token contain only email and there is no GetByEmail endpoint:
1. ✅ Put userId in jwt
4. ✅Added method to get current user details http://localhost:8080/api/users/me and 2 other in UserController
- ✅Dynamic subjects added by moderator/admin 
In Future:
- ✅ Added HttpOnly Cookie (accessToken and refreshToken)
- Docker

---
### Architecture Diagrams
- General Component Diagram (Mermaid): diagrams/component-diagram.md

If you want the diagram to be visible right in this README, insert the Mermaid code block below (or keep it as-is in diagrams/component-diagram.md). GitHub renders Mermaid fenced blocks automatically.

```mermaid
flowchart LR
  %% Clients
  A[User / Browser]

  %% Frontend
  subgraph FE[Front – Angular]
    FE_APP[Angular App]
    FE_GUARDS[Auth Guard]
    FE_INTERCEPTOR[Auth Interceptor]
  end

  %% Backend
  subgraph BE[Back – Spring Boot Task API]
    direction TB

    subgraph SEC[Security]
      SEC_SPRING[Spring Security]
      SEC_JWT_FILTER[JwtTokenFilter]
      SEC_JWT_SERVICE[JwtService]
    end

    subgraph CTRL[REST Controllers]
      CTRL_AUTH[AuthController]
      CTRL_USER[UserController]
      CTRL_PLAN[PlanController]
      CTRL_TASK[TaskController]
      CTRL_NOTE[NoteController]
      CTRL_FILE[FileController]
      CTRL_EX[GlobalExceptionHandler]
    end

    subgraph SRV[Services]
      SRV_AUTH[AuthService]
      SRV_USER[UserService]
      SRV_PLAN[PlanService]
      SRV_TASK[TaskService]
      SRV_NOTE[NoteService]
      SRV_FILE[FileService]
      SRV_USER_DETAILS[CustomUserDetailsService]
    end

    subgraph REPO[Repositories]
      REPO_USER[UserRepository]
      REPO_PLAN[PlanRepository]
      REPO_TASK[TaskRepository]
      REPO_NOTE[NoteRepository]
      REPO_PROGRESS[ProgressRepository]
    end

    subgraph DOCS[Docs]
      SWAGGER[Swagger UI / OpenAPI]
    end
  end

  %% Database
  DB[(PostgreSQL)]

  %% Config
  ENV[.env / application.properties]

  %% Flows
  A -->|HTTP(S)| FE_APP
  FE_APP -->|HTTP JSON| BE

  FE_APP -->|Attaches JWT| FE_INTERCEPTOR
  FE_APP -->|Route protection| FE_GUARDS

  %% Security
  FE_APP -->|/api/**| SEC_SPRING
  SEC_SPRING --> SEC_JWT_FILTER
  SEC_JWT_FILTER --> SEC_JWT_SERVICE

  %% Controllers -> Services
  CTRL_AUTH --> SRV_AUTH
  CTRL_USER --> SRV_USER
  CTRL_PLAN --> SRV_PLAN
  CTRL_TASK --> SRV_TASK
  CTRL_NOTE --> SRV_NOTE
  CTRL_FILE --> SRV_FILE

  %% Services -> Repositories
  SRV_AUTH --> REPO_USER
  SRV_USER --> REPO_USER
  SRV_PLAN --> REPO_PLAN
  SRV_TASK --> REPO_TASK
  SRV_NOTE --> REPO_NOTE
  SRV_PLAN --> REPO_PROGRESS
  SRV_USER_DETAILS --> REPO_USER

  %% Repositories -> DB
  REPO_USER --> DB
  REPO_PLAN --> DB
  REPO_TASK --> DB
  REPO_NOTE --> DB
  REPO_PROGRESS --> DB

  %% Swagger
  A -->|Docs| SWAGGER
  SWAGGER -. served by .-> BE

  %% Config wiring
  ENV -. provides secrets/urls .-> BE
  ENV -. DB URL/creds .-> DB

  %% File operations (optional storage)
  FE_APP -->|Upload/Download| CTRL_FILE
  CTRL_FILE --> SRV_FILE

  %% Legends
  classDef area fill:#f8f9ff,stroke:#9aa0a6,stroke-width:1px;
  class FE,BE,DOCS area;
```

Notes
- Front is an Angular app that communicates with the Spring Boot backend via REST (JSON). AuthGuard and AuthInterceptor protect routes and attach JWT access tokens.
- Backend uses Spring Security with a JWT filter and JwtService for token validation. Controllers delegate to Services, which access data via Spring Data JPA repositories.
- PostgreSQL stores Users, Plans, Tasks, Notes, and UserPlanProgress.
- Swagger UI provides interactive API documentation at /swagger-ui/index.html.
- Configuration variables are provided via .env and application.properties (DB credentials, JWT secret, allowed origins, etc.).


! If problems with launching and it is related to flyway then write command directly to db console
```sql
DELETE FROM flyway_schema_history WHERE version = '2';
```

- relocated tokens(access, refresh) expiration into .env

- response for the most errors looks like this (ErrorResponse)
```json
{
  "timestamp": "2025-11-02T22:43:17.590900900",
  "status": 500,
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```