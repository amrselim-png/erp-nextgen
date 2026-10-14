import React, { useState } from 'react';
import { TenantContext, UserRole } from '../types.ts';
import { 
  BookOpen, 
  Plus, 
  CheckCircle2, 
  RotateCcw, 
  Lock, 
  Unlock, 
  Search, 
  Scale, 
  AlertTriangle, 
  Trash2, 
  Calendar 
} from 'lucide-react';

interface JournalLine {
  id: string;
  accountId: string;
  accountName: string;
  debit: number;
  credit: number;
}

interface JournalEntry {
  id: string;
  entryNo: string;
  date: string;
  description: string;
  status: 'draft' | 'posted' | 'reversed';
  totalDebit: number;
  totalCredit: number;
  source: string;
  lines: JournalLine[];
}

interface AccountingLedgerViewProps {
  currentTenant: TenantContext;
  userRole: UserRole;
}

const INITIAL_JOURNALS: JournalEntry[] = [
  {
    id: 'jv-1',
    entryNo: 'JV-2026-0041',
    date: '2026-10-14',
    description: 'إثبات مبيعات الكاشير والوردية الصباحية بمطعم الفندق',
    status: 'posted',
    totalDebit: 9598.80,
    totalCredit: 9598.80,
    source: 'POS Sales (ORD-10492)',
    lines: [
      { id: 'l-1', accountId: '1101', accountName: '1101 - الخزينة المركزية (نقدية)', debit: 9598.80, credit: 0 },
      { id: 'l-2', accountId: '4101', accountName: '4101 - إيرادات الأغذية والمشروبات F&B', debit: 0, credit: 8420.00 },
      { id: 'l-3', accountId: '2201', accountName: '2201 - ضريبة القيمة المضافة الدائنة (VAT 14%)', debit: 0, credit: 1178.80 }
    ]
  },
  {
    id: 'jv-2',
    entryNo: 'JV-2026-0042',
    date: '2026-10-14',
    description: 'صرف خامات بياضات ومفروشات من المخزن للمغسلة الفندقية',
    status: 'posted',
    totalDebit: 4200.00,
    totalCredit: 4200.00,
    source: 'Stock Issue (ISS-892)',
    lines: [
      { id: 'l-4', accountId: '5102', accountName: '5102 - مصروف تشغيل المغسلة واللاندري', debit: 4200.00, credit: 0 },
      { id: 'l-5', accountId: '1105', accountName: '1105 - مخزون البياضات والمهمات', debit: 0, credit: 4200.00 }
    ]
  },
  {
    id: 'jv-3',
    entryNo: 'JV-2026-0043',
    date: '2026-10-13',
    description: 'شراء قطع غيار وصيانة تكييفات مركزية نقداً من المورد',
    status: 'posted',
    totalDebit: 15600.00,
    totalCredit: 15600.00,
    source: 'Direct Purchase Invoice',
    lines: [
      { id: 'l-6', accountId: '5104', accountName: '5104 - مصاريف صيانة وأجهزة تبريد', debit: 13684.21, credit: 0 },
      { id: 'l-7', accountId: '1202', accountName: '1202 - ضريبة مدخلات قابلة للخصم (14%)', debit: 1915.79, credit: 0 },
      { id: 'l-8', accountId: '1101', accountName: '1101 - الخزينة المركزية (نقدية)', debit: 0, credit: 15600.00 }
    ]
  }
];

