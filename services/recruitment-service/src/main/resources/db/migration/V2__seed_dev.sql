INSERT INTO job_offers (id, organization_id, title, description, required_skills, min_experience, contract_type, salary_range, location, status, created_by, published_at)
VALUES
('888e8400-e29b-41d4-a716-446655440000',
 '550e8400-e29b-41d4-a716-446655440000',
 'Développeur Full Stack Senior',
 'React + Spring Boot + PostgreSQL',
 '["React","Spring Boot","PostgreSQL"]'::jsonb,
 3,
 'CDI',
 '12000-15000 MAD',
 'Rabat',
 'PUBLISHED',
 '880e8400-e29b-41d4-a716-446655440000',
 CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

INSERT INTO candidates (id, user_id, first_name, last_name, email, phone)
VALUES
('999e8400-e29b-41d4-a716-446655440000',
 '000e8400-e29b-41d4-a716-446655440000',
 'Amina','Khalid','amina.candidate@mail.com','+212611111111')
ON CONFLICT (id) DO NOTHING;

INSERT INTO applications (id, job_offer_id, candidate_id, cv_url, status)
VALUES
('aaa18400-e29b-41d4-a716-446655440000',
 '888e8400-e29b-41d4-a716-446655440000',
 '999e8400-e29b-41d4-a716-446655440000',
 'minio://cv/amkhalid.pdf',
 'NEW')
ON CONFLICT (id) DO NOTHING;