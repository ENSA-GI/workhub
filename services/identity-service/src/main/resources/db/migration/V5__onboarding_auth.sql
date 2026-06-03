ALTER TYPE role_enum ADD VALUE IF NOT EXISTS 'PENDING_OWNER';

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS mfa_secret VARCHAR(64),
    ADD COLUMN IF NOT EXISTS mfa_enabled BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS email_verification_token VARCHAR(64),
    ADD COLUMN IF NOT EXISTS email_verification_token_expires_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS invitation_token VARCHAR(64),
    ADD COLUMN IF NOT EXISTS invitation_token_expires_at TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_users_email_verification_token ON users(email_verification_token);
CREATE INDEX IF NOT EXISTS idx_users_invitation_token ON users(invitation_token);
