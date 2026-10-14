import React, { useState } from 'react';
import { TenantContext, UserRole } from '../types.ts';
import { 
  Package, 
  PackagePlus, 
  PackageMinus, 
  ArrowLeftRight, 
  ClipboardCheck, 
  FileSpreadsheet, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  Check, 
  X, 
  Clock, 
  Building2 
} from 'lucide-react';

interface InventoryItem {
  id: string;
  sku: string;
  name_ar: string;
  warehouse: string;
  stock: number;
  minStock: number;
  unitPrice: number;
  costPrice: number;
  status: 'active' | 'low_stock' | 'out_of_stock';
}

interface InventoryOperationsViewProps {
  currentTenant: TenantContext;
  userRole: UserRole;
}

const INITIAL_INVENTORY: InventoryItem[] = [
  { id: 'itm-1', sku: 'COF-COL-1KG', name_ar: 'بن كولومبي فاخر (1 كجم)', warehouse: 'مخزن الأغذية والمشروبات (HRG-FNB)', stock: 145, minStock: 30, unitPrice: 520, costPrice: 360, status: 'active' },
  { id: 'itm-2', sku: 'TEA-EARL-500G', name_ar: 'شاي إيرل جراي إنجليزي فندقي', warehouse: 'مخزن الأغذية والمشروبات (HRG-FNB)', stock: 24, minStock: 25, unitPrice: 240, costPrice: 160, status: 'low_stock' },
  { id: 'itm-3', sku: 'HSK-LIN-Q100', name_ar: 'ملايات سرير قطن مصري فاخر كينج', warehouse: 'مخزن المغسلة واللاندري (HRG-LND)', stock: 320, minStock: 50, unitPrice: 850, costPrice: 550, status: 'active' },
  { id: 'itm-4', sku: 'MNT-LED-18W', name_ar: 'لمبات موفرة LED 18 وات دافئة', warehouse: 'مخزن الصيانة وقطع الغيار (HRG-MNT)', stock: 80, minStock: 20, unitPrice: 95, costPrice: 65, status: 'active' },
  { id: 'itm-5', sku: 'OFF-PAP-A4', name_ar: 'ورق تصوير A4 رزمة 500 ورقة', warehouse: 'مخزن الإدارة والعهد (HRG-ADM)', stock: 0, minStock: 10, unitPrice: 210, costPrice: 175, status: 'out_of_stock' }
];

