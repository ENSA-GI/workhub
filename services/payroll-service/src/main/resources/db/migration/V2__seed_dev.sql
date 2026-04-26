INSERT INTO payroll_parameters (id, organization_id, effective_date, active, created_by)
VALUES
('666e8400-e29b-41d4-a716-446655440000','550e8400-e29b-41d4-a716-446655440000','2025-01-01',true,'880e8400-e29b-41d4-a716-446655440000')
ON CONFLICT (id) DO NOTHING;

INSERT INTO payrolls (id, organization_id, month, year, status, generated_by, total_gross_salary, total_net_salary, total_cnss, total_amo, total_ir)
VALUES
('777e8400-e29b-41d4-a716-446655440000','550e8400-e29b-41d4-a716-446655440000',1,2025,'DRAFT','880e8400-e29b-41d4-a716-446655440000',null,null,null,null,null)
ON CONFLICT (id) DO NOTHING;