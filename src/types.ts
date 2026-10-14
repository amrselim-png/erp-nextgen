export type AppTab = 
  | 'pos_terminal'
  | 'inventory_ops'
  | 'purchasing'
  | 'accounting_ledger'
  | 'hr_payroll'
  | 'manufacturing_bom'
  | 'medical_clinics'
  | 'eta_einvoice'
  | 'admin_management'
  | 'metadata_engine' 
  | 'action_registry' 
  | 'db_schema_migrations'
  | 'backend_code'
  | 'sync_simulator' 
  | 'accounting_outbox' 
  | 'keyset_benchmark' 
  | 'recommendations' 
  | 'ci_guardrails'
  | 'overview';

export type UserRole = 'super_admin' | 'branch_manager' | 'cashier' | 'accountant' | 'auditor';

export interface ColumnDefinition {
  name: string;
  type: string;
  nullable: boolean;
  isPk?: boolean;
  isFk?: boolean;
  fkTarget?: string;
  isStd?: boolean;
  descriptionAr: string;
}

export interface DatabaseTableDefinition {
  schema: 'core' | 'inventory' | 'sales' | 'purchasing' | 'accounting' | 'hr' | 'manufacturing' | 'clinic' | 'reporting';
  tableName: string;
  displayNameAr: string;
  descriptionAr: string;
  hasStdColumns: boolean;
  hasRls: boolean;
  isPartitioned?: boolean;
  partitionStrategy?: string;
  triggers: string[];
  columns: ColumnDefinition[];
  sampleSql: string;
}

export interface SqlMigrationScript {
  version: string;
  filename: string;
  titleAr: string;
  titleEn: string;
  role: 'erp_owner' | 'erp_app' | 'erp_readonly';
  phase: number;
  descriptionAr: string;
  sqlContent: string;
}

export interface TenantContext {
  id: string;
  name: string;
  nameAr: string;
  currency: string;
  branch: string;
  rlsConfig: string;
}

export interface ErpItemRecord {
  id: string;
  tenant_id: string;
  sku: string;
  name_ar: string;
  name_en: string;
  category: string;
  stock_quantity: number;
  unit_price: number;
  cost_price: number;
  status: 'active' | 'low_stock' | 'discontinued';
  version: number;
  updated_at: string;
  updated_by: string;
}

export interface RealtimeEventPayload {
  id: string;
  timestamp: string;
  table: string;
  record_id: string;
  version: number;
  client_id: string;
  author: string;
  changes: Record<string, { old: any; new: any }>;
  channel: string;
}

export interface FieldMetadata {
  name: string;
  labelAr: string;
  labelEn: string;
  type: 'string' | 'number' | 'currency' | 'badge' | 'date' | 'select' | 'boolean';
  required?: boolean;
  readOnly?: boolean;
  options?: { value: string; labelAr: string; labelEn: string; color?: string }[];
  min?: number;
  max?: number;
  regex?: string;
  gridWidth?: number;
  default_value?: any;
}

export interface ActionMetadata {
  key: string;
  labelAr: string;
  labelEn: string;
  icon: string;
  requiredScope: 'tenant' | 'branch' | 'self';
  minRole: UserRole;
  isDangerous?: boolean;
  endpoint: string;
  method: 'POST' | 'PUT' | 'DELETE' | 'GET';
}

export interface ScreenSchema {
  id: string;
  module: string;
  tableName: string;
  titleAr: string;
  titleEn: string;
  primaryKey: string;
  versionKey: string;
  fields: FieldMetadata[];
  actions: ActionMetadata[];
  keysetColumns: string[];
}

export interface RegisteredAction {
  id: string;
  module: string;
  entityCode?: string;
  actionCode: string;
  titleAr: string;
  titleEn: string;
  scope: 'all' | 'branch' | 'self' | 'tenant';
  allowedRoles: UserRole[];
  httpMethod: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  isAudited: boolean;
  isNew?: boolean;
  introducedInPhase: 1 | 2 | 3 | 4 | 5;
}

export interface RegionBenchmark {
  regionCode: string;
  provider: string;
  nameAr: string;
  nameEn: string;
  cairoPingMs: number;
  alexPingMs: number;
  cablePath: string;
  stabilityScore: number;
  status: 'recommended' | 'acceptable' | 'caution';
  notesAr: string;
  postgresOfferings: {
    name: string;
    managed: boolean;
    poolingSupport: string;
    coldStartRisk: 'zero' | 'low' | 'high';
    pricePerMonth: string;
  }[];
}

export interface OutboxMessage {
  id: string;
  event_type: string;
  aggregate_id: string;
  payload: Record<string, any>;
  status: 'PENDING' | 'IN_FLIGHT' | 'PROCESSED' | 'FAILED' | 'COMPENSATED';
  retry_count: number;
  created_at: string;
  processed_at?: string;
  error?: string;
}
