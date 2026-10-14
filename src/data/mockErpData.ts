import { 
  ErpItemRecord, 
  ScreenSchema, 
  RegisteredAction, 
  RegionBenchmark, 
  TenantContext,
  OutboxMessage
} from '../types.ts';

export const TENANTS: TenantContext[] = [
  {
    id: 't_albatros_resorts',
    name: 'Pickalbatros Group - Sharm & Hurghada',
    nameAr: 'مجموعة بيك الباتروس للفنادق والمنتجعات',
    currency: 'EGP',
    branch: 'HRG-MAIN (الغردقة المركز الرئيسي)',
    rlsConfig: "SELECT set_config('app.current_tenant_id', 't_albatros_resorts', true);"
  },
  {
    id: 't_retail_alex',
    name: 'Alexandria Supermarkets Chain',
    nameAr: 'سلسلة أسواق الإسكندرية المركزية',
    currency: 'EGP',
    branch: 'ALX-SMOUHA (فرع سموحة)',
    rlsConfig: "SELECT set_config('app.current_tenant_id', 't_retail_alex', true);"
  },
  {
    id: 't_cairo_clinics',
    name: 'Nile Specialized Healthcare Center',
    nameAr: 'مجمع عيادات النيل التخصصي',
    currency: 'EGP',
    branch: 'CAI-MAADI (فرع المعادي)',
    rlsConfig: "SELECT set_config('app.current_tenant_id', 't_cairo_clinics', true);"
  }
];

export const INITIAL_INVENTORY_ITEM: ErpItemRecord = {
  id: 'ITEM-8821',
  tenant_id: 't_albatros_resorts',
  sku: 'COF-ESP-1000G',
  name_ar: 'بن حبوب إسبريسو كولومبي فاخر (1 كجم)',
  name_en: 'Premium Colombian Espresso Beans (1kg)',
  category: 'F&B Supplies',
  stock_quantity: 145,
  unit_price: 520,
  cost_price: 360,
  status: 'active',
  version: 12,
  updated_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  updated_by: 'amr.selim@pickalbatros.com'
};

