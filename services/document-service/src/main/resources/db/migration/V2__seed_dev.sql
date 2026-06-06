INSERT INTO documents (
  id, organization_id, owner_type, owner_id, type,
  file_name, file_url, mime_type, file_size, description,
  uploaded_by
) VALUES (
  'b1118400-e29b-41d4-a716-446655440000',
  '550e8400-e29b-41d4-a716-446655440000',
  'EMPLOYEE',
  '111e8400-e29b-41d4-a716-446655440000',
  'CONTRACT',
  'contract_mohammed.pdf',
  'minio://documents/techvision/contracts/contract_mohammed.pdf',
  'application/pdf',
  123456,
  'Contrat de travail signé',
  '880e8400-e29b-41d4-a716-446655440000'
)
ON CONFLICT (id) DO NOTHING;