-- Création de la table pour stocker le budget annuel par organisation
CREATE TABLE IF NOT EXISTS payroll_budgets (
                                               id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    budget_year INTEGER NOT NULL,
    total_budget DECIMAL(15, 2) NOT NULL,
    CONSTRAINT unique_org_year_budget UNIQUE(organization_id, budget_year)
    );