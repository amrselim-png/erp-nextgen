import React, { useState } from 'react';
import { TenantContext, UserRole, CustomerFollowupRecord, CustomerRecord } from '../types.ts';
import { INITIAL_CUSTOMER_FOLLOWUPS, INITIAL_CUSTOMERS } from '../data/mockCrmAndOperationsData.ts';
import { 
  MessageSquare, 
  Plus, 
  Search, 
  Phone, 
  MessageCircle, 
  Mail, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  User, 
  AlertCircle, 
  Sparkles, 
  Filter, 
  X, 
  Database,
  ArrowRight
} from 'lucide-react';

interface CustomerFollowupsViewProps {
  currentTenant: TenantContext;
  userRole: UserRole;
}

export const CustomerFollowupsView: React.FC<CustomerFollowupsViewProps> = ({
  currentTenant,
  userRole
}) => {
  const [followups, setFollowups] = useState<CustomerFollowupRecord[]>(INITIAL_CUSTOMER_FOLLOWUPS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [selectedPurpose, setSelectedPurpose] = useState<string>('all');
  const [selectedOutcome, setSelectedOutcome] = useState<string>('all');
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<CustomerFollowupRecord | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<CustomerFollowupRecord>>({
    customerId: INITIAL_CUSTOMERS[0]?.id || '',
    customerName: INITIAL_CUSTOMERS[0]?.name || '',
    customerPhone: INITIAL_CUSTOMERS[0]?.phone || '',
    contactDate: new Date().toISOString().replace('T', ' ').slice(0, 16),
    channel: 'واتساب (WhatsApp)',
    purpose: 'متابعة ما بعد الجلسة',
    agentName: 'سارة إبراهيم (خدمة العملاء)',
    summary: '',
    nextFollowupDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    outcome: 'إيجابي ومهتم'
  });

  const handleShowNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3500);
  };

  const handleAddFollowup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName || !formData.summary) return;

    const newFlw: CustomerFollowupRecord = {
      id: `flw-${Date.now()}`,
      customerId: formData.customerId || `cust-${Date.now()}`,
      customerName: formData.customerName,
      customerPhone: formData.customerPhone || '01000000000',
      contactDate: formData.contactDate || new Date().toISOString().replace('T', ' ').slice(0, 16),
      channel: (formData.channel as any) || 'اتصال هاتفي',
      purpose: (formData.purpose as any) || 'متابعة ما بعد الجلسة',
      agentName: formData.agentName || 'موظف خدمة العملاء',
      summary: formData.summary,
      nextFollowupDate: formData.nextFollowupDate || new Date().toISOString().split('T')[0],
      outcome: (formData.outcome as any) || 'إيجابي ومهتم'
    };

    setFollowups([newFlw, ...followups]);
    setShowAddModal(false);
    setFormData({
      customerId: INITIAL_CUSTOMERS[0]?.id || '',
      customerName: INITIAL_CUSTOMERS[0]?.name || '',
      customerPhone: INITIAL_CUSTOMERS[0]?.phone || '',
      contactDate: new Date().toISOString().replace('T', ' ').slice(0, 16),
      channel: 'واتساب (WhatsApp)',
      purpose: 'متابعة ما بعد الجلسة',
      agentName: 'سارة إبراهيم (خدمة العملاء)',
      summary: '',
      nextFollowupDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      outcome: 'إيجابي ومهتم'
    });
    handleShowNotice(`تم تسجيل متابعة العميل (${newFlw.customerName}) في جدول sales.customer_followups بنجاح!`);
  };

  const filteredFollowups = followups.filter(f => {
    const matchesSearch = 
      f.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.customerPhone.includes(searchQuery) ||
      f.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.agentName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesChannel = selectedChannel === 'all' || f.channel === selectedChannel;
    const matchesPurpose = selectedPurpose === 'all' || f.purpose === selectedPurpose;
    const matchesOutcome = selectedOutcome === 'all' || f.outcome === selectedOutcome;

    return matchesSearch && matchesChannel && matchesPurpose && matchesOutcome;
  });

  const getChannelBadge = (ch: string) => {
    switch (ch) {
      case 'واتساب (WhatsApp)':
        return <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200"><MessageCircle className="w-3 h-3 text-emerald-600" /> واتساب</span>;
      case 'اتصال هاتفي':
        return <span className="flex items-center gap-1 text-[11px] font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200"><Phone className="w-3 h-3 text-sky-600" /> اتصال</span>;
      case 'زيارة مباشرة':
        return <span className="flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200"><User className="w-3 h-3 text-amber-600" /> زيارة</span>;
      default:
        return <span className="flex items-center gap-1 text-[11px] font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200"><Mail className="w-3 h-3 text-purple-600" /> إيميل</span>;
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200 mb-2">
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span>جدول مستقل في قاعدة البيانات: sales.customer_followups (RLS Enforced)</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 font-['Cairo'] flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-teal-600" />
            <span>شاشة إدارة متابعات العملاء وعلاقات العملاء (CRM Follow-ups)</span>
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            توثيق سجل المكالمات والمحادثات، قياس رضا العملاء بعد الجلسات، التذكير بالمواعيد، وجدولة المتابعات القادمة.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>تسجيل متابعة جديدة (followup.create)</span>
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
            <span className="text-xs text-slate-500 font-bold">إجمالي المتابعات المسجلة</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2 font-mono">{followups.length}</p>
          <span className="text-[11px] text-slate-500">مكالمات ورسائل واتساب موثقة</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-bold">نتائج إيجابية وتأكيد حضور</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-700 mt-2 font-mono">
            {followups.filter(f => f.outcome === 'إيجابي ومهتم' || f.outcome === 'تم تأكيد الحضور' || f.outcome === 'تم السداد').length}
          </p>
          <span className="text-[11px] text-emerald-600 font-medium">نسبة تفاعل عالية مع العملاء</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-bold">متابعات قادمة مجدولة</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-sky-700 mt-2 font-mono">
            {followups.filter(f => Boolean(f.nextFollowupDate)).length}
          </p>
          <span className="text-[11px] text-sky-600 font-medium">مواعيد تواصل مجدولة قادمة</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex-1 min-w-[260px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
          <input
            type="text"
            placeholder="بحث باسم العميل، الهاتف، ملخص المكالمة أو اسم الموظف..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedChannel}
            onChange={(e) => setSelectedChannel(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
          >
            <option value="all">كل قنوات الاتصال</option>
            <option value="واتساب (WhatsApp)">واتساب (WhatsApp)</option>
            <option value="اتصال هاتفي">اتصال هاتفي</option>
            <option value="زيارة مباشرة">زيارة مباشرة</option>
            <option value="بريد إلكتروني">بريد إلكتروني</option>
          </select>

          <select
            value={selectedPurpose}
            onChange={(e) => setSelectedPurpose(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
          >
            <option value="all">كل الأغراض</option>
            <option value="متابعة ما بعد الجلسة">متابعة ما بعد الجلسة</option>
            <option value="تذكير بموعد حجز">تذكير بموعد حجز</option>
            <option value="تحصيل مديونية">تحصيل مديونية</option>
            <option value="عرض ترويجي وخاص">عرض ترويجي وخاص</option>
          </select>
        </div>
      </div>

      {/* Timeline List of Followups */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <span>سجل خط زمني للمتابعات ({filteredFollowups.length})</span>
            <span className="text-[10px] font-mono bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full font-bold">
              sales.customer_followups
            </span>
          </h3>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredFollowups.map(flw => (
            <div key={flw.id} className="p-5 hover:bg-slate-50/70 transition-colors space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 font-bold">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">{flw.customerName}</h4>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                      <span>{flw.customerPhone}</span>
                      <span>•</span>
                      <span>المسؤول: {flw.agentName}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {getChannelBadge(flw.channel)}
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    {flw.purpose}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    flw.outcome === 'إيجابي ومهتم' || flw.outcome === 'تم تأكيد الحضور' || flw.outcome === 'تم السداد'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}>
                    {flw.outcome}
                  </span>
                </div>
              </div>

              {/* Summary note */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
                {flw.summary}
              </div>

              <div className="flex flex-wrap items-center justify-between text-xs pt-1">
                <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>توقيت التواصل: {flw.contactDate}</span>
                  </span>
                  {flw.nextFollowupDate && (
                    <span className="flex items-center gap-1 text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      <Calendar className="w-3.5 h-3.5 text-teal-600" />
                      <span>المتابعة القادمة: {flw.nextFollowupDate}</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`https://wa.me/2${flw.customerPhone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-xs font-bold transition-all"
                  >
                    <MessageCircle className="w-3 h-3 text-emerald-600" />
                    <span>مراسلة واتساب</span>
                  </a>

                  <a
                    href={`tel:${flw.customerPhone}`}
                    className="flex items-center gap-1 px-3 py-1 bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-200 rounded-lg text-xs font-bold transition-all"
                  >
                    <Phone className="w-3 h-3 text-sky-600" />
                    <span>اتصال فوري</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Followup Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form onSubmit={handleAddFollowup} className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-teal-600" />
                <span>تسجيل متابعة عميل جديدة (sales.customer_followups)</span>
              </h3>
              <button type="button" onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">العميل المعني *</label>
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
                <label className="block font-bold text-slate-700 mb-1">قناة التواصل *</label>
                <select
                  value={formData.channel}
                  onChange={(e) => setFormData({ ...formData, channel: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                >
                  <option value="واتساب (WhatsApp)">واتساب (WhatsApp)</option>
                  <option value="اتصال هاتفي">اتصال هاتفي</option>
                  <option value="زيارة مباشرة">زيارة مباشرة</option>
                  <option value="بريد إلكتروني">بريد إلكتروني</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الغرض من المتابعة *</label>
                <select
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                >
                  <option value="متابعة ما بعد الجلسة">متابعة ما بعد الجلسة</option>
                  <option value="تذكير بموعد حجز">تذكير بموعد حجز</option>
                  <option value="تحصيل مديونية">تحصيل مديونية</option>
                  <option value="عرض ترويجي وخاص">عرض ترويجي وخاص</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">نتيجة التواصل *</label>
                <select
                  value={formData.outcome}
                  onChange={(e) => setFormData({ ...formData, outcome: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                >
                  <option value="إيجابي ومهتم">إيجابي ومهتم</option>
                  <option value="تم تأكيد الحضور">تم تأكيد الحضور</option>
                  <option value="تم السداد">تم السداد</option>
                  <option value="لم يرد / مشغول">لم يرد / مشغول</option>
                  <option value="غير مهتم">غير مهتم</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الموظف المسؤول</label>
                <input
                  type="text"
                  value={formData.agentName}
                  onChange={(e) => setFormData({ ...formData, agentName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">تاريخ المتابعة القادمة المجدول</label>
                <input
                  type="date"
                  value={formData.nextFollowupDate}
                  onChange={(e) => setFormData({ ...formData, nextFollowupDate: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ملخص ما دار في المكالمة أو المحادثة *</label>
              <textarea
                rows={3}
                required
                placeholder="تفاصيل رد العميل، الملاحظات، الشكاوى أو طلبات الحجز الإضافية..."
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
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
                className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/20"
              >
                حفظ المتابعة
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
