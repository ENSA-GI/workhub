-- V5: Use pgcrypto to set bcrypt passwords for seeded users
-- This migration will create the pgcrypto extension (if not present)
-- and set a bcrypt-hashed password ('password123') for any user
-- that currently has a NULL password. This fixes invalid placeholder
-- password values inserted by earlier migrations for local/dev setups.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Set a known dev password for all users missing a password or whose
-- password column does not look like a valid BCrypt value (length or prefix).
-- This catches the invalid placeholder hashes created by older migrations.
-- (change 'password123' if you prefer another dev password)
UPDATE users
SET password = crypt('password123', gen_salt('bf', 10))
WHERE (
  password IS NULL
)
OR (
  char_length(password) <> 60
)
OR (
  password NOT LIKE '$2a$%'
  AND password NOT LIKE '$2b$%'
  AND password NOT LIKE '$2y$%'
);

