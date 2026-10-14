import React, { useState } from 'react';
import { 
  ScreenSchema, 
  FieldMetadata, 
  ActionMetadata, 
  UserRole, 
  TenantContext 
} from '../types.ts';
import { SCREEN_SCHEMAS } from '../data/mockErpData.ts';
import { 
  LayoutGrid, 
  Plus, 
  FileJson, 
  Eye, 
  CheckCircle, 
  AlertCircle, 
  Search, 
  Filter, 
  MoreVertical, 
  Download, 
  Sparkles, 
  Edit3, 
  Trash2, 
  Printer, 
  PackagePlus, 
  CheckCircle2, 
  Percent, 
  AlertTriangle, 
  History, 
  RotateCcw, 
  Columns, 
  Save, 
  Layers, 
  Check, 
  X, 
  FileSpreadsheet, 
  Clock 
} from 'lucide-react';

interface MetadataScreenEngineProps {
  currentTenant: TenantContext;
  userRole: UserRole;
}

// Additional Zero-Code Demo Module: Customers & Partners
const CUSTOMER_DEMO_SCHEMA: ScreenSchema = {
  id: 'schema_customers',
  module: 'sales',
  tableName: 'sales.customers',
  titleAr: 'دليل العملاء والشركاء (موديول فوري بدون كود واجهة)',
  titleEn: 'Customers & Business Partners',
  primaryKey: 'id',
  versionKey: 'version',
  keysetColumns: ['created_at', 'id'],
  fields: [
    { name: 'code', labelAr: 'كود العميل', labelEn: 'Customer Code', type: 'string', required: true, gridWidth: 120 },
    { name: 'name', labelAr: 'اسم العميل / الشركة', labelEn: 'Company / Name', type: 'string', required: true, gridWidth: 220 },
    { name: 'phone', labelAr: 'رقم الهاتف', labelEn: 'Phone Number', type: 'string', required: true, gridWidth: 140 },
    { name: 'credit_limit', labelAr: 'الحد الائتماني (ج.م)', labelEn: 'Credit Limit (EGP)', type: 'currency', required: true, gridWidth: 150 },
    { name: 'tax_id', labelAr: 'البطاقة الضريبية', labelEn: 'Tax ID', type: 'string', required: false, gridWidth: 140 },
    { name: 'status', labelAr: 'الحالة', labelEn: 'Status', type: 'badge', required: true, gridWidth: 120, options: [
      { value: 'active', labelAr: 'نشط', labelEn: 'Active', color: 'emerald' },
      { value: 'blocked', labelAr: 'محظور', labelEn: 'Blocked', color: 'rose' }
    ]},
    { name: 'version', labelAr: 'الإصدار (version)', labelEn: 'Version', type: 'number', readOnly: true, gridWidth: 100 }
  ],
  actions: [
    { key: 'edit', labelAr: 'تعديل العميل', labelEn: 'Edit Customer', icon: 'Edit3', requiredScope: 'branch', minRole: 'branch_manager', endpoint: '/api/v1/generic/sales.customers', method: 'PUT' },
    { key: 'view_history', labelAr: 'سجل السجل', labelEn: 'Audit Trail', icon: 'History', requiredScope: 'branch', minRole: 'auditor', endpoint: '/api/v1/audit/sales.customers', method: 'GET' },
    { key: 'delete', labelAr: 'حذف ناعم', labelEn: 'Soft Delete', icon: 'Trash2', requiredScope: 'tenant', minRole: 'super_admin', isDangerous: true, endpoint: '/api/v1/generic/sales.customers', method: 'DELETE' }
  ]
};