export const SCREEN_SCHEMAS: ScreenSchema[] = [
  {
    id: 'schema_inventory_items',
    module: 'inventory',
    tableName: 'inventory.items',
    titleAr: 'دليل الأصناف والمخزون الحي',
    titleEn: 'Live Inventory & Item Master',
    primaryKey: 'id',
    versionKey: 'version',
    keysetColumns: ['created_at', 'id'],
    fields: [
      { name: 'sku', labelAr: 'كود الصنف (SKU)', labelEn: 'SKU Code', type: 'string', required: true, gridWidth: 140 },
      { name: 'name_ar', labelAr: 'اسم الصنف (عربي)', labelEn: 'Item Name (AR)', type: 'string', required: true, gridWidth: 260 },
      { name: 'category', labelAr: 'التصنيف', labelEn: 'Category', type: 'select', required: true, gridWidth: 150, options: [
        { value: 'F&B Supplies', labelAr: 'أغذية ومشروبات', labelEn: 'F&B Supplies' },
        { value: 'Housekeeping', labelAr: 'مهمات نظافة وإشراف', labelEn: 'Housekeeping' },
        { value: 'Maintenance', labelAr: 'قطع غيار وصيانة', labelEn: 'Maintenance' },
        { value: 'Office', labelAr: 'أدوات مكتبية', labelEn: 'Office' }
      ]},
      { name: 'stock_quantity', labelAr: 'الرصيد المتاح', labelEn: 'Available Stock', type: 'number', required: true, min: 0, gridWidth: 130 },
      { name: 'unit_price', labelAr: 'سعر البيع (ج.م)', labelEn: 'Selling Price (EGP)', type: 'currency', required: true, min: 0, gridWidth: 140 },
      { name: 'cost_price', labelAr: 'سعر التكلفة (ج.م)', labelEn: 'Cost Price (EGP)', type: 'currency', required: true, min: 0, gridWidth: 140 },
      { name: 'status', labelAr: 'الحالة التشغيلية', labelEn: 'Status', type: 'badge', required: true, gridWidth: 130, options: [
        { value: 'active', labelAr: 'نشط', labelEn: 'Active', color: 'emerald' },
        { value: 'low_stock', labelAr: 'منخفض', labelEn: 'Low Stock', color: 'amber' },
        { value: 'discontinued', labelAr: 'موقوف', labelEn: 'Discontinued', color: 'rose' }
      ]},
      { name: 'version', labelAr: 'الإصدار (Version)', labelEn: 'Version', type: 'number', readOnly: true, gridWidth: 110 }
    ],
    actions: [
      { key: 'edit', labelAr: 'تعديل الصنف', labelEn: 'Edit Item', icon: 'Edit3', requiredScope: 'branch', minRole: 'branch_manager', endpoint: '/api/v1/generic/inventory.items', method: 'PUT' },
      { key: 'adjust_stock', labelAr: 'تسوية رصيد', labelEn: 'Stock Adjustment', icon: 'PackagePlus', requiredScope: 'branch', minRole: 'branch_manager', endpoint: '/api/v1/modules/inventory/adjust', method: 'POST' },
      { key: 'print_barcode', labelAr: 'طباعة باركود', labelEn: 'Print Barcode', icon: 'Printer', requiredScope: 'self', minRole: 'cashier', endpoint: '/api/v1/modules/inventory/barcode', method: 'POST' },
      { key: 'delete', labelAr: 'تعطيل الصنف', labelEn: 'Deactivate', icon: 'Trash2', requiredScope: 'tenant', minRole: 'super_admin', isDangerous: true, endpoint: '/api/v1/generic/inventory.items', method: 'DELETE' }
    ]
  },
  {
    id: 'schema_sales_orders',
    module: 'sales',
    tableName: 'sales.orders',
    titleAr: 'فواتير المبيعات ونقاط البيع (POS)',
    titleEn: 'Sales Orders & POS Terminal',
    primaryKey: 'id',
    versionKey: 'version',
    keysetColumns: ['order_date', 'id'],
    fields: [
      { name: 'order_number', labelAr: 'رقم الفاتورة', labelEn: 'Invoice #', type: 'string', required: true, gridWidth: 150 },
      { name: 'customer_name', labelAr: 'العميل / الغرفة', labelEn: 'Customer / Room', type: 'string', required: true, gridWidth: 200 },
      { name: 'total_amount', labelAr: 'إجمالي القيمة (ج.م)', labelEn: 'Total (EGP)', type: 'currency', required: true, gridWidth: 150 },
      { name: 'tax_amount', labelAr: 'ضريبة القيمة المضافة', labelEn: 'VAT (14%)', type: 'currency', required: true, gridWidth: 140 },
      { name: 'payment_method', labelAr: 'طريقة الدفع', labelEn: 'Payment Method', type: 'select', required: true, gridWidth: 140, options: [
        { value: 'cash', labelAr: 'نقدي (Cash)', labelEn: 'Cash' },
        { value: 'visa', labelAr: 'بطاقة بنكية (Card)', labelEn: 'Card' },
        { value: 'room_charge', labelAr: 'تحميل على الغرفة', labelEn: 'Room Charge' },
        { value: 'instapay', labelAr: 'إنستاباي (InstaPay)', labelEn: 'InstaPay' }
      ]},
      { name: 'status', labelAr: 'حالة الفاتورة', labelEn: 'Status', type: 'badge', required: true, gridWidth: 130, options: [
        { value: 'completed', labelAr: 'مكتملة ومُسددة', labelEn: 'Completed', color: 'emerald' },
        { value: 'pending', labelAr: 'قيد الانتظار', labelEn: 'Pending', color: 'amber' },
        { value: 'voided', labelAr: 'ملغاة (Void)', labelEn: 'Voided', color: 'rose' }
      ]},
      { name: 'version', labelAr: 'الإصدار (Version)', labelEn: 'Version', type: 'number', readOnly: true, gridWidth: 110 }
    ],
    actions: [
      { key: 'complete_order', labelAr: 'إتمام وسداد', labelEn: 'Complete & Pay', icon: 'CheckCircle2', requiredScope: 'branch', minRole: 'cashier', endpoint: '/api/v1/modules/sales/complete', method: 'POST' },
      { key: 'apply_discount', labelAr: 'تطبيق خصم خاص', labelEn: 'Manager Discount', icon: 'Percent', requiredScope: 'branch', minRole: 'branch_manager', endpoint: '/api/v1/modules/sales/discount', method: 'POST' },
      { key: 'void_invoice', labelAr: 'إلغاء فاتورة', labelEn: 'Void Invoice', icon: 'AlertTriangle', requiredScope: 'branch', minRole: 'super_admin', isDangerous: true, endpoint: '/api/v1/modules/sales/void', method: 'POST' }
    ]
  }
];

