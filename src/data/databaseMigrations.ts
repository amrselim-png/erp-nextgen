import { SqlMigrationScript, DatabaseTableDefinition } from '../types.ts';

export const SQL_MIGRATION_SCRIPTS: SqlMigrationScript[] = [
  {
    version: '0001',
    filename: '0001_extensions_and_roles.sql',
    titleAr: 'تهيئة الامتدادات (Extensions) وأدوار الأمان الثلاثة',
    titleEn: 'Extensions & 3 Database Security Roles',
    role: 'erp_owner',
    phase: 1,
    descriptionAr: 'تثبيت pgcrypto و citext و btree_gist وإنشاء أدوار erp_owner و erp_app و erp_readonly مع إنشاء Schemas الموديولات.',
    sqlContent: `-- 0001_extensions_and_roles.sql
-- ينفذ بواسطة مستخدم erp_owner فقط كـ Job في الـ CI/CD

-- 1. تفعيل الامتدادات الأساسية
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- 2. إنشاء الأدوار الثلاثة (Security Principals)
DO $$
BEGIN
  -- دور مدير التثبيت والترقيات فقط (لا يستخدمه تطبيق الويب)
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'erp_owner') THEN
    CREATE ROLE erp_owner WITH LOGIN PASSWORD 'CHANGE_IN_PRODUCTION';
  END IF;

  -- دور التطبيق الفعلي (.NET 10 Web App) - ليس مالكاً وممنوع تجاوزه للـ RLS
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'erp_app') THEN
    CREATE ROLE erp_app WITH LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS PASSWORD 'APP_SECURE_PASSWORD';
  END IF;

  -- دور التقارير و Power BI (للقراءة فقط ومقيد أيضاً بالـ RLS)
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'erp_readonly') THEN
    CREATE ROLE erp_readonly WITH LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS PASSWORD 'REPORTING_READONLY_PASS';
  END IF;
END $$;

-- 3. إنشاء Schemas المعمارية
CREATE SCHEMA IF NOT EXISTS core;
CREATE SCHEMA IF NOT EXISTS inventory;
CREATE SCHEMA IF NOT EXISTS sales;
CREATE SCHEMA IF NOT EXISTS purchasing;
CREATE SCHEMA IF NOT EXISTS accounting;
CREATE SCHEMA IF NOT EXISTS hr;
CREATE SCHEMA IF NOT EXISTS manufacturing;
CREATE SCHEMA IF NOT EXISTS clinic;
CREATE SCHEMA IF NOT EXISTS reporting;

-- منح الصلاحيات لدور التطبيق
GRANT USAGE ON SCHEMA core, inventory, sales, purchasing, accounting, hr, manufacturing, clinic, reporting TO erp_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA core, inventory, sales, purchasing, accounting, hr, manufacturing, clinic TO erp_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA core, inventory, sales, purchasing, accounting, hr, manufacturing, clinic TO erp_app;

-- دور التقارير: قراءة فقط
GRANT USAGE ON SCHEMA core, inventory, sales, purchasing, accounting, hr, manufacturing, clinic, reporting TO erp_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA core, inventory, sales, purchasing, accounting, hr, manufacturing, clinic, reporting TO erp_readonly;`
  },
  {
    version: '0002',
    filename: '0002_core_functions_and_triggers.sql',
    titleAr: 'الدوال والـ Triggers العامة (touch_row, Audit, NOTIFY)',
    titleEn: 'Core Functions & Automated Triggers',
    role: 'erp_owner',
    phase: 1,
    descriptionAr: 'دوال إدارة الأعمدة القياسية STD (زيادة version تلقائياً، تدقيق التغييرات Audit Log، وبث NOTIFY إلى SignalR).',
    sqlContent: `-- 0002_core_functions_and_triggers.sql

-- 1. دالة تحديث الإصدار والوقت (Optimistic Concurrency & Touch)
CREATE OR REPLACE FUNCTION core.touch_row()
RETURNS TRIGGER AS $$
BEGIN
  NEW.version := OLD.version + 1;
  NEW.updated_at := clock_timestamp();
  NEW.updated_by := NULLIF(current_setting('app.user_id', true), '')::uuid;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. دالة التدقيق الآلي (Universal Audit Trigger)
CREATE OR REPLACE FUNCTION core.audit_trigger_func()
RETURNS TRIGGER AS $$
DECLARE
  v_old_data jsonb := NULL;
  v_new_data jsonb := NULL;
  v_tenant_id uuid;
  v_user_id uuid;
  v_record_id uuid;
BEGIN
  IF (TG_OP = 'DELETE') THEN
    v_old_data := to_jsonb(OLD);
    v_tenant_id := OLD.tenant_id;
    v_record_id := OLD.id;
  ELSIF (TG_OP = 'UPDATE') THEN
    v_old_data := to_jsonb(OLD);
    v_new_data := to_jsonb(NEW);
    v_tenant_id := NEW.tenant_id;
    v_record_id := NEW.id;
  ELSIF (TG_OP = 'INSERT') THEN
    v_new_data := to_jsonb(NEW);
    v_tenant_id := NEW.tenant_id;
    v_record_id := NEW.id;
  END IF;

  v_user_id := NULLIF(current_setting('app.user_id', true), '')::uuid;

  INSERT INTO core.audit_log (
    tenant_id,
    occurred_at,
    user_id,
    table_name,
    record_id,
    operation,
    old_data,
    new_data,
    request_id,
    ip
  ) VALUES (
    v_tenant_id,
    clock_timestamp(),
    v_user_id,
    TG_TABLE_SCHEMA || '.' || TG_TABLE_NAME,
    v_record_id,
    TG_OP,
    v_old_data,
    v_new_data,
    NULLIF(current_setting('app.request_id', true), ''),
    NULLIF(current_setting('app.client_ip', true), '')
  );

  IF (TG_OP = 'DELETE') THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. دالة البث اللحظي عبر Postgres NOTIFY لربطها بـ SignalR
CREATE OR REPLACE FUNCTION core.realtime_notify_func()
RETURNS TRIGGER AS $$
DECLARE
  v_payload jsonb;
  v_tenant_id uuid;
BEGIN
  IF (TG_OP = 'DELETE') THEN
    v_tenant_id := OLD.tenant_id;
    v_payload := jsonb_build_object(
      'op', TG_OP,
      'schema', TG_TABLE_SCHEMA,
      'table', TG_TABLE_NAME,
      'id', OLD.id,
      'tenant_id', v_tenant_id,
      'timestamp', clock_timestamp()
    );
  ELSE
    v_tenant_id := NEW.tenant_id;
    v_payload := jsonb_build_object(
      'op', TG_OP,
      'schema', TG_TABLE_SCHEMA,
      'table', TG_TABLE_NAME,
      'id', NEW.id,
      'version', NEW.version,
      'tenant_id', v_tenant_id,
      'timestamp', clock_timestamp()
    );
  END IF;

  PERFORM pg_notify('table_changes', v_payload::text);
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;`
  },
  {
    version: '0003',
    filename: '0003_core_tenants_and_identity.sql',
    titleAr: 'جداول الهوية والـ Tenants والمستخدمين والأدوار',
    titleEn: 'Tenants, Branches, Users, Roles & JWT Refresh',
    role: 'erp_owner',
    phase: 1,
    descriptionAr: 'هيكل المنشآت المتعددة (Multi-tenancy)، الفروع، المستخدمين، تعيين الأدوار، والـ Refresh Tokens المحمية في HttpOnly Cookies.',
    sqlContent: `-- 0003_core_tenants_and_identity.sql

-- 1. جدول المنشآت (Tenants)
CREATE TABLE core.tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'trial')),
  base_currency text NOT NULL DEFAULT 'EGP',
  timezone text NOT NULL DEFAULT 'Africa/Cairo',
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp()
);

-- 2. جدول الفروع (Branches)
CREATE TABLE core.branches (
  tenant_id uuid NOT NULL REFERENCES core.tenants(id) ON DELETE CASCADE,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  code text NOT NULL,
  name text NOT NULL,
  address text,
  is_active boolean NOT NULL DEFAULT true,
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  created_by uuid,
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  updated_by uuid,
  deleted_at timestamptz,
  CONSTRAINT pk_branches PRIMARY KEY (tenant_id, id),
  CONSTRAINT uq_branches_code UNIQUE (tenant_id, code)
);

-- 3. جدول المستخدمين (Users)
CREATE TABLE core.users (
  tenant_id uuid NOT NULL REFERENCES core.tenants(id) ON DELETE CASCADE,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email citext NOT NULL,
  full_name text NOT NULL,
  password_hash text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'locked')),
  last_login_at timestamptz,
  failed_attempts integer NOT NULL DEFAULT 0,
  locked_until timestamptz,
  must_change_password boolean NOT NULL DEFAULT false,
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  created_by uuid,
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  updated_by uuid,
  deleted_at timestamptz,
  CONSTRAINT pk_users PRIMARY KEY (tenant_id, id),
  CONSTRAINT uq_users_email UNIQUE (tenant_id, email)
);

-- 4. جدول الأدوار (Roles)
CREATE TABLE core.roles (
  tenant_id uuid NOT NULL REFERENCES core.tenants(id) ON DELETE CASCADE,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  code text NOT NULL,
  name text NOT NULL,
  is_system boolean NOT NULL DEFAULT false,
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  created_by uuid,
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  updated_by uuid,
  deleted_at timestamptz,
  CONSTRAINT pk_roles PRIMARY KEY (tenant_id, id),
  CONSTRAINT uq_roles_code UNIQUE (tenant_id, code)
);

-- 5. جدول ربط المستخدمين بالأدوار والفروع (User Roles)
CREATE TABLE core.user_roles (
  tenant_id uuid NOT NULL,
  user_id uuid NOT NULL,
  role_id uuid NOT NULL,
  branch_id uuid, -- NULL تعني الصلاحية تسري على كل فروع الـ Tenant
  CONSTRAINT pk_user_roles PRIMARY KEY (tenant_id, user_id, role_id, branch_id),
  CONSTRAINT fk_user_roles_user FOREIGN KEY (tenant_id, user_id) REFERENCES core.users(tenant_id, id) ON DELETE CASCADE,
  CONSTRAINT fk_user_roles_role FOREIGN KEY (tenant_id, role_id) REFERENCES core.roles(tenant_id, id) ON DELETE CASCADE
);

-- 6. جدول الـ Refresh Tokens
CREATE TABLE core.refresh_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES core.tenants(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  token_hash text NOT NULL,
  family_id uuid NOT NULL,
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  replaced_by text,
  ip text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
CREATE INDEX idx_refresh_tokens_family ON core.refresh_tokens (tenant_id, family_id);`
  },
  {
    version: '0004',
    filename: '0004_core_metadata_and_actions.sql',
    titleAr: 'محرك الـ Metadata وسجل الأفعال (Action Registry)',
    titleEn: 'Metadata Engine, Entity Fields & Action Registry',
    role: 'erp_owner',
    phase: 1,
    descriptionAr: 'جداول الموديولات، الكيانات، الحقول، الشاشات، وسجل الأفعال المركزي module.entity.action ومصفوفة الصلاحيات مع فرض Default-Deny.',
    sqlContent: `-- 0004_core_metadata_and_actions.sql

-- 1. الموديولات (Modules Registry)
CREATE TABLE core.modules (
  code text PRIMARY KEY,
  name text NOT NULL,
  version text NOT NULL DEFAULT '1.0.0',
  depends_on text[] NOT NULL DEFAULT '{}',
  description text
);

-- 2. الموديولات المفعلة للمنشأة (Tenant Modules)
CREATE TABLE core.tenant_modules (
  tenant_id uuid NOT NULL REFERENCES core.tenants(id) ON DELETE CASCADE,
  module_code text NOT NULL REFERENCES core.modules(code) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'enabled' CHECK (status IN ('enabled', 'disabled')),
  installed_version text NOT NULL,
  enabled_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  CONSTRAINT pk_tenant_modules PRIMARY KEY (tenant_id, module_code)
);

-- 3. الكيانات (Entities Definition)
CREATE TABLE core.entities (
  code text PRIMARY KEY, -- مثال: inventory.item, sales.invoice
  module_code text NOT NULL REFERENCES core.modules(code) ON DELETE CASCADE,
  table_name text NOT NULL,
  display_name_ar text NOT NULL,
  display_name_en text NOT NULL,
  soft_delete boolean NOT NULL DEFAULT true
);

-- 4. حقول الكيانات (Entity Fields - لتوليد الواجهات آلياً)
CREATE TABLE core.entity_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_code text NOT NULL REFERENCES core.entities(code) ON DELETE CASCADE,
  column_name text NOT NULL,
  label_ar text NOT NULL,
  label_en text NOT NULL,
  data_type text NOT NULL, -- string, number, currency, select, date, badge
  is_required boolean NOT NULL DEFAULT false,
  is_readonly boolean NOT NULL DEFAULT false,
  default_value text,
  lookup_entity text REFERENCES core.entities(code),
  grid_visible boolean NOT NULL DEFAULT true,
  form_order integer NOT NULL DEFAULT 10,
  width integer DEFAULT 150,
  validation jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT uq_entity_fields UNIQUE (entity_code, column_name)
);

-- 5. الشاشات (Screen Schemas)
CREATE TABLE core.screens (
  code text PRIMARY KEY,
  module_code text NOT NULL REFERENCES core.modules(code) ON DELETE CASCADE,
  entity_code text REFERENCES core.entities(code),
  kind text NOT NULL CHECK (kind IN ('grid', 'form', 'custom', 'report')),
  route text NOT NULL,
  menu_group text NOT NULL,
  sort_order integer NOT NULL DEFAULT 10,
  icon text NOT NULL DEFAULT 'Layers',
  config jsonb NOT NULL DEFAULT '{}'::jsonb
);

-- 6. سجل الأفعال المركزي (Action Registry - مصدر الأزرار الوحيد)
CREATE TABLE core.actions (
  code text PRIMARY KEY, -- نمط module.entity.action: e.g. pos.order.pay, invoice.approve
  module_code text NOT NULL REFERENCES core.modules(code) ON DELETE CASCADE,
  entity_code text REFERENCES core.entities(code),
  label_ar text NOT NULL,
  label_en text NOT NULL,
  type text NOT NULL CHECK (type IN ('button', 'menu', 'api', 'batch')),
  default_scope text NOT NULL DEFAULT 'branch' CHECK (default_scope IN ('all', 'branch', 'own'))
);

-- 7. مصفوفة الصلاحيات (Permissions - غياب الصف = ممنوع Default Deny)
CREATE TABLE core.permissions (
  tenant_id uuid NOT NULL REFERENCES core.tenants(id) ON DELETE CASCADE,
  role_id uuid NOT NULL,
  action_code text NOT NULL REFERENCES core.actions(code) ON DELETE CASCADE,
  scope text NOT NULL DEFAULT 'branch' CHECK (scope IN ('all', 'branch', 'own')),
  CONSTRAINT pk_permissions PRIMARY KEY (tenant_id, role_id, action_code),
  CONSTRAINT fk_permissions_role FOREIGN KEY (tenant_id, role_id) REFERENCES core.roles(tenant_id, id) ON DELETE CASCADE
);`
  },
  {
    version: '0005',
    filename: '0005_core_audit_outbox_infrastructure.sql',
    titleAr: 'البنية المشتركة: Audit Log مقسم شهرياً، Outbox، والتسلسلات',
    titleEn: 'Monthly Partitioned Audit Log, Outbox Events & Sequences',
    role: 'erp_owner',
    phase: 1,
    descriptionAr: 'جداول سجل التدقيق المقسم (Monthly Partitioning)، أحداث الـ Outbox، التسلسلات الخالية من الفجوات، والمرفقات.',
    sqlContent: `-- 0005_core_audit_outbox_infrastructure.sql

-- 1. جدول سجل التدقيق الرئيسي (Partition شهري)
CREATE TABLE core.audit_log (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  occurred_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  user_id uuid,
  table_name text NOT NULL,
  record_id uuid NOT NULL,
  operation text NOT NULL,
  old_data jsonb,
  new_data jsonb,
  changed_columns text[],
  request_id text,
  ip text,
  CONSTRAINT pk_audit_log PRIMARY KEY (tenant_id, occurred_at, id)
) PARTITION BY RANGE (occurred_at);

-- إنشاء بارتشنات أولية لسنة 2026 (تتولى وظيفة Hangfire الشهرية إنشاء البارتشنات التالية)
CREATE TABLE IF NOT EXISTS core.audit_log_2026_10 PARTITION OF core.audit_log
  FOR VALUES FROM ('2026-10-01 00:00:00+00') TO ('2026-11-01 00:00:00+00');
CREATE TABLE IF NOT EXISTS core.audit_log_2026_11 PARTITION OF core.audit_log
  FOR VALUES FROM ('2026-11-01 00:00:00+00') TO ('2026-12-01 00:00:00+00');

CREATE INDEX idx_audit_log_keyset ON core.audit_log (tenant_id, occurred_at DESC, id DESC);
CREATE INDEX idx_audit_log_record ON core.audit_log (tenant_id, table_name, record_id);

-- 2. جدول أحداث الـ Outbox للـ Sagas والاتساق التدريجي
CREATE TABLE core.outbox_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES core.tenants(id) ON DELETE CASCADE,
  occurred_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  event_type text NOT NULL,
  aggregate_type text NOT NULL,
  aggregate_id text NOT NULL,
  payload jsonb NOT NULL,
  status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_FLIGHT', 'PROCESSED', 'FAILED', 'COMPENSATED')),
  attempts integer NOT NULL DEFAULT 0,
  next_attempt_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  processed_at timestamptz,
  error text
);
CREATE INDEX idx_outbox_pending ON core.outbox_events (status, next_attempt_at) WHERE status = 'PENDING';

-- 3. جدول منع تكرار معالجة الأحداث (Idempotent Consumer)
CREATE TABLE core.processed_events (
  consumer text NOT NULL,
  event_id uuid NOT NULL,
  processed_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  CONSTRAINT pk_processed_events PRIMARY KEY (consumer, event_id)
);

-- 4. التسلسلات الرقمية الدقيقة (بدون فجوات لـ ETA والضرائب)
CREATE TABLE core.number_sequences (
  tenant_id uuid NOT NULL REFERENCES core.tenants(id) ON DELETE CASCADE,
  branch_id uuid,
  doc_type text NOT NULL,
  period text NOT NULL, -- e.g. 2026, 2026-10
  prefix text NOT NULL,
  next_value bigint NOT NULL DEFAULT 1,
  CONSTRAINT pk_number_sequences PRIMARY KEY (tenant_id, doc_type, period, prefix)
);

-- 5. جدول المرفقات (Attachments)
CREATE TABLE core.attachments (
  tenant_id uuid NOT NULL REFERENCES core.tenants(id) ON DELETE CASCADE,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  entity_code text NOT NULL,
  record_id uuid NOT NULL,
  file_name text NOT NULL,
  content_type text NOT NULL,
  size bigint NOT NULL,
  storage_key text NOT NULL,
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  created_by uuid,
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  updated_by uuid,
  deleted_at timestamptz,
  CONSTRAINT pk_attachments PRIMARY KEY (tenant_id, id)
);

-- 6. جداول العملات والأسعار ومطابقة الفاتورة الإلكترونية ETA
CREATE TABLE core.currencies (
  code text PRIMARY KEY,
  name text NOT NULL,
  decimals integer NOT NULL DEFAULT 2
);

CREATE TABLE core.exchange_rates (
  tenant_id uuid NOT NULL REFERENCES core.tenants(id) ON DELETE CASCADE,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  from_currency text NOT NULL REFERENCES core.currencies(code),
  to_currency text NOT NULL REFERENCES core.currencies(code),
  rate numeric(18, 6) NOT NULL,
  rate_date date NOT NULL,
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  created_by uuid,
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  updated_by uuid,
  deleted_at timestamptz,
  CONSTRAINT pk_exchange_rates PRIMARY KEY (tenant_id, id)
);

CREATE TABLE core.eta_submissions (
  tenant_id uuid NOT NULL REFERENCES core.tenants(id) ON DELETE CASCADE,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  document_type text NOT NULL, -- invoice, receipt
  document_id uuid NOT NULL,
  eta_uuid text,
  payload jsonb NOT NULL,
  status text NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'valid', 'invalid', 'cancelled')),
  response jsonb,
  attempts integer NOT NULL DEFAULT 1,
  submitted_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  created_by uuid,
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  updated_by uuid,
  deleted_at timestamptz,
  CONSTRAINT pk_eta_submissions PRIMARY KEY (tenant_id, id)
);`
  },
  {
    version: '0006',
    filename: '0006_core_rls_policies.sql',
    titleAr: 'تطبيق سياسات العزل الصارم (Row-Level Security) وتفعيل الـ Triggers',
    titleEn: 'RLS Policies & Automated Trigger Attachment',
    role: 'erp_owner',
    phase: 1,
    descriptionAr: 'تفعيل RLS إجباري (FORCE ROW LEVEL SECURITY) مع فحص app.tenant_id، وربط Triggers الـ touch_row والـ Audit والـ NOTIFY.',
    sqlContent: `-- 0006_core_rls_policies.sql

-- 1. تفعيل سياسات Row-Level Security على كل جداول core التابعة للـ tenants
ALTER TABLE core.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE core.branches FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON core.branches
  FOR ALL
  USING (tenant_id = (SELECT NULLIF(current_setting('app.tenant_id', true), '')::uuid))
  WITH CHECK (tenant_id = (SELECT NULLIF(current_setting('app.tenant_id', true), '')::uuid));

ALTER TABLE core.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE core.users FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON core.users
  FOR ALL
  USING (tenant_id = (SELECT NULLIF(current_setting('app.tenant_id', true), '')::uuid))
  WITH CHECK (tenant_id = (SELECT NULLIF(current_setting('app.tenant_id', true), '')::uuid));

ALTER TABLE core.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE core.roles FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON core.roles
  FOR ALL
  USING (tenant_id = (SELECT NULLIF(current_setting('app.tenant_id', true), '')::uuid))
  WITH CHECK (tenant_id = (SELECT NULLIF(current_setting('app.tenant_id', true), '')::uuid));

ALTER TABLE core.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE core.permissions FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON core.permissions
  FOR ALL
  USING (tenant_id = (SELECT NULLIF(current_setting('app.tenant_id', true), '')::uuid))
  WITH CHECK (tenant_id = (SELECT NULLIF(current_setting('app.tenant_id', true), '')::uuid));

ALTER TABLE core.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE core.audit_log FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON core.audit_log
  FOR ALL
  USING (tenant_id = (SELECT NULLIF(current_setting('app.tenant_id', true), '')::uuid))
  WITH CHECK (tenant_id = (SELECT NULLIF(current_setting('app.tenant_id', true), '')::uuid));

-- 2. ربط Triggers الثلاثة (touch_row + audit + realtime_notify)
CREATE TRIGGER trg_branches_touch
  BEFORE UPDATE ON core.branches
  FOR EACH ROW EXECUTE FUNCTION core.touch_row();

CREATE TRIGGER trg_branches_audit
  AFTER INSERT OR UPDATE OR DELETE ON core.branches
  FOR EACH ROW EXECUTE FUNCTION core.audit_trigger_func();

CREATE TRIGGER trg_branches_notify
  AFTER INSERT OR UPDATE OR DELETE ON core.branches
  FOR EACH ROW EXECUTE FUNCTION core.realtime_notify_func();

CREATE TRIGGER trg_users_touch
  BEFORE UPDATE ON core.users
  FOR EACH ROW EXECUTE FUNCTION core.touch_row();

CREATE TRIGGER trg_users_audit
  AFTER INSERT OR UPDATE OR DELETE ON core.users
  FOR EACH ROW EXECUTE FUNCTION core.audit_trigger_func();`
  },
  {
    version: '0007',
    filename: '0007_seed_initial_actions_and_roles.sql',
    titleAr: 'البيانات الأولية (Seed): تسجيل الأفعال module.entity.action والأدوار',
    titleEn: 'Seed Data: module.entity.action Registry & Default Currencies',
    role: 'erp_owner',
    phase: 1,
    descriptionAr: 'زرع العملات (EGP, USD)، الموديولات، وكل الأزرار المسجلة بصيغة module.entity.action المعتمدة.',
    sqlContent: `-- 0007_seed_initial_actions_and_roles.sql

-- 1. العملات الأساسية
INSERT INTO core.currencies (code, name, decimals) VALUES
  ('EGP', 'الجنيه المصري', 2),
  ('USD', 'الدولار الأمريكي', 2),
  ('EUR', 'اليورو الأوروبي', 2),
  ('SAR', 'الريال السعودي', 2)
ON CONFLICT (code) DO NOTHING;

-- 2. موديولات النظام
INSERT INTO core.modules (code, name, version, depends_on, description) VALUES
  ('core', 'النواة الإدارية والهوية', '1.0.0', '{}', 'المستخدمين والفروع والصلاحيات وسجل التدقيق'),
  ('inventory', 'المخازن والأصناف', '1.0.0', '{core}', 'إدارة الأصناف، أذون الإضافة والصرف، الجرد المستمر'),
  ('sales', 'المبيعات ونقاط البيع POS', '1.0.0', '{core, inventory}', 'الفواتير، الكاشير، الإيصال الإلكتروني ETA'),
  ('purchasing', 'المشتريات والموردين', '1.0.0', '{core, inventory}', 'أوامر الشراء، استلام البضائع، سداد الموردين'),
  ('accounting', 'الحسابات العامة GL', '1.0.0', '{core}', 'دليل الحسابات، قيود اليومية، ميزان المراجعة، الفترات'),
  ('hr', 'الموارد البشرية والمرتبات', '1.0.0', '{core}', 'الموظفين، الحضور، الإجازات، مسيرات الرواتب'),
  ('manufacturing', 'التصنيع والتشغيل BOM', '1.0.0', '{core, inventory}', 'شجرة المنتج BOM، أوامر الإنتاج، التكلفة الفعلية'),
  ('clinic', 'العيادات الطبية', '1.0.0', '{core}', 'سجلات المرضى، مواعيد الأطباء، الزيارات والفوترة')
ON CONFLICT (code) DO NOTHING;

-- 3. تسجيل الأفعال (Action Registry) بقاعدة module.entity.action
INSERT INTO core.actions (code, module_code, entity_code, label_ar, label_en, type, default_scope) VALUES
  -- 1. المصادقة والهوية (Auth)
  ('auth.login', 'core', NULL, 'تسجيل الدخول للنظام', 'Login', 'button', 'own'),
  ('auth.reset', 'core', NULL, 'استرجاع كلمة المرور', 'Password Reset', 'button', 'own'),
  ('auth.logout', 'core', NULL, 'تسجيل الخروج وإنهاء الجلسة', 'Logout', 'button', 'own'),

  -- 2. إعدادات المنشأة والفروع (Tenant & Branch)
  ('tenant.settings.save', 'core', NULL, 'حفظ إعدادات المنشأة والضرائب', 'Save Tenant Settings', 'button', 'all'),
  ('branch.create', 'core', NULL, 'إضافة فرع جديد', 'Create Branch', 'button', 'all'),

  -- 3. المستخدمون (Users)
  ('user.create', 'core', NULL, 'إنشاء موظف ومستخدم جديد', 'Create User', 'button', 'all'),
  ('user.toggle', 'core', NULL, 'تعطيل أو تفعيل المستخدم', 'Toggle User Active Status', 'button', 'all'),
  ('user.resetpw', 'core', NULL, 'توليد رابط إعادة تعيين كلمة المرور', 'Reset User Password', 'button', 'all'),
  ('user.assignrole', 'core', NULL, 'تعيين الأدوار والفروع للمستخدم', 'Assign User Roles', 'button', 'all'),

  -- 4. الأدوار والصلاحيات (Roles & Permissions)
  ('role.create', 'core', NULL, 'إنشاء أو نسخ دور جديد', 'Create or Clone Role', 'button', 'all'),
  ('role.permissions.save', 'core', NULL, 'حفظ مصفوفة الصلاحيات وبث NOTIFY', 'Save Permissions Matrix', 'button', 'all'),

  -- 5. مدير الموديولات (Modules)
  ('module.enable', 'core', NULL, 'تفعيل الموديول وفحص الاعتماديات', 'Enable Module', 'button', 'all'),
  ('module.disable', 'core', NULL, 'إيقاف الموديول مؤقتاً للـ Tenant', 'Disable Module', 'button', 'all'),

  -- 6. سجل التدقيق (Audit)
  ('audit.export', 'core', NULL, 'تصدير سجل التدقيق عبر Job خلفي', 'Export Audit Log', 'button', 'all'),

  -- 7. محرك الشاشات العام (Generic Screen Actions)
  ('generic.record.create', 'core', NULL, 'إضافة سجل جديد من الـ Metadata', 'Create Record', 'button', 'branch'),
  ('generic.record.save', 'core', NULL, 'حفظ السجل مع التحقق من الإصدار version', 'Save Record', 'button', 'branch'),
  ('generic.record.delete', 'core', NULL, 'حذف ناعم مع فحص الارتباطات', 'Soft Delete Record', 'button', 'branch'),
  ('generic.record.export', 'core', NULL, 'تصدير بيانات الجدول إلى Excel/CSV', 'Export Grid Data', 'button', 'branch'),
  ('generic.record.print', 'core', NULL, 'طباعة السجل الرسمي عبر Playwright PDF', 'Print Record PDF', 'button', 'branch'),

  -- 8. المخازن (Inventory)
  ('item.import', 'inventory', NULL, 'استيراد الأصناف دفعة واحدة من Excel', 'Batch Import Items', 'button', 'branch'),
  ('item.toggle', 'inventory', NULL, 'تعطيل أو تفعيل الصنف دون حذفه', 'Toggle Item Active', 'button', 'branch'),
  ('warehouse.create', 'inventory', NULL, 'إنشاء مخزن جديد تابع للفرع', 'Create Warehouse', 'button', 'branch'),
  ('stock.receive', 'inventory', NULL, 'إذن استلام بضاعة وإضافة مخزون', 'Receive Stock', 'button', 'branch'),
  ('stock.issue', 'inventory', NULL, 'إذن صرف مخزن ومنع الرصيد السالب', 'Issue Stock', 'button', 'branch'),
  ('stock.transfer', 'inventory', NULL, 'تحويل بضاعة بين مخزنين في Transaction واحدة', 'Transfer Stock', 'button', 'all'),
  ('stockcount.start', 'inventory', NULL, 'بدء جرد مخزني وتثبيت الدفتري', 'Start Stock Count', 'button', 'branch'),
  ('stockcount.approve', 'inventory', NULL, 'اعتماد الجرد وتوليد تسويات الفروق', 'Approve Stock Count', 'button', 'branch'),

  -- 9. المبيعات ونقاط البيع (Sales & POS)
  ('pos.discount', 'sales', NULL, 'منح خصم كاشير ضمن الحد المسموح', 'Apply POS Discount', 'button', 'branch'),
  ('pos.hold', 'sales', NULL, 'تعليق السلة أو استرجاعها', 'Hold or Retrieve Cart', 'button', 'branch'),
  ('pos.pay', 'sales', NULL, 'سداد الفاتورة وإرسال الإيصال لـ ETA', 'Pay POS Order & Send ETA', 'button', 'branch'),
  ('pos.return', 'sales', NULL, 'مرتجع بيع مع إعادة المخزون', 'Process POS Return', 'button', 'branch'),
  ('shift.close', 'sales', NULL, 'إغلاق وردية الكاشير ومطابقة العجز/الزيادة', 'Close Cashier Shift', 'button', 'branch'),
  ('invoice.approve', 'sales', NULL, 'اعتماد الفاتورة وتوليد قيد الحسابات', 'Approve Sales Invoice', 'button', 'branch'),
  ('invoice.cancel', 'sales', NULL, 'إلغاء الفاتورة وإنشاء قيد عكسي', 'Cancel Sales Invoice', 'button', 'branch'),
  ('payment.receive', 'sales', NULL, 'تسجيل تحصيل نقدية أو بنك لعميل', 'Receive Customer Payment', 'button', 'branch'),

  -- 10. المشتريات (Purchasing)
  ('po.create', 'purchasing', NULL, 'إنشاء أمر شراء للمورد', 'Create Purchase Order', 'button', 'branch'),
  ('po.approve', 'purchasing', NULL, 'اعتماد أمر الشراء ورقابته مالياً', 'Approve Purchase Order', 'button', 'all'),
  ('po.receive', 'purchasing', NULL, 'استلام أمر الشراء وتوليد إذن المخزن', 'Receive Purchase Order', 'button', 'branch'),
  ('supplierpay.create', 'purchasing', NULL, 'سداد مستحقات مورد وربطها بالفواتير', 'Create Supplier Payment', 'button', 'all'),

  -- 11. المحاسبة (Accounting)
  ('account.create', 'accounting', NULL, 'إضافة حساب جديد في الدليل الهرمي', 'Create Ledger Account', 'button', 'all'),
  ('journal.post', 'accounting', NULL, 'ترحيل قيد اليومية العام والتأكد من التوازن', 'Post Journal Entry', 'button', 'all'),
  ('journal.reverse', 'accounting', NULL, 'عكس قيد محاسبي دون حذفه', 'Reverse Journal Entry', 'button', 'all'),
  ('period.close', 'accounting', NULL, 'إقفال الفترة المالية ومنع القيود', 'Close Fiscal Period', 'button', 'all'),

  -- 12. الموارد البشرية والمرتبات (HR)
  ('employee.create', 'hr', NULL, 'تسجيل ملف موظف جديد وعقد العمل', 'Create Employee Record', 'button', 'all'),
  ('attendance.import', 'hr', NULL, 'استيراد بصمة الحضور والانصراف', 'Import Attendance Fingerprints', 'button', 'all'),
  ('payroll.run', 'hr', NULL, 'تشغيل احتساب مسير المرتبات الشهري', 'Run Payroll Calculation', 'button', 'all'),
  ('payroll.approve', 'hr', NULL, 'اعتماد مسير المرتبات وتوليد القيد المالي', 'Approve Payroll Run', 'button', 'all'),
  ('payslip.print', 'hr', NULL, 'طباعة قسيمة الراتب السرية PDF للموظف', 'Print Payslip PDF', 'button', 'own'),

  -- 13. التصنيع والعيادات (Manufacturing & Clinic)
  ('bom.newversion', 'manufacturing', NULL, 'إنشاء إصدار جديد من شجرة المنتج BOM', 'Create BOM Version', 'button', 'all'),
  ('bom.approve', 'manufacturing', NULL, 'اعتماد شجرة المنتج للتشغيل الفعلي', 'Approve BOM', 'button', 'all'),
  ('production.start', 'manufacturing', NULL, 'بدء أمر تشغيل وصرف الخامات', 'Start Production Order', 'button', 'branch'),
  ('production.complete', 'manufacturing', NULL, 'إنهاء أمر تشغيل وإضافة التام وحساب التكلفة', 'Complete Production Order', 'button', 'branch'),
  ('costing.recalc', 'manufacturing', NULL, 'إعادة احتساب التكلفة الفعلية للمنتجات', 'Recalculate Actual Costs', 'button', 'all'),
  ('patient.create', 'clinic', NULL, 'فتح ملف طبي وبحث مريض جديد', 'Create Patient File', 'button', 'all'),
  ('appointment.book', 'clinic', NULL, 'حجز موعد طبي مع منع تضارب الجدول GIST', 'Book Doctor Appointment', 'button', 'branch'),
  ('visit.addservice', 'clinic', NULL, 'إضافة فحص أو خدمة طبية للزيارة', 'Add Service to Visit', 'button', 'branch'),
  ('visit.close', 'clinic', NULL, 'إنهاء الزيارة الطبية وتوليد الفاتورة', 'Close Visit & Generate Invoice', 'button', 'branch'),
  ('eta.resend', 'sales', NULL, 'إعادة إرسال الفاتورة الفاشلة لمنظومة الضرائب المصرية', 'Resend ETA Invoice', 'button', 'all'),

  -- 14. التقارير والتشغيل (Reporting & Maintenance)
  ('report.run', 'reporting', NULL, 'تشغيل التقارير المجمعة من Materialized Views', 'Run Materialized Report', 'button', 'branch'),
  ('report.schedule', 'reporting', NULL, 'جدولة إرسال التقرير دورياً بالبريد عبر Hangfire', 'Schedule Report Dispatch', 'button', 'all'),
  ('event.retry', 'core', NULL, 'إعادة تشغيل الأحداث الفاشلة من جدول الـ Outbox', 'Retry Failed Outbox Event', 'button', 'all')
ON CONFLICT (code) DO UPDATE
SET label_ar = EXCLUDED.label_ar, label_en = EXCLUDED.label_en;`
  }
];

