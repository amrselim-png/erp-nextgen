export type AppTab = 
  | 'pos_terminal'
  | 'inventory_ops'
  | 'customers'
  | 'suppliers'
  | 'payment_methods'
  | 'expenses'
  | 'accounting_mapping'
  | 'reservations'
  | 'customer_followups'
  | 'fixed_assets'
  | 'daily_sessions'
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

export interface CustomerRecord {
  id: string;
  code: string;
  name: string;
  phone: string;
  email: string;
  nationalIdOrTax: string;
  creditLimit: number;
  currentBalance: number;
  category: 'VIP' | 'Regular' | 'Corporate' | 'Wholesale';
  branch: string;
  status: 'active' | 'suspended';
  notes: string;
  createdAt: string;
}

export interface SupplierRecord {
  id: string;
  code: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  taxNumber: string;
  commercialRegister: string;
  paymentTermsDays: number;
  currentBalance: number;
  category: 'خامات ومواد أولية' | 'أجهزة ومعدات' | 'مستلزمات طبية وتجميل' | 'صيانة وخدمات' | 'عام';
  status: 'active' | 'inactive';
  notes: string;
  createdAt: string;
}

export interface PaymentMethodRecord {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  type: 'cash' | 'card_pos' | 'bank_transfer' | 'digital_wallet' | 'credit_account';
  commissionPercent: number;
  linkedAccountId: string;
  linkedAccountName: string;
  isActive: boolean;
  requiresReferenceNumber: boolean;
  isExclusiveToCashier: boolean;
  iconName: string;
}

export interface ExpenseRecord {
  id: string;
  expenseNo: string;
  date: string;
  category: 'إيجارات ومرافق' | 'صيانة أجهزة ومعدات' | 'ضيافة وبوفيه' | 'نثريات ومطبوعات' | 'تسويق وإعلانات' | 'انتقالات وبترول';
  amount: number;
  paymentMethodId: string;
  paymentMethodName: string;
  beneficiary: string;
  referenceNo: string;
  branch: string;
  notes: string;
  recordedBy: string;
  status: 'معتمد' | 'قيد المراجعة';
  journalEntryId?: string;
}

export interface BookingRecord {
  id: string;
  bookingNo: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  serviceName: string;
  bookingDate: string;
  bookingTime: string;
  assignedStaff: string;
  branch: string;
  depositAmount: number;
  totalEstimatedAmount: number;
  status: 'مؤكد' | 'قيد الانتظار' | 'مكتمل وتم التشغيل' | 'ملغي';
  notes: string;
}

export interface CustomerFollowupRecord {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  contactDate: string;
  channel: 'اتصال هاتفي' | 'واتساب (WhatsApp)' | 'زيارة مباشرة' | 'بريد إلكتروني';
  purpose: 'متابعة ما بعد الجلسة' | 'تذكير بموعد حجز' | 'تحصيل مديونية' | 'عرض ترويجي وخاص';
  agentName: string;
  summary: string;
  nextFollowupDate: string;
  outcome: 'إيجابي ومهتم' | 'تم تأكيد الحضور' | 'تم السداد' | 'لم يرد / مشغول' | 'غير مهتم';
}

export interface FixedAssetRecord {
  id: string;
  assetCode: string;
  assetName: string;
  category: 'أجهزة ليزر وتجميل' | 'أجهزة فحص وكشف' | 'نقاط بيع وحواسب' | 'سيارات ومعدات نقل' | 'أثاث وديكورات';
  purchaseDate: string;
  purchaseCost: number;
  usefulLifeMonths: number;
  currentBookValue: number;
  accumulatedDepreciation: number;
  branch: string;
  // Dedicated column for machine wear and usage tracking:
  deviceUsageTracker: {
    totalOperatingHours: number;
    totalSessionsExecuted: number;
    maxRatedLifespanHours: number;
    wearPercentage: number;
    lastMaintenanceDate: string;
    nextMaintenanceDueHours: number;
    status: 'ممتاز وعامل' | 'يحتاج صيانة دورية' | 'استهلاك مرتفع';
  };
}

export interface DailySessionRecord {
  id: string;
  sessionNo: string;
  dateTime: string;
  customerId: string;
  customerName: string;
  serviceTitle: string;
  deviceId: string;
  deviceName: string;
  specialistName: string;
  durationMinutes: number;
  roomNumber: string;
  materialsConsumed: string;
  sessionFee: number;
  status: 'منفذة بنجاح' | 'جارية الآن' | 'ملغاة';
  paymentMethod: string;
  notes: string;
  journalEntryGenerated: boolean;
}

export interface AccountingMappingRule {
  id: string;
  transactionType: 'مبيعات الكاشير (POS)' | 'تسجيل مصروف' | 'سداد مورد' | 'تحصيل من عميل' | 'إهلاك أصول شهرية' | 'جلسة تشغيل يومية';
  code: string;
  nameAr: string;
  sourceScreen: string;
  debitAccountCode: string;
  debitAccountName: string;
  creditAccountCode: string;
  creditAccountName: string;
  isStrictExclusiveSource: boolean;
  autoPostEnabled: boolean;
  description: string;
}