export const INITIAL_REGISTERED_ACTIONS: RegisteredAction[] = [
  {
    id: 'act-001',
    module: 'core',
    entityCode: 'core.tenant',
    actionCode: 'tenant.settings.save',
    titleAr: 'حفظ إعدادات المنشأة والضرائب',
    titleEn: 'Save Tenant Settings',
    scope: 'all',
    allowedRoles: ['super_admin'],
    httpMethod: 'POST',
    endpoint: '/api/v1/modules/core/tenant/settings',
    isAudited: true,
    introducedInPhase: 1
  },
  {
    id: 'act-002',
    module: 'core',
    entityCode: 'core.branch',
    actionCode: 'branch.create',
    titleAr: 'إضافة فرع جديد للـ Tenant',
    titleEn: 'Create Branch',
    scope: 'all',
    allowedRoles: ['super_admin'],
    httpMethod: 'POST',
    endpoint: '/api/v1/modules/core/branch/create',
    isAudited: true,
    introducedInPhase: 1
  },
  {
    id: 'act-003',
    module: 'core',
    entityCode: 'core.user',
    actionCode: 'user.create',
    titleAr: 'إنشاء مستخدم جديد وإرسال دعوة',
    titleEn: 'Create User & Invite',
    scope: 'all',
    allowedRoles: ['super_admin', 'branch_manager'],
    httpMethod: 'POST',
    endpoint: '/api/v1/modules/core/user/create',
    isAudited: true,
    introducedInPhase: 1
  },
  {
    id: 'act-004',
    module: 'core',
    entityCode: 'core.user',
    actionCode: 'user.toggle',
    titleAr: 'تعطيل أو تفعيل المستخدم',
    titleEn: 'Toggle User Status',
    scope: 'all',
    allowedRoles: ['super_admin'],
    httpMethod: 'POST',
    endpoint: '/api/v1/modules/core/user/toggle',
    isAudited: true,
    introducedInPhase: 1
  },
  {
    id: 'act-005',
    module: 'core',
    entityCode: 'core.role',
    actionCode: 'role.create',
    titleAr: 'إنشاء أو نسخ دور جديد',
    titleEn: 'Create or Clone Role',
    scope: 'all',
    allowedRoles: ['super_admin'],
    httpMethod: 'POST',
    endpoint: '/api/v1/modules/core/role/create',
    isAudited: true,
    introducedInPhase: 1
  },
  {
    id: 'act-006',
    module: 'core',
    entityCode: 'core.role',
    actionCode: 'role.permissions.save',
    titleAr: 'حفظ مصفوفة الصلاحيات وبث NOTIFY',
    titleEn: 'Save Permissions & NOTIFY',
    scope: 'all',
    allowedRoles: ['super_admin'],
    httpMethod: 'POST',
    endpoint: '/api/v1/modules/core/role/permissions',
    isAudited: true,
    introducedInPhase: 1
  },
  {
    id: 'act-007',
    module: 'core',
    entityCode: 'core.module',
    actionCode: 'module.enable',
    titleAr: 'تفعيل موديول وفحص الاعتماديات',
    titleEn: 'Enable Module & Dependencies',
    scope: 'all',
    allowedRoles: ['super_admin'],
    httpMethod: 'POST',
    endpoint: '/api/v1/modules/core/module/enable',
    isAudited: true,
    introducedInPhase: 1
  },
  {
    id: 'act-008',
    module: 'core',
    entityCode: 'core.audit',
    actionCode: 'audit.export',
    titleAr: 'تصدير سجل التدقيق عبر Job خلفي',
    titleEn: 'Export Audit Log Job',
    scope: 'all',
    allowedRoles: ['super_admin', 'auditor'],
    httpMethod: 'POST',
    endpoint: '/api/v1/modules/core/audit/export',
    isAudited: true,
    isNew: true, // علامة جديد
    introducedInPhase: 1
  },
  {
    id: 'act-009',
    module: 'inventory',
    entityCode: 'inventory.item',
    actionCode: 'item.import',
    titleAr: 'استيراد أصناف من Excel والتحقق',
    titleEn: 'Batch Import Items',
    scope: 'branch',
    allowedRoles: ['super_admin', 'branch_manager'],
    httpMethod: 'POST',
    endpoint: '/api/v1/modules/inventory/item/import',
    isAudited: true,
    isNew: true, // علامة جديد
    introducedInPhase: 3
  },
  {
    id: 'act-010',
    module: 'inventory',
    entityCode: 'inventory.stock',
    actionCode: 'stock.receive',
    titleAr: 'إذن استلام بضاعة وإضافة مخزون',
    titleEn: 'Receive Stock & Increment',
    scope: 'branch',
    allowedRoles: ['super_admin', 'branch_manager'],
    httpMethod: 'POST',
    endpoint: '/api/v1/modules/inventory/stock/receive',
    isAudited: true,
    introducedInPhase: 3
  },
  {
    id: 'act-011',
    module: 'sales',
    entityCode: 'sales.pos',
    actionCode: 'pos.pay',
    titleAr: 'سداد الفاتورة وإرسال إيصال ETA',
    titleEn: 'Complete POS Payment & Send ETA',
    scope: 'branch',
    allowedRoles: ['super_admin', 'branch_manager', 'cashier'],
    httpMethod: 'POST',
    endpoint: '/api/v1/modules/sales/pos/pay',
    isAudited: true,
    introducedInPhase: 3
  },
  {
    id: 'act-012',
    module: 'sales',
    entityCode: 'sales.invoice',
    actionCode: 'invoice.approve',
    titleAr: 'اعتماد الفاتورة وتوليد القيد المالي',
    titleEn: 'Approve Invoice & Post Ledger',
    scope: 'branch',
    allowedRoles: ['super_admin', 'branch_manager'],
    httpMethod: 'POST',
    endpoint: '/api/v1/modules/sales/invoice/approve',
    isAudited: true,
    introducedInPhase: 3
  },
  {
    id: 'act-013',
    module: 'accounting',
    entityCode: 'accounting.journal',
    actionCode: 'journal.post',
    titleAr: 'ترحيل قيد اليومية العام والتأكد من التوازن',
    titleEn: 'Post Journal Entry',
    scope: 'all',
    allowedRoles: ['super_admin', 'accountant'],
    httpMethod: 'POST',
    endpoint: '/api/v1/modules/accounting/journal/post',
    isAudited: true,
    introducedInPhase: 3
  },
  {
    id: 'act-014',
    module: 'hr',
    entityCode: 'hr.payroll',
    actionCode: 'payroll.run',
    titleAr: 'تشغيل احتساب مسير المرتبات',
    titleEn: 'Run Payroll Calculation',
    scope: 'all',
    allowedRoles: ['super_admin'],
    httpMethod: 'POST',
    endpoint: '/api/v1/modules/hr/payroll/run',
    isAudited: true,
    isNew: true, // علامة جديد
    introducedInPhase: 3
  },
  {
    id: 'act-015',
    module: 'manufacturing',
    entityCode: 'manufacturing.bom',
    actionCode: 'bom.approve',
    titleAr: 'اعتماد شجرة المنتج (BOM) للتصنيع',
    titleEn: 'Approve BOM for Production',
    scope: 'all',
    allowedRoles: ['super_admin'],
    httpMethod: 'POST',
    endpoint: '/api/v1/modules/manufacturing/bom/approve',
    isAudited: true,
    introducedInPhase: 4
  },
  {
    id: 'act-016',
    module: 'clinic',
    entityCode: 'clinic.patient',
    actionCode: 'patient.create',
    titleAr: 'فتح ملف طبي لمريض جديد',
    titleEn: 'Create Patient Medical File',
    scope: 'all',
    allowedRoles: ['super_admin', 'branch_manager'],
    httpMethod: 'POST',
    endpoint: '/api/v1/modules/clinic/patient/create',
    isAudited: true,
    introducedInPhase: 4
  }
];

