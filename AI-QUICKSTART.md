# 🚀 AI Quick Start Guide

## ✅ Что готово:

1. ✅ **AI Микросервис (Python + FastAPI)** - готов к запуску
2. ✅ **Spring Boot Integration** - endpoints настроены
3. ✅ **Angular UI** - кнопка "Сгенерировать с AI" в создании планов
4. ✅ **Полная документация**

## 📋 Быстрый запуск за 5 минут:

### 1️⃣ Установите Ollama

```bash
# macOS
brew install ollama

# Linux
curl -fsSL https://ollama.com/install.sh | sh
```

### 2️⃣ Запустите Ollama и загрузите модель

```bash
# Терминал 1: Запустите Ollama
ollama serve

# Терминал 2: Загрузите модель (2GB, быстрая)
ollama pull llama3.2:3b
```

### 3️⃣ Настройте AI Service

```bash
cd AI-Service

# Создайте виртуальное окружение
python3 -m venv venv
source venv/bin/activate  # macOS/Linux
# или venv\Scripts\activate  # Windows

# Установите зависимости
pip install -r requirements.txt
```

### 4️⃣ Запустите AI Service

```bash
# В AI-Service директории с активированным venv
python -m app.main
```

Вы должны увидеть:
```
INFO:     Starting PlannerAI AI Service
INFO:     Ollama URL: http://localhost:11434
INFO:     Ollama Model: llama3.2:3b
INFO:     Port: 8000
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### 5️⃣ Запустите Spring Boot

```bash
cd Back
./mvnw spring-boot:run
```

### 6️⃣ Запустите Angular

```bash
cd Front
npm start
```

## 🎯 Как использовать:

1. Откройте браузер: `http://localhost:4200`
2. Войдите в систему
3. Перейдите в **"Планы"** → **"Создать план"**
4. Нажмите кнопку **"Сгенерировать с AI"** ✨
5. Заполните форму:
   - Выберите предмет
   - Укажите продолжительность (недели)
   - Выберите уровень сложности
   - (Опционально) Добавьте темы
6. Нажмите **"Сгенерировать"**
7. Подождите 10-20 секунд ⏳
8. Нажмите **"Использовать план"**
9. Сохраните план!

## 🔍 Проверка работы:

### Проверьте что все запущено:

```bash
# 1. Ollama
curl http://localhost:11434/api/tags

# 2. AI Service
curl http://localhost:8000/health

# 3. Spring Boot AI endpoint
curl http://localhost:8080/api/ai/health
```

Все должны вернуть успешный ответ!

## ❗ Troubleshooting:

### AI Service не запускается:

```bash
# Проверьте Python версию (нужна 3.11+)
python3 --version

# Переустановите зависимости
pip install --upgrade -r requirements.txt
```

### Ollama connection refused:

```bash
# Убедитесь что Ollama запущен
ps aux | grep ollama

# Перезапустите Ollama
pkill ollama
ollama serve
```

### "Model not found":

```bash
# Проверьте установленные модели
ollama list

# Установите llama3.2
ollama pull llama3.2:3b
```

### Backend не видит AI Service:

1. Проверьте что AI Service запущен на порту 8000
2. Проверьте логи Spring Boot
3. Убедитесь что `AI_SERVICE_URL` правильный

## 📊 Производительность:

| Модель | Размер | Скорость генерации | Качество |
|--------|---------|-------------------|----------|
| llama3.2:3b | 2GB | ~10-15 сек | ⭐⭐⭐ |
| mistral:7b | 4GB | ~15-25 сек | ⭐⭐⭐⭐ |
| qwen2.5:7b | 4GB | ~15-25 сек | ⭐⭐⭐⭐⭐ |

### Рекомендация:
- **Для разработки**: `llama3.2:3b` ✅
- **Для production**: `qwen2.5:7b`

## 🎨 UI Features:

✅ Кнопка "Сгенерировать с AI" на странице создания плана
✅ Диалоговое окно с формой AI генерации
✅ Превью сгенерированного плана
✅ Автозаполнение формы создания плана
✅ Loading состояния и error handling

## 🔄 Workflow:

```
1. User нажимает "Сгенерировать с AI"
                ↓
2. Открывается диалог с формой
                ↓
3. User выбирает параметры
                ↓
4. Angular → Spring Boot → AI Service → Ollama
                ↓
5. AI генерирует структурированный план
                ↓
6. User видит превью плана
                ↓
7. User нажимает "Использовать план"
                ↓
8. Форма создания автозаполняется
                ↓
9. User сохраняет план
```

## 📁 Структура проекта:

```
PlannerAI/
├── AI-Service/              ✅ Python FastAPI микросервис
│   ├── app/
│   │   ├── main.py         # FastAPI app
│   │   ├── models/         # Pydantic models
│   │   ├── services/       # AI логика
│   │   └── routers/        # API endpoints
│   ├── requirements.txt
│   └── README.md
│
├── Back/                    ✅ Spring Boot backend
│   └── src/.../
│       ├── controllers/
│       │   └── AIController.java
│       ├── services/
│       │   └── AIService.java
│       └── models/dto/ai/
│
└── Front/                   ✅ Angular frontend
    └── src/app/
        ├── models/
        │   └── ai.models.ts
        ├── services/
        │   └── ai.service.ts
        ├── components/shared/
        │   └── ai-generate-plan-dialog/
        └── features/plans/plan-create/
```

## 🎉 Готово!

Теперь у вас есть полноценная AI интеграция в PlannerAI!

## 📚 Дополнительные возможности:

### Будущие фичи (можно добавить):

1. **Анализ заметок с AI** - автоматический анализ загруженных PDF/DOCX
2. **Умный чат-помощник** - AI ассистент для вопросов по предметам
3. **Рекомендации задач** - AI предлагает задачи на основе прогресса
4. **Адаптивная сложность** - AI подстраивает сложность под пользователя

### Как добавить новые модели:

```bash
# Установите новую модель
ollama pull qwen2.5:7b

# Обновите .env в AI-Service
OLLAMA_MODEL=qwen2.5:7b

# Перезапустите AI Service
```

## 🆘 Получить помощь:

1. Проверьте логи AI Service
2. Проверьте логи Spring Boot
3. Откройте браузер console (F12)
4. Проверьте `AI-INTEGRATION.md` для деталей

## ✨ Enjoy AI-powered learning! 🚀
