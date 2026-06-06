INSERT INTO notifications (id, user_id, type, title, message, related_entity_type, related_entity_id, is_read)
VALUES
('555e8400-e29b-41d4-a716-446655440000',
 '990e8400-e29b-41d4-a716-446655440000',
 'EMPLOYEE_CREATED',
 'Bienvenue sur WorkHub',
 'Votre compte employé est prêt.',
 'employee',
 '111e8400-e29b-41d4-a716-446655440000',
 false
)
ON CONFLICT (id) DO NOTHING;