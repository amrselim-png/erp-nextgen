import React, { useState } from 'react';
import { TenantContext, UserRole } from '../types.ts';
import { 
  Stethoscope, 
  Calendar, 
  Pill, 
  FileText, 
  Plus, 
  CheckCircle2, 
  Clock, 
  User, 
  Activity, 
  Printer, 
  AlertCircle,
  HeartPulse,
  Syringe,
  FileSpreadsheet
} from 'lucide-react';

interface MedicalClinicsViewProps {
  currentTenant: TenantContext;
  userRole: UserRole;
}

interface Appointment {
  id: string;
  patientName: string;
  patientNationalId: string;
  doctorName: string;
  specialty: string;
  timeSlot: string;
  status: 'CONFIRMED' | 'IN_CONSULTATION' | 'COMPLETED' | 'CANCELLED';
  fee: number;
}

interface ClinicalVisit {
  id: string;
  patientName: string;
  doctorName: string;
  date: string;
  vitals: {
    bloodPressure: string;
    pulse: number;
    temp: number;
    weightKg: number;
  };
  symptoms: string;
  icd10Diagnosis: string;
  diagnosisAr: string;
  notes: string;
}

interface Prescription {
  id: string;
  rxNumber: string;
  patientName: string;
  doctorName: string;
  date: string;
  drugs: {
    name: string;
    dose: string;
    frequency: string;
    duration: string;
  }[];
}

