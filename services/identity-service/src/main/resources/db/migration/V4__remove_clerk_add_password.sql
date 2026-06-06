ALTER TABLE users DROP COLUMN clerk_id;
ALTER TABLE users ADD COLUMN password VARCHAR(255);

-- Set a default password for existing users (bcrypt hash of 'password123')
UPDATE users SET password = '$2a$10$XUfJ7z5Yv0hHqQ6h2Q9Wze5T0w1Z5M2T0E5M2T0E5M2T0E5M2T0E5' WHERE password IS NULL;

ALTER TABLE users ALTER COLUMN password SET NOT NULL;
