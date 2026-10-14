import React, { useState } from 'react';
import { CODE_SNIPPETS } from '../data/mockErpData.ts';
import { 
  Network, 
  Database, 
  Server, 
  Globe, 
  Zap, 
  ShieldCheck, 
  Check, 
  Copy, 
  Cpu, 
  FileCode, 
  Radio, 
  AlertCircle 
} from 'lucide-react';

export const ArchitectureView: React.FC = () => {
  const [selectedSnippet, setSelectedSnippet] = useState<'genericApi' | 'postgresRls' | 'signalR' | 'yarp'>('genericApi');
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getActiveCode = () => {
    switch (selectedSnippet) {
      case 'genericApi': return CODE_SNIPPETS.dotnetGenericApi;
      case 'postgresRls': return CODE_SNIPPETS.postgresRls;
      case 'signalR': return CODE_SNIPPETS.signalRNotifier;
      case 'yarp': return `// appsettings.json: YARP Reverse Proxy Configuration
{
  "ReverseProxy": {
    "Routes": {
      "auth-route": {
        "ClusterId": "auth-cluster",
        "Match": { "Path": "/api/v1/auth/{**catch-all}" }
      },
      "generic-data-route": {
        "ClusterId": "generic-data-cluster",
        "Match": { "Path": "/api/v1/generic/{**catch-all}" },
        "RateLimiterPolicy": "fixed-window-tenant"
      },
      "module-apis-route": {
        "ClusterId": "modules-cluster",
        "Match": { "Path": "/api/v1/modules/{**catch-all}" }
      },
      "signalr-hub-route": {
        "ClusterId": "realtime-cluster",
        "Match": { "Path": "/hubs/realtime/{**catch-all}" }
      }
    },
    "Clusters": {
      "generic-data-cluster": {
        "Destinations": {
          "primary": { "Address": "http://erp-generic-api:5001" }
        }
      },
      "realtime-cluster": {
        "Destinations": {
          "primary": { "Address": "http://erp-realtime-hub:5002" }
        }
      }
    }
  }
}`;
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Hero Banner (Day Mode) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold border border-emerald-200 mb-3">
              <Zap className="w-3.5 h-3.5" />
              <span>المعمارية المعتمدة للمنظومة الجديدة (Clean Micro-Engine Architecture)</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 font-['Cairo'] tracking-tight">
              معمارية الـ YARP + .NET 10 + Postgres RLS + SignalR
            </h1>
            <p className="mt-2 text-xs md:text-sm text-slate-600 max-w-3xl leading-relaxed">
              تصميم هندسي متين لتفادي عيوب المنصة السابقة: 
              <strong className="text-sky-700"> إلغاء كتابة الشاشات اليدوية</strong> عبر الـ Metadata Engine، 
              <strong className="text-emerald-700"> سرعة زر استثنائية (Optimistic UI)</strong> بدون هنج، 
              <strong className="text-amber-700"> وعزل تام (RLS + Tenant ID)</strong> مع مزامنة لحظية حقيقية ثنائية الاتجاه دون اتصال المتصفح المباشر بقاعدة البيانات.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-3 shrink-0">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
              <span className="block text-[11px] text-slate-500 font-medium">المستخدمين المتزامنين</span>
              <span className="text-lg font-bold text-sky-700 font-mono">&lt; 100 يوزر</span>
              <span className="block text-[10px] text-emerald-700 font-semibold">بدون Scale-to-Zero</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
              <span className="block text-[11px] text-slate-500 font-medium">ميزانية السرعة (Budget)</span>
              <span className="text-lg font-bold text-emerald-700 font-mono">&lt; 200 ms</span>
              <span className="block text-[10px] text-slate-500">Endpoint واحد لكل شاشة</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
              <span className="block text-[11px] text-slate-500 font-medium">حد حجم الملف في الـ CI</span>
              <span className="text-lg font-bold text-amber-700 font-mono">&lt; 300 سطر</span>
              <span className="block text-[10px] text-rose-700 font-semibold">ممنوع الملفات الضخمة</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
              <span className="block text-[11px] text-slate-500 font-medium">الصلاحيات المسبقة</span>
              <span className="text-lg font-bold text-purple-700 font-mono">Default Deny</span>
              <span className="block text-[10px] text-purple-700 font-semibold">Action Registry آلي</span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Architecture Topology Diagram */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Network className="w-5 h-5 text-sky-600" />
            <h2 className="text-lg font-bold text-slate-900 font-['Cairo']">
              مخطط تدفق البيانات الحي (Data Flow Topology)
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-mono font-semibold">
            HTTPS / WSS / TLS 1.3
          </span>
        </div>

        {/* Diagram Blocks */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-stretch">
          
          {/* Level 1: Client Layer */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between hover:border-sky-400 transition-all group">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2 py-0.5 rounded text-[10px] bg-sky-100 text-sky-800 border border-sky-200 font-mono font-bold">
                  LAYER 1: CLIENT
                </span>
                <Globe className="w-4 h-4 text-sky-600" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1 font-['Cairo']">
                React 19 SPA (Vite + Tailwind)
              </h3>
              <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                واجهة أحادية متجاوبة عالية السرعة، لا تتصل بالداتابيز أبداً.
              </p>
              <ul className="text-xs space-y-1.5 text-slate-700">
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span><strong>AG Grid Community</strong> (Keyset Pagination)</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span><strong>TanStack Query</strong> (كاش وتحديث تلقائي)</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span><strong>Optimistic UI</strong> (تحديث فوري للزر)</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span><strong>SignalR Client</strong> (استقبال الـ Events)</span>
                </li>
              </ul>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-sky-700 font-mono font-semibold">
              JWT Bearer + HttpOnly Refresh Cookie
            </div>
          </div>

          {/* Level 2: Gateway */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between hover:border-indigo-400 transition-all group">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-100 text-indigo-800 border border-indigo-200 font-mono font-bold">
                  LAYER 2: GATEWAY
                </span>
                <Server className="w-4 h-4 text-indigo-600" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1 font-['Cairo']">
                YARP Reverse Proxy (.NET 10)
              </h3>
              <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                بوابة موحدة فائقة السرعة تتولى الفلترة والتوجيه وحماية الـ Rate Limiting.
              </p>
              <ul className="text-xs space-y-1.5 text-slate-700">
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>استخراج وتأكيد <strong>tenant_id</strong></span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>التحقق من الـ <strong>JWT Claims</strong></span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>توجيه WebSockets لـ <strong>SignalR</strong></span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>تجميع الـ Endpoints لتفادي Chatty Calls</span>
                </li>
              </ul>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-indigo-700 font-mono font-semibold">
              Ultra-low latency Routing (&lt; 2ms overhead)
            </div>
          </div>

          {/* Level 3: Micro/Mini Services */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between hover:border-amber-400 transition-all group">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2 py-0.5 rounded text-[10px] bg-amber-100 text-amber-800 border border-amber-200 font-mono font-bold">
                  LAYER 3: SERVICES
                </span>
                <Cpu className="w-4 h-4 text-amber-600" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1 font-['Cairo']">
                4-5 خدمات خفيفة (.NET 10 Minimal)
              </h3>
              <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                كل خدمة مسؤولة عن مجال محدد وممنوع اختراق جداول الخدمات الأخرى.
              </p>
              <ul className="text-xs space-y-1.5 text-slate-700">
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span><strong>Generic Data API</strong> (Dapper + Metadata)</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span><strong>Auth API</strong> (RBAC + HttpOnly Cookies)</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span><strong>Module APIs</strong> (منطق الأعمال والحسابات فقط)</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span><strong>Realtime SignalR</strong> (Postgres Listener)</span>
                </li>
              </ul>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-amber-700 font-mono font-semibold">
              Transactional Outbox + Hangfire Jobs
            </div>
          </div>

          {/* Level 4: PostgreSQL Engine */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between hover:border-emerald-400 transition-all group">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-200 font-mono font-bold">
                  LAYER 4: DATABASE
                </span>
                <Database className="w-4 h-4 text-emerald-600" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1 font-['Cairo']">
                PostgreSQL (Managed Cloud)
              </h3>
              <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                محرك البيانات الوحيد مع عزل Schema لكل موديول وحماية RLS مشددة.
              </p>
              <ul className="text-xs space-y-1.5 text-slate-700">
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span><strong>Row-Level Security (RLS)</strong> لكل جدول</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span><strong>version column</strong> (Optimistic Concurrency)</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span><strong>LISTEN / NOTIFY</strong> للبث اللحظي السريع</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span><strong>PgBouncer</strong> لمنع استهلاك الـ Connections</span>
                </li>
              </ul>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-emerald-700 font-mono font-semibold">
              set_config('app.current_tenant_id', ..., true)
            </div>
          </div>

        </div>

        {/* Realtime NOTIFY flow illustration */}
        <div className="mt-6 bg-slate-50 rounded-xl p-3.5 border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-700">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
            <span className="font-bold text-slate-900">حلقة المزامنة اللحظية (The Realtime Loop):</span>
          </div>
          <div className="font-mono text-[11px] text-slate-600 flex flex-wrap items-center gap-2" dir="ltr">
            <span>User Edit</span>
            <span>➔</span>
            <span>Optimistic Local UI</span>
            <span>➔</span>
            <span>API Update (version++)</span>
            <span>➔</span>
            <span>Postgres NOTIFY</span>
            <span>➔</span>
            <span>SignalR Hub</span>
            <span>➔</span>
            <span className="text-emerald-700 font-bold">All Connected Operators Updated</span>
          </div>
        </div>
      </div>

      {/* Code Inspector & Implementation Details */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <FileCode className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-base font-['Cairo']">
              استعراض كود التنفيذ المعتمد (Clean Production Snippets)
            </h3>
          </div>

          {/* Snippet Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setSelectedSnippet('genericApi')}
              className={`px-3 py-1.5 rounded-lg transition-all font-semibold cursor-pointer ${
                selectedSnippet === 'genericApi' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Generic Data API (.NET 10)
            </button>
            <button
              onClick={() => setSelectedSnippet('postgresRls')}
              className={`px-3 py-1.5 rounded-lg transition-all font-semibold cursor-pointer ${
                selectedSnippet === 'postgresRls' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Postgres RLS + Concurrency SQL
            </button>
            <button
              onClick={() => setSelectedSnippet('signalR')}
              className={`px-3 py-1.5 rounded-lg transition-all font-semibold cursor-pointer ${
                selectedSnippet === 'signalR' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              SignalR LISTEN Bridge
            </button>
            <button
              onClick={() => setSelectedSnippet('yarp')}
              className={`px-3 py-1.5 rounded-lg transition-all font-semibold cursor-pointer ${
                selectedSnippet === 'yarp' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              YARP Proxy Routes
            </button>
          </div>
        </div>

        {/* Code Block with Copy Button */}
        <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-950">
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs font-mono text-slate-400">
            <span>
              {selectedSnippet === 'genericApi' && 'GenericDataEndpoint.cs - (< 300 lines rule compliant)'}
              {selectedSnippet === 'postgresRls' && '01_tenant_rls_and_concurrency.sql'}
              {selectedSnippet === 'signalR' && 'PostgresRealtimeBridge.cs'}
              {selectedSnippet === 'yarp' && 'appsettings.json - YARP Reverse Proxy'}
            </span>
            <button
              onClick={() => copyToClipboard(getActiveCode())}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 transition-all cursor-pointer font-sans text-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'تم النسخ' : 'نسخ الكود'}</span>
            </button>
          </div>
          <pre className="p-4 text-xs font-mono text-sky-200 overflow-x-auto leading-relaxed max-h-[380px] no-scrollbar" dir="ltr">
            <code>{getActiveCode()}</code>
          </pre>
        </div>
      </div>

      {/* Comparison: Legacy Monolith vs NextGen Architecture */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3 text-rose-800 font-bold font-['Cairo'] text-sm">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>عيوب المنصة السابقة التي تم التخلص منها نهائياً</span>
          </div>
          <ul className="text-xs space-y-2.5 text-slate-700">
            <li className="flex items-start gap-2">
              <span className="text-rose-600 font-bold">✕</span>
              <span><strong>تضخم الكود:</strong> ملفات واجهات تتجاوز 10 آلاف سطر يصعب صيانتها والتعديل عليها.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-600 font-bold">✕</span>
              <span><strong>بطء الزر وهنج الشاشة:</strong> انتظار ردود الـ Server قبل تحديث الواجهة مع طلبات API متتالية (N+1 Calls).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-600 font-bold">✕</span>
              <span><strong>نسيان الصلاحيات:</strong> إضافة زر جديد بالواجهة دون تسجيله في شاشة الصلاحيات مما يفتح ثغرات أمنية.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-600 font-bold">✕</span>
              <span><strong>Cold Starts:</strong> بطء قاتل عند أول طلب بسبب مزودي السحابة المجانية (Scale-to-zero).</span>
            </li>
          </ul>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3 text-emerald-800 font-bold font-['Cairo'] text-sm">
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>الحلول المعمارية في النظام الجديد</span>
          </div>
          <ul className="text-xs space-y-2.5 text-slate-700">
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <span><strong>Metadata Screen Engine:</strong> الشاشات تتولد آلياً من JSON مع حظر أي ملف يتجاوز 300 سطر في الـ CI.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <span><strong>Optimistic UI:</strong> استجابة الزر 0ms فوراً مع endpoint موحد ومُجمع لكل شاشة.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <span><strong>Action Registry:</strong> مصدر واحد للأزرار، والأفعال الجديدة ممنوعة افتراضياً (Default-Deny).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <span><strong>No Scale-to-Zero:</strong> سيرفر شغال 24/7 مع Postgres مدار وقريب من مصر (&lt; 50ms).</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
