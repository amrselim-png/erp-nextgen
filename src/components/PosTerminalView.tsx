import React, { useState } from 'react';
import { TenantContext, UserRole, PaymentMethodRecord } from '../types.ts';
import { 
  ShoppingCart, 
  Search, 
  Barcode, 
  Trash2, 
  Plus, 
  Minus, 
  CheckCircle2, 
  CreditCard, 
  Banknote, 
  QrCode, 
  Smartphone,
  Clock, 
  RotateCcw, 
  Percent, 
  Printer, 
  Building2, 
  Receipt, 
  Check, 
  AlertTriangle, 
  X, 
  ShieldCheck, 
  Lock 
} from 'lucide-react';

interface PosItem {
  id: string;
  sku: string;
  name_ar: string;
  category: string;
  price: number;
  stock: number;
  imageColor: string;
}

interface CartItem extends PosItem {
  qty: number;
}

interface PosTerminalViewProps {
  currentTenant: TenantContext;
  userRole: UserRole;
  paymentMethods?: PaymentMethodRecord[];
}

const POS_CATALOG: PosItem[] = [
  { id: 'pos-1', sku: 'COF-ESP-01', name_ar: 'إسبريسو سينجل فاخر', category: 'مشروبات وكافيه', price: 65, stock: 85, imageColor: 'from-amber-500 to-amber-700' },
  { id: 'pos-2', sku: 'COF-CAP-02', name_ar: 'كابتشينو إيطالي بحليب طازج', category: 'مشروبات وكافيه', price: 95, stock: 62, imageColor: 'from-amber-600 to-orange-700' },
  { id: 'pos-3', sku: 'TEA-GRN-03', name_ar: 'شاي أخضر بالنعناع المغربي', category: 'مشروبات وكافيه', price: 55, stock: 120, imageColor: 'from-emerald-500 to-teal-700' },
  { id: 'pos-4', sku: 'BEV-FRE-04', name_ar: 'عصير برتقال فريش طبيعي', category: 'مشروبات وكافيه', price: 80, stock: 45, imageColor: 'from-orange-400 to-amber-600' },
  { id: 'pos-5', sku: 'BAK-CRN-05', name_ar: 'كرواسون زبدة فرنسي سادة', category: 'مخبوزات وحلوى', price: 75, stock: 30, imageColor: 'from-yellow-500 to-amber-600' },
  { id: 'pos-6', sku: 'BAK-CHZ-06', name_ar: 'تشيز كيك بالتوت الأزرق', category: 'مخبوزات وحلوى', price: 135, stock: 18, imageColor: 'from-pink-500 to-rose-700' },
  { id: 'pos-7', sku: 'HSK-WAT-07', name_ar: 'مياه معدنية 600 مل', category: 'مشروبات وكافيه', price: 25, stock: 240, imageColor: 'from-sky-400 to-blue-600' },
  { id: 'pos-8', sku: 'HSK-TOW-08', name_ar: 'بشكير حمام قطن مصري فاخر', category: 'خدمات الغرف', price: 420, stock: 50, imageColor: 'from-indigo-400 to-purple-600' },
  { id: 'pos-9', sku: 'LND-SHT-09', name_ar: 'خدمة غسيل وكي قميص رجالي', category: 'خدمات الغرف', price: 90, stock: 999, imageColor: 'from-cyan-500 to-blue-700' }
];

