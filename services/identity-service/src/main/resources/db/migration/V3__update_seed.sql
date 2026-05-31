-- Corrige ou ajoute les données manquantes
INSERT INTO users (id, clerk_id, organization_id, email, first_name, last_name, role, active, email_verified)
VALUES (
           'cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid,
           'clerk_demo_rh',
           '550e8400-e29b-41d4-a716-446655440000'::uuid,
           'rh@acme.ma',
           'RH',
           'Manager',
           'RH_MANAGER',
           true,
           true
       ) ON CONFLICT DO NOTHING;