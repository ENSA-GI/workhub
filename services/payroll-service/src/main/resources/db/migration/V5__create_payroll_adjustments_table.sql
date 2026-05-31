-- Créer la table payroll_adjustments pour stocker les heures supplémentaires, primes et déductions
CREATE TABLE payroll_adjustments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payroll_item_id UUID NOT NULL REFERENCES payroll_items(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('OVERTIME', 'BONUS', 'DEDUCTION')),
    amount NUMERIC(15, 2) NOT NULL,
    description VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_payroll_item FOREIGN KEY (payroll_item_id) REFERENCES payroll_items(id) ON DELETE CASCADE
);

-- Index pour les recherches par payroll_item_id
CREATE INDEX idx_adjustment_payroll_item ON payroll_adjustments(payroll_item_id);
CREATE INDEX idx_adjustment_type ON payroll_adjustments(type);