export const PosTerminalView: React.FC<PosTerminalViewProps> = ({ currentTenant, userRole, paymentMethods }) => {
  const [catalog, setCatalog] = useState<PosItem[]>(POS_CATALOG);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [heldCarts, setHeldCarts] = useState<{ id: string; time: string; items: CartItem[]; total: number }[]>([]);
  
  // Modals
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');
  const [guestRoom, setGuestRoom] = useState<string>('الغرفة 204');
  const [lastInvoice, setLastInvoice] = useState<any | null>(null);

  // Shift state
  const [shiftStats, setShiftStats] = useState({
    openedAt: '08:00 ص',
    cashierName: 'كاشير الفرع الرئيسي',
    openingCash: 1500,
    salesTotal: 8420,
    ordersCount: 38
  });

  const categories = ['all', 'مشروبات وكافيه', 'مخبوزات وحلوى', 'خدمات الغرف'];

  // Add to Cart
  const handleAddToCart = (item: PosItem) => {
    if (item.stock <= 0) {
      alert('عذراً: رصيد الصنف نفد من المخزن!');
      return;
    }

    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  // Change Quantity
  const handleUpdateQty = (itemId: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === itemId) {
          const newQty = item.qty + delta;
          return newQty > 0 ? { ...item, qty: newQty } : null;
        }
        return item;
      }).filter(Boolean) as CartItem[];
    });
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const discountAmount = (subtotal * discountPercent) / 100;
  const taxableAmount = subtotal - discountAmount;
  const vatAmount = taxableAmount * 0.14; // 14% VAT
  const totalAmount = taxableAmount + vatAmount;

  // Hold Cart
  const handleHoldCart = () => {
    if (cart.length === 0) return;
    const newHold = {
      id: `HOLD-${Date.now().toString().slice(-4)}`,
      time: new Date().toLocaleTimeString('ar-EG'),
      items: [...cart],
      total: totalAmount
    };
    setHeldCarts([newHold, ...heldCarts]);
    setCart([]);
    setDiscountPercent(0);
  };

  // Retrieve Cart
  const handleRetrieveCart = (hold: any) => {
    setCart(hold.items);
    setHeldCarts(heldCarts.filter(h => h.id !== hold.id));
  };

  // Complete Payment (pos.pay)
  const handleCompletePayment = () => {
    if (cart.length === 0) return;

    const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    const invoiceData = {
      invoiceNumber,
      dateTime: new Date().toLocaleString('ar-EG'),
      tenantName: currentTenant.nameAr,
      branch: currentTenant.branch,
      items: [...cart],
      subtotal,
      discountAmount,
      vatAmount,
      totalAmount,
      paymentMethod,
      guestRoom: paymentMethod === 'room_charge' ? guestRoom : undefined,
      etaUuid: `ETA-${Math.random().toString(36).substring(2, 10).toUpperCase()}-2026`,
      cashier: shiftStats.cashierName
    };

    // Update catalog stocks
    setCatalog(prev => prev.map(catItem => {
      const cartItem = cart.find(c => c.id === catItem.id);
      if (cartItem) {
        return { ...catItem, stock: Math.max(0, catItem.stock - cartItem.qty) };
      }
      return catItem;
    }));

    // Update Shift Totals
    setShiftStats(prev => ({
      ...prev,
      salesTotal: prev.salesTotal + totalAmount,
      ordersCount: prev.ordersCount + 1
    }));

    setLastInvoice(invoiceData);
    setIsPayModalOpen(false);
    setIsReceiptModalOpen(true);
    setCart([]);
    setDiscountPercent(0);
  };

  // Filter catalog
  const filteredCatalog = catalog.filter(item => {
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.name_ar.includes(searchQuery) || item.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-4" dir="rtl">
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-slate-900 font-['Cairo']">
                شاشة الكاشير السريعة (POS Terminal)
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                متصل 100% بالضرائب ETA
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              {currentTenant.nameAr} - {currentTenant.branch} | الوردية: {shiftStats.openedAt}
            </p>
          </div>
        </div>

        {/* Shift Controls */}
        <div className="flex items-center gap-2 text-xs">
          {heldCarts.length > 0 && (
            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-800 px-3 py-1.5 rounded-xl font-mono">
              <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
              <span className="font-bold">سلات معلقة ({heldCarts.length})</span>
              <button
                onClick={() => handleRetrieveCart(heldCarts[0])}
                className="mr-2 text-white bg-amber-600 hover:bg-amber-700 px-2 py-0.5 rounded-md text-[10px] font-bold cursor-pointer"
              >
                استرجاع
              </button>
            </div>
          )}

          <button
            onClick={() => setIsShiftModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-bold text-xs cursor-pointer transition-all"
          >
            <Clock className="w-3.5 h-3.5 text-slate-600" />
            <span>إغلاق الوردية (shift.close)</span>
          </button>
        </div>
      </div>

      {/* Main Terminal Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Right Column: Catalog, Categories & Barcode (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Search & Categories Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              <input
                type="text"
                placeholder="ابحث بالاسم أو امسح الباركود (Barcode)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-9 pl-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white text-xs transition-all"
              />
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat === 'all' ? 'الكل' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filteredCatalog.map((item) => (
              <div
                key={item.id}
                onClick={() => handleAddToCart(item)}
                className="bg-white border border-slate-200 rounded-2xl p-3.5 hover:border-emerald-500 cursor-pointer transition-all hover:shadow-md flex flex-col justify-between shadow-2xs group relative overflow-hidden"
              >
                <div className={`h-1.5 w-full absolute top-0 left-0 bg-gradient-to-r ${item.imageColor}`} />

                <div>
                  <div className="flex items-center justify-between mb-1.5 mt-1">
                    <span className="text-[10px] font-mono text-slate-400">{item.sku}</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                      item.stock > 10 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {item.stock} متبقي
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-800 text-xs font-['Cairo'] line-clamp-2 mb-2 group-hover:text-emerald-700 transition-colors">
                    {item.name_ar}
                  </h4>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-1">
                  <span className="text-sm font-extrabold text-slate-900 font-mono">
                    {item.price} <span className="text-[10px] font-sans text-slate-500">ج.م</span>
                  </span>
                  <button className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-emerald-600 text-slate-600 group-hover:text-white flex items-center justify-center transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Left Column: Live Cart & Fast Checkout (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between min-h-[580px] sticky top-6">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm font-['Cairo']">سلة الفاتورة الحالية</h3>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-mono font-bold">
                  {cart.reduce((s, i) => s + i.qty, 0)} بند
                </span>
              </div>

              {cart.length > 0 && (
                <button
                  onClick={() => setCart([])}
                  className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>تفريغ السلة</span>
                </button>
              )}
            </div>

            {/* Cart Items List */}
            {cart.length === 0 ? (
              <div className="text-center py-20 text-slate-400 text-xs flex flex-col items-center justify-center space-y-2">
                <ShoppingCart className="w-12 h-12 text-slate-300 stroke-[1.5]" />
                <p className="font-bold text-slate-600">السلة فارغة حالياً</p>
                <p className="text-[11px] text-slate-400">انقر على أي صنف من القائمة لإضافته فوراً</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[260px] overflow-y-auto no-scrollbar pr-1">
                {cart.map((item) => (
                  <div key={item.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 text-xs">
                    <div className="flex-1 truncate">
                      <span className="text-slate-900 font-bold block truncate">{item.name_ar}</span>
                      <span className="text-[11px] font-mono text-slate-500">{item.price} ج.م × {item.qty}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono font-bold text-slate-900 text-xs">
                        {(item.price * item.qty).toLocaleString()} ج.م
                      </span>

                      <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5 shadow-2xs">
                        <button
                          onClick={() => handleUpdateQty(item.id, -1)}
                          className="w-5 h-5 flex items-center justify-center text-slate-500 hover:text-slate-900"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-mono font-bold px-1.5 text-slate-900">{item.qty}</span>
                        <button
                          onClick={() => handleUpdateQty(item.id, 1)}
                          className="w-5 h-5 flex items-center justify-center text-slate-500 hover:text-slate-900"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Checkout Totals & Buttons */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            {/* Quick Discount Trigger */}
            <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
              <span className="text-slate-600 font-medium flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5 text-amber-600" />
                <span>خصم إداري (pos.discount):</span>
              </span>
              <div className="flex items-center gap-1">
                {[0, 5, 10, 15].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => setDiscountPercent(pct)}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-mono cursor-pointer transition-all ${
                      discountPercent === pct
                        ? 'bg-amber-600 text-white font-bold'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            {/* Financial Breakdown */}
            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-slate-500">
                <span>المبلغ قبل الضريبة:</span>
                <span className="text-slate-900 font-bold">{subtotal.toLocaleString()} ج.م</span>
              </div>
              {discountPercent > 0 && (
                <div className="flex justify-between text-amber-700 font-bold">
                  <span>قيمة الخصم ({discountPercent}%):</span>
                  <span>- {discountAmount.toLocaleString()} ج.م</span>
                </div>
              )}
              <div className="flex justify-between text-slate-500">
                <span>ضريبة القيمة المضافة (14% VAT):</span>
                <span className="text-slate-900 font-bold">{vatAmount.toFixed(2)} ج.م</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-sm font-bold">
                <span className="text-slate-900 font-['Cairo']">الإجمالي المطلوب سداده:</span>
                <span className="text-xl text-emerald-700 font-mono font-extrabold">
                  {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ج.م
                </span>
              </div>
            </div>

            {/* Checkout Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={handleHoldCart}
                disabled={cart.length === 0}
                className="py-3 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 transition-all"
              >
                <Clock className="w-4 h-4 text-amber-600" />
                <span>تعليق السلة (hold)</span>
              </button>

              <button
                onClick={() => setIsPayModalOpen(true)}
                disabled={cart.length === 0}
                className="py-3 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 shadow-md shadow-emerald-600/20 transition-all font-['Cairo']"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>دفع الفاتورة (pos.pay)</span>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* 1. Modal: الدفع واختيار الطريقة (Payment Modal) */}
      {isPayModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 font-['Cairo'] text-base">
                سداد الفاتورة وإصدار الإيصال الإلكتروني
              </h3>
              <button onClick={() => setIsPayModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">✕</button>
            </div>

            <div className="text-center py-3 bg-emerald-50 rounded-xl border border-emerald-100">
              <span className="text-xs text-emerald-800 block mb-0.5 font-medium">المبلغ النهائي المطلوب:</span>
              <span className="text-2xl font-mono font-extrabold text-emerald-700">
                {totalAmount.toFixed(2)} ج.م
              </span>
            </div>

            {/* Payment Method Selector - Linked Exclusively to Payment Methods Screen */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 block">اختر وسيلة الدفع المعتمدة:</label>
                <span className="text-[10px] text-purple-700 font-mono bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                  مربوطة حصراً بجدول طرق السداد
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {(paymentMethods ? paymentMethods.filter(m => m.isActive) : [
                  { id: 'pm-1', code: 'cash', nameAr: 'نقدي (خزينة الكاشير)', iconName: 'Banknote', commissionPercent: 0 },
                  { id: 'pm-2', code: 'visa', nameAr: 'بطاقة بنكية (Card)', iconName: 'CreditCard', commissionPercent: 1.5 },
                  { id: 'pm-3', code: 'room_charge', nameAr: 'تحميل على الغرفة', iconName: 'Building2', commissionPercent: 0 },
                  { id: 'pm-4', code: 'instapay', nameAr: 'إنستاباي (InstaPay)', iconName: 'QrCode', commissionPercent: 0 }
                ]).map(method => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.code)}
                    className={`p-3 rounded-xl border text-right cursor-pointer flex items-center justify-between transition-all ${
                      paymentMethod === method.code 
                        ? 'bg-purple-50 border-purple-500 text-purple-900 font-bold shadow-xs' 
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {method.code === 'cash' ? <Banknote className="w-4 h-4 text-emerald-600" /> :
                       method.code === 'instapay' ? <QrCode className="w-4 h-4 text-amber-600" /> :
                       method.code === 'room_charge' ? <Building2 className="w-4 h-4 text-purple-600" /> :
                       method.code === 'digital_wallet' ? <Smartphone className="w-4 h-4 text-purple-600" /> :
                       <CreditCard className="w-4 h-4 text-sky-600" />}
                      <span>{method.nameAr}</span>
                    </div>
                    {method.commissionPercent > 0 && (
                      <span className="text-[10px] text-amber-700 font-mono bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                        {method.commissionPercent}%
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {paymentMethod === 'room_charge' && (
              <div className="bg-purple-50 p-3 rounded-xl border border-purple-200 space-y-1">
                <label className="text-xs text-purple-900 font-bold block">رقم الغرفة أو الجناح الفندقي:</label>
                <input
                  type="text"
                  value={guestRoom}
                  onChange={(e) => setGuestRoom(e.target.value)}
                  className="w-full bg-white border border-purple-300 rounded-lg px-2.5 py-1.5 text-slate-900 text-xs font-bold"
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button onClick={() => setIsPayModalOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold">إلغاء</button>
              <button
                onClick={handleCompletePayment}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs cursor-pointer shadow-md shadow-emerald-600/20"
              >
                تأكيد الدفع وإصدار الفاتورة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Modal: الإيصال الإلكتروني المعتمد للضرائب (ETA Tax Invoice Modal) */}
      {isReceiptModalOpen && lastInvoice && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>تم الدفع والربط الضريبي بنجاح!</span>
              </div>
              <button onClick={() => setIsReceiptModalOpen(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            {/* Printable Thermal Receipt */}
            <div className="bg-slate-50 border border-slate-200 text-slate-900 p-4 rounded-xl font-mono text-xs space-y-3" dir="rtl">
              <div className="text-center border-b border-dashed border-slate-300 pb-2">
                <h4 className="font-bold text-sm font-['Cairo'] text-slate-900">{lastInvoice.tenantName}</h4>
                <p className="text-[10px] text-slate-600">{lastInvoice.branch}</p>
                <p className="text-[10px] text-slate-600">رقم الفاتورة: {lastInvoice.invoiceNumber}</p>
                <p className="text-[9px] text-slate-500">{lastInvoice.dateTime}</p>
              </div>

              <div className="divide-y divide-dashed divide-slate-200">
                {lastInvoice.items.map((it: any) => (
                  <div key={it.id} className="py-1 flex justify-between text-[11px]">
                    <span className="font-['Cairo'] font-medium">{it.name_ar} (×{it.qty})</span>
                    <span className="font-bold">{(it.price * it.qty).toLocaleString()} ج.م</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-dashed border-slate-300 pt-2 space-y-1 text-[11px]">
                <div className="flex justify-between text-slate-600">
                  <span>المبلغ الخاضع:</span>
                  <span>{(lastInvoice.subtotal - lastInvoice.discountAmount).toFixed(2)} ج.م</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>ضريبة القيمة المضافة (14%):</span>
                  <span>{lastInvoice.vatAmount.toFixed(2)} ج.م</span>
                </div>
                <div className="flex justify-between font-bold text-sm pt-1 border-t border-slate-200 text-slate-900">
                  <span>المدفوع ({lastInvoice.paymentMethod}):</span>
                  <span className="text-emerald-700">{lastInvoice.totalAmount.toFixed(2)} ج.م</span>
                </div>
              </div>

              {/* ETA Electronic Stamp */}
              <div className="text-center pt-2 border-t border-dashed border-slate-300 flex flex-col items-center justify-center space-y-1">
                <div className="w-16 h-16 bg-white border border-slate-300 rounded p-1 flex items-center justify-center">
                  <QrCode className="w-full h-full text-slate-900" />
                </div>
                <span className="text-[9px] text-slate-600 font-sans font-bold">
                  مصلحة الضرائب المصرية - إيصال إلكتروني معتمد
                </span>
                <span className="text-[8px] text-slate-400">UUID: {lastInvoice.etaUuid}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => { window.print(); }}
                className="flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-sky-600/20"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>طباعة الإيصال الفوري</span>
              </button>
              <button
                onClick={() => setIsReceiptModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Modal: إغلاق الوردية (Shift Close Modal) */}
      {isShiftModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 font-['Cairo'] text-base">
                إغلاق الوردية ومطابقة العجز والزيادة (shift.close)
              </h3>
              <button onClick={() => setIsShiftModalOpen(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <div className="space-y-2 text-xs font-mono bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="flex justify-between text-slate-600">
                <span>وقت فتح الوردية:</span>
                <span className="text-slate-900 font-bold">{shiftStats.openedAt}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>رصيد العهدة الافتتاحي:</span>
                <span className="text-slate-900 font-bold">{shiftStats.openingCash} ج.م</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>إجمالي مبيعات الوردية:</span>
                <span className="text-emerald-700 font-bold">{shiftStats.salesTotal.toLocaleString()} ج.م</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>عدد الفواتير المنفذة:</span>
                <span className="text-slate-900 font-bold">{shiftStats.ordersCount} فاتورة</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-sm font-bold">
                <span className="text-slate-900 font-sans">المبلغ المتوقع في الدرج:</span>
                <span className="text-emerald-700">{(shiftStats.openingCash + shiftStats.salesTotal).toLocaleString()} ج.م</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button onClick={() => setIsShiftModalOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold">إلغاء</button>
              <button
                onClick={() => {
                  alert('تم إغلاق الوردية بنجاح وترحيل القيد المحاسبي!');
                  setIsShiftModalOpen(false);
                }}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs cursor-pointer shadow-md shadow-rose-600/20"
              >
                تأكيد إغلاق الوردية
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
