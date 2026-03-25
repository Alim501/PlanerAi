CREATE TABLE IF NOT EXISTS task_external_resources (
    task_id      BIGINT       NOT NULL REFERENCES task (id) ON DELETE CASCADE,
    resource_url VARCHAR(1000) NOT NULL
);
