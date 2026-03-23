# AI Integration Guide - PlannerAI

## Обзор

AI микросервис добавляет интеллектуальные возможности в PlannerAI:
- **Генерация учебных планов** с помощью Google Gemini
- **Анализ конспектов** (PDF/DOCX/JPG/PNG/TXT) через Gemini File API
- **Улучшение описаний задач** с помощью AI

## Архитектура

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Angular   │ ◄─────► │ Spring Boot  │ ◄─────► │ AI Service  │
│  Frontend   │         │  (Port 8080) │         │ (Port 8000) │
└─────────────┘         └──────┬───────┘         └──────┬──────┘
                               │                        │
                        ┌──────▼──────┐         ┌──────▼──────┐
                        │   AWS S3    │         │Google Gemini│
                        │  (файлы)   │         │  Cloud API  │
                        └─────────────┘         └─────────────┘
```

**Поток анализа конспекта:**
1. Файл загружается на AWS S3 при создании конспекта
2. При запросе анализа Spring Boot генерирует presigned URL (15 мин) из S3 ключа
3. AI Service скачивает файл и загружает в Gemini File API
4. Gemini нативно анализирует документ (PDF, DOCX, изображения)
5. Результат сохраняется в БД: `summary`, `difficulty`, `language`, `keywords`

## Быстрый старт

### Шаг 1: Получить Gemini API ключ

1. Перейдите на [aistudio.google.com](https://aistudio.google.com)
2. Нажмите **"Get API key"** → **"Create API key"**
3. Скопируйте ключ

> Важно: ключ нужно получать именно с **AI Studio**, не с Google Cloud Console.

### Шаг 2: Настройка AI Service

```bash
cd AI-Service

# Создайте виртуальное окружение
python3 -m venv venv
source venv/bin/activate  # macOS/Linux
# или venv\Scripts\activate  # Windows

# Установите зависимости
pip install -r requirements.txt

# Создайте .env файл
cp .env.example .env
```

Заполните `.env`:
```env
GEMINI_API_KEY=ваш_ключ_из_ai_studio
GEMINI_MODEL=gemini-2.0-flash
```

### Шаг 3: Запуск AI Service

```bash
cd AI-Service
source venv/bin/activate
python -m app.main
```

AI Service запустится на `http://localhost:8000`

### Шаг 4: Запуск Spring Boot

```bash
cd Back
./mvnw spring-boot:run
```

### Шаг 5: Запуск Frontend

```bash
cd Front
npm start
```

## API Endpoints

### 1. Генерация плана
```http
POST http://localhost:8080/api/ai/plans/generate
Content-Type: application/json
Authorization: Bearer <token>

{
  "subject": "Математический анализ",
  "durationWeeks": 12,
  "level": "intermediate",
  "topics": ["Пределы", "Производные", "Интегралы"],
  "goals": "Подготовка к экзамену"
}
```

**Response:**
```json
{
  "title": "План обучения: Математический анализ",
  "subject": "Математический анализ",
  "durationWeeks": 12,
  "difficulty": "intermediate",
  "description": "Структурированный курс...",
  "learningOutcomes": ["Освоение пределов", "Вычисление производных"],
  "weeks": [
    {
      "weekNumber": 1,
      "title": "Введение в пределы",
      "topics": ["Определение предела", "Свойства пределов"],
      "tasks": ["Решить задачи 1-10"],
      "estimatedHours": 10
    }
  ]
}
```

### 2. Анализ конспекта

Теперь достаточно передать только `noteId` — все данные о файле берутся из БД.

```http
POST http://localhost:8080/api/ai/notes/analyze
Content-Type: application/json
Authorization: Bearer <token>

{
  "noteId": 1
}
```

**Response:**
```json
{
  "summary": "Конспект по производным: правила дифференцирования...",
  "keyConcepts": ["производная", "правило цепочки", "экстремум"],
  "difficulty": "intermediate",
  "language": "ru"
}
```

Результаты автоматически сохраняются в Note: `summary`, `difficulty`, `language` и `keywords`.

### 3. Улучшение задачи

```http
POST http://localhost:8080/api/ai/tasks/improve
Content-Type: application/json
Authorization: Bearer <token>

{
  "taskTitle": "Изучить производные",
  "taskDescription": "...",
  "subject": "Математика"
}
```

### 4. Health Check

```http
GET http://localhost:8080/api/ai/health
```

**Response:**
```json
{
  "status": "healthy",
  "ollamaConnected": true,
  "model": "gemini-2.0-flash",
  "version": "1.0.0"
}
```

## Конфигурация

### AI Service (.env)
```env
GEMINI_API_KEY=your_api_key_from_ai_studio
GEMINI_MODEL=gemini-2.0-flash
BACKEND_URL=http://localhost:8080
ALLOWED_ORIGINS=http://localhost:4200,http://localhost:8080
```

### Spring Boot (.env)
```env
AI_SERVICE_URL=http://localhost:8000
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
```

## Поддерживаемые форматы файлов

| Формат | Анализ | Примечание |
|--------|--------|-----------|
| PDF | Gemini File API | Нативный, лучшее качество |
| DOCX | Gemini File API | Нативный |
| JPG/PNG | Gemini File API | Нативный, OCR встроен |
| TXT | Gemini File API | Нативный |

## Troubleshooting

### AI Service не запускается

```bash
# Проверьте Python версию (нужна 3.11+)
python3 --version

# Проверьте зависимости
pip install -r requirements.txt
```

### Gemini API ошибка 429 (quota exceeded)

- Убедитесь что API ключ получен с **aistudio.google.com**, не с Google Cloud Console
- Проверьте лимиты на [aistudio.google.com](https://aistudio.google.com)

### AI Service недоступен

```bash
# Проверьте health endpoint
curl http://localhost:8000/health

# Проверьте логи
tail -f AI-Service/logs/app.log
```

### Backend не видит AI Service

1. Убедитесь что AI Service запущен на порту 8000
2. Проверьте `AI_SERVICE_URL` в Spring Boot `.env`
3. Проверьте логи Spring Boot

## Мониторинг

```bash
# Статус AI Service
curl http://localhost:8000/health

# Статус через Spring Boot
curl http://localhost:8080/api/ai/health

# Swagger документация AI Service
open http://localhost:8000/docs
```

## Checklist готовности

- [ ] Получен GEMINI_API_KEY с aistudio.google.com
- [ ] `.env` заполнен в AI-Service
- [ ] AI Service запущен (порт 8000)
- [ ] AWS S3 настроен (для хранения файлов)
- [ ] Spring Boot запущен и подключён к AI Service
- [ ] Health check возвращает `"status": "healthy"`
- [ ] Тестовая генерация плана работает
- [ ] Анализ конспекта работает
