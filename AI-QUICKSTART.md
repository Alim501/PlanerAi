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

### Генерация плана с AI:
1. Откройте `http://localhost:4200`
2. Войдите в систему
3. Перейдите в **"Планы"** → **"Создать план"**
4. Нажмите **"Сгенерировать с AI"**
5. Заполните форму и нажмите **"Сгенерировать"**

### Анализ конспекта:
1. Загрузите конспект (PDF/DOCX/JPG/PNG/TXT)
2. Откройте конспект и нажмите **"Анализировать"**
3. AI извлечёт резюме, ключевые концепции, сложность и язык

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

## Workflow анализа конспекта:

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
7. Результат сохраняется в Note (summary, difficulty, language, keywords)
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
