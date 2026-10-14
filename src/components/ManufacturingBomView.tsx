import React, { useState } from 'react';
import { TenantContext, UserRole } from '../types.ts';
import { 
  Factory, 
  Layers, 
  Play, 
  CheckCircle2, 
  Plus, 
  Calculator, 
  History, 
  Box, 
  Zap, 
  TrendingUp, 
  AlertCircle,
  FileText,
  Clock,
  ArrowRight
} from 'lucide-react';

interface ManufacturingBomViewProps {
  currentTenant: TenantContext;
  userRole: UserRole;
}

interface BomItem {
  rawSku: string;
  nameAr: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
}

interface BomDefinition {
  id: string;
  productSku: string;
  productNameAr: string;
  version: number;
  isActive: boolean;
  isApproved: boolean;
  batchSize: number;
  batchUnit: string;
  laborCost: number;
  overheadCost: number;
  ingredients: BomItem[];
}

interface WorkOrder {
  id: string;
  orderNumber: string;
  bomId: string;
  productNameAr: string;
  quantityTarget: number;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  startDate?: string;
  completedDate?: string;
  actualCost?: number;
}

export const ManufacturingBomView: React.FC<ManufacturingBomViewProps> = ({
  currentTenant,
  userRole
}) => {
  const [activeTab, setActiveTab] = useState<'bom' | 'work_orders' | 'costing'>('bom');

  // BOMs State
  const [boms, setBoms] = useState<BomDefinition[]>([
    {
      id: 'bom_croissant',
      productSku: 'BAK-CR-001',
      productNameAr: 'كرواسون زبدة فرنسي فاخر (دزينة 12 قطعة)',
      version: 2,
      isActive: true,
      isApproved: true,
      batchSize: 10, // 10 dozens = 120 pieces
      batchUnit: 'دزينة',
      laborCost: 180,
      overheadCost: 95,
      ingredients: [
        { rawSku: 'RAW-FLR-001', nameAr: 'دقيق فاخر استخراج 72%', quantity: 6, unit: 'كجم', unitCost: 22, totalCost: 132 },
        { rawSku: 'RAW-BTR-002', nameAr: 'زبدة نيوزيلندي طبيعية', quantity: 2.5, unit: 'كجم', unitCost: 280, totalCost: 700 },
        { rawSku: 'RAW-MLK-003', nameAr: 'حليب طازج كامل الدسم', quantity: 3, unit: 'لتر', unitCost: 35, totalCost: 105 },
        { rawSku: 'RAW-YST-004', nameAr: 'خميرة فرنسية فورية وسكر', quantity: 0.4, unit: 'كجم', unitCost: 80, totalCost: 32 }
      ]
    },
    {
      id: 'bom_espresso_blend',
      productSku: 'COF-BLD-010',
      productNameAr: 'خلطة البن الخاصة بالباتروس (1 كجم حبوب)',
      version: 1,
      isActive: true,
      isApproved: true,
      batchSize: 20,
      batchUnit: 'كجم',
      laborCost: 200,
      overheadCost: 120,
      ingredients: [
        { rawSku: 'RAW-COF-COL', nameAr: 'بن أخضر كولومبي سوبريمو', quantity: 12, unit: 'كجم', unitCost: 220, totalCost: 2640 },
        { rawSku: 'RAW-COF-BRA', nameAr: 'بن أخضر برازيلي سانتوس', quantity: 8, unit: 'كجم', unitCost: 170, totalCost: 1360 }
      ]
    }
  ]);

  // Work Orders State
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([
    {
      id: 'wo_901',
      orderNumber: 'WO-2026-088',
      bomId: 'bom_croissant',
      productNameAr: 'كرواسون زبدة فرنسي فاخر (دزينة 12 قطعة)',
      quantityTarget: 20,
      status: 'IN_PROGRESS',
      startDate: '2026-10-14 06:30'
    },
    {
      id: 'wo_900',
      orderNumber: 'WO-2026-087',
      bomId: 'bom_espresso_blend',
      productNameAr: 'خلطة البن الخاصة بالباتروس (1 كجم حبوب)',
      quantityTarget: 50,
      status: 'COMPLETED',
      startDate: '2026-10-13 08:00',
      completedDate: '2026-10-13 14:30',
      actualCost: 10750
    }
  ]);

  const [selectedBom, setSelectedBom] = useState<BomDefinition>(boms[0]);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Handlers
  const handleCreateNewBomVersion = (bomId: string) => {
    const existing = boms.find(b => b.id === bomId);
    if (!existing) return;
    const newVerNumber = existing.version + 1;
    const cloned: BomDefinition = {
      ...existing,
      id: `${existing.id}_v${newVerNumber}`,
      version: newVerNumber,
      isApproved: false, // requires bom.approve
      ingredients: existing.ingredients.map(i => ({ ...i }))
    };
    setBoms([...boms, cloned]);
    setSelectedBom(cloned);
    setActionNotice(`تم إنشاء إصدار جديد (v${newVerNumber}) لقائمة المواد بنجاح (bom.newversion) دون كسر تاريخ الإصدارات السابقة!`);
    setTimeout(() => setActionNotice(null), 5000);
  };

  const handleApproveBom = (bomId: string) => {
    setBoms(boms.map(b => {
      if (b.id === bomId) {
        return { ...b, isApproved: true };
      }
      return b;
    }));
    setSelectedBom(prev => prev.id === bomId ? { ...prev, isApproved: true } : prev);
    setActionNotice('تم اعتماد قائمة المواد (bom.approve) وتفعيلها لأوامر التشغيل والإنتاج في المصنع!');
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleStartProduction = (woId: string) => {
    setWorkOrders(workOrders.map(w => {
      if (w.id === woId) {
        return {
          ...w,
          status: 'IN_PROGRESS',
          startDate: new Date().toISOString().replace('T', ' ').substring(0, 16)
        };
      }
      return w;
    }));
    setActionNotice('تم بدء أمر التشغيل (production.start) وصرف المواد الخام آلياً من مخزن الخامات (stock.issue) دون السماح بالرصيد السالب!');
    setTimeout(() => setActionNotice(null), 5000);
  };

  const handleCompleteProduction = (woId: string) => {
    setWorkOrders(workOrders.map(w => {
      if (w.id === woId) {
        return {
          ...w,
          status: 'COMPLETED',
          completedDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
          actualCost: 2420
        };
      }
      return w;
    }));
    setActionNotice('تم إنهاء التشغيل (production.complete) وإيداع المنتج التام في مستودع البضاعة الجاهزة وحساب تكلفة التشغيل الفعلية!');
    setTimeout(() => setActionNotice(null), 5000);
  };

  const handleRecalculateCosting = () => {
    setActionNotice('تم إعادة احتساب التكاليف المعيارية والفعلية (costing.recalc) وتحديث تسعير الأصناف وفقاً لأسعار خامات الموردين!');
    setTimeout(() => setActionNotice(null), 4000);
  };

  const currentTotalRawCost = selectedBom.ingredients.reduce((acc, it) => acc + it.totalCost, 0);
  const totalBatchCost = currentTotalRawCost + selectedBom.laborCost + selectedBom.overheadCost;
  const unitCalculatedCost = totalBatchCost / selectedBom.batchSize;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveTab('bom')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'bom'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>قوائم المواد (bom.newversion / bom.approve)</span>
          </button>

          <button
            onClick={() => setActiveTab('work_orders')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'work_orders'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Factory className="w-4 h-4" />
            <span>أوامر التشغيل والإنتاج (production.*)</span>
          </button>

          <button
            onClick={() => setActiveTab('costing')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'costing'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>محرك التكلفة الفعلية (costing.recalc)</span>
          </button>
        </div>

        <div>
          {activeTab === 'bom' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCreateNewBomVersion(selectedBom.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 rounded-lg text-xs font-bold transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>نسخة جديدة bom.newversion</span>
              </button>
              {!selectedBom.isApproved && (
                <button
                  onClick={() => handleApproveBom(selectedBom.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg text-xs font-bold shadow-xs transition-all"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>اعتماد bom.approve</span>
                </button>
              )}
            </div>
          )}

          {activeTab === 'costing' && (
            <button
              onClick={handleRecalculateCosting}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
            >
              <Calculator className="w-4 h-4" />
              <span>إعادة احتساب التكلفة costing.recalc</span>
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

      {/* 1. BOM Tab */}
      {activeTab === 'bom' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* BOM List */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-extrabold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-600" />
              <span>قوائم تركيب المواد المسجلة</span>
            </h3>

            <div className="space-y-2.5">
              {boms.map((b) => (
                <div
                  key={b.id}
                  onClick={() => setSelectedBom(b)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    selectedBom.id === b.id
                      ? 'bg-sky-50 border-sky-300 ring-2 ring-sky-500/20'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-sky-800">{b.productSku}</span>
                    <span className="font-mono text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded-full font-bold">
                      Version {b.version}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 mt-1">{b.productNameAr}</h4>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60 text-[11px]">
                    <span className="text-slate-500">حجم التشغيلة: {b.batchSize} {b.batchUnit}</span>
                    {b.isApproved ? (
                      <span className="text-emerald-700 font-bold">معتمد للإنتاج ✓</span>
                    ) : (
                      <span className="text-amber-700 font-bold">مسودة (غير معتمد)</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* BOM Breakdown & Ingredients */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold bg-sky-100 text-sky-800 px-2 py-0.5 rounded">
                    {selectedBom.productSku}
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900">{selectedBom.productNameAr}</h3>
                </div>
                <p className="text-xs text-slate-500 mt-1 font-mono">
                  BOM الإصدار: v{selectedBom.version} | حجم الدفعة القياسية: {selectedBom.batchSize} {selectedBom.batchUnit}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {selectedBom.isApproved ? (
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                    معتمد للتشغيل (Active)
                  </span>
                ) : (
                  <button
                    onClick={() => handleApproveBom(selectedBom.id)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all"
                  >
                    اعتماد الإصدار bom.approve
                  </button>
                )}
              </div>
            </div>

            {/* Ingredients Table */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold text-slate-800">مكونات المواد الخام (Raw Materials & Packaging)</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <th className="p-2.5">كود المادة</th>
                      <th className="p-2.5">المادة الخام</th>
                      <th className="p-2.5">الكمية المطلوبة</th>
                      <th className="p-2.5">تكلفة الوحدة</th>
                      <th className="p-2.5">إجمالي البند</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedBom.ingredients.map((ing, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/70">
                        <td className="p-2.5 font-mono text-slate-600">{ing.rawSku}</td>
                        <td className="p-2.5 font-bold text-slate-800">{ing.nameAr}</td>
                        <td className="p-2.5 font-mono">{ing.quantity} {ing.unit}</td>
                        <td className="p-2.5 font-mono">{ing.unitCost} ج.م</td>
                        <td className="p-2.5 font-mono font-bold text-slate-900">{ing.totalCost} ج.م</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Cost Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500">تكلفة الخامات:</span>
                <p className="font-mono font-bold text-slate-900 text-sm mt-0.5">{currentTotalRawCost} ج.م</p>
              </div>
              <div>
                <span className="text-slate-500">أجور العمالة المباشرة:</span>
                <p className="font-mono font-bold text-indigo-700 text-sm mt-0.5">{selectedBom.laborCost} ج.م</p>
              </div>
              <div>
                <span className="text-slate-500">المصاريف غير المباشرة:</span>
                <p className="font-mono font-bold text-amber-700 text-sm mt-0.5">{selectedBom.overheadCost} ج.م</p>
              </div>
              <div>
                <span className="text-slate-500">تكلفة الوحدة الواحدة:</span>
                <p className="font-mono font-black text-emerald-700 text-sm mt-0.5">{unitCalculatedCost.toFixed(2)} ج.م</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Work Orders Tab */}
      {activeTab === 'work_orders' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Factory className="w-4 h-4 text-emerald-600" />
                <span>أوامر التشغيل والإنتاج الفعلي (Work Orders & Shop Floor)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                صرف خامات التصنيع بـ Transaction آمنة وإيداع المنتج التام في المستودع
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <th className="p-3">رقم أمر التشغيل</th>
                  <th className="p-3">المنتج المراد تصنيعه</th>
                  <th className="p-3">الكمية المستهدفة</th>
                  <th className="p-3">الحالة التشغيلية</th>
                  <th className="p-3">تاريخ البدء / الانتهاء</th>
                  <th className="p-3">التكلفة الفعلية</th>
                  <th className="p-3 text-center">إجراءات الأزرار (Actions)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {workOrders.map((wo) => (
                  <tr key={wo.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3 font-mono font-bold text-sky-700">{wo.orderNumber}</td>
                    <td className="p-3 font-bold text-slate-900">{wo.productNameAr}</td>
                    <td className="p-3 font-mono font-bold">{wo.quantityTarget} دزينة</td>
                    <td className="p-3">
                      {wo.status === 'IN_PROGRESS' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          قيد التشغيل بالمصنع
                        </span>
                      )}
                      {wo.status === 'COMPLETED' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                          مكتمل ومودع بالمخزن
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-mono text-slate-500">{wo.startDate || '-'}</td>
                    <td className="p-3 font-mono font-bold text-slate-900">
                      {wo.actualCost ? `${wo.actualCost.toLocaleString()} ج.م` : 'تحت الاحتساب'}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-2">
                        {wo.status === 'IN_PROGRESS' && (
                          <button
                            onClick={() => handleCompleteProduction(wo.id)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-all"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>إنهاء production.complete</span>
                          </button>
                        )}

                        {wo.status === 'PLANNED' && (
                          <button
                            onClick={() => handleStartProduction(wo.id)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold shadow-xs transition-all"
                          >
                            <Play className="w-3.5 h-3.5" />
                            <span>بدء production.start</span>
                          </button>
                        )}

                        {wo.status === 'COMPLETED' && (
                          <span className="text-[11px] text-slate-500 font-mono">
                            تم الصرف والإيداع ✓
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Costing Recalculation Tab */}
      {activeTab === 'costing' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-indigo-600" />
                <span>محرك احتساب التكلفة الفعلية وفروق التشغيل (Costing Variance Engine)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                مقارنة التكلفة المعيارية (Standard Cost) بالتكلفة الفعلية (Actual Cost) الناتجة عن تذبذب أسعار الخامات
              </p>
            </div>

            <button
              onClick={handleRecalculateCosting}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
            >
              <Calculator className="w-4 h-4" />
              <span>إعادة احتساب التكلفة costing.recalc</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-slate-600">متوسط انحراف تكلفة الخامات (Material Variance)</span>
              <p className="text-2xl font-black text-rose-600 font-mono">+4.8%</p>
              <p className="text-xs text-slate-500">
                ارتفاع أسعار الزبدة الطبيعية بنسبة 5% خلال الشهر الحالي أثر على التكلفة الفعلية لوحدة الكرواسون
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-slate-600">كفاءة العمالة ومصاريف التشغيل (Labor Efficiency)</span>
              <p className="text-2xl font-black text-emerald-600 font-mono">98.2%</p>
              <p className="text-xs text-slate-500">
                ساعات التشغيل متوافقة مع الخطة الزمنية القياسية دون هدر ساعات عمل
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
