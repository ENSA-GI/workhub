CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO users (id, organization_id, email, first_name, last_name, role, active, email_verified, password)
VALUES
(
  'aaaa8400-e29b-41d4-a716-446655440000'::uuid,
  '550e8400-e29b-41d4-a716-446655440000'::uuid,
  'aitjaakikemohamedamine@gmail.com',
  'Mohamed',
  'Amine',
  'RH_MANAGER',
  true,
  true,
  crypt('password123', gen_salt('bf', 10))
)
ON CONFLICT (id) DO NOTHING;
