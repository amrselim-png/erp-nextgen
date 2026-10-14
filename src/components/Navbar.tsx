import React from 'react';
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
  CheckCircle2, 
  Building2, 
  User, 
  Wifi, 
  Activity,
  Database,
  Cpu,
  ShoppingCart,
  Package,
  Scale 
} from 'lucide-react';

interface NavbarProps {
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

export const Navbar: React.FC<NavbarProps> = ({
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
  const tabs: { id: AppTab; labelAr: string; labelEn: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'pos_terminal', labelAr: 'الكاشير والـ POS (سريع)', labelEn: 'POS Terminal', icon: <ShoppingCart className="w-4 h-4" />, badge: 'تشغيلي حي' },
    { id: 'inventory_ops', labelAr: 'المخازن وحركات البضاعة', labelEn: 'Inventory Ops', icon: <Package className="w-4 h-4" />, badge: 'حركات حية' },
    { id: 'accounting_ledger', labelAr: 'دفتر اليومية والحسابات', labelEn: 'Accounting GL', icon: <Scale className="w-4 h-4" /> },
    { id: 'metadata_engine', labelAr: 'محرك الشاشات (Metadata Studio)', labelEn: 'Metadata UI Engine', icon: <LayoutGrid className="w-4 h-4" />, badge: 'المرحلة 2' },
    { id: 'action_registry', labelAr: 'سجل الصلاحيات والأزرار (RBAC)', labelEn: 'Action Registry', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'db_schema_migrations', labelAr: 'الداتابيز والـ Migrations', labelEn: 'DB Schema & Migrations', icon: <Database className="w-4 h-4" />, badge: 'SQL' },
    { id: 'backend_code', labelAr: 'كود الـ Backend (.NET 10)', labelEn: 'Backend C# .NET 10', icon: <Cpu className="w-4 h-4" />, badge: '.NET 10' },
    { id: 'sync_simulator', labelAr: 'المزامنة والتعارض (Dual View)', labelEn: 'Realtime & Conflict', icon: <RefreshCw className="w-4 h-4" /> },
    { id: 'accounting_outbox', labelAr: 'المحاسبة والـ Outbox Saga', labelEn: 'Accounting Outbox', icon: <BookOpenCheck className="w-4 h-4" /> },
    { id: 'keyset_benchmark', labelAr: 'AG Grid والـ Keyset', labelEn: 'Keyset Pagination', icon: <Zap className="w-4 h-4" /> },
    { id: 'recommendations', labelAr: 'توصيات الاستضافة ومصر 🇪🇬', labelEn: 'Hosting & Egypt Guide', icon: <Compass className="w-4 h-4" />, badge: 'هام' },
    { id: 'overview', labelAr: 'المعمارية الشاملة والـ Gateway', labelEn: 'Architecture & YARP', icon: <Layers className="w-4 h-4" /> }
  ];

  const roleLabels: Record<UserRole, { ar: string; en: string; color: string }> = {
    super_admin: { ar: 'مدير نظام شامل (Super Admin)', en: 'Super Admin', color: 'bg-purple-900/60 text-purple-300 border-purple-700' },
    branch_manager: { ar: 'مدير فرع (Branch Manager)', en: 'Branch Manager', color: 'bg-blue-900/60 text-blue-300 border-blue-700' },
    cashier: { ar: 'كاشير / نقطة بيع (Cashier POS)', en: 'Cashier POS', color: 'bg-emerald-900/60 text-emerald-300 border-emerald-700' },
    accountant: { ar: 'محاسب عام (Accountant)', en: 'Accountant', color: 'bg-amber-900/60 text-amber-300 border-amber-700' },
    auditor: { ar: 'مراجع تدقيق (Auditor - ReadOnly)', en: 'Auditor', color: 'bg-slate-800 text-slate-300 border-slate-700' }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 text-slate-100 shadow-xl" dir="rtl">
      {/* Top Bar: Brand, Tenant, Role & Telemetry */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-900">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-sky-500 via-indigo-600 to-emerald-400 p-0.5 flex items-center justify-center shadow-lg shadow-sky-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[7px] flex items-center justify-center">
              <Activity className="w-5 h-5 text-sky-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white font-['Cairo']">
                ERP NextGen Architecture & Workbench
              </span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/30 font-semibold">
                .NET 10 + Postgres RLS
              </span>
            </div>
            <p className="text-xs text-slate-400">
              المعمارية المتطورة للأنظمة السحابية الضخمة | بدون Scale-to-Zero وبدون كود مكرر
            </p>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          {/* Tenant Selector */}
          <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1.5 rounded-md border border-slate-800">
            <Building2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span className="text-slate-400 text-[11px]">المنشأة (Tenant):</span>
            <select
              value={selectedTenant.id}
              onChange={(e) => {
                const found = tenants.find((t) => t.id === e.target.value);
                if (found) onTenantChange(found);
              }}
              className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer max-w-[180px] truncate"
            >
              {tenants.map((t) => (
                <option key={t.id} value={t.id} className="bg-slate-900 text-slate-200">
                  {t.nameAr}
                </option>
              ))}
            </select>
          </div>

          {/* User Role Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1.5 rounded-md border border-slate-800">
            <User className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="text-slate-400 text-[11px]">صلاحية المستخدم:</span>
            <select
              value={userRole}
              onChange={(e) => onRoleChange(e.target.value as UserRole)}
              className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer"
            >
              {(Object.keys(roleLabels) as UserRole[]).map((r) => (
                <option key={r} value={r} className="bg-slate-900 text-slate-200">
                  {roleLabels[r].ar}
                </option>
              ))}
            </select>
          </div>

          {/* Network Simulator Badge */}
          <button
            onClick={onToggleOnline}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border transition-all cursor-pointer ${
              isSimulatingOnline
                ? 'bg-emerald-950/40 border-emerald-700/50 text-emerald-400 hover:bg-emerald-900/30'
                : 'bg-rose-950/40 border-rose-700/50 text-rose-400 hover:bg-rose-900/30'
            }`}
            title="تبديل حالة الاتصال لاختبار صمود التطبيق"
          >
            <Wifi className={`w-3.5 h-3.5 ${isSimulatingOnline ? 'text-emerald-400' : 'text-rose-400 animate-pulse'}`} />
            <span className="font-mono font-medium">
              {isSimulatingOnline ? `SignalR متصل (${pingMs}ms)` : 'غير متصل (انقطاع نت)'}
            </span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <nav className="max-w-7xl mx-auto px-4 flex items-center overflow-x-auto no-scrollbar gap-1 py-1 text-sm font-medium">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-md whitespace-nowrap transition-all text-xs font-['Cairo'] cursor-pointer relative ${
                isActive
                  ? 'bg-sky-500/15 text-sky-300 font-bold border-b-2 border-sky-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/70'
              }`}
            >
              {tab.icon}
              <span>{tab.labelAr}</span>
              {tab.badge && (
                <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                  tab.badge === 'هام' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-800 text-slate-300'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </header>
  );
};
