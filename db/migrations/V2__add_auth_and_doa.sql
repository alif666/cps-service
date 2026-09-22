ALTER TABLE users ADD COLUMN password_hash TEXT;

CREATE TABLE doa_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_type VARCHAR(50) NOT NULL,
  company_id UUID REFERENCES companies(id),
  business_unit_id UUID REFERENCES business_units(id),
  procurement_category VARCHAR(50),
  min_value NUMERIC(18, 2),
  max_value NUMERIC(18, 2),
  approver_role_id UUID NOT NULL REFERENCES roles(id),
  sequence_no INTEGER NOT NULL DEFAULT 1,
  is_parallel BOOLEAN NOT NULL DEFAULT FALSE,
  effective_from DATE NOT NULL,
  effective_to DATE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (min_value IS NULL OR min_value >= 0),
  CHECK (max_value IS NULL OR max_value >= 0),
  CHECK (max_value IS NULL OR min_value IS NULL OR max_value >= min_value)
);

CREATE INDEX idx_doa_rules_lookup ON doa_rules (transaction_type, company_id, business_unit_id, is_active, effective_from);

CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID REFERENCES users(id),
  entity_type VARCHAR(100) NOT NULL,
  entity_id UUID,
  action VARCHAR(80) NOT NULL,
  old_value JSONB,
  new_value JSONB,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