export const ALL_DATABASE_TABLES: DatabaseTableDefinition[] = [
  // CORE SCHEMA
  {
    schema: 'core',
    tableName: 'tenants',
    displayNameAr: 'المنشآت المشتركة (Tenants)',
    descriptionAr: 'الجدول الرئيسي للمنشآت في البيئة السحابية متعددة المستأجرين (Multi-tenant).',
    hasStdColumns: false,
    hasRls: false,
    triggers: ['touch_row'],
    columns: [
      { name: 'id', type: 'uuid', nullable: false, isPk: true, descriptionAr: 'المعرف الفريد للمنشأة' },
      { name: 'code', type: 'text', nullable: false, descriptionAr: 'كود المنشأة المختصر والفريد' },
      { name: 'name', type: 'text', nullable: false, descriptionAr: 'اسم المنشأة التجاري الرسمي' },
      { name: 'status', type: 'text', nullable: false, descriptionAr: 'حالة الحساب (active / suspended / trial)' },
      { name: 'base_currency', type: 'text', nullable: false, descriptionAr: 'العملة الأساسية للمنشأة (EGP افتراضياً)' },
      { name: 'timezone', type: 'text', nullable: false, descriptionAr: 'المنطقة الزمنية (Africa/Cairo)' },
      { name: 'settings', type: 'jsonb', nullable: false, descriptionAr: 'إعدادات عامة وضرائب وبيانات السجل التجاري' },
      { name: 'version', type: 'integer', nullable: false, descriptionAr: 'إصدار التعديل المتزامن' },
      { name: 'created_at', type: 'timestamptz', nullable: false, descriptionAr: 'تاريخ إنشاء المنشأة' }
    ],
    sampleSql: `SELECT id, code, name, base_currency, status FROM core.tenants;`
  },
  {
    schema: 'core',
    tableName: 'branches',
    displayNameAr: 'فروع المنشأة (Branches)',
    descriptionAr: 'الفروع ومراكز البيع التابعة لكل منشأة مع عزل RLS كامل.',
    hasStdColumns: true,
    hasRls: true,
    triggers: ['touch_row', 'audit_trigger', 'realtime_notify'],
    columns: [
      { name: 'tenant_id', type: 'uuid', nullable: false, isPk: true, isFk: true, fkTarget: 'core.tenants(id)', descriptionAr: 'معرف المنشأة الأم' },
      { name: 'id', type: 'uuid', nullable: false, isPk: true, isStd: true, descriptionAr: 'معرف الفرع' },
      { name: 'code', type: 'text', nullable: false, descriptionAr: 'كود الفرع (مثال: CAI-MAADI, HRG-MAIN)' },
      { name: 'name', type: 'text', nullable: false, descriptionAr: 'اسم الفرع' },
      { name: 'address', type: 'text', nullable: true, descriptionAr: 'العنوان الجغرافي للفرع' },
      { name: 'is_active', type: 'boolean', nullable: false, descriptionAr: 'حالة الفرع التشغيلية' },
      { name: 'version', type: 'integer', nullable: false, isStd: true, descriptionAr: 'رقم الإصدار' },
      { name: 'created_at', type: 'timestamptz', nullable: false, isStd: true, descriptionAr: 'تاريخ الإنشاء' },
      { name: 'updated_at', type: 'timestamptz', nullable: false, isStd: true, descriptionAr: 'تاريخ آخر تحديث' },
      { name: 'deleted_at', type: 'timestamptz', nullable: true, isStd: true, descriptionAr: 'تاريخ الحذف الناعم' }
    ],
    sampleSql: `SELECT id, code, name, is_active FROM core.branches WHERE is_active = true;`
  },
  {
    schema: 'core',
    tableName: 'users',
    displayNameAr: 'المستخدمون والموظفون (Users)',
    descriptionAr: 'حسابات الدخول للنظام مع التحقق من الهوية والأمان وقفل الحسابات.',
    hasStdColumns: true,
    hasRls: true,
    triggers: ['touch_row', 'audit_trigger'],
    columns: [
      { name: 'tenant_id', type: 'uuid', nullable: false, isPk: true, isFk: true, fkTarget: 'core.tenants(id)', descriptionAr: 'معرف المنشأة' },
      { name: 'id', type: 'uuid', nullable: false, isPk: true, isStd: true, descriptionAr: 'معرف المستخدم' },
      { name: 'email', type: 'citext', nullable: false, descriptionAr: 'البريد الإلكتروني (حالة غير حساسة للأحرف)' },
      { name: 'full_name', type: 'text', nullable: false, descriptionAr: 'الاسم الكامل للمستخدم' },
      { name: 'password_hash', type: 'text', nullable: false, descriptionAr: 'تجزئة كلمة المرور المشفرة (Argon2 / BCrypt)' },
      { name: 'status', type: 'text', nullable: false, descriptionAr: 'حالة الحساب (active / inactive / locked)' },
      { name: 'failed_attempts', type: 'integer', nullable: false, descriptionAr: 'عدد المحاولات الفاشلة' },
      { name: 'locked_until', type: 'timestamptz', nullable: true, descriptionAr: 'وقت انتهاء القفل التلقائي' },
      { name: 'version', type: 'integer', nullable: false, isStd: true, descriptionAr: 'رقم الإصدار' }
    ],
    sampleSql: `SELECT id, email, full_name, status, last_login_at FROM core.users;`
  },
  {
    schema: 'core',
    tableName: 'actions',
    displayNameAr: 'سجل الأفعال المركزي (Action Registry)',
    descriptionAr: 'المصدر الأوحد لكل زر وعملية في النظام بصيغة module.entity.action.',
    hasStdColumns: false,
    hasRls: false,
    triggers: [],
    columns: [
      { name: 'code', type: 'text', nullable: false, isPk: true, descriptionAr: 'كود الفعل (مثال: pos.pay, invoice.approve)' },
      { name: 'module_code', type: 'text', nullable: false, isFk: true, fkTarget: 'core.modules(code)', descriptionAr: 'الموديول التابع له' },
      { name: 'entity_code', type: 'text', nullable: true, isFk: true, descriptionAr: 'الكيان المرتبط' },
      { name: 'label_ar', type: 'text', nullable: false, descriptionAr: 'التسمية بالعربية للزر' },
      { name: 'label_en', type: 'text', nullable: false, descriptionAr: 'التسمية بالإنجليزية' },
      { name: 'type', type: 'text', nullable: false, descriptionAr: 'نوع الفعل (button / menu / api)' },
      { name: 'default_scope', type: 'text', nullable: false, descriptionAr: 'النطاق الافتراضي (all / branch / own)' }
    ],
    sampleSql: `SELECT code, module_code, label_ar, default_scope FROM core.actions;`
  },
  {
    schema: 'core',
    tableName: 'permissions',
    displayNameAr: 'مصفوفة الصلاحيات (Role Permissions)',
    descriptionAr: 'جدول الصلاحيات الفعلي مع تطبيق قاعدة الأمان الافتراضي (Default-Deny). غياب الصف = ممنوع.',
    hasStdColumns: false,
    hasRls: true,
    triggers: [],
    columns: [
      { name: 'tenant_id', type: 'uuid', nullable: false, isPk: true, isFk: true, descriptionAr: 'معرف المنشأة' },
      { name: 'role_id', type: 'uuid', nullable: false, isPk: true, isFk: true, fkTarget: 'core.roles(id)', descriptionAr: 'معرف الدور' },
      { name: 'action_code', type: 'text', nullable: false, isPk: true, isFk: true, fkTarget: 'core.actions(code)', descriptionAr: 'كود الفعل الممنوح' },
      { name: 'scope', type: 'text', nullable: false, descriptionAr: 'نطاق الصلاحية (all / branch / own)' }
    ],
    sampleSql: `SELECT action_code, scope FROM core.permissions WHERE role_id = @roleId;`
  },
  {
    schema: 'core',
    tableName: 'audit_log',
    displayNameAr: 'سجل التدقيق الشامل (Monthly Partitioned Audit)',
    descriptionAr: 'جدول التدقيق المقسم شهرياً مع استعلامات Keyset سريعة وعرض قبل/بعد jsonb.',
    hasStdColumns: false,
    hasRls: true,
    isPartitioned: true,
    partitionStrategy: 'RANGE (occurred_at) شهرياً',
    triggers: [],
    columns: [
      { name: 'tenant_id', type: 'uuid', nullable: false, isPk: true, descriptionAr: 'معرف المنشأة' },
      { name: 'occurred_at', type: 'timestamptz', nullable: false, isPk: true, descriptionAr: 'وقت حدوث العملية' },
      { name: 'id', type: 'uuid', nullable: false, isPk: true, descriptionAr: 'معرف سجل التدقيق' },
      { name: 'user_id', type: 'uuid', nullable: true, descriptionAr: 'المستخدم الذي نفذ العملية' },
      { name: 'table_name', type: 'text', nullable: false, descriptionAr: 'الجدول المتأثر (schema.table)' },
      { name: 'record_id', type: 'uuid', nullable: false, descriptionAr: 'معرف السجل المتأثر' },
      { name: 'operation', type: 'text', nullable: false, descriptionAr: 'العملية (INSERT / UPDATE / DELETE)' },
      { name: 'old_data', type: 'jsonb', nullable: true, descriptionAr: 'بيانات السجل قبل التعديل' },
      { name: 'new_data', type: 'jsonb', nullable: true, descriptionAr: 'بيانات السجل بعد التعديل' },
      { name: 'request_id', type: 'text', nullable: true, descriptionAr: 'رقم تتبع الطلب (Correlation ID)' },
      { name: 'ip', type: 'text', nullable: true, descriptionAr: 'عنوان الـ IP المنفذ' }
    ],
    sampleSql: `SELECT occurred_at, table_name, operation, user_id FROM core.audit_log ORDER BY occurred_at DESC LIMIT 50;`
  },
  {
    schema: 'core',
    tableName: 'outbox_events',
    displayNameAr: 'أحداث الـ Outbox للمعامَلات العابرة للموديولات',
    descriptionAr: 'جدول الـ Outbox لضمان تسليم الأحداث (At-Least-Once Delivery) لـ Hangfire دون تعطيل الـ POS.',
    hasStdColumns: false,
    hasRls: false,
    triggers: [],
    columns: [
      { name: 'id', type: 'uuid', nullable: false, isPk: true, descriptionAr: 'معرف الحدث الفريد' },
      { name: 'tenant_id', type: 'uuid', nullable: false, descriptionAr: 'معرف المنشأة' },
      { name: 'occurred_at', type: 'timestamptz', nullable: false, descriptionAr: 'وقت إنشاء الحدث' },
      { name: 'event_type', type: 'text', nullable: false, descriptionAr: 'نوع الحدث (e.g. sales.order_completed)' },
      { name: 'aggregate_type', type: 'text', nullable: false, descriptionAr: 'نوع الكيان الأصلي' },
      { name: 'aggregate_id', type: 'text', nullable: false, descriptionAr: 'الرقم المرجعي (e.g. INV-10492)' },
      { name: 'payload', type: 'jsonb', nullable: false, descriptionAr: 'بيانات الحدث الكاملة' },
      { name: 'status', type: 'text', nullable: false, descriptionAr: 'الحالة (PENDING / PROCESSED / FAILED / COMPENSATED)' },
      { name: 'attempts', type: 'integer', nullable: false, descriptionAr: 'عدد محاولات المعالجة' }
    ],
    sampleSql: `SELECT id, event_type, aggregate_id, status FROM core.outbox_events WHERE status = 'PENDING';`
  },

  // INVENTORY SCHEMA
  {
    schema: 'inventory',
    tableName: 'items',
    displayNameAr: 'الأصناف والمخزون الحي (Master Items)',
    descriptionAr: 'جدول الأصناف الرئيسي مع الباركود وطريقة حساب التكلفة وحد الطلب وعزل RLS.',
    hasStdColumns: true,
    hasRls: true,
    triggers: ['touch_row', 'audit_trigger', 'realtime_notify'],
    columns: [
      { name: 'tenant_id', type: 'uuid', nullable: false, isPk: true, descriptionAr: 'معرف المنشأة' },
      { name: 'id', type: 'uuid', nullable: false, isPk: true, isStd: true, descriptionAr: 'معرف الصنف' },
      { name: 'code', type: 'text', nullable: false, descriptionAr: 'كود الصنف الداخلي' },
      { name: 'name_ar', type: 'text', nullable: false, descriptionAr: 'اسم الصنف بالعربية' },
      { name: 'name_en', type: 'text', nullable: true, descriptionAr: 'اسم الصنف بالإنجليزية' },
      { name: 'category_id', type: 'uuid', nullable: true, descriptionAr: 'معرف تصنيف الصنف' },
      { name: 'uom_id', type: 'uuid', nullable: false, descriptionAr: 'وحدة القياس الأساسية' },
      { name: 'barcode', type: 'text', nullable: true, descriptionAr: 'باركود الصنف الدولي' },
      { name: 'cost_method', type: 'text', nullable: false, descriptionAr: 'طريقة التكلفة (wac / fifo / standard)' },
      { name: 'sale_price', type: 'numeric(18,4)', nullable: false, descriptionAr: 'سعر بيع التجزئة' },
      { name: 'min_stock', type: 'numeric(18,4)', nullable: false, descriptionAr: 'حد الأمان الأدنى للمخزون' },
      { name: 'is_active', type: 'boolean', nullable: false, descriptionAr: 'هل الصنف نشط؟' },
      { name: 'version', type: 'integer', nullable: false, isStd: true, descriptionAr: 'رقم الإصدار' }
    ],
    sampleSql: `SELECT id, code, name_ar, sale_price, is_active FROM inventory.items;`
  },
  {
    schema: 'inventory',
    tableName: 'stock_movements',
    displayNameAr: 'حركات المخزون التفصيلية (Stock Ledger)',
    descriptionAr: 'جدول حركات المخزون غير القابل للتعديل إطلاقاً (Append-Only) ومقسم بالتاريخ.',
    hasStdColumns: false,
    hasRls: true,
    isPartitioned: true,
    partitionStrategy: 'RANGE (movement_date) سنوي/شهري',
    triggers: [],
    columns: [
      { name: 'tenant_id', type: 'uuid', nullable: false, isPk: true, descriptionAr: 'معرف المنشأة' },
      { name: 'movement_date', type: 'timestamptz', nullable: false, isPk: true, descriptionAr: 'تاريخ ووقت الحركة' },
      { name: 'id', type: 'uuid', nullable: false, isPk: true, descriptionAr: 'معرف الحركة الفريد' },
      { name: 'warehouse_id', type: 'uuid', nullable: false, descriptionAr: 'المخزن المعني' },
      { name: 'item_id', type: 'uuid', nullable: false, descriptionAr: 'الصنف المعني' },
      { name: 'qty', type: 'numeric(18,4)', nullable: false, descriptionAr: 'الكمية (موجبة للإضافة، سالبة للصرف)' },
      { name: 'unit_cost', type: 'numeric(18,4)', nullable: false, descriptionAr: 'تكلفة الوحدة للحركة' },
      { name: 'doc_type', type: 'text', nullable: false, descriptionAr: 'نوع المستند (receive / issue / transfer / sale)' },
      { name: 'doc_id', type: 'uuid', nullable: false, descriptionAr: 'رقم المستند الأصلي' }
    ],
    sampleSql: `SELECT movement_date, item_id, qty, unit_cost, doc_type FROM inventory.stock_movements ORDER BY movement_date DESC;`
  },

  // SALES SCHEMA
  {
    schema: 'sales',
    tableName: 'sales_invoices',
    displayNameAr: 'فواتير المبيعات ونقاط البيع (Sales Invoices)',
    descriptionAr: 'فواتير البيع المعتمدة مع الربط بضريبة القيمة المضافة والإيصال الإلكتروني ETA.',
    hasStdColumns: true,
    hasRls: true,
    triggers: ['touch_row', 'audit_trigger', 'realtime_notify'],
    columns: [
      { name: 'tenant_id', type: 'uuid', nullable: false, isPk: true, descriptionAr: 'معرف المنشأة' },
      { name: 'id', type: 'uuid', nullable: false, isPk: true, isStd: true, descriptionAr: 'معرف الفاتورة' },
      { name: 'invoice_no', type: 'text', nullable: false, descriptionAr: 'الرقم التسلسلي للفاتورة (من number_sequences)' },
      { name: 'invoice_type', type: 'text', nullable: false, descriptionAr: 'نوع الفاتورة (sale / return)' },
      { name: 'branch_id', type: 'uuid', nullable: false, descriptionAr: 'فرع البيع' },
      { name: 'customer_id', type: 'uuid', nullable: true, descriptionAr: 'العميل' },
      { name: 'warehouse_id', type: 'uuid', nullable: false, descriptionAr: 'مخزن الصرف' },
      { name: 'shift_id', type: 'uuid', nullable: true, descriptionAr: 'وردية الكاشير' },
      { name: 'status', type: 'text', nullable: false, descriptionAr: 'الحالة (draft / approved / cancelled)' },
      { name: 'subtotal', type: 'numeric(18,4)', nullable: false, descriptionAr: 'القيمة قبل الضريبة والخصم' },
      { name: 'tax_total', type: 'numeric(18,4)', nullable: false, descriptionAr: 'إجمالي ضريبة القيمة المضافة (14%)' },
      { name: 'total', type: 'numeric(18,4)', nullable: false, descriptionAr: 'القيمة الإجمالية النهائية' },
      { name: 'eta_status', type: 'text', nullable: true, descriptionAr: 'حالة الربط مع الضرائب المصرية (valid/invalid)' }
    ],
    sampleSql: `SELECT invoice_no, total, tax_total, status, eta_status FROM sales.sales_invoices;`
  },

  // ACCOUNTING SCHEMA
  {
    schema: 'accounting',
    tableName: 'journal_entries',
    displayNameAr: 'قيود اليومية العامة (General Ledger Entries)',
    descriptionAr: 'القيود المحاسبية المتوازنة (مدين = دائن) غير القابلة للتعديل بعد الترحيل، وتُعالج بالقيد العكسي.',
    hasStdColumns: true,
    hasRls: true,
    triggers: ['touch_row', 'audit_trigger'],
    columns: [
      { name: 'tenant_id', type: 'uuid', nullable: false, isPk: true, descriptionAr: 'معرف المنشأة' },
      { name: 'id', type: 'uuid', nullable: false, isPk: true, isStd: true, descriptionAr: 'معرف القيد' },
      { name: 'entry_no', type: 'text', nullable: false, descriptionAr: 'رقم القيد التسلسلي' },
      { name: 'entry_date', type: 'date', nullable: false, descriptionAr: 'تاريخ القيد المحاسبي' },
      { name: 'period_id', type: 'uuid', nullable: false, descriptionAr: 'الفترة المالية' },
      { name: 'source_type', type: 'text', nullable: false, descriptionAr: 'مصدر القيد (sales / inventory / payroll / manual)' },
      { name: 'source_id', type: 'uuid', nullable: true, descriptionAr: 'رقم المستند المصدر' },
      { name: 'status', type: 'text', nullable: false, descriptionAr: 'الحالة (draft / posted / reversed)' },
      { name: 'total_debit', type: 'numeric(18,4)', nullable: false, descriptionAr: 'إجمالي المدين' },
      { name: 'total_credit', type: 'numeric(18,4)', nullable: false, descriptionAr: 'إجمالي الدائن' }
    ],
    sampleSql: `SELECT entry_no, entry_date, status, total_debit, total_credit FROM accounting.journal_entries;`
  }
];
