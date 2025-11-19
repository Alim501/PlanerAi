# 🚀 Быстрая установка AI сервиса

## Шаг 1: Установка Ollama

### macOS
```bash
brew install ollama
```

### Linux
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

### Windows
Скачайте установщик: https://ollama.com/download

## Шаг 2: Запуск Ollama

```bash
# Запустите Ollama в фоновом режиме
ollama serve
```

Ollama запустится на `http://localhost:11434`

## Шаг 3: Загрузка модели

```bash
# Рекомендуемая модель (быстрая, 2GB)
ollama pull llama3.2:3b

# Проверка установленных моделей
ollama list
```

## Шаг 4: Установка Python зависимостей

```bash
cd AI-Service

# Создайте виртуальное окружение
python3 -m venv venv

# Активируйте его
source venv/bin/activate  # macOS/Linux
# или
venv\Scripts\activate  # Windows

# Установите зависимости
pip install -r requirements.txt
```

## Шаг 5: (Опционально) Tesseract для OCR

### macOS
```bash
brew install tesseract tesseract-lang
```

### Ubuntu/Debian
```bash
sudo apt-get install tesseract-ocr tesseract-ocr-rus tesseract-ocr-eng
```

## Шаг 6: Запуск AI сервиса

```bash
# Убедитесь что venv активирован
source venv/bin/activate

# Запустите сервис
python -m app.main
```

Сервис запустится на `http://localhost:8000`

## Проверка работы

### 1. Проверьте health endpoint:
```bash
curl http://localhost:8000/health
```

Должны увидеть:
```json
{
  "status": "healthy",
  "ollama_connected": true,
  "model": "llama3.2:3b",
  "version": "1.0.0"
}
```

### 2. Протестируйте генерацию плана:
```bash
curl -X POST http://localhost:8000/api/ai/plans/generate \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Математика",
    "duration_weeks": 4,
    "level": "beginner"
  }'
```

## Готово! 🎉

Теперь AI сервис готов к использованию.

Следующие шаги:
1. Интегрировать с Spring Boot backend
2. Добавить UI в Angular frontend
