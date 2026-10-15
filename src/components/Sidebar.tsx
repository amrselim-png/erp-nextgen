import React, { useState } from 'react';
import { 
  AppTab, 
  UserRole, 
  TenantContext 
} from '../types.ts';
import { 
  Layers, 
  RefreshCw, 
  LayoutGrid, 
  ShieldCheck, 
  BookOpenCheck, 
  Zap, 
  Compass, 
  Building2, 
  User, 
  Wifi, 
  Activity,
  Database,
  Cpu,
  ShoppingCart,
  Package,
  Scale,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Search,
  ShoppingBag,
  Users,
  Factory,
  Stethoscope,
  FileCheck2,
  Settings,
  Truck,
  Receipt,
  GitMerge,
  Calendar,
  MessageSquare,
  CreditCard
} from 'lucide-react';

interface SidebarProps {
  currentTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  selectedTenant: TenantContext;
  onTenantChange: (tenant: TenantContext) => void;
  tenants: TenantContext[];
  userRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  isSimulatingOnline: boolean;
  onToggleOnline: () => void;
  pingMs: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  selectedTenant,
  onTenantChange,
  tenants,
  userRole,
  onRoleChange,
  isSimulatingOnline,
  onToggleOnline,
  pingMs
}) => {
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const operationalNavItems: { id: AppTab; labelAr: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'admin_management', labelAr: 'الإدارة العامة والمستخدمين', icon: <Settings className="w-4 h-4" />, badge: 'المرحلة 1' },
    { id: 'pos_terminal', labelAr: 'الكاشير ونقاط البيع (POS)', icon: <ShoppingCart className="w-4 h-4" />, badge: 'المرحلة 3' },
    { id: 'customers', labelAr: 'إدارة العملاء والمدينين', icon: <Users className="w-4 h-4" />, badge: 'جدول مستقل' },
    { id: 'suppliers', labelAr: 'إدارة الموردين والدائنين', icon: <Truck className="w-4 h-4" />, badge: 'جدول مستقل' },
    { id: 'payment_methods', labelAr: 'طرق السداد (حصري للكاشير)', icon: <CreditCard className="w-4 h-4" />, badge: 'كاشير' },
    { id: 'expenses', labelAr: 'تسجيل المصروفات وسندات الصرف', icon: <Receipt className="w-4 h-4" />, badge: 'سداد' },
    { id: 'accounting_mapping', labelAr: 'توجيه الحسابات ومولد القيود', icon: <GitMerge className="w-4 h-4" />, badge: 'مصدر حصري' },
    { id: 'reservations', labelAr: 'إدارة الحجوزات والمواعيد', icon: <Calendar className="w-4 h-4" />, badge: 'جدول مستقل' },
    { id: 'customer_followups', labelAr: 'متابعات العملاء (CRM)', icon: <MessageSquare className="w-4 h-4" />, badge: 'جدول مستقل' },
    { id: 'fixed_assets', labelAr: 'الأصول الثابتة واستهلاك الأجهزة', icon: <Cpu className="w-4 h-4" />, badge: 'عداد استهلاك' },
    { id: 'daily_sessions', labelAr: 'جلسات التشغيل المنفذة اليوم', icon: <Activity className="w-4 h-4" />, badge: 'تشغيل اليوم' },
    { id: 'inventory_ops', labelAr: 'المخازن وحركات البضاعة', icon: <Package className="w-4 h-4" />, badge: 'حي' },
    { id: 'purchasing', labelAr: 'المشتريات وسداد الموردين', icon: <ShoppingBag className="w-4 h-4" />, badge: 'جديد' },
    { id: 'accounting_ledger', labelAr: 'دفتر اليومية والحسابات (GL)', icon: <Scale className="w-4 h-4" />, badge: 'مالي' },
    { id: 'hr_payroll', labelAr: 'الموارد البشرية والرواتب', icon: <Users className="w-4 h-4" />, badge: 'جديد' },
    { id: 'manufacturing_bom', labelAr: 'التصنيع وقوائم المواد (BOM)', icon: <Factory className="w-4 h-4" />, badge: 'المرحلة 4' },
    { id: 'medical_clinics', labelAr: 'العيادات الطبية والحجوزات', icon: <Stethoscope className="w-4 h-4" />, badge: 'جديد' },
    { id: 'eta_einvoice', labelAr: 'الفاتورة والإيصال الإلكتروني ETA', icon: <FileCheck2 className="w-4 h-4" />, badge: 'ضرائب 🇪🇬' },
    { id: 'metadata_engine', labelAr: 'محرك الشاشات (Metadata Studio)', icon: <LayoutGrid className="w-4 h-4" />, badge: 'المرحلة 2' },
    { id: 'action_registry', labelAr: 'سجل الصلاحيات والأزرار (RBAC)', icon: <ShieldCheck className="w-4 h-4" />, badge: 'أمني' }
  ];

  const technicalNavItems: { id: AppTab; labelAr: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'db_schema_migrations', labelAr: 'الداتابيز والـ Migrations (SQL)', icon: <Database className="w-4 h-4" />, badge: 'Postgres' },
    { id: 'backend_code', labelAr: 'كود الـ Backend (.NET 10)', icon: <Cpu className="w-4 h-4" />, badge: 'C#' },
    { id: 'sync_simulator', labelAr: 'المزامنة والتعارض (Dual View)', icon: <RefreshCw className="w-4 h-4" />, badge: 'Realtime' },
    { id: 'accounting_outbox', labelAr: 'المحاسبة والـ Outbox Saga', icon: <BookOpenCheck className="w-4 h-4" /> },
    { id: 'keyset_benchmark', labelAr: 'أداء AG Grid والـ Keyset', icon: <Zap className="w-4 h-4" /> },
    { id: 'ci_guardrails', labelAr: 'بوابات الجودة (CI Guardrails)', icon: <ShieldAlert className="w-4 h-4" />, badge: 'CI/CD' },
    { id: 'recommendations', labelAr: 'توصيات الاستضافة ومصر 🇪🇬', icon: <Compass className="w-4 h-4" />, badge: 'هام' },
    { id: 'overview', labelAr: 'المعمارية الشاملة والـ Gateway', icon: <Layers className="w-4 h-4" /> }
  ];

  const roleLabels: Record<UserRole, { label: string; badgeColor: string }> = {
    super_admin: { label: 'مدير نظام شامل (Admin)', badgeColor: 'bg-purple-100 text-purple-800 border-purple-200' },
    branch_manager: { label: 'مدير فرع (Manager)', badgeColor: 'bg-blue-100 text-blue-800 border-blue-200' },
    cashier: { label: 'كاشير نقطة بيع (Cashier)', badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    accountant: { label: 'محاسب عام (Accountant)', badgeColor: 'bg-amber-100 text-amber-800 border-amber-200' },
    auditor: { label: 'مراجع تدقيق (Auditor)', badgeColor: 'bg-slate-100 text-slate-800 border-slate-200' }
  };

  const matchesSearch = (item: { labelAr: string }) => {
    if (!sidebarSearch.trim()) return true;
    return item.labelAr.toLowerCase().includes(sidebarSearch.toLowerCase());
  };

  const filteredOperational = operationalNavItems.filter(matchesSearch);
  const filteredTechnical = technicalNavItems.filter(matchesSearch);

  return (
    <aside 
      className={`${isCollapsed ? 'w-20' : 'w-76'} bg-white border-l border-slate-200 flex flex-col justify-between shrink-0 h-screen sticky top-0 shadow-sm z-30 font-['Cairo'] select-none transition-all duration-200 ease-in-out`}
      dir="rtl"
    >
      {/* Brand & Top Bar */}
      <div className="p-4 border-b border-slate-100 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 via-indigo-600 to-emerald-500 p-0.5 flex items-center justify-center shadow-md shadow-sky-600/20 shrink-0">
              <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                <Activity className="w-5 h-5 text-sky-600" />
              </div>
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <h1 className="font-extrabold text-slate-900 text-sm tracking-tight leading-tight truncate">
                  ERP NextGen
                </h1>
                <span className="text-[10px] font-mono text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full font-bold border border-sky-200 inline-block">
                  Day Mode | .NET 10
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title={isCollapsed ? 'توسيع القائمة' : 'تصغير القائمة'}
          >
            {isCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        {/* Tenant Selector (Expanded) */}
        {!isCollapsed && (
          <div className="bg-slate-50 p-2 rounded-xl border border-slate-200/90 space-y-1">
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-sky-600" />
                <span>المنشأة (Tenant):</span>
              </span>
            </div>
            <select
              value={selectedTenant.id}
              onChange={(e) => {
                const found = tenants.find((t) => t.id === e.target.value);
                if (found) onTenantChange(found);
              }}
              className="w-full bg-white text-slate-900 text-xs font-bold border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-sky-500 cursor-pointer shadow-xs"
            >
              {tenants.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nameAr}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Search Input in Sidebar */}
        {!isCollapsed && (
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
            <input
              type="text"
              value={sidebarSearch}
              onChange={(e) => setSidebarSearch(e.target.value)}
              placeholder="بحث في الشاشات والتابات..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pr-8 pl-2 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-sky-500"
            />
          </div>
        )}
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto no-scrollbar py-3 px-2 space-y-4 text-xs">
        {/* Operational Modules Group */}
        <div>
          {!isCollapsed && (
            <span className="px-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1.5">
              المنظومة التشغيلية (Core ERP)
            </span>
          )}
          <div className="space-y-1">
            {filteredOperational.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  title={item.labelAr}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20 ring-1 ring-sky-700'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <span className={`shrink-0 ${isActive ? 'text-white' : 'text-sky-600'}`}>{item.icon}</span>
                    {!isCollapsed && <span className="truncate">{item.labelAr}</span>}
                  </div>
                  {!isCollapsed && item.badge && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold shrink-0 ${
                      isActive ? 'bg-sky-500 text-white' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Technical & Architecture Tools Group */}
        <div>
          {!isCollapsed && (
            <span className="px-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1.5">
              الأدوات الهندسية والـ Backend
            </span>
          )}
          <div className="space-y-1">
            {filteredTechnical.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  title={item.labelAr}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm font-bold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <span className={`shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`}>{item.icon}</span>
                    {!isCollapsed && <span className="truncate">{item.labelAr}</span>}
                  </div>
                  {!isCollapsed && item.badge && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-semibold shrink-0 ${
                      isActive ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Footer: Role & Connection Telemetry */}
      <div className="p-3 border-t border-slate-200 bg-slate-50 space-y-2 text-xs">
        {/* Role Selector */}
        {!isCollapsed ? (
          <div className="flex items-center justify-between gap-1 text-[11px]">
            <span className="text-slate-500 flex items-center gap-1 shrink-0">
              <User className="w-3.5 h-3.5 text-indigo-600" />
              <span>الصلاحية:</span>
            </span>
            <select
              value={userRole}
              onChange={(e) => onRoleChange(e.target.value as UserRole)}
              className="bg-white text-slate-800 font-bold border border-slate-200 rounded-lg px-2 py-1 focus:outline-none text-[11px] cursor-pointer shadow-2xs max-w-[140px] truncate"
            >
              {(Object.keys(roleLabels) as UserRole[]).map((r) => (
                <option key={r} value={r}>{roleLabels[r].label}</option>
              ))}
            </select>
          </div>
        ) : (
          <div className="flex justify-center" title={`الصلاحية: ${roleLabels[userRole]?.label}`}>
            <User className="w-4 h-4 text-indigo-600" />
          </div>
        )}

        {/* Realtime Network Indicator */}
        <button
          onClick={onToggleOnline}
          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-[11px] font-mono transition-all cursor-pointer ${
            isSimulatingOnline
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
              : 'bg-rose-50 border-rose-200 text-rose-800 hover:bg-rose-100'
          }`}
          title="تبديل حالة اتصال الإنترنت للتطبيق (اختبار العمل أونلاين وأوفلاين)"
        >
          <div className="flex items-center gap-1.5 overflow-hidden">
            <Wifi className={`w-3.5 h-3.5 shrink-0 ${isSimulatingOnline ? 'text-emerald-600' : 'text-rose-600 animate-pulse'}`} />
            {!isCollapsed && (
              <span className="truncate">
                {isSimulatingOnline ? `SignalR متصل (${pingMs}ms)` : 'غير متصل (انقطاع)'}
              </span>
            )}
          </div>
          <span className={`w-2 h-2 rounded-full shrink-0 ${isSimulatingOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
        </button>
      </div>
    </aside>
  );
};
