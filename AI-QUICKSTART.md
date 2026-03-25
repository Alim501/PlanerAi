# AI Quick Start Guide

## Что готово:

1. **AI Микросервис (Python + FastAPI)** - Google Gemini интеграция
2. **Spring Boot Integration** - endpoints настроены
3. **Angular UI** - кнопка "Сгенерировать с AI" в создании планов
4. **Анализ конспектов** - PDF/DOCX/JPG/PNG/TXT через Gemini File API

## Быстрый запуск за 4 шага:

### 1. Получите Gemini API ключ

Перейдите на [aistudio.google.com](https://aistudio.google.com) → **Get API key** → **Create API key**

> Используйте именно AI Studio, не Google Cloud Console.

### 2. Настройте AI Service

```bash
cd AI-Service

python3 -m venv venv
source venv/bin/activate  # macOS/Linux
# или venv\Scripts\activate  # Windows

pip install -r requirements.txt
```

Создайте `.env` в папке `AI-Service`:
```env
GEMINI_API_KEY=ваш_ключ
GEMINI_MODEL=gemini-2.0-flash
```

### 3. Запустите AI Service

```bash
source venv/bin/activate
python -m app.main
```

Проверьте запуск:
```bash
curl http://localhost:8000/health
```

Ожидаемый ответ:
```json
{
  "status": "healthy",
  "ollama_connected": true,
  "model": "gemini-2.0-flash",
  "version": "1.0.0"
}
```

### 4. Запустите Spring Boot и Frontend

```bash
# Терминал 1
cd Back && ./mvnw spring-boot:run

# Терминал 2
cd Front && npm start
```

## Как использовать:

### Генерация плана с AI (на основе конспектов):
1. Откройте `http://localhost:4200`
2. Войдите в систему
3. Перейдите в **"Планы"** → **"Создать план"**
4. Нажмите **"Сгенерировать с AI"**
5. Заполните форму: предмет, длительность, темы, цели
6. Система **автоматически** найдёт ваши конспекты по указанным темам
7. AI сгенерирует план, ссылаясь на ваши конспекты как ресурсы

> **Для фронтенда:** поле `subjectId` в запросе опционально — если передать, система дополнительно учитывает все конспекты по этому предмету.

### Анализ конспекта:
1. Загрузите конспект (PDF/DOCX/JPG/PNG/TXT)
2. Откройте конспект и нажмите **"Анализировать"**
3. AI извлечёт резюме, ключевые концепции, сложность и язык
4. После анализа конспект будет участвовать в авто-подборе при генерации планов

## Проверка работы:

```bash
# AI Service
curl http://localhost:8000/health

# Spring Boot AI endpoint
curl -H "Authorization: Bearer <token>" \
     http://localhost:8080/api/ai/health
```

## Troubleshooting:

### AI Service не запускается:
```bash
python3 --version  # нужна 3.11+
pip install --upgrade -r requirements.txt
```

### Ошибка 429 от Gemini:
- Проверьте что ключ с **aistudio.google.com**, не Google Cloud Console
- Проверьте квоты на aistudio.google.com

### Backend не видит AI Service:
1. Убедитесь что AI Service запущен на порту 8000
2. Проверьте `AI_SERVICE_URL` в `Back/.env`

---

## API: Генерация плана

### Эндпоинт

```
POST /api/ai/plans/generate
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Тело запроса

```json
{
  "subject": "Математический анализ",
  "durationWeeks": 8,
  "level": "intermediate",
  "topics": ["производные", "интегралы", "пределы"],
  "goals": "Подготовиться к экзамену",
  "subjectId": 3
}
```

| Поле            | Тип            | Обязательное | Описание                                                         |
|-----------------|----------------|:------------:|------------------------------------------------------------------|
| `subject`       | string         | ✅           | Название предмета                                                |
| `durationWeeks` | integer (1–52) | ✅           | Количество недель                                                |
| `level`         | string         | ❌           | `beginner` / `intermediate` / `advanced` (по умолчанию `intermediate`) |
| `topics`        | string[]       | ❌           | Темы — по ним система ищет подходящие конспекты                 |
| `goals`         | string         | ❌           | Цели обучения (влияют на формулировки задач)                    |
| `subjectId`     | integer        | ❌           | ID предмета — даёт бонус конспектам по этому предмету при подборе |

### Ответ — сохранённый план (200 OK)

```json
{
  "id": 42,
  "title": "Курс математического анализа",
  "description": "Структурированный план изучения...",
  "difficulty": "intermediate",
  "subject": { "id": 3, "name": "Математический анализ" },
  "weeks": [
    {
      "id": 101,
      "weekNumber": 1,
      "title": "Пределы и непрерывность",
      "estimatedHours": 10,
      "tasks": [
        {
          "id": 201,
          "title": "Изучить определение предела",
          "description": "Работа с конспектом лекции №1",
          "taskStatus": "PENDING",
          "relatedNotes": [
            {
              "id": 5,
              "title": "Лекция 1: Пределы",
              "difficulty": "beginner",
              "keywords": [...]
            }
          ],
          "externalResources": []
        },
        {
          "id": 202,
          "title": "Решить задачи на вычисление пределов",
          "description": "...",
          "taskStatus": "PENDING",
          "relatedNotes": [],
          "externalResources": [
            "Зорич В.А. Математический анализ, том 1, глава 3"
          ]
        }
      ]
    }
  ]
}
```

> **Ключевые поля для фронтенда:**
> - `task.relatedNotes` — внутренние конспекты из базы; можно сделать кликабельными ссылками на страницу конспекта
> - `task.externalResources` — внешние ресурсы (строки); отображать как текст или ссылки
> - `task.taskStatus` — начальное состояние всегда `PENDING`

---

## Workflow: Генерация плана с конспектами

```
Frontend: POST /api/ai/plans/generate
  { subject, durationWeeks, topics, subjectId, ... }
                        │
                        ▼
         [AIController] Принять запрос
                        │
                        ▼
         [NoteMatchingService] Авто-подбор конспектов
           1. Нормализация topics → отдельные слова
           2. Поиск конспектов пользователя по keywords (DB)
           3. Бонус конспектам по указанному subjectId
           4. Скоринг: +3 за каждое совпавшее keyword,
                       +2 за совпадение по предмету
           5. Топ-10 релевантных конспектов → NoteContext[]
                        │
                        ▼
         [AIService] POST http://ai-service:8000/api/ai/plans/generate
           Передаёт: request + available_notes (список конспектов)
                        │
                        ▼
         [AI-Service / Gemini] Генерация плана
           Промпт содержит список конспектов:
             [id=5] "Лекция 1: Пределы" (ключевые слова: предел, ...)
           Gemini создаёт план, где каждая задача имеет:
             internal_note_ids: [5]        ← ID из списка выше
             external_resources: [...]     ← если конспектов нет
                        │
                        ▼
         [PlanService] Сохранение в БД
           1. Один запрос: загрузить все notes по internal_note_ids
           2. Для каждой задачи:
              - Task сохраняется в таблицу task
              - tasks_notes: task_id ↔ note_id (внутренние конспекты)
              - task_external_resources: task_id + resource_url
           3. UserPlanProgress: связь пользователь ↔ план
                        │
                        ▼
         Ответ: полный Plan с weeks → tasks → relatedNotes + externalResources
```

---

## Workflow: Анализ конспекта

```
1. Пользователь загружает конспект
              ↓
2. Файл сохраняется в AWS S3
              ↓
3. POST /api/ai/notes/analyze { "noteId": 1 }
              ↓
4. Spring Boot генерирует presigned URL из S3 ключа
              ↓
5. AI Service скачивает файл → загружает в Gemini File API
              ↓
6. Gemini нативно анализирует документ
              ↓
7. Результат сохраняется в Note:
   - summary    — краткое содержание (≤250 символов)
   - difficulty — beginner / intermediate / advanced
   - language   — ru / en / ...
   - keywords   — 5–7 ключевых терминов (уникальные, case-insensitive)
```

> **Важно для фронтенда:** после анализа конспект получает ключевые слова. Именно по ним он будет автоматически находиться при генерации плана. Рекомендуется анализировать конспекты перед генерацией планов.

---

## Схема данных: Task

```
Task
├── id
├── title                  — название задачи
├── description            — описание (берётся из AI или fallback: "Неделя N: ...")
├── taskStatus             — PENDING (при создании)
├── createdAt
├── relatedNotes[]         — конспекты из БД (ManyToMany → tasks_notes)
│     └── Note { id, title, summary, difficulty, keywords[] }
└── externalResources[]    — строки: учебники/ссылки (ElementCollection → task_external_resources)
```

## Структура проекта:

```
PlannerAI/
├── AI-Service/              Python FastAPI микросервис
│   ├── app/
│   │   ├── main.py          FastAPI app
│   │   ├── config.py        Конфигурация (Gemini API key/model)
│   │   ├── models/          Pydantic models
│   │   ├── services/
│   │   │   ├── gemini_service.py   Gemini API интеграция
│   │   │   ├── plan_generator.py   Генерация планов
│   │   │   ├── note_analyzer.py    Анализ конспектов
│   │   │   └── file_parser.py      Локальный парсинг (fallback)
│   │   └── routers/         API endpoints
│   └── requirements.txt
│
├── Back/                    Spring Boot backend
│   └── src/.../
│       ├── controllers/AIController.java
│       ├── services/AIService.java
│       └── models/dto/ai/
│
└── Front/                   Angular frontend
    └── src/app/
        ├── services/ai.service.ts
        └── features/plans/
```
