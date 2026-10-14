import React, { useState } from 'react';
import { TenantContext, UserRole } from '../types.ts';
import { 
  Users, 
  CalendarCheck, 
  DollarSign, 
  Printer, 
  Upload, 
  CheckCircle2, 
  Plus, 
  FileText, 
  Clock, 
  ShieldCheck, 
  Building, 
  AlertTriangle,
  FileSpreadsheet,
  Download
} from 'lucide-react';

interface HrPayrollViewProps {
  currentTenant: TenantContext;
  userRole: UserRole;
}

interface Employee {
  id: string;
  code: string;
  name: string;
  department: string;
  branch: string;
  jobTitle: string;
  basicSalary: number;
  allowances: number;
  insuranceDeduction: number;
  joinDate: string;
  status: 'active' | 'on_leave' | 'terminated';
}

interface PayrollRunRecord {
  id: string;
  monthAr: string;
  year: number;
  totalEmployees: number;
  grossAmount: number;
  deductionsAmount: number;
  netPayout: number;
  status: 'DRAFT' | 'APPROVED' | 'PAID';
  approvedDate?: string;
}

export const HrPayrollView: React.FC<HrPayrollViewProps> = ({
  currentTenant,
  userRole
}) => {
  const [activeTab, setActiveTab] = useState<'employees' | 'attendance' | 'payroll' | 'payslip'>('employees');

  // Employees State
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: 'emp_01',
      code: 'EMP-104',
      name: 'عمرو سليم عبد الرحيم',
      department: 'تكنولوجيا المعلومات (IT)',
      branch: 'HRG-MAIN',
      jobTitle: 'مدير النظم والمعلومات',
      basicSalary: 35000,
      allowances: 8000,
      insuranceDeduction: 1400,
      joinDate: '2021-03-01',
      status: 'active'
    },
    {
      id: 'emp_02',
      code: 'EMP-105',
      name: 'محمود أحمد القاضي',
      department: 'الأغذية والمشروبات (F&B)',
      branch: 'HRG-MAIN',
      jobTitle: 'كابتن صالة رئيسي',
      basicSalary: 12000,
      allowances: 3500,
      insuranceDeduction: 850,
      joinDate: '2022-07-15',
      status: 'active'
    },
    {
      id: 'emp_03',
      code: 'EMP-106',
      name: 'سارة إبراهيم حسن',
      department: 'الإدارة المالية والمحاسبة',
      branch: 'CAI-HQ',
      jobTitle: 'رئيس قسم الحسابات العامة',
      basicSalary: 24000,
      allowances: 4500,
      insuranceDeduction: 1100,
      joinDate: '2020-01-10',
      status: 'active'
    },
    {
      id: 'emp_04',
      code: 'EMP-107',
      name: 'طارق عبد المنعم',
      department: 'الإشراف الداخلي (Housekeeping)',
      branch: 'SSH-RESORT',
      jobTitle: 'مشرف غرف وأجنحة',
      basicSalary: 9500,
      allowances: 2000,
      insuranceDeduction: 650,
      joinDate: '2023-05-20',
      status: 'active'
    }
  ]);

  // Attendance import simulation
  const [attendanceRecords, setAttendanceRecords] = useState([
    { code: 'EMP-104', name: 'عمرو سليم', daysPresent: 26, lateMinutes: 15, overtimeHours: 8, status: 'VALID' },
    { code: 'EMP-105', name: 'محمود القاضي', daysPresent: 25, lateMinutes: 45, overtimeHours: 4, status: 'VALID' },
    { code: 'EMP-106', name: 'سارة إبراهيم', daysPresent: 26, lateMinutes: 0, overtimeHours: 6, status: 'VALID' },
    { code: 'EMP-107', name: 'طارق عبد المنعم', daysPresent: 24, lateMinutes: 120, overtimeHours: 0, status: 'PENALTY_FLAG' }
  ]);
  const [isImportingAttendance, setIsImportingAttendance] = useState(false);

  // Payroll Runs
  const [payrollRuns, setPayrollRuns] = useState<PayrollRunRecord[]>([
    {
      id: 'payrun_2026_09',
      monthAr: 'سبتمبر 2026',
      year: 2026,
      totalEmployees: 4,
      grossAmount: 98500,
      deductionsAmount: 4850,
      netPayout: 93650,
      status: 'APPROVED',
      approvedDate: '2026-09-30'
    },
    {
      id: 'payrun_2026_10',
      monthAr: 'أكتوبر 2026 (الحالي)',
      year: 2026,
      totalEmployees: 4,
      grossAmount: 98500,
      deductionsAmount: 5120,
      netPayout: 93380,
      status: 'DRAFT'
    }
  ]);

  // Modals & Selected Payslip
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [selectedPayslipEmp, setSelectedPayslipEmp] = useState<Employee>(employees[0]);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // New Employee Form
  const [newEmpData, setNewEmpData] = useState({
    code: 'EMP-108',
    name: '',
    department: 'المبيعات والتسويق',
    branch: 'HRG-MAIN',
    jobTitle: 'أخصائي مبيعات',
    basicSalary: 14000,
    allowances: 3000,
    insuranceDeduction: 900
  });

  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpData.name) return;
    const emp: Employee = {
      id: `emp_${Date.now()}`,
      code: newEmpData.code,
      name: newEmpData.name,
      department: newEmpData.department,
      branch: newEmpData.branch,
      jobTitle: newEmpData.jobTitle,
      basicSalary: newEmpData.basicSalary,
      allowances: newEmpData.allowances,
      insuranceDeduction: newEmpData.insuranceDeduction,
      joinDate: new Date().toISOString().split('T')[0],
      status: 'active'
    };
    setEmployees([...employees, emp]);
    setShowAddEmployeeModal(false);
    setActionNotice(`تم إضافة الموظف الجديد ${emp.name} بنجاح (employee.create)!`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleImportAttendance = () => {
    setIsImportingAttendance(true);
    setTimeout(() => {
      setIsImportingAttendance(false);
      setActionNotice('تم فحص واستيراد ملف البصمة السحابي بنجاح (attendance.import) لـ 4 موظفين دون أخطاء حرجة!');
      setTimeout(() => setActionNotice(null), 4000);
    }, 1000);
  };

  const handleRunPayroll = () => {
    setActionNotice('تم إعادة احتساب مسير المرتبات لشهر أكتوبر 2026 (payroll.run) استناداً لساعات الحضور والبدلات والتأمينات!');
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleApprovePayroll = (runId: string) => {
    setPayrollRuns(payrollRuns.map(pr => {
      if (pr.id === runId) {
        return {
          ...pr,
          status: 'APPROVED',
          approvedDate: new Date().toISOString().split('T')[0]
        };
      }
      return pr;
    }));
    setActionNotice(
      'تم اعتماد مسير المرتبات رسمياً (payroll.approve) وإقفال الفترة وتوليد القيد المحاسبي لرواتب العاملين في دفتر اليومية!'
    );
    setTimeout(() => setActionNotice(null), 5000);
  };

  const handlePrintPayslip = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveTab('employees')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'employees'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>سجل الموظفين (employee.create)</span>
          </button>

          <button
            onClick={() => setActiveTab('attendance')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'attendance'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <CalendarCheck className="w-4 h-4" />
            <span>الحضور والانصراف (attendance.import)</span>
          </button>

          <button
            onClick={() => setActiveTab('payroll')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'payroll'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>مسير المرتبات والاعتماد (payroll.run / approve)</span>
          </button>

          <button
            onClick={() => setActiveTab('payslip')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'payslip'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>قسيمة الراتب والطباعة (payslip.print)</span>
          </button>
        </div>

        <div>
          {activeTab === 'employees' && (
            <button
              onClick={() => setShowAddEmployeeModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>موظف جديد (employee.create)</span>
            </button>
          )}

          {activeTab === 'attendance' && (
            <button
              onClick={handleImportAttendance}
              disabled={isImportingAttendance}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
            >
              <Upload className="w-4 h-4" />
              <span>{isImportingAttendance ? 'جاري الاستيراد...' : 'استيراد البصمة attendance.import'}</span>
            </button>
          )}

          {activeTab === 'payroll' && (
            <button
              onClick={handleRunPayroll}
              className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
            >
              <DollarSign className="w-4 h-4" />
              <span>تشغيل المسير payroll.run</span>
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

      {/* 1. Employees View */}
      {activeTab === 'employees' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-sky-600" />
                <span>سجل الموظفين والرواتب التعاقدية</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                ربط الموظفين بالأقسام والفروع مع تثبيت الراتب الأساسي والبدلات والتأمينات الاجتماعية
              </p>
            </div>
            <span className="text-xs font-mono bg-slate-100 text-slate-700 px-3 py-1 rounded-lg font-bold">
              {employees.length} موظف مسجل
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <th className="p-3">الكود والاسم</th>
                  <th className="p-3">القسم والمسمى الوظيفي</th>
                  <th className="p-3">الفرع</th>
                  <th className="p-3">الراتب الأساسي</th>
                  <th className="p-3">البدلات</th>
                  <th className="p-3">التأمينات (خصم)</th>
                  <th className="p-3">تاريخ التعيين</th>
                  <th className="p-3 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{emp.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{emp.code}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-slate-800">{emp.jobTitle}</div>
                      <div className="text-[11px] text-slate-500">{emp.department}</div>
                    </td>
                    <td className="p-3 font-bold text-slate-700">{emp.branch}</td>
                    <td className="p-3 font-mono font-bold text-slate-900">{emp.basicSalary.toLocaleString()} ج.م</td>
                    <td className="p-3 font-mono text-emerald-700">+{emp.allowances.toLocaleString()} ج.م</td>
                    <td className="p-3 font-mono text-rose-700">-{emp.insuranceDeduction.toLocaleString()} ج.م</td>
                    <td className="p-3 font-mono text-slate-500">{emp.joinDate}</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => {
                          setSelectedPayslipEmp(emp);
                          setActiveTab('payslip');
                        }}
                        className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-lg text-[11px] font-bold transition-all"
                      >
                        عرض القسيمة
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. Attendance View */}
      {activeTab === 'attendance' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-indigo-600" />
                <span>سجلات الحضور والانصراف والبصمة الإلكترونية (attendance.import)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                فحص ملف البصمة صفاً بصف واكتشاف التأخيرات والانصراف المبكر مع احتساب ساعات العمل الإضافي
              </p>
            </div>

            <button
              onClick={handleImportAttendance}
              disabled={isImportingAttendance}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
            >
              <Upload className="w-4 h-4" />
              <span>استيراد ملف جديد (attendance.import)</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <th className="p-3">كود الموظف</th>
                  <th className="p-3">اسم الموظف</th>
                  <th className="p-3">أيام الحضور الفعلية</th>
                  <th className="p-3">دقائق التأخير</th>
                  <th className="p-3">ساعات الإضافي (Overtime)</th>
                  <th className="p-3">حالة التدقيق</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attendanceRecords.map((att, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3 font-mono font-bold text-sky-700">{att.code}</td>
                    <td className="p-3 font-bold text-slate-900">{att.name}</td>
                    <td className="p-3 font-mono font-bold">{att.daysPresent} يوم</td>
                    <td className="p-3 font-mono text-amber-700">{att.lateMinutes} دقيقة</td>
                    <td className="p-3 font-mono text-emerald-700">+{att.overtimeHours} ساعة</td>
                    <td className="p-3">
                      {att.status === 'VALID' ? (
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                          مطابق (Valid)
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                          تجاوز تأخير (Penalty)
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Payroll Runs View */}
      {activeTab === 'payroll' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>مسيرات الرواتب الشهرية والاعتماد المحاسبي</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                توليد القيود المحاسبية التلقائية وتثبيت مستحقات العاملين في دفتر اليومية
              </p>
            </div>

            <button
              onClick={handleRunPayroll}
              className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
            >
              <DollarSign className="w-4 h-4" />
              <span>احتساب مسير جديد payroll.run</span>
            </button>
          </div>

          <div className="space-y-4">
            {payrollRuns.map((pr) => (
              <div key={pr.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-sm text-slate-900">{pr.monthAr}</h4>
                    <span className="font-mono text-xs bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700 font-bold">
                      {pr.totalEmployees} موظف
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-mono text-slate-600 pt-1">
                    <span>إجمالي الاستحقاق: <strong className="text-slate-900">{pr.grossAmount.toLocaleString()} ج.م</strong></span>
                    <span>الاستقطاعات: <strong className="text-rose-600">-{pr.deductionsAmount.toLocaleString()} ج.م</strong></span>
                    <span>صافي الصرف: <strong className="text-emerald-700 font-black">{pr.netPayout.toLocaleString()} ج.م</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {pr.status === 'APPROVED' ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>معتمد ومرحل دفترياً ({pr.approvedDate})</span>
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleApprovePayroll(pr.id)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>اعتماد المسير payroll.approve</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Payslip View */}
      {activeTab === 'payslip' && (
        <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
          <div className="flex items-start justify-between border-b-2 border-slate-100 pb-5">
            <div>
              <span className="text-[11px] font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200">
                {currentTenant.nameAr}
              </span>
              <h3 className="text-lg font-black text-slate-900 mt-2">قسيمة راتب الموظف (Monthly Payslip)</h3>
              <p className="text-xs text-slate-500 font-mono">شهر أكتوبر 2026 | مسير رقم: PR-2026-10</p>
            </div>

            <button
              onClick={handlePrintPayslip}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold border border-slate-300 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة payslip.print</span>
            </button>
          </div>

          {/* Employee metadata */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500">اسم الموظف:</span>
              <p className="font-extrabold text-slate-900 text-sm mt-0.5">{selectedPayslipEmp.name}</p>
            </div>
            <div>
              <span className="text-slate-500">الرقم الوظيفي:</span>
              <p className="font-mono font-bold text-sky-700 mt-0.5">{selectedPayslipEmp.code}</p>
            </div>
            <div>
              <span className="text-slate-500">الوظيفة / القسم:</span>
              <p className="font-bold text-slate-800 mt-0.5">{selectedPayslipEmp.jobTitle} - {selectedPayslipEmp.department}</p>
            </div>
            <div>
              <span className="text-slate-500">الفرع المخصص:</span>
              <p className="font-bold text-slate-800 mt-0.5">{selectedPayslipEmp.branch}</p>
            </div>
          </div>

          {/* Salary Breakdown Table */}
          <div className="grid grid-cols-2 gap-6 text-xs">
            {/* Earnings */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-emerald-800 pb-2 border-b border-emerald-100">الاستحقاقات (Earnings)</h4>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">الراتب الأساسي:</span>
                <span className="font-mono font-bold">{selectedPayslipEmp.basicSalary.toLocaleString()} ج.م</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">بدل سكن وانتقال:</span>
                <span className="font-mono font-bold">{selectedPayslipEmp.allowances.toLocaleString()} ج.م</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 text-emerald-700 font-bold">
                <span>ساعات عمل إضافي (Overtime):</span>
                <span className="font-mono">+1,200 ج.م</span>
              </div>
              <div className="flex justify-between pt-2 font-black text-slate-900">
                <span>إجمالي الاستحقاق:</span>
                <span className="font-mono">{(selectedPayslipEmp.basicSalary + selectedPayslipEmp.allowances + 1200).toLocaleString()} ج.م</span>
              </div>
            </div>

            {/* Deductions */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-rose-800 pb-2 border-b border-rose-100">الاستقطاعات (Deductions)</h4>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">تأمينات اجتماعية (حصة الموظف 11%):</span>
                <span className="font-mono font-bold text-rose-600">-{selectedPayslipEmp.insuranceDeduction.toLocaleString()} ج.م</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">ضريبة كسب العمل المصرية:</span>
                <span className="font-mono font-bold text-rose-600">-650 ج.م</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">صندوق رعاية الشهداء / تكافل:</span>
                <span className="font-mono font-bold text-rose-600">-35 ج.م</span>
              </div>
              <div className="flex justify-between pt-2 font-black text-rose-700">
                <span>إجمالي الخصومات:</span>
                <span className="font-mono">-{(selectedPayslipEmp.insuranceDeduction + 685).toLocaleString()} ج.م</span>
              </div>
            </div>
          </div>

          {/* Net payout bar */}
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-emerald-800">صافي الراتب المستحق للصرف (Net Payout):</span>
              <p className="text-xs text-slate-500">يُحول على حساب بنك CIB مصر</p>
            </div>
            <div className="text-2xl font-black font-mono text-emerald-700">
              {(selectedPayslipEmp.basicSalary + selectedPayslipEmp.allowances + 1200 - (selectedPayslipEmp.insuranceDeduction + 685)).toLocaleString()} <span className="text-sm font-normal">ج.م</span>
            </div>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      {showAddEmployeeModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form onSubmit={handleCreateEmployee} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 border border-slate-200">
            <h4 className="text-sm font-extrabold text-slate-900">إضافة موظف جديد (employee.create)</h4>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">اسم الموظف</label>
              <input
                type="text"
                required
                value={newEmpData.name}
                onChange={(e) => setNewEmpData({ ...newEmpData, name: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الكود الوظيفي</label>
                <input
                  type="text"
                  required
                  value={newEmpData.code}
                  onChange={(e) => setNewEmpData({ ...newEmpData, code: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">المسمى الوظيفي</label>
                <input
                  type="text"
                  required
                  value={newEmpData.jobTitle}
                  onChange={(e) => setNewEmpData({ ...newEmpData, jobTitle: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الراتب الأساسي (ج.م)</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={newEmpData.basicSalary}
                  onChange={(e) => setNewEmpData({ ...newEmpData, basicSalary: Number(e.target.value) })}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">البدلات (ج.م)</label>
                <input
                  type="number"
                  min="0"
                  value={newEmpData.allowances}
                  onChange={(e) => setNewEmpData({ ...newEmpData, allowances: Number(e.target.value) })}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddEmployeeModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 shadow-sm"
              >
                حفظ الموظف
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
