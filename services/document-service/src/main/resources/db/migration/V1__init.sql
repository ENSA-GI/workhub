CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'document_type_enum') THEN
        CREATE TYPE document_type_enum AS ENUM (
            'PHOTO',
            'CIN',
            'CONTRACT',
            'CV',
            'DIPLOMA',
            'MEDICAL_CERTIFICATE',
            'OTHER'
        );
    END IF;
END$$;

CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    organization_id UUID NOT NULL,

    -- microservices strict: generic ownership
    owner_type VARCHAR(50) NOT NULL,   -- EMPLOYEE, LEAVE_REQUEST, APPLICATION, etc.
    owner_id UUID NOT NULL,

    type document_type_enum NOT NULL,

    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    mime_type VARCHAR(100),
    file_size BIGINT,
    description TEXT,

    uploaded_by UUID,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_documents_org ON documents(organization_id);
CREATE INDEX IF NOT EXISTS idx_documents_owner ON documents(owner_type, owner_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(type);