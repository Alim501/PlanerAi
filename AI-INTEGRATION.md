# 🤖 AI Integration Guide - PlannerAI

## 📋 Обзор

AI микросервис добавляет интеллектуальные возможности в PlannerAI:
- **Генерация учебных планов** с помощью LLM
- **Анализ заметок** (PDF/DOCX/изображения)
- **Умные рекомендации** для задач

## 🏗️ Архитектура

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Angular   │ ◄─────► │ Spring Boot  │ ◄─────► │ AI Service  │
│  Frontend   │         │   (Port 8080)│         │ (Port 8000) │
└─────────────┘         └──────────────┘         └──────┬──────┘
                                                         │
                                                  ┌──────▼──────┐
                                                  │   Ollama    │
                                                  │ (Port 11434)│
                                                  └─────────────┘
```

## 🚀 Быстрый старт

### Шаг 1: Установка Ollama

**macOS:**
```bash
brew install ollama
```

**Linux:**
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

### Шаг 2: Запуск Ollama и загрузка модели

```bash
# Запустите Ollama сервер
ollama serve

# В другом терминале загрузите модель (рекомендуется)
ollama pull llama3.2:3b
```

### Шаг 3: Настройка AI Service

```bash
cd AI-Service

# Создайте виртуальное окружение
python3 -m venv venv
source venv/bin/activate

# Установите зависимости
pip install -r requirements.txt
```

### Шаг 4: Запуск AI Service

```bash
cd AI-Service
source venv/bin/activate
python -m app.main
```

AI Service запустится на `http://localhost:8000`

### Шаг 5: Запуск Spring Boot

```bash
cd Back
./mvnw spring-boot:run
```

Backend будет автоматически подключаться к AI сервису.

### Шаг 6: Запуск Frontend

```bash
cd Front
npm start
```

## 📡 API Endpoints

### Spring Boot → AI Service

#### 1. Генерация плана
```http
POST http://localhost:8080/api/ai/plans/generate
Content-Type: application/json

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
      "tasks": ["Решить задачи 1-10", "Изучить теорему"],
      "estimatedHours": 10,
      "resources": ["Учебник Фихтенгольца"]
    }
  ]
}
```

#### 2. Анализ заметки
```http
POST http://localhost:8080/api/ai/notes/analyze
Content-Type: application/json

{
  "filePath": "/path/to/note.pdf",
  "fileType": "pdf",
  "subjectId": 1
}
```

**Response:**
```json
{
  "summary": "Заметка содержит основные концепции производных...",
  "keyConcepts": ["Производная", "Правило цепочки", "Экстремумы"],
  "topics": ["Дифференциальное исчисление"],
  "difficulty": "intermediate",
  "suggestedTags": ["математика", "производные", "калькулус"],
  "wordCount": 1500,
  "language": "ru"
}
```

#### 3. Health Check
```http
GET http://localhost:8080/api/ai/health
```

**Response:**
```json
{
  "status": "healthy",
  "ollamaConnected": true,
  "model": "llama3.2:3b",
  "version": "1.0.0"
}
```

## 🔧 Конфигурация

### AI Service (.env)
```env
# Ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:3b

# Backend
BACKEND_URL=http://localhost:8080

# CORS
ALLOWED_ORIGINS=http://localhost:4200,http://localhost:8080
```

### Spring Boot (.env)
```env
AI_SERVICE_URL=http://localhost:8000
```

## 🎯 Рекомендуемые модели

### Для разработки (быстрые):
- `llama3.2:3b` ✅ Рекомендуется (2GB RAM)
- `phi3:mini` (2GB RAM)

### Для production (качество):
- `mistral:7b` (8GB RAM)
- `qwen2.5:7b` (8GB RAM)

### Как сменить модель:
```bash
# Загрузите новую модель
ollama pull mistral:7b

# Обновите .env в AI-Service
OLLAMA_MODEL=mistral:7b

# Перезапустите AI Service
```

## 🐛 Troubleshooting

### AI Service не подключается

**Проверка:**
```bash
curl http://localhost:8000/health
```

**Решение:**
1. Убедитесь что AI Service запущен
2. Проверьте порт 8000 не занят
3. Проверьте логи AI Service

### Ollama не подключается

**Проверка:**
```bash
curl http://localhost:11434/api/tags
```

**Решение:**
1. Запустите Ollama: `ollama serve`
2. Проверьте что модель загружена: `ollama list`
3. Загрузите модель: `ollama pull llama3.2:3b`

### Backend не может достучаться до AI Service

**Проверка логов Spring Boot:**
```
Error calling AI service: Connection refused
```

**Решение:**
1. Убедитесь что AI Service запущен
2. Проверьте `AI_SERVICE_URL` в Spring Boot .env
3. Проверьте CORS настройки в AI Service

## 📊 Мониторинг

### Health Checks

```bash
# AI Service
curl http://localhost:8000/health

# Spring Boot AI endpoint
curl http://localhost:8080/api/ai/health
```

### Логи

```bash
# AI Service
tail -f logs/ai-service.log

# Spring Boot
tail -f logs/spring-boot.log
```

## 🔒 Безопасность

- AI Service доступен только для локального использования
- Spring Boot проксирует запросы с аутентификацией
- CORS настроен для Frontend и Backend

## 📈 Производительность

### Время генерации плана:
- `llama3.2:3b`: ~10-15 секунд
- `mistral:7b`: ~15-25 секунд
- `mixtral:8x7b`: ~30-60 секунд

### Оптимизация:
1. Используйте `llama3.2:3b` для разработки
2. Настройте кэширование в Spring Boot
3. Добавьте очередь для длинных задач

## 🚀 Production Deployment

### Docker Compose (All-in-One)

```yaml
version: '3.8'

services:
  ollama:
    image: ollama/ollama
    ports:
      - "11434:11434"
    volumes:
      - ollama-data:/root/.ollama

  ai-service:
    build: ./AI-Service
    ports:
      - "8000:8000"
    environment:
      - OLLAMA_BASE_URL=http://ollama:11434
    depends_on:
      - ollama

  backend:
    build: ./Back
    ports:
      - "8080:8080"
    environment:
      - AI_SERVICE_URL=http://ai-service:8000
    depends_on:
      - ai-service

volumes:
  ollama-data:
```

## 📚 Дополнительные ресурсы

- [Ollama Documentation](https://ollama.com/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [LangChain Documentation](https://python.langchain.com)

## ✅ Checklist готовности

- [ ] Ollama установлен и запущен
- [ ] Модель загружена (`ollama pull llama3.2:3b`)
- [ ] AI Service запущен (port 8000)
- [ ] Spring Boot подключен к AI Service
- [ ] Health check возвращает "healthy"
- [ ] Тестовая генерация плана работает

## 🎉 Готово!

Теперь PlannerAI имеет полноценную AI интеграцию!

Следующие шаги:
1. Добавить UI кнопки для AI генерации
2. Создать интерфейс просмотра сгенерированных планов
3. Добавить автоматический анализ при загрузке заметок
