-- ============================================
-- org-service (org_db) - Seed DEV
-- ============================================

-- Organizations
INSERT INTO organizations (id, name, legal_name, email, phone, tax_id, active)
VALUES
    ('550e8400-e29b-41d4-a716-446655440000', 'TechVision Maroc', 'TechVision SARL', 'contact@techvision.ma', '+212520123456', 'ICE001234567890001', true),
    ('550e8400-e29b-41d4-a716-446655440001', 'Atlas Commerce', 'Atlas Commerce SARL', 'contact@atlas.ma', '+212522000000', 'ICE009999999999001', true),
    ('550e8400-e29b-41d4-a716-446655440002', 'Green Consulting', 'Green Consulting SARL', 'contact@green.ma', '+212524000000', 'ICE008888888888001', true)
    ON CONFLICT (id) DO NOTHING;

-- TechVision departments
INSERT INTO departments (id, organization_id, name, description)
VALUES
    ('990e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'Développement', 'Équipe technique'),
    ('aa0e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'Ressources Humaines', 'Gestion RH'),
    ('bb0e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'Commercial', 'Ventes et marketing')
    ON CONFLICT DO NOTHING;

-- TechVision positions
INSERT INTO positions (id, organization_id, title, category)
VALUES
    ('cc0e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'Développeur Full Stack', 'CADRE'),
    ('dd0e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'RH Manager', 'CADRE'),
    ('ee0e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'Commercial', 'EMPLOYE')
    ON CONFLICT DO NOTHING;