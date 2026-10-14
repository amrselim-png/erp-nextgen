import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Play, 
  FileCode2, 
  ShieldAlert, 
  Zap, 
  Terminal, 
  Copy, 
  Check, 
  AlertTriangle 
} from 'lucide-react';

interface FileCheckItem {
  path: string;
  lines: number;
  maxAllowed: number;
  status: 'passed' | 'failed';
}

interface ActionCheckItem {
  component: string;
  buttonLabel: string;
  actionCode: string;
  isRegistered: boolean;
  status: 'passed' | 'failed';
}

export const CiGuardrailsView: React.FC = () => {
  const [isRunningPipeline, setIsRunningPipeline] = useState(false);
  const [pipelineFinished, setPipelineFinished] = useState(true);
  const [copiedYaml, setCopiedYaml] = useState(false);

  // Files to test
  const [files] = useState<FileCheckItem[]>([
    { path: 'src/components/Sidebar.tsx', lines: 180, maxAllowed: 300, status: 'passed' },
    { path: 'src/components/LiveSyncSimulator.tsx', lines: 268, maxAllowed: 300, status: 'passed' },
    { path: 'src/components/MetadataScreenEngine.tsx', lines: 275, maxAllowed: 300, status: 'passed' },
    { path: 'src/api/GenericDataEndpoint.cs', lines: 76, maxAllowed: 300, status: 'passed' },
    { path: 'src/services/PostgresRealtimeBridge.cs', lines: 48, maxAllowed: 300, status: 'passed' },
    { path: 'src/legacy/OldBigSalesScreen.tsx', lines: 890, maxAllowed: 300, status: 'failed' }
  ]);

  // Actions to test
  const [actions] = useState<ActionCheckItem[]>([
    { component: 'PosTerminal.tsx', buttonLabel: 'إتمام وسداد', actionCode: 'pos:order:create', isRegistered: true, status: 'passed' },
    { component: 'InventoryMaster.tsx', buttonLabel: 'تسوية مخزن', actionCode: 'inventory:stock_adjust:execute', isRegistered: true, status: 'passed' },
    { component: 'CustomerCard.tsx', buttonLabel: 'تجاوز حد الخصم', actionCode: 'pos:discount:override', isRegistered: true, status: 'passed' },
    { component: 'AccountingLedger.tsx', buttonLabel: 'قيد يومية', actionCode: 'accounting:journal:post', isRegistered: true, status: 'passed' },
    { component: 'PromoBanner.tsx', buttonLabel: 'حذف سجل تجريبي', actionCode: 'unregistered_hack_button', isRegistered: false, status: 'failed' }
  ]);

  const runPipeline = () => {
    setIsRunningPipeline(true);
    setPipelineFinished(false);
    setTimeout(() => {
      setIsRunningPipeline(false);
      setPipelineFinished(true);
    }, 1000);
  };

  const githubActionsYaml = `# .github/workflows/erp-ci-guardrails.yml
name: ERP CI Architecture Guardrails

on: [push, pull_request]

jobs:
  architecture_enforcement:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      # 1. بوابة حظر الملفات الضخمة (< 300 سطر للملف)
      - name: Enforce 300-Line File Limit
        run: |
          echo "Scanning codebase for files exceeding 300 lines..."
          OVERSIZED_FILES=$(find src -type f \\( -name "*.ts" -o -name "*.tsx" -o -name "*.cs" \\) -exec wc -l {} + | awk '$1 > 300 && $2 != "total" {print $1, $2}')
          if [ -n "$OVERSIZED_FILES" ]; then
            echo "❌ BUILD FAILED: The following files exceed the 300-line strict limit:"
            echo "$OVERSIZED_FILES"
            exit 1
          fi
          echo "✅ All files strictly under 300 lines!"

      # 2. بوابة التأكد من تسجيل كل زر في الـ Action Registry (Default-Deny)
      - name: Verify All UI Actions are Registered
        run: |
          echo "Verifying UI Action Registry consistency..."
          npm run test:action-registry-coverage

      # 3. بوابة ميزانية سرعة الـ API (< 200ms)
      - name: Speed Budget Audit (Lighthouse & k6)
        run: |
          npm run test:speed-budget
`;

  return (
    <div className="space-y-6" dir="rtl">
      {/* Top Banner (Day Mode) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono text-xs font-bold border border-emerald-200">
              حراس الجودة في الـ CI/CD
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 font-['Cairo']">
              بوابات الفحص الآلي وميزانية السرعة (CI Architecture Guardrails)
            </h2>
          </div>
          <p className="text-xs text-slate-600">
            فشل الـ Build فوراً في حال: <strong className="text-rose-600">ملف يتجاوز 300 سطر</strong>، أو <strong className="text-amber-600">زر واجهة بدون فعل مسجل</strong>، أو <strong className="text-sky-700">تجاوز ميزانية الـ 200ms</strong>.
          </p>
        </div>

        <button
          onClick={runPipeline}
          disabled={isRunningPipeline}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs cursor-pointer transition-all shadow-md shadow-sky-600/20 disabled:opacity-50 shrink-0"
        >
          <Play className="w-4 h-4" />
          <span>{isRunningPipeline ? 'جاري الفحص في GitHub Actions...' : 'إعادة تشغيل بوابات الـ CI'}</span>
        </button>
      </div>

      {/* Grid: Gate 1 & Gate 2 (Day Mode) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Gate 1: 300-Line Rule */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <FileCode2 className="w-4 h-4 text-sky-600" />
              <h3 className="font-bold text-slate-900 text-xs font-['Cairo']">
                البوابة 1: حد 300 سطر للملف (Max 300-Lines Rule)
              </h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold border border-rose-200">
              1 ملف مخالف تم حظره
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            {files.map((f, i) => (
              <div key={i} className={`p-2.5 rounded-xl border flex items-center justify-between ${
                f.status === 'passed' ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}>
                <span className="truncate max-w-xs">{f.path}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`font-bold ${f.status === 'passed' ? 'text-emerald-700' : 'text-rose-600'}`}>
                    {f.lines} / {f.maxAllowed} سطر
                  </span>
                  {f.status === 'passed' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-600" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gate 2: Unregistered Action Check */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-purple-600" />
              <h3 className="font-bold text-slate-900 text-xs font-['Cairo']">
                البوابة 2: فحص تسجيل الأزرار (AST Action Scanner)
              </h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold border border-rose-200">
              حظر أي زر مجهول
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            {actions.map((act, i) => (
              <div key={i} className={`p-2.5 rounded-xl border flex items-center justify-between ${
                act.status === 'passed' ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}>
                <div className="truncate max-w-xs">
                  <span className="text-slate-900 font-bold block font-sans">{act.buttonLabel}</span>
                  <span className="text-[11px] text-slate-500">{act.component} ➔ {act.actionCode}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {act.status === 'passed' ? (
                    <span className="text-emerald-800 text-[10px] bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>مسجل بالـ RBAC</span>
                    </span>
                  ) : (
                    <span className="text-rose-800 text-[10px] bg-rose-100 px-2 py-0.5 rounded-md border border-rose-200 font-bold flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5 text-rose-600" />
                      <span>زر غير معتمد!</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* GitHub Actions YAML Preview */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xs space-y-3 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200 font-['Cairo']">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>ملف تهيئة GitHub Actions الحقيقي (.github/workflows/erp-ci-guardrails.yml)</span>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(githubActionsYaml);
              setCopiedYaml(true);
              setTimeout(() => setCopiedYaml(false), 2000);
            }}
            className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg transition-all cursor-pointer border border-slate-700"
          >
            {copiedYaml ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedYaml ? 'تم النسخ' : 'نسخ الكود'}</span>
          </button>
        </div>

        <pre className="text-xs font-mono text-emerald-300 p-4 bg-slate-950 rounded-xl overflow-x-auto leading-relaxed border border-slate-800" dir="ltr">
          {githubActionsYaml}
        </pre>
      </div>
    </div>
  );
};
