-- SQL скрипт для назначения роли ADMIN пользователю

-- Назначить роль ADMIN пользователю Admin@mail.ru (id=2)
INSERT INTO user_roles (user_id, role_id)
VALUES (2, 3)  -- 2 = Admin@mail.ru, 3 = ROLE_ADMIN
ON CONFLICT DO NOTHING;

-- Проверить результат
SELECT
    u.id,
    u.email,
    u.first_name,
    u.last_name,
    r.name as role
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN role r ON ur.role_id = r.id
WHERE u.id = 2;
