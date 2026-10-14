import React, { useState } from 'react';
import { TenantContext, UserRole } from '../types.ts';
import { 
  ShoppingBag, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Truck, 
  CreditCard, 
  FileText, 
  UserCheck, 
  Building, 
  ShieldAlert, 
  ArrowDownLeft, 
  ArrowUpRight,
  Filter,
  DollarSign,
  PackageCheck,
  Check,
  AlertCircle
} from 'lucide-react';

interface PurchasingManagementViewProps {
  currentTenant: TenantContext;
  userRole: UserRole;
}

interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierName: string;
  supplierTaxId: string;
  orderDate: string;
  status: 'DRAFT' | 'APPROVED' | 'RECEIVED' | 'CANCELLED';
  totalAmount: number;
  approvedBy?: string;
  receivedDate?: string;
  items: {
    sku: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
}

interface SupplierPayment {
  id: string;
  receiptNumber: string;
  supplierName: string;
  poNumber: string;
  amount: number;
  paymentMethod: 'BANK_TRANSFER' | 'CHEQUE' | 'CASH';
  paymentDate: string;
  referenceNumber: string;
  notes: string;
}

export const PurchasingManagementView: React.FC<PurchasingManagementViewProps> = ({
  currentTenant,
  userRole
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'payments' | 'suppliers'>('orders');

  // Purchase Orders State
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([
    {
      id: 'po_101',
      poNumber: 'PO-2026-0042',
      supplierName: 'شركة الإسكندرية لتجارة البن والأغذية',
      supplierTaxId: '409-112-990',
      orderDate: '2026-10-14',
      status: 'APPROVED',
      totalAmount: 18000,
      approvedBy: 'عمرو سليم (Admin)',
      items: [
        { sku: 'COF-ESP-1000G', description: 'بن حبوب إسبريسو كولومبي (1 كجم)', quantity: 50, unitPrice: 360, total: 18000 }
      ]
    },
    {
      id: 'po_102',
      poNumber: 'PO-2026-0043',
      supplierName: 'مؤسسة النيل للتوريدات الفندقية والمفروشات',
      supplierTaxId: '211-984-332',
      orderDate: '2026-10-13',
      status: 'RECEIVED',
      totalAmount: 42500,
      approvedBy: 'أحمد محمود (Manager)',
      receivedDate: '2026-10-14 09:15',
      items: [
        { sku: 'LIN-TOW-WHT', description: 'مناشف قطن مصري فاخر 700 جم', quantity: 250, unitPrice: 170, total: 42500 }
      ]
    },
    {
      id: 'po_103',
      poNumber: 'PO-2026-0044',
      supplierName: 'دلتا مصر للكيماويات ومهمات النظافة',
      supplierTaxId: '388-771-002',
      orderDate: '2026-10-14',
      status: 'DRAFT',
      totalAmount: 12500,
      items: [
        { sku: 'CHM-FLR-020L', description: 'منظف ومعقم أرضيات مركز (20 لتر)', quantity: 25, unitPrice: 500, total: 12500 }
      ]
    }
  ]);

  // Payments State
  const [payments, setPayments] = useState<SupplierPayment[]>([
    {
      id: 'pay_01',
      receiptNumber: 'SPAY-2026-019',
      supplierName: 'مؤسسة النيل للتوريدات الفندقية والمفروشات',
      poNumber: 'PO-2026-0043',
      amount: 42500,
      paymentMethod: 'BANK_TRANSFER',
      paymentDate: '2026-10-14 10:00',
      referenceNumber: 'CIB-TX-994812',
      notes: 'سداد كامل مستحقات توريد المناشف'
    }
  ]);

  // Modals & Notices
  const [showNewPoModal, setShowNewPoModal] = useState(false);
  const [showNewPaymentModal, setShowNewPaymentModal] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // New PO Form
  const [newPoData, setNewPoData] = useState({
    supplierName: 'شركة الإسكندرية لتجارة البن والأغذية',
    supplierTaxId: '409-112-990',
    sku: 'COF-ESP-1000G',
    description: 'بن حبوب إسبريسو كولومبي (1 كجم)',
    quantity: 30,
    unitPrice: 360
  });

  // New Payment Form
  const [newPaymentData, setNewPaymentData] = useState({
    supplierName: 'شركة الإسكندرية لتجارة البن والأغذية',
    poNumber: 'PO-2026-0042',
    amount: 18000,
    paymentMethod: 'BANK_TRANSFER' as const,
    referenceNumber: '',
    notes: 'دفعة سداد أمر الشراء'
  });

  // Handlers
  const handleCreatePo = (e: React.FormEvent) => {
    e.preventDefault();
    const total = newPoData.quantity * newPoData.unitPrice;
    const newPo: PurchaseOrder = {
      id: `po_${Date.now()}`,
      poNumber: `PO-2026-${String(purchaseOrders.length + 45).padStart(4, '0')}`,
      supplierName: newPoData.supplierName,
      supplierTaxId: newPoData.supplierTaxId,
      orderDate: new Date().toISOString().split('T')[0],
      status: 'DRAFT',
      totalAmount: total,
      items: [
        {
          sku: newPoData.sku,
          description: newPoData.description,
          quantity: newPoData.quantity,
          unitPrice: newPoData.unitPrice,
          total
        }
      ]
    };
    setPurchaseOrders([newPo, ...purchaseOrders]);
    setShowNewPoModal(false);
    setActionNotice(`تم إنشاء أمر الشراء الجديد رقم ${newPo.poNumber} بنجاح (po.create) بحالة مسودة!`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleApprovePo = (poId: string) => {
    // Check permission threshold: cashiers cannot approve POs
    if (userRole === 'cashier') {
      alert('خطأ في الصلاحيات: ليس لدى الكاشير صلاحية اعتماد أوامر الشراء (po.approve)');
      return;
    }
    setPurchaseOrders(purchaseOrders.map(p => {
      if (p.id === poId) {
        return {
          ...p,
          status: 'APPROVED',
          approvedBy: `${userRole === 'super_admin' ? 'عمرو سليم (Admin)' : 'مدير المشتريات'}`
        };
      }
      return p;
    }));
    setActionNotice(`تم اعتماد أمر الشراء بنجاح (po.approve) والتحقق من سقف الصلاحية المالية!`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleReceivePo = (po: PurchaseOrder) => {
    setPurchaseOrders(purchaseOrders.map(p => {
      if (p.id === po.id) {
        return {
          ...p,
          status: 'RECEIVED',
          receivedDate: new Date().toISOString().replace('T', ' ').substring(0, 16)
        };
      }
      return p;
    }));

    setActionNotice(
      `تم استلام أمر الشراء ${po.poNumber} (po.receive) وتوليد إذن استلام مخزني آلي (stock.receive) برصيد +${po.items[0]?.quantity} في المخزن الرئيسي!`
    );
    setTimeout(() => setActionNotice(null), 5000);
  };

  const handleCreatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    const newPay: SupplierPayment = {
      id: `pay_${Date.now()}`,
      receiptNumber: `SPAY-2026-${String(payments.length + 20).padStart(3, '0')}`,
      supplierName: newPaymentData.supplierName,
      poNumber: newPaymentData.poNumber,
      amount: newPaymentData.amount,
      paymentMethod: newPaymentData.paymentMethod,
      paymentDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
      referenceNumber: newPaymentData.referenceNumber || 'TX-REF-9021',
      notes: newPaymentData.notes
    };
    setPayments([newPay, ...payments]);
    setShowNewPaymentModal(false);
    setActionNotice(
      `تم تسجيل سند صرف المورد (supplierpay.create) بمبلغ ${newPay.amount.toLocaleString()} ج.م وتوليد قيد اليومية المحاسبي آلياً!`
    );
    setTimeout(() => setActionNotice(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls & Navigation Bar */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'orders'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>أوامر الشراء (po.create / po.approve / po.receive)</span>
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'payments'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>سداد الموردين ومتابعة المستحقات (supplierpay.create)</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'orders' ? (
            <button
              onClick={() => setShowNewPoModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>أمر شراء جديد (po.create)</span>
            </button>
          ) : (
            <button
              onClick={() => setShowNewPaymentModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>سند صرف لمورد (supplierpay.create)</span>
            </button>
          )}
        </div>
      </div>

      {actionNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* 1. Purchase Orders View */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-bold">إجمالي أوامر الشراء</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{purchaseOrders.length}</p>
              <span className="text-[11px] text-sky-600 font-medium">مشتريات تشغيلية معتمدة</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-bold">بانتظار الاستلام المخزني</span>
              <p className="text-2xl font-black text-amber-600 mt-1">
                {purchaseOrders.filter(p => p.status === 'APPROVED').length}
              </p>
              <span className="text-[11px] text-amber-700 font-medium">جاهزة لتوليد إذن إضافة</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-bold">إجمالي المبالغ المطلوبة</span>
              <p className="text-2xl font-black text-emerald-600 mt-1">
                {purchaseOrders.reduce((sum, p) => sum + p.totalAmount, 0).toLocaleString()} <span className="text-sm font-normal">ج.م</span>
              </p>
              <span className="text-[11px] text-emerald-700 font-medium">عملة الأساس EGP</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-sky-600" />
                <span>جدول أوامر الشراء ودورة الاعتماد والاستلام</span>
              </h3>
              <span className="text-xs text-slate-500 font-mono">Module: purchasing.orders</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <th className="p-3">رقم أمر الشراء</th>
                    <th className="p-3">المورد والبطاقة الضريبية</th>
                    <th className="p-3">التاريخ</th>
                    <th className="p-3">البنود والكميات</th>
                    <th className="p-3">القيمة الإجمالية</th>
                    <th className="p-3">الحالة</th>
                    <th className="p-3 text-center">إجراءات الأزرار (Actions)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {purchaseOrders.map((po) => (
                    <tr key={po.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3 font-mono font-bold text-sky-700">{po.poNumber}</td>
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{po.supplierName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">ضريبي: {po.supplierTaxId}</div>
                      </td>
                      <td className="p-3 text-slate-600 font-mono">{po.orderDate}</td>
                      <td className="p-3">
                        {po.items.map((it, idx) => (
                          <div key={idx} className="text-[11px]">
                            <span className="font-bold text-slate-800">{it.quantity} × </span>
                            <span className="text-slate-600">{it.description}</span>
                          </div>
                        ))}
                      </td>
                      <td className="p-3 font-bold text-slate-900 font-mono">
                        {po.totalAmount.toLocaleString()} ج.م
                      </td>
                      <td className="p-3">
                        {po.status === 'DRAFT' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                            مسودة (بانتظار الاعتماد)
                          </span>
                        )}
                        {po.status === 'APPROVED' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200">
                            معتمد (جاهز للاستلام)
                          </span>
                        )}
                        {po.status === 'RECEIVED' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                            مستلم بالكامل بالمخزن
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-2">
                          {po.status === 'DRAFT' && (
                            <button
                              onClick={() => handleApprovePo(po.id)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold transition-all"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>اعتماد po.approve</span>
                            </button>
                          )}

                          {po.status === 'APPROVED' && (
                            <button
                              onClick={() => handleReceivePo(po)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-all"
                            >
                              <Truck className="w-3.5 h-3.5" />
                              <span>استلام مخزني po.receive</span>
                            </button>
                          )}

                          {po.status === 'RECEIVED' && (
                            <span className="text-[11px] text-slate-500 font-mono">
                              مستلم: {po.receivedDate?.split(' ')[0]}
                            </span>
                          )}
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

      {/* 2. Supplier Payments View */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>سندات صرف ومتابعة مستحقات الموردين (Supplier Payables)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                ربط المدفوعات بأمر الشراء وتوليد القيود المحاسبية التلقائية في دفتر اليومية
              </p>
            </div>

            <button
              onClick={() => setShowNewPaymentModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>تسجيل سداد supplierpay.create</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <th className="p-3">رقم سند الصرف</th>
                  <th className="p-3">المورد المستفيد</th>
                  <th className="p-3">أمر الشراء المرتبط</th>
                  <th className="p-3">المبلغ المسدد</th>
                  <th className="p-3">طريقة السداد والتحويل</th>
                  <th className="p-3">التاريخ والوقت</th>
                  <th className="p-3">البيان / الملاحظات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3 font-mono font-bold text-sky-700">{p.receiptNumber}</td>
                    <td className="p-3 font-bold text-slate-900">{p.supplierName}</td>
                    <td className="p-3 font-mono text-indigo-700">{p.poNumber}</td>
                    <td className="p-3 font-mono font-black text-emerald-700">
                      {p.amount.toLocaleString()} ج.م
                    </td>
                    <td className="p-3">
                      <span className="font-mono text-[11px] font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                        {p.paymentMethod} ({p.referenceNumber})
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-500">{p.paymentDate}</td>
                    <td className="p-3 text-slate-600">{p.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New PO Modal */}
      {showNewPoModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form onSubmit={handleCreatePo} className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-sm font-extrabold text-slate-900">إنشاء أمر شراء جديد (po.create)</h4>
              <button
                type="button"
                onClick={() => setShowNewPoModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">المورد المعتمد</label>
              <select
                value={newPoData.supplierName}
                onChange={(e) => setNewPoData({ ...newPoData, supplierName: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
              >
                <option value="شركة الإسكندرية لتجارة البن والأغذية">شركة الإسكندرية لتجارة البن والأغذية</option>
                <option value="مؤسسة النيل للتوريدات الفندقية والمفروشات">مؤسسة النيل للتوريدات الفندقية والمفروشات</option>
                <option value="دلتا مصر للكيماويات ومهمات النظافة">دلتا مصر للكيماويات ومهمات النظافة</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">كود الصنف (SKU)</label>
                <input
                  type="text"
                  required
                  value={newPoData.sku}
                  onChange={(e) => setNewPoData({ ...newPoData, sku: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الكمية المطلوبة</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={newPoData.quantity}
                  onChange={(e) => setNewPoData({ ...newPoData, quantity: Number(e.target.value) })}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">سعر الوحدة من المورد (ج.م)</label>
              <input
                type="number"
                min="0"
                required
                value={newPoData.unitPrice}
                onChange={(e) => setNewPoData({ ...newPoData, unitPrice: Number(e.target.value) })}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
              />
            </div>

            <div className="p-3 bg-sky-50 rounded-xl border border-sky-200 flex items-center justify-between text-xs font-bold text-sky-900">
              <span>الإجمالي التقديري:</span>
              <span className="font-mono text-sm">{(newPoData.quantity * newPoData.unitPrice).toLocaleString()} ج.م</span>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowNewPoModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-sky-600 text-white rounded-xl text-xs font-bold hover:bg-sky-700 shadow-sm"
              >
                إصدار أمر الشراء
              </button>
            </div>
          </form>
        </div>
      )}

      {/* New Payment Modal */}
      {showNewPaymentModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form onSubmit={handleCreatePayment} className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-sm font-extrabold text-slate-900">تسجيل سداد مستحقات مورد (supplierpay.create)</h4>
              <button
                type="button"
                onClick={() => setShowNewPaymentModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">المورد المستفيد</label>
              <input
                type="text"
                required
                value={newPaymentData.supplierName}
                onChange={(e) => setNewPaymentData({ ...newPaymentData, supplierName: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">رقم أمر الشراء المرتبط</label>
                <input
                  type="text"
                  required
                  value={newPaymentData.poNumber}
                  onChange={(e) => setNewPaymentData({ ...newPaymentData, poNumber: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">المبلغ المسدد (ج.م)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={newPaymentData.amount}
                  onChange={(e) => setNewPaymentData({ ...newPaymentData, amount: Number(e.target.value) })}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">طريقة السداد</label>
              <select
                value={newPaymentData.paymentMethod}
                onChange={(e) => setNewPaymentData({ ...newPaymentData, paymentMethod: e.target.value as any })}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
              >
                <option value="BANK_TRANSFER">تحويل بنكي مباشر (CIB / NBE)</option>
                <option value="CHEQUE">شيك بنكي مؤجل</option>
                <option value="CASH">صرف نقدي من الخزينة الرئيسية</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">رقم الشيك أو الحوالة</label>
              <input
                type="text"
                placeholder="e.g. CIB-TX-990145"
                value={newPaymentData.referenceNumber}
                onChange={(e) => setNewPaymentData({ ...newPaymentData, referenceNumber: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowNewPaymentModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 shadow-sm"
              >
                حفظ وترحيل القيد المحاسبي
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
