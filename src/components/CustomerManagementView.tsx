import React, { useState } from 'react';
import { TenantContext, UserRole, CustomerRecord } from '../types.ts';
import { INITIAL_CUSTOMERS } from '../data/mockCrmAndOperationsData.ts';
import { 
  Users, 
  Plus, 
  Search, 
  Pencil, 
  Trash2, 
  Phone, 
  Mail, 
  Building2, 
  CreditCard, 
  CheckCircle2, 
  ShieldCheck, 
  FileText, 
  DollarSign, 
  Filter, 
  MessageCircle, 
  Download, 
  X,
  ExternalLink,
  Sparkles,
  UserCheck,
  UserX,
  Database
} from 'lucide-react';

interface CustomerManagementViewProps {
  currentTenant: TenantContext;
  userRole: UserRole;
  onNavigateToBooking?: (customerId: string) => void;
  onNavigateToFollowup?: (customerId: string) => void;
}

export const CustomerManagementView: React.FC<CustomerManagementViewProps> = ({
  currentTenant,
  userRole
}) => {
  const [customers, setCustomers] = useState<CustomerRecord[]>(INITIAL_CUSTOMERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerRecord | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<CustomerRecord | null>(null);
  const [statementCustomer, setStatementCustomer] = useState<CustomerRecord | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // New Customer Form State
  const [formData, setFormData] = useState<Partial<CustomerRecord>>({
    code: `CUST-0${INITIAL_CUSTOMERS.length + 101}`,
    name: '',
    phone: '',
    email: '',
    nationalIdOrTax: '',
    creditLimit: 20000,
    currentBalance: 0,
    category: 'Regular',
    branch: currentTenant.branch || 'HRG-MAIN',
    status: 'active',
    notes: ''
  });

  const handleShowNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3500);
  };

  // Add Customer
  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    const newCust: CustomerRecord = {
      id: `cust-${Date.now()}`,
      code: formData.code || `CUST-0${customers.length + 101}`,
      name: formData.name,
      phone: formData.phone,
      email: formData.email || '',
      nationalIdOrTax: formData.nationalIdOrTax || '',
      creditLimit: Number(formData.creditLimit) || 0,
      currentBalance: Number(formData.currentBalance) || 0,
      category: (formData.category as any) || 'Regular',
      branch: formData.branch || currentTenant.branch || 'HRG-MAIN',
      status: (formData.status as any) || 'active',
      notes: formData.notes || '',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setCustomers([newCust, ...customers]);
    setShowAddModal(false);
    setFormData({
      code: `CUST-0${customers.length + 102}`,
      name: '',
      phone: '',
      email: '',
      nationalIdOrTax: '',
      creditLimit: 20000,
      currentBalance: 0,
      category: 'Regular',
      branch: 'HRG-MAIN',
      status: 'active',
      notes: ''
    });
    handleShowNotice(`تمت إضافة العميل الجديد (${newCust.name}) وحفظه في جدول sales.customers بنجاح!`);
  };

  // Save Edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;

    setCustomers(customers.map(c => c.id === editingCustomer.id ? editingCustomer : c));
    handleShowNotice(`تم تعديل بيانات العميل (${editingCustomer.name}) بنجاح.`);
    setEditingCustomer(null);
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (!customerToDelete) return;
    if (customerToDelete.currentBalance > 0) {
      alert(`تنبيه أمان: لا يمكن حذف العميل (${customerToDelete.name}) لوجود رصيد مديونية مستحق عليه بقيمة ${customerToDelete.currentBalance.toLocaleString()} ج.م!`);
      setCustomerToDelete(null);
      return;
    }

    setCustomers(customers.filter(c => c.id !== customerToDelete.id));
    handleShowNotice(`تم حذف العميل (${customerToDelete.name}) بنجاح.`);
    setCustomerToDelete(null);
  };

  // Filter customers
  const filteredCustomers = customers.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      (c.nationalIdOrTax && c.nationalIdOrTax.includes(searchQuery));
    
    const matchesCategory = selectedCategory === 'all' || c.category === selectedCategory;
    const matchesBranch = selectedBranch === 'all' || c.branch === selectedBranch;

    return matchesSearch && matchesCategory && matchesBranch;
  });

  // Analytics
  const totalReceivables = customers.reduce((sum, c) => sum + c.currentBalance, 0);
  const vipCount = customers.filter(c => c.category === 'VIP').length;

  return (
    <div className="space-y-6" dir="rtl">
      {/* Top Banner (Day Mode) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-semibold border border-blue-200 mb-2">
            <Database className="w-3.5 h-3.5" />
            <span>جدول مستقل في قاعدة البيانات: sales.customers (RLS Enforced)</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 font-['Cairo'] flex items-center gap-2">
            <Users className="w-6 h-6 text-sky-600" />
            <span>شاشة إدارة العملاء وحسابات المدينين (Customers Master)</span>
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            إدارة متكاملة لبيانات العملاء، حدود الائتمان، الأرصدة، كشف الحساب والربط المباشر مع الحجوزات ونقاط البيع.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة عميل جديد (customer.create)</span>
        </button>
      </div>

      {notice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-bold">إجمالي العملاء المسجلين</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2 font-mono">{customers.length}</p>
          <span className="text-[11px] text-slate-500">مقسمين على فروع المنشأة</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-bold">عملاء كبار الشخصيات (VIP)</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-700 mt-2 font-mono">{vipCount}</p>
          <span className="text-[11px] text-amber-600 font-medium">أولوية حجز وخصومات خاصة</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-bold">إجمالي المديونيات المستحقة</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-700 mt-2 font-mono">
            {totalReceivables.toLocaleString()} <span className="text-xs font-normal">ج.م</span>
          </p>
          <span className="text-[11px] text-rose-600 font-medium">أرصدة مدينين مفتوحة</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-bold">الحسابات النشطة</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-700 mt-2 font-mono">
            {customers.filter(c => c.status === 'active').length}
          </p>
          <span className="text-[11px] text-emerald-600 font-medium">جاهزة للتعامل الفوري</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex-1 min-w-[260px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
          <input
            type="text"
            placeholder="بحث بالاسم، كود العميل، رقم الهاتف أو الرقم القومي..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
          >
            <option value="all">كل التصنيفات (All Categories)</option>
            <option value="VIP">كبار الشخصيات VIP</option>
            <option value="Regular">عملاء منتظمون Regular</option>
            <option value="Corporate">شركات وعقود Corporate</option>
            <option value="Wholesale">جملة Wholesale</option>
          </select>

          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
          >
            <option value="all">كل الفروع</option>
            <option value="HRG-MAIN">فرع الغردقة الرئيسي</option>
            <option value="SSH-RESORT">فرع شرم الشيخ</option>
            <option value="CAI-HQ">مكتب القاهرة الإداري</option>
          </select>
        </div>
      </div>

      {/* Customers Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <span>سجل العملاء ({filteredCustomers.length})</span>
            <span className="text-[10px] font-mono bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full font-bold">
              PostgreSQL Table: sales.customers
            </span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <th className="p-3">الكود / العميل</th>
                <th className="p-3">الاتصال والتواصل</th>
                <th className="p-3">التصنيف</th>
                <th className="p-3">الفرع</th>
                <th className="p-3">الحد الائتماني</th>
                <th className="p-3">الرصيد المالي الحالي</th>
                <th className="p-3">الحالة</th>
                <th className="p-3 text-center">إجراءات الأزرار (Actions)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.map(cust => (
                <tr key={cust.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                        {cust.code}
                      </span>
                      <div>
                        <div className="font-bold text-slate-900 text-xs">{cust.name}</div>
                        {cust.nationalIdOrTax && (
                          <div className="text-[10px] text-slate-400 font-mono">الرقم: {cust.nationalIdOrTax}</div>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="p-3">
                    <div className="flex items-center gap-1 font-mono text-[11px] text-slate-700">
                      <Phone className="w-3 h-3 text-emerald-600" />
                      <span>{cust.phone}</span>
                    </div>
                    {cust.email && (
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono mt-0.5">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>{cust.email}</span>
                      </div>
                    )}
                  </td>

                  <td className="p-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      cust.category === 'VIP' 
                        ? 'bg-amber-100 text-amber-800 border-amber-200' 
                        : cust.category === 'Corporate'
                        ? 'bg-purple-100 text-purple-800 border-purple-200'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {cust.category === 'VIP' ? '★ VIP' : cust.category}
                    </span>
                  </td>

                  <td className="p-3">
                    <span className="font-mono text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {cust.branch}
                    </span>
                  </td>

                  <td className="p-3 font-mono text-slate-700">
                    {cust.creditLimit.toLocaleString()} ج.م
                  </td>

                  <td className="p-3">
                    <span className={`font-mono font-bold text-xs ${
                      cust.currentBalance > 0 ? 'text-rose-600' : 'text-emerald-600'
                    }`}>
                      {cust.currentBalance.toLocaleString()} ج.م
                    </span>
                  </td>

                  <td className="p-3">
                    {cust.status === 'active' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        نشط
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        موقوف
                      </span>
                    )}
                  </td>

                  <td className="p-3">
                    <div className="flex items-center justify-center gap-1.5">
                      {/* WhatsApp quick contact */}
                      <a
                        href={`https://wa.me/2${cust.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-all"
                        title="محادثة واتساب سريعة"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </a>

                      {/* Statement button */}
                      <button
                        type="button"
                        onClick={() => setStatementCustomer(cust)}
                        className="p-1.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-all"
                        title="كشف حساب العميل وحركاته"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>

                      {/* Edit button */}
                      <button
                        type="button"
                        onClick={() => setEditingCustomer({ ...cust })}
                        className="p-1.5 rounded-lg border border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100 transition-all"
                        title="تعديل بيانات العميل"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete button */}
                      <button
                        type="button"
                        onClick={() => setCustomerToDelete(cust)}
                        className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 transition-all"
                        title="حذف العميل"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form onSubmit={handleAddCustomer} className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-sky-600" />
                <span>إضافة عميل جديد إلى قاعدة البيانات (sales.customers)</span>
              </h3>
              <button type="button" onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">كود العميل</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم العميل بالكامل *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: أحمد محمد كامل"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">رقم الهاتف (واتساب) *</label>
                <input
                  type="text"
                  required
                  placeholder="01012345678"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">البريد الإلكتروني</label>
                <input
                  type="email"
                  placeholder="client@pickalbatros.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الرقم القومي أو البطاقة الضريبية</label>
                <input
                  type="text"
                  placeholder="14 رقماً أو رقم التسجيل"
                  value={formData.nationalIdOrTax}
                  onChange={(e) => setFormData({ ...formData, nationalIdOrTax: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">تصنيف العميل</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                >
                  <option value="Regular">منتظم (Regular)</option>
                  <option value="VIP">كبار الشخصيات (VIP)</option>
                  <option value="Corporate">شركات وعقود (Corporate)</option>
                  <option value="Wholesale">جملة (Wholesale)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الحد الائتماني (ج.م)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.creditLimit}
                  onChange={(e) => setFormData({ ...formData, creditLimit: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الفرع المخصص</label>
                <select
                  value={formData.branch}
                  onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                >
                  <option value="HRG-MAIN">فرع الغردقة الرئيسي</option>
                  <option value="SSH-RESORT">فرع شرم الشيخ</option>
                  <option value="CAI-HQ">مكتب القاهرة الإداري</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات العميل وتفضيلاته</label>
              <textarea
                rows={2}
                placeholder="تفضيلات الجلسات، الحساسية الدوائية، شروط السداد..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-600/20"
              >
                تأكيد الإضافة والحفظ
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Customer Modal */}
      {editingCustomer && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form onSubmit={handleSaveEdit} className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Pencil className="w-4 h-4 text-sky-600" />
                <span>تعديل بيانات العميل ({editingCustomer.code})</span>
              </h3>
              <button type="button" onClick={() => setEditingCustomer(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">الاسم بالكامل</label>
                <input
                  type="text"
                  required
                  value={editingCustomer.name}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">رقم الهاتف</label>
                <input
                  type="text"
                  required
                  value={editingCustomer.phone}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">البريد الإلكتروني</label>
                <input
                  type="email"
                  value={editingCustomer.email}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">التصنيف</label>
                <select
                  value={editingCustomer.category}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, category: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                >
                  <option value="Regular">منتظم (Regular)</option>
                  <option value="VIP">كبار الشخصيات (VIP)</option>
                  <option value="Corporate">شركات وعقود (Corporate)</option>
                  <option value="Wholesale">جملة (Wholesale)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الحد الائتماني (ج.م)</label>
                <input
                  type="number"
                  value={editingCustomer.creditLimit}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, creditLimit: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الحالة</label>
                <select
                  value={editingCustomer.status}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, status: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                >
                  <option value="active">نشط وعامل</option>
                  <option value="suspended">موقوف مؤقتاً</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">الملاحظات</label>
              <textarea
                rows={2}
                value={editingCustomer.notes}
                onChange={(e) => setEditingCustomer({ ...editingCustomer, notes: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingCustomer(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                حفظ التعديلات
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {customerToDelete && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-rose-200 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-extrabold text-slate-900">تأكيد حذف العميل</h4>
            <p className="text-xs text-slate-600">
              هل أنت متأكد من حذف العميل <strong className="text-slate-900">{customerToDelete.name}</strong> ({customerToDelete.code}) من قاعدة البيانات؟
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCustomerToDelete(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 flex-1"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm flex-1"
              >
                تأكيد الحذف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Account Statement Modal */}
      {statementCustomer && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-sky-600" />
                  <span>كشف حساب مالي تفصيلي: {statementCustomer.name}</span>
                </h3>
                <p className="text-[11px] text-slate-500 font-mono">الكود: {statementCustomer.code} | الهاتف: {statementCustomer.phone}</p>
              </div>
              <button type="button" onClick={() => setStatementCustomer(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 block">الرصيد الحالي:</span>
                <span className="text-base font-black text-rose-600 font-mono">
                  {statementCustomer.currentBalance.toLocaleString()} ج.م
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">الحد الائتماني:</span>
                <span className="text-base font-bold text-slate-800 font-mono">
                  {statementCustomer.creditLimit.toLocaleString()} ج.م
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">التصنيف والفرع:</span>
                <span className="font-bold text-sky-700">{statementCustomer.category} - {statementCustomer.branch}</span>
              </div>
            </div>

            {/* Statement Lines Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold">
                  <tr>
                    <th className="p-2.5">التاريخ</th>
                    <th className="p-2.5">البيان / المستند</th>
                    <th className="p-2.5">مدين (+)</th>
                    <th className="p-2.5">دائن (-)</th>
                    <th className="p-2.5">الرصيد التراكمي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  <tr>
                    <td className="p-2.5 text-slate-500 font-mono">2026-10-01</td>
                    <td className="p-2.5 font-bold">رصيد افتتاحي مرحل</td>
                    <td className="p-2.5 font-mono">15,000 ج.م</td>
                    <td className="p-2.5 font-mono text-slate-400">-</td>
                    <td className="p-2.5 font-mono font-bold text-rose-600">15,000 ج.م</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 text-slate-500 font-mono">2026-10-08</td>
                    <td className="p-2.5 font-bold text-emerald-700">سند تحصيل نقدية (REC-9942)</td>
                    <td className="p-2.5 font-mono text-slate-400">-</td>
                    <td className="p-2.5 font-mono text-emerald-600">5,000 ج.م</td>
                    <td className="p-2.5 font-mono font-bold text-rose-600">10,000 ج.م</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 text-slate-500 font-mono">2026-10-14</td>
                    <td className="p-2.5 font-bold">فاتورة جلسة ليزر كانديلا (INV-2026-904)</td>
                    <td className="p-2.5 font-mono text-rose-600">2,500 ج.م</td>
                    <td className="p-2.5 font-mono text-slate-400">-</td>
                    <td className="p-2.5 font-mono font-bold text-rose-600">{statementCustomer.currentBalance.toLocaleString()} ج.م</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStatementCustomer(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200"
              >
                إغلاق
              </button>
              <button
                type="button"
                onClick={() => alert(`جاري تنزيل كشف حساب العميل (${statementCustomer.name}) كملف PDF رسمي...`)}
                className="flex items-center gap-1.5 px-4 py-2 bg-sky-600 text-white rounded-xl text-xs font-bold hover:bg-sky-700 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>طباعة وتصدير PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
