import React, { useState } from 'react';
import { TenantContext, UserRole, AccountingMappingRule } from '../types.ts';
import { INITIAL_ACCOUNTING_MAPPING_RULES } from '../data/mockCrmAndOperationsData.ts';
import { 
  GitMerge, 
  Lock, 
  ShieldCheck, 
  CheckCircle2, 
  Database, 
  Plus, 
  Pencil, 
  FileText, 
  ArrowLeftRight, 
  Check, 
  AlertTriangle, 
  Sparkles,
  Zap,
  BookOpenCheck,
  X,
  ExternalLink
} from 'lucide-react';

interface AccountingIntegrationMappingViewProps {
  currentTenant: TenantContext;
  userRole: UserRole;
  onNavigateToTab?: (tab: string) => void;
}

export const AccountingIntegrationMappingView: React.FC<AccountingIntegrationMappingViewProps> = ({
  currentTenant,
  userRole,
  onNavigateToTab
}) => {
  const [rules, setRules] = useState<AccountingMappingRule[]>(INITIAL_ACCOUNTING_MAPPING_RULES);
  const [editingRule, setEditingRule] = useState<AccountingMappingRule | null>(null);
  const [selectedAuditEntry, setSelectedAuditEntry] = useState<any | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Live Auto-Generated Entries Log
  const [generatedEntries] = useState([
    {
      id: 'jv-101',
      entryNo: 'JV-2026-0941',
      date: '2026-10-15 11:30 ص',
      sourceType: 'سند صرف مصروف تشغيلي',
      sourceScreen: 'شاشة تسجيل المصروفات (expenses)',
      sourceDocRef: 'EXP-2026-081',
      debitLine: '50201 - مصروفات صيانة أجهزة ومعدات',
      creditLine: '10201 - حساب جاري البنك الأهلي المصري',
      amount: 3500,
      isBalanced: true,
      status: 'مرحل آلياً وحصراً'
    },
    {
      id: 'jv-102',
      entryNo: 'JV-2026-0942',
      date: '2026-10-15 11:45 ص',
      sourceType: 'مبيعات الكاشير الفورية',
      sourceScreen: 'شاشة الكاشير (pos_terminal)',
      sourceDocRef: 'INV-2026-904',
      debitLine: '10101 - نقدية بالصندوق (خزينة الكاشير)',
      creditLine: '40101 - إيراد مبيعات المشروبات والخدمات',
      amount: 1040,
      isBalanced: true,
      status: 'مرحل آلياً وحصراً'
    },
    {
      id: 'jv-103',
      entryNo: 'JV-2026-0943',
      date: '2026-10-15 12:15 م',
      sourceType: 'تنفيذ جلسة تشغيل يومية',
      sourceScreen: 'شاشة جلسات التشغيل اليومية (daily_sessions)',
      sourceDocRef: 'SES-2026-01',
      debitLine: '10201 - بطاقة بنكية POS فيزا',
      creditLine: '40201 - إيراد جلسات الهيدرافيشال',
      amount: 1200,
      isBalanced: true,
      status: 'مرحل آلياً وحصراً'
    },
    {
      id: 'jv-104',
      entryNo: 'JV-2026-0944',
      date: '2026-10-15 01:00 م',
      sourceType: 'إهلاك شهري بناءً على ساعات الاستهلاك',
      sourceScreen: 'شاشة الأصول الثابتة (fixed_assets)',
      sourceDocRef: 'AST-LZR-01 (1840 ساعة تشغيل)',
      debitLine: '50501 - مصروف إهلاك أجهزة ومعدات ليزر',
      creditLine: '10509 - مجمع إهلاك الأجهزة والمعدات',
      amount: 9660,
      isBalanced: true,
      status: 'مرحل آلياً وحصراً'
    }
  ]);

  const handleShowNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3500);
  };

  const handleSaveEditRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRule) return;

    setRules(rules.map(r => r.id === editingRule.id ? editingRule : r));
    handleShowNotice(`تم تحديث توجيه الحسابات للقاعدة (${editingRule.nameAr}) بنجاح.`);
    setEditingRule(null);
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-800 text-xs font-semibold border border-indigo-200 mb-2">
            <Lock className="w-3.5 h-3.5 text-indigo-600" />
            <span>المصدر الحصري والوحيد لقيود اليومية (Single Exclusive Source of Truth)</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 font-['Cairo'] flex items-center gap-2">
            <GitMerge className="w-6 h-6 text-indigo-600" />
            <span>شاشة ربط التسجيل بالحسابات ومولد القيود المحاسبية الحصري</span>
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            تطبيق رقابي صارم: منع إنشاء أي قيد يدوي غير مبرر، وجعل كافة القيود صادرة حصراً وتلقائياً من شاشات التشغيل المعتمدة.
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>القاعدة المالية: توازن طرفي القيد (مدين = دائن) 100%</span>
        </div>
      </div>

      {notice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Enforcement Rule Architecture Callout */}
      <div className="p-5 bg-gradient-to-r from-indigo-50 via-sky-50 to-emerald-50 rounded-2xl border border-indigo-200 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-indigo-900 flex items-center gap-2">
            <Lock className="w-4 h-4 text-indigo-700" />
            <span>قاعدة الحصرية المحاسبية الصارمة (Strict Exclusive Journal Source Architecture)</span>
          </h3>
          <span className="text-[10px] font-mono bg-indigo-600 text-white px-2.5 py-0.5 rounded-full font-bold">
            Zero-Manual-Entry Policy
          </span>
        </div>
        <p className="text-xs text-slate-700 leading-relaxed">
          جميع قيود اليومية العامة في النظام (<code className="text-indigo-800 font-mono font-bold">accounting.journal_entries</code>) لا يمكن كتابتها يدوياً. كل قيد له <strong className="text-slate-900">مصدر مرجعي تشغيلي وحيد</strong>: إما إيصال كاشير معتمد، أو سند صرف مصروف مربوط بوسيلة سداد، أو جلسة تشغيل يومية منفذة، أو إهلاك محسوب من عداد ساعات استهلاك الجهاز.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 text-[11px] font-bold">
          <div className="p-2 bg-white rounded-lg border border-indigo-100 text-center text-indigo-800">
            1. الكاشير POS ⟵ إيراد ونقدية
          </div>
          <div className="p-2 bg-white rounded-lg border border-indigo-100 text-center text-rose-800">
            2. المصروفات ⟵ خصم من وسيلة الدفع
          </div>
          <div className="p-2 bg-white rounded-lg border border-indigo-100 text-center text-purple-800">
            3. الجلسات اليومية ⟵ إيراد واستهلاك
          </div>
          <div className="p-2 bg-white rounded-lg border border-indigo-100 text-center text-emerald-800">
            4. الموردين ⟵ تسوية دائنين
          </div>
          <div className="p-2 bg-white rounded-lg border border-indigo-100 text-center text-amber-800">
            5. الأصول ⟵ إهلاك ساعات التشغيل
          </div>
        </div>
      </div>

      {/* Mapping Rules Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <ArrowLeftRight className="w-4 h-4 text-indigo-600" />
            <span>قواعد التوجيه المحاسبي المعتمدة ({rules.length})</span>
          </h3>
          <span className="text-[10px] font-mono bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full font-bold">
            accounting.journal_mapping_rules
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <th className="p-3">نوع العملية والتوجيه</th>
                <th className="p-3">الشاشة المصدر الحصرية</th>
                <th className="p-3">الطرف المدين (Debit)</th>
                <th className="p-3">الطرف الدائن (Credit)</th>
                <th className="p-3">الحصرية</th>
                <th className="p-3">الترحيل الآلي</th>
                <th className="p-3 text-center">تعديل التوجيه</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rules.map(rule => (
                <tr key={rule.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3">
                    <div className="font-bold text-slate-900">{rule.nameAr}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{rule.code} ({rule.transactionType})</div>
                  </td>

                  <td className="p-3">
                    <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                      {rule.sourceScreen}
                    </span>
                  </td>

                  <td className="p-3">
                    <div className="font-mono text-xs font-bold text-rose-700">{rule.debitAccountCode}</div>
                    <div className="text-[11px] text-slate-600">{rule.debitAccountName}</div>
                  </td>

                  <td className="p-3">
                    <div className="font-mono text-xs font-bold text-emerald-700">{rule.creditAccountCode}</div>
                    <div className="text-[11px] text-slate-600">{rule.creditAccountName}</div>
                  </td>

                  <td className="p-3">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                      <Lock className="w-3 h-3 text-purple-600" />
                      مصدر حصري
                    </span>
                  </td>

                  <td className="p-3">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <Check className="w-3 h-3 text-emerald-600" />
                      مفعل فورياً
                    </span>
                  </td>

                  <td className="p-3 text-center">
                    <button
                      type="button"
                      onClick={() => setEditingRule({ ...rule })}
                      className="p-1.5 rounded-lg border border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100 transition-all"
                      title="تعديل حسابات المدين والدائن"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Generated Journal Entries Stream */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <BookOpenCheck className="w-4 h-4 text-emerald-600" />
              <span>سجل القيود المحاسبية المتولدة حصراً من العمليات التشغيلية</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              كل قيد هنا مربوط بمستنده الأصلي الصادر من الكاشير أو المصروفات أو الأصول.
            </p>
          </div>

          <span className="text-xs font-mono font-bold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-lg border border-emerald-200">
            تم فحص التوازن بنجاح (Balanced & Audited)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <th className="p-3">رقم القيد والتاريخ</th>
                <th className="p-3">العملية المصدر الحصرية</th>
                <th className="p-3">المستند الأصلي المرتبط</th>
                <th className="p-3">الطرف المدين</th>
                <th className="p-3">الطرف الدائن</th>
                <th className="p-3">القيمة الإجمالية</th>
                <th className="p-3">حالة التدقيق</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {generatedEntries.map(entry => (
                <tr key={entry.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3">
                    <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {entry.entryNo}
                    </span>
                    <div className="text-[10px] text-slate-400 font-mono mt-1">{entry.date}</div>
                  </td>

                  <td className="p-3 font-bold text-slate-800">
                    <div>{entry.sourceType}</div>
                    <div className="text-[10px] text-indigo-600 font-mono font-normal">{entry.sourceScreen}</div>
                  </td>

                  <td className="p-3 font-mono text-[11px] text-slate-700">
                    <span className="bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded">
                      {entry.sourceDocRef}
                    </span>
                  </td>

                  <td className="p-3 text-[11px] text-rose-700 font-bold font-mono">
                    {entry.debitLine}
                  </td>

                  <td className="p-3 text-[11px] text-emerald-700 font-bold font-mono">
                    {entry.creditLine}
                  </td>

                  <td className="p-3 font-mono font-black text-sm text-slate-900">
                    {entry.amount.toLocaleString()} ج.م
                  </td>

                  <td className="p-3">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      {entry.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Rule Modal */}
      {editingRule && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form onSubmit={handleSaveEditRule} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Pencil className="w-4 h-4 text-indigo-600" />
                <span>تعديل توجيه الحسابات: {editingRule.nameAr}</span>
              </h3>
              <button type="button" onClick={() => setEditingRule(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-900">
                <span className="font-bold block">الشاشة المصدر الحصرية:</span>
                <span>{editingRule.sourceScreen} ({editingRule.transactionType})</span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">كود واسم الحساب المدين (Debit)</label>
                <input
                  type="text"
                  required
                  value={editingRule.debitAccountName}
                  onChange={(e) => setEditingRule({ ...editingRule, debitAccountName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">كود واسم الحساب الدائن (Credit)</label>
                <input
                  type="text"
                  required
                  value={editingRule.creditAccountName}
                  onChange={(e) => setEditingRule({ ...editingRule, creditAccountName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">وصف القاعدة المحاسبية</label>
                <textarea
                  rows={2}
                  value={editingRule.description}
                  onChange={(e) => setEditingRule({ ...editingRule, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingRule(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                حفظ التوجيه المحاسبي
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
