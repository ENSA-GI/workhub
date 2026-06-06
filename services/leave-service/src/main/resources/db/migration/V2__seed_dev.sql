INSERT INTO leave_types (id, organization_id, name, description, requires_certificate, is_paid, max_days_per_year)
VALUES
('222e8400-e29b-41d4-a716-446655440000','550e8400-e29b-41d4-a716-446655440000','Congé Annuel','Congé annuel payé',false,true,22),
('222e8400-e29b-41d4-a716-446655440001','550e8400-e29b-41d4-a716-446655440000','Congé Maladie','Arrêt maladie',true,true,null),
('222e8400-e29b-41d4-a716-446655440002','550e8400-e29b-41d4-a716-446655440000','Congé Sans Solde','Congé non rémunéré',false,false,null)
ON CONFLICT (id) DO NOTHING;

INSERT INTO leave_balances (id, employee_id, year, total_days, used_days, pending_days, remaining_days, carried_over_days)
VALUES
('333e8400-e29b-41d4-a716-446655440000','111e8400-e29b-41d4-a716-446655440000',2025,22,5,0,17,0)
ON CONFLICT (employee_id, year) DO NOTHING;

INSERT INTO leave_requests (id, employee_id, leave_type_id, start_date, end_date, requested_days, reason, status)
VALUES
('444e8400-e29b-41d4-a716-446655440000',
 '111e8400-e29b-41d4-a716-446655440000',
 '222e8400-e29b-41d4-a716-446655440000',
 '2025-07-15','2025-07-19',5,
 'Vacances en famille','APPROVED')
ON CONFLICT (id) DO NOTHING;
