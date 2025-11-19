# PlannerAI - AI Service

AI-powered microservice для генерации учебных планов и анализа заметок.

## 🚀 Возможности

- **Генерация учебных планов**: Создание структурированных планов обучения с помощью AI
- **Анализ заметок**: Извлечение ключевых концепций и резюме из PDF/DOCX/изображений
- **Интеграция с Ollama**: Использование локальных LLM моделей (бесплатно!)
- **REST API**: Простая интеграция с Spring Boot backend

## 📋 Требования

- Python 3.11+
- Ollama (для локального LLM)
- Tesseract OCR (опционально, для распознавания текста с изображений)

## 🛠️ Установка

### 1. Установка Ollama

```bash
# macOS
brew install ollama

# Linux
curl -fsSL https://ollama.com/install.sh | sh

# Запуск Ollama
ollama serve
```

### 2. Загрузка модели

```bash
# Рекомендуемая модель (легкая и быстрая)
ollama pull llama3.2:3b

# Альтернативы:
ollama pull mistral:7b
ollama pull qwen2.5:7b
```

### 3. Установка зависимостей Python

```bash
cd AI-Service

# Создание виртуального окружения
python -m venv venv

# Активация
source venv/bin/activate  # macOS/Linux
# или
venv\Scripts\activate  # Windows

# Установка зависимостей
pip install -r requirements.txt
```

### 4. (Опционально) Установка Tesseract для OCR

```bash
# macOS
brew install tesseract tesseract-lang

# Ubuntu/Debian
sudo apt-get install tesseract-ocr tesseract-ocr-rus tesseract-ocr-eng
```

### 5. Конфигурация

Скопируйте `.env.example` в `.env` и настройте по необходимости:

```bash
cp .env.example .env
```

## 🚀 Запуск

### Локальный запуск

```bash
# Убедитесь что Ollama запущен
ollama serve

# В другом терминале запустите AI сервис
cd AI-Service
source venv/bin/activate
python -m app.main
```

Сервис будет доступен на `http://localhost:8000`

### Запуск через Docker

```bash
docker-compose up --build
```

## 📚 API Endpoints

### Health Check

```http
GET /health
```

### Генерация учебного плана

```http
POST /api/ai/plans/generate
Content-Type: application/json

{
  "subject": "Математический анализ",
  "duration_weeks": 12,
  "level": "intermediate",
  "topics": ["Пределы", "Производные", "Интегралы"],
  "goals": "Подготовка к экзамену"
}
```

### Анализ заметки

```http
POST /api/ai/notes/analyze
Content-Type: application/json

{
  "file_path": "/path/to/note.pdf",
  "file_type": "pdf",
  "subject_id": 1
}
```

## 📖 Документация API

После запуска сервиса, интерактивная документация доступна по адресу:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## 🔧 Настройка моделей

### Рекомендуемые модели для разных задач:

**Для быстрой генерации (3-4 GB RAM):**
```bash
ollama pull llama3.2:3b
ollama pull phi3:mini
```

**Для лучшего качества (8+ GB RAM):**
```bash
ollama pull mistral:7b
ollama pull qwen2.5:7b
```

**Для максимального качества (16+ GB RAM):**
```bash
ollama pull llama3.1:8b
ollama pull mixtral:8x7b
```

Изменить модель можно в `.env` файле:
```env
OLLAMA_MODEL=llama3.2:3b
```

## 📁 Структура проекта

```
AI-Service/
├── app/
│   ├── main.py              # FastAPI приложение
│   ├── config.py            # Конфигурация
│   ├── models/              # Pydantic модели
│   │   ├── requests.py
│   │   └── responses.py
│   ├── services/            # Бизнес логика
│   │   ├── ollama_service.py
│   │   ├── plan_generator.py
│   │   ├── note_analyzer.py
│   │   └── file_parser.py
│   └── routers/             # API endpoints
│       ├── plans.py
│       ├── notes.py
│       └── health.py
├── requirements.txt
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## 🔗 Интеграция с Backend

AI сервис предоставляет REST API, который можно вызывать из Spring Boot:

```java
// Пример интеграции в Spring Boot
RestTemplate restTemplate = new RestTemplate();
String aiServiceUrl = "http://localhost:8000/api/ai/plans/generate";

PlanRequest request = new PlanRequest("Математика", 12, "intermediate");
GeneratedPlan plan = restTemplate.postForObject(
    aiServiceUrl,
    request,
    GeneratedPlan.class
);
```

## 🐛 Troubleshooting

### Ollama не подключается

```bash
# Проверьте что Ollama запущен
curl http://localhost:11434/api/tags

# Перезапустите Ollama
ollama serve
```

### Модель не найдена

```bash
# Список установленных моделей
ollama list

# Установите нужную модель
ollama pull llama3.2:3b
```

### OCR не работает

```bash
# Проверьте установку Tesseract
tesseract --version

# Установите языковые пакеты
brew install tesseract-lang  # macOS
```

## 📝 Лицензия

MIT
