-- V7: Force reset ALL passwords to a valid bcrypt hash of 'password123'
-- Needed because V4 inserted a fake placeholder hash that LOOKS valid
-- (starts with $2a$, length=60) so V5 did NOT replace it.
-- This migration overwrites ALL passwords unconditionally.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

UPDATE users
SET password = crypt('password123', gen_salt('bf', 10));