export const REGION_BENCHMARKS: RegionBenchmark[] = [
  {
    regionCode: 'europe-west3 (Frankfurt)',
    provider: 'GCP / AWS (eu-central-1) / Supabase / Neon',
    nameAr: 'أوروبا الوسطى (فرانكفورت - ألمانيا)',
    nameEn: 'Europe Central (Frankfurt, Germany)',
    cairoPingMs: 46,
    alexPingMs: 41,
    cablePath: 'كابلات الإسكندرية البحرية (SeaMeWe-4 / AAE-1 / FLAG) ثم مرسيليا/إيطاليا براً إلى فرانكفورت',
    stabilityScore: 98,
    status: 'recommended',
    notesAr: 'الخيار الذهبي والأعلى ثباتاً لجمهورية مصر العربية! مسار الفايبر الدولي مباشر بدون تحويلات داخلية معقدة. أقل زمن تذبذب (Jitter < 3ms). متوفر لدى كل مزودي السحابة الكبرى.',
    postgresOfferings: [
      { name: 'Supabase Managed Postgres (Frankfurt)', managed: true, poolingSupport: 'Supavisor مدمج (Port 6543)', coldStartRisk: 'zero', pricePerMonth: '$25/mo Pro' },
      { name: 'AWS RDS Aurora Postgres (eu-central-1)', managed: true, poolingSupport: 'RDS Proxy أصلي', coldStartRisk: 'zero', pricePerMonth: '$45/mo' },
      { name: 'Neon Serverless (Frankfurt)', managed: true, poolingSupport: 'Connection Pooling مدمج', coldStartRisk: 'high', pricePerMonth: '$19/mo (⚠️ تحذير Cold Start)' },
      { name: 'GCP Cloud SQL Postgres (europe-west3)', managed: true, poolingSupport: 'Cloud SQL Auth Proxy', coldStartRisk: 'zero', pricePerMonth: '$40/mo' }
    ]
  },
  {
    regionCode: 'europe-west8 (Milan) / Marseille',
    provider: 'GCP / AWS (eu-south-1) / Scaleway',
    nameAr: 'جنوب أوروبا (ميلانو - إيطاليا / مرسيليا - فرنسا)',
    nameEn: 'Southern Europe (Milan / Marseille)',
    cairoPingMs: 39,
    alexPingMs: 34,
    cablePath: 'أقصر مسافة بحرية مباشرة من محطة الإنزال بأبو تلات / الإسكندرية إلى مرسيليا/صقلية',
    stabilityScore: 94,
    status: 'recommended',
    notesAr: 'أسرع زمن استجابة فيزيائي ممكن من مصر (~35ms من الإسكندرية و ~40ms من القاهرة). العيب الوحيد: خيارات المنصات المدارة (مثل Supabase) قد لا توفر كل مناطق جنوب أوروبا مقارنة بفرانكفورت.',
    postgresOfferings: [
      { name: 'GCP Cloud SQL (europe-west8 Milan)', managed: true, poolingSupport: 'Native Proxy', coldStartRisk: 'zero', pricePerMonth: '$42/mo' },
      { name: 'AWS RDS (eu-south-1 Milan)', managed: true, poolingSupport: 'RDS Proxy', coldStartRisk: 'zero', pricePerMonth: '$48/mo' }
    ]
  },
  {
    regionCode: 'me-central2 (Dammam / Saudi)',
    provider: 'GCP (Dammam) / AWS (me-central-1 UAE / Bahrain)',
    nameAr: 'الشرق الأوسط (الدمام - السعودية / البحرين / دبي)',
    nameEn: 'Middle East (Dammam / Bahrain / UAE)',
    cairoPingMs: 82,
    alexPingMs: 88,
    cablePath: 'مفارقة جغرافية: مسار الإنترنت من مشغلي مصر (TE Data / Vodafone) يمر أحياناً عبر أوروبا ثم يعود للخليج!',
    stabilityScore: 84,
    status: 'caution',
    notesAr: '⚠️ انتبه للمفارقة! رغم القرب الجغرافي، مسارات التوجيه (BGP Peering) بين مصر والخليج تعتمد على كابلات قد تلف عبر محطات أوروبا (مرسيليا) قبل الوصول للدمام أو دبي، مما يرفع الـ RTT إلى 80-110ms ما لم يكن هناك Peering محلي مباشر ومختبر.',
    postgresOfferings: [
      { name: 'GCP Cloud SQL (me-central2 Dammam)', managed: true, poolingSupport: 'Proxy', coldStartRisk: 'zero', pricePerMonth: '$55/mo' },
      { name: 'AWS RDS (me-south-1 Bahrain)', managed: true, poolingSupport: 'RDS Proxy', coldStartRisk: 'zero', pricePerMonth: '$60/mo' }
    ]
  },
  {
    regionCode: 'europe-west2 (London)',
    provider: 'AWS / Azure / GCP',
    nameAr: 'شمال غرب أوروبا (لندن - المملكة المتحدة)',
    nameEn: 'London (UK)',
    cairoPingMs: 65,
    alexPingMs: 60,
    cablePath: 'عبر مضيق جبل طارق والقناة الإنجليزية أو عبر البر الأوروبي',
    stabilityScore: 92,
    status: 'acceptable',
    notesAr: 'مستقرة ولكن البنج أبطأ بـ 15-20ms مقارنة بفرانكفورت وميلانو.',
    postgresOfferings: [
      { name: 'AWS RDS (eu-west-2)', managed: true, poolingSupport: 'RDS Proxy', coldStartRisk: 'zero', pricePerMonth: '$45/mo' }
    ]
  }
];

