CREATE TABLE audit_logs (
    id          BIGSERIAL PRIMARY KEY,
    action      VARCHAR(255),
    entity_type VARCHAR(255),
    entity_id   VARCHAR(255),
    user_id     VARCHAR(255),
    details     TEXT,
    created_at  TIMESTAMP DEFAULT NOW()
);