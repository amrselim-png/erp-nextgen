import React, { useState } from 'react';
import { TenantContext, UserRole, DailySessionRecord, FixedAssetRecord, CustomerRecord, PaymentMethodRecord } from '../types.ts';
import { INITIAL_DAILY_SESSIONS, INITIAL_FIXED_ASSETS, INITIAL_CUSTOMERS, INITIAL_PAYMENT_METHODS } from '../data/mockCrmAndOperationsData.ts';
import { 
  Activity, 
  Plus, 
  Search, 
  Play, 
  CheckCircle2, 
  Clock, 
  Cpu, 
  User, 
  DollarSign, 
  Printer, 
  CreditCard, 
  Database, 
  X, 
  Sparkles,
  Layers,
  Check,
  Building2,
  FileText
} from 'lucide-react';

interface DailySessionsOperationsViewProps {
  currentTenant: TenantContext;
  userRole: UserRole;
  paymentMethods?: PaymentMethodRecord[];
}

export const DailySessionsOperationsView: React.FC<DailySessionsOperationsViewProps> = ({
  currentTenant,
  userRole,
  paymentMethods = INITIAL_PAYMENT_METHODS
}) => {
  const [sessions, setSessions] = useState<DailySessionRecord[]>(INITIAL_DAILY_SESSIONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSessionDetail, setSelectedSessionDetail] = useState<DailySessionRecord | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<DailySessionRecord>>({
    sessionNo: `SES-2026-0${sessions.length + 4}`,
    dateTime: `${new Date().toISOString().split('T')[0]} ${new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}`,
    customerId: INITIAL_CUSTOMERS[0]?.id || '',
    customerName: INITIAL_CUSTOMERS[0]?.name || '',
    serviceTitle: 'جلسة ليزر كانديلا جنتل ماكس برو كاملة',
    deviceId: INITIAL_FIXED_ASSETS[0]?.id || '',
    deviceName: INITIAL_FIXED_ASSETS[0]?.assetName || '',
    specialistName: 'د. ياسمين الشريف (أخصائية الجلدية)',
    durationMinutes: 45,
    roomNumber: 'غرفة الليزر 101',
    materialsConsumed: 'كريم مهدئ، غاز تبريد DCD، نظارات حماية',
    sessionFee: 2000,
    status: 'منفذة بنجاح',
    paymentMethod: 'نقداً (خزينة الكاشير)',
    notes: 'تمت الجلسة بنجاح وتحديث ساعات تشغيل الجهاز'
  });

  const handleShowNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3500);
  };

  const handleAddSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName || !formData.serviceTitle) return;

    const newSes: DailySessionRecord = {
      id: `ses-${Date.now()}`,
      sessionNo: formData.sessionNo || `SES-2026-0${sessions.length + 4}`,
      dateTime: formData.dateTime || new Date().toISOString().slice(0, 16),
      customerId: formData.customerId || `cust-${Date.now()}`,
      customerName: formData.customerName,
      serviceTitle: formData.serviceTitle,
      deviceId: formData.deviceId || '',
      deviceName: formData.deviceName || 'جهاز تشغيل',
      specialistName: formData.specialistName || 'الأخصائي المناوب',
      durationMinutes: Number(formData.durationMinutes) || 30,
      roomNumber: formData.roomNumber || 'غرفة 1',
      materialsConsumed: formData.materialsConsumed || 'مستهلكات عادية',
      sessionFee: Number(formData.sessionFee) || 0,
      status: (formData.status as any) || 'منفذة بنجاح',
      paymentMethod: formData.paymentMethod || 'نقداً (خزينة الكاشير)',
      notes: formData.notes || '',
      journalEntryGenerated: true
    };

    setSessions([newSes, ...sessions]);
    setShowAddModal(false);
    handleShowNotice(`تم تسجيل جلسة التشغيل اليومية (${newSes.sessionNo})، وتحديث عداد استهلاك الجهاز (${newSes.durationMinutes} دقيقة)، وتوليد القيد المحاسبي الحصري بنجاح!`);
  };

  const filteredSessions = sessions.filter(s => {
    const matchesSearch = 
      s.sessionNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.serviceTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.deviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.specialistName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || s.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const totalDailyRevenue = sessions.reduce((sum, s) => sum + s.sessionFee, 0);
  const totalMinutes = sessions.reduce((sum, s) => sum + s.durationMinutes, 0);
  const completedCount = sessions.filter(s => s.status === 'منفذة بنجاح').length;

  return (
    <div className="space-y-6" dir="rtl">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200 mb-2">
            <Activity className="w-3.5 h-3.5 text-emerald-600" />
            <span>جدول مستقل في قاعدة البيانات: clinic.daily_sessions (Real-time Operations)</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 font-['Cairo'] flex items-center gap-2">
            <Activity className="w-6 h-6 text-emerald-600" />
            <span>شاشة التشغيل وتسجيل الجلسات المنفذة خلال اليوم</span>
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            سجل العمليات اليومية: توثيق الجلسات المنفذة، ربطها بالأجهزة والأصول (لتحديث عمود استهلاك الجهاز)، وإصدار القيود المحاسبية.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>تسجيل جلسة تشغيل جديدة (session.execute)</span>
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
            <span className="text-xs text-slate-500 font-bold">جلسات التشغيل اليوم</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2 font-mono">{sessions.length}</p>
          <span className="text-[11px] text-emerald-600 font-medium">{completedCount} جلسة منفذة بنجاح</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-bold">إجمالي إيراد التشغيل اليوم</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-indigo-700 mt-2 font-mono">
            {totalDailyRevenue.toLocaleString()} <span className="text-xs font-normal">ج.م</span>
          </p>
          <span className="text-[11px] text-slate-500">محصلة ومرحلة بالحسابات</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-bold">ساعات تشغيل الأجهزة اليوم</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-700 mt-2 font-mono">
            {(totalMinutes / 60).toFixed(1)} <span className="text-xs font-normal">ساعة</span>
          </p>
          <span className="text-[11px] text-amber-600 font-medium">محدثة في عمود استهلاك الأجهزة</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-bold">القيود المحاسبية المتولدة</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-purple-700 mt-2 font-mono">
            {sessions.filter(s => s.journalEntryGenerated).length}
          </p>
          <span className="text-[11px] text-purple-600 font-medium">مصدر حصري موثق 100%</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex-1 min-w-[260px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
          <input
            type="text"
            placeholder="بحث برقم الجلسة، العميل، اسم الجهاز، الأخصائي، أو الإجراء..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
        >
          <option value="all">كل الحالات التشغيلية</option>
          <option value="منفذة بنجاح">منفذة بنجاح</option>
          <option value="جارية الآن">جارية الآن</option>
          <option value="ملغاة">ملغاة</option>
        </select>
      </div>

      {/* Sessions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <span>سجل الجلسات المنفذة اليوم ({filteredSessions.length})</span>
            <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
              clinic.daily_sessions
            </span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <th className="p-3">رقم الجلسة والتوقيت</th>
                <th className="p-3">العميل</th>
                <th className="p-3">نوع الجلسة والإجراء</th>
                <th className="p-3">الجهاز المستخدم (تحديث الاستهلاك)</th>
                <th className="p-3">الأخصائي والغرفة</th>
                <th className="p-3">المدة</th>
                <th className="p-3">القيمة وطريقة السداد</th>
                <th className="p-3">الحالة</th>
                <th className="p-3 text-center">المعاينة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSessions.map(ses => (
                <tr key={ses.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3">
                    <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">
                      {ses.sessionNo}
                    </span>
                    <div className="text-[10px] text-slate-400 font-mono mt-1">{ses.dateTime}</div>
                  </td>

                  <td className="p-3">
                    <div className="font-bold text-slate-900">{ses.customerName}</div>
                  </td>

                  <td className="p-3 font-medium text-slate-800">
                    <div>{ses.serviceTitle}</div>
                    {ses.materialsConsumed && (
                      <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-xs">{ses.materialsConsumed}</div>
                    )}
                  </td>

                  <td className="p-3">
                    <div className="flex items-center gap-1.5 text-amber-900 font-bold text-[11px] bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                      <Cpu className="w-3.5 h-3.5 text-amber-600" />
                      <span>{ses.deviceName}</span>
                    </div>
                  </td>

                  <td className="p-3 text-[11px]">
                    <div className="font-bold text-slate-700">{ses.specialistName}</div>
                    <span className="text-[10px] text-slate-400">{ses.roomNumber}</span>
                  </td>

                  <td className="p-3 font-mono font-bold text-slate-700">
                    <span className="bg-slate-100 px-2 py-0.5 rounded">{ses.durationMinutes} دقيقة</span>
                  </td>

                  <td className="p-3">
                    <div className="font-mono font-black text-sm text-indigo-700">
                      {ses.sessionFee.toLocaleString()} ج.م
                    </div>
                    <span className="text-[10px] text-slate-500 block">{ses.paymentMethod}</span>
                  </td>

                  <td className="p-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      ses.status === 'منفذة بنجاح'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : ses.status === 'جارية الآن'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {ses.status}
                    </span>
                  </td>

                  <td className="p-3 text-center">
                    <button
                      type="button"
                      onClick={() => setSelectedSessionDetail(ses)}
                      className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition-all"
                      title="عرض تفاصيل الجلسة وإيصال التشغيل"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Session Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form onSubmit={handleAddSession} className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-600" />
                <span>تسجيل جلسة تشغيل يومية منفذة (clinic.daily_sessions)</span>
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
                        customerName: c.name
                      });
                    }
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                >
                  {INITIAL_CUSTOMERS.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">نوع الجلسة أو الإجراء المنفذ *</label>
                <input
                  type="text"
                  required
                  value={formData.serviceTitle}
                  onChange={(e) => setFormData({ ...formData, serviceTitle: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">الجهاز المستخدم (لتحديث عمود استهلاك الجهاز) *</label>
                <select
                  value={formData.deviceId}
                  onChange={(e) => {
                    const ast = INITIAL_FIXED_ASSETS.find(x => x.id === e.target.value);
                    setFormData({
                      ...formData,
                      deviceId: e.target.value,
                      deviceName: ast?.assetName || ''
                    });
                  }}
                  className="w-full px-3 py-2 bg-amber-50 border border-amber-300 text-amber-900 rounded-xl font-bold"
                >
                  {INITIAL_FIXED_ASSETS.map(ast => (
                    <option key={ast.id} value={ast.id}>
                      {ast.assetCode} - {ast.assetName} (عداد: {ast.deviceUsageTracker.totalOperatingHours} س)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">مدة الجلسة (بالدقائق) *</label>
                <input
                  type="number"
                  min="5"
                  required
                  value={formData.durationMinutes}
                  onChange={(e) => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">قيمة الجلسة (ج.م) *</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.sessionFee}
                  onChange={(e) => setFormData({ ...formData, sessionFee: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-indigo-700"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الأخصائي أو الطبيب المنفذ</label>
                <input
                  type="text"
                  value={formData.specialistName}
                  onChange={(e) => setFormData({ ...formData, specialistName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">طريقة السداد</label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                >
                  {paymentMethods.filter(m => m.isActive).map(m => (
                    <option key={m.id} value={m.nameAr}>{m.nameAr}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">المستهلكات والمواد الطبية المصروفة</label>
              <input
                type="text"
                placeholder="خامات، جيل، إبر، شاش، ماسك..."
                value={formData.materialsConsumed}
                onChange={(e) => setFormData({ ...formData, materialsConsumed: e.target.value })}
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
                تأكيد تسجيل الجلسة وتحديث العداد
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Session Details / Receipt Modal */}
      {selectedSessionDetail && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-emerald-600" />
                <span>إيصال جلسة تشغيل: {selectedSessionDetail.sessionNo}</span>
              </span>
              <button onClick={() => setSelectedSessionDetail(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-dashed border-slate-300 font-mono text-xs space-y-2 text-slate-900">
              <div className="text-center pb-2 border-b border-dashed border-slate-300">
                <h4 className="font-bold font-['Cairo'] text-sm">{currentTenant.nameAr}</h4>
                <p className="text-[10px] text-slate-500">{selectedSessionDetail.dateTime}</p>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-['Cairo']">العميل:</span>
                <span className="font-bold font-['Cairo']">{selectedSessionDetail.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-['Cairo']">الجهاز:</span>
                <span className="font-bold font-['Cairo']">{selectedSessionDetail.deviceName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-['Cairo']">المدة:</span>
                <span className="font-bold">{selectedSessionDetail.durationMinutes} دقيقة</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-['Cairo']">المسؤول:</span>
                <span className="font-bold font-['Cairo']">{selectedSessionDetail.specialistName}</span>
              </div>
              <div className="pt-2 border-t border-dashed border-slate-300 flex justify-between text-sm font-bold text-emerald-700">
                <span className="font-['Cairo']">المبلغ المحصل:</span>
                <span>{selectedSessionDetail.sessionFee.toLocaleString()} ج.م</span>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedSessionDetail(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200"
              >
                إغلاق
              </button>
              <button
                type="button"
                onClick={() => alert(`جاري طباعة إيصال الجلسة (${selectedSessionDetail.sessionNo})...`)}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>طباعة الإيصال</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