export const INITIAL_OUTBOX_MESSAGES: OutboxMessage[] = [
  {
    id: 'outbox-901',
    event_type: 'sales.order_completed',
    aggregate_id: 'ORD-2026-10492',
    payload: {
      order_id: 'ORD-2026-10492',
      tenant_id: 't_albatros_resorts',
      branch_id: 'HRG-MAIN',
      items: [{ sku: 'COF-ESP-1000G', qty: 2, unit_price: 520 }],
      total_amount: 1040,
      vat_amount: 145.60,
      payment_method: 'room_charge',
      guest_room: 'Villa-204'
    },
    status: 'PROCESSED',
    retry_count: 0,
    created_at: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    processed_at: new Date(Date.now() - 1000 * 60 * 7).toISOString()
  },
  {
    id: 'outbox-902',
    event_type: 'inventory.stock_deducted',
    aggregate_id: 'ORD-2026-10492',
    payload: {
      order_id: 'ORD-2026-10492',
      sku: 'COF-ESP-1000G',
      deducted_qty: 2,
      remaining_stock: 143,
      warehouse: 'HRG-FNB-WH01'
    },
    status: 'PROCESSED',
    retry_count: 0,
    created_at: new Date(Date.now() - 1000 * 60 * 7).toISOString(),
    processed_at: new Date(Date.now() - 1000 * 60 * 6).toISOString()
  },
  {
    id: 'outbox-903',
    event_type: 'accounting.journal_posted',
    aggregate_id: 'ORD-2026-10492',
    payload: {
      journal_id: 'JV-2026-8812',
      lines: [
        { account: '1105 - نزلاء الغرف المدينة (Guest Ledger)', debit: 1185.60, credit: 0 },
        { account: '4101 - إيراد مطاعم وكافيهات (F&B Revenue)', debit: 0, credit: 1040 },
        { account: '2201 - ضريبة القيمة المضافة الدائنة (VAT Payable)', debit: 0, credit: 145.60 }
      ]
    },
    status: 'PROCESSED',
    retry_count: 0,
    created_at: new Date(Date.now() - 1000 * 60 * 6).toISOString(),
    processed_at: new Date(Date.now() - 1000 * 60 * 5).toISOString()
  }
];

