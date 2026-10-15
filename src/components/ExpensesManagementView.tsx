import React, { useState } from 'react';
import { TenantContext, UserRole, ExpenseRecord, PaymentMethodRecord } from '../types.ts';
import { INITIAL_EXPENSES } from '../data/mockCrmAndOperationsData.ts';
import { 
  Receipt, 
  Plus, 
  Search, 
  CreditCard, 
  CheckCircle2, 
  DollarSign, 
  Calendar, 
  Building2, 
  FileText, 
  Download, 
  X, 
  Database,
  Tag,
  ArrowDownLeft,
  ShieldCheck,
  Eye
} from 'lucide-react';

interface ExpensesManagementViewProps {
  currentTenant: TenantContext;
  userRole: UserRole;
  paymentMethods: PaymentMethodRecord[];
}

export const ExpensesManagementView: React.FC<ExpensesManagementViewProps> = ({
  currentTenant,
  userRole,
  paymentMethods
}) => {
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(INITIAL_EXPENSES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('all');
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<ExpenseRecord | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Form State
  const activePaymentMethods = paymentMethods.filter(m => m.isActive);
  const defaultMethod = activePaymentMethods[0] || paymentMethods[0];

  const [formData, setFormData] = useState<Partial<ExpenseRecord>>({
    expenseNo: `EXP-2026-0${expenses.length + 85}`,
    date: new Date().toISOString().split('T')[0],
    category: 'نثريات ومطبوعات',
    amount: 500,
    paymentMethodId: defaultMethod?.id || 'pm-1',
    paymentMethodName: defaultMethod?.nameAr || 'نقداً (خزينة الكاشير)',
    beneficiary: '',
    referenceNo: '',
    branch: currentTenant.branch || 'HRG-MAIN',
    notes: '',
    recordedBy: 'عمرو سليم (Admin)',
    status: 'معتمد'
  });

  const handleShowNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3500);
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.beneficiary) return;

    const chosenMethod = paymentMethods.find(m => m.id === formData.paymentMethodId) || defaultMethod;
    const jvId = `JV-2026-0${Date.now().toString().slice(-4)}`;

    const newExp: ExpenseRecord = {
      id: `exp-${Date.now()}`,
      expenseNo: formData.expenseNo || `EXP-2026-0${expenses.length + 85}`,
      date: formData.date || new Date().toISOString().split('T')[0],
      category: (formData.category as any) || 'نثريات ومطبوعات',
      amount: Number(formData.amount) || 0,
      paymentMethodId: chosenMethod.id,
      paymentMethodName: chosenMethod.nameAr,
      beneficiary: formData.beneficiary,
      referenceNo: formData.referenceNo || `REF-${Math.floor(10000 + Math.random() * 90000)}`,
      branch: formData.branch || currentTenant.branch || 'HRG-MAIN',
      notes: formData.notes || '',
      recordedBy: formData.recordedBy || 'المسؤول المالي',
      status: 'معتمد',
      journalEntryId: jvId
    };

    setExpenses([newExp, ...expenses]);
    setShowAddModal(false);
    setFormData({
      expenseNo: `EXP-2026-0${expenses.length + 86}`,
      date: new Date().toISOString().split('T')[0],
      category: 'نثريات ومطبوعات',
      amount: 500,
      paymentMethodId: defaultMethod?.id || 'pm-1',
      paymentMethodName: defaultMethod?.nameAr || 'نقداً (خزينة الكاشير)',
      beneficiary: '',
      referenceNo: '',
      branch: 'HRG-MAIN',
      notes: '',
      recordedBy: 'عمرو سليم (Admin)',
      status: 'معتمد'
    });
    handleShowNotice(`تم تسجيل سند المصروف (${newExp.expenseNo}) وخصمه من (${chosenMethod.nameAr}) وتوليد القيد المحاسبي (${jvId}) بنجاح!`);
  };

  const filteredExpenses = expenses.filter(exp => {
    const matchesSearch = 
      exp.expenseNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.beneficiary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.category.includes(searchQuery) ||
      (exp.referenceNo && exp.referenceNo.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || exp.category === selectedCategory;
    const matchesMethod = selectedPaymentMethod === 'all' || exp.paymentMethodId === selectedPaymentMethod;

    return matchesSearch && matchesCategory && matchesMethod;
  });

  const totalExpenseAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
  const cashSpent = expenses.filter(e => e.paymentMethodId === 'pm-1').reduce((s, e) => s + e.amount, 0);
  const cardAndBankSpent = totalExpenseAmount - cashSpent;

  return (
    <div className="space-y-6" dir="rtl">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 text-rose-800 text-xs font-semibold border border-rose-200 mb-2">
            <Database className="w-3.5 h-3.5 text-rose-600" />
            <span>ربط مباشر بطرق السداد وجدول: accounting.expenses</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 font-['Cairo'] flex items-center gap-2">
            <Receipt className="w-6 h-6 text-rose-600" />
            <span>شاشة تسجيل المصروفات وسندات الصرف وربطها بطرق السداد</span>
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            توثيق المصروفات التشغيلية والنثريات وخصمها اللحظي من الخزينة أو الحسابات البنكية وتوليد القيود المحاسبية آلياً.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>تسجيل سند صرف جديد (expense.create)</span>
        </button>
      </div>

      {notice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-bold">إجمالي المصروفات المسجلة</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-700 mt-2 font-mono">
            {totalExpenseAmount.toLocaleString()} <span className="text-xs font-normal">ج.م</span>
          </p>
          <span className="text-[11px] text-slate-500">إجمالي سندات الصرف المعتمدة ({expenses.length})</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-bold">المصروفات النقدية (الخزينة)</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-700 mt-2 font-mono">
            {cashSpent.toLocaleString()} <span className="text-xs font-normal">ج.م</span>
          </p>
          <span className="text-[11px] text-amber-600 font-medium">خصم مباشر من خزينة الكاشير</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-bold">المصروفات البنكية والمحافظ</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-sky-700 mt-2 font-mono">
            {cardAndBankSpent.toLocaleString()} <span className="text-xs font-normal">ج.م</span>
          </p>
          <span className="text-[11px] text-sky-600 font-medium">تحويلات، فيزا، إنستاباي</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex-1 min-w-[260px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
          <input
            type="text"
            placeholder="بحث برقم السند، المستفيد، بند المصروف أو رقم الإيصال..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
          >
            <option value="all">كل بنود المصروفات</option>
            <option value="صيانة أجهزة ومعدات">صيانة أجهزة ومعدات</option>
            <option value="ضيافة وبوفيه">ضيافة وبوفيه</option>
            <option value="نثريات ومطبوعات">نثريات ومطبوعات</option>
            <option value="تسويق وإعلانات">تسويق وإعلانات</option>
            <option value="إيجارات ومرافق">إيجارات ومرافق</option>
            <option value="انتقالات وبترول">انتقالات وبترول</option>
          </select>

          <select
            value={selectedPaymentMethod}
            onChange={(e) => setSelectedPaymentMethod(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
          >
            <option value="all">كل طرق السداد</option>
            {paymentMethods.map(m => (
              <option key={m.id} value={m.id}>{m.nameAr}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <span>سجل سندات المصروفات ({filteredExpenses.length})</span>
            <span className="text-[10px] font-mono bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full font-bold">
              accounting.expenses ⟷ sales.payment_methods
            </span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <th className="p-3">رقم السند والتاريخ</th>
                <th className="p-3">بند المصروف</th>
                <th className="p-3">المستفيد / الجهة</th>
                <th className="p-3">طريقة السداد المخصومة منها</th>
                <th className="p-3">المبلغ المنصرف</th>
                <th className="p-3">الفرع / المسجل</th>
                <th className="p-3">قيد اليومية</th>
                <th className="p-3 text-center">المعاينة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.map(exp => (
                <tr key={exp.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3">
                    <div className="font-mono text-xs font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 inline-block">
                      {exp.expenseNo}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-1">{exp.date}</div>
                  </td>

                  <td className="p-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      {exp.category}
                    </span>
                    {exp.notes && (
                      <p className="text-[11px] text-slate-500 mt-1 max-w-xs truncate">{exp.notes}</p>
                    )}
                  </td>

                  <td className="p-3 font-bold text-slate-800">
                    <div>{exp.beneficiary}</div>
                    {exp.referenceNo && (
                      <div className="text-[10px] text-slate-400 font-mono font-normal">مرجع: {exp.referenceNo}</div>
                    )}
                  </td>

                  <td className="p-3">
                    <div className="flex items-center gap-1.5 text-purple-900 font-bold text-[11px] bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
                      <CreditCard className="w-3.5 h-3.5 text-purple-600" />
                      <span>{exp.paymentMethodName}</span>
                    </div>
                  </td>

                  <td className="p-3">
                    <span className="font-mono text-sm font-black text-rose-700">
                      {exp.amount.toLocaleString()} <span className="text-[10px] font-normal">ج.م</span>
                    </span>
                  </td>

                  <td className="p-3 text-[11px]">
                    <div className="font-bold text-slate-700">{exp.branch}</div>
                    <div className="text-slate-400">{exp.recordedBy}</div>
                  </td>

                  <td className="p-3">
                    <span className="font-mono text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {exp.journalEntryId || 'قيد آلي'}
                    </span>
                  </td>

                  <td className="p-3 text-center">
                    <button
                      type="button"
                      onClick={() => setSelectedVoucher(exp)}
                      className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition-all"
                      title="عرض تفاصيل السند والقيد المحاسبي"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form onSubmit={handleAddExpense} className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-rose-600" />
                <span>تسجيل سند صرف مصروف وربطه بطريقة السداد</span>
              </h3>
              <button type="button" onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">رقم سند الصرف</label>
                <input
                  type="text"
                  required
                  value={formData.expenseNo}
                  onChange={(e) => setFormData({ ...formData, expenseNo: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">تاريخ الصرف</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">بند المصروف *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                >
                  <option value="صيانة أجهزة ومعدات">صيانة أجهزة ومعدات</option>
                  <option value="ضيافة وبوفيه">ضيافة وبوفيه</option>
                  <option value="نثريات ومطبوعات">نثريات ومطبوعات</option>
                  <option value="تسويق وإعلانات">تسويق وإعلانات</option>
                  <option value="إيجارات ومرافق">إيجارات ومرافق</option>
                  <option value="انتقالات وبترول">انتقالات وبترول</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">المبلغ المنصرف (ج.م) *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-rose-700"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">طريقة السداد المخصوم منها (Payment Method) *</label>
                <select
                  value={formData.paymentMethodId}
                  onChange={(e) => {
                    const m = paymentMethods.find(x => x.id === e.target.value);
                    setFormData({ 
                      ...formData, 
                      paymentMethodId: e.target.value,
                      paymentMethodName: m?.nameAr || ''
                    });
                  }}
                  className="w-full px-3 py-2 bg-purple-50 border border-purple-300 text-purple-900 rounded-xl font-bold text-xs"
                >
                  {paymentMethods.filter(m => m.isActive).map(m => (
                    <option key={m.id} value={m.id}>
                      {m.nameAr} - (الحساب: {m.linkedAccountId} {m.linkedAccountName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">المستفيد / الجهة المستلمة *</label>
                <input
                  type="text"
                  required
                  placeholder="اسم الشخص أو الشركة المستفيدة"
                  value={formData.beneficiary}
                  onChange={(e) => setFormData({ ...formData, beneficiary: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">رقم المرجع / الإيصال / الفاتورة</label>
                <input
                  type="text"
                  placeholder="e.g. REC-99214"
                  value={formData.referenceNo}
                  onChange={(e) => setFormData({ ...formData, referenceNo: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">بيان وسبب الصرف بالتفصيل</label>
              <textarea
                rows={2}
                placeholder="توضيح الغرض من الصرف، تفاصيل الفاتورة..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/20"
              >
                اعتماد الصرف وتوليد القيد
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Voucher Detail Modal */}
      {selectedVoucher && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-rose-600" />
                  <span>تفاصيل سند الصرف: {selectedVoucher.expenseNo}</span>
                </h3>
                <span className="text-[11px] text-slate-500 font-mono">التاريخ: {selectedVoucher.date}</span>
              </div>
              <button type="button" onClick={() => setSelectedVoucher(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">المبلغ المنصرف:</span>
                <span className="font-mono text-base font-black text-rose-700">{selectedVoucher.amount.toLocaleString()} ج.م</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">البند:</span>
                <span className="font-bold text-slate-800">{selectedVoucher.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">المستفيد:</span>
                <span className="font-bold text-slate-800">{selectedVoucher.beneficiary}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">طريقة السداد:</span>
                <span className="font-bold text-purple-700">{selectedVoucher.paymentMethodName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">الملاحظات:</span>
                <span className="text-slate-700">{selectedVoucher.notes || 'لا توجد'}</span>
              </div>
            </div>

            {/* Auto Generated Journal Entry Box */}
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>القيد المحاسبي المتولد آلياً وحصراً ({selectedVoucher.journalEntryId})</span>
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono font-bold">مرحل</span>
              </div>
              <div className="text-[11px] font-mono divide-y divide-emerald-200/60 pt-1 text-slate-700">
                <div className="py-1 flex justify-between">
                  <span>من حـ/ مصروف {selectedVoucher.category}</span>
                  <span className="font-bold text-rose-700">{selectedVoucher.amount.toLocaleString()} ج.م (مدين)</span>
                </div>
                <div className="py-1 flex justify-between">
                  <span>إلى حـ/ {selectedVoucher.paymentMethodName}</span>
                  <span className="font-bold text-emerald-700">{selectedVoucher.amount.toLocaleString()} ج.م (دائن)</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedVoucher(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200"
              >
                إغلاق
              </button>
              <button
                type="button"
                onClick={() => alert(`جاري طباعة إيصال سند الصرف (${selectedVoucher.expenseNo})...`)}
                className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>طباعة سند الصرف PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
