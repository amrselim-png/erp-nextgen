import React, { useState } from 'react';
import { REGION_BENCHMARKS } from '../data/mockErpData.ts';
import { 
  Compass, 
  Globe2, 
  Zap, 
  CheckCircle2, 
  CreditCard, 
  Database 
} from 'lucide-react';

export const ExpertRecommendations: React.FC = () => {
  const [selectedRegionIndex, setSelectedRegionIndex] = useState(0);
  const activeRegion = REGION_BENCHMARKS[selectedRegionIndex];

  return (
    <div className="space-y-6" dir="rtl">
      {/* Executive Answer Header (Day Mode) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-semibold border border-sky-200 mb-3">
          <Compass className="w-3.5 h-3.5" />
          <span>الرد الهندسي المتخصص على استفسارات وتوصيات المنظومة 🇪🇬</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 font-['Cairo'] tracking-tight">
          الرأي الفني والتوصيات الحاسمة للاستضافة والقرارات المفتوحة
        </h1>
        <p className="mt-2 text-xs md:text-sm text-slate-600 max-w-4xl leading-relaxed">
          تحليل ميداني مبني على مسارات كابلات الفايبر البحرية في مصر (المصرية للاتصالات TE Data، فودافون، أورانج)، وسلوك مزودي الـ Cloud في الشرق الأوسط وأوروبا، وحل معضلة انقطاع الإنترنت للـ POS.
        </p>
      </div>

      {/* Decision 1: Cloud Region & Managed Postgres for Egypt */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Globe2 className="w-5 h-5 text-sky-600" />
            <h2 className="text-lg font-bold text-slate-900 font-['Cairo']">
              1. قرار الاستضافة: مزود الـ Postgres والـ Region الأفضل لمصر
            </h2>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-mono font-bold border border-emerald-200 self-start sm:self-auto">
            الخيار الفائز: Frankfurt (ألمانيا) أو Milan (إيطاليا)
          </span>
        </div>

        {/* Cable Map Reality Explanation */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2.5 text-slate-700 leading-relaxed">
          <div className="font-bold text-sky-800 flex items-center gap-2 text-sm">
            <Zap className="w-4 h-4 text-sky-600 shrink-0" />
            <span>لماذا أوروبا (فرانكفورت/ميلانو) أسرع بكثير من الخليج لمستخدمي مصر؟ (مفارقة التوجيه BGP):</span>
          </div>
          <p>
            تخرج حركة الإنترنت في مصر عبر محطات إنزال الكابلات البحرية في <strong className="text-slate-900">الإسكندرية (أبو تلات / سيدي بشر) والزعفرانة والسويس</strong> (كابلات SeaMeWe-4, SeaMeWe-5, AAE-1, FLAG). المسار الفيزيائي لهذه الكابلات يتجه مباشرة شمال غرب إلى صقلية، مرسيليا، وجنوب أوروبا، ومنها بشبكات أرضية فائقة السرعة إلى <strong>فرانكفورت</strong>.
          </p>
          <p className="text-amber-900 bg-amber-50 p-3 rounded-xl border border-amber-200">
            ⚠️ <strong>فخ الخليج (Gulf Latency Trap):</strong> رغم القرب الجغرافي للدمام أو دبي، فإن شركات الاتصالات في مصر (AS8452 المصرية للاتصالات) لا تمتلك في معظم الأوقات Peering مباشر مع مزودي الداتاسنتر في الخليج، وبالتالي تعبر حزمة البيانات من مصر إلى مرسيليا في أوروبا، ثم تعود شرقاً إلى الخليج، فيصل البنج إلى <strong>85-115ms</strong> مع تذبذب عالي (Jitter)، بينما فرانكفورت تعطي <strong>45ms ثابتة</strong> وميلانو تعطي <strong>38ms</strong>!
          </p>
        </div>

        {/* Region Benchmark Switcher */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {REGION_BENCHMARKS.map((reg, idx) => (
            <button
              key={reg.regionCode}
              onClick={() => setSelectedRegionIndex(idx)}
              className={`p-3 rounded-xl border text-right cursor-pointer transition-all ${
                selectedRegionIndex === idx
                  ? 'bg-sky-50 border-sky-500 shadow-xs ring-1 ring-sky-500/30'
                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono font-bold text-[11px] text-slate-900 truncate">{reg.regionCode.split(' ')[0]}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                  reg.status === 'recommended' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                }`}>
                  {reg.status === 'recommended' ? 'موصى به' : 'انتبه'}
                </span>
              </div>
              <span className="block text-xs font-bold text-slate-800 truncate">{reg.nameAr}</span>
              <div className="mt-2 flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-500">بنج القاهرة:</span>
                <span className="text-emerald-700 font-bold">{reg.cairoPingMs} ms</span>
              </div>
            </button>
          ))}
        </div>

        {/* Active Region Deep Dive */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-['Cairo']">
                {activeRegion.nameAr} - {activeRegion.regionCode}
              </h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">{activeRegion.provider}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
              <div className="bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-slate-500 ml-1">بنج الإسكندرية:</span>
                <strong className="text-emerald-700">{activeRegion.alexPingMs} ms</strong>
              </div>
              <div className="bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-slate-500 ml-1">بنج القاهرة:</span>
                <strong className="text-emerald-700">{activeRegion.cairoPingMs} ms</strong>
              </div>
              <div className="bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-slate-500 ml-1">مؤشر الثبات:</span>
                <strong className="text-sky-700">{activeRegion.stabilityScore}/100</strong>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-700 leading-relaxed font-medium">
            {activeRegion.notesAr}
          </p>

          {/* Postgres Offerings Table */}
          <div>
            <span className="text-xs font-bold text-slate-900 block mb-2 font-['Cairo']">
              خيارات الـ Managed Postgres المتاحة في هذه المنطقة:
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {activeRegion.postgresOfferings.map((po, i) => (
                <div key={i} className="p-3.5 bg-white rounded-xl border border-slate-200 text-xs space-y-1.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <strong className="text-slate-900 font-mono">{po.name}</strong>
                    <span className="text-sky-700 font-mono text-[11px] font-bold">{po.pricePerMonth}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 text-[11px]">
                    <span>دعم الـ Connection Pooling:</span>
                    <span className="text-emerald-700 font-mono font-semibold">{po.poolingSupport}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 text-[11px]">
                    <span>خطر الـ Cold Start (التوقف التلقائي):</span>
                    <span className={`font-mono font-bold ${
                      po.coldStartRisk === 'zero' ? 'text-emerald-700' : 'text-rose-600'
                    }`}>
                      {po.coldStartRisk === 'zero' ? 'منعدم (Zero - Always Warm)' : 'عالي (يسبب هنج 3 ثواني)'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Specific Recommendation Box */}
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-2 text-emerald-900">
          <div className="font-bold text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>التوصية النهائية لمزود الاستضافة وقاعدة البيانات:</span>
          </div>
          <p className="leading-relaxed text-slate-700">
            <strong>الخيار الأول (الأكثر راحة وسرعة):</strong> استضافة الـ APIs على <strong>Hetzner Cloud</strong> في فرانكفورت أو <strong>GCP europe-west3</strong>، مع استخدام <strong>Supabase Pro ($25)</strong> في منطقة فرانكفورت (AWS eu-central-1) مع تفعيل Supavisor Connection Pooling. هذا يعطيك سرعة فائقة من مصر (بنج 44ms)، وبث SignalR فوري، وبدون أي مخاطرة لانطفاء السيرفر (No Cold Starts).
          </p>
        </div>
      </div>

      {/* Decision 2: POS Online-Only vs The Reality of Retail in Egypt */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-bold text-slate-900 font-['Cairo']">
              2. معضلة نقطة البيع (POS Online-Only) وانقطاع النت في الفروع بمصر
            </h2>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-mono font-bold border border-amber-200 self-start sm:self-auto">
            الحل: Online-First مع Local Outbox (IndexedDB)
          </span>
        </div>

        <div className="text-xs space-y-3 text-slate-700 leading-relaxed">
          <p>
            الرأي المطروح: <em className="text-slate-500">"الـ POS أونلاين بس: لو النت قطع في الفرع، الكاشير بيقف. اخترت ده عن قصد، لكن لو عميل بيع بالتجزئة هيعترض، يبقى لازم نرجع لقرار الأوفلاين للـ POS بس قبل المرحلة 3."</em>
          </p>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <span className="font-bold text-slate-900 block text-sm">
              💡 الحل الهندسي العبقري دون إدخال تعقيدات المزامنة الثنائية (Two-Way Sync):
            </span>
            <p>
              لا تبنِ قاعدة بيانات SQLite كاملة على جهاز الكاشير (لأنها ستعيد كابوس الـ 10 آلاف سطر وتعارضات الجرد المعقدة). بدلاً من ذلك، طبق نمط:
              <strong className="text-sky-700 mx-1">"Online-First with Local Outbox Queue"</strong>:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-slate-700 pr-2">
              <li>
                <strong>كاش الأصناف والأسعار:</strong> يتم تنزيل جدول الأصناف والأسعار والباركود في <code className="text-emerald-700 font-mono bg-emerald-50 px-1 py-0.5 rounded border border-emerald-200">IndexedDB</code> بالمتصفح عند بداية الوردية (يأخذ أقل من 2MB لـ 10,000 صنف).
              </li>
              <li>
                <strong>وضع التشغيل الطبيعي:</strong> يرسل الكاشير الفاتورة أونلاين لحظياً مع زمن استجابة 25ms.
              </li>
              <li>
                <strong>عند انقطاع النت في الفرع:</strong> يرصد الـ Service Worker انقطاع الاتصال تلقائياً؛ لا يوقف الكاشير إطلاقاً! بل يسمح بطباعة الفاتورة للعميل مع وسم <code className="text-amber-800 font-mono bg-amber-50 px-1 py-0.5 rounded border border-amber-200">OFFLINE-SEQ-001</code> ويضع الـ Payload داخل الـ Local Outbox في الـ IndexedDB.
              </li>
              <li>
                <strong>عند عودة النت:</strong> يرسل المتصفح كل الفواتير المخزنة تلقائياً بالترتيب إلى الـ API مستخدماً الـ <code className="text-purple-800 font-mono bg-purple-50 px-1 py-0.5 rounded border border-purple-200">Idempotency-Key</code>، فيتم تحديث المخزون والحسابات دون أي تدخل بشري ودون توقف العميل لحظة واحدة في طابور الكاشير!
              </li>
            </ol>
          </div>
        </div>
      </div>

      {/* Decision 3: Accounting Saga & Eventual Consistency Verdict */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-slate-900 font-['Cairo']">
              3. المحاسبة والاتساق التدريجي (Eventual Consistency & Sagas)
            </h2>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-sky-100 text-sky-800 font-mono font-bold border border-sky-200 self-start sm:self-auto">
            Outbox + Hangfire + Idempotency
          </span>
        </div>

        <div className="text-xs space-y-3 text-slate-700 leading-relaxed">
          <p>
            الاعتماد على <strong className="text-slate-900">Eventually Consistent</strong> للعمليات التي تعبر أكثر من موديول (بيع ➔ مخزن ➔ قيد) هو <strong>القرار الهندسي الصحيح 100%</strong>. القفل الموزع (Distributed 2-Phase Commit) في الأنظمة الحديثة أثبت فشله لأنه يجعل نقطة البيع POS تتجمد في حال تعليق قفل في شجرة الحسابات.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <strong className="text-sky-800 block mb-1">1. الـ Outbox داخل نفس المعاملة:</strong>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                كتابة حدث الفاتورة في جدول <code className="font-mono text-slate-800">sales.outbox</code> داخل نفس Transaction كتابة الفاتورة يضمن عدم ضياع أي فاتورة حتى لو انطفأ السيرفر بعدها فوراً.
              </p>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <strong className="text-emerald-800 block mb-1">2. مفتاح الـ Idempotency:</strong>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                كل قيد محاسبي يحمل <code className="font-mono text-slate-800">idempotency_key = "ord_" + id</code>، بحيث إذا أعاد Hangfire المحاولة، لا يتكرر القيد المالي أبداً في دفتر الأستاذ.
              </p>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <strong className="text-amber-800 block mb-1">3. حركة التعويض (Compensation):</strong>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                في حال وجود خطأ مستعصٍ بالحسابات (سنة مغلقة مثلاً)، يتم ترحيل القيد لحساب وسيط معلق (Suspense Account) وإرسال إشعار للمدير المالي دون تعطيل إيصال العميل.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