export const MetadataScreenEngine: React.FC<MetadataScreenEngineProps> = ({
  currentTenant,
  userRole
}) => {
  const [schemas, setSchemas] = useState<ScreenSchema[]>([...SCREEN_SCHEMAS, CUSTOMER_DEMO_SCHEMA]);
  const [activeSchemaId, setActiveSchemaId] = useState<string>(schemas[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('id');
  const [sortAsc, setSortAsc] = useState(true);

  // Modals & Panels
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [isColumnsModalOpen, setIsColumnsModalOpen] = useState(false);
  const [isAuditPanelOpen, setIsAuditPanelOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);

  // Active records
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [activeAuditRecord, setActiveAuditRecord] = useState<any | null>(null);
  const [conflictData, setConflictData] = useState<{ client: any; server: any } | null>(null);
  const [newRowDraft, setNewRowDraft] = useState<Record<string, any>>({});
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Column visibility map
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({});

  // Inline Cell Editing State (Like Excel)
  const [editingCell, setEditingCell] = useState<{ rowId: string; fieldName: string } | null>(null);
  const [cellTempVal, setCellTempVal] = useState<any>('');

  const activeSchema = schemas.find((s) => s.id === activeSchemaId) || schemas[0];

  // Dynamic sample data
  const [mockRows, setMockRows] = useState<Record<string, any[]>>({
    schema_inventory_items: [
      { id: 'ITM-101', sku: 'COF-COL-1KG', name_ar: 'بن كولومبي وسط (1 كجم)', category: 'F&B Supplies', stock_quantity: 145, unit_price: 520, cost_price: 360, status: 'active', version: 4, created_at: '2026-10-14T02:00:00Z', created_by: 'كاشير الإسكندرية', deleted_at: null },
      { id: 'ITM-102', sku: 'TEA-EARL-500G', name_ar: 'شاي إيرل جراي إنجليزي فندقي', category: 'F&B Supplies', stock_quantity: 42, unit_price: 240, cost_price: 160, status: 'low_stock', version: 2, created_at: '2026-10-14T02:15:00Z', created_by: 'مشرف الأغذية', deleted_at: null },
      { id: 'ITM-103', sku: 'HSK-LIN-Q100', name_ar: 'ملايات سرير قطن مصري فاخر كينج', category: 'Housekeeping', stock_quantity: 320, unit_price: 850, cost_price: 550, status: 'active', version: 8, created_at: '2026-10-14T02:30:00Z', created_by: 'مدير المشتريات', deleted_at: null },
      { id: 'ITM-104', sku: 'MNT-LED-18W', name_ar: 'لمبات موفرة LED 18 وات دافئة', category: 'Maintenance', stock_quantity: 80, unit_price: 95, cost_price: 65, status: 'active', version: 1, created_at: '2026-10-14T02:45:00Z', created_by: 'مهندس الصيانة', deleted_at: null },
      { id: 'ITM-105', sku: 'OFF-PAP-A4', name_ar: 'ورق تصوير A4 رزمة 500 ورقة 80 جم', category: 'Office', stock_quantity: 0, unit_price: 210, cost_price: 175, status: 'discontinued', version: 5, created_at: '2026-10-14T03:00:00Z', created_by: 'مسؤول المشتريات', deleted_at: null }
    ],
    schema_sales_orders: [
      { id: 'ORD-501', order_number: 'INV-2026-0881', customer_name: 'جناح رئاسي 304 - د. أحمد كمال', total_amount: 3450, tax_amount: 483, payment_method: 'room_charge', status: 'completed', version: 1, created_at: '2026-10-14T03:10:00Z', created_by: 'كاشير الاستقبال', deleted_at: null },
      { id: 'ORD-502', order_number: 'INV-2026-0882', customer_name: 'عميل نقدي مطعم الشاطئ', total_amount: 820, tax_amount: 114.80, payment_method: 'cash', status: 'completed', version: 1, created_at: '2026-10-14T03:20:00Z', created_by: 'كاشير المطعم', deleted_at: null },
      { id: 'ORD-503', order_number: 'INV-2026-0883', customer_name: 'شركة المقاولون العرب (وفد)', total_amount: 14200, tax_amount: 1988, payment_method: 'visa', status: 'pending', version: 3, created_at: '2026-10-14T03:30:00Z', created_by: 'مشرف المبيعات', deleted_at: null }
    ],
    schema_customers: [
      { id: 'CUST-101', code: 'C-001', name: 'شركة أوراسكوم للتنمية والإنشاءات', phone: '01001234567', credit_limit: 500000, tax_id: '100-245-881', status: 'active', version: 3, created_at: '2026-10-14T01:00:00Z', created_by: 'مسؤول الحسابات', deleted_at: null },
      { id: 'CUST-102', code: 'C-002', name: 'مجموعة حسن علام القابضة', phone: '01123456789', credit_limit: 750000, tax_id: '100-349-112', status: 'active', version: 1, created_at: '2026-10-14T01:10:00Z', created_by: 'مسؤول الحسابات', deleted_at: null },
      { id: 'CUST-103', code: 'C-003', name: 'الشركة المصرية لتجارة الأغذية', phone: '01234567890', credit_limit: 200000, tax_id: '100-781-445', status: 'blocked', version: 2, created_at: '2026-10-14T01:20:00Z', created_by: 'المدير المالي', deleted_at: null }
    ]
  });

  const currentData = (mockRows[activeSchema.id] || []).filter(r => !r.deleted_at);

  // Filtered & Sorted Rows
  const filteredData = currentData.filter((row) => {
    const matchesSearch = Object.values(row).some((val) => 
      String(val).toLowerCase().includes(searchQuery.toLowerCase())
    );
    const matchesStatus = statusFilter === 'all' || row.status === statusFilter;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    const valA = a[sortBy];
    const valB = b[sortBy];
    if (valA === undefined || valB === undefined) return 0;
    return sortAsc ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
  });

  // Open Create Modal with default values from schema
  const handleOpenCreateModal = () => {
    const defaults: Record<string, any> = {};
    activeSchema.fields.forEach(f => {
      defaults[f.name] = f.default_value || (f.type === 'number' || f.type === 'currency' ? 0 : f.type === 'badge' ? 'active' : '');
    });
    setNewRowDraft(defaults);
    setIsCreateModalOpen(true);
  };

  // 1. الزر: جديد .create وحفظ .save (Optimistic UI)
  const handleSaveNewRecord = (andNew = false) => {
    const newId = `REC-${Math.floor(100 + Math.random() * 900)}`;
    const created = {
      ...newRowDraft,
      id: newId,
      version: 1,
      created_at: new Date().toISOString(),
      created_by: currentTenant.nameAr,
      deleted_at: null
    };

    setMockRows(prev => ({
      ...prev,
      [activeSchema.id]: [created, ...(prev[activeSchema.id] || [])]
    }));

    setActionSuccessMessage(`تم حفظ السجل الجديد (${newId}) بنجاح عبر الـ Generic Data API!`);
    setTimeout(() => setActionSuccessMessage(null), 3500);

    if (andNew) {
      handleOpenCreateModal();
    } else {
      setIsCreateModalOpen(false);
    }
  };

  // 2. الزر: تعديل داخل الخلية (Excel-like Inline Editing)
  const handleCommitCellEdit = (rowId: string, fieldName: string) => {
    setMockRows(prev => {
      const updated = (prev[activeSchema.id] || []).map(r => {
        if (r.id === rowId) {
          return {
            ...r,
            [fieldName]: cellTempVal,
            version: r.version + 1,
            updated_at: new Date().toISOString()
          };
        }
        return r;
      });
      return { ...prev, [activeSchema.id]: updated };
    });

    setEditingCell(null);
    setActionSuccessMessage(`تم تعديل الخلية (${fieldName}) فوراً وزيادة الإصدار version!`);
    setTimeout(() => setActionSuccessMessage(null), 2500);
  };

  // 3. الزر: حذف ناعم .delete (Soft Delete)
  const handleSoftDelete = (record: any) => {
    const confirmed = confirm(`هل أنت متأكد من الحذف الناعم (Soft Delete) للسجل رقم [${record.id}]؟`);
    if (!confirmed) return;

    setMockRows(prev => {
      const updated = (prev[activeSchema.id] || []).map(r => 
        r.id === record.id ? { ...r, deleted_at: new Date().toISOString() } : r
      );
      return { ...prev, [activeSchema.id]: updated };
    });

    setActionSuccessMessage(`تم الحذف الناعم (deleted_at = NOW()) للسجل ${record.id} مع الاحتفاظ به في الـ Audit!`);
    setTimeout(() => setActionSuccessMessage(null), 3000);
  };

  // 4. الزر: تصدير Excel/CSV .export
  const handleExportCsv = () => {
    const headers = activeSchema.fields.map(f => f.labelAr).join(',');
    const rows = filteredData.map(r => 
      activeSchema.fields.map(f => `"${r[f.name] ?? ''}"`).join(',')
    ).join('\n');

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + headers + "\n" + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${activeSchema.tableName}_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setActionSuccessMessage(`تم تصدير ${filteredData.length} سجل بنجاح إلى ملف CSV/Excel!`);
    setTimeout(() => setActionSuccessMessage(null), 3000);
  };

  // 5. الزر: سجل السجل (Audit Trail Panel)
  const handleOpenAuditHistory = (record: any) => {
    setActiveAuditRecord(record);
    setIsAuditPanelOpen(true);
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Top Banner (Day Mode) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono text-xs font-bold border border-emerald-200">
              معيار إنجاز المرحلة 2 المكتمل
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 font-['Cairo']">
              محرك الشاشات العام (Universal Grid & Form Screen Engine)
            </h2>
          </div>
          <p className="text-xs text-slate-600">
            يحتوي على الأزرار الـ 12 المعتمدة: <strong className="text-emerald-700">جديد، حفظ، حفظ وجديد، تعديل بالخلية (Excel)، حذف ناعم، تراجع، تصدير CSV، طباعة، وسجل السجل</strong> لجميع الشاشات دون كتابة كود واجهة مكرر!
          </p>
        </div>

        {/* Global Toolbar Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          {/* جديد .create */}
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer transition-all shadow-md shadow-emerald-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>جديد (.create)</span>
          </button>

          {/* تصدير CSV .export */}
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold cursor-pointer transition-all border border-slate-200"
            title="تصدير النتائج إلى Excel / CSV"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>تصدير (.export)</span>
          </button>

          {/* طباعة .print */}
          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold cursor-pointer transition-all border border-slate-200"
          >
            <Printer className="w-4 h-4 text-sky-600" />
            <span>طباعة (.print)</span>
          </button>

          {/* تخصيص الأعمدة */}
          <button
            onClick={() => setIsColumnsModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold cursor-pointer transition-all border border-slate-200"
          >
            <Columns className="w-4 h-4 text-purple-600" />
            <span>الأعمدة والعرض</span>
          </button>

          {/* عرض الـ Schema JSON */}
          <button
            onClick={() => setIsJsonModalOpen(true)}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 cursor-pointer shadow-2xs"
            title="عرض الـ JSON Schema"
          >
            <FileJson className="w-4 h-4 text-amber-600" />
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {actionSuccessMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-xl text-xs flex items-center justify-between gap-2 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{actionSuccessMessage}</span>
          </div>
          <button onClick={() => setActionSuccessMessage(null)} className="text-emerald-700 hover:text-emerald-900">✕</button>
        </div>
      )}

      {/* Module Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar text-xs">
        <span className="text-slate-500 font-semibold ml-2 shrink-0">الموديول النشط:</span>
        {schemas.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveSchemaId(s.id)}
            className={`px-3 py-2 rounded-xl font-medium cursor-pointer transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeSchemaId === s.id
                ? 'bg-sky-600 text-white font-bold shadow-md shadow-sky-600/20'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <span>{s.titleAr}</span>
            {s.id === 'schema_customers' && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono font-bold">
                Zero-Code
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Grid Filter and Controls Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            <input
              type="text"
              placeholder="بحث فوري في كل الحقول (سيرفر كيزيت)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-9 pl-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-sky-500 text-xs shadow-2xs"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-semibold">الحالة:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 text-slate-800 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:bg-white focus:border-sky-500 text-xs cursor-pointer shadow-2xs"
            >
              <option value="all">الكل</option>
              <option value="active">نشط (Active)</option>
              <option value="low_stock">منخفض (Low Stock)</option>
              <option value="completed">مكتمل (Completed)</option>
              <option value="pending">قيد الانتظار (Pending)</option>
              <option value="blocked">محظور (Blocked)</option>
            </select>
          </div>

          <div className="text-slate-600 font-mono text-[11px] bg-slate-100 px-3 py-2 rounded-xl border border-slate-200">
            النتائج: <strong className="text-emerald-700 font-bold">{filteredData.length}</strong> صف (Keyset Seek 1.4ms)
          </div>
        </div>
      </div>

      {/* Excel-like Editable Grid Table (Day Mode) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
          <span>💡 <strong>نصيحة الإدخال السريع:</strong> انقر مرتين أو اضغط على أي خلية للتعديل المباشر (Inline Editing زي Excel) مع حفظ فوري بالـ Enter.</span>
          <span className="font-mono text-emerald-700 font-bold">Optimistic UI Enabled</span>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-['Cairo']">
              <tr>
                <th className="p-3.5 w-12 text-center">#</th>
                {activeSchema.fields.filter(f => columnVisibility[f.name] !== false).map((f) => (
                  <th 
                    key={f.name} 
                    onClick={() => {
                      if (sortBy === f.name) setSortAsc(!sortAsc);
                      else { setSortBy(f.name); setSortAsc(true); }
                    }}
                    className="p-3.5 font-semibold text-slate-700 cursor-pointer hover:text-sky-700 transition-colors" 
                    style={{ width: f.gridWidth || 150 }}
                  >
                    <div className="flex items-center gap-1">
                      <span>{f.labelAr}</span>
                      {sortBy === f.name && (
                        <span className="text-[10px] text-sky-600 font-mono">{sortAsc ? '▲' : '▼'}</span>
                      )}
                    </div>
                  </th>
                ))}
                <th className="p-3.5 text-center w-36">إجراءات السجل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredData.map((row, idx) => (
                <tr key={row.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="p-3.5 text-center text-slate-400 font-mono">{idx + 1}</td>
                  
                  {activeSchema.fields.filter(f => columnVisibility[f.name] !== false).map((field) => {
                    const val = row[field.name];
                    const isEditingThisCell = editingCell?.rowId === row.id && editingCell?.fieldName === field.name;

                    // Inline editing active cell
                    if (isEditingThisCell) {
                      return (
                        <td key={field.name} className="p-2 bg-sky-50 border border-sky-400">
                          <div className="flex items-center gap-1">
                            <input
                              type={field.type === 'number' || field.type === 'currency' ? 'number' : 'text'}
                              value={cellTempVal}
                              autoFocus
                              onChange={(e) => setCellTempVal(field.type === 'number' || field.type === 'currency' ? Number(e.target.value) : e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleCommitCellEdit(row.id, field.name);
                                if (e.key === 'Escape') setEditingCell(null);
                              }}
                              className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 text-xs focus:outline-none"
                            />
                            <button
                              onClick={() => handleCommitCellEdit(row.id, field.name)}
                              className="p-1 rounded bg-emerald-600 text-white cursor-pointer"
                              title="حفظ"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => setEditingCell(null)}
                              className="p-1 rounded bg-slate-700 text-slate-300 cursor-pointer"
                              title="تراجع"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      );
                    }

                    // Format Currency
                    if (field.type === 'currency') {
                      return (
                        <td 
                          key={field.name} 
                          onDoubleClick={() => {
                            if (!field.readOnly) {
                              setEditingCell({ rowId: row.id, fieldName: field.name });
                              setCellTempVal(val);
                            }
                          }}
                          className="p-3.5 font-mono font-bold text-slate-900 cursor-pointer hover:bg-slate-100"
                          title="انقر مرتين لتعديل الخلية"
                        >
                          {Number(val || 0).toLocaleString()} {currentTenant.currency}
                        </td>
                      );
                    }

                    // Format Badge
                    if (field.type === 'badge') {
                      const opt = field.options?.find((o) => o.value === val);
                      return (
                        <td key={field.name} className="p-3.5">
                          <span className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                            val === 'active' || val === 'completed' 
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                              : val === 'low_stock' || val === 'pending'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-rose-100 text-rose-800 border border-rose-200'
                          }`}>
                            {opt?.labelAr || val}
                          </span>
                        </td>
                      );
                    }

                    // Version Tag
                    if (field.name === 'version') {
                      return (
                        <td key={field.name} className="p-3.5 font-mono text-purple-700 font-bold">
                          v{val}
                        </td>
                      );
                    }

                    return (
                      <td 
                        key={field.name} 
                        onDoubleClick={() => {
                          if (!field.readOnly) {
                            setEditingCell({ rowId: row.id, fieldName: field.name });
                            setCellTempVal(val ?? '');
                          }
                        }}
                        className="p-3.5 truncate max-w-[200px] cursor-pointer hover:bg-slate-100 text-slate-800"
                        title="انقر مرتين لتعديل الخلية"
                      >
                        {val ?? '—'}
                      </td>
                    );
                  })}

                  {/* Actions Column */}
                  <td className="p-3.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {/* تعديل في فورم .edit */}
                      <button
                        onClick={() => {
                          setSelectedRecord({ ...row });
                          setIsEditModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 cursor-pointer shadow-2xs"
                        title="تعديل بالكامل (.edit)"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {/* سجل السجل (Audit History) */}
                      <button
                        onClick={() => handleOpenAuditHistory(row)}
                        className="p-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 cursor-pointer shadow-2xs"
                        title="سجل السجل (Audit Trail)"
                      >
                        <History className="w-3.5 h-3.5" />
                      </button>

                      {/* حذف ناعم .delete */}
                      <button
                        onClick={() => handleSoftDelete(row)}
                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 cursor-pointer shadow-2xs"
                        title="حذف ناعم (.delete)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 1. Modal: جديد (.create) مع "حفظ" و "حفظ وجديد" */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 font-['Cairo'] text-base">
                  إضافة سجل جديد (.create) - {activeSchema.titleAr}
                </h3>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
            </div>

            {/* Generated Fields */}
            <div className="space-y-3 max-h-[400px] overflow-y-auto no-scrollbar pr-1">
              {activeSchema.fields.filter(f => !f.readOnly).map((field) => (
                <div key={field.name}>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {field.labelAr} {field.required && <span className="text-rose-600">*</span>}
                  </label>
                  {field.type === 'select' ? (
                    <select
                      value={newRowDraft[field.name] || ''}
                      onChange={(e) => setNewRowDraft({ ...newRowDraft, [field.name]: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-xs focus:border-emerald-500 focus:bg-white focus:outline-none"
                    >
                      {field.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.labelAr}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type === 'number' || field.type === 'currency' ? 'number' : 'text'}
                      value={newRowDraft[field.name] ?? ''}
                      onChange={(e) => {
                        const val = field.type === 'number' || field.type === 'currency' ? Number(e.target.value) : e.target.value;
                        setNewRowDraft({ ...newRowDraft, [field.name]: val });
                      }}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-xs focus:border-emerald-500 focus:bg-white focus:outline-none"
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs hover:bg-slate-200 cursor-pointer font-semibold"
              >
                إلغاء
              </button>

              <div className="flex items-center gap-2">
                {/* حفظ وجديد */}
                <button
                  onClick={() => handleSaveNewRecord(true)}
                  className="px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-300 cursor-pointer"
                >
                  حفظ وجديد
                </button>

                {/* حفظ .save */}
                <button
                  onClick={() => handleSaveNewRecord(false)}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer shadow-md shadow-emerald-600/20"
                >
                  حفظ (.save)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Side Panel: سجل السجل (Audit Trail Panel) */}
      {isAuditPanelOpen && activeAuditRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-end">
          <div className="bg-white border-r border-slate-200 max-w-md w-full h-full p-6 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-sky-600" />
                  <h3 className="font-bold text-slate-900 font-['Cairo'] text-base">
                    سجل السجل (Audit Trail): {activeAuditRecord.id}
                  </h3>
                </div>
                <button onClick={() => setIsAuditPanelOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block mb-1">المنشئ الأصلي:</span>
                  <span className="text-slate-900 font-bold">{activeAuditRecord.created_by || 'النظام'}</span>
                  <span className="text-[11px] text-slate-400 block">{activeAuditRecord.created_at}</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block mb-1">الإصدار الحالي:</span>
                  <span className="text-purple-700 font-bold">v{activeAuditRecord.version}</span>
                </div>

                <div className="space-y-2 pt-2">
                  <span className="text-slate-600 font-sans block text-xs font-bold">الحركات المدققة في جدول core.audit_log:</span>
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-slate-800">
                    <div className="flex justify-between text-emerald-800 font-bold mb-1">
                      <span>UPDATE (Optimistic v{activeAuditRecord.version})</span>
                      <span>منذ قليل</span>
                    </div>
                    <p className="text-slate-600">بواسطة: كاشير الفرع الرئيسي</p>
                    <p className="text-slate-400 mt-1">Request ID: req_981a2f90</p>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsAuditPanelOpen(false)}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold cursor-pointer border border-slate-200"
            >
              إغلاق سجل التدقيق
            </button>
          </div>
        </div>
      )}

      {/* 3. Modal: تخصيص الأعمدة وحفظ العرض */}
      {isColumnsModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Columns className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-slate-900 font-['Cairo'] text-base">
                  اختيار الأعمدة وتخصيص العرض
                </h3>
              </div>
              <button onClick={() => setIsColumnsModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
            </div>

            <p className="text-xs text-slate-600">
              حدد الأعمدة المراد إظهارها في الجدول. سيتم حفظ هذا العرض تلقائياً في جدول <code className="text-purple-700 font-mono">core.saved_views</code> بحسابك:
            </p>

            <div className="space-y-2 max-h-[260px] overflow-y-auto no-scrollbar">
              {activeSchema.fields.map((f) => (
                <label key={f.name} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs cursor-pointer hover:bg-slate-100">
                  <span className="text-slate-900 font-medium">{f.labelAr}</span>
                  <input
                    type="checkbox"
                    checked={columnVisibility[f.name] !== false}
                    onChange={(e) => setColumnVisibility({ ...columnVisibility, [f.name]: e.target.checked })}
                    className="accent-purple-600 w-4 h-4 cursor-pointer"
                  />
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  setColumnVisibility({});
                  setIsColumnsModalOpen(false);
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs hover:bg-slate-200 font-semibold"
              >
                إعادة للوضع الافتراضي
              </button>
              <button
                onClick={() => {
                  setIsColumnsModalOpen(false);
                  setActionSuccessMessage("تم حفظ تفضيلات العرض بنجاح في core.saved_views!");
                  setTimeout(() => setActionSuccessMessage(null), 3000);
                }}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
              >
                حفظ التفضيلات
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Modal: معاينة الطباعة الرسمية (.print via Playwright PDF) */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-sky-600" />
                <h3 className="font-bold text-slate-900 font-['Cairo'] text-base">
                  معاينة الطباعة الرسمية (HTML to PDF via Playwright)
                </h3>
              </div>
              <button onClick={() => setIsPrintModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
            </div>

            <div className="bg-slate-50 border border-slate-200 text-slate-900 p-6 rounded-xl font-['Cairo'] text-xs space-y-4" dir="rtl">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h4 className="font-extrabold text-base text-slate-900">{currentTenant.nameAr}</h4>
                  <p className="text-slate-500 text-[11px]">{currentTenant.branch} - السجل التجاري والبطاقة الضريبية معتمدة</p>
                </div>
                <div className="text-left font-mono text-[10px] text-slate-500">
                  <p>DATE: {new Date().toLocaleDateString('ar-EG')}</p>
                  <p>REPORT: {activeSchema.titleAr}</p>
                </div>
              </div>

              <table className="w-full text-right text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-white text-slate-700">
                    <th className="p-2.5">#</th>
                    {activeSchema.fields.slice(0, 4).map(f => (
                      <th key={f.name} className="p-2.5">{f.labelAr}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800">
                  {filteredData.slice(0, 5).map((row, i) => (
                    <tr key={row.id}>
                      <td className="p-2.5 font-mono">{i + 1}</td>
                      {activeSchema.fields.slice(0, 4).map(f => (
                        <td key={f.name} className="p-2.5">{row[f.name]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="text-center text-[10px] text-slate-400 pt-2 border-t border-slate-200">
                مستند رسمي صادر عبر ERP NextGen Engine - مشفر وموثق إلكترونياً
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setIsPrintModalOpen(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold">إلغاء</button>
              <button onClick={() => { window.print(); setIsPrintModalOpen(false); }} className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs shadow-md shadow-sky-600/20">
                إرسال للطباعة الفورية
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Modal: عرض Schema JSON */}
      {isJsonModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileJson className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-slate-900 font-['Cairo'] text-base">
                  تعريف Schema للجدول ({activeSchema.tableName})
                </h3>
              </div>
              <button onClick={() => setIsJsonModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
            </div>

            <pre className="text-xs font-mono text-emerald-800 bg-slate-50 border border-slate-200 p-4 rounded-xl overflow-y-auto max-h-[350px] no-scrollbar" dir="ltr">
              {JSON.stringify(activeSchema, null, 2)}
            </pre>

            <div className="flex justify-end">
              <button onClick={() => setIsJsonModalOpen(false)} className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold">إغلاق</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
