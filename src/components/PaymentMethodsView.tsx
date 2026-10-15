import React, { useState } from 'react';
import { TenantContext, UserRole, PaymentMethodRecord } from '../types.ts';
import { INITIAL_PAYMENT_METHODS } from '../data/mockCrmAndOperationsData.ts';
import { 
  CreditCard, 
  Plus, 
  Pencil, 
  CheckCircle2, 
  Banknote, 
  QrCode, 
  Smartphone, 
  Building2, 
  Lock, 
  ShieldCheck, 
  Percent, 
  ExternalLink,
  X,
  Database,
  ShoppingCart
} from 'lucide-react';

interface PaymentMethodsViewProps {
  currentTenant: TenantContext;
  userRole: UserRole;
  paymentMethods: PaymentMethodRecord[];
  onUpdatePaymentMethods: (methods: PaymentMethodRecord[]) => void;
  onNavigateToPos?: () => void;
}

export const PaymentMethodsView: React.FC<PaymentMethodsViewProps> = ({
  currentTenant,
  userRole,
  paymentMethods,
  onUpdatePaymentMethods,
  onNavigateToPos
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethodRecord | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // New method form
  const [formData, setFormData] = useState<Partial<PaymentMethodRecord>>({
    code: '',
    nameAr: '',
    nameEn: '',
    type: 'card_pos',
    commissionPercent: 1.0,
    linkedAccountId: '10201',
    linkedAccountName: 'حساب جاري البنك الأهلي المصري',
    isActive: true,
    requiresReferenceNumber: true,
    isExclusiveToCashier: true,
    iconName: 'CreditCard'
  });

  const handleShowNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3500);
  };

  const handleToggleActive = (id: string) => {
    const updated = paymentMethods.map(m => m.id === id ? { ...m, isActive: !m.isActive } : m);
    onUpdatePaymentMethods(updated);
    const target = updated.find(m => m.id === id);
    handleShowNotice(`تم ${target?.isActive ? 'تفعيل' : 'إيقاف'} وسيلة الدفع (${target?.nameAr}) وتحديث ظهورها في شاشة الكاشير فوراً.`);
  };

  const handleAddMethod = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nameAr || !formData.code) return;

    const newM: PaymentMethodRecord = {
      id: `pm-${Date.now()}`,
      code: formData.code.toLowerCase().replace(/\s+/g, '_'),
      nameAr: formData.nameAr,
      nameEn: formData.nameEn || formData.nameAr,
      type: (formData.type as any) || 'card_pos',
      commissionPercent: Number(formData.commissionPercent) || 0,
      linkedAccountId: formData.linkedAccountId || '10101',
      linkedAccountName: formData.linkedAccountName || 'حساب الخزينة الرئيسي',
      isActive: true,
      requiresReferenceNumber: !!formData.requiresReferenceNumber,
      isExclusiveToCashier: true,
      iconName: formData.iconName || 'CreditCard'
    };

    const updated = [...paymentMethods, newM];
    onUpdatePaymentMethods(updated);
    setShowAddModal(false);
    setFormData({
      code: '',
      nameAr: '',
      nameEn: '',
      type: 'card_pos',
      commissionPercent: 1.0,
      linkedAccountId: '10201',
      linkedAccountName: 'حساب جاري البنك الأهلي المصري',
      isActive: true,
      requiresReferenceNumber: true,
      isExclusiveToCashier: true,
      iconName: 'CreditCard'
    });
    handleShowNotice(`تمت إضافة وسيلة السداد (${newM.nameAr}) وربطها حصراً بشاشة الكاشير بنجاح!`);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMethod) return;

    const updated = paymentMethods.map(m => m.id === editingMethod.id ? editingMethod : m);
    onUpdatePaymentMethods(updated);
    handleShowNotice(`تم تحديث إعدادات وسيلة السداد (${editingMethod.nameAr}) بنجاح.`);
    setEditingMethod(null);
  };

  const getMethodIcon = (iconName: string) => {
    switch (iconName) {
      case 'Banknote': return <Banknote className="w-5 h-5 text-emerald-600" />;
      case 'CreditCard': return <CreditCard className="w-5 h-5 text-sky-600" />;
      case 'QrCode': return <QrCode className="w-5 h-5 text-amber-600" />;
      case 'Smartphone': return <Smartphone className="w-5 h-5 text-purple-600" />;
      case 'Building2': return <Building2 className="w-5 h-5 text-indigo-600" />;
      default: return <CreditCard className="w-5 h-5 text-sky-600" />;
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-800 text-xs font-semibold border border-purple-200 mb-2">
            <Lock className="w-3.5 h-3.5 text-purple-600" />
            <span>ربط حصري بشاشة الكاشير (Exclusive POS Terminal Binding)</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 font-['Cairo'] flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-purple-600" />
            <span>شاشة إدارة طرق السداد وربطها الحصري بشاشة الكاشير</span>
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            تحديد وسائل الدفع المعتمدة للمنشأة، نسب العمولات البنكية، أرقام الإيصالات، والحساب المالي المرتبط باليومية العامة.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onNavigateToPos && (
            <button
              onClick={onNavigateToPos}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
            >
              <ShoppingCart className="w-4 h-4 text-slate-600" />
              <span>معاينة في الكاشير</span>
            </button>
          )}

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة طريقة سداد جديدة</span>
          </button>
        </div>
      </div>

      {notice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Cashier Synchronization Status */}
      <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">
            POS
          </div>
          <div>
            <h4 className="font-extrabold text-purple-900">المزامنة الحصرية مع شاشة نقاط البيع (POS Terminal)</h4>
            <p className="text-[11px] text-purple-700">
              طرق السداد النشطة هنا ({paymentMethods.filter(m => m.isActive).length}) هي حصراً فقط التي تظهر للكاشير في نافذة الدفع وإصدار الفواتير.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] bg-white border border-purple-200 text-purple-800 px-3 py-1 rounded-lg font-bold">
            sales.payment_methods ⟷ pos_terminal
          </span>
        </div>
      </div>

      {/* Payment Methods Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paymentMethods.map(method => (
          <div 
            key={method.id} 
            className={`p-5 bg-white rounded-2xl border transition-all space-y-4 shadow-xs relative ${
              method.isActive ? 'border-slate-200 hover:border-purple-300' : 'border-slate-200 opacity-60 bg-slate-50'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200">
                  {getMethodIcon(method.iconName)}
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">{method.nameAr}</h3>
                  <span className="text-[10px] text-slate-400 font-mono">{method.nameEn}</span>
                </div>
              </div>

              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                method.isActive 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : 'bg-slate-100 text-slate-500 border-slate-200'
              }`}>
                {method.isActive ? 'نشط في الكاشير' : 'معطل'}
              </span>
            </div>

            <div className="space-y-2 text-xs pt-2 border-t border-slate-100 font-mono">
              <div className="flex justify-between text-slate-600">
                <span className="font-['Cairo'] text-slate-500">كود الوسيلة:</span>
                <span className="font-bold text-slate-800">{method.code}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span className="font-['Cairo'] text-slate-500">عمولة البنك / البوابة:</span>
                <span className="font-bold text-amber-700">{method.commissionPercent}%</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span className="font-['Cairo'] text-slate-500">رقم الإيصال بنكياً:</span>
                <span className="font-['Cairo'] font-bold text-slate-800">
                  {method.requiresReferenceNumber ? 'مطلوب إدخاله' : 'غير مطلوب (نقدي)'}
                </span>
              </div>
              <div className="pt-1 text-[11px] text-purple-900 bg-purple-50/60 p-2 rounded-lg border border-purple-100 font-['Cairo']">
                <span className="font-bold block text-[10px] text-purple-600">الحساب المالي المرتبط (Ledger):</span>
                <span>{method.linkedAccountId} - {method.linkedAccountName}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handleToggleActive(method.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  method.isActive 
                    ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100' 
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                {method.isActive ? 'تعطيل في الكاشير' : 'تفعيل في الكاشير'}
              </button>

              <button
                type="button"
                onClick={() => setEditingMethod({ ...method })}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>تعديل</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form onSubmit={handleAddMethod} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-purple-600" />
                <span>إضافة طريقة سداد مخصصة للكاشير</span>
              </h3>
              <button type="button" onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم وسيلة السداد بالعربية *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: محفظة كليفر (Klarna / ValU)"
                  value={formData.nameAr}
                  onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">كود الوسيلة (Code) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. valu_installment"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">نسبة العمولة %</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.commissionPercent}
                    onChange={(e) => setFormData({ ...formData, commissionPercent: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">الأيقونة المعروضة</label>
                  <select
                    value={formData.iconName}
                    onChange={(e) => setFormData({ ...formData, iconName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  >
                    <option value="CreditCard">بطاقة بنكية (CreditCard)</option>
                    <option value="Banknote">نقدية (Banknote)</option>
                    <option value="QrCode">رمز استجابة (QrCode)</option>
                    <option value="Smartphone">محفظة هاتف (Smartphone)</option>
                    <option value="Building2">حساب فندقي (Building2)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الحساب المالي المرتبط بالدليل المحاسبي</label>
                <select
                  value={formData.linkedAccountId}
                  onChange={(e) => {
                    const id = e.target.value;
                    const name = id === '10101' ? 'نقدية بالصندوق والخزينة الرئيسية' :
                                 id === '10201' ? 'حساب جاري البنك الأهلي المصري' :
                                 id === '10202' ? 'حساب بنك مصر - تحويلات إنستاباي' :
                                 'محفظة الشركة الإلكترونية المعتمدة';
                    setFormData({ ...formData, linkedAccountId: id, linkedAccountName: name });
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                >
                  <option value="10101">10101 - نقدية بالصندوق والخزينة الرئيسية</option>
                  <option value="10201">10201 - حساب جاري البنك الأهلي المصري</option>
                  <option value="10202">10202 - حساب بنك مصر - تحويلات إنستاباي</option>
                  <option value="10203">10203 - محفظة الشركة الإلكترونية المعتمدة</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="reqRef"
                  checked={formData.requiresReferenceNumber}
                  onChange={(e) => setFormData({ ...formData, requiresReferenceNumber: e.target.checked })}
                  className="rounded text-purple-600"
                />
                <label htmlFor="reqRef" className="font-bold text-slate-700 cursor-pointer">
                  إلزام الكاشير بإدخال رقم مرجع العملية البنكية (Reference Number)
                </label>
              </div>
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
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/20"
              >
                تأكيد الإضافة
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Modal */}
      {editingMethod && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form onSubmit={handleSaveEdit} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Pencil className="w-4 h-4 text-purple-600" />
                <span>تعديل وسيلة السداد ({editingMethod.nameAr})</span>
              </h3>
              <button type="button" onClick={() => setEditingMethod(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">الاسم بالعربية</label>
                <input
                  type="text"
                  required
                  value={editingMethod.nameAr}
                  onChange={(e) => setEditingMethod({ ...editingMethod, nameAr: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">نسبة العمولة %</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={editingMethod.commissionPercent}
                  onChange={(e) => setEditingMethod({ ...editingMethod, commissionPercent: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الحساب المالي المرتبط</label>
                <select
                  value={editingMethod.linkedAccountId}
                  onChange={(e) => {
                    const id = e.target.value;
                    const name = id === '10101' ? 'نقدية بالصندوق والخزينة الرئيسية' :
                                 id === '10201' ? 'حساب جاري البنك الأهلي المصري' :
                                 id === '10202' ? 'حساب بنك مصر - تحويلات إنستاباي' :
                                 'محفظة الشركة الإلكترونية المعتمدة';
                    setEditingMethod({ ...editingMethod, linkedAccountId: id, linkedAccountName: name });
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                >
                  <option value="10101">10101 - نقدية بالصندوق والخزينة الرئيسية</option>
                  <option value="10201">10201 - حساب جاري البنك الأهلي المصري</option>
                  <option value="10202">10202 - حساب بنك مصر - تحويلات إنستاباي</option>
                  <option value="10203">10203 - محفظة الشركة الإلكترونية المعتمدة</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="editReqRef"
                  checked={editingMethod.requiresReferenceNumber}
                  onChange={(e) => setEditingMethod({ ...editingMethod, requiresReferenceNumber: e.target.checked })}
                  className="rounded text-purple-600"
                />
                <label htmlFor="editReqRef" className="font-bold text-slate-700 cursor-pointer">
                  طلب رقم مرجع العملية البنكية من الكاشير
                </label>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingMethod(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                حفظ التعديلات
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
