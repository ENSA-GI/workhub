INSERT INTO leave_balances (id, employee_id, year, total_days, used_days, pending_days, remaining_days, carried_over_days)
VALUES
('333e8400-e29b-41d4-a716-446655442026','111e8400-e29b-41d4-a716-446655440000',2026,22,5,0,17,0)
ON CONFLICT (employee_id, year) DO NOTHING;

INSERT INTO leave_requests (id, employee_id, leave_type_id, start_date, end_date, requested_days, reason, status)
VALUES
('444e8400-e29b-41d4-a716-446655440001', '111e8400-e29b-41d4-a716-446655440000', '222e8400-e29b-41d4-a716-446655440000', '2026-04-25', '2026-04-29', 5, 'Vacances familiales', 'PENDING'),
('444e8400-e29b-41d4-a716-446655440002', '111e8400-e29b-41d4-a716-446655440000', '222e8400-e29b-41d4-a716-446655440000', '2026-04-10', '2026-04-12', 3, 'Voyage personnel', 'APPROVED'),
('444e8400-e29b-41d4-a716-446655440003', '111e8400-e29b-41d4-a716-446655440000', '222e8400-e29b-41d4-a716-446655440001', '2026-03-20', '2026-03-22', 3, 'Maladie', 'APPROVED')
ON CONFLICT (id) DO NOTHING;
