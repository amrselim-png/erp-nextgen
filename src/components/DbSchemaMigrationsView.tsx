import React, { useState } from 'react';
import { SQL_MIGRATION_SCRIPTS, ALL_DATABASE_TABLES } from '../data/databaseMigrations.ts';
import { 
  Database, 
  FileCode, 
  Play, 
  CheckCircle2, 
  ShieldCheck, 
  Copy, 
  Check, 
  Search, 
  Layers, 
  Key, 
  Lock, 
  Split, 
  Radio, 
  Sparkles, 
  Terminal, 
  ExternalLink 
} from 'lucide-react';

export const DbSchemaMigrationsView: React.FC = () => {
  const [selectedMigrationIndex, setSelectedMigrationIndex] = useState(0);
  const [copiedSql, setCopiedSql] = useState(false);
  const [isSimulatingDbUp, setIsSimulatingDbUp] = useState(false);
  const [dbUpLogs, setDbUpLogs] = useState<string[]>([]);
  
  // Data Dictionary State
  const [selectedSchema, setSelectedSchema] = useState<string>('all');
  const [tableSearchQuery, setTableSearchQuery] = useState('');
  const [selectedTableIndex, setSelectedTableIndex] = useState(0);

  const activeMigration = SQL_MIGRATION_SCRIPTS[selectedMigrationIndex];

  // Filtered tables
  const filteredTables = ALL_DATABASE_TABLES.filter((t) => {
    const matchesSchema = selectedSchema === 'all' || t.schema === selectedSchema;
    const matchesSearch = t.tableName.toLowerCase().includes(tableSearchQuery.toLowerCase()) ||
                          t.displayNameAr.toLowerCase().includes(tableSearchQuery.toLowerCase());
    return matchesSchema && matchesSearch;
  });

  const activeTable = filteredTables[selectedTableIndex] || filteredTables[0] || ALL_DATABASE_TABLES[0];

  const handleCopySql = (sql: string) => {
    navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  // Simulate DbUp Migration Execution in CI/CD Job
  const runDbUpSimulation = async () => {
    setIsSimulatingDbUp(true);
    setDbUpLogs([]);
    const logs: string[] = [];

    logs.push(`[${new Date().toLocaleTimeString('ar-EG')}] بدء تشغيل DbUp Migration Runner كـ Job منفصل في GitHub Actions...`);
    logs.push(`[${new Date().toLocaleTimeString('ar-EG')}] تم الاتصال بقاعدة البيانات كمستخدم ذو صلاحية تثبيت: "erp_owner".`);
    setDbUpLogs([...logs]);

    for (let i = 0; i < SQL_MIGRATION_SCRIPTS.length; i++) {
      await new Promise(r => setTimeout(r, 350));
      const script = SQL_MIGRATION_SCRIPTS[i];
      logs.push(`[${new Date().toLocaleTimeString('ar-EG')}] تنفيذ: ${script.filename} - ${script.titleAr}... تم بنجاح ✓`);
      setDbUpLogs([...logs]);
    }

    await new Promise(r => setTimeout(r, 400));
    logs.push(`[${new Date().toLocaleTimeString('ar-EG')}] تم تطبيق 7 سكربتات بنجاح. التحقق من سياسات RLS الإجبارية (FORCE ROW LEVEL SECURITY)... تم بنجاح ✓`);
    logs.push(`[${new Date().toLocaleTimeString('ar-EG')}] النظام جاهز لاستقبال اتصالات دور التطبيق: "erp_app" المحمي بالـ RLS!`);
    setDbUpLogs([...logs]);
    setIsSimulatingDbUp(false);
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Top Banner (Day Mode) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-semibold border border-sky-200 mb-3">
          <Database className="w-3.5 h-3.5" />
          <span>مرحلة الأساس 1: هيكل قاعدة البيانات وسكربتات الـ Migrations الفعلية</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 font-['Cairo'] tracking-tight">
          سكربتات الـ SQL كاملة وقاموس الجداول (DbUp & Data Dictionary)
        </h1>
        <p className="mt-2 text-xs md:text-sm text-slate-600 max-w-4xl leading-relaxed">
          الداتابيز تُنشأ بـ SQL Migrations مرقمة ومنفذة عبر <strong className="text-sky-700">DbUp كـ Job في الـ CI/CD</strong> بمستخدم <strong className="text-amber-700">erp_owner</strong>، مع تطبيق الأعمدة القياسية (STD)، وسياسات <strong className="text-emerald-700">FORCE ROW LEVEL SECURITY</strong>، وسجل الأفعال المركزي <code className="text-purple-700 font-mono">module.entity.action</code>.
        </p>
      </div>

      {/* Security Roles & Architecture Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-amber-700 font-['Cairo']">1. دور erp_owner</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold border border-amber-200">
              CI/CD Only
            </span>
          </div>
          <p className="text-slate-600 leading-relaxed text-[11px]">
            المستخدم الوحيد المخول بإنشاء الجداول وتشغيل سكربتات الـ DbUp. التطبيق نفسه في وقت التشغيل <strong>لا يملك</strong> كلمة مرور هذا الدور مطلقاً!
          </p>
        </div>

        <div className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sky-700 font-['Cairo']">2. دور erp_app</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-bold border border-sky-200">
              Web API Runtime
            </span>
          </div>
          <p className="text-slate-600 leading-relaxed text-[11px]">
            دور التطبيق (.NET 10 Minimal APIs). صلاحياته محكومة بـ <strong className="text-slate-900">NOBYPASSRLS</strong> ومقيد بحقن <code className="font-mono text-sky-700 font-bold">app.tenant_id</code> في كل Transaction.
          </p>
        </div>

        <div className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-purple-700 font-['Cairo']">3. دور erp_readonly</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold border border-purple-200">
              Power BI & Analytics
            </span>
          </div>
          <p className="text-slate-600 leading-relaxed text-[11px]">
            مخصص للتقارير الثقيلة والـ BI، يقرأ من الـ Materialized Views ونسخ القراءة (Read Replicas) دون التأثير على معامَلات البيع والـ POS.
          </p>
        </div>
      </div>

      {/* SQL Migration Script Browser */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <FileCode className="w-5 h-5 text-sky-600" />
            <h2 className="text-lg font-bold text-slate-900 font-['Cairo']">
              سكربتات الـ SQL للمرحلة 1 (Phase 1 Migration Scripts)
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={runDbUpSimulation}
              disabled={isSimulatingDbUp}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{isSimulatingDbUp ? 'جاري محاكاة DbUp...' : 'محاكاة تشغيل الـ Migrations (DbUp)'}</span>
            </button>
          </div>
        </div>

        {/* DbUp Live Terminal Simulation Output */}
        {dbUpLogs.length > 0 && (
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs space-y-1.5 max-h-[160px] overflow-y-auto no-scrollbar" dir="ltr">
            {dbUpLogs.map((log, idx) => (
              <div key={idx} className="text-emerald-400">
                {log}
              </div>
            ))}
          </div>
        )}

        {/* Script Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs font-mono">
          {SQL_MIGRATION_SCRIPTS.map((script, idx) => (
            <button
              key={script.version}
              onClick={() => setSelectedMigrationIndex(idx)}
              className={`px-3 py-2 rounded-xl whitespace-nowrap cursor-pointer transition-all flex items-center gap-1.5 ${
                selectedMigrationIndex === idx
                  ? 'bg-sky-600 text-white font-bold shadow-md shadow-sky-600/20'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span className="font-bold text-sky-700">#{script.version}</span>
              <span className="truncate max-w-[200px] font-sans">{script.titleAr}</span>
            </button>
          ))}
        </div>

        {/* Active Script Details & Code Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden text-white shadow-xs">
          <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-300">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[11px] font-bold">
                {activeMigration.filename}
              </span>
              <span className="text-slate-400 font-sans">{activeMigration.descriptionAr}</span>
            </div>

            <button
              onClick={() => handleCopySql(activeMigration.sqlContent)}
              className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg transition-all cursor-pointer font-sans border border-slate-700"
            >
              {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSql ? 'تم النسخ' : 'نسخ سكربت الـ SQL'}</span>
            </button>
          </div>

          <pre className="p-4 text-xs font-mono text-sky-200 overflow-x-auto max-h-[380px] leading-relaxed no-scrollbar" dir="ltr">
            <code>{activeMigration.sqlContent}</code>
          </pre>
        </div>
      </div>

      {/* Interactive Data Dictionary (قاموس الجداول الشامل) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-slate-900 font-['Cairo']">
              قاموس جداول الداتابيز ومواصفات الأعمدة (Database Data Dictionary)
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-mono font-semibold">
            {ALL_DATABASE_TABLES.length} جداول قياسية معرفة في المنظومة
          </span>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Schema Selector */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-slate-500 font-semibold ml-1">الـ Schema:</span>
            {['all', 'core', 'inventory', 'sales', 'accounting'].map((sc) => (
              <button
                key={sc}
                onClick={() => {
                  setSelectedSchema(sc);
                  setSelectedTableIndex(0);
                }}
                className={`px-3 py-1 rounded-lg cursor-pointer transition-all font-mono font-bold ${
                  selectedSchema === sc
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {sc === 'all' ? 'الكل' : `${sc}.*`}
              </button>
            ))}
          </div>

          {/* Search Table */}
          <div className="relative max-w-xs w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
            <input
              type="text"
              placeholder="بحث في اسم الجدول أو الوصف..."
              value={tableSearchQuery}
              onChange={(e) => {
                setTableSearchQuery(e.target.value);
                setSelectedTableIndex(0);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-8 pl-3 py-1.5 text-slate-900 text-xs focus:outline-none focus:bg-white focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Tables Grid & Active Table Detail */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* Table List Column */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-1.5 max-h-[460px] overflow-y-auto no-scrollbar">
            {filteredTables.map((tbl, idx) => (
              <button
                key={`${tbl.schema}.${tbl.tableName}`}
                onClick={() => setSelectedTableIndex(idx)}
                className={`w-full text-right p-3 rounded-xl border transition-all cursor-pointer block ${
                  activeTable.tableName === tbl.tableName && activeTable.schema === tbl.schema
                    ? 'bg-white border-emerald-500 text-slate-900 shadow-sm ring-1 ring-emerald-500/30'
                    : 'bg-white/70 border-slate-200/90 hover:bg-white text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono font-bold text-xs text-sky-700">
                    {tbl.schema}.{tbl.tableName}
                  </span>
                  {tbl.hasRls && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 font-mono font-bold">
                      RLS
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-600 truncate font-semibold">
                  {tbl.displayNameAr}
                </div>
              </button>
            ))}
          </div>

          {/* Table Columns and Metadata Column */}
          <div className="lg:col-span-2 bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-bold text-slate-900">
                    {activeTable.schema}.{activeTable.tableName}
                  </span>
                  <span className="text-xs text-emerald-700 font-bold font-['Cairo']">
                    ({activeTable.displayNameAr})
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">{activeTable.descriptionAr}</p>
              </div>

              {/* Badges */}
              <div className="flex items-center gap-2 flex-wrap text-[11px] font-mono">
                {activeTable.hasRls && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>FORCE RLS</span>
                  </span>
                )}
                {activeTable.hasStdColumns && (
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200 font-bold">
                    STD Columns
                  </span>
                )}
                {activeTable.isPartitioned && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 font-bold flex items-center gap-1">
                    <Split className="w-3 h-3 text-amber-600" />
                    <span>{activeTable.partitionStrategy}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Triggers Attached */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-600 font-semibold">الـ Triggers المفعلة:</span>
              {activeTable.triggers.length > 0 ? (
                activeTable.triggers.map((trg) => (
                  <span key={trg} className="px-2 py-0.5 rounded bg-white text-sky-700 border border-slate-200 font-mono text-[11px] font-bold">
                    {trg}
                  </span>
                ))
              ) : (
                <span className="text-slate-400 font-mono text-[11px]">لا يوجد (Non-tenant / Master Table)</span>
              )}
            </div>

            {/* Columns Table */}
            <div className="overflow-x-auto no-scrollbar border border-slate-200 rounded-xl bg-white">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-100 text-slate-600 font-['Cairo'] border-b border-slate-200">
                  <tr>
                    <th className="p-3">اسم العمود (Column)</th>
                    <th className="p-3">النوع (Type)</th>
                    <th className="p-3 text-center">الخصائص</th>
                    <th className="p-3">الوصف والغرض</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px] text-slate-800">
                  {activeTable.columns.map((col) => (
                    <tr key={col.name} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-bold text-slate-900">
                        {col.name}
                        {col.isStd && <span className="text-[9px] text-purple-700 ml-1 font-sans font-bold">(STD)</span>}
                      </td>
                      <td className="p-3 text-sky-700 font-bold">{col.type}</td>
                      <td className="p-3 text-center space-x-1">
                        {col.isPk && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-bold">
                            PK
                          </span>
                        )}
                        {col.isFk && (
                          <span className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 border border-indigo-300 text-[10px] font-bold">
                            FK
                          </span>
                        )}
                        {!col.nullable && !col.isPk && (
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">
                            NOT NULL
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-slate-600 font-sans">{col.descriptionAr}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
