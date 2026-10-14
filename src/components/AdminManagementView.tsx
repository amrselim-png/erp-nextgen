import React, { useState } from 'react';
import { TenantContext, UserRole } from '../types.ts';
import { 
  Building2, 
  Users, 
  PackageCheck, 
  FileSearch, 
  Plus, 
  Save, 
  RotateCcw, 
  ShieldCheck, 
  Key, 
  UserCheck, 
  UserX, 
  Mail, 
  GitBranch, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  ExternalLink,
  Layers,
  Lock,
  RefreshCw,
  LogOut,
  LogIn
} from 'lucide-react';

interface AdminManagementViewProps {
  currentTenant: TenantContext;
  userRole: UserRole;
}

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  branch: string;
  isActive: boolean;
  lastLogin: string;
}

interface BranchRecord {
  id: string;
  code: string;
  nameAr: string;
  city: string;
  isMain: boolean;
  status: 'active' | 'inactive';
}

interface ModuleItem {
  id: string;
  nameAr: string;
  nameEn: string;
  version: string;
  isEnabled: boolean;
  dependsOn: string[];
  description: string;
}

interface AuditRecord {
  id: string;
  timestamp: string;
  userName: string;
  tableName: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE' | 'APPROVAL';
  recordId: string;
  oldValue: Record<string, any> | null;
  newValue: Record<string, any>;
}

