CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE organization (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subscription_plan TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE factory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE app_user (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
  factory_id UUID REFERENCES factory(id) ON DELETE SET NULL,
  role TEXT NOT NULL CHECK (role IN ('Admin','QC','Maintenance','Supervisor','Staff')),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  password_hash TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE supplier (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  factory_id UUID NOT NULL REFERENCES factory(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  contact_details JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE raw_material (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  factory_id UUID NOT NULL REFERENCES factory(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  unit TEXT NOT NULL,
  specification_json JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE raw_material_batch (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  raw_material_id UUID NOT NULL REFERENCES raw_material(id) ON DELETE CASCADE,
  supplier_id UUID NOT NULL REFERENCES supplier(id),
  batch_number TEXT NOT NULL,
  received_quantity NUMERIC(12,3) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Pending','Approved','Rejected')),
  coa_file_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE raw_material_test (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  raw_material_batch_id UUID NOT NULL REFERENCES raw_material_batch(id) ON DELETE CASCADE,
  parameter_name TEXT NOT NULL,
  min_value NUMERIC(12,3) NOT NULL,
  max_value NUMERIC(12,3) NOT NULL,
  actual_value NUMERIC(12,3) NOT NULL,
  result TEXT NOT NULL CHECK (result IN ('Pass','Fail'))
);

CREATE TABLE product (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  factory_id UUID NOT NULL REFERENCES factory(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  specification_json JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE machine (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  factory_id UUID NOT NULL REFERENCES factory(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  capacity TEXT,
  status TEXT NOT NULL DEFAULT 'Active'
);

CREATE TABLE production_batch (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES product(id),
  batch_number TEXT NOT NULL,
  quantity NUMERIC(12,3) NOT NULL,
  machine_id UUID REFERENCES machine(id),
  status TEXT NOT NULL CHECK (status IN ('In QC','Approved','Rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE finished_product_test (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  production_batch_id UUID NOT NULL REFERENCES production_batch(id) ON DELETE CASCADE,
  parameter_name TEXT NOT NULL,
  min_value NUMERIC(12,3) NOT NULL,
  max_value NUMERIC(12,3) NOT NULL,
  actual_value NUMERIC(12,3) NOT NULL,
  result TEXT NOT NULL CHECK (result IN ('Pass','Fail'))
);

CREATE TABLE maintenance_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  machine_id UUID NOT NULL REFERENCES machine(id) ON DELETE CASCADE,
  frequency_days INTEGER NOT NULL,
  next_due_date DATE NOT NULL
);

CREATE TABLE maintenance_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  machine_id UUID NOT NULL REFERENCES machine(id),
  maintenance_type TEXT NOT NULL,
  performed_by UUID REFERENCES app_user(id),
  notes TEXT,
  performed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE task (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  factory_id UUID NOT NULL REFERENCES factory(id),
  assigned_to UUID NOT NULL REFERENCES app_user(id),
  assigned_by UUID NOT NULL REFERENCES app_user(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Open',
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

CREATE TABLE notification_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES app_user(id),
  type TEXT NOT NULL CHECK (type IN ('Email','WhatsApp')),
  message TEXT NOT NULL,
  status TEXT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organization(id),
  factory_id UUID REFERENCES factory(id),
  user_id UUID NOT NULL REFERENCES app_user(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  changes JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_factory_org ON factory(organization_id);
CREATE INDEX idx_user_org_factory ON app_user(organization_id, factory_id);
CREATE INDEX idx_rmb_status ON raw_material_batch(status);
CREATE INDEX idx_pb_status ON production_batch(status);
CREATE INDEX idx_maintenance_due ON maintenance_schedule(next_due_date);
