import React, { useState } from 'react';
import { TenantContext, UserRole, BookingRecord, CustomerRecord } from '../types.ts';
import { INITIAL_BOOKINGS, INITIAL_CUSTOMERS } from '../data/mockCrmAndOperationsData.ts';
import { 
  Calendar, 
  Plus, 
  Search, 
  Pencil, 
  CheckCircle2, 
  Clock, 
  User, 
  Phone, 
  DollarSign, 
  Building2, 
  Filter, 
  Check, 
  X, 
  Database,
  Play,
  RotateCcw,
  Sparkles,
  AlertCircle
} from 'lucide-react';

interface ReservationsManagementViewProps {
  currentTenant: TenantContext;
  userRole: UserRole;
  onExecuteSession?: (booking: BookingRecord) => void;
}

export const ReservationsManagementView: React.FC<ReservationsManagementViewProps> = ({
  currentTenant,
  userRole,
  onExecuteSession
}) => {
  const [bookings, setBookings] = useState<BookingRecord[]>(INITIAL_BOOKINGS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'tomorrow'>('all');
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState<BookingRecord | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<BookingRecord>>({
    bookingNo: `BK-2026-0${bookings.length + 93}`,
    customerId: INITIAL_CUSTOMERS[0]?.id || '',
    customerName: INITIAL_CUSTOMERS[0]?.name || '',
    customerPhone: INITIAL_CUSTOMERS[0]?.phone || '',
    serviceName: 'جلسة ليزر كانديلا جنتل ماكس برو (Full Body)',
    bookingDate: new Date().toISOString().split('T')[0],
    bookingTime: '03:00 م',
    assignedStaff: 'د. ياسمين الشريف (أخصائية الجلدية)',
    branch: currentTenant.branch || 'HRG-MAIN',
    depositAmount: 500,
    totalEstimatedAmount: 2500,
    status: 'مؤكد',
    notes: ''
  });

  const handleShowNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3500);
  };

  const handleAddBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName || !formData.serviceName) return;

    const newBk: BookingRecord = {
      id: `bk-${Date.now()}`,
      bookingNo: formData.bookingNo || `BK-2026-0${bookings.length + 93}`,
      customerId: formData.customerId || `cust-${Date.now()}`,
      customerName: formData.customerName,
      customerPhone: formData.customerPhone || '01000000000',
      serviceName: formData.serviceName,
      bookingDate: formData.bookingDate || new Date().toISOString().split('T')[0],
      bookingTime: formData.bookingTime || '04:00 م',
      assignedStaff: formData.assignedStaff || 'الأخصائي المناوب',
      branch: formData.branch || currentTenant.branch || 'HRG-MAIN',
      depositAmount: Number(formData.depositAmount) || 0,
      totalEstimatedAmount: Number(formData.totalEstimatedAmount) || 0,
      status: (formData.status as any) || 'مؤكد',
      notes: formData.notes || ''
    };

    setBookings([newBk, ...bookings]);
    setShowAddModal(false);
    handleShowNotice(`تم تسجيل الحجز الجديد (${newBk.bookingNo}) للعميل (${newBk.customerName}) في جدول sales.bookings بنجاح!`);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBooking) return;

    setBookings(bookings.map(b => b.id === editingBooking.id ? editingBooking : b));
    handleShowNotice(`تم تعديل الحجز (${editingBooking.bookingNo}) بنجاح.`);
    setEditingBooking(null);
  };

  const handleUpdateStatus = (id: string, newStatus: 'مؤكد' | 'مكتمل وتم التشغيل' | 'ملغي') => {
    setBookings(bookings.map(b => b.id === id ? { ...b, status: newStatus } : b));
    handleShowNotice(`تم تحديث حالة الحجز إلى: ${newStatus}`);
  };

  const filteredBookings = bookings.filter(b => {
    const matchesSearch = 
      b.bookingNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.customerPhone.includes(searchQuery) ||
      b.serviceName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || b.status === selectedStatus;
    
    const todayStr = '2026-10-15';
    const tomorrowStr = '2026-10-16';
    const matchesDate = 
      dateFilter === 'all' ? true :
      dateFilter === 'today' ? b.bookingDate === todayStr :
      b.bookingDate === tomorrowStr;

    return matchesSearch && matchesStatus && matchesDate;
  });

  const totalDeposits = bookings.reduce((sum, b) => sum + b.depositAmount, 0);
  const totalEstimated = bookings.reduce((sum, b) => sum + b.totalEstimatedAmount, 0);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 text-cyan-800 text-xs font-semibold border border-cyan-200 mb-2">
            <Database className="w-3.5 h-3.5 text-cyan-600" />
            <span>جدول مستقل في قاعدة البيانات: sales.bookings (RLS Enforced)</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 font-['Cairo'] flex items-center gap-2">
            <Calendar className="w-6 h-6 text-cyan-600" />
            <span>شاشة إدارة الحجوزات والمواعيد المسبقة (Bookings Management)</span>
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            جدول مستقل لإدارة مواعيد الجلسات، اختيار الأخصائي، تحصيل العرابين، والتحويل المباشر إلى جلسة تشغيل يومية.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold shadow-md shadow-cyan-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>حجز موعد جديد (booking.create)</span>
        </button>
      </div>

      {notice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-bold">إجمالي الحجوزات</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2 font-mono">{bookings.length}</p>
          <span className="text-[11px] text-slate-500">حجوزات مجدولة ومؤكدة</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-bold">حجوزات اليوم (15 أكتوبر)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-700 mt-2 font-mono">
            {bookings.filter(b => b.bookingDate === '2026-10-15').length}
          </p>
          <span className="text-[11px] text-emerald-600 font-medium">مواعيد تشغيل اليوم</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-bold">إجمالي العرابين المحصلة</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-indigo-700 mt-2 font-mono">
            {totalDeposits.toLocaleString()} <span className="text-xs font-normal">ج.م</span>
          </p>
          <span className="text-[11px] text-indigo-600 font-medium">تأكيد حجز مالي مسبق</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-bold">الإيراد التقديري الإجمالي</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-700 mt-2 font-mono">
            {totalEstimated.toLocaleString()} <span className="text-xs font-normal">ج.م</span>
          </p>
          <span className="text-[11px] text-amber-600 font-medium">عند إتمام الجلسات</span>
        </div>
      </div>

      {/* Filters and Date Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex-1 min-w-[260px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
          <input
            type="text"
            placeholder="بحث برقم الحجز، اسم العميل، الهاتف أو الخدمة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Date Filters */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setDateFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                dateFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              كل الأيام
            </button>
            <button
              onClick={() => setDateFilter('today')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                dateFilter === 'today' ? 'bg-white text-cyan-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              حجوزات اليوم (15)
            </button>
            <button
              onClick={() => setDateFilter('tomorrow')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                dateFilter === 'tomorrow' ? 'bg-white text-cyan-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              حجوزات الغد (16)
            </button>
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
          >
            <option value="all">كل الحالات</option>
            <option value="مؤكد">مؤكد</option>
            <option value="قيد الانتظار">قيد الانتظار</option>
            <option value="مكتمل وتم التشغيل">مكتمل وتم التشغيل</option>
            <option value="ملغي">ملغي</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <span>جدول الحجوزات والمواعيد ({filteredBookings.length})</span>
            <span className="text-[10px] font-mono bg-cyan-100 text-cyan-800 px-2 py-0.5 rounded-full font-bold">
              sales.bookings
            </span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <th className="p-3">رقم الحجز والموعد</th>
                <th className="p-3">العميل</th>
                <th className="p-3">الخدمة / الإجراء المطلوب</th>
                <th className="p-3">الأخصائي والفرع</th>
                <th className="p-3">العربون المسدد</th>
                <th className="p-3">القيمة التقديرية</th>
                <th className="p-3">الحالة</th>
                <th className="p-3 text-center">الإجراءات والتشغيل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBookings.map(bk => (
                <tr key={bk.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3">
                    <span className="font-mono text-xs font-bold text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200 inline-block">
                      {bk.bookingNo}
                    </span>
                    <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-slate-800 mt-1">
                      <Clock className="w-3.5 h-3.5 text-cyan-600" />
                      <span>{bk.bookingDate} | {bk.bookingTime}</span>
                    </div>
                  </td>

                  <td className="p-3">
                    <div className="font-bold text-slate-900">{bk.customerName}</div>
                    <div className="flex items-center gap-1 font-mono text-[11px] text-slate-500 mt-0.5">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{bk.customerPhone}</span>
                    </div>
                  </td>

                  <td className="p-3">
                    <span className="font-medium text-slate-800 block">{bk.serviceName}</span>
                    {bk.notes && (
                      <span className="text-[10px] text-slate-400 block mt-0.5 truncate max-w-xs">{bk.notes}</span>
                    )}
                  </td>

                  <td className="p-3 text-[11px]">
                    <div className="font-bold text-slate-700">{bk.assignedStaff}</div>
                    <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded mt-0.5 inline-block">
                      {bk.branch}
                    </span>
                  </td>

                  <td className="p-3 font-mono font-bold text-indigo-700">
                    {bk.depositAmount > 0 ? `${bk.depositAmount.toLocaleString()} ج.م` : 'بدون عربون'}
                  </td>

                  <td className="p-3 font-mono font-black text-slate-900">
                    {bk.totalEstimatedAmount.toLocaleString()} ج.م
                  </td>

                  <td className="p-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      bk.status === 'مؤكد'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : bk.status === 'مكتمل وتم التشغيل'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : bk.status === 'ملغي'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {bk.status}
                    </span>
                  </td>

                  <td className="p-3">
                    <div className="flex items-center justify-center gap-1.5">
                      {bk.status !== 'مكتمل وتم التشغيل' && (
                        <button
                          type="button"
                          onClick={() => {
                            if (onExecuteSession) {
                              onExecuteSession(bk);
                            } else {
                              handleUpdateStatus(bk.id, 'مكتمل وتم التشغيل');
                            }
                          }}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-[11px] font-bold transition-all shadow-xs"
                          title="تحويل الموعد إلى جلسة تشغيل منفذة"
                        >
                          <Play className="w-3 h-3 text-emerald-600" />
                          <span>تشغيل الجلسة</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setEditingBooking({ ...bk })}
                        className="p-1.5 rounded-lg border border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100 transition-all"
                        title="تعديل الموعد"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      {bk.status !== 'ملغي' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(bk.id, 'ملغي')}
                          className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 transition-all"
                          title="إلغاء الحجز"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Booking Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form onSubmit={handleAddBooking} className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyan-600" />
                <span>حجز موعد جديد في قاعدة البيانات (sales.bookings)</span>
              </h3>
              <button type="button" onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">العميل *</label>
                <select
                  value={formData.customerId}
                  onChange={(e) => {
                    const c = INITIAL_CUSTOMERS.find(x => x.id === e.target.value);
                    if (c) {
                      setFormData({
                        ...formData,
                        customerId: c.id,
                        customerName: c.name,
                        customerPhone: c.phone
                      });
                    }
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                >
                  {INITIAL_CUSTOMERS.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الخدمة / الجلسة المطلوبة *</label>
                <input
                  type="text"
                  required
                  value={formData.serviceName}
                  onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">تاريخ الحجز *</label>
                <input
                  type="date"
                  required
                  value={formData.bookingDate}
                  onChange={(e) => setFormData({ ...formData, bookingDate: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">التوقيت *</label>
                <input
                  type="text"
                  placeholder="04:30 م"
                  value={formData.bookingTime}
                  onChange={(e) => setFormData({ ...formData, bookingTime: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الأخصائي المسؤول</label>
                <input
                  type="text"
                  value={formData.assignedStaff}
                  onChange={(e) => setFormData({ ...formData, assignedStaff: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الفرع</label>
                <select
                  value={formData.branch}
                  onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                >
                  <option value="HRG-MAIN">الغردقة الرئيسي</option>
                  <option value="SSH-RESORT">شرم الشيخ</option>
                  <option value="CAI-HQ">القاهرة الإداري</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">مبلغ العربون المسدد (ج.م)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.depositAmount}
                  onChange={(e) => setFormData({ ...formData, depositAmount: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">القيمة التقديرية الإجمالية (ج.م)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.totalEstimatedAmount}
                  onChange={(e) => setFormData({ ...formData, totalEstimatedAmount: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات الحجز</label>
              <textarea
                rows={2}
                placeholder="تجهيزات الغرفة، تفضيل جهاز معين..."
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
                className="px-5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold shadow-md shadow-cyan-600/20"
              >
                حفظ الحجز
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Booking Modal */}
      {editingBooking && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form onSubmit={handleSaveEdit} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Pencil className="w-4 h-4 text-cyan-600" />
                <span>تعديل الحجز ({editingBooking.bookingNo})</span>
              </h3>
              <button type="button" onClick={() => setEditingBooking(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">تاريخ الحجز</label>
                <input
                  type="date"
                  value={editingBooking.bookingDate}
                  onChange={(e) => setEditingBooking({ ...editingBooking, bookingDate: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">وقت الموعد</label>
                <input
                  type="text"
                  value={editingBooking.bookingTime}
                  onChange={(e) => setEditingBooking({ ...editingBooking, bookingTime: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الأخصائي المسؤول</label>
                <input
                  type="text"
                  value={editingBooking.assignedStaff}
                  onChange={(e) => setEditingBooking({ ...editingBooking, assignedStaff: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">حالة الحجز</label>
                <select
                  value={editingBooking.status}
                  onChange={(e) => setEditingBooking({ ...editingBooking, status: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                >
                  <option value="مؤكد">مؤكد</option>
                  <option value="قيد الانتظار">قيد الانتظار</option>
                  <option value="مكتمل وتم التشغيل">مكتمل وتم التشغيل</option>
                  <option value="ملغي">ملغي</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingBooking(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold shadow-sm"
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