export const AdminManagementView: React.FC<AdminManagementViewProps> = ({
  currentTenant,
  userRole
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'settings' | 'users' | 'modules' | 'audit'>('settings');

  // 1. Settings state
  const [companySettings, setCompanySettings] = useState({
    companyName: currentTenant.nameAr,
    taxRegistrationNumber: '584-921-304',
    commercialRegister: '109845',
    currency: 'EGP',
    defaultVatRate: 14,
    enableEtaIntegration: true,
    optimisticVersion: 104
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsNotice, setSettingsNotice] = useState<string | null>(null);

  // Branches
  const [branches, setBranches] = useState<BranchRecord[]>([
    { id: 'b_1', code: 'HRG-MAIN', nameAr: 'الغردقة - المركز الرئيسي', city: 'الغردقة', isMain: true, status: 'active' },
    { id: 'b_2', code: 'SSH-RESORT', nameAr: 'شرم الشيخ - منتجع الباتروس أكوا بارك', city: 'شرم الشيخ', isMain: false, status: 'active' },
    { id: 'b_3', code: 'CAI-HQ', nameAr: 'القاهرة - المكتب الإداري التجمع الخامس', city: 'القاهرة', isMain: false, status: 'active' }
  ]);
  const [showAddBranchModal, setShowAddBranchModal] = useState(false);
  const [newBranchData, setNewBranchData] = useState({ code: '', nameAr: '', city: 'الإسكندرية' });

  // 2. Users & Auth state
  const [users, setUsers] = useState<UserRecord[]>([
    { id: 'u_1', name: 'عمرو سليم', email: 'amr.selim@pickalbatros.com', role: 'super_admin', branch: 'HRG-MAIN', isActive: true, lastLogin: 'منذ 5 دقائق' },
    { id: 'u_2', name: 'أحمد محمود', email: 'a.mahmoud@pickalbatros.com', role: 'branch_manager', branch: 'SSH-RESORT', isActive: true, lastLogin: 'اليوم 09:30 ص' },
    { id: 'u_3', name: 'سارة إبراهيم', email: 's.ibrahim@pickalbatros.com', role: 'accountant', branch: 'CAI-HQ', isActive: true, lastLogin: 'أمس 04:15 م' },
    { id: 'u_4', name: 'كريم فتحي', email: 'k.fathy@pickalbatros.com', role: 'cashier', branch: 'HRG-MAIN', isActive: true, lastLogin: 'منذ ساعتين' },
    { id: 'u_5', name: 'مريم عادل', email: 'm.adel@pickalbatros.com', role: 'auditor', branch: 'CAI-HQ', isActive: false, lastLogin: 'منذ أسبوع' }
  ]);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'cashier' as UserRole, branch: 'HRG-MAIN' });

  // Auth simulator state
  const [authSession, setAuthSession] = useState<{ isLoggedIn: boolean; token: string; expiresAt: string }>({
    isLoggedIn: true,
    token: 'jwt_sec_89fae019284bc78e',
    expiresAt: 'بعد 15 دقيقة (مجددة بـ HttpOnly Cookie)'
  });
  const [authNotice, setAuthNotice] = useState<string | null>(null);

  // 3. Module Manager state
  const [modules, setModules] = useState<ModuleItem[]>([
    { id: 'mod_inventory', nameAr: 'إدارة المخزون والمستودعات', nameEn: 'Inventory Management', version: 'v2.4.0', isEnabled: true, dependsOn: [], description: 'إدارة الأصناف، حركات الصرف والإضافة، الجرد المستمر' },
    { id: 'mod_pos', nameAr: 'نقاط البيع السريعة والكاشير', nameEn: 'Point of Sale (POS)', version: 'v2.1.2', isEnabled: true, dependsOn: ['mod_inventory'], description: 'واجهة الكاشير، تعليق الفواتير، الإيصال الإلكتروني' },
    { id: 'mod_purchasing', nameAr: 'المشتريات وسداد الموردين', nameEn: 'Procurement & Purchasing', version: 'v1.9.0', isEnabled: true, dependsOn: ['mod_inventory', 'mod_accounting'], description: 'أوامر الشراء، استلام البضائع، ومتابعة مديونية الموردين' },
    { id: 'mod_accounting', nameAr: 'المحاسبة واليومية العامة', nameEn: 'General Ledger & Financials', version: 'v3.0.1', isEnabled: true, dependsOn: [], description: 'شجرة الحسابات، قيود اليومية، ميزان المراجعة، الإقفال' },
    { id: 'mod_hr', nameAr: 'الموارد البشرية والرواتب', nameEn: 'HR & Payroll System', version: 'v1.4.2', isEnabled: true, dependsOn: ['mod_accounting'], description: 'سجلات الموظفين، الحضور والانصراف، مسير الرواتب المعتمد' },
    { id: 'mod_manufacturing', nameAr: 'التصنيع وقوائم المواد (BOM)', nameEn: 'Manufacturing & MRP', version: 'v1.1.0', isEnabled: false, dependsOn: ['mod_inventory', 'mod_accounting'], description: 'أوامر التشغيل، استهلاك المواد الخام، وحساب التكلفة الفعلية' },
    { id: 'mod_clinic', nameAr: 'إدارة العيادات والحجوزات', nameEn: 'Clinic & Medical Encounters', version: 'v1.0.5', isEnabled: false, dependsOn: ['mod_pos'], description: 'سجل المرضى، حجز المواعيد، الكشف الطبي والروشتة الإلكترونية' },
    { id: 'mod_eta', nameAr: 'منظومة الفاتورة والإيصال الإلكتروني ETA', nameEn: 'ETA Egyptian e-Invoicing', version: 'v2.5.0', isEnabled: true, dependsOn: ['mod_pos'], description: 'التوقيع الإلكتروني والربط اللحظي مع مصلحة الضرائب المصرية' }
  ]);

  // 4. Audit Trail state
  const [auditFilterTable, setAuditFilterTable] = useState('ALL');
  const [selectedAuditDiff, setSelectedAuditDiff] = useState<AuditRecord | null>(null);
  const [isExportingAudit, setIsExportingAudit] = useState(false);

  const mockAuditLogs: AuditRecord[] = [
    {
      id: 'aud_9921',
      timestamp: '2026-10-14 11:42:10',
      userName: 'عمرو سليم (Admin)',
      tableName: 'sales.orders',
      action: 'APPROVAL',
      recordId: 'INV-2026-904',
      oldValue: { status: 'draft', total_amount: 1040, is_approved: false },
      newValue: { status: 'approved', total_amount: 1040, is_approved: true, eta_uuid: 'E9F1-209B' }
    },
    {
      id: 'aud_9920',
      timestamp: '2026-10-14 11:35:02',
      userName: 'أحمد محمود (Manager)',
      tableName: 'inventory.stock_moves',
      action: 'INSERT',
      recordId: 'MV-8820',
      oldValue: null,
      newValue: { type: 'RECEIPT', warehouse_id: 'W-01', item_id: 'ITEM-8821', qty: 50, cost: 360 }
    },
    {
      id: 'aud_9919',
      timestamp: '2026-10-14 10:14:45',
      userName: 'سارة إبراهيم (Accountant)',
      tableName: 'accounting.journal_entries',
      action: 'APPROVAL',
      recordId: 'JRN-2026-081',
      oldValue: { status: 'DRAFT', posted_by: null },
      newValue: { status: 'POSTED', posted_by: 's.ibrahim', total_debit: 18000, total_credit: 18000 }
    },
    {
      id: 'aud_9918',
      timestamp: '2026-10-14 09:20:11',
      userName: 'عمرو سليم (Admin)',
      tableName: 'core.tenants',
      action: 'UPDATE',
      recordId: 't_albatros_resorts',
      oldValue: { default_vat_rate: 13, version: 103 },
      newValue: { default_vat_rate: 14, version: 104 }
    }
  ];

  // Action handlers
  const handleSaveSettings = () => {
    setIsSavingSettings(true);
    setTimeout(() => {
      setIsSavingSettings(false);
      setCompanySettings(prev => ({ ...prev, optimisticVersion: prev.optimisticVersion + 1 }));
      setSettingsNotice('تم حفظ إعدادات المنشأة بنجاح وفحص Concurrency Version بنجاح (Version 105)!');
      setTimeout(() => setSettingsNotice(null), 4000);
    }, 600);
  };

  const handleAddBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranchData.code || !newBranchData.nameAr) return;
    const newBr: BranchRecord = {
      id: `b_${Date.now()}`,
      code: newBranchData.code.toUpperCase(),
      nameAr: newBranchData.nameAr,
      city: newBranchData.city,
      isMain: false,
      status: 'active'
    };
    setBranches([...branches, newBr]);
    setShowAddBranchModal(false);
    setNewBranchData({ code: '', nameAr: '', city: 'الإسكندرية' });
  };

  const handleToggleUser = (userId: string) => {
    setUsers(users.map(u => u.id === userId ? { ...u, isActive: !u.isActive } : u));
  };

  const handleResetPassword = (email: string) => {
    setAuthNotice(`تم توليد رابط إعادة تعيين كلمة المرور للمستخدم (${email}) بنجاح وصلاحيته 15 دقيقة.`);
    setTimeout(() => setAuthNotice(null), 4000);
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) return;
    const created: UserRecord = {
      id: `u_${Date.now()}`,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      branch: newUser.branch,
      isActive: true,
      lastLogin: 'لم يدخل بعد (أُرسلت دعوة)'
    };
    setUsers([...users, created]);
    setShowAddUserModal(false);
    setNewUser({ name: '', email: '', role: 'cashier', branch: 'HRG-MAIN' });
  };

  const handleToggleModule = (modId: string) => {
    setModules(modules.map(m => {
      if (m.id !== modId) return m;
      if (!m.isEnabled) {
        // check dependencies
        const unfulfilled = m.dependsOn.filter(depId => !modules.find(x => x.id === depId)?.isEnabled);
        if (unfulfilled.length > 0) {
          alert(`لا يمكن تفعيل ${m.nameAr} قبل تفعيل الاعتماديات التالية: ${unfulfilled.join(', ')}`);
          return m;
        }
        return { ...m, isEnabled: true };
      } else {
        // disable
        return { ...m, isEnabled: false };
      }
    }));
  };

  const handleExportAudit = () => {
    setIsExportingAudit(true);
    setTimeout(() => {
      setIsExportingAudit(false);
      const csvContent = "data:text/csv;charset=utf-8," + 
        "ID,Timestamp,User,Table,Action,RecordId\n" + 
        mockAuditLogs.map(e => `${e.id},${e.timestamp},"${e.userName}",${e.tableName},${e.action},${e.recordId}`).join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `audit_trail_${currentTenant.id}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 1000);
  };

  const filteredAudits = auditFilterTable === 'ALL' 
    ? mockAuditLogs 
    : mockAuditLogs.filter(a => a.tableName.includes(auditFilterTable));

  return (
    <div className="space-y-6">
      {/* Top Navigation Tabs for Admin Area */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveSubTab('settings')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'settings'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>إعدادات الشركة والفروع (tenant.settings.save)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('users')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'users'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>المستخدمون والدخول (user.* / auth.*)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('modules')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'modules'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <PackageCheck className="w-4 h-4" />
            <span>مدير الموديولات والاعتماديات (module.*)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('audit')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'audit'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <FileSearch className="w-4 h-4" />
            <span>سجل التدقيق والمقارنة (audit.export)</span>
          </button>
        </div>

        <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-[11px] font-bold">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
          <span>صلاحيات الإدارة: {userRole}</span>
        </div>
      </div>

      {/* 1. Sub-tab: Settings & Branches */}
      {activeSubTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Tenant Settings Form */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-sky-600" />
                  <span>إعدادات الشركة والمنشأة الرئيسية</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  تعديل الاسم والعملة والضرائب مع فحص التزامن Optimistic Concurrency Token
                </p>
              </div>

              <span className="font-mono text-xs px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-700 rounded-lg font-bold">
                Version #{companySettings.optimisticVersion}
              </span>
            </div>

            {settingsNotice && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{settingsNotice}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">اسم المنشأة القانوني (عربي)</label>
                <input
                  type="text"
                  value={companySettings.companyName}
                  onChange={(e) => setCompanySettings({ ...companySettings, companyName: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">العملة الأساسية (Currency)</label>
                <input
                  type="text"
                  disabled
                  value={`${companySettings.currency} - الجنيه المصري`}
                  className="w-full text-xs px-3 py-2 bg-slate-100 border border-slate-200 text-slate-500 rounded-xl cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">رقم التسجيل الضريبي (مصلحة الضرائب)</label>
                <input
                  type="text"
                  value={companySettings.taxRegistrationNumber}
                  onChange={(e) => setCompanySettings({ ...companySettings, taxRegistrationNumber: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">السجل التجاري</label>
                <input
                  type="text"
                  value={companySettings.commercialRegister}
                  onChange={(e) => setCompanySettings({ ...companySettings, commercialRegister: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">نسبة ضريبة القيمة المضافة الافتراضية (%)</label>
                <input
                  type="number"
                  value={companySettings.defaultVatRate}
                  onChange={(e) => setCompanySettings({ ...companySettings, defaultVatRate: Number(e.target.value) })}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-6">
                <input
                  type="checkbox"
                  id="eta-toggle"
                  checked={companySettings.enableEtaIntegration}
                  onChange={(e) => setCompanySettings({ ...companySettings, enableEtaIntegration: e.target.checked })}
                  className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300"
                />
                <label htmlFor="eta-toggle" className="text-xs font-bold text-slate-700 cursor-pointer">
                  تفعيل الربط المباشر مع منظومة الفاتورة والإيصال الإلكتروني ETA
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-mono">
                Action: <code className="text-sky-700 font-bold">tenant.settings.save</code>
              </span>

              <button
                onClick={handleSaveSettings}
                disabled={isSavingSettings}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
              >
                {isSavingSettings ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>جاري فحص الـ Version والحفظ...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>حفظ إعدادات المنشأة</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Branches Section */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-indigo-600" />
                <span>فروع المنشأة ({branches.length})</span>
              </h3>

              <button
                onClick={() => setShowAddBranchModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 rounded-lg text-xs font-bold transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة فرع (branch.create)</span>
              </button>
            </div>

            <div className="space-y-3">
              {branches.map(br => (
                <div key={br.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded">
                        {br.code}
                      </span>
                      {br.isMain && (
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                          المركز الرئيسي
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-bold text-slate-800 mt-1">{br.nameAr}</p>
                    <p className="text-[11px] text-slate-500">{br.city}</p>
                  </div>

                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    نشط
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. Sub-tab: Users & Authentication */}
      {activeSubTab === 'users' && (
        <div className="space-y-6">
          {/* Auth Test Simulator Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-slate-900">محاكي المصادقة الأمنية (OAuth / JWT Tokens)</h4>
                <p className="text-[11px] text-slate-500 font-mono">Access Token في الذاكرة + Refresh Token في HttpOnly Secure Cookie</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {authSession.isLoggedIn ? (
                <>
                  <span className="text-[11px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-lg">
                    جلسة نشطة: {authSession.token}
                  </span>
                  <button
                    onClick={() => {
                      setAuthSession({ isLoggedIn: false, token: '', expiresAt: '' });
                      setAuthNotice('تم تسجيل الخروج بنجاح وإلغاء الـ Refresh Token (auth.logout)');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-all"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>خروج auth.logout</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setAuthSession({
                      isLoggedIn: true,
                      token: 'jwt_sec_89fae019284bc78e',
                      expiresAt: 'بعد 15 دقيقة'
                    });
                    setAuthNotice('تم تسجيل الدخول بنجاح وتوليد Access Token جديد في الذاكرة (auth.login)');
                  }}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>دخول auth.login</span>
                </button>
              )}
            </div>
          </div>

          {authNotice && (
            <div className="p-3 bg-sky-50 border border-sky-200 text-sky-800 text-xs rounded-xl flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
              <span>{authNotice}</span>
            </div>
          )}

          {/* Users Table */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-sky-600" />
                  <span>دليل المستخدمين وصلاحيات الأدوار</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  تعديل الحالة دون حذف للحفاظ على الـ Audit، وتوليد روابط استرجاع كلمة المرور
                </p>
              </div>

              <button
                onClick={() => setShowAddUserModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>مستخدم جديد (user.create)</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <th className="p-3">الموظف / البريد</th>
                    <th className="p-3">الدور الوظيفي</th>
                    <th className="p-3">الفرع المخصص</th>
                    <th className="p-3">الحالة التشغيلية</th>
                    <th className="p-3">آخر دخول</th>
                    <th className="p-3 text-center">إجراءات الأزرار (Actions)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{u.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{u.email}</div>
                      </td>
                      <td className="p-3">
                        <span className="font-mono text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded">
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="font-bold text-slate-700">{u.branch}</span>
                      </td>
                      <td className="p-3">
                        {u.isActive ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            مفعل
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            معطل
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-slate-500">{u.lastLogin}</td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleToggleUser(u.id)}
                            className={`p-1.5 rounded-lg border text-xs font-bold transition-all ${
                              u.isActive
                                ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            }`}
                            title={u.isActive ? 'تعطيل الحساب (user.toggle)' : 'تفعيل الحساب (user.toggle)'}
                          >
                            {u.isActive ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            onClick={() => handleResetPassword(u.email)}
                            className="p-1.5 rounded-lg border bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100 text-xs font-bold transition-all"
                            title="إعادة تعيين كلمة المرور (user.resetpw)"
                          >
                            <Key className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. Sub-tab: Module Manager & Dependencies */}
      {activeSubTab === 'modules' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <PackageCheck className="w-5 h-5 text-indigo-600" />
                <span>مدير الموديولات والاعتماديات (Module Lifecycle Engine)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                تفعيل آمن مع فحص depends_on وتراجع كامل في حالة فشل الخطوات، إيقاف مؤقت دون مسح الداتا
              </p>
            </div>

            <div className="text-xs font-mono bg-slate-100 text-slate-700 px-3 py-1 rounded-lg border border-slate-200 font-bold">
              {modules.filter(m => m.isEnabled).length} من أصل {modules.length} موديول نشط
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {modules.map((m) => (
              <div 
                key={m.id}
                className={`p-4 rounded-xl border transition-all ${
                  m.isEnabled 
                    ? 'bg-slate-50 border-slate-200 shadow-2xs' 
                    : 'bg-slate-100/50 border-slate-200/60 opacity-80'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-sm text-slate-900">{m.nameAr}</h4>
                      <span className="font-mono text-[10px] text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                        {m.version}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{m.description}</p>
                  </div>

                  <button
                    onClick={() => handleToggleModule(m.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                      m.isEnabled
                        ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                    }`}
                  >
                    {m.isEnabled ? 'إيقاف module.disable' : 'تفعيل module.enable'}
                  </button>
                </div>

                {m.dependsOn.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center gap-2 text-[11px] text-slate-500">
                    <span className="font-bold">يعتمد على (depends_on):</span>
                    <div className="flex flex-wrap gap-1">
                      {m.dependsOn.map(dep => (
                        <span 
                          key={dep} 
                          className="font-mono text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-bold"
                        >
                          {dep}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Sub-tab: Audit Trail & Keyset Diff */}
      {activeSubTab === 'audit' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <FileSearch className="w-5 h-5 text-sky-600" />
                  <span>سجل التدقيق الشامل (System Audit Trail)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  استعلامات سريعة بتقنية Keyset Pagination لمتابعة التعديلات وعرض قيم قبل وبعد بدقة
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={auditFilterTable}
                  onChange={(e) => setAuditFilterTable(e.target.value)}
                  className="text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700"
                >
                  <option value="ALL">جميع الجداول (All Tables)</option>
                  <option value="sales.orders">فواتير المبيعات (sales.orders)</option>
                  <option value="inventory.stock_moves">حركات المخزون (stock_moves)</option>
                  <option value="accounting.journal_entries">القيود اليومية (journal_entries)</option>
                  <option value="core.tenants">إعدادات المنشأة (tenants)</option>
                </select>

                <button
                  onClick={handleExportAudit}
                  disabled={isExportingAudit}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isExportingAudit ? 'جاري التصدير...' : 'تصدير audit.export'}</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <th className="p-3">التوقيت (Timestamp)</th>
                    <th className="p-3">المستخدم المنفذ</th>
                    <th className="p-3">الجدول (Table)</th>
                    <th className="p-3">العملية (Action)</th>
                    <th className="p-3">معرّف السجل</th>
                    <th className="p-3 text-center">المقارنة (Diff)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAudits.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3 font-mono text-slate-500 text-[11px]">{item.timestamp}</td>
                      <td className="p-3 font-bold text-slate-800">{item.userName}</td>
                      <td className="p-3">
                        <span className="font-mono text-[11px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          {item.tableName}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          item.action === 'INSERT' ? 'bg-emerald-100 text-emerald-800' :
                          item.action === 'APPROVAL' ? 'bg-indigo-100 text-indigo-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {item.action}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-slate-600">{item.recordId}</td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => setSelectedAuditDiff(item)}
                          className="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-lg text-[11px] font-bold transition-all"
                        >
                          عرض قبل / بعد
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Diff Viewer Modal */}
          {selectedAuditDiff && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl space-y-4 border border-slate-200">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">
                      مقارنة التغييرات (Audit Diff) — {selectedAuditDiff.tableName}
                    </h4>
                    <span className="text-xs text-slate-500 font-mono">
                      السجل: {selectedAuditDiff.recordId} | المنفذ: {selectedAuditDiff.userName}
                    </span>
                  </div>

                  <button
                    onClick={() => setSelectedAuditDiff(null)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-rose-50/50 border border-rose-200 rounded-xl">
                    <h5 className="text-xs font-bold text-rose-800 mb-2">القيمة السابقة (Before)</h5>
                    <pre className="text-[11px] font-mono text-slate-700 overflow-x-auto whitespace-pre-wrap">
                      {selectedAuditDiff.oldValue ? JSON.stringify(selectedAuditDiff.oldValue, null, 2) : 'لا يوجد (سجل جديد / INSERT)'}
                    </pre>
                  </div>

                  <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-xl">
                    <h5 className="text-xs font-bold text-emerald-800 mb-2">القيمة الجديدة (After)</h5>
                    <pre className="text-[11px] font-mono text-slate-700 overflow-x-auto whitespace-pre-wrap">
                      {JSON.stringify(selectedAuditDiff.newValue, null, 2)}
                    </pre>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => setSelectedAuditDiff(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                  >
                    إغلاق النافذة
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Branch Modal */}
      {showAddBranchModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form onSubmit={handleAddBranch} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 border border-slate-200">
            <h4 className="text-sm font-extrabold text-slate-900">إضافة فرع جديد (branch.create)</h4>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">كود الفرع (Code)</label>
              <input
                type="text"
                required
                placeholder="e.g. ALX-BRANCH"
                value={newBranchData.code}
                onChange={(e) => setNewBranchData({ ...newBranchData, code: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">اسم الفرع (عربي)</label>
              <input
                type="text"
                required
                placeholder="e.g. فرع الإسكندرية سموحة"
                value={newBranchData.nameAr}
                onChange={(e) => setNewBranchData({ ...newBranchData, nameAr: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">المدينة / المحافظة</label>
              <input
                type="text"
                value={newBranchData.city}
                onChange={(e) => setNewBranchData({ ...newBranchData, city: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>
            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddBranchModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-sky-600 text-white rounded-xl text-xs font-bold hover:bg-sky-700 shadow-sm"
              >
                إضافة الفرع
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form onSubmit={handleAddUser} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 border border-slate-200">
            <h4 className="text-sm font-extrabold text-slate-900">إضافة مستخدم جديد وإرسال دعوة (user.create)</h4>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">الاسم الكامل</label>
              <input
                type="text"
                required
                placeholder="e.g. محمد عبد الله"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">البريد الإلكتروني للعمل</label>
              <input
                type="email"
                required
                placeholder="e.g. m.abdullah@pickalbatros.com"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">الدور الوظيفي (Role)</label>
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value as UserRole })}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
              >
                <option value="super_admin">مدير نظام شامل (super_admin)</option>
                <option value="branch_manager">مدير فرع (branch_manager)</option>
                <option value="cashier">كاشير نقطة بيع (cashier)</option>
                <option value="accountant">محاسب عام (accountant)</option>
                <option value="auditor">مراجع تدقيق (auditor)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">الفرع المخصص</label>
              <select
                value={newUser.branch}
                onChange={(e) => setNewUser({ ...newUser, branch: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
              >
                {branches.map(b => (
                  <option key={b.id} value={b.code}>{b.nameAr} ({b.code})</option>
                ))}
              </select>
            </div>
            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddUserModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-sky-600 text-white rounded-xl text-xs font-bold hover:bg-sky-700 shadow-sm"
              >
                إرسال الدعوة
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
