-- ============================================
-- org-service (org_db) - Schema V1
-- Owns: organizations, departments, positions
-- Strict microservices: no FK to employee-service, identity-service, etc.
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------- organizations ----------
CREATE TABLE IF NOT EXISTS organizations (
                                             id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255) NOT NULL,
    logo VARCHAR(500),
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'Maroc',
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    tax_id VARCHAR(50), -- ICE au Maroc
    cnss_affiliation VARCHAR(50),

    settings JSONB DEFAULT '{
        "annual_leave_days": 22,
        "work_days_per_week": 5,
        "currency": "MAD",
        "timezone": "Africa/Casablanca",
        "language": "fr",
        "fiscal_year_start": "01-01"
    }'::jsonb,

    plan VARCHAR(50) DEFAULT 'FREE',
    max_employees INTEGER DEFAULT 10,
    subscription_start_date TIMESTAMP,
    subscription_end_date TIMESTAMP,

    active BOOLEAN DEFAULT true,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT organizations_email_unique UNIQUE(email),
    CONSTRAINT organizations_tax_id_unique UNIQUE(tax_id)
    );

CREATE INDEX IF NOT EXISTS idx_organizations_active
    ON organizations(active) WHERE active = true;

-- ---------- departments ----------
CREATE TABLE IF NOT EXISTS departments (
                                           id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,

    -- Strict microservices: no FK to employees (employee_db)
    manager_employee_id UUID,

    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT departments_org_name_unique UNIQUE(organization_id, name),
    CONSTRAINT fk_departments_org FOREIGN KEY (organization_id)
    REFERENCES organizations(id) ON DELETE CASCADE
    );

CREATE INDEX IF NOT EXISTS idx_departments_organization ON departments(organization_id);
CREATE INDEX IF NOT EXISTS idx_departments_active ON departments(active) WHERE active = true;

-- ---------- positions ----------
CREATE TABLE IF NOT EXISTS positions (
                                         id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,

    -- Stable JPA mapping: VARCHAR + CHECK (instead of PG enum type)
    category VARCHAR(30) NOT NULL DEFAULT 'EMPLOYE'
    CHECK (category IN ('CADRE','AGENT_MAITRISE','EMPLOYE','STAGIAIRE')),

    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT positions_org_title_unique UNIQUE(organization_id, title),
    CONSTRAINT fk_positions_org FOREIGN KEY (organization_id)
    REFERENCES organizations(id) ON DELETE CASCADE
    );

CREATE INDEX IF NOT EXISTS idx_positions_organization ON positions(organization_id);
CREATE INDEX IF NOT EXISTS idx_positions_category ON positions(category);

-- ---------- updated_at trigger (local DB only) ----------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_organizations_updated_at ON organizations;
CREATE TRIGGER update_organizations_updated_at
    BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_departments_updated_at ON departments;
CREATE TRIGGER update_departments_updated_at
    BEFORE UPDATE ON departments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_positions_updated_at ON positions;
CREATE TRIGGER update_positions_updated_at
    BEFORE UPDATE ON positions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();