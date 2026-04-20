INSERT INTO audit_logs (id, organization_id, user_id, action, entity_type, entity_id, new_values)
VALUES
('c1118400-e29b-41d4-a716-446655440000',
 '550e8400-e29b-41d4-a716-446655440000',
 '880e8400-e29b-41d4-a716-446655440000',
 'CREATE',
 'employee',
 '111e8400-e29b-41d4-a716-446655440000',
 '{"note":"Employee created in employee-service seed"}'::jsonb
)
ON CONFLICT (id) DO NOTHING;