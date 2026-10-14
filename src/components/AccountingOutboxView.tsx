import React, { useState } from 'react';
import { OutboxMessage } from '../types.ts';
import { INITIAL_OUTBOX_MESSAGES } from '../data/mockErpData.ts';
import { 
  BookOpenCheck, 
  Play, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Layers, 
  Database, 
  ArrowRight, 
  Zap, 
  RefreshCw 
} from 'lucide-react';

export const AccountingOutboxView: React.FC = () => {
  const [messages, setMessages] = useState<OutboxMessage[]>(INITIAL_OUTBOX_MESSAGES);
  const [isSimulatingSaga, setIsSimulatingSaga] = useState(false);
  const [currentSagaStep, setCurrentSagaStep] = useState<number>(0);
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [sagaLogs, setSagaLogs] = useState<string[]>([]);

  // Run a new POS Sale -> Outbox -> Inventory -> Accounting Saga
  const runNewTransactionSaga = async (forceFail = false) => {
    setIsSimulatingSaga(true);
    setSimulateFailure(forceFail);
    setCurrentSagaStep(1);
    const orderId = `ORD-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const newLogs: string[] = [];

    // Step 1: POS Sale in local transaction
    newLogs.push(`[${new Date().toLocaleTimeString('ar-EG')}] 1. الكاشير أتم الفاتورة (${orderId}). تم كتابة الفاتورة وسجل الـ Outbox داخل نفس الـ Postgres Transaction بنجاح (زمن 8ms).`);
    setSagaLogs([...newLogs]);

    const newOutboxMsg: OutboxMessage = {
      id: `outbox-${Date.now().toString().slice(-4)}`,
      event_type: 'sales.order_completed',
      aggregate_id: orderId,
      payload: { order_id: orderId, amount: 1540, itemsCount: 3 },
      status: 'PENDING',
      retry_count: 0,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [newOutboxMsg, ...prev]);

    // Step 2: Hangfire Background Dispatcher picks up message
    await new Promise(r => setTimeout(r, 700));
    setCurrentSagaStep(2);
    newLogs.push(`[${new Date().toLocaleTimeString('ar-EG')}] 2. عامل Hangfire التقط الرسالة من جدول Outbox وبدأ استدعاء موديول المخازن (Deduct Stock)...`);
    setSagaLogs([...newLogs]);

    // Step 3: Inventory Deducted
    await new Promise(r => setTimeout(r, 700));
    setCurrentSagaStep(3);
    newLogs.push(`[${new Date().toLocaleTimeString('ar-EG')}] 3. تم خصم المخزون بنجاح وتسجيل حركة الكارتة برقم إصدار جديد.`);
    setSagaLogs([...newLogs]);

    // Step 4: Accounting Posting
    await new Promise(r => setTimeout(r, 800));
    if (forceFail) {
      setCurrentSagaStep(4);
      newLogs.push(`[${new Date().toLocaleTimeString('ar-EG')}] ⚠️ 4. فشل في موديول الحسابات: الفترة المالية مقفلة (Fiscal Period Locked)!`);
      newLogs.push(`[${new Date().toLocaleTimeString('ar-EG')}] 🔁 تم جدولة إعادة المحاولة (Retry 1/3) عبر Hangfire مع Exponential Backoff...`);
      setSagaLogs([...newLogs]);

      await new Promise(r => setTimeout(r, 1000));
      newLogs.push(`[${new Date().toLocaleTimeString('ar-EG')}] 🛡️ تفعيل التعويض (Compensating Transaction): تم فتح تذكرة قيد معلق وإشعار المدير المالي دون تعطيل نقطة البيع POS!`);
      setSagaLogs([...newLogs]);

      setMessages(prev => prev.map(m => m.id === newOutboxMsg.id ? { 
        ...m, 
        status: 'COMPENSATED', 
        retry_count: 3, 
        error: 'Period Closed - Compensated via Suspense Ledger' 
      } : m));
    } else {
      setCurrentSagaStep(4);
      newLogs.push(`[${new Date().toLocaleTimeString('ar-EG')}] 4. تم ترحيل قيد اليومية المتوازن (JV) في موديول الحسابات العامة (GL) وتحديث حالة الـ Outbox إلى PROCESSED.`);
      setSagaLogs([...newLogs]);

      setMessages(prev => prev.map(m => m.id === newOutboxMsg.id ? { 
        ...m, 
        status: 'PROCESSED', 
        retry_count: 0 
      } : m));
    }

    setIsSimulatingSaga(false);
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Top Banner (Day Mode) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-mono text-xs font-bold border border-amber-200">
              قاعدة معمارية أساسية
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 font-['Cairo']">
              الاتساق المحاسبي ونمط الـ Transactional Outbox & Saga
            </h2>
          </div>
          <p className="text-xs text-slate-600">
            العمليات الممتدة بين الموديولات (<strong className="text-sky-700">بيع ➔ خصم مخزون ➔ ترحيل قيد عام</strong>) تكون <span className="text-amber-700 font-bold">Eventually Consistent</span> لتفادي القفل الموزع (2PC) الذي يوقف الكاشير.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={() => runNewTransactionSaga(false)}
            disabled={isSimulatingSaga}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50"
          >
            <Play className="w-4 h-4" />
            <span>محاكاة فاتورة ناجحة (Saga Happy Path)</span>
          </button>

          <button
            onClick={() => runNewTransactionSaga(true)}
            disabled={isSimulatingSaga}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer transition-all shadow-md shadow-rose-600/20 disabled:opacity-50"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>محاكاة فشل الحسابات والتعويض (Compensation)</span>
          </button>
        </div>
      </div>

      {/* Interactive Step Visualizer */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
        <h3 className="font-bold text-slate-900 text-xs mb-4 font-['Cairo'] flex items-center gap-2">
          <Layers className="w-4 h-4 text-sky-600" />
          <span>مراحل دورة حياة المعاملة العابرة للموديولات (Saga Execution Steps)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          {/* Step 1 */}
          <div className={`p-4 rounded-xl border transition-all ${
            currentSagaStep === 1 
              ? 'bg-sky-50 border-sky-400 ring-2 ring-sky-400/20' 
              : currentSagaStep > 1 
              ? 'bg-slate-50 border-emerald-300 text-slate-700' 
              : 'bg-slate-50 border-slate-200 text-slate-500'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono font-bold text-[11px] text-sky-700">01. POS Transaction</span>
              {currentSagaStep > 1 ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Clock className="w-4 h-4 text-slate-400" />}
            </div>
            <h4 className="font-bold text-slate-900 mb-1 font-['Cairo']">تسجيل الفاتورة والـ Outbox</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              داخل نفس المعاملة (Atomicity)، الكاشير ينتهي في 10ms دون انتظار أي موديول خارجي.
            </p>
          </div>

          {/* Step 2 */}
          <div className={`p-4 rounded-xl border transition-all ${
            currentSagaStep === 2 
              ? 'bg-sky-50 border-sky-400 ring-2 ring-sky-400/20' 
              : currentSagaStep > 2 
              ? 'bg-slate-50 border-emerald-300 text-slate-700' 
              : 'bg-slate-50 border-slate-200 text-slate-500'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono font-bold text-[11px] text-amber-700">02. Hangfire Worker</span>
              {currentSagaStep > 2 ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Clock className="w-4 h-4 text-slate-400" />}
            </div>
            <h4 className="font-bold text-slate-900 mb-1 font-['Cairo']">التقاط الحدث بالخلفية</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              قراءة سجل الـ Outbox مع Idempotency Key لمنع تكرار المعالجة إذا انقطع الاتصال.
            </p>
          </div>

          {/* Step 3 */}
          <div className={`p-4 rounded-xl border transition-all ${
            currentSagaStep === 3 
              ? 'bg-sky-50 border-sky-400 ring-2 ring-sky-400/20' 
              : currentSagaStep > 3 
              ? 'bg-slate-50 border-emerald-300 text-slate-700' 
              : 'bg-slate-50 border-slate-200 text-slate-500'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono font-bold text-[11px] text-emerald-700">03. Inventory Module</span>
              {currentSagaStep > 3 ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Clock className="w-4 h-4 text-slate-400" />}
            </div>
            <h4 className="font-bold text-slate-900 mb-1 font-['Cairo']">خصم أرصدة الأصناف</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              تطبيق الخصم في schema المخازن مع زيادة الـ version وبث إشعار SignalR للأرصدة.
            </p>
          </div>

          {/* Step 4 */}
          <div className={`p-4 rounded-xl border transition-all ${
            currentSagaStep === 4 
              ? 'bg-sky-50 border-sky-400 ring-2 ring-sky-400/20' 
              : currentSagaStep > 4 
              ? 'bg-slate-50 border-emerald-300 text-slate-700' 
              : 'bg-slate-50 border-slate-200 text-slate-500'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono font-bold text-[11px] text-purple-700">04. Accounting Post</span>
              {currentSagaStep === 4 && simulateFailure ? <AlertTriangle className="w-4 h-4 text-rose-600" /> : currentSagaStep > 4 ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Clock className="w-4 h-4 text-slate-400" />}
            </div>
            <h4 className="font-bold text-slate-900 mb-1 font-['Cairo']">ترحيل قيد اليومية (GL)</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              إنشاء القيد المزدوج المتوازن (مدين/دائن) أو تفعيل حركة التعويض في حالة الخطأ.
            </p>
          </div>
        </div>
      </div>

      {/* Live Saga Execution Logs */}
      {sagaLogs.length > 0 && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <span className="text-xs font-bold text-slate-900 font-['Cairo'] flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-600" />
              <span>سجل تدفق أحداث الـ Saga اللحظي:</span>
            </span>
            <button
              onClick={() => setSagaLogs([])}
              className="text-[11px] text-slate-500 hover:text-slate-800 font-semibold"
            >
              مسح السجل
            </button>
          </div>
          <div className="space-y-1.5 font-mono text-xs max-h-[160px] overflow-y-auto no-scrollbar">
            {sagaLogs.map((log, idx) => (
              <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800">
                {log}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Outbox Table Records */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-amber-600" />
            <span className="font-bold text-slate-900 font-['Cairo']">
              جدول الـ Outbox في قاعدة بيانات Postgres (sales.outbox_messages)
            </span>
          </div>
          <span className="text-slate-500 text-[11px] font-mono font-semibold">
            Guaranteed At-Least-Once Delivery
          </span>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-['Cairo']">
              <tr>
                <th className="p-3.5">معرف الرسالة</th>
                <th className="p-3.5">نوع الحدث (Event)</th>
                <th className="p-3.5">الرقم المرجعي (Aggregate)</th>
                <th className="p-3.5 text-center">الحالة (Status)</th>
                <th className="p-3.5 text-center">المحاولات (Retries)</th>
                <th className="p-3.5">وقت الإنشاء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 font-mono text-[11px]">
              {messages.map((msg) => (
                <tr key={msg.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5 text-slate-500">{msg.id}</td>
                  <td className="p-3.5 text-slate-900 font-bold">{msg.event_type}</td>
                  <td className="p-3.5 text-sky-700 font-bold">{msg.aggregate_id}</td>
                  <td className="p-3.5 text-center">
                    <span className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
                      msg.status === 'PROCESSED'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : msg.status === 'COMPENSATED'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : msg.status === 'FAILED'
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : 'bg-sky-100 text-sky-800 border border-sky-200'
                    }`}>
                      {msg.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-center text-slate-600 font-bold">{msg.retry_count}</td>
                  <td className="p-3.5 text-slate-500">{new Date(msg.created_at).toLocaleTimeString('ar-EG')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
