CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'job_offer_status_enum') THEN
CREATE TYPE job_offer_status_enum AS ENUM ('DRAFT','PUBLISHED','CLOSED','FILLED');
END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'application_status_enum') THEN
CREATE TYPE application_status_enum AS ENUM ('NEW','IN_REVIEW','PRESELECTED','INTERVIEW_SCHEDULED','REJECTED','HIRED');
END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'contract_type_enum') THEN
CREATE TYPE contract_type_enum AS ENUM ('CDI','CDD','STAGE','FREELANCE');
END IF;
END$$;

CREATE TABLE IF NOT EXISTS job_offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    required_skills JSONB,
    min_experience INTEGER DEFAULT 0,
    contract_type contract_type_enum NOT NULL,
    salary_range VARCHAR(100),
    location VARCHAR(255),
    deadline DATE,
    status job_offer_status_enum DEFAULT 'DRAFT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID NOT NULL,
    published_at TIMESTAMP,
    closed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_job_offers_org ON job_offers(organization_id);
CREATE INDEX IF NOT EXISTS idx_job_offers_status ON job_offers(status);

CREATE TABLE IF NOT EXISTS candidates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    linkedin_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT candidates_email_unique UNIQUE(email)
);

CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_offer_id UUID NOT NULL,
    candidate_id UUID NOT NULL,
    cv_url VARCHAR(500) NOT NULL,
    cover_letter_url VARCHAR(500),
    status application_status_enum DEFAULT 'NEW',
    ai_score DECIMAL(5, 2),
    extracted_skills JSONB,
    extracted_experience INTEGER,
    extracted_education TEXT,
    ai_summary TEXT,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT applications_offer_candidate_unique UNIQUE(job_offer_id, candidate_id)
);

CREATE INDEX IF NOT EXISTS idx_applications_offer ON applications(job_offer_id);
CREATE INDEX IF NOT EXISTS idx_applications_candidate ON applications(candidate_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_job_offers_updated_at ON job_offers;
CREATE TRIGGER update_job_offers_updated_at
    BEFORE UPDATE ON job_offers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_interviews_updated_at ON interviews;
CREATE TRIGGER update_interviews_updated_at
    BEFORE UPDATE ON interviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();