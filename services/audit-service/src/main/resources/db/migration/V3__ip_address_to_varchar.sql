ALTER TABLE audit_logs
ALTER COLUMN ip_address TYPE varchar(45)
USING (ip_address::text);