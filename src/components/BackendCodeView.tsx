import React, { useState } from 'react';
import { BACKEND_CODEBASE, API_TEST_PRESETS, BackendFile, ApiTestEndpoint } from '../data/backendCodebase.ts';
import { 
  FileCode, 
  Terminal, 
  Copy, 
  Check, 
  Play, 
  CheckCircle2, 
  ShieldCheck, 
  Layers, 
  Radio, 
  Database, 
  Cpu, 
  Zap, 
  Search 
} from 'lucide-react';

export const BackendCodeView: React.FC = () => {
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [copiedCode, setCopiedCode] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string>('all');
  
  // Interactive API Tester State
  const [selectedEndpointIndex, setSelectedEndpointIndex] = useState(0);
  const [isCallingApi, setIsCallingApi] = useState(false);
  const [apiExecutionResult, setApiExecutionResult] = useState<{
    status: number;
    latencyMs: number;
    response: any;
    sql: string;
    timestamp: string;
  } | null>(null);

  const filteredFiles = BACKEND_CODEBASE.filter((f) => 
    selectedProject === 'all' || f.project === selectedProject
  );

  const activeFile: BackendFile = filteredFiles[selectedFileIndex] || filteredFiles[0] || BACKEND_CODEBASE[0];
  const activeEndpoint: ApiTestEndpoint = API_TEST_PRESETS[selectedEndpointIndex];

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleRunApiTest = () => {
    setIsCallingApi(true);
    setApiExecutionResult(null);

    setTimeout(() => {
      setIsCallingApi(false);
      setApiExecutionResult({
        status: 200,
        latencyMs: Math.round(12 + Math.random() * 8), // Ultra fast 12-20ms with Dapper
        response: activeEndpoint.sampleResponse,
        sql: activeEndpoint.sqlGenerated,
        timestamp: new Date().toLocaleTimeString('ar-EG')
      });
    }, 400);
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Top Banner (Day Mode) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold border border-emerald-200 mb-3">
          <Cpu className="w-3.5 h-3.5" />
          <span>هندسة الـ Backend الفعلية: C# .NET 10 + Minimal APIs + Dapper</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 font-['Cairo'] tracking-tight">
          أكواد الـ Backend للمرحلة 1 ومحاكي الـ Endpoints
        </h1>
        <p className="mt-2 text-xs md:text-sm text-slate-600 max-w-4xl leading-relaxed">
          جميع ملفات الـ C# مصممة بهندسة مصغرة نقية: <strong className="text-emerald-700">أقل من 120 سطر للملف</strong> (بعيداً عن حد الـ 300 سطر)، مع <strong className="text-sky-700">Dapper فائق السرعة</strong>، وفلتر أمان <code className="text-purple-700 font-mono">RequireActionFilter</code> للتحقق من <code className="text-purple-700 font-mono">module.entity.action</code> في كل طلب.
        </p>
      </div>

      {/* Code Browser Section */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <FileCode className="w-5 h-5 text-sky-600" />
            <h2 className="text-lg font-bold text-slate-900 font-['Cairo']">
              مستعرض ملفات الـ C# .NET 10 (Clean Source Code)
            </h2>
          </div>

          {/* Project Filter */}
          <div className="flex items-center gap-1.5 flex-wrap text-xs">
            {['all', 'Generic Data API', 'Auth API', 'Security & Filters', 'Realtime Service', 'Gateway (YARP)'].map((p) => (
              <button
                key={p}
                onClick={() => {
                  setSelectedProject(p);
                  setSelectedFileIndex(0);
                }}
                className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all font-semibold ${
                  selectedProject === p
                    ? 'bg-sky-600 text-white'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {p === 'all' ? 'جميع المشاريع' : p}
              </button>
            ))}
          </div>
        </div>

        {/* File Tabs & Line Count Badges */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs font-mono">
          {filteredFiles.map((f, idx) => (
            <button
              key={f.filename}
              onClick={() => setSelectedFileIndex(idx)}
              className={`px-3 py-2 rounded-xl whitespace-nowrap cursor-pointer transition-all flex items-center gap-2 ${
                activeFile.filename === f.filename
                  ? 'bg-sky-600 text-white font-bold shadow-md shadow-sky-600/20'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>{f.filename}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-sans font-bold ${
                f.lineCount <= 300 ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-rose-100 text-rose-800'
              }`}>
                {f.lineCount} سطر ✓
              </span>
            </button>
          ))}
        </div>

        {/* Code Editor Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden text-white shadow-xs">
          <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-300">
            <div className="flex items-center gap-2">
              <span className="text-sky-300 font-bold">{activeFile.path}</span>
              <span className="text-slate-400 font-sans hidden md:inline">({activeFile.descriptionAr})</span>
            </div>

            <button
              onClick={() => handleCopy(activeFile.csharpCode)}
              className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg transition-all cursor-pointer font-sans border border-slate-700"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'تم النسخ' : 'نسخ كود الـ C#'}</span>
            </button>
          </div>

          <pre className="p-4 text-xs font-mono text-emerald-300 overflow-x-auto max-h-[380px] leading-relaxed no-scrollbar" dir="ltr">
            <code>{activeFile.csharpCode}</code>
          </pre>
        </div>
      </div>

      {/* Interactive Live API Endpoint Simulator */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-slate-900 font-['Cairo']">
              محاكي استدعاء الـ Minimal APIs الحية وتوليد الـ SQL
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-mono font-semibold">
            Zero SQL Injection (Parameterized Dapper)
          </span>
        </div>

        {/* Presets Selector */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {API_TEST_PRESETS.map((preset, idx) => (
            <button
              key={preset.path + preset.method}
              onClick={() => {
                setSelectedEndpointIndex(idx);
                setApiExecutionResult(null);
              }}
              className={`p-3.5 rounded-xl border text-right cursor-pointer transition-all ${
                selectedEndpointIndex === idx
                  ? 'bg-emerald-50 border-emerald-400 text-slate-900 shadow-sm ring-1 ring-emerald-400/30'
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  preset.method === 'GET' ? 'bg-sky-100 text-sky-800 border border-sky-200' :
                  preset.method === 'PUT' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                  'bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}>
                  {preset.method}
                </span>
                <span className="text-[10px] font-mono text-purple-700 font-bold">{preset.actionCode}</span>
              </div>
              <span className="block text-xs font-bold text-slate-900 mt-1">{preset.titleAr}</span>
              <span className="block text-[11px] font-mono text-slate-500 mt-0.5 truncate">{preset.path}</span>
            </button>
          ))}
        </div>

        {/* Trigger Button & Request Preview */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div className="text-xs font-mono">
            <span className="text-slate-500">Endpoint: </span>
            <span className="text-slate-900 font-bold">{activeEndpoint.method} {activeEndpoint.path}</span>
            <span className="text-purple-700 font-semibold block mt-1">Action: {activeEndpoint.actionCode}</span>
          </div>

          <button
            onClick={handleRunApiTest}
            disabled={isCallingApi}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50"
          >
            <Play className="w-4 h-4" />
            <span>{isCallingApi ? 'جاري تنفيذ الاستعلام...' : 'إرسال الطلب وتنفيذ الـ API'}</span>
          </button>
        </div>

        {/* Execution Output (Response + Parameterized SQL) */}
        {apiExecutionResult && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in">
            {/* Generated SQL */}
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-2 text-white">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-400 font-['Cairo'] flex items-center gap-1.5">
                  <Database className="w-4 h-4" />
                  <span>الـ SQL المنفذ في PostgreSQL مع الـ RLS:</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400">Transaction Scope</span>
              </div>
              <pre className="text-xs font-mono text-sky-200 p-3 bg-slate-950 rounded-xl overflow-x-auto leading-relaxed max-h-[180px] no-scrollbar border border-slate-800" dir="ltr">
                {apiExecutionResult.sql}
              </pre>
            </div>

            {/* API JSON Response */}
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-2 text-white">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 font-['Cairo'] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>استجابة الـ API السريعة ({apiExecutionResult.status} OK):</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">
                  {apiExecutionResult.latencyMs} ms ⚡ (أقل من الميزانية)
                </span>
              </div>
              <pre className="text-xs font-mono text-emerald-300 p-3 bg-slate-950 rounded-xl overflow-x-auto leading-relaxed max-h-[180px] no-scrollbar border border-slate-800" dir="ltr">
                {JSON.stringify(apiExecutionResult.response, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
