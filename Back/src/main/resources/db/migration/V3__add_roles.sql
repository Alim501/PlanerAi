-- V3__add_user_roles.sql

-- Create role table
CREATE TABLE IF NOT EXISTS role (
                                    id BIGSERIAL PRIMARY KEY,
                                    name VARCHAR(50) UNIQUE NOT NULL
);

-- Create junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS user_roles (
                                          user_id BIGINT NOT NULL,
                                          role_id BIGINT NOT NULL,
                                          PRIMARY KEY (user_id, role_id),
                                          CONSTRAINT fk_user_roles_user
                                              FOREIGN KEY (user_id)
                                                  REFERENCES users(id)
                                                  ON DELETE CASCADE,
                                          CONSTRAINT fk_user_roles_role
                                              FOREIGN KEY (role_id)
                                                  REFERENCES role(id)
                                                  ON DELETE CASCADE
);

-- Insert default roles
INSERT INTO role (name) VALUES ('ROLE_STUDENT');
INSERT INTO role (name) VALUES ('ROLE_MODERATOR');
INSERT INTO role (name) VALUES ('ROLE_ADMIN');

-- Assign ROLE_STUDENT to all existing users (if any)
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
         CROSS JOIN role r
WHERE r.name = 'ROLE_STUDENT'
ON CONFLICT DO NOTHING;
