-- V3: Add audit columns (created_by, updated_by) for JPA Auditing
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);

ALTER TABLE departments ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE departments ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);

ALTER TABLE positions ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE positions ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);
