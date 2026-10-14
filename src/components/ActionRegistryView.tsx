import React, { useState } from 'react';
import { 
  RegisteredAction, 
  UserRole 
} from '../types.ts';
import { INITIAL_REGISTERED_ACTIONS } from '../data/mockErpData.ts';
import { 
  ShieldCheck, 
  Plus, 
  Lock, 
  Unlock, 
  CheckCircle2, 
  AlertTriangle, 
  Code, 
  Terminal, 
  Sparkles 
} from 'lucide-react';

interface ActionRegistryViewProps {
  currentRole: UserRole;
}

export const ActionRegistryView: React.FC<ActionRegistryViewProps> = ({ currentRole }) => {
  const [actions, setActions] = useState<RegisteredAction[]>(INITIAL_REGISTERED_ACTIONS);
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [testActionResult, setTestActionResult] = useState<{
    actionCode: string;
    allowed: boolean;
    reason: string;
    timestamp: string;
  } | null>(null);

  // New action form modal
  const [isNewActionModalOpen, setIsNewActionModalOpen] = useState(false);
  const [newActionCode, setNewActionCode] = useState('inventory.barcode.batch_print');
  const [newActionTitleAr, setNewActionTitleAr] = useState('طباعة دفعات باركود مجمعة');
  const [newActionModule, setNewActionModule] = useState('inventory');
  const [newActionScope, setNewActionScope] = useState<'all' | 'branch' | 'self' | 'tenant'>('branch');

  const rolesList: { role: UserRole; labelAr: string }[] = [
    { role: 'super_admin', labelAr: 'Super Admin' },
    { role: 'branch_manager', labelAr: 'Branch Manager' },
    { role: 'accountant', labelAr: 'Accountant' },
    { role: 'cashier', labelAr: 'Cashier POS' },
    { role: 'auditor', labelAr: 'Auditor' }
  ];

  const filteredActions = actions.filter((act) => 
    selectedModule === 'all' || act.module === selectedModule
  );

  // Toggle role in permission
  const handleTogglePermission = (actionId: string, role: UserRole) => {
    setActions(actions.map((act) => {
      if (act.id === actionId) {
        const hasRole = act.allowedRoles.includes(role);
        return {
          ...act,
          allowedRoles: hasRole 
            ? act.allowedRoles.filter((r) => r !== role)
            : [...act.allowedRoles, role]
        };
      }
      return act;
    }));
  };

  // Add new registered action (Default-Deny)
  const handleCreateAction = (e: React.FormEvent) => {
    e.preventDefault();
    const newAct: RegisteredAction = {
      id: `act_${Date.now()}`,
      module: newActionModule,
      actionCode: newActionCode,
      titleAr: newActionTitleAr,
      titleEn: newActionCode,
      scope: newActionScope,
      // Default-Deny rule: Only super_admin by default, all others false until granted
      allowedRoles: ['super_admin'],
      httpMethod: 'POST',
      endpoint: `/api/v1/modules/${newActionModule}/${newActionCode.replace(/\./g, '/')}`,
      isAudited: true,
      isNew: true,
      introducedInPhase: 2
    };

    setActions([newAct, ...actions]);
    setIsNewActionModalOpen(false);
    setNewActionCode('');
    setNewActionTitleAr('');
  };

  // Simulate calling the API with current role to verify 200 OK vs 403 Forbidden
  const handleTestExecution = (action: RegisteredAction) => {
    const isAllowed = action.allowedRoles.includes(currentRole);
    setTestActionResult({
      actionCode: action.actionCode,
      allowed: isAllowed,
      reason: isAllowed 
        ? `تم التصريح بنجاح! الدور (${currentRole}) يملك صلاحية تنفيذ [${action.actionCode}] بنطاق [${action.scope}].`
        : `حظر أمني (403 Forbidden): الدور (${currentRole}) لا يملك تصريحاً صريحاً لتنفيذ [${action.actionCode}]!`,
      timestamp: new Date().toLocaleTimeString('ar-EG')
    });
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Top Banner (Day Mode) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 font-mono text-xs font-bold border border-purple-200">
              القاعدة الذهبية رقم 3
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 font-['Cairo']">
              سجل الأفعال والصلاحيات المركزي (Action Registry & RBAC Engine)
            </h2>
          </div>
          <p className="text-xs text-slate-600">
            مصدر الحقيقة الأوحد لكل زر وعملية: <strong className="text-purple-700">Module × Action × Scope</strong>. لا زر يظهر دون تسجيل، والفعل الجديد محجوب افتراضياً (Default-Deny)، والفحص يتم في عمق الـ API وليس فقط بإخفاء الزر بالواجهة.
          </p>
        </div>

        <button
          onClick={() => setIsNewActionModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs cursor-pointer transition-all shadow-md shadow-purple-600/20 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>تسجيل فعل جديد (Register Action)</span>
        </button>
      </div>

      {/* Backend API Test Verification Box */}
      {testActionResult && (
        <div className={`p-4 rounded-xl border flex items-center justify-between gap-4 shadow-xs animate-in fade-in ${
          testActionResult.allowed 
            ? 'bg-emerald-50 border-emerald-300 text-emerald-900' 
            : 'bg-rose-50 border-rose-300 text-rose-900'
        }`}>
          <div className="flex items-center gap-3">
            {testActionResult.allowed ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <div>
              <div className="font-mono font-bold text-xs">
                {testActionResult.actionCode} ➔ {testActionResult.allowed ? 'PASSED (200 OK)' : 'BLOCKED (403 FORBIDDEN)'}
              </div>
              <p className="text-xs text-slate-600 mt-0.5">{testActionResult.reason}</p>
            </div>
          </div>
          <span className="text-[11px] font-mono text-slate-500 shrink-0">
            {testActionResult.timestamp}
          </span>
        </div>
      )}

      {/* Module Filter */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <span className="text-xs text-slate-500 font-semibold ml-2">فلترة حسب الموديول:</span>
        {['all', 'inventory', 'sales', 'accounting', 'manufacturing'].map((mod) => (
          <button
            key={mod}
            onClick={() => setSelectedModule(mod)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
              selectedModule === mod
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            {mod === 'all' ? 'كل الموديولات' : mod}
          </button>
        ))}
      </div>

      {/* Permission Matrix Table (Day Mode) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
          <span className="font-bold text-slate-900 font-['Cairo']">
            مصفوفة الصلاحيات الموحدة (Single Source of Truth)
          </span>
          <span className="text-slate-600 text-[11px]">
            الدور النشط حالياً للاختبار: <strong className="text-sky-700 font-mono font-bold">{currentRole}</strong>
          </span>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-['Cairo']">
              <tr>
                <th className="p-3.5">كود الفعل (Action Code)</th>
                <th className="p-3.5">الوصف التشغيلي</th>
                <th className="p-3.5 text-center">النطاق (Scope)</th>
                <th className="p-3.5 text-center">التدقيق (Audit)</th>
                {rolesList.map((r) => (
                  <th key={r.role} className={`p-3.5 text-center ${r.role === currentRole ? 'text-sky-800 font-bold bg-sky-50' : ''}`}>
                    {r.labelAr}
                  </th>
                ))}
                <th className="p-3.5 text-center">اختبار الـ API</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredActions.map((act) => (
                <tr key={act.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5 font-mono font-bold text-purple-700 text-[11px]">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span>{act.actionCode}</span>
                      {act.isNew && (
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300 text-[9px] font-sans font-bold animate-pulse">
                          جديد
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-3.5 font-medium text-slate-900">
                    {act.titleAr}
                  </td>
                  <td className="p-3.5 text-center">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 border border-slate-200 text-slate-700">
                      {act.scope}
                    </span>
                  </td>
                  <td className="p-3.5 text-center">
                    {act.isAudited ? (
                      <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-mono font-semibold">
                        Audit Log
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">—</span>
                    )}
                  </td>

                  {/* Role check columns */}
                  {rolesList.map((r) => {
                    const isAllowed = act.allowedRoles.includes(r.role);
                    return (
                      <td key={r.role} className={`p-3.5 text-center ${r.role === currentRole ? 'bg-sky-50/60' : ''}`}>
                        <button
                          onClick={() => handleTogglePermission(act.id, r.role)}
                          className={`p-1.5 rounded-lg cursor-pointer transition-all ${
                            isAllowed
                              ? 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50'
                              : 'text-slate-300 hover:text-slate-500 hover:bg-slate-100'
                          }`}
                          title={`تبديل صلاحية ${r.labelAr}`}
                        >
                          {isAllowed ? <CheckCircle2 className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                        </button>
                      </td>
                    );
                  })}

                  {/* Test API Button */}
                  <td className="p-3.5 text-center">
                    <button
                      onClick={() => handleTestExecution(act)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-mono font-semibold cursor-pointer transition-all border border-slate-200"
                    >
                      Call Endpoint
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Code Generation for .NET 10 & React */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xs space-y-3 text-white">
        <div className="flex items-center gap-2 text-slate-200 font-bold text-xs font-['Cairo']">
          <Terminal className="w-4 h-4 text-purple-400" />
          <span>توليد كود الحماية الآلي في .NET 10 (Zero-Leak Authorization Policy)</span>
        </div>
        <pre className="text-xs font-mono text-purple-200 p-3 bg-slate-950 rounded-xl overflow-x-auto leading-relaxed border border-slate-800" dir="ltr">
{`// C# Minimal API Endpoint Protected by Action Registry
app.MapPost("/api/v1/modules/sales/order", async (CreateOrderRequest req, HttpContext ctx) => {
    // 1. Strict Middleware checks: Module=sales, Action=order:create, Scope=branch
    ctx.EnforceAction("pos:order:create", ActionScope.Branch);
    
    // 2. Business logic only executes if 100% authorized!
    return Results.Ok(await orderService.CreateAsync(req));
});`}
        </pre>
      </div>

      {/* New Action Modal */}
      {isNewActionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleCreateAction} className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 font-['Cairo'] text-base">
                تسجيل فعل جديد في الـ Action Registry
              </h3>
              <button
                type="button"
                onClick={() => setIsNewActionModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">الموديول (Module):</label>
                <select
                  value={newActionModule}
                  onChange={(e) => setNewActionModule(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:bg-white focus:border-sky-500"
                >
                  <option value="inventory">inventory (المخازن)</option>
                  <option value="sales">sales (المبيعات)</option>
                  <option value="accounting">accounting (الحسابات)</option>
                  <option value="manufacturing">manufacturing (التصنيع)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">كود الفعل (Action Code):</label>
                <input
                  type="text"
                  value={newActionCode}
                  onChange={(e) => setNewActionCode(e.target.value)}
                  placeholder="module:submodule:verb"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none focus:bg-white focus:border-sky-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">الوصف باللغة العربية:</label>
                <input
                  type="text"
                  value={newActionTitleAr}
                  onChange={(e) => setNewActionTitleAr(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:bg-white focus:border-sky-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">النطاق المطلوب (Scope):</label>
                <select
                  value={newActionScope}
                  onChange={(e) => setNewActionScope(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:bg-white focus:border-sky-500"
                >
                  <option value="branch">branch (على مستوى الفرع فقط)</option>
                  <option value="tenant">tenant (على مستوى المؤسسة بالكامل)</option>
                  <option value="self">self (على مستوى المستخدم نفسه فقط)</option>
                </select>
              </div>

              <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-[11px] text-purple-900">
                🔒 <strong>قاعدة الأمان الافتراضي (Default-Deny):</strong> سيتم إنشاء هذا الفعل محجوباً عن جميع الأدوار تلقائياً عدا الـ Super Admin حتى يتم منحه صراحة من مصفوفة الصلاحيات أعلاه.
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsNewActionModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs hover:bg-slate-200 cursor-pointer font-semibold"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs cursor-pointer shadow-md shadow-purple-600/20"
              >
                تسجيل الفعل واعتماده
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
