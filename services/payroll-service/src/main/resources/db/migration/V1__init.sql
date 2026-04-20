CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payroll_status_enum') THEN
        CREATE TYPE payroll_status_enum AS ENUM ('DRAFT','VALIDATED','PAID');
    END IF;
END$$;

CREATE TABLE IF NOT EXISTS payroll_parameters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    cnss_employee_rate DECIMAL(5, 4) DEFAULT 0.0448,
    amo_employee_rate DECIMAL(5, 4) DEFAULT 0.0226,
    ir_brackets JSONB NOT NULL DEFAULT '[
        {"min": 0, "max": 2500, "rate": 0},
        {"min": 2501, "max": 4166, "rate": 0.10},
        {"min": 4167, "max": 5000, "rate": 0.20},
        {"min": 5001, "max": 6666, "rate": 0.30},
        {"min": 6667, "max": 15000, "rate": 0.34},
        {"min": 15001, "max": null, "rate": 0.38}
    ]'::jsonb,
    child_deduction DECIMAL(10, 2) DEFAULT 360,
    max_children_deduction INTEGER DEFAULT 6,
    effective_date DATE NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID
);

CREATE INDEX IF NOT EXISTS idx_payroll_parameters_org ON payroll_parameters(organization_id);
CREATE INDEX IF NOT EXISTS idx_payroll_parameters_active ON payroll_parameters(active) WHERE active = true;

CREATE TABLE IF NOT EXISTS payrolls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INTEGER NOT NULL CHECK (year >= 2024),
    status payroll_status_enum DEFAULT 'DRAFT',
    bank_file_url VARCHAR(500),
    total_gross_salary DECIMAL(15, 2),
    total_net_salary DECIMAL(15, 2),
    total_cnss DECIMAL(15, 2),
    total_amo DECIMAL(15, 2),
    total_ir DECIMAL(15, 2),
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    generated_by UUID NOT NULL,
    validated_at TIMESTAMP,
    validated_by UUID,
    CONSTRAINT payrolls_org_period_unique UNIQUE(organization_id, year, month)
);

CREATE INDEX IF NOT EXISTS idx_payrolls_organization ON payrolls(organization_id);
CREATE INDEX IF NOT EXISTS idx_payrolls_period ON payrolls(year, month);
CREATE INDEX IF NOT EXISTS idx_payrolls_status ON payrolls(status);

CREATE TABLE IF NOT EXISTS payroll_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payroll_id UUID NOT NULL,
    employee_id UUID NOT NULL,

    base_salary DECIMAL(12, 2) NOT NULL,
    transport_bonus DECIMAL(10, 2) DEFAULT 0,
    meal_bonus DECIMAL(10, 2) DEFAULT 0,
    performance_bonus DECIMAL(10, 2) DEFAULT 0,
    overtime_hours DECIMAL(5, 2) DEFAULT 0,
    overtime_amount DECIMAL(10, 2) DEFAULT 0,
    other_bonuses DECIMAL(10, 2) DEFAULT 0,

    gross_salary DECIMAL(12, 2) NOT NULL,

    worked_days INTEGER DEFAULT 26,
    absent_days INTEGER DEFAULT 0,

    cnss_deduction DECIMAL(10, 2) NOT NULL,
    amo_deduction DECIMAL(10, 2) NOT NULL,
    taxable_income DECIMAL(12, 2) NOT NULL,
    ir_deduction DECIMAL(10, 2) NOT NULL,
    other_deductions DECIMAL(10, 2) DEFAULT 0,

    net_salary DECIMAL(12, 2) NOT NULL,
    bulletin_pdf_url VARCHAR(500),
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT payroll_items_payroll_employee_unique UNIQUE(payroll_id, employee_id)
);

CREATE INDEX IF NOT EXISTS idx_payroll_items_payroll ON payroll_items(payroll_id);
CREATE INDEX IF NOT EXISTS idx_payroll_items_employee ON payroll_items(employee_id);