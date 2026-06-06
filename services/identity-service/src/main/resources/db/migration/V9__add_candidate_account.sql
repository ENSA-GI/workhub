-- V6: Add a candidate seed account for development/testing
-- Password: password123 (bcrypt hashed via pgcrypto)

CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO users (id, organization_id, email, first_name, last_name, role, active, email_verified, password)
VALUES (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
    NULL,
    'candidate@workhub.com',
    'Ahmed',
    'Candidate',
    'CANDIDATE',
    true,
    true,
    crypt('password123', gen_salt('bf', 10))
) ON CONFLICT (id) DO NOTHING;