export const MedicalClinicsView: React.FC<MedicalClinicsViewProps> = ({
  currentTenant,
  userRole
}) => {
  const [activeTab, setActiveTab] = useState<'appointments' | 'encounter' | 'prescriptions'>('appointments');

  // Appointments State
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: 'apt_1',
      patientName: 'إبراهيم علي خليل',
      patientNationalId: '28904150102938',
      doctorName: 'د. سامح عبد الفتاح',
      specialty: 'الباطنة والقلب',
      timeSlot: '10:30 ص',
      status: 'CONFIRMED',
      fee: 450
    },
    {
      id: 'apt_2',
      patientName: 'منى عبد العظيم',
      patientNationalId: '29311020108845',
      doctorName: 'د. هالة رشدي',
      specialty: 'الجلدية والليزر',
      timeSlot: '11:00 ص',
      status: 'IN_CONSULTATION',
      fee: 500
    },
    {
      id: 'apt_3',
      patientName: 'ياسين أحمد فؤاد',
      patientNationalId: '30208190105521',
      doctorName: 'د. سامح عبد الفتاح',
      specialty: 'الباطنة والقلب',
      timeSlot: '11:30 ص',
      status: 'COMPLETED',
      fee: 450
    }
  ]);

  // Clinical Encounters
  const [encounters, setEncounters] = useState<ClinicalVisit[]>([
    {
      id: 'vis_101',
      patientName: 'ياسين أحمد فؤاد',
      doctorName: 'د. سامح عبد الفتاح',
      date: '2026-10-14 11:30',
      vitals: { bloodPressure: '125/80', pulse: 76, temp: 37.1, weightKg: 78 },
      symptoms: 'إجهاد مستمر مع خفقان طفيف بعد الجهد',
      icd10Diagnosis: 'I10 - Essential (primary) hypertension',
      diagnosisAr: 'ارتفاع ضغط دم أولي طفيف مع إجهاد عصبي',
      notes: 'إجراء رسم قلب وتعديل نمط الغذاء مع تقليل ملح الصوديوم'
    }
  ]);

  // Prescriptions
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([
    {
      id: 'rx_501',
      rxNumber: 'RX-2026-0089',
      patientName: 'ياسين أحمد فؤاد',
      doctorName: 'د. سامح عبد الفتاح',
      date: '2026-10-14',
      drugs: [
        { name: 'Concor 5 Plus (Bisoprolol/HCTZ)', dose: '5/12.5 mg', frequency: 'قرص صباحاً بعد الإفطار', duration: '30 يوم' },
        { name: 'Cardiopirin 81 mg', dose: '81 mg', frequency: 'قرص يومياً بعد الغداء', duration: '30 يوم' },
        { name: 'Omega-3 Max 1000 mg', dose: '1000 mg', frequency: 'كبسولة مساءً', duration: '60 يوم' }
      ]
    }
  ]);

  // Modals & Notices
  const [showBookModal, setShowBookModal] = useState(false);
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [showRxModal, setShowRxModal] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // New Booking Form
  const [newBookData, setNewBookData] = useState({
    patientName: '',
    patientNationalId: '',
    doctorName: 'د. سامح عبد الفتاح',
    specialty: 'الباطنة والقلب',
    timeSlot: '12:00 م',
    fee: 450
  });

  // Handlers
  const handleBookAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBookData.patientName) return;
    const newApt: Appointment = {
      id: `apt_${Date.now()}`,
      patientName: newBookData.patientName,
      patientNationalId: newBookData.patientNationalId || '29000000000000',
      doctorName: newBookData.doctorName,
      specialty: newBookData.specialty,
      timeSlot: newBookData.timeSlot,
      status: 'CONFIRMED',
      fee: newBookData.fee
    };
    setAppointments([...appointments, newApt]);
    setShowBookModal(false);
    setActionNotice(`تم تأكيد حجز الموعد بنجاح (clinic.book) للمريض ${newApt.patientName}!`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleStartConsultation = (aptId: string) => {
    setAppointments(appointments.map(a => a.id === aptId ? { ...a, status: 'IN_CONSULTATION' } : a));
    setActionNotice('تم فتح ملف الزيارة الطبية السريرية للمريض (clinic.visit)!');
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handlePrintPrescription = (rx: Prescription) => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveTab('appointments')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'appointments'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>حجز المواعيد والاستقبال (clinic.book)</span>
          </button>

          <button
            onClick={() => setActiveTab('encounter')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'encounter'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>الكشف الطبي والتشخيص (clinic.visit)</span>
          </button>

          <button
            onClick={() => setActiveTab('prescriptions')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'prescriptions'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Pill className="w-4 h-4" />
            <span>الروشتة الإلكترونية والأدوية (clinic.prescription)</span>
          </button>
        </div>

        <div>
          {activeTab === 'appointments' && (
            <button
              onClick={() => setShowBookModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>حجز موعد كشف (clinic.book)</span>
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

      {/* 1. Appointments Tab */}
      {activeTab === 'appointments' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-sky-600" />
                <span>جدول مواعيد العيادات الخارجية لليوم</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                متابعة الحجوزات، تسديد رسوم الكشف، ودخول المرضى لغرف الأطباء
              </p>
            </div>

            <button
              onClick={() => setShowBookModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>حجز مريض جديد clinic.book</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <th className="p-3">اسم المريض</th>
                  <th className="p-3">الرقم القومي / الملف</th>
                  <th className="p-3">الطبيب المعالج والتخصص</th>
                  <th className="p-3">الموعد المحدد</th>
                  <th className="p-3">قيمة الكشف</th>
                  <th className="p-3">الحالة</th>
                  <th className="p-3 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3 font-bold text-slate-900">{apt.patientName}</td>
                    <td className="p-3 font-mono text-slate-500">{apt.patientNationalId}</td>
                    <td className="p-3">
                      <div className="font-bold text-slate-800">{apt.doctorName}</div>
                      <div className="text-[11px] text-slate-500">{apt.specialty}</div>
                    </td>
                    <td className="p-3 font-mono font-bold text-indigo-700">{apt.timeSlot}</td>
                    <td className="p-3 font-mono font-bold text-emerald-700">{apt.fee} ج.م</td>
                    <td className="p-3">
                      {apt.status === 'CONFIRMED' && (
                        <span className="text-[11px] font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200">
                          بانتظار الدخول
                        </span>
                      )}
                      {apt.status === 'IN_CONSULTATION' && (
                        <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                          داخل غرفة الكشف الآن
                        </span>
                      )}
                      {apt.status === 'COMPLETED' && (
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                          تم الكشف وصرف العلاج
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      {apt.status === 'CONFIRMED' && (
                        <button
                          onClick={() => handleStartConsultation(apt.id)}
                          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold transition-all"
                        >
                          دخول الكشف clinic.visit
                        </button>
                      )}
                      {apt.status !== 'CONFIRMED' && (
                        <button
                          onClick={() => setActiveTab('encounter')}
                          className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold transition-all"
                        >
                          عرض الملف الطبي
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. Clinical Encounter Tab */}
      {activeTab === 'encounter' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-indigo-600" />
                <span>سجل الفحص الطبي السريري والتشخيص الدولي (ICD-10 Encounters)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                تسجيل العلامات الحيوية، التاريخ المرضي، والتشخيص الدقيق المعتمد
              </p>
            </div>
          </div>

          {encounters.map((enc) => (
            <div key={enc.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/70 pb-3">
                <div>
                  <h4 className="font-extrabold text-base text-slate-900">{enc.patientName}</h4>
                  <span className="text-xs text-slate-500 font-mono">
                    الطبيب: {enc.doctorName} | التاريخ: {enc.date}
                  </span>
                </div>

                <span className="font-mono text-xs bg-indigo-100 text-indigo-800 px-3 py-1 rounded-lg font-bold">
                  {enc.icd10Diagnosis}
                </span>
              </div>

              {/* Vitals */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3.5 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500">ضغط الدم:</span>
                  <p className="font-mono font-bold text-slate-900 text-sm">{enc.vitals.bloodPressure} mmHg</p>
                </div>
                <div>
                  <span className="text-slate-500">النبض:</span>
                  <p className="font-mono font-bold text-rose-600 text-sm">{enc.vitals.pulse} bpm</p>
                </div>
                <div>
                  <span className="text-slate-500">حرارة الجسم:</span>
                  <p className="font-mono font-bold text-amber-600 text-sm">{enc.vitals.temp} °C</p>
                </div>
                <div>
                  <span className="text-slate-500">الوزن:</span>
                  <p className="font-mono font-bold text-slate-900 text-sm">{enc.vitals.weightKg} kg</p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="font-bold text-slate-700">شكوى المريض والأعراض:</span>
                  <p className="text-slate-800 mt-0.5 bg-white p-2.5 rounded-lg border border-slate-200">{enc.symptoms}</p>
                </div>
                <div>
                  <span className="font-bold text-slate-700">التشخيص الطبي والتوصيات:</span>
                  <p className="text-slate-800 mt-0.5 bg-white p-2.5 rounded-lg border border-slate-200">{enc.diagnosisAr} — {enc.notes}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. Prescriptions Tab */}
      {activeTab === 'prescriptions' && (
        <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
          <div className="flex items-start justify-between border-b-2 border-slate-100 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full border border-emerald-200">
                  عيادات النيل التخصصية
                </span>
                <span className="font-mono text-xs text-slate-500">RX-2026-0089</span>
              </div>
              <h3 className="text-xl font-black text-slate-900 mt-2">الروشتة الطبية الإلكترونية (e-Prescription)</h3>
              <p className="text-xs text-slate-500">مرخصة من وزارة الصحة ونقابة الأطباء المصرية</p>
            </div>

            <button
              onClick={() => handlePrintPrescription(prescriptions[0])}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold border border-slate-300 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة الروشتة clinic.prescription</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500">المريض:</span>
              <p className="font-extrabold text-slate-900 text-sm mt-0.5">{prescriptions[0].patientName}</p>
            </div>
            <div>
              <span className="text-slate-500">الطبيب المعالج:</span>
              <p className="font-bold text-slate-800 text-sm mt-0.5">{prescriptions[0].doctorName}</p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <Pill className="w-4 h-4 text-emerald-600" />
              <span>الأدوية والجرعات المقررة:</span>
            </h4>

            <div className="space-y-3">
              {prescriptions[0].drugs.map((d, i) => (
                <div key={i} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <h5 className="font-bold text-slate-900 text-sm">{d.name}</h5>
                    <p className="text-slate-600 mt-0.5">{d.frequency} ({d.dose})</p>
                  </div>
                  <span className="font-mono text-xs bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 font-bold">
                    المدة: {d.duration}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Book Modal */}
      {showBookModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form onSubmit={handleBookAppointment} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 border border-slate-200">
            <h4 className="text-sm font-extrabold text-slate-900">حجز موعد كشف جديد (clinic.book)</h4>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">اسم المريض الكامل</label>
              <input
                type="text"
                required
                placeholder="e.g. حسن مصطفى"
                value={newBookData.patientName}
                onChange={(e) => setNewBookData({ ...newBookData, patientName: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">الرقم القومي (14 رقم)</label>
              <input
                type="text"
                placeholder="e.g. 29402100109923"
                value={newBookData.patientNationalId}
                onChange={(e) => setNewBookData({ ...newBookData, patientNationalId: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">العيادة / الطبيب</label>
                <select
                  value={newBookData.doctorName}
                  onChange={(e) => setNewBookData({ ...newBookData, doctorName: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                >
                  <option value="د. سامح عبد الفتاح">د. سامح عبد الفتاح (باطنة)</option>
                  <option value="د. هالة رشدي">د. هالة رشدي (جلدية)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">رسوم الكشف (ج.م)</label>
                <input
                  type="number"
                  value={newBookData.fee}
                  onChange={(e) => setNewBookData({ ...newBookData, fee: Number(e.target.value) })}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                />
              </div>
            </div>
            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowBookModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-sky-600 text-white rounded-xl text-xs font-bold hover:bg-sky-700 shadow-sm"
              >
                تأكيد الحجز
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
