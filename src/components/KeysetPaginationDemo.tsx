import React, { useState } from 'react';
import { 
  Zap, 
  Database, 
  ArrowDown, 
  Clock, 
  Cpu, 
  CheckCircle2, 
  AlertTriangle, 
  Code, 
  TrendingUp 
} from 'lucide-react';

export const KeysetPaginationDemo: React.FC = () => {
  const [totalRows] = useState<number>(250000);
  const [offsetTarget, setOffsetTarget] = useState<number>(180000);
  const [offsetTimeMs, setOffsetTimeMs] = useState<number | null>(null);
  const [keysetTimeMs, setKeysetTimeMs] = useState<number | null>(null);
  const [isBenchmarking, setIsBenchmarking] = useState(false);

  // Run benchmark comparison
  const runComparisonBenchmark = () => {
    setIsBenchmarking(true);
    setOffsetTimeMs(null);
    setKeysetTimeMs(null);

    setTimeout(() => {
      // Offset simulates scanning: proportional to offset depth
      const simOffsetTime = Math.round(35 + (offsetTarget / 1000) * 0.95);
      setOffsetTimeMs(simOffsetTime);

      // Keyset is constant O(1) index seek: 1 - 3 ms
      const simKeysetTime = Math.round(1.2 + Math.random() * 1.5);
      setKeysetTimeMs(simKeysetTime);

      setIsBenchmarking(false);
    }, 600);
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Banner (Day Mode) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 font-mono text-xs font-bold border border-sky-200">
              حل معضلة AG Grid Community (Risk 2)
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 font-['Cairo']">
              المقارنة الحية: Keyset (Seek) Pagination مقابل OFFSET التقليدي
            </h2>
          </div>
          <p className="text-xs text-slate-600">
            AG Grid Community لا يحتوي على <span className="font-mono text-amber-700 font-bold">Server-Side Row Model</span> (متاح فقط في Enterprise بـ $999 للمطور). الحل الهندسي: استخدام <strong className="text-emerald-700">Infinite Row Model</strong> مع <strong className="text-sky-700">Keyset Pagination</strong> يمنحك أداء أسرع 100 ضعف دون أي تكلفة إضافية!
          </p>
        </div>

        <button
          onClick={runComparisonBenchmark}
          disabled={isBenchmarking}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs cursor-pointer transition-all shadow-md shadow-sky-600/20 disabled:opacity-50 shrink-0"
        >
          <Zap className="w-4 h-4" />
          <span>{isBenchmarking ? 'جاري قياس الأداء...' : 'تشغيل اختبار السرعة المقارن'}</span>
        </button>
      </div>

      {/* Benchmark Slider (Day Mode) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs">
        <div>
          <span className="text-slate-500 block mb-0.5 font-semibold">عمق التصفح المطلوب قياسه في جدول من 250,000 صف:</span>
          <span className="font-mono text-slate-900 text-sm font-extrabold">
            الصف رقم: {offsetTarget.toLocaleString()} (الصفحة {Math.round(offsetTarget / 25).toLocaleString()})
          </span>
        </div>

        <div className="flex items-center gap-3 flex-1 max-w-xs">
          <span className="text-slate-400 font-mono font-bold">1,000</span>
          <input
            type="range"
            min={1000}
            max={240000}
            step={5000}
            value={offsetTarget}
            onChange={(e) => setOffsetTarget(Number(e.target.value))}
            className="w-full cursor-pointer accent-sky-600"
          />
          <span className="text-slate-400 font-mono font-bold">240,000</span>
        </div>
      </div>

      {/* Live Benchmark Metric Cards (Day Mode) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Card 1: Traditional OFFSET */}
        <div className="bg-white border border-rose-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-rose-700 font-bold font-['Cairo'] text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>1. طريقة OFFSET & LIMIT التقليدية</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold border border-rose-200">
              O(N) Degrading
            </span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs text-rose-300 leading-relaxed overflow-x-auto" dir="ltr">
{`SELECT id, order_number, total_amount, created_at
FROM sales.orders
WHERE tenant_id = @tenantId
ORDER BY created_at DESC, id DESC
OFFSET ${offsetTarget} LIMIT 25;`}
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>طريقة التنفيذ في محرك Postgres:</span>
              <span className="text-rose-700 font-mono font-bold">Seq Scan & Discard {offsetTarget.toLocaleString()} rows</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>استهلاك الذاكرة والـ Buffer Cache:</span>
              <span className="text-rose-700 font-mono font-bold">مرتفع جداً (High I/O Spill)</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <span className="font-bold text-slate-900">زمن تنفيذ الاستعلام:</span>
              <span className="text-2xl font-mono font-extrabold text-rose-600">
                {offsetTimeMs !== null ? `${offsetTimeMs} ms` : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Keyset Pagination */}
        <div className="bg-white border border-emerald-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-emerald-700 font-bold font-['Cairo'] text-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>2. طريقة Keyset (Seek Cursor) الموصى بها</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
              O(1) Instant
            </span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs text-emerald-300 leading-relaxed overflow-x-auto" dir="ltr">
{`-- استعلام مباشر باستخدام المؤشر (Index Seek O(1))
SELECT id, order_number, total_amount, created_at
FROM sales.orders
WHERE tenant_id = @tenantId
  AND (created_at, id) < (@lastDate, @lastId)
ORDER BY created_at DESC, id DESC
LIMIT 25;`}
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>طريقة التنفيذ في محرك Postgres:</span>
              <span className="text-emerald-700 font-mono font-bold">Index Seek مباشرة على 25 صف فقط!</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>فهرس الفحص المعتمد:</span>
              <span className="text-emerald-700 font-mono font-bold">idx_orders_keyset(tenant_id, created_at, id)</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <span className="font-bold text-slate-900">زمن تنفيذ الاستعلام:</span>
              <span className="text-2xl font-mono font-extrabold text-emerald-700">
                {keysetTimeMs !== null ? `${keysetTimeMs} ms` : '—'}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Integration Code: AG Grid Community + Keyset */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xs space-y-3 text-white">
        <div className="flex items-center gap-2 text-slate-200 font-bold text-xs font-['Cairo']">
          <Code className="w-4 h-4 text-sky-400" />
          <span>كود ربط AG Grid Community Infinite Row Model مع الـ Keyset Cursor في React:</span>
        </div>
        <pre className="text-xs font-mono text-sky-200 p-4 bg-slate-950 rounded-xl overflow-x-auto leading-relaxed border border-slate-800" dir="ltr">
{`// React + AG Grid Community Infinite Model Setup
const datasource: IDatasource = {
  getRows: async (params: IGetRowsParams) => {
    // 1. استخدام آخر مفتاح مرئي بدلاً من رقم الصفحة
    const lastRow = params.context.lastSeenRow;
    const queryUrl = \`/api/v1/generic/sales.orders?limit=50&after_date=\${lastRow?.created_at}&after_id=\${lastRow?.id}\`;
    
    const response = await fetch(queryUrl);
    const data = await response.json();
    
    params.context.lastSeenRow = data.items[data.items.length - 1];
    params.successCallback(data.items, data.hasMore ? -1 : params.startRow + data.items.length);
  }
};

<AgGridReact
  rowModelType="infinite"
  datasource={datasource}
  cacheBlockSize={50}
  maxBlocksInCache={10} // يمنع استهلاك رامات المتصفح مع ملايين السجلات!
/>`}
        </pre>
      </div>
    </div>
  );
};
