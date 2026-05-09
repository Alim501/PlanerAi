CREATE TABLE notification (
    id         BIGSERIAL    PRIMARY KEY,
    user_id    BIGINT       NOT NULL,
    type       VARCHAR(50)  NOT NULL,
    title      VARCHAR(255),
    message    TEXT,
    link       VARCHAR(500),
    is_read    BOOLEAN      DEFAULT FALSE,
    created_at TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notification_user_read ON notification (user_id, is_read);
