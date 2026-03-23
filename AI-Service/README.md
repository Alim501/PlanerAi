# PlannerAI - AI Service

AI микросервис для генерации учебных планов и анализа конспектов на базе Google Gemini.

## Возможности

- **Генерация учебных планов** — структурированные планы с разбивкой по неделям
- **Анализ конспектов** — извлечение резюме, ключевых концепций, сложности и языка из PDF/DOCX/изображений через Gemini File API
- **Улучшение задач** — AI переформулирует описания задач
- **Google Gemini** — облачная LLM, бесплатный тариф через AI Studio

## Требования

- Python 3.11+
- Google Gemini API ключ (бесплатно на [aistudio.google.com](https://aistudio.google.com))

## Установка

### 1. Получить API ключ

1. Откройте [aistudio.google.com](https://aistudio.google.com)
2. Нажмите **Get API key** → **Create API key**
3. Скопируйте ключ

### 2. Установить зависимости

```bash
cd AI-Service

python3 -m venv venv
source venv/bin/activate  # macOS/Linux
# или venv\Scripts\activate  # Windows

pip install -r requirements.txt
```

### 3. Настроить окружение

Создайте файл `.env` в папке `AI-Service`:

```env
GEMINI_API_KEY=your_api_key_from_ai_studio
GEMINI_MODEL=gemini-2.0-flash
BACKEND_URL=http://localhost:8080
ALLOWED_ORIGINS=http://localhost:4200,http://localhost:8080
```

## Запуск

```bash
cd AI-Service
source venv/bin/activate
python -m app.main
```

Сервис запустится на `http://localhost:8000`

## API Endpoints

### Health Check

```http
GET /health
```

```json
{
  "status": "healthy",
  "ollama_connected": true,
  "model": "gemini-2.0-flash",
  "version": "1.0.0"
}
```

### Генерация учебного плана

```http
POST /api/ai/plans/generate
Content-Type: application/json

{
  "subject": "Математический анализ",
  "duration_weeks": 12,
  "level": "intermediate",
  "topics": ["Пределы", "Производные"],
  "goals": "Подготовка к экзамену"
}
```

### Анализ конспекта

```http
POST /api/ai/notes/analyze
Content-Type: application/json

{
  "file_url": "https://presigned-s3-url...",
  "file_type": "pdf"
}
```

```json
{
  "summary": "Краткое резюме конспекта...",
  "key_concepts": ["производная", "интеграл", "предел"],
  "difficulty": "intermediate",
  "language": "ru"
}
```

> Этот endpoint вызывается внутренне из Spring Boot. Напрямую с фронта запросы идут на `POST /api/ai/notes/analyze` с телом `{ "noteId": N }`.

## Поддерживаемые форматы файлов

| Формат | MIME тип | Анализ |
|--------|----------|--------|
| PDF | application/pdf | Gemini File API |
| DOCX | application/vnd.openxmlformats-officedocument... | Gemini File API |
| JPG/JPEG | image/jpeg | Gemini File API |
| PNG | image/png | Gemini File API |
| TXT | text/plain | Gemini File API |

## Документация API

После запуска:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Структура проекта

```
AI-Service/
├── app/
│   ├── main.py              # FastAPI приложение
│   ├── config.py            # Конфигурация (gemini_api_key, gemini_model)
│   ├── models/
│   │   ├── requests.py      # Pydantic модели запросов
│   │   └── responses.py     # Pydantic модели ответов
│   ├── services/
│   │   ├── gemini_service.py    # Google Gemini API интеграция
│   │   ├── plan_generator.py    # Генерация учебных планов
│   │   ├── note_analyzer.py     # Анализ конспектов
│   │   └── file_parser.py       # Локальный парсинг файлов (fallback)
│   └── routers/
│       ├── plans.py         # /api/ai/plans/*
│       ├── notes.py         # /api/ai/notes/*
│       └── health.py        # /health
├── requirements.txt
└── README.md
```

## Troubleshooting

### Ошибка 429 (quota exceeded)

Убедитесь что API ключ получен с **aistudio.google.com**, не с Google Cloud Console.

### `is not a valid file path`

Ошибка при загрузке файла в Gemini. Убедитесь что используется `google-genai` пакет, не устаревший `google-generativeai`.

### AI Service недоступен

```bash
curl http://localhost:8000/health
```

Проверьте что venv активирован и зависимости установлены.
