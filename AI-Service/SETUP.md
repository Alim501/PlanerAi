# Установка AI Service

## Шаг 1: Получить Gemini API ключ

1. Перейдите на [aistudio.google.com](https://aistudio.google.com)
2. Нажмите **Get API key** → **Create API key**
3. Скопируйте ключ

> Используйте именно AI Studio. Ключи с Google Cloud Console не имеют бесплатного тарифа.

## Шаг 2: Установить Python зависимости

```bash
cd AI-Service

python3 -m venv venv
source venv/bin/activate  # macOS/Linux
# или
venv\Scripts\activate  # Windows

pip install -r requirements.txt
```

## Шаг 3: Создать .env файл

```bash
# В папке AI-Service
cp .env.example .env  # если есть example, или создайте вручную
```

Содержимое `.env`:
```env
GEMINI_API_KEY=ваш_ключ_из_ai_studio
GEMINI_MODEL=gemini-2.0-flash
BACKEND_URL=http://localhost:8080
ALLOWED_ORIGINS=http://localhost:4200,http://localhost:8080
```

## Шаг 4: Запуск

```bash
source venv/bin/activate
python -m app.main
```

## Проверка работы

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

## Как включить и выключить AI Service

### Запуск в фоне:
```bash
source venv/bin/activate
nohup python -m app.main > logs/app.log 2>&1 &
echo $! > ai-service.pid
```

### Остановка:
```bash
kill $(cat ai-service.pid)
```

### Проверка статуса:
```bash
# Проверить процесс
ps aux | grep "app.main"

# Проверить health
curl http://localhost:8000/health
```
