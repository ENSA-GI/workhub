-- Ajout de la colonne pour suivre si l'employé a lu son bulletin, et à quelle date
ALTER TABLE payroll_items ADD COLUMN is_read BOOLEAN DEFAULT false;
ALTER TABLE payroll_items ADD COLUMN read_at TIMESTAMP;