INSERT INTO users (id, clerk_id, email, first_name, last_name, role, active)
VALUES
('660e8400-e29b-41d4-a716-446655440000', 'clerk_super_admin_123', 'admin@workhub.com', 'Super', 'Admin', 'SUPER_ADMIN', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO users (id, clerk_id, organization_id, email, first_name, last_name, role, active)
VALUES
('770e8400-e29b-41d4-a716-446655440000', 'clerk_youssef_123', '550e8400-e29b-41d4-a716-446655440000', 'youssef@techvision.ma', 'Youssef', 'Bennani', 'ORG_ADMIN', true),
('880e8400-e29b-41d4-a716-446655440000', 'clerk_fatima_123',  '550e8400-e29b-41d4-a716-446655440000', 'fatima@techvision.ma',  'Fatima',  'Zahra',   'RH_MANAGER', true),
('990e8400-e29b-41d4-a716-446655440000', 'clerk_mohammed_123','550e8400-e29b-41d4-a716-446655440000', 'mohammed@techvision.ma','Mohammed','El Amrani','EMPLOYEE', true)
ON CONFLICT (id) DO NOTHING;