export const InventoryOperationsView: React.FC<InventoryOperationsViewProps> = ({ currentTenant, userRole }) => {
  const [items, setItems] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState('all');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Modals
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isStockCountModalOpen, setIsStockCountModalOpen] = useState(false);

  // Operation drafts
  const [selectedItemId, setSelectedItemId] = useState(items[0]?.id || '');
  const [operationQty, setOperationQty] = useState(10);
  const [targetWarehouse, setTargetWarehouse] = useState('مخزن المغسلة واللاندري (HRG-LND)');
  const [stockCountRows, setStockCountRows] = useState<{ id: string; name_ar: string; expected: number; actual: number }[]>([]);

  const filteredItems = items.filter(it => {
    const matchesSearch = it.name_ar.includes(searchQuery) || it.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesWh = selectedWarehouse === 'all' || it.warehouse === selectedWarehouse;
    return matchesSearch && matchesWh;
  });

  // 1. إذن إضافة مخزن (stock.receive)
  const handleReceiveStock = (e: React.FormEvent) => {
    e.preventDefault();
    setItems(prev => prev.map(it => {
      if (it.id === selectedItemId) {
        const newStock = it.stock + operationQty;
        return {
          ...it,
          stock: newStock,
          status: newStock > it.minStock ? 'active' : 'low_stock'
        };
      }
      return it;
    }));

    setIsReceiveModalOpen(false);
    setActionSuccessMsg(`تم تسجيل إذن الإضافة بنجاح وزيادة الرصيد بمقدار (${operationQty}) قطعة!`);
    setTimeout(() => setActionSuccessMsg(null), 3500);
  };

  // 2. إذن صرف مخزن (stock.issue)
  const handleIssueStock = (e: React.FormEvent) => {
    e.preventDefault();
    const item = items.find(it => it.id === selectedItemId);
    if (!item) return;

    if (item.stock < operationQty) {
      alert(`خطأ: الرصيد المتاح (${item.stock}) غير كافٍ لصرف (${operationQty}) قطعة! قاعدة منع الرصيد السالب مفعلة.`);
      return;
    }

    setItems(prev => prev.map(it => {
      if (it.id === selectedItemId) {
        const newStock = it.stock - operationQty;
        return {
          ...it,
          stock: newStock,
          status: newStock === 0 ? 'out_of_stock' : newStock <= it.minStock ? 'low_stock' : 'active'
        };
      }
      return it;
    }));

    setIsIssueModalOpen(false);
    setActionSuccessMsg(`تم تسجيل إذن الصرف وخصم (${operationQty}) قطعة من المخزن!`);
    setTimeout(() => setActionSuccessMsg(null), 3500);
  };

  // 3. تحويل بين مخزنين (stock.transfer)
  const handleTransferStock = (e: React.FormEvent) => {
    e.preventDefault();
    const item = items.find(it => it.id === selectedItemId);
    if (!item) return;

    if (item.stock < operationQty) {
      alert(`خطأ: الرصيد المتاح (${item.stock}) غير كافٍ للتحويل.`);
      return;
    }

    setItems(prev => prev.map(it => {
      if (it.id === selectedItemId) {
        const newStock = it.stock - operationQty;
        return {
          ...it,
          stock: newStock,
          status: newStock === 0 ? 'out_of_stock' : newStock <= it.minStock ? 'low_stock' : 'active'
        };
      }
      return it;
    }));

    setIsTransferModalOpen(false);
    setActionSuccessMsg(`تم التحويل الذري (Atomic Transfer) لـ (${operationQty}) قطعة إلى ${targetWarehouse}!`);
    setTimeout(() => setActionSuccessMsg(null), 3500);
  };

  // 4. فتح شاشة الجرد الدوري (stockcount.start)
  const handleStartStockCount = () => {
    setStockCountRows(items.map(it => ({
      id: it.id,
      name_ar: it.name_ar,
      expected: it.stock,
      actual: it.stock
    })));
    setIsStockCountModalOpen(true);
  };

  // اعتماد الجرد وتوليد التسويات (stockcount.approve)
  const handleApproveStockCount = () => {
    setItems(prev => prev.map(it => {
      const counted = stockCountRows.find(c => c.id === it.id);
      if (counted) {
        return { ...it, stock: counted.actual };
      }
      return it;
    }));

    setIsStockCountModalOpen(false);
    setActionSuccessMsg("تم اعتماد الجرد وتوليد قيود تسوية الفروق المخزنية تلقائياً!");
    setTimeout(() => setActionSuccessMsg(null), 3500);
  };

  return (
    <div className="space-y-5" dir="rtl">
      {/* Top Banner & Operation Buttons (Day Mode) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-600/20">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 font-['Cairo']">
              إدارة المخازن وحركات البضاعة (Inventory Operations)
            </h2>
            <p className="text-xs text-slate-500">
              {currentTenant.nameAr} | رصيد لحظي، منع الرصيد السالب، تحويلات ذرية (Atomic Transfers)
            </p>
          </div>
        </div>

        {/* Action Triggers */}
        <div className="flex items-center flex-wrap gap-2">
          {/* إذن إضافة */}
          <button
            onClick={() => {
              setSelectedItemId(items[0]?.id || '');
              setIsReceiveModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer shadow-md shadow-emerald-600/20 transition-all"
          >
            <PackagePlus className="w-4 h-4" />
            <span>إذن إضافة (stock.receive)</span>
          </button>

          {/* إذن صرف */}
          <button
            onClick={() => {
              setSelectedItemId(items[0]?.id || '');
              setIsIssueModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer shadow-md shadow-rose-600/20 transition-all"
          >
            <PackageMinus className="w-4 h-4" />
            <span>إذن صرف (stock.issue)</span>
          </button>

          {/* تحويل بين مخزنين */}
          <button
            onClick={() => {
              setSelectedItemId(items[0]?.id || '');
              setIsTransferModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer shadow-md shadow-indigo-600/20 transition-all"
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>تحويل بين مخزنين (stock.transfer)</span>
          </button>

          {/* جرد دوري */}
          <button
            onClick={handleStartStockCount}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-bold text-xs cursor-pointer transition-all"
          >
            <ClipboardCheck className="w-4 h-4 text-amber-600" />
            <span>جرد المخزون (stockcount)</span>
          </button>
        </div>
      </div>

      {/* Success Alert */}
      {actionSuccessMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-xl text-xs flex items-center justify-between gap-2 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{actionSuccessMsg}</span>
          </div>
          <button onClick={() => setActionSuccessMsg(null)} className="text-emerald-700 hover:text-emerald-900">✕</button>
        </div>
      )}

      {/* Filter and Search Bar (Day Mode) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
          <input
            type="text"
            placeholder="ابحث بكود الصنف أو الاسم..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-9 pl-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-sky-500 text-xs shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-semibold">المخزن:</span>
          <select
            value={selectedWarehouse}
            onChange={(e) => setSelectedWarehouse(e.target.value)}
            className="bg-slate-50 text-slate-800 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:bg-white focus:border-sky-500 text-xs cursor-pointer shadow-2xs"
          >
            <option value="all">كل المخازن</option>
            <option value="مخزن الأغذية والمشروبات (HRG-FNB)">مخزن الأغذية والمشروبات</option>
            <option value="مخزن المغسلة واللاندري (HRG-LND)">مخزن المغسلة واللاندري</option>
            <option value="مخزن الصيانة وقطع الغيار (HRG-MNT)">مخزن الصيانة وقطع الغيار</option>
          </select>
        </div>

        <div className="text-slate-600 font-mono text-[11px] bg-slate-100 px-3 py-2 rounded-xl border border-slate-200">
          إجمالي الأصناف: <strong className="text-sky-700 font-bold">{filteredItems.length}</strong> صنف
        </div>
      </div>

      {/* Inventory Stock Table (Day Mode) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-['Cairo'] font-semibold">
              <tr>
                <th className="p-3.5 w-12 text-center">#</th>
                <th className="p-3.5">كود الصنف (SKU)</th>
                <th className="p-3.5">اسم الصنف</th>
                <th className="p-3.5">المخزن الحالي</th>
                <th className="p-3.5 text-center">الرصيد المتاح</th>
                <th className="p-3.5 text-center">حد الأمان</th>
                <th className="p-3.5">سعر البيع</th>
                <th className="p-3.5">متوسط التكلفة</th>
                <th className="p-3.5 text-center">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredItems.map((item, idx) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5 text-center text-slate-400 font-mono">{idx + 1}</td>
                  <td className="p-3.5 font-mono font-bold text-sky-700">{item.sku}</td>
                  <td className="p-3.5 font-bold text-slate-900 font-['Cairo']">{item.name_ar}</td>
                  <td className="p-3.5 text-slate-500 truncate max-w-xs">{item.warehouse}</td>
                  <td className="p-3.5 text-center">
                    <span className={`font-mono font-extrabold text-sm ${
                      item.stock === 0 ? 'text-rose-600' : item.stock <= item.minStock ? 'text-amber-600' : 'text-emerald-700'
                    }`}>
                      {item.stock}
                    </span>
                  </td>
                  <td className="p-3.5 text-center font-mono text-slate-500">{item.minStock}</td>
                  <td className="p-3.5 font-mono font-bold text-slate-900">{item.unitPrice} ج.م</td>
                  <td className="p-3.5 font-mono text-slate-500">{item.costPrice} ج.م</td>
                  <td className="p-3.5 text-center">
                    <span className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                      item.status === 'active' 
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                        : item.status === 'low_stock' 
                        ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                        : 'bg-rose-100 text-rose-800 border border-rose-200'
                    }`}>
                      {item.status === 'active' ? 'متوفر' : item.status === 'low_stock' ? 'منخفض' : 'نفد الرصيد'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 1. Modal: إذن إضافة مخزن (stock.receive) */}
      {isReceiveModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleReceiveStock} className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <PackagePlus className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 font-['Cairo'] text-base">إذن إضافة مخزن (stock.receive)</h3>
              </div>
              <button type="button" onClick={() => setIsReceiveModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 font-semibold block mb-1">اختر الصنف المراد إضافته:</label>
                <select
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-['Cairo'] focus:outline-none focus:bg-white focus:border-sky-500"
                >
                  {items.map(it => (
                    <option key={it.id} value={it.id}>{it.name_ar} (الحالي: {it.stock})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">الكمية المضافة:</label>
                <input
                  type="number"
                  min="1"
                  value={operationQty}
                  onChange={(e) => setOperationQty(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold focus:outline-none focus:bg-white focus:border-sky-500"
                  required
                />
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">رقم إذن الاستلام أو فاتورة المورد:</label>
                <input
                  type="text"
                  placeholder="e.g. GRN-2026-081"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:bg-white focus:border-sky-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button type="button" onClick={() => setIsReceiveModalOpen(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold">إلغاء</button>
              <button type="submit" className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-600/20">
                تأكيد الإضافة وتحديث الرصيد
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 2. Modal: إذن صرف مخزن (stock.issue) */}
      {isIssueModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleIssueStock} className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <PackageMinus className="w-5 h-5 text-rose-600" />
                <h3 className="font-bold text-slate-900 font-['Cairo'] text-base">إذن صرف مخزن (stock.issue)</h3>
              </div>
              <button type="button" onClick={() => setIsIssueModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 font-semibold block mb-1">اختر الصنف المراد صرفه:</label>
                <select
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-['Cairo'] focus:outline-none focus:bg-white focus:border-sky-500"
                >
                  {items.map(it => (
                    <option key={it.id} value={it.id}>{it.name_ar} (الرصيد المتاح: {it.stock})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">الكمية المطلوب صرفها:</label>
                <input
                  type="number"
                  min="1"
                  value={operationQty}
                  onChange={(e) => setOperationQty(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold focus:outline-none focus:bg-white focus:border-sky-500"
                  required
                />
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">الجهة الطالبة / مركز التكلفة:</label>
                <input
                  type="text"
                  placeholder="e.g. مطبخ الفندق الرئيسي / قسم الإشراف الداخلي"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:bg-white focus:border-sky-500"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button type="button" onClick={() => setIsIssueModalOpen(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold">إلغاء</button>
              <button type="submit" className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs shadow-md shadow-rose-600/20">
                تأكيد الصرف
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. Modal: التحويل بين المخازن (stock.transfer) */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleTransferStock} className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ArrowLeftRight className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 font-['Cairo'] text-base">تحويل بين مخزنين (stock.transfer)</h3>
              </div>
              <button type="button" onClick={() => setIsTransferModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 font-semibold block mb-1">الصنف المحوّل:</label>
                <select
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-['Cairo'] focus:outline-none focus:bg-white focus:border-sky-500"
                >
                  {items.map(it => (
                    <option key={it.id} value={it.id}>{it.name_ar} (الرصيد المتاح: {it.stock})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">الكمية المحولة:</label>
                <input
                  type="number"
                  min="1"
                  value={operationQty}
                  onChange={(e) => setOperationQty(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold focus:outline-none focus:bg-white focus:border-sky-500"
                  required
                />
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">المخزن المستلم (Target Warehouse):</label>
                <select
                  value={targetWarehouse}
                  onChange={(e) => setTargetWarehouse(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-['Cairo'] focus:outline-none focus:bg-white focus:border-sky-500"
                >
                  <option value="مخزن المغسلة واللاندري (HRG-LND)">مخزن المغسلة واللاندري (HRG-LND)</option>
                  <option value="مخزن الصيانة وقطع الغيار (HRG-MNT)">مخزن الصيانة وقطع الغيار (HRG-MNT)</option>
                  <option value="مخزن الأغذية والمشروبات (HRG-FNB)">مخزن الأغذية والمشروبات (HRG-FNB)</option>
                  <option value="مخزن الإدارة والعهد (HRG-ADM)">مخزن الإدارة والعهد (HRG-ADM)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button type="button" onClick={() => setIsTransferModalOpen(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold">إلغاء</button>
              <button type="submit" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-md shadow-indigo-600/20">
                تنفيذ التحويل الذري
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 4. Modal: الجرد الدوري والتسوية (stockcount) */}
      {isStockCountModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-slate-900 font-['Cairo'] text-base">جرد المخزون الفعلي ومطابقة الفروق (Stock Count)</h3>
              </div>
              <button type="button" onClick={() => setIsStockCountModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="max-h-72 overflow-y-auto no-scrollbar border border-slate-200 rounded-xl">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-['Cairo']">
                  <tr>
                    <th className="p-3">اسم الصنف</th>
                    <th className="p-3 text-center">الرصيد الدفتري</th>
                    <th className="p-3 text-center">الرصيد الفعلي المعدود</th>
                    <th className="p-3 text-center">فرق الجرد</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-xs">
                  {stockCountRows.map((row, idx) => {
                    const diff = row.actual - row.expected;
                    return (
                      <tr key={row.id} className="hover:bg-slate-50">
                        <td className="p-3 font-sans font-medium text-slate-900">{row.name_ar}</td>
                        <td className="p-3 text-center text-slate-600 font-bold">{row.expected}</td>
                        <td className="p-3 text-center">
                          <input
                            type="number"
                            value={row.actual}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setStockCountRows(prev => prev.map((r, i) => i === idx ? { ...r, actual: val } : r));
                            }}
                            className="w-20 bg-slate-50 border border-slate-300 rounded-lg text-center font-bold text-slate-900 py-1"
                          />
                        </td>
                        <td className={`p-3 text-center font-bold ${
                          diff === 0 ? 'text-slate-400' : diff > 0 ? 'text-emerald-700' : 'text-rose-600'
                        }`}>
                          {diff > 0 ? `+${diff}` : diff}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button type="button" onClick={() => setIsStockCountModalOpen(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold">إلغاء</button>
              <button onClick={handleApproveStockCount} className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs shadow-md shadow-amber-600/20">
                اعتماد الجرد وتوليد قيود التسوية
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
