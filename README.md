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
git clone https://github.com/MaxLutsenko205/TaskApi
cd TaskApi
```

#### 2. Создать .env файл в корне проекта:

Укажите в нём необходимые переменные:

```bash
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password
JWT_SECRET=your_jwt_secret_key
```

#### 3. Настроить базу данных PostgreSQL

Создай БД вручную или выполнить:

```sql
CREATE DATABASE task_service;
```

#### 4. Запустить проект

В IntelliJ IDEA или через команду:

```bash
./mvnw spring-boot:run
```

---


### Swagger-документация

Для удобного просмотра и тестирования эндпоинтов была добавлена документация Swagger

Доступна по адресу: http://localhost:8080/swagger-ui/index.html

---
#### Заметки
- User имеет связь ManyToMany с Plan через UserPlanProgress(в будущем можно добавить там трекер прогресса для каждой связки юзер-план) значит что каждый юзер может использовать любой план 
- В свою очередь Plan содержит в себе задачи(Task)
- И к каждой задачи могут быть прикреплены несколько конспектов(Note) через связь в таблице tasks_notes


- **Фильтрация** по нескольким параметрам (title, subject) добавлена в PlanController
- Фильтрация и **сортировка** (subject, createdAt) в NoteController
- Реализована работа с **профилем** пользователя (смена имени фамилии, пароля, получение данных)

---
#### Процесс создания плана
1. Пользователь или ИИ отправляет JSON с планом на эндпоинт (POST) http://localhost:8080/api/plans
   body:
```json
{
  "title": "Подготовка к экзамену по Java",
  "subject": "JAVA",
  "startDate": "2025-10-15",
  "endDate": "2025-12-15",
  "userId": 1,
  "tasks": [
    {
      "title": "Изучить основы Java",
      "description": "Типы данных, операторы, синтаксис",
      "dueDate": "2025-10-20"
    },
    {
      "title": "Овладеть ООП",
      "description": "Классы, наследование, полиморфизм",
      "dueDate": "2025-10-27"
    }
  ]
}
```
2. Сервис создаёт объект Plan и связанные Task для каждой задачи 
3. Каждая задача имеет статус PENDING, который обновляется по мере выполнения (эндпоинта пока нет) 
4. План и его задачи сохраняются в базе данных
5. Пользователь может отслеживать прогресс выполнения через API или интерфейс

---
#### To do:
- ai communication
- exception handler
- User info problem: JWT token contain only email and there is no GetByEmail endpoint:
1. Put userId in jwt
2. Refactor getById to getByEmail
3. Make auth fucnctions to return userId 
- Add .env support without using IntelejIdea ( for now application.propertios is hardcoded)
- Put Front_URL (localhost:4200) in .env (for now hardcode in SecurityConfig)
- ? Possible troubles with versions
- Dynamic subjects added by moderator/admin 
In Future:
- HTTP-Cookie jwt 
- Docker
