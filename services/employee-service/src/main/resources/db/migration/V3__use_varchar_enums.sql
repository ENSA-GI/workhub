-- Flyway migration to alter columns of employees table from custom enum types to VARCHAR(50).
-- This resolves the "operator does not exist: employee_status_enum = character varying" issue when compared with String parameters in JPA.

ALTER TABLE employees DROP CONSTRAINT IF EXISTS employees_contract_end_check;

ALTER TABLE employees ALTER COLUMN status TYPE VARCHAR(50) USING status::text;
ALTER TABLE employees ALTER COLUMN marital_status TYPE VARCHAR(50) USING marital_status::text;
ALTER TABLE employees ALTER COLUMN contract_type TYPE VARCHAR(50) USING contract_type::text;
ALTER TABLE employees ALTER COLUMN category TYPE VARCHAR(50) USING category::text;
ALTER TABLE employee_archives ALTER COLUMN departure_reason TYPE VARCHAR(50) USING departure_reason::text;

ALTER TABLE employees ADD CONSTRAINT employees_contract_end_check CHECK (
    (contract_type = 'CDI' AND contract_end_date IS NULL) OR
    (contract_type != 'CDI' AND contract_end_date IS NOT NULL)
);