export const AccountingLedgerView: React.FC<AccountingLedgerViewProps> = ({ currentTenant, userRole }) => {
  const [journals, setJournals] = useState<JournalEntry[]>(INITIAL_JOURNALS);
  const [selectedJournal, setSelectedJournal] = useState<JournalEntry | null>(journals[0]);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // New Journal Draft State
  const [newDesc, setNewDesc] = useState('');
  const [newLines, setNewLines] = useState<JournalLine[]>([
    { id: 'draft-1', accountId: '1101', accountName: '1101 - الخزينة المركزية (نقدية)', debit: 5000, credit: 0 },
    { id: 'draft-2', accountId: '4101', accountName: '4101 - إيرادات النشاط', debit: 0, credit: 5000 }
  ]);

  const totalDebitSum = newLines.reduce((acc, l) => acc + (l.debit || 0), 0);
  const totalCreditSum = newLines.reduce((acc, l) => acc + (l.credit || 0), 0);
  const isBalanced = Math.abs(totalDebitSum - totalCreditSum) < 0.01 && totalDebitSum > 0;

  // 1. Post Journal (journal.post)
  const handlePostJournal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBalanced) return;

    const newJv: JournalEntry = {
      id: `jv-${Date.now().toString().slice(-4)}`,
      entryNo: `JV-2026-00${journals.length + 43}`,
      date: new Date().toISOString().split('T')[0],
      description: newDesc || 'قيد محاسبي عام يدوي',
      status: 'posted',
      totalDebit: totalDebitSum,
      totalCredit: totalCreditSum,
      source: 'Manual Entry',
      lines: [...newLines]
    };

    setJournals([newJv, ...journals]);
    setSelectedJournal(newJv);
    setIsNewModalOpen(false);
    setSuccessMsg(`تم ترحيل القيد المحاسبي (${newJv.entryNo}) بنجاح وقفل التعديل عليه!`);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  // 2. Reverse Journal (journal.reverse)
  const handleReverseJournal = (jv: JournalEntry) => {
    if (jv.status === 'reversed') return;

    const reversedNo = `REV-${jv.entryNo}`;
    const reversedLines: JournalLine[] = jv.lines.map(l => ({
      id: `rev-${l.id}`,
      accountId: l.accountId,
      accountName: l.accountName,
      debit: l.credit,
      credit: l.debit
    }));

    const reversedJv: JournalEntry = {
      id: `jv-rev-${Date.now().toString().slice(-4)}`,
      entryNo: reversedNo,
      date: new Date().toISOString().split('T')[0],
      description: `قيد عكسي لتسوية وإلغاء القيد (${jv.entryNo})`,
      status: 'posted',
      totalDebit: jv.totalCredit,
      totalCredit: jv.totalDebit,
      source: `Reversal of ${jv.entryNo}`,
      lines: reversedLines
    };

    setJournals(prev => [
      reversedJv,
      ...prev.map(j => j.id === jv.id ? { ...j, status: 'reversed' as const } : j)
    ]);
    setSelectedJournal(reversedJv);

    setSuccessMsg(`تم توليد القيد العكسي (${reversedNo}) وتحديث حالة القيد الأصلي دون أي حذف!`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  return (
    <div className="space-y-5" dir="rtl">
      {/* Top Header Card (Day Mode) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 font-['Cairo']">
              دفتر اليومية العامة والحسابات (General Ledger)
            </h2>
            <p className="text-xs text-slate-500">
              {currentTenant.nameAr} | قيود اليومية لا تُحذف أبداً، بل يُنشأ قيد عكسي مطابق (Double-Entry Bookkeeping)
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsNewModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer shadow-md shadow-emerald-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>إنشاء قيد يومية جديد (journal.post)</span>
        </button>
      </div>

      {/* Alert */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-xl text-xs flex items-center justify-between gap-2 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-700 hover:text-emerald-900">✕</button>
        </div>
      )}

      {/* Main Accounting Layout: List on Right, Active Journal Details on Left */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Journals List (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="font-bold text-slate-900 text-xs font-['Cairo']">قيود اليومية المسجلة</span>
            <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              {journals.length} قيد
            </span>
          </div>

          <div className="space-y-2 max-h-[520px] overflow-y-auto no-scrollbar">
            {journals.map((jv) => (
              <div
                key={jv.id}
                onClick={() => setSelectedJournal(jv)}
                className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                  selectedJournal?.id === jv.id
                    ? 'bg-amber-50/80 border-amber-400 shadow-sm ring-1 ring-amber-400/30'
                    : 'bg-slate-50 border-slate-200/80 hover:bg-slate-100/70 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono font-bold text-slate-900 text-xs">{jv.entryNo}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    jv.status === 'posted' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                    jv.status === 'reversed' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                    'bg-slate-200 text-slate-700'
                  }`}>
                    {jv.status === 'posted' ? 'مرحل ومقفل' : jv.status === 'reversed' ? 'معكوس' : 'مسودة'}
                  </span>
                </div>
                <p className="font-['Cairo'] text-slate-700 line-clamp-1 mb-1.5">{jv.description}</p>
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <span>{jv.date}</span>
                  <span className="text-emerald-700 font-extrabold">{jv.totalDebit.toLocaleString()} ج.م</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Journal Lines Details (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
          {selectedJournal ? (
            <>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-base text-slate-900">{selectedJournal.entryNo}</span>
                    <span className="text-xs text-slate-500 font-medium">({selectedJournal.source})</span>
                  </div>
                  <p className="text-xs text-slate-600 font-['Cairo'] mt-0.5">{selectedJournal.description}</p>
                </div>

                {selectedJournal.status === 'posted' && (
                  <button
                    onClick={() => handleReverseJournal(selectedJournal)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>عكس القيد (journal.reverse)</span>
                  </button>
                )}
              </div>

              {/* Lines Table */}
              <div className="overflow-x-auto no-scrollbar border border-slate-200 rounded-xl">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-['Cairo'] border-b border-slate-200">
                    <tr>
                      <th className="p-3">رقم واسم الحساب الدفتري</th>
                      <th className="p-3 text-center w-32">مدين (Debit)</th>
                      <th className="p-3 text-center w-32">دائن (Credit)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-xs text-slate-800">
                    {selectedJournal.lines.map((l) => (
                      <tr key={l.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-sans font-medium text-slate-900">{l.accountName}</td>
                        <td className="p-3 text-center font-bold text-emerald-700">
                          {l.debit > 0 ? `${l.debit.toLocaleString()} ج.م` : '—'}
                        </td>
                        <td className="p-3 text-center font-bold text-sky-700">
                          {l.credit > 0 ? `${l.credit.toLocaleString()} ج.م` : '—'}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-slate-50 font-bold border-t-2 border-slate-200">
                      <td className="p-3 font-sans text-slate-900">إجمالي القيد المحاسبي المتوازن:</td>
                      <td className="p-3 text-center text-emerald-800 font-extrabold">{selectedJournal.totalDebit.toLocaleString()} ج.م</td>
                      <td className="p-3 text-center text-sky-800 font-extrabold">{selectedJournal.totalCredit.toLocaleString()} ج.م</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">اختر قيداً من القائمة لعرض سطوره</div>
          )}
        </div>

      </div>

      {/* Modal: قيد يومية جديد مع فحص التوازن */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handlePostJournal} className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 font-['Cairo'] text-base">إنشاء وترحيل قيد يومية (journal.post)</h3>
              </div>
              <button type="button" onClick={() => setIsNewModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 font-semibold block mb-1">البيان والشرح المحاسبي:</label>
                <input
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="e.g. سداد إيجار مقر الفرع بشيك بنكي"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white"
                  required
                />
              </div>

              {/* Lines Entry */}
              <div className="space-y-2">
                <span className="text-slate-700 font-semibold block">أطراف القيد:</span>
                {newLines.map((line, idx) => (
                  <div key={line.id} className="grid grid-cols-12 gap-2 items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <div className="col-span-6">
                      <select
                        value={line.accountId}
                        onChange={(e) => {
                          const val = e.target.value;
                          const name = e.target.options[e.target.selectedIndex].text;
                          setNewLines(prev => prev.map((l, i) => i === idx ? { ...l, accountId: val, accountName: name } : l));
                        }}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-slate-800 text-[11px] focus:outline-none"
                      >
                        <option value="1101">1101 - الخزينة المركزية (نقدية)</option>
                        <option value="1102">1102 - البنك التجاري الدولي CIB</option>
                        <option value="1105">1105 - مخزون البضاعة</option>
                        <option value="4101">4101 - إيرادات النشاط</option>
                        <option value="5101">5101 - مصروفات إيجار وضيافة</option>
                      </select>
                    </div>

                    <div className="col-span-3">
                      <input
                        type="number"
                        placeholder="مدين"
                        value={line.debit || ''}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setNewLines(prev => prev.map((l, i) => i === idx ? { ...l, debit: val, credit: val > 0 ? 0 : l.credit } : l));
                        }}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-emerald-700 font-mono font-bold text-center text-xs"
                      />
                    </div>

                    <div className="col-span-3">
                      <input
                        type="number"
                        placeholder="دائن"
                        value={line.credit || ''}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setNewLines(prev => prev.map((l, i) => i === idx ? { ...l, credit: val, debit: val > 0 ? 0 : l.debit } : l));
                        }}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-sky-700 font-mono font-bold text-center text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Balance Check Meter */}
              <div className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                isBalanced ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-rose-50 border-rose-300 text-rose-800'
              }`}>
                <span className="font-bold">{isBalanced ? '✓ القيد متوازن تماماً (جاهز للترحيل)' : '✕ القيد غير متوازن (المدين لا يساوي الدائن)'}</span>
                <span className="font-mono font-bold">
                  الفرق: {Math.abs(totalDebitSum - totalCreditSum).toFixed(2)} ج.م
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button type="button" onClick={() => setIsNewModalOpen(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold">إلغاء</button>
              <button
                type="submit"
                disabled={!isBalanced}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs disabled:opacity-40 cursor-pointer shadow-md shadow-emerald-600/20"
              >
                ترحيل القيد المالي
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
