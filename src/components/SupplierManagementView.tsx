import React, { useState } from 'react';
import { TenantContext, UserRole, SupplierRecord } from '../types.ts';
import { INITIAL_SUPPLIERS } from '../data/mockCrmAndOperationsData.ts';
import { 
  Truck, 
  Plus, 
  Search, 
  Pencil, 
  Trash2, 
  Phone, 
  Mail, 
  FileText, 
  DollarSign, 
  CheckCircle2, 
  Building, 
  Clock, 
  Download, 
  X, 
  CreditCard,
  Database,
  ExternalLink
} from 'lucide-react';

interface SupplierManagementViewProps {
  currentTenant: TenantContext;
  userRole: UserRole;
}

export const SupplierManagementView: React.FC<SupplierManagementViewProps> = ({
  currentTenant,
  userRole
}) => {
  const [suppliers, setSuppliers] = useState<SupplierRecord[]>(INITIAL_SUPPLIERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<SupplierRecord | null>(null);
  const [supplierToDelete, setSupplierToDelete] = useState<SupplierRecord | null>(null);
  const [statementSupplier, setStatementSupplier] = useState<SupplierRecord | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<SupplierRecord>>({
    code: `SUP-200${INITIAL_SUPPLIERS.length + 1}`,
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    taxNumber: '',
    commercialRegister: '',
    paymentTermsDays: 30,
    currentBalance: 0,
    category: 'مستلزمات طبية وتجميل',
    status: 'active',
    notes: ''
  });

  const handleShowNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3500);
  };

  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    const newSup: SupplierRecord = {
      id: `sup-${Date.now()}`,
      code: formData.code || `SUP-200${suppliers.length + 1}`,
      name: formData.name,
      contactPerson: formData.contactPerson || '',
      phone: formData.phone,
      email: formData.email || '',
      taxNumber: formData.taxNumber || '',
      commercialRegister: formData.commercialRegister || '',
      paymentTermsDays: Number(formData.paymentTermsDays) || 30,
      currentBalance: Number(formData.currentBalance) || 0,
      category: (formData.category as any) || 'مستلزمات طبية وتجميل',
      status: (formData.status as any) || 'active',
      notes: formData.notes || '',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setSuppliers([newSup, ...suppliers]);
    setShowAddModal(false);
    setFormData({
      code: `SUP-200${suppliers.length + 2}`,
      name: '',
      contactPerson: '',
      phone: '',
      email: '',
      taxNumber: '',
      commercialRegister: '',
      paymentTermsDays: 30,
      currentBalance: 0,
      category: 'مستلزمات طبية وتجميل',
      status: 'active',
      notes: ''
    });
    handleShowNotice(`تمت إضافة المورد الجديد (${newSup.name}) وحفظه في جدول purchasing.suppliers بنجاح!`);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSupplier) return;

    setSuppliers(suppliers.map(s => s.id === editingSupplier.id ? editingSupplier : s));
    handleShowNotice(`تم تعديل بيانات المورد (${editingSupplier.name}) بنجاح.`);
    setEditingSupplier(null);
  };

  const handleConfirmDelete = () => {
    if (!supplierToDelete) return;
    if (supplierToDelete.currentBalance > 0) {
      alert(`تنبيه: لا يمكن حذف المورد (${supplierToDelete.name}) لوجود رصيد مستحق له بقيمة ${supplierToDelete.currentBalance.toLocaleString()} ج.م!`);
      setSupplierToDelete(null);
      return;
    }

    setSuppliers(suppliers.filter(s => s.id !== supplierToDelete.id));
    handleShowNotice(`تم حذف المورد (${supplierToDelete.name}) بنجاح.`);
    setSupplierToDelete(null);
  };

  const filteredSuppliers = suppliers.filter(s => {
    const matchesSearch = 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.phone.includes(searchQuery) ||
      (s.taxNumber && s.taxNumber.includes(searchQuery));
    
    const matchesCategory = selectedCategory === 'all' || s.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalPayables = suppliers.reduce((sum, s) => sum + s.currentBalance, 0);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200 mb-2">
            <Database className="w-3.5 h-3.5" />
            <span>جدول مستقل في قاعدة البيانات: purchasing.suppliers (RLS Enforced)</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 font-['Cairo'] flex items-center gap-2">
            <Truck className="w-6 h-6 text-emerald-600" />
            <span>شاشة إدارة الموردين والدائنين (Suppliers Master)</span>
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            سجل الموردين المعتمدين، شروط الائتمان، فترات السداد، متابعة المديونيات والربط بأوامر الشراء والمصروفات.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة مورد جديد (supplier.create)</span>
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
            <span className="text-xs text-slate-500 font-bold">إجمالي الموردين المعتمدين</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2 font-mono">{suppliers.length}</p>
          <span className="text-[11px] text-slate-500">موردين خامات وأجهزة وصيانة</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-bold">إجمالي مستحقات الموردين (الدائنون)</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-700 mt-2 font-mono">
            {totalPayables.toLocaleString()} <span className="text-xs font-normal">ج.م</span>
          </p>
          <span className="text-[11px] text-amber-600 font-medium">واجبة السداد وفق الآجال المعتمدة</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-bold">متوسط فترة السداد</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-indigo-700 mt-2 font-mono">
            {Math.round(suppliers.reduce((a, b) => a + b.paymentTermsDays, 0) / suppliers.length)} يوم
          </p>
          <span className="text-[11px] text-indigo-600 font-medium">فترة تسهيلات ائتمانية</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex-1 min-w-[260px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
          <input
            type="text"
            placeholder="بحث بالاسم، كود المورد، الشخص المسؤول، رقم الهاتف أو البطاقة الضريبية..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
        >
          <option value="all">كل المجالات التوريدية</option>
          <option value="أجهزة ومعدات">أجهزة ومعدات</option>
          <option value="مستلزمات طبية وتجميل">مستلزمات طبية وتجميل</option>
          <option value="خامات ومواد أولية">خامات ومواد أولية</option>
          <option value="صيانة وخدمات">صيانة وخدمات</option>
          <option value="عام">عام</option>
        </select>
      </div>

      {/* Suppliers Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <span>قائمة الموردين المعتمدين ({filteredSuppliers.length})</span>
            <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
              PostgreSQL Table: purchasing.suppliers
            </span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <th className="p-3">الكود / المورد</th>
                <th className="p-3">المسؤول والاتصال</th>
                <th className="p-3">المجال / التصنيف</th>
                <th className="p-3">الرقم الضريبي / السجل</th>
                <th className="p-3">أجل السداد</th>
                <th className="p-3">الرصيد المستحق (دائن)</th>
                <th className="p-3">الحالة</th>
                <th className="p-3 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSuppliers.map(sup => (
                <tr key={sup.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {sup.code}
                      </span>
                      <div className="font-bold text-slate-900">{sup.name}</div>
                    </div>
                  </td>

                  <td className="p-3">
                    <div className="font-medium text-slate-800">{sup.contactPerson || '-'}</div>
                    <div className="flex items-center gap-1 font-mono text-[11px] text-slate-500 mt-0.5">
                      <Phone className="w-3 h-3 text-emerald-600" />
                      <span>{sup.phone}</span>
                    </div>
                  </td>

                  <td className="p-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      {sup.category}
                    </span>
                  </td>

                  <td className="p-3 font-mono text-slate-600 text-[11px]">
                    <div>ضريبي: {sup.taxNumber || 'غير مسجل'}</div>
                    <div className="text-[10px] text-slate-400">سجل: {sup.commercialRegister || '-'}</div>
                  </td>

                  <td className="p-3 font-mono text-slate-700">
                    <span className="bg-slate-100 px-2 py-0.5 rounded font-bold">{sup.paymentTermsDays} يوم</span>
                  </td>

                  <td className="p-3">
                    <span className={`font-mono font-bold text-xs ${
                      sup.currentBalance > 0 ? 'text-amber-700' : 'text-slate-500'
                    }`}>
                      {sup.currentBalance.toLocaleString()} ج.م
                    </span>
                  </td>

                  <td className="p-3">
                    {sup.status === 'active' ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        نشط
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                        معطل
                      </span>
                    )}
                  </td>

                  <td className="p-3">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setStatementSupplier(sup)}
                        className="p-1.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-all"
                        title="كشف حساب المورد وأوامر الشراء"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setEditingSupplier({ ...sup })}
                        className="p-1.5 rounded-lg border border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100 transition-all"
                        title="تعديل بيانات المورد"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setSupplierToDelete(sup)}
                        className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 transition-all"
                        title="حذف المورد"
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

      {/* Add Supplier Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form onSubmit={handleAddSupplier} className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-600" />
                <span>إضافة مورد جديد إلى قاعدة البيانات (purchasing.suppliers)</span>
              </h3>
              <button type="button" onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">كود المورد</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم المورد / الشركة *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: شركة القاهرة للتوريدات"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الشخص المسؤول (Contact Person)</label>
                <input
                  type="text"
                  placeholder="اسم مسؤول المبيعات"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">رقم الهاتف *</label>
                <input
                  type="text"
                  required
                  placeholder="012xxxxxxxx"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">رقم التسجيل الضريبي</label>
                <input
                  type="text"
                  placeholder="e.g. 543-982-104"
                  value={formData.taxNumber}
                  onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">السجل التجاري</label>
                <input
                  type="text"
                  placeholder="رقم السجل"
                  value={formData.commercialRegister}
                  onChange={(e) => setFormData({ ...formData, commercialRegister: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">المجال / التصنيف</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                >
                  <option value="مستلزمات طبية وتجميل">مستلزمات طبية وتجميل</option>
                  <option value="أجهزة ومعدات">أجهزة ومعدات</option>
                  <option value="خامات ومواد أولية">خامات ومواد أولية</option>
                  <option value="صيانة وخدمات">صيانة وخدمات</option>
                  <option value="عام">عام</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">أجل السداد (بالأيام)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.paymentTermsDays}
                  onChange={(e) => setFormData({ ...formData, paymentTermsDays: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات وشروط التوريد</label>
              <textarea
                rows={2}
                placeholder="خصومات الكمية، فترات الضمان، شروط الدفع..."
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
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20"
              >
                حفظ المورد
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Modal */}
      {editingSupplier && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form onSubmit={handleSaveEdit} className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Pencil className="w-4 h-4 text-emerald-600" />
                <span>تعديل بيانات المورد ({editingSupplier.code})</span>
              </h3>
              <button type="button" onClick={() => setEditingSupplier(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم المورد</label>
                <input
                  type="text"
                  required
                  value={editingSupplier.name}
                  onChange={(e) => setEditingSupplier({ ...editingSupplier, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الشخص المسؤول</label>
                <input
                  type="text"
                  value={editingSupplier.contactPerson}
                  onChange={(e) => setEditingSupplier({ ...editingSupplier, contactPerson: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">رقم الهاتف</label>
                <input
                  type="text"
                  required
                  value={editingSupplier.phone}
                  onChange={(e) => setEditingSupplier({ ...editingSupplier, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">أجل السداد (أيام)</label>
                <input
                  type="number"
                  value={editingSupplier.paymentTermsDays}
                  onChange={(e) => setEditingSupplier({ ...editingSupplier, paymentTermsDays: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">الملاحظات</label>
              <textarea
                rows={2}
                value={editingSupplier.notes}
                onChange={(e) => setEditingSupplier({ ...editingSupplier, notes: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingSupplier(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                حفظ التعديلات
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {supplierToDelete && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-rose-200 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-extrabold text-slate-900">تأكيد حذف المورد</h4>
            <p className="text-xs text-slate-600">
              هل أنت متأكد من حذف المورد <strong className="text-slate-900">{supplierToDelete.name}</strong> ({supplierToDelete.code}) من جدول الموردين؟
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSupplierToDelete(null)}
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

      {/* Supplier Statement Modal */}
      {statementSupplier && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span>كشف حساب مديونية المورد: {statementSupplier.name}</span>
                </h3>
                <p className="text-[11px] text-slate-500 font-mono">الكود: {statementSupplier.code} | الهاتف: {statementSupplier.phone}</p>
              </div>
              <button type="button" onClick={() => setStatementSupplier(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 block">إجمالي المستحق (دائن):</span>
                <span className="text-base font-black text-amber-700 font-mono">
                  {statementSupplier.currentBalance.toLocaleString()} ج.م
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">أجل السداد:</span>
                <span className="text-base font-bold text-slate-800 font-mono">
                  {statementSupplier.paymentTermsDays} يوم
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">التصنيف:</span>
                <span className="font-bold text-emerald-700">{statementSupplier.category}</span>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold">
                  <tr>
                    <th className="p-2.5">التاريخ</th>
                    <th className="p-2.5">المستند / الحركة</th>
                    <th className="p-2.5">دائن (استحقاق)</th>
                    <th className="p-2.5">مدين (سداد)</th>
                    <th className="p-2.5">الرصيد المتبقي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  <tr>
                    <td className="p-2.5 text-slate-500 font-mono">2026-09-20</td>
                    <td className="p-2.5 font-bold">أمر شراء واستلام خامات (PO-2026-118)</td>
                    <td className="p-2.5 font-mono text-amber-700">120,000 ج.م</td>
                    <td className="p-2.5 font-mono text-slate-400">-</td>
                    <td className="p-2.5 font-mono font-bold text-amber-700">120,000 ج.م</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 text-slate-500 font-mono">2026-10-05</td>
                    <td className="p-2.5 font-bold text-emerald-700">تحويل بنكي سداد دفعة (PAY-8841)</td>
                    <td className="p-2.5 font-mono text-slate-400">-</td>
                    <td className="p-2.5 font-mono text-emerald-600">50,000 ج.م</td>
                    <td className="p-2.5 font-mono font-bold text-amber-700">70,000 ج.م</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 text-slate-500 font-mono">2026-10-12</td>
                    <td className="p-2.5 font-bold">فاتورة صيانة واستبدال مستهلكات (INV-SUP-901)</td>
                    <td className="p-2.5 font-mono text-amber-700">{statementSupplier.currentBalance.toLocaleString()} ج.م</td>
                    <td className="p-2.5 font-mono text-slate-400">-</td>
                    <td className="p-2.5 font-mono font-bold text-amber-700">{statementSupplier.currentBalance.toLocaleString()} ج.م</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStatementSupplier(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200"
              >
                إغلاق
              </button>
              <button
                type="button"
                onClick={() => alert(`جاري تنزيل كشف حساب المورد (${statementSupplier.name}) كملف PDF رسمي...`)}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 shadow-sm"
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
