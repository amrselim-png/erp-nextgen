/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppTab, UserRole, TenantContext } from './types.ts';
import { TENANTS } from './data/mockErpData.ts';
import { Sidebar } from './components/Sidebar.tsx';
import { ArchitectureView } from './components/ArchitectureView.tsx';
import { LiveSyncSimulator } from './components/LiveSyncSimulator.tsx';
import { MetadataScreenEngine } from './components/MetadataScreenEngine.tsx';
import { ActionRegistryView } from './components/ActionRegistryView.tsx';
import { AccountingOutboxView } from './components/AccountingOutboxView.tsx';
import { KeysetPaginationDemo } from './components/KeysetPaginationDemo.tsx';
import { ExpertRecommendations } from './components/ExpertRecommendations.tsx';
import { CiGuardrailsView } from './components/CiGuardrailsView.tsx';
import { DbSchemaMigrationsView } from './components/DbSchemaMigrationsView.tsx';
import { BackendCodeView } from './components/BackendCodeView.tsx';
import { PosTerminalView } from './components/PosTerminalView.tsx';
import { InventoryOperationsView } from './components/InventoryOperationsView.tsx';
import { AccountingLedgerView } from './components/AccountingLedgerView.tsx';
import { AdminManagementView } from './components/AdminManagementView.tsx';
import { PurchasingManagementView } from './components/PurchasingManagementView.tsx';
import { HrPayrollView } from './components/HrPayrollView.tsx';
import { ManufacturingBomView } from './components/ManufacturingBomView.tsx';
import { MedicalClinicsView } from './components/MedicalClinicsView.tsx';
import { EtaEinvoiceView } from './components/EtaEinvoiceView.tsx';
import { CustomerManagementView } from './components/CustomerManagementView.tsx';
import { SupplierManagementView } from './components/SupplierManagementView.tsx';
import { PaymentMethodsView } from './components/PaymentMethodsView.tsx';
import { ExpensesManagementView } from './components/ExpensesManagementView.tsx';
import { AccountingIntegrationMappingView } from './components/AccountingIntegrationMappingView.tsx';
import { ReservationsManagementView } from './components/ReservationsManagementView.tsx';
import { CustomerFollowupsView } from './components/CustomerFollowupsView.tsx';
import { FixedAssetsManagementView } from './components/FixedAssetsManagementView.tsx';
import { DailySessionsOperationsView } from './components/DailySessionsOperationsView.tsx';
import { INITIAL_PAYMENT_METHODS } from './data/mockCrmAndOperationsData.ts';
import { PaymentMethodRecord } from './types.ts';
import { 
  Building2, 
  ShieldCheck, 
  Activity, 
  Sparkles,
  ExternalLink,
  ChevronLeft
} from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<AppTab>('pos_terminal');
  const [selectedTenant, setSelectedTenant] = useState<TenantContext>(TENANTS[0]);
  const [userRole, setUserRole] = useState<UserRole>('super_admin');
  const [isSimulatingOnline, setIsSimulatingOnline] = useState(true);
  const [pingMs] = useState(44); // Frankfurt benchmark ping from Egypt
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodRecord[]>(INITIAL_PAYMENT_METHODS);

  const tabTitles: Record<AppTab, { title: string; category: string; description: string }> = {
    admin_management: {
      title: 'الإدارة العامة والمستخدمين وسجل التدقيق (Phase 1 Admin)',
      category: 'المرحلة 1: الأساس',
      description: 'إعدادات الشركة والفروع (tenant.settings.save)، إدارة المستخدمين (user.*)، مدير الموديولات، وسجل التدقيق (audit.export)'
    },
    pos_terminal: { 
      title: 'شاشة الكاشير ونقاط البيع السريعة (POS Terminal)', 
      category: 'المنظومة التشغيلية', 
      description: 'واجهة مبيعات سريعة مع فواتير إلكترونية متوافقة مع منظومة الضرائب المصرية ودعم العمل بدون إنترنت' 
    },
    customers: {
      title: 'إدارة العملاء وحسابات المدينين (Customers Master)',
      category: 'إدارة العملاء والعلاقات',
      description: 'جدول مستقل لإدارة بيانات العملاء، حدود الائتمان، الأرصدة، كشف الحساب والمتابعة'
    },
    suppliers: {
      title: 'إدارة الموردين وحسابات الدائنين (Suppliers Master)',
      category: 'المشتريات والتوريدات',
      description: 'جدول مستقل لإدارة الموردين المعتمدين، شروط الائتمان، المديونيات وأوامر الشراء'
    },
    payment_methods: {
      title: 'إدارة طرق السداد وربطها الحصري بالكاشير (Payment Methods)',
      category: 'المنظومة المالية',
      description: 'تحديد وسائل الدفع المعتمدة ونسب العمولات والحساب المالي المربوط حصراً بشاشة نقاط البيع'
    },
    expenses: {
      title: 'تسجيل المصروفات وسندات الصرف وربطها بطرق السداد (Expenses)',
      category: 'المنظومة المالية',
      description: 'توثيق المصروفات التشغيلية والنثريات وخصمها المباشر من طرق السداد وتوليد القيود'
    },
    accounting_mapping: {
      title: 'شاشة ربط التسجيل بالحسابات ومولد القيود الحصري (Strict Mapping)',
      category: 'المنظومة المالية',
      description: 'المصدر الوحيد والحصري لقيود اليومية لمنع أي قيد يدوي وجعل العمليات مصدر القيود'
    },
    reservations: {
      title: 'إدارة الحجوزات والمواعيد المسبقة (Bookings & Calendar)',
      category: 'الحجوزات والتشغيل',
      description: 'جدول مستقل لإدارة المواعيد المجدولة، تحصيل العرابين، والتحويل المباشر لجلسات تشغيل'
    },
    customer_followups: {
      title: 'سجل متابعات العملاء وعلاقات العملاء (CRM Follow-ups)',
      category: 'إدارة العملاء والعلاقات',
      description: 'جدول مستقل لتوثيق المكالمات ومحادثات الواتساب وقياس رضا العملاء والمواعيد القادمة'
    },
    fixed_assets: {
      title: 'إدارة الأصول الثابتة وعمود تتبع استهلاك الجهاز (Fixed Assets)',
      category: 'الأصول والتشغيل',
      description: 'جدول مستقل للأصول مع عمود مخصص لمتابعة ساعات تشغيل الجهاز وعدد الجلسات ونسبة الاستهلاك'
    },
    daily_sessions: {
      title: 'شاشة التشغيل وتسجيل الجلسات المنفذة خلال اليوم (Daily Sessions)',
      category: 'الحجوزات والتشغيل',
      description: 'تسجيل كافة الجلسات المنفذة اليوم وتحديث استهلاك الجهاز المرتبط وتوليد القيد المحاسبي'
    },
    inventory_ops: { 
      title: 'إدارة المخازن وحركات البضاعة (Inventory Operations)', 
      category: 'المنظومة التشغيلية', 
      description: 'أذون إضافة، صرف، تحويل بين المخازن، وجرد دوري مع قفل الرصيد السالب لحظياً' 
    },
    purchasing: {
      title: 'إدارة المشتريات وسداد الموردين (Purchasing & Payables)',
      category: 'المرحلة 3: الأساسية',
      description: 'أوامر الشراء (po.create)، اعتماد الشراء (po.approve)، استلام البضائع (po.receive)، وسداد الموردين (supplierpay.create)'
    },
    accounting_ledger: { 
      title: 'دفتر اليومية العامة والحسابات (General Ledger)', 
      category: 'المنظومة التشغيلية', 
      description: 'ترحيل قيود اليومية، قيود عكسية لمنع الحذف، ومراجعة الأرصدة المتوازنة' 
    },
    hr_payroll: {
      title: 'الموارد البشرية ومسير الرواتب (HR & Payroll Engine)',
      category: 'المرحلة 3: الأساسية',
      description: 'سجلات الموظفين (employee.create)، استيراد البصمة (attendance.import)، مسير المرتبات (payroll.run)، واعتماد الرواتب'
    },
    manufacturing_bom: {
      title: 'التصنيع وقوائم المواد وأوامر التشغيل (Manufacturing & BOM)',
      category: 'المرحلة 4: المتقدمة',
      description: 'إصدارات BOM الجديدة (bom.newversion)، اعتماد الإنتاج (bom.approve)، أوامر التشغيل (production.*)، واحتساب التكلفة'
    },
    medical_clinics: {
      title: 'العيادات الطبية وإدارة الحجوزات (Clinics & EHR)',
      category: 'المرحلة 4: المتقدمة',
      description: 'حجز المواعيد (clinic.book)، الكشف السريري والتشخيص ICD-10 (clinic.visit)، والروشتة الإلكترونية (clinic.prescription)'
    },
    eta_einvoice: {
      title: 'منظومة الفاتورة والإيصال الإلكتروني المصرية (ETA Egyptian e-Invoicing)',
      category: 'المرحلة 4: المتقدمة',
      description: 'التوقيع الرقمي (e-sign عبر التوكن)، الإرسال اللحظي (eta.submit)، استعلام الصلاحية (eta.status)، ورمز QR الرسمي'
    },
    metadata_engine: { 
      title: 'محرك الشاشات الآلي (Metadata Screen Studio)', 
      category: 'المنظومة التشغيلية', 
      description: 'بناء الشاشات والـ Grids ديناميكياً من الميتاداتا دون الحاجة لكتابة كود واجهة لكل جدول' 
    },
    action_registry: { 
      title: 'سجل الصلاحيات والأزرار المركزي (Action Registry & RBAC)', 
      category: 'المنظومة التشغيلية', 
      description: 'حظر الأزرار غير المسجلة ومصفوفة الصلاحيات ثلاثية الأبعاد (Module × Action × Scope)' 
    },
    db_schema_migrations: { 
      title: 'مخططات قواعد البيانات والـ Migrations (PostgreSQL 17)', 
      category: 'الأدوات الهندسية', 
      description: 'سكربتات DDL جاهزة للإنتاج مع Multi-tenancy RLS والـ Triggers والـ Keyset Indexes' 
    },
    backend_code: { 
      title: 'كود الـ Backend وتوليد الـ APIs (.NET 10 Minimal APIs)', 
      category: 'الأدوات الهندسية', 
      description: 'شاشات الـ Generic Data API و YARP Gateway و Npgsql RLS Connection Interceptor' 
    },
    sync_simulator: { 
      title: 'محاكي المزامنة اللحظية والتعارض (Dual View Live Sync)', 
      category: 'الأدوات الهندسية', 
      description: 'محاكاة مستخدمين يعدلان نفس السجل متزامناً مع اختبار Concurrency Token Version' 
    },
    accounting_outbox: { 
      title: 'المحاسبة والاتساق بالـ Outbox Saga Pattern', 
      category: 'الأدوات الهندسية', 
      description: 'ترحيل المبيعات للمخازن والقيود المحاسبية عبر أحداث Outbox بدون 2PC مع قيد التعويض' 
    },
    keyset_benchmark: { 
      title: 'مقارنة أداء التصفح Keyset Pagination vs Offset', 
      category: 'الأدوات الهندسية', 
      description: 'اختبار زمني حي للـ Keyset Seeks السريعة مقابل مسح الـ Offset البطيء على ربع مليون صف' 
    },
    ci_guardrails: { 
      title: 'بوابات الجودة بالـ CI/CD (Guardrails & Limits)', 
      category: 'الأدوات الهندسية', 
      description: 'فرض حد الـ 300 سطر لكل ملف، وفحص عدم ظهور أي زر بدون تسجيل في الـ Action Registry' 
    },
    recommendations: { 
      title: 'الدليل الهندسي الشامل وتوصيات استضافة مصر 🇪🇬', 
      category: 'الأدوات الهندسية', 
      description: 'مقارنة مراكز بيانات فرانكفورت وميلانو ودبي، وبنوك الكابلات البحرية للسرعة العالية' 
    },
    overview: { 
      title: 'المعمارية الشاملة ومسارات البيانات (Architecture Topology)', 
      category: 'الأدوات الهندسية', 
      description: 'مخطط الربط الكامل: React SPA ➔ YARP Gateway ➔ Minimal APIs ➔ PostgreSQL RLS' 
    }
  };

  const activeTabMeta = tabTitles[currentTab] || tabTitles.pos_terminal;

  return (
    <div 
      dir="rtl" 
      className="min-h-screen bg-slate-100 text-slate-800 font-['Cairo','Plus_Jakarta_Sans',sans-serif] selection:bg-sky-500/20 selection:text-sky-900 flex flex-row overflow-x-hidden"
    >
      {/* 1. Right Navigation Sidebar (التابات على اليمين) */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        selectedTenant={selectedTenant}
        onTenantChange={setSelectedTenant}
        tenants={TENANTS}
        userRole={userRole}
        onRoleChange={setUserRole}
        isSimulatingOnline={isSimulatingOnline}
        onToggleOnline={() => setIsSimulatingOnline(!isSimulatingOnline)}
        pingMs={pingMs}
      />

      {/* 2. Main Content Viewport (على اليسار في وضع RTL النهاري) */}
      <div className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
        {/* Top Header Bar (Day Mode) */}
        <header className="bg-white border-b border-slate-200 px-6 py-3.5 shrink-0 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Breadcrumbs & Active Tab Header */}
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <span>ERP NextGen</span>
                <ChevronLeft className="w-3 h-3 text-slate-400" />
                <span className="text-sky-700 font-semibold">{activeTabMeta.category}</span>
                <ChevronLeft className="w-3 h-3 text-slate-400" />
                <span className="text-slate-700">{activeTabMeta.title.split('(')[0]}</span>
              </div>
              <h1 className="text-base font-extrabold text-slate-900 mt-0.5">
                {activeTabMeta.title}
              </h1>
            </div>

            {/* Quick Badges & Context */}
            <div className="flex items-center gap-2.5 text-xs">
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 border border-sky-200 text-sky-800 font-bold">
                <Building2 className="w-3.5 h-3.5 text-sky-600" />
                <span>{selectedTenant.nameAr}</span>
                <span className="text-sky-500 text-[11px]">({selectedTenant.branch})</span>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono text-[11px] font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>وضع النهار (Day Mode)</span>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Main Application Canvas */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-100/70">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Phase 1: Admin & Organization */}
            {currentTab === 'admin_management' && (
              <AdminManagementView currentTenant={selectedTenant} userRole={userRole} />
            )}

            {/* Operational Core ERP Modules */}
            {currentTab === 'pos_terminal' && (
              <PosTerminalView currentTenant={selectedTenant} userRole={userRole} paymentMethods={paymentMethods} />
            )}
            {currentTab === 'customers' && (
              <CustomerManagementView currentTenant={selectedTenant} userRole={userRole} />
            )}
            {currentTab === 'suppliers' && (
              <SupplierManagementView currentTenant={selectedTenant} userRole={userRole} />
            )}
            {currentTab === 'payment_methods' && (
              <PaymentMethodsView 
                currentTenant={selectedTenant} 
                userRole={userRole} 
                paymentMethods={paymentMethods} 
                onUpdatePaymentMethods={setPaymentMethods}
                onNavigateToPos={() => setCurrentTab('pos_terminal')}
              />
            )}
            {currentTab === 'expenses' && (
              <ExpensesManagementView 
                currentTenant={selectedTenant} 
                userRole={userRole} 
                paymentMethods={paymentMethods} 
              />
            )}
            {currentTab === 'accounting_mapping' && (
              <AccountingIntegrationMappingView 
                currentTenant={selectedTenant} 
                userRole={userRole} 
                onNavigateToTab={(t) => setCurrentTab(t as any)}
              />
            )}
            {currentTab === 'reservations' && (
              <ReservationsManagementView 
                currentTenant={selectedTenant} 
                userRole={userRole} 
                onExecuteSession={() => setCurrentTab('daily_sessions')}
              />
            )}
            {currentTab === 'customer_followups' && (
              <CustomerFollowupsView currentTenant={selectedTenant} userRole={userRole} />
            )}
            {currentTab === 'fixed_assets' && (
              <FixedAssetsManagementView 
                currentTenant={selectedTenant} 
                userRole={userRole} 
                onNavigateToSessions={() => setCurrentTab('daily_sessions')}
              />
            )}
            {currentTab === 'daily_sessions' && (
              <DailySessionsOperationsView 
                currentTenant={selectedTenant} 
                userRole={userRole} 
                paymentMethods={paymentMethods}
              />
            )}
            {currentTab === 'inventory_ops' && (
              <InventoryOperationsView currentTenant={selectedTenant} userRole={userRole} />
            )}
            {currentTab === 'purchasing' && (
              <PurchasingManagementView currentTenant={selectedTenant} userRole={userRole} />
            )}
            {currentTab === 'accounting_ledger' && (
              <AccountingLedgerView currentTenant={selectedTenant} userRole={userRole} />
            )}
            {currentTab === 'hr_payroll' && (
              <HrPayrollView currentTenant={selectedTenant} userRole={userRole} />
            )}

            {/* Phase 4: Manufacturing, Clinics, ETA */}
            {currentTab === 'manufacturing_bom' && (
              <ManufacturingBomView currentTenant={selectedTenant} userRole={userRole} />
            )}
            {currentTab === 'medical_clinics' && (
              <MedicalClinicsView currentTenant={selectedTenant} userRole={userRole} />
            )}
            {currentTab === 'eta_einvoice' && (
              <EtaEinvoiceView currentTenant={selectedTenant} userRole={userRole} />
            )}

            {/* Dynamic Screen Engine & Action Registry */}
            {currentTab === 'metadata_engine' && (
              <MetadataScreenEngine currentTenant={selectedTenant} userRole={userRole} />
            )}
            {currentTab === 'action_registry' && (
              <ActionRegistryView currentRole={userRole} />
            )}

            {/* Database & Architecture Tools */}
            {currentTab === 'db_schema_migrations' && <DbSchemaMigrationsView />}
            {currentTab === 'backend_code' && <BackendCodeView />}
            {currentTab === 'sync_simulator' && (
              <LiveSyncSimulator
                currentTenant={selectedTenant}
                pingMs={isSimulatingOnline ? pingMs : 9999}
              />
            )}
            {currentTab === 'accounting_outbox' && <AccountingOutboxView />}
            {currentTab === 'keyset_benchmark' && <KeysetPaginationDemo />}
            {currentTab === 'ci_guardrails' && <CiGuardrailsView />}
            {currentTab === 'recommendations' && <ExpertRecommendations />}
            {currentTab === 'overview' && <ArchitectureView />}
          </div>
        </main>

        {/* Footer in Day Mode */}
        <footer className="bg-white border-t border-slate-200 text-xs text-slate-500 py-3 px-6 shrink-0 shadow-2xs">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                <strong>ERP NextGen Workbench</strong> — هندسة ومعمارية الأنظمة السحابية الضخمة (Day Mode)
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 font-mono text-[10px]">
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold">
                ✓ المرحلة 1 (الأساس والإدارة)
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold">
                ✓ المرحلة 2 (محرك الشاشات)
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold">
                ✓ المرحلة 3 (Core ERP)
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold">
                ✓ المرحلة 4 (التصنيع والعيادات وETA)
              </span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
