-- V4: Add industry and country to organizations, and create organization_settings table

ALTER TABLE organizations ADD COLUMN IF NOT EXISTS industry VARCHAR(255);
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS country VARCHAR(255) DEFAULT 'Maroc';

CREATE TABLE IF NOT EXISTS organization_settings (
    organization_id UUID PRIMARY KEY REFERENCES organizations(id),
    leave_policy_days_per_year INT DEFAULT 22,
    leave_policy_max_carry_over INT DEFAULT 10,
    payroll_cnss_rate NUMERIC(5, 2),
    payroll_amo_rate NUMERIC(5, 2),
    payroll_ir_progressive_scale BOOLEAN DEFAULT true,
    payroll_template_logo_url VARCHAR(255),
    payroll_template_legal_mentions TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);