export const CODE_SNIPPETS = {
  dotnetGenericApi: `// Generic Data API Minimal Endpoint (.NET 10 + Dapper + Metadata)
app.MapPut("/api/v1/generic/{module}.{table}", async (
    string module, 
    string table, 
    [FromBody] JsonElement payload, 
    [FromServices] IMetadataRegistry metadata,
    [FromServices] NpgsqlConnection db,
    HttpContext ctx) => 
{
    var tenantId = ctx.User.GetTenantId();
    var schema = metadata.GetSchema(module, table);
    
    // Extract row ID and current version for Optimistic Locking
    var id = payload.GetProperty(schema.PrimaryKey).GetString();
    var clientVersion = payload.GetProperty("version").GetInt32();
    
    await db.OpenAsync();
    await using var tx = await db.BeginTransactionAsync();
    
    // Enforce Tenant RLS within the specific transaction session
    await db.ExecuteAsync("SELECT set_config('app.current_tenant_id', @tenantId, true);", 
        new { tenantId }, tx);
    
    // Dynamic Parameterized SQL (Zero SQL injection via metadata validation)
    var updateSql = $@"
        UPDATE {schema.FullTableName}
        SET {schema.BuildUpdateAssignments(payload)},
            version = version + 1,
            updated_at = NOW(),
            updated_by = @userId
        WHERE {schema.PrimaryKey} = @id AND version = @clientVersion
        RETURNING version;";
        
    var newVersion = await db.ExecuteScalarAsync<int?>(updateSql, 
        new { id, clientVersion, userId = ctx.User.GetUserId() }, tx);
        
    if (newVersion is null)
    {
        // 409 Conflict: Row was modified concurrently!
        await tx.RollbackAsync();
        return Results.Conflict(new { 
            message = "Concurrency conflict: record updated by another operator", 
            requestedVersion = clientVersion 
        });
    }
    
    // Fire Postgres NOTIFY so SignalR broadcast to other operators
    var notifyPayload = JsonSerializer.Serialize(new { 
        table = schema.FullTableName, 
        id, 
        version = newVersion.Value,
        client_id = ctx.Request.Headers["X-Client-Id"].ToString()
    });
    
    await db.ExecuteAsync("SELECT pg_notify('table_changes', @notifyPayload);", 
        new { notifyPayload }, tx);
        
    await tx.CommitAsync();
    return Results.Ok(new { success = true, version = newVersion.Value });
});`,

  postgresRls: `-- 1. تفعيل حماية الصفوف Row-Level Security
ALTER TABLE inventory.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales.orders ENABLE ROW LEVEL SECURITY;

-- 2. إجبار تفعيل الـ RLS حتى على مُنشئي الجداول (Force RLS)
ALTER TABLE inventory.items FORCE ROW LEVEL SECURITY;

-- 3. سياسة العزل الصارم لكل Tenant بالاعتماد على متغير الجلسة
CREATE POLICY tenant_isolation_policy ON inventory.items
FOR ALL
USING (tenant_id = current_setting('app.current_tenant_id', true))
WITH CHECK (tenant_id = current_setting('app.current_tenant_id', true));

-- 4. عمود الإصدار Optimistic Concurrency + فهرس متعدد يبدأ بالـ Tenant
CREATE INDEX idx_items_tenant_sku ON inventory.items (tenant_id, sku);
CREATE INDEX idx_items_keyset ON inventory.items (tenant_id, created_at DESC, id DESC);`,

  signalRNotifier: `// Background Service: Npgsql LISTEN -> SignalR Hub
public class PostgresRealtimeBridge : BackgroundService
{
    private readonly IHubContext<ErpNotificationHub> _hub;
    private readonly string _connectionString;

    public PostgresRealtimeBridge(IHubContext<ErpNotificationHub> hub, IConfiguration config)
    {
        _hub = hub;
        _connectionString = config.GetConnectionString("Postgres");
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await using var conn = new NpgsqlConnection(_connectionString);
        await conn.OpenAsync(stoppingToken);

        conn.Notification += async (o, e) =>
        {
            var eventData = JsonSerializer.Deserialize<RealtimeSyncPayload>(e.Payload);
            // البث الفوري لمجموعة الـ Tenant فقط لضمان العزل والسرعة
            await _hub.Clients.Group(eventData.TenantId)
                      .SendAsync("RecordUpdated", eventData, stoppingToken);
        };

        await using var cmd = new NpgsqlCommand("LISTEN table_changes;", conn);
        await cmd.ExecuteNonQueryAsync(stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            await conn.WaitAsync(stoppingToken); // خفيف جداً على الـ CPU
        }
    }
}`
};
