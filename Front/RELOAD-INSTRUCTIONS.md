# 🔄 Инструкция по обновлению после изменений в User Model

## Проблема
Структура User изменилась:
- **Старая**: `role: string`
- **Новая**: `roles: Role[]`

## Решение

### Вариант 1: Через консоль браузера (быстро)

1. Откройте DevTools (F12)
2. Перейдите в Console
3. Выполните:
```javascript
localStorage.clear();
location.reload();
```

### Вариант 2: Через UI

1. Откройте `http://localhost:4200`
2. Нажмите F12 (DevTools)
3. Перейдите в Application → Local Storage → http://localhost:4200
4. Удалите ключи:
   - `user_data`
   - `auth_token` (если есть)
5. Перезагрузите страницу (F5)
6. Войдите заново

### Вариант 3: Logout и Login

1. Нажмите на аватар в правом верхнем углу
2. Выберите "Выход"
3. Войдите заново как `Admin@mail.ru`

## После входа

Проверьте что роли работают:
- ✅ В меню должен появиться пункт "Управление пользователями"
- ✅ Роль в профиле должна отображаться как "ADMIN"
- ✅ Доступ к `/app/admin/users` разрешён

## Проверка ролей через API

```bash
# Получить текущего пользователя
curl http://localhost:8080/api/users/me \
  -H "Cookie: JSESSIONID=your-session-id" \
  | jq '.roles'
```

Должны увидеть:
```json
[
  { "id": 1, "name": "ROLE_STUDENT" },
  { "id": 3, "name": "ROLE_ADMIN" }
]
```
