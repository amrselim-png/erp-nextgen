import React, { useState } from 'react';
import { TenantContext, UserRole } from '../types.ts';
import { 
  FileCheck2, 
  Send, 
  Key, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  QrCode, 
  Download, 
  RefreshCw, 
  ShieldCheck, 
  Building2, 
  Hash, 
  ExternalLink,
  Layers,
  FileCode2,
  Cpu
} from 'lucide-react';

interface EtaEinvoiceViewProps {
  currentTenant: TenantContext;
  userRole: UserRole;
}

interface EtaDocument {
  id: string;
  internalId: string;
  documentType: 'INVOICE' | 'RECEIPT' | 'CREDIT_NOTE';
  receiverName: string;
  receiverTaxId: string;
  totalAmount: number;
  vatAmount: number;
  signedWithToken: boolean;
  status: 'SUBMITTED' | 'VALID' | 'REJECTED' | 'DRAFT';
  etaUuid?: string;
  submissionUuid?: string;
  date: string;
  validationError?: string;
}

export const EtaEinvoiceView: React.FC<EtaEinvoiceViewProps> = ({
  currentTenant,
  userRole
}) => {
  const [activeTab, setActiveTab] = useState<'documents' | 'tokens' | 'json_schema'>('documents');

  // Documents
  const [documents, setDocuments] = useState<EtaDocument[]>([
    {
      id: 'eta_01',
      internalId: 'INV-2026-904',
      documentType: 'INVOICE',
      receiverName: 'شركة المصرية للاتصالات WE',
      receiverTaxId: '100-241-890',
      totalAmount: 18450,
      vatAmount: 2265.79,
      signedWithToken: true,
      status: 'VALID',
      etaUuid: '9B48F2A1-09CE-4A12-88EF-77189CDE3310',
      submissionUuid: 'SUB-2026-99120',
      date: '2026-10-14 11:42'
    },
    {
      id: 'eta_02',
      internalId: 'REC-2026-881',
      documentType: 'RECEIPT',
      receiverName: 'عميل نقدي / نزيل الغرفة 402',
      receiverTaxId: '000-000-000',
      totalAmount: 1040,
      vatAmount: 127.72,
      signedWithToken: true,
      status: 'VALID',
      etaUuid: '3C19EA08-66DA-4911-B2C3-55908812AD89',
      submissionUuid: 'SUB-2026-99119',
      date: '2026-10-14 11:30'
    },
    {
      id: 'eta_03',
      internalId: 'INV-2026-905',
      documentType: 'INVOICE',
      receiverName: 'مؤسسة الأهرام للصحافة والإعلان',
      receiverTaxId: '204-981-112',
      totalAmount: 32000,
      vatAmount: 3929.82,
      signedWithToken: false,
      status: 'DRAFT',
      date: '2026-10-14 11:50'
    }
  ]);

  // Selected for QR / detail view
  const [selectedDoc, setSelectedDoc] = useState<EtaDocument | null>(documents[0]);
  const [isSigning, setIsSigning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // HSM Token State
  const [tokenInfo] = useState({
    provider: 'Egypt Trust (Token PKI v2)',
    serialNumber: 'ET-994821093-X',
    validUntil: '2027-12-31',
    status: 'CONNECTED',
    slotId: 'USB_HSM_PORT_1'
  });

  const handleSignDocument = (docId: string) => {
    setIsSigning(true);
    setTimeout(() => {
      setIsSigning(false);
      setDocuments(documents.map(d => {
        if (d.id === docId) {
          return { ...d, signedWithToken: true };
        }
        return d;
      }));
      setActionNotice('تم توقيع الفاتورة إلكترونياً (e-sign) باستخدام التوكن الرقمي بشهادة X.509 بنجاح!');
      setTimeout(() => setActionNotice(null), 4000);
    }, 800);
  };

  const handleSubmitEta = (docId: string) => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const uuid = 'F831E' + Math.floor(Math.random() * 89999 + 10000) + '-77A1-42C9-9A00';
      setDocuments(documents.map(d => {
        if (d.id === docId) {
          return {
            ...d,
            status: 'VALID',
            etaUuid: uuid,
            submissionUuid: `SUB-${Date.now().toString().slice(-6)}`
          };
        }
        return d;
      }));
      setActionNotice(`تم إرسال المستند للضرائب المصرية (eta.submit) بنجاح وحصل على حالة صالح (VALID) برقم UUID: ${uuid}!`);
      setTimeout(() => setActionNotice(null), 5000);
    }, 1200);
  };

  const handleQueryStatus = (doc: EtaDocument) => {
    setActionNotice(`تم الاستعلام عن المستند (eta.status) من بوابة الضرائب: الحالة معتمدة وصالحة (VALID)!`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const sampleEtaJson = JSON.stringify({
    issuer: {
      type: "B",
      id: currentTenant.id,
      name: currentTenant.nameAr,
      taxAuthorityRegNumber: "584-921-304"
    },
    receiver: {
      type: "B",
      id: "100-241-890",
      name: "شركة المصرية للاتصالات WE"
    },
    documentType: "I",
    documentTypeVersion: "1.0",
    dateTimeIssued: "2026-10-14T11:42:00Z",
    taxpayerActivityCode: "5510",
    internalID: "INV-2026-904",
    invoiceLines: [
      {
        description: "خدمات إقامة فندقية ومؤتمرات شاملة",
        itemType: "EGS",
        itemCode: "EG-100241890-HOTELEVENT",
        unitType: "DAY",
        quantity: 3,
        unitValue: { currencySold: "EGP", amountEGP: 6150 },
        salesTotal: 18450,
        taxableItems: [
          { taxType: "T1", subType: "V009", rate: 14, amount: 2265.79 }
        ]
      }
    ],
    totalSalesAmount: 18450,
    totalTaxAmount: 2265.79,
    netAmount: 16184.21,
    extraDiscountAmount: 0,
    totalAmount: 18450,
    signatures: [
      {
        signatureType: "I",
        value: "MIIE5AYJKoZIhvcNAQcCoIIE1TCCBNEC... (Egypt Trust Signed Digest)"
      }
    ]
  }, null, 2);

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveTab('documents')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'documents'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            <span>الفواتير والإيصالات الإلكترونية (eta.submit / status)</span>
          </button>

          <button
            onClick={() => setActiveTab('tokens')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'tokens'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>شهادة التوقيع الرقمي (Egypt Trust Token)</span>
          </button>

          <button
            onClick={() => setActiveTab('json_schema')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'json_schema'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <FileCode2 className="w-4 h-4" />
            <span>مخطط بيانات الضرائب (ETA UBL 2.1 JSON)</span>
          </button>
        </div>

        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-[11px] font-bold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>منظومة الفاتورة: Sandbox & Live ETA Connected</span>
        </div>
      </div>

      {actionNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* 1. Documents Tab */}
      {activeTab === 'documents' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Document Table */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-sky-600" />
                  <span>المستندات المحولة لمنظومة الضرائب المصرية</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  توقيع الـ Hashes، الإرسال للـ ETA API، واستلام الـ UUID الرسمي
                </p>
              </div>

              <span className="font-mono text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-lg font-bold">
                {documents.filter(d => d.status === 'VALID').length} معتمد بنجاح
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <th className="p-2.5">رقم المستند</th>
                    <th className="p-2.5">النوع</th>
                    <th className="p-2.5">المستلم والبطاقة الضريبية</th>
                    <th className="p-2.5">القيمة والضريبة</th>
                    <th className="p-2.5">التوقيع الإلكتروني</th>
                    <th className="p-2.5">حالة الضرائب</th>
                    <th className="p-2.5 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {documents.map((doc) => (
                    <tr 
                      key={doc.id} 
                      onClick={() => setSelectedDoc(doc)}
                      className={`hover:bg-slate-50/70 transition-colors cursor-pointer ${selectedDoc?.id === doc.id ? 'bg-sky-50/40' : ''}`}
                    >
                      <td className="p-2.5 font-mono font-bold text-sky-700">{doc.internalId}</td>
                      <td className="p-2.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          doc.documentType === 'INVOICE' ? 'bg-indigo-100 text-indigo-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {doc.documentType === 'INVOICE' ? 'فاتورة B2B' : 'إيصال B2C'}
                        </span>
                      </td>
                      <td className="p-2.5">
                        <div className="font-bold text-slate-900">{doc.receiverName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{doc.receiverTaxId}</div>
                      </td>
                      <td className="p-2.5 font-mono">
                        <div className="font-bold text-slate-900">{doc.totalAmount.toLocaleString()} ج.م</div>
                        <div className="text-[10px] text-emerald-700 font-medium">ض: {doc.vatAmount.toFixed(2)} ج.م</div>
                      </td>
                      <td className="p-2.5">
                        {doc.signedWithToken ? (
                          <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                            <Key className="w-3 h-3" />
                            موقّع (Token)
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold text-amber-600">غير موقّع</span>
                        )}
                      </td>
                      <td className="p-2.5">
                        {doc.status === 'VALID' && (
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            صالح (Valid)
                          </span>
                        )}
                        {doc.status === 'DRAFT' && (
                          <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            مسودة جاهزة
                          </span>
                        )}
                      </td>
                      <td className="p-2.5 text-center">
                        <div className="flex items-center justify-center gap-1.5" onClick={e => e.stopPropagation()}>
                          {!doc.signedWithToken && (
                            <button
                              onClick={() => handleSignDocument(doc.id)}
                              disabled={isSigning}
                              className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded text-[11px] font-bold"
                            >
                              توقيع e-sign
                            </button>
                          )}
                          {doc.signedWithToken && doc.status === 'DRAFT' && (
                            <button
                              onClick={() => handleSubmitEta(doc.id)}
                              disabled={isSubmitting}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold shadow-2xs"
                            >
                              إرسال eta.submit
                            </button>
                          )}
                          {doc.status === 'VALID' && (
                            <button
                              onClick={() => handleQueryStatus(doc)}
                              className="px-2 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded text-[11px] font-bold"
                            >
                              فحص eta.status
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Selected Document Details & ETA QR Code */}
          {selectedDoc && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <h4 className="text-sm font-extrabold text-slate-900">بيانات الفاتورة والـ QR الرسمي</h4>
                <span className="font-mono text-xs bg-sky-50 text-sky-800 px-2 py-0.5 rounded font-bold">
                  {selectedDoc.internalId}
                </span>
              </div>

              {/* QR Code Container */}
              <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="w-32 h-32 bg-white p-2 rounded-xl border border-slate-300 shadow-xs flex items-center justify-center">
                  <QrCode className="w-28 h-28 text-slate-900" />
                </div>
                <span className="text-[11px] text-slate-500 font-mono text-center">
                  رمز التحقق المشفر المعتمد من مصلحة الضرائب المصرية
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-500">الرقم التعريفي الفريد (ETA UUID):</span>
                  <p className="font-mono text-[11px] font-bold text-sky-800 break-all bg-slate-50 p-2 rounded-lg border border-slate-200 mt-1">
                    {selectedDoc.etaUuid || 'بانتظار الإرسال للبوابة'}
                  </p>
                </div>

                <div>
                  <span className="text-slate-500">رقم الإرسالية (Submission UUID):</span>
                  <p className="font-mono text-[11px] font-bold text-slate-800 mt-0.5">
                    {selectedDoc.submissionUuid || 'لم ترسل بعد'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                  <div>
                    <span className="text-slate-500">القيمة الصافية:</span>
                    <p className="font-mono font-bold text-slate-900">{(selectedDoc.totalAmount - selectedDoc.vatAmount).toFixed(2)} ج.م</p>
                  </div>
                  <div>
                    <span className="text-slate-500">ضريبة القيمة المضافة:</span>
                    <p className="font-mono font-bold text-emerald-700">{selectedDoc.vatAmount.toFixed(2)} ج.م</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. Tokens Tab */}
      {activeTab === 'tokens' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Key className="w-5 h-5 text-indigo-600" />
                <span>شهادة التوقيع الرقمي (Hardware Token / e-Sign Certificate)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                تكامل مباشر مع توكن مصر للتأمين / إيجيبت ترست مع خوارزمية التشفير SHA-256 و RSA 2048-bit
              </p>
            </div>

            <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Token Connected</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="font-extrabold text-slate-900">بيانات الشهادة الرقمية (X.509 Certificate)</h4>
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">جهة الإصدار المعتمدة:</span>
                  <span className="font-bold text-slate-800">{tokenInfo.provider}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">الرقم المسلسل للتوكن:</span>
                  <span className="font-mono font-bold text-slate-800">{tokenInfo.serialNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">تاريخ انتهاء الصلاحية:</span>
                  <span className="font-mono font-bold text-emerald-700">{tokenInfo.validUntil}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">المنفذ الفيزيائي:</span>
                  <span className="font-mono text-slate-700">{tokenInfo.slotId}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="font-extrabold text-slate-900">حالة التوقيع الآلي للفواتير</h4>
              <p className="text-slate-600 leading-relaxed">
                يقوم النظام بحساب الـ Canonical Hash لكل فاتورة وإرسال البصمة الرقمية للتوكن للتوقيع في أقل من 50 ميلي ثانية دون تأخير حركة المبيعات أو الكاشير.
              </p>
              <div className="p-2.5 bg-sky-50 text-sky-800 border border-sky-200 rounded-xl font-bold text-[11px]">
                ✓ متوافق مع معايير مصلحة الضرائب المصرية SDK v2.5
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. JSON Schema Tab */}
      {activeTab === 'json_schema' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <FileCode2 className="w-4 h-4 text-sky-600" />
                <span>مخطط مستند الفاتورة الإلكترونية المعتمد (UBL 2.1 JSON Payload)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                الكود المتولد تلقائياً والمطابق لمواصفات الـ ETA API v1.0
              </p>
            </div>
          </div>

          <pre className="p-4 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-2xl overflow-x-auto max-h-96">
            {sampleEtaJson}
          </pre>
        </div>
      )}
    </div>
  );
};
