import React, { useState, useEffect } from 'react';
import { 
  ErpItemRecord, 
  RealtimeEventPayload, 
  TenantContext 
} from '../types.ts';
import { INITIAL_INVENTORY_ITEM } from '../data/mockErpData.ts';
import { 
  RefreshCw, 
  Zap, 
  AlertTriangle, 
  ShieldCheck, 
  ArrowLeftRight, 
  Radio, 
  Database, 
  RotateCcw, 
  Flame, 
  CheckCircle2, 
  Lock, 
  GitMerge, 
  Info 
} from 'lucide-react';

interface LiveSyncSimulatorProps {
  currentTenant: TenantContext;
  pingMs: number;
}

export const LiveSyncSimulator: React.FC<LiveSyncSimulatorProps> = ({
  currentTenant,
  pingMs
}) => {
  // Shared Database State in the Cloud Postgres instance
  const [dbRecord, setDbRecord] = useState<ErpItemRecord>({
    ...INITIAL_INVENTORY_ITEM,
    tenant_id: currentTenant.id
  });

  // Client A State (Operator A - Alexandria Branch)
  const [clientAState, setClientAState] = useState<ErpItemRecord>({ ...dbRecord });
  const [isClientAPending, setIsClientAPending] = useState(false);
  const [clientALatency, setClientALatency] = useState<number | null>(null);
  const [clientAGlow, setClientAGlow] = useState(false);

  // Client B State (Operator B - Cairo Warehouse)
  const [clientBState, setClientBState] = useState<ErpItemRecord>({ ...dbRecord });
  const [isClientBPending, setIsClientBPending] = useState(false);
  const [clientBLatency, setClientBLatency] = useState<number | null>(null);
  const [clientBGlow, setClientBGlow] = useState(false);

  // Conflict state for Operator B
  const [conflictData, setConflictData] = useState<{
    serverRecord: ErpItemRecord;
    attemptedRecord: ErpItemRecord;
  } | null>(null);

  // Event stream log
  const [eventLogs, setEventLogs] = useState<RealtimeEventPayload[]>([]);

  // RLS Demo modal
  const [rlsModalOpen, setRlsModalOpen] = useState(false);
  const [rlsTestResult, setRlsTestResult] = useState<{
    executedSql: string;
    allowedCount: number;
    blockedCount: number;
    tenant: string;
  } | null>(null);

  // Sync DB record change to tenant changes
  useEffect(() => {
    setDbRecord(prev => ({ ...prev, tenant_id: currentTenant.id }));
    setClientAState(prev => ({ ...prev, tenant_id: currentTenant.id }));
    setClientBState(prev => ({ ...prev, tenant_id: currentTenant.id }));
  }, [currentTenant.id]);

  // Client A makes an update
  const handleClientASave = async (newPrice: number, newStock: number) => {
    const startTime = performance.now();
    const currentVer = clientAState.version;

    // 1. Optimistic UI update in 0ms!
    const optimisticRecord: ErpItemRecord = {
      ...clientAState,
      unit_price: newPrice,
      stock_quantity: newStock,
      updated_at: new Date().toISOString(),
      updated_by: 'كاشير الإسكندرية (Operator A)'
    };
    setClientAState(optimisticRecord);
    setIsClientAPending(true);

    // 2. Simulated Network Call to Generic Data API (.NET 10 Minimal API)
    setTimeout(() => {
      // Check Postgres Optimistic Concurrency version in DB
      if (dbRecord.version !== currentVer) {
        // Concurrency collision!
        setIsClientAPending(false);
        setConflictData({
          serverRecord: { ...dbRecord },
          attemptedRecord: optimisticRecord
        });
        return;
      }

      // Success in DB: version = version + 1
      const newVersion = dbRecord.version + 1;
      const committed: ErpItemRecord = {
        ...optimisticRecord,
        version: newVersion
      };

      setDbRecord(committed);
      setClientAState(committed);
      setIsClientAPending(false);
      const elapsed = Math.round(performance.now() - startTime);
      setClientALatency(elapsed);

      // 3. PostgreSQL NOTIFY -> SignalR Broadcast to Client B
      triggerPostgresNotify(committed, 'Operator A (الإسكندرية)', {
        unit_price: { old: dbRecord.unit_price, new: newPrice },
        stock_quantity: { old: dbRecord.stock_quantity, new: newStock }
      });

      // Client B receives push!
      setClientBState(committed);
      setClientBGlow(true);
      setTimeout(() => setClientBGlow(false), 2000);
    }, pingMs);
  };

  // Client B makes an update
  const handleClientBSave = async (newPrice: number, newStock: number) => {
    const startTime = performance.now();
    const currentVer = clientBState.version;

    const optimisticRecord: ErpItemRecord = {
      ...clientBState,
      unit_price: newPrice,
      stock_quantity: newStock,
      updated_at: new Date().toISOString(),
      updated_by: 'مدير مخزن القاهرة (Operator B)'
    };
    setClientBState(optimisticRecord);
    setIsClientBPending(true);

    setTimeout(() => {
      if (dbRecord.version !== currentVer) {
        // Concurrency collision!
        setIsClientBPending(false);
        setConflictData({
          serverRecord: { ...dbRecord },
          attemptedRecord: optimisticRecord
        });
        return;
      }

      const newVersion = dbRecord.version + 1;
      const committed: ErpItemRecord = {
        ...optimisticRecord,
        version: newVersion
      };

      setDbRecord(committed);
      setClientBState(committed);
      setIsClientBPending(false);
      const elapsed = Math.round(performance.now() - startTime);
      setClientBLatency(elapsed);

      // Broadcast to Client A
      triggerPostgresNotify(committed, 'Operator B (القاهرة)', {
        unit_price: { old: dbRecord.unit_price, new: newPrice },
        stock_quantity: { old: dbRecord.stock_quantity, new: newStock }
      });

      setClientAState(committed);
      setClientAGlow(true);
      setTimeout(() => setClientAGlow(false), 2000);
    }, pingMs);
  };

  // Simulating Concurrent Race Condition (Collision)
  const triggerRaceCondition = () => {
    // Both operators start modifying based on the exact current version
    const baseVersion = dbRecord.version;

    // Operator A saves Price = 600
    const opARecord: ErpItemRecord = {
      ...dbRecord,
      unit_price: 600,
      stock_quantity: dbRecord.stock_quantity - 5,
      version: baseVersion,
      updated_by: 'كاشير الإسكندرية (Operator A)'
    };

    // Operator B saves Price = 750 concurrently
    const opBRecord: ErpItemRecord = {
      ...dbRecord,
      unit_price: 750,
      stock_quantity: dbRecord.stock_quantity + 20,
      version: baseVersion,
      updated_by: 'مدير القاهرة (Operator B)'
    };

    // A commits first (version increments)
    const committedA: ErpItemRecord = {
      ...opARecord,
      version: baseVersion + 1,
      updated_at: new Date().toISOString()
    };

    setDbRecord(committedA);
    setClientAState(committedA);
    setClientAGlow(true);
    setTimeout(() => setClientAGlow(false), 1500);

    triggerPostgresNotify(committedA, 'Operator A (سبق بالتنفيذ)', {
      unit_price: { old: dbRecord.unit_price, new: 600 }
    });

    // B arrives 30ms later with old version (baseVersion), but DB is now baseVersion + 1!
    setTimeout(() => {
      setConflictData({
        serverRecord: committedA,
        attemptedRecord: opBRecord
      });
    }, 150);
  };

  const triggerPostgresNotify = (record: ErpItemRecord, author: string, changes: any) => {
    const event: RealtimeEventPayload = {
      id: `evt-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toLocaleTimeString('ar-EG'),
      table: 'inventory.items',
      record_id: record.id,
      version: record.version,
      client_id: author,
      author,
      changes,
      channel: `tenant:${record.tenant_id}`
    };

    setEventLogs(prev => [event, ...prev.slice(0, 19)]);
  };

  // Run RLS Isolation Test
  const runRlsTest = () => {
    const executedSql = `
BEGIN TRANSACTION;
-- 1. حقن معرف الـ Tenant داخل الجلسة المعزولة
SELECT set_config('app.current_tenant_id', '${currentTenant.id}', true);

-- 2. استعلام البيانات عبر سياسة RLS الصارمة
SELECT id, sku, name_ar, stock_quantity, tenant_id 
FROM inventory.items;

-- 3. المحاولة غير المصرح بها لقراءة سجلات المنشآت الأخرى
SELECT COUNT(*) FROM inventory.items 
WHERE tenant_id != current_setting('app.current_tenant_id', true);
COMMIT;
    `.trim();

    setRlsTestResult({
      executedSql,
      allowedCount: 145,
      blockedCount: 1820,
      tenant: currentTenant.nameAr
    });
    setRlsModalOpen(true);
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header Banner (Day Mode) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 font-mono text-xs font-bold border border-sky-200">
              معيار إنجاز المرحلة 1
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 font-['Cairo']">
              المحاكي اللحظي المزدوج (Dual-Operator Live Sync & RLS)
            </h2>
          </div>
          <p className="text-xs text-slate-600">
            تعديل نفس السجل من شاشتين مستقلتين مع قياس سرعة الـ Round-trip، واختبار تعارض الـ Version، والتأكد من عزل RLS.
          </p>
        </div>

        {/* Global Action Triggers */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={triggerRaceCondition}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 text-xs font-bold transition-all cursor-pointer shadow-2xs"
          >
            <Flame className="w-4 h-4 text-rose-600" />
            <span>محاكاة تعارض متزامن (Race Condition)</span>
          </button>

          <button
            onClick={runRlsTest}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 text-xs font-bold transition-all cursor-pointer shadow-2xs"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>اختبار عزل RLS بالـ Postgres</span>
          </button>
        </div>
      </div>

      {/* Database Shared State Badge */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-600" />
          <span className="text-slate-600 font-semibold">حالة قاعدة بيانات PostgreSQL السحابية (Source of Truth):</span>
          <span className="font-mono text-slate-900 font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            inventory.items (ID: {dbRecord.id})
          </span>
        </div>
        <div className="flex items-center gap-4 font-mono text-[11px]">
          <div>
            <span className="text-slate-500 ml-1">السعر الحالي:</span>
            <span className="text-emerald-700 font-extrabold">{dbRecord.unit_price} ج.م</span>
          </div>
          <div>
            <span className="text-slate-500 ml-1">المخزون:</span>
            <span className="text-sky-700 font-extrabold">{dbRecord.stock_quantity} وحدة</span>
          </div>
          <div>
            <span className="text-slate-500 ml-1">إصدار السجل (version):</span>
            <span className="text-purple-800 font-bold bg-purple-100 px-2 py-0.5 rounded border border-purple-200">
              v{dbRecord.version}
            </span>
          </div>
          <div>
            <span className="text-slate-500 ml-1">آخر تحديث بواسطة:</span>
            <span className="text-slate-700 font-semibold">{dbRecord.updated_by}</span>
          </div>
        </div>
      </div>

      {/* Dual Screens: Operator A vs Operator B */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Screen 1: Operator A (Alexandria Branch) */}
        <div className={`bg-white border rounded-2xl p-5 shadow-xs transition-all duration-500 ${
          clientAGlow ? 'border-emerald-500 ring-2 ring-emerald-400/30' : 'border-slate-200/90'
        }`}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse" />
              <h3 className="font-bold text-slate-900 text-sm font-['Cairo']">
                شاشة 1: كاشير فرع الإسكندرية (Operator A)
              </h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-100 text-sky-800 border border-sky-200 font-bold">
              Client Version: v{clientAState.version}
            </span>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <span className="text-slate-500 block mb-1">اسم الصنف:</span>
              <span className="font-bold text-slate-900 text-sm">{clientAState.name_ar}</span>
              <span className="block text-[11px] text-slate-400 font-mono">{clientAState.sku}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">سعر البيع (ج.م):</label>
                <input
                  type="number"
                  value={clientAState.unit_price}
                  onChange={(e) => setClientAState({ ...clientAState, unit_price: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold focus:border-sky-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">رصيد المخزون (وحدة):</label>
                <input
                  type="number"
                  value={clientAState.stock_quantity}
                  onChange={(e) => setClientAState({ ...clientAState, stock_quantity: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold focus:border-sky-500 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            {/* Save Buttons & Telemetry */}
            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                onClick={() => handleClientASave(clientAState.unit_price, clientAState.stock_quantity)}
                disabled={isClientAPending}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-all cursor-pointer shadow-md shadow-sky-600/20 disabled:opacity-50"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{isClientAPending ? 'جاري الحفظ اللحظي...' : 'حفظ فوري (Optimistic UI - 0ms)'}</span>
              </button>

              <button
                onClick={() => handleClientASave(clientAState.unit_price + 25, clientAState.stock_quantity)}
                className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-mono font-bold cursor-pointer transition-all border border-slate-200"
                title="زيادة السعر 25 ج.م فوراً"
              >
                +25 EGP
              </button>
            </div>

            {clientALatency !== null && (
              <div className="bg-sky-50 border border-sky-200 rounded-xl p-2.5 flex items-center justify-between text-[11px] text-sky-800 font-mono">
                <span>زمن الاستجابة للشبكة (Round-trip):</span>
                <span className="font-bold text-emerald-700">{clientALatency} ms (أقل من ميزانية الـ 200ms)</span>
              </div>
            )}
          </div>
        </div>

        {/* Screen 2: Operator B (Cairo Warehouse) */}
        <div className={`bg-white border rounded-2xl p-5 shadow-xs transition-all duration-500 ${
          clientBGlow ? 'border-emerald-500 ring-2 ring-emerald-400/30' : 'border-slate-200/90'
        }`}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="font-bold text-slate-900 text-sm font-['Cairo']">
                شاشة 2: مدير مخزن القاهرة (Operator B)
              </h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold">
              Client Version: v{clientBState.version}
            </span>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <span className="text-slate-500 block mb-1">اسم الصنف:</span>
              <span className="font-bold text-slate-900 text-sm">{clientBState.name_ar}</span>
              <span className="block text-[11px] text-slate-400 font-mono">{clientBState.sku}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">سعر البيع (ج.م):</label>
                <input
                  type="number"
                  value={clientBState.unit_price}
                  onChange={(e) => setClientBState({ ...clientBState, unit_price: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold focus:border-emerald-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">رصيد المخزون (وحدة):</label>
                <input
                  type="number"
                  value={clientBState.stock_quantity}
                  onChange={(e) => setClientBState({ ...clientBState, stock_quantity: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold focus:border-emerald-500 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            {/* Save Buttons & Telemetry */}
            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                onClick={() => handleClientBSave(clientBState.unit_price, clientBState.stock_quantity)}
                disabled={isClientBPending}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all cursor-pointer shadow-md shadow-emerald-600/20 disabled:opacity-50"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{isClientBPending ? 'جاري الحفظ اللحظي...' : 'حفظ فوري (Optimistic UI - 0ms)'}</span>
              </button>

              <button
                onClick={() => handleClientBSave(clientBState.unit_price, clientBState.stock_quantity - 10)}
                className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-mono font-bold cursor-pointer transition-all border border-slate-200"
                title="صرف 10 وحدات فوراً"
              >
                -10 Stock
              </button>
            </div>

            {clientBLatency !== null && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 flex items-center justify-between text-[11px] text-emerald-800 font-mono">
                <span>زمن الاستجابة للشبكة (Round-trip):</span>
                <span className="font-bold text-emerald-700">{clientBLatency} ms (استجابة ممتازة)</span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Visual Conflict Resolution Dialog */}
      {conflictData && (
        <div className="bg-rose-50 border border-rose-300 rounded-2xl p-5 shadow-xl space-y-4 animate-in fade-in zoom-in duration-200">
          <div className="flex items-center gap-2 text-rose-900 font-bold font-['Cairo'] text-sm">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>تم اكتشاف تعارض في إصدار السجل (409 DbConcurrencyException Detected!)</span>
          </div>

          <p className="text-xs text-slate-700 leading-relaxed">
            تم رفض العملية لأن السجل تم تعديله من مشغل آخر بالتزامن! الإصدار المتوقع من العميل كان 
            <span className="font-mono font-bold text-amber-700 mx-1">v{conflictData.attemptedRecord.version}</span>
            بينما السيرفر يحتوي على الإصدار الأحدث
            <span className="font-mono font-bold text-emerald-700 mx-1">v{conflictData.serverRecord.version}</span>.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono bg-white p-4 rounded-xl border border-slate-200">
            <div className="space-y-1">
              <span className="text-emerald-700 font-bold block mb-1">
                ✓ بيانات السيرفر الحالية (v{conflictData.serverRecord.version}):
              </span>
              <p>السعر: <strong className="text-slate-900">{conflictData.serverRecord.unit_price} ج.م</strong></p>
              <p>المخزون: <strong className="text-slate-900">{conflictData.serverRecord.stock_quantity} وحدة</strong></p>
              <p className="text-[11px] text-slate-500">آخر تعديل: {conflictData.serverRecord.updated_by}</p>
            </div>

            <div className="space-y-1 border-r md:border-r-0 md:border-l border-slate-200 pr-0 md:pr-4">
              <span className="text-rose-700 font-bold block mb-1">
                ✕ تعديلك الذي تعارض (محاولة على v{conflictData.attemptedRecord.version}):
              </span>
              <p>السعر المقترح: <strong className="text-slate-900">{conflictData.attemptedRecord.unit_price} ج.م</strong></p>
              <p>المخزون المقترح: <strong className="text-slate-900">{conflictData.attemptedRecord.stock_quantity} وحدة</strong></p>
              <p className="text-[11px] text-slate-500">بواسطة: {conflictData.attemptedRecord.updated_by}</p>
            </div>
          </div>

          {/* Conflict Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => {
                setClientBState(conflictData.serverRecord);
                setConflictData(null);
              }}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer transition-all shadow-md shadow-emerald-600/20"
            >
              1. قبول بيانات السيرفر (Server Wins / Reload)
            </button>

            <button
              onClick={() => {
                const forced: ErpItemRecord = {
                  ...conflictData.attemptedRecord,
                  version: conflictData.serverRecord.version + 1,
                  updated_at: new Date().toISOString()
                };
                setDbRecord(forced);
                setClientBState(forced);
                setClientAState(forced);
                triggerPostgresNotify(forced, 'Operator B (إعادة تطبيق بالقوة)', { unit_price: { old: conflictData.serverRecord.unit_price, new: forced.unit_price } });
                setConflictData(null);
              }}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs cursor-pointer transition-all shadow-md shadow-amber-600/20"
            >
              2. إعادة تطبيق تعديلاتي بالقوة (Overwrite with v{conflictData.serverRecord.version + 1})
            </button>

            <button
              onClick={() => {
                const merged: ErpItemRecord = {
                  ...conflictData.serverRecord,
                  stock_quantity: conflictData.attemptedRecord.stock_quantity,
                  version: conflictData.serverRecord.version + 1,
                  updated_at: new Date().toISOString(),
                  updated_by: 'دمج ذكي (Smart Field Merge)'
                };
                setDbRecord(merged);
                setClientAState(merged);
                setClientBState(merged);
                triggerPostgresNotify(merged, 'النظام (دمج تلقائي للحقول)', {});
                setConflictData(null);
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer transition-all flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
            >
              <GitMerge className="w-3.5 h-3.5" />
              <span>3. دمج ذكي للحقول (Smart 3-Way Merge)</span>
            </button>
          </div>
        </div>
      )}

      {/* Realtime Event Stream Stream Log */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
            <h3 className="font-bold text-slate-900 text-sm font-['Cairo']">
              شريط أحداث البث المباشر (PostgreSQL NOTIFY ➔ SignalR Hub Stream)
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            Channel: <strong className="text-sky-700">tenant:{currentTenant.id}</strong>
          </span>
        </div>

        {eventLogs.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            قم بتعديل السعر أو المخزون في أي شاشة أعلاه لمشاهدة رسائل الـ NOTIFY الحية تتدفق هنا فوراً!
          </div>
        ) : (
          <div className="space-y-2 max-h-[220px] overflow-y-auto no-scrollbar font-mono text-xs" dir="ltr">
            {eventLogs.map((evt) => (
              <div key={evt.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                    NOTIFY
                  </span>
                  <span className="text-slate-500 text-[11px]">{evt.timestamp}</span>
                  <span className="text-slate-900 font-bold">{evt.table}</span>
                  <span className="text-sky-700 font-bold">id={evt.record_id}</span>
                  <span className="text-purple-700 font-bold">v{evt.version}</span>
                </div>
                <div className="text-slate-500 text-[11px] truncate max-w-xs">
                  by: <strong className="text-slate-800">{evt.author}</strong>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RLS Modal */}
      {rlsModalOpen && rlsTestResult && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 font-['Cairo'] text-base">
                  تقرير فحص أمان قاعدة البيانات (PostgreSQL RLS Verification)
                </h3>
              </div>
              <button
                onClick={() => setRlsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5">
                <span className="text-xs text-slate-600 block mb-1">الصفوف المسموح بها لمنشأة ({rlsTestResult.tenant})</span>
                <span className="text-2xl font-bold font-mono text-emerald-700">{rlsTestResult.allowedCount} صف</span>
                <span className="block text-[10px] text-emerald-800 mt-1 font-semibold">مطابقة لمعرف tenant_id المحدد</span>
              </div>
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5">
                <span className="text-xs text-slate-600 block mb-1">الصفوف المحجوبة والمعزولة تماماً</span>
                <span className="text-2xl font-bold font-mono text-rose-700">{rlsTestResult.blockedCount} صف</span>
                <span className="block text-[10px] text-rose-800 mt-1 font-semibold">حجب على مستوى النواة (Row-Level Security)</span>
              </div>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1 font-mono">الكود المنفذ في الـ Transaction:</span>
              <pre className="text-xs font-mono text-sky-300 whitespace-pre-wrap leading-relaxed" dir="ltr">
                {rlsTestResult.executedSql}
              </pre>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setRlsModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
              >
                إغلاق التقرير
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
