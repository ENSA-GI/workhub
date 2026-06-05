-- Switch to the identity_db database
\c identity_db

-- Users table (Spring Security compatible)
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Authorities table (many‑to‑many link)
CREATE TABLE IF NOT EXISTS authorities (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    authority VARCHAR(50) NOT NULL,
    CONSTRAINT pk_authorities PRIMARY KEY (user_id, authority)
);

-- Test accounts (passwords are BCrypt hashes)
INSERT INTO users (username, password, enabled) VALUES
    ('admin',     '$2a$10$7G1E6xF0KYa8nL9eOIqVQeYcHnHQ/5v7p2Y1tRUV/6VF1z0Vb5TyW', TRUE),
    ('recruteur','$2a$10$K9jz5bGvUeZT4I6bG0aPqOSg6cV8ZQ5vvyM3nKzYz6w9JzU3LwzZK', TRUE),
    ('candidat',  '$2a$10$R8hM2lVxB6FQ7G9aX5Yd3eO0wPjC1aZrTg9uF2hLmK3n5sQ1vJzR5K', TRUE);

INSERT INTO authorities (user_id, authority) VALUES
    ((SELECT id FROM users WHERE username='admin'),     'ROLE_ADMIN'),
    ((SELECT id FROM users WHERE username='admin'),     'ROLE_RECRUITER'),
    ((SELECT id FROM users WHERE username='admin'),     'ROLE_CANDIDATE'),
    ((SELECT id FROM users WHERE username='recruteur'),'ROLE_RECRUITER'),
    ((SELECT id FROM users WHERE username='candidat'),  'ROLE_CANDIDATE');