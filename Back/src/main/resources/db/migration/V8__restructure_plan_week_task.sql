-- V8: Restructure plan/task to support Week entity and personal user dates

-- 1. Add description and difficulty to plan (plan becomes a reusable template)
ALTER TABLE plan ADD COLUMN description TEXT;
ALTER TABLE plan ADD COLUMN difficulty VARCHAR(50);

-- 2. Create plan_week table
CREATE TABLE plan_week (
    id          BIGSERIAL PRIMARY KEY,
    week_number INT          NOT NULL,
    title       VARCHAR(255),
    estimated_hours INT      NOT NULL DEFAULT 0,
    plan_id     BIGINT       NOT NULL,
    CONSTRAINT fk_plan_week_plan FOREIGN KEY (plan_id) REFERENCES plan (id) ON DELETE CASCADE
);

-- 3. Migrate existing tasks: create a default week per plan
INSERT INTO plan_week (week_number, title, estimated_hours, plan_id)
SELECT DISTINCT 1, 'Неделя 1', 0, study_plan_id
FROM task
WHERE study_plan_id IS NOT NULL;

-- 4. Add week_id to task
ALTER TABLE task ADD COLUMN week_id BIGINT;
ALTER TABLE task ADD CONSTRAINT fk_task_week FOREIGN KEY (week_id) REFERENCES plan_week (id) ON DELETE CASCADE;

-- 5. Move existing tasks to their default week
UPDATE task t
SET week_id = w.id
FROM plan_week w
WHERE t.study_plan_id = w.plan_id;

-- 6. Remove study_plan_id and due_date from task (due_date is derived from week + user start date)
ALTER TABLE task DROP COLUMN study_plan_id;
ALTER TABLE task DROP COLUMN due_date;

-- 7. Remove personal date/status fields from plan (moved to user_plan_progress)
ALTER TABLE plan DROP COLUMN start_date;
ALTER TABLE plan DROP COLUMN end_date;
ALTER TABLE plan DROP COLUMN status;

-- 8. Add personal date/status fields to user_plan_progress
ALTER TABLE user_plan_progress ADD COLUMN start_date DATE;
ALTER TABLE user_plan_progress ADD COLUMN end_date   DATE;
ALTER TABLE user_plan_progress ADD COLUMN status     VARCHAR(50) NOT NULL DEFAULT 'ACTIVE';
