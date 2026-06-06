CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'contract_type_enum') THEN
        CREATE TYPE contract_type_enum AS ENUM ('CDI','CDD','STAGE','FREELANCE');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'marital_status_enum') THEN
        CREATE TYPE marital_status_enum AS ENUM ('SINGLE','MARRIED','DIVORCED','WIDOWED');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'professional_category_enum') THEN
        CREATE TYPE professional_category_enum AS ENUM ('CADRE','AGENT_MAITRISE','EMPLOYE','STAGIAIRE');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'employee_status_enum') THEN
        CREATE TYPE employee_status_enum AS ENUM ('ACTIVE','ON_LEAVE','ARCHIVED');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'departure_reason_enum') THEN
        CREATE TYPE departure_reason_enum AS ENUM ('RESIGNATION','TERMINATION','END_OF_CONTRACT','RETIREMENT','DEATH');
    END IF;
END$$;

CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    user_id UUID NOT NULL,

    cin VARCHAR(20) NOT NULL,
    birth_date DATE NOT NULL,
    birth_place VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(20),
    personal_phone VARCHAR(20),
    personal_email VARCHAR(255),
    marital_status marital_status_enum DEFAULT 'SINGLE',
    children_count INTEGER DEFAULT 0 CHECK (children_count >= 0),

    hire_date DATE NOT NULL,
    contract_type contract_type_enum NOT NULL DEFAULT 'CDI',
    contract_end_date DATE,
    department_id UUID NOT NULL,
    position_id UUID NOT NULL,
    category professional_category_enum NOT NULL DEFAULT 'EMPLOYE',

    base_salary DECIMAL(12, 2) NOT NULL CHECK (base_salary >= 3112),
    transport_bonus DECIMAL(10, 2) DEFAULT 0,
    meal_bonus DECIMAL(10, 2) DEFAULT 0,

    cnss_number VARCHAR(50),
    amo_number VARCHAR(50),

    bank_name VARCHAR(100),
    bank_account VARCHAR(50),

    status employee_status_enum DEFAULT 'ACTIVE',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,

    CONSTRAINT employees_org_cin_unique UNIQUE(organization_id, cin),
    CONSTRAINT employees_org_email_unique UNIQUE(organization_id, personal_email),
    CONSTRAINT employees_user_unique UNIQUE(user_id),
    CONSTRAINT employees_contract_end_check CHECK (
        (contract_type = 'CDI' AND contract_end_date IS NULL) OR
        (contract_type != 'CDI' AND contract_end_date IS NOT NULL)
    )
);

CREATE INDEX IF NOT EXISTS idx_employees_organization ON employees(organization_id);
CREATE INDEX IF NOT EXISTS idx_employees_user ON employees(user_id);
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department_id);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);
CREATE INDEX IF NOT EXISTS idx_employees_hire_date ON employees(hire_date);

CREATE INDEX IF NOT EXISTS idx_employees_search ON employees USING gin (
    to_tsvector('french', coalesce(cin, '') || ' ' || coalesce(personal_email, ''))
);

CREATE TABLE IF NOT EXISTS employee_archives (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL,
    departure_reason departure_reason_enum NOT NULL,
    departure_date DATE NOT NULL,
    comments TEXT,
    final_settlement_amount DECIMAL(12, 2),
    archived_by UUID NOT NULL,
    archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_employee_archives_employee ON employee_archives(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_archives_date ON employee_archives(departure_date);

CREATE TABLE IF NOT EXISTS salary_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL,

    old_base_salary DECIMAL(12, 2) NOT NULL,
    new_base_salary DECIMAL(12, 2) NOT NULL,
    old_transport_bonus DECIMAL(10, 2) DEFAULT 0,
    new_transport_bonus DECIMAL(10, 2) DEFAULT 0,
    old_meal_bonus DECIMAL(10, 2) DEFAULT 0,
    new_meal_bonus DECIMAL(10, 2) DEFAULT 0,

    reason TEXT NOT NULL,
    effective_date DATE NOT NULL,

    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    changed_by UUID NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_salary_history_employee ON salary_history(employee_id);
CREATE INDEX IF NOT EXISTS idx_salary_history_date ON salary_history(effective_date);

CREATE TABLE IF NOT EXISTS position_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL,

    old_department_id UUID,
    new_department_id UUID,
    old_position_id UUID,
    new_position_id UUID,

    reason TEXT NOT NULL,
    effective_date DATE NOT NULL,

    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    changed_by UUID NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_position_history_employee ON position_history(employee_id);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_employees_updated_at ON employees;
CREATE TRIGGER update_employees_updated_at
BEFORE UPDATE ON employees
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();