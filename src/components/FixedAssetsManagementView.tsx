import React, { useState } from 'react';
import { TenantContext, UserRole, FixedAssetRecord } from '../types.ts';
import { INITIAL_FIXED_ASSETS } from '../data/mockCrmAndOperationsData.ts';
import { 
  Cpu, 
  Plus, 
  Search, 
  Pencil, 
  Wrench, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Activity, 
  DollarSign, 
  Layers, 
  X, 
  Database,
  Calendar,
  Zap,
  BarChart3,
  Sparkles
} from 'lucide-react';

interface FixedAssetsManagementViewProps {
  currentTenant: TenantContext;
  userRole: UserRole;
  onNavigateToSessions?: (assetId: string) => void;
}

export const FixedAssetsManagementView: React.FC<FixedAssetsManagementViewProps> = ({
  currentTenant,
  userRole,
  onNavigateToSessions
}) => {
  const [assets, setAssets] = useState<FixedAssetRecord[]>(INITIAL_FIXED_ASSETS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState<FixedAssetRecord | null>(null);
  const [maintenanceAsset, setMaintenanceAsset] = useState<FixedAssetRecord | null>(null);
  const [maintenanceNotes, setMaintenanceNotes] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<FixedAssetRecord>>({
    assetCode: `AST-DEV-0${assets.length + 5}`,
    assetName: '',
    category: 'أجهزة ليزر وتجميل',
    purchaseDate: new Date().toISOString().split('T')[0],
    purchaseCost: 350000,
    usefulLifeMonths: 48,
    currentBookValue: 350000,
    accumulatedDepreciation: 0,
    branch: currentTenant.branch || 'HRG-MAIN',
    deviceUsageTracker: {
      totalOperatingHours: 0,
      totalSessionsExecuted: 0,
      maxRatedLifespanHours: 4000,
      wearPercentage: 0,
      lastMaintenanceDate: new Date().toISOString().split('T')[0],
      nextMaintenanceDueHours: 1000,
      status: 'ممتاز وعامل'
    }
  });

  const handleShowNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3500);
  };

  const handleAddAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.assetName || !formData.purchaseCost) return;

    const cost = Number(formData.purchaseCost) || 0;
    const maxHours = Number(formData.deviceUsageTracker?.maxRatedLifespanHours) || 4000;

    const newAst: FixedAssetRecord = {
      id: `asset-${Date.now()}`,
      assetCode: formData.assetCode || `AST-DEV-0${assets.length + 5}`,
      assetName: formData.assetName,
      category: (formData.category as any) || 'أجهزة ليزر وتجميل',
      purchaseDate: formData.purchaseDate || new Date().toISOString().split('T')[0],
      purchaseCost: cost,
      usefulLifeMonths: Number(formData.usefulLifeMonths) || 48,
      currentBookValue: cost,
      accumulatedDepreciation: 0,
      branch: formData.branch || currentTenant.branch || 'HRG-MAIN',
      deviceUsageTracker: {
        totalOperatingHours: Number(formData.deviceUsageTracker?.totalOperatingHours) || 0,
        totalSessionsExecuted: 0,
        maxRatedLifespanHours: maxHours,
        wearPercentage: 0,
        lastMaintenanceDate: new Date().toISOString().split('T')[0],
        nextMaintenanceDueHours: 1000,
        status: 'ممتاز وعامل'
      }
    };

    setAssets([newAst, ...assets]);
    setShowAddModal(false);
    handleShowNotice(`تمت إضافة الأصل الثابت (${newAst.assetName}) وتفعيل عمود متابعة استهلاك الجهاز بنجاح!`);
  };

  const handleRunDepreciation = (assetId: string) => {
    setAssets(assets.map(a => {
      if (a.id !== assetId) return a;
      const monthlyDepr = Math.round(a.purchaseCost / a.usefulLifeMonths);
      const newAcc = Math.min(a.purchaseCost, a.accumulatedDepreciation + monthlyDepr);
      const newBook = Math.max(0, a.purchaseCost - newAcc);
      return {
        ...a,
        accumulatedDepreciation: newAcc,
        currentBookValue: newBook
      };
    }));
    const target = assets.find(a => a.id === assetId);
    handleShowNotice(`تم احتساب قيد إهلاك شهر جديد للجهاز (${target?.assetName}) وتوليد القيد المحاسبي المرتبط آلياً!`);
  };

  const handleLogMaintenance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!maintenanceAsset) return;

    setAssets(assets.map(a => {
      if (a.id !== maintenanceAsset.id) return a;
      return {
        ...a,
        deviceUsageTracker: {
          ...a.deviceUsageTracker,
          lastMaintenanceDate: new Date().toISOString().split('T')[0],
          nextMaintenanceDueHours: a.deviceUsageTracker.totalOperatingHours + 1000,
          status: 'ممتاز وعامل'
        }
      };
    }));

    handleShowNotice(`تم توثيق صيانة ومعايرة الجهاز (${maintenanceAsset.assetName}) وتصفير مؤشر الصيانة.`);
    setMaintenanceAsset(null);
    setMaintenanceNotes('');
  };

  const filteredAssets = assets.filter(a => {
    const matchesSearch = 
      a.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.assetCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.category.includes(searchQuery);
    
    const matchesCategory = selectedCategory === 'all' || a.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalCost = assets.reduce((sum, a) => sum + a.purchaseCost, 0);
  const totalBookValue = assets.reduce((sum, a) => sum + a.currentBookValue, 0);
  const totalOperatingHoursAll = assets.reduce((sum, a) => sum + a.deviceUsageTracker.totalOperatingHours, 0);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold border border-amber-200 mb-2">
            <Database className="w-3.5 h-3.5 text-amber-600" />
            <span>جدول مستقل في قاعدة البيانات: accounting.fixed_assets</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 font-['Cairo'] flex items-center gap-2">
            <Cpu className="w-6 h-6 text-amber-600" />
            <span>شاشة إدارة الأصول الثابتة وتتبع استهلاك الأجهزة (Device Wear Tracking)</span>
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            إدارة متخصصة للأصول والمعدات الطبية والتجميلية، مع <strong className="text-amber-800">عمود مخصص لمتابعة استهلاك ساعات تشغيل الجهاز</strong> وعدد الجلسات والإهلاك الدوري.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة أصل / جهاز جديد</span>
        </button>
      </div>

      {notice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-bold">إجمالي الأصول والأجهزة</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2 font-mono">{assets.length}</p>
          <span className="text-[11px] text-slate-500">أجهزة ليزر، فحص، وكاشير</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-bold">القيمة التاريخية للشراء</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2 font-mono">
            {totalCost.toLocaleString()} <span className="text-xs font-normal">ج.م</span>
          </p>
          <span className="text-[11px] text-slate-500">تكلفة الأصول الرأسمالية</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-bold">صافي القيمة الدفترية الحالية</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-700 mt-2 font-mono">
            {totalBookValue.toLocaleString()} <span className="text-xs font-normal">ج.م</span>
          </p>
          <span className="text-[11px] text-emerald-600 font-medium">بعد خصم مجمع الإهلاك</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-bold">ساعات تشغيل الأجهزة الإجمالية</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-sky-700 mt-2 font-mono">
            {totalOperatingHoursAll.toLocaleString()} <span className="text-xs font-normal">ساعة</span>
          </p>
          <span className="text-[11px] text-sky-600 font-medium">استهلاك فعلي مسجل من الجلسات</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex-1 min-w-[260px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
          <input
            type="text"
            placeholder="بحث باسم الجهاز، كود الأصل، أو تصنيف المعدات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
        >
          <option value="all">كل تصنيفات الأصول</option>
          <option value="أجهزة ليزر وتجميل">أجهزة ليزر وتجميل</option>
          <option value="أجهزة فحص وكشف">أجهزة فحص وكشف</option>
          <option value="نقاط بيع وحواسب">نقاط بيع وحواسب</option>
          <option value="سيارات ومعدات نقل">سيارات ومعدات نقل</option>
          <option value="أثاث وديكورات">أثاث وديكورات</option>
        </select>
      </div>

      {/* Assets Table with Dedicated Device Consumption Column */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <span>سجل الأصول الثابتة ({filteredAssets.length})</span>
            <span className="text-[10px] font-mono bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
              accounting.fixed_assets
            </span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <th className="p-3">كود الأصل / الجهاز</th>
                <th className="p-3">التصنيف والفرع</th>
                <th className="p-3">تاريخ وتكلفة الشراء</th>
                <th className="p-3">الدفترية ومجمع الإهلاك</th>
                {/* DEDICATED COLUMN REQUESTED BY USER */}
                <th className="p-3 bg-amber-50/70 border-x border-amber-200 text-amber-900 font-black">
                  عمود متابعة استهلاك الجهاز (ساعات التشغيل والجلسات)
                </th>
                <th className="p-3 text-center">إجراءات الصيانة والإهلاك</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAssets.map(asset => {
                const tracker = asset.deviceUsageTracker;
                const isMaintenanceDue = tracker.totalOperatingHours >= tracker.nextMaintenanceDueHours;

                return (
                  <tr key={asset.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          {asset.assetCode}
                        </span>
                        <div>
                          <div className="font-extrabold text-slate-900">{asset.assetName}</div>
                          <span className="text-[10px] text-slate-400 font-mono">عمر افتراضي: {asset.usefulLifeMonths} شهر</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-3 text-[11px]">
                      <span className="font-bold text-slate-800 block">{asset.category}</span>
                      <span className="font-mono text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded mt-0.5 inline-block">
                        {asset.branch}
                      </span>
                    </td>

                    <td className="p-3 font-mono text-[11px]">
                      <div className="font-bold text-slate-900">{asset.purchaseCost.toLocaleString()} ج.م</div>
                      <div className="text-slate-400 text-[10px]">الشراء: {asset.purchaseDate}</div>
                    </td>

                    <td className="p-3 font-mono text-[11px]">
                      <div className="font-bold text-emerald-700">صافي: {asset.currentBookValue.toLocaleString()} ج.م</div>
                      <div className="text-rose-600 text-[10px]">مجمع الإهلاك: {asset.accumulatedDepreciation.toLocaleString()} ج.م</div>
                    </td>

                    {/* DEDICATED COLUMN FOR DEVICE CONSUMPTION TRACKING */}
                    <td className="p-3 bg-amber-50/40 border-x border-amber-100 text-xs">
                      <div className="space-y-1.5 min-w-[240px]">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="font-bold text-slate-800 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            <span>ساعات التشغيل الفعلية:</span>
                          </span>
                          <span className="font-mono font-bold text-amber-900">
                            {tracker.totalOperatingHours.toFixed(1)} / {tracker.maxRatedLifespanHours} س
                          </span>
                        </div>

                        {/* Progress bar of device wear */}
                        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all ${
                              tracker.wearPercentage > 70 ? 'bg-rose-500' :
                              tracker.wearPercentage > 40 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(100, tracker.wearPercentage)}%` }}
                          />
                        </div>

                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-slate-600 font-medium">
                            عدد الجلسات المنفذة: <strong className="text-slate-900 font-mono font-bold">{tracker.totalSessionsExecuted.toLocaleString()}</strong>
                          </span>
                          <span className="font-bold font-mono text-slate-700">
                            استهلاك: {tracker.wearPercentage}%
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-amber-200/50 text-[10px]">
                          <span className={`px-2 py-0.2 rounded font-bold ${
                            tracker.status === 'ممتاز وعامل'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {tracker.status}
                          </span>
                          <span className="text-slate-500 font-mono">
                            آخر صيانة: {tracker.lastMaintenanceDate}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="p-3">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleRunDepreciation(asset.id)}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-[11px] font-bold transition-all"
                          title="احتساب إهلاك شهر وتوليد القيد"
                        >
                          <Zap className="w-3 h-3 text-indigo-600" />
                          <span>إهلاك</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setMaintenanceAsset(asset)}
                          className="p-1.5 rounded-lg border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 transition-all"
                          title="تسجيل صيانة ومعايرة للجهاز"
                        >
                          <Wrench className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Asset Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form onSubmit={handleAddAsset} className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-amber-600" />
                <span>إضافة أصل / جهاز تشغيل جديد (accounting.fixed_assets)</span>
              </h3>
              <button type="button" onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">كود الأصل *</label>
                <input
                  type="text"
                  required
                  value={formData.assetCode}
                  onChange={(e) => setFormData({ ...formData, assetCode: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono uppercase"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم الجهاز أو الأصل *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: جهاز ليزر دايود سوبرانو تيتانيوم"
                  value={formData.assetName}
                  onChange={(e) => setFormData({ ...formData, assetName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">التصنيف *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                >
                  <option value="أجهزة ليزر وتجميل">أجهزة ليزر وتجميل</option>
                  <option value="أجهزة فحص وكشف">أجهزة فحص وكشف</option>
                  <option value="نقاط بيع وحواسب">نقاط بيع وحواسب</option>
                  <option value="سيارات ومعدات نقل">سيارات ومعدات نقل</option>
                  <option value="أثاث وديكورات">أثاث وديكورات</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">تكلفة الشراء الأصلية (ج.م) *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.purchaseCost}
                  onChange={(e) => setFormData({ ...formData, purchaseCost: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">تاريخ الشراء والتشغيل</label>
                <input
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">العمر الإنتاجي (بالأشهر)</label>
                <input
                  type="number"
                  min="1"
                  value={formData.usefulLifeMonths}
                  onChange={(e) => setFormData({ ...formData, usefulLifeMonths: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <div className="md:col-span-2 p-3 bg-amber-50 rounded-xl border border-amber-200">
                <span className="font-bold text-amber-900 block mb-2 text-xs">
                  إعدادات عمود متابعة استهلاك الجهاز:
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">الحد الأقصى لساعات تشغيل الجهاز</label>
                    <input
                      type="number"
                      placeholder="e.g. 5000"
                      value={formData.deviceUsageTracker?.maxRatedLifespanHours}
                      onChange={(e) => setFormData({
                        ...formData,
                        deviceUsageTracker: {
                          ...formData.deviceUsageTracker!,
                          maxRatedLifespanHours: Number(e.target.value)
                        }
                      })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">ساعات التشغيل المبدئية المسجلة</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={formData.deviceUsageTracker?.totalOperatingHours}
                      onChange={(e) => setFormData({
                        ...formData,
                        deviceUsageTracker: {
                          ...formData.deviceUsageTracker!,
                          totalOperatingHours: Number(e.target.value)
                        }
                      })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-600/20"
              >
                حفظ الأصل وتفعيل العداد
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Log Maintenance Modal */}
      {maintenanceAsset && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form onSubmit={handleLogMaintenance} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-amber-600" />
                <span>توثيق صيانة ومعايرة: {maintenanceAsset.assetName}</span>
              </h3>
              <button type="button" onClick={() => setMaintenanceAsset(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-xs">
              <div>كود الجهاز: <strong className="font-mono">{maintenanceAsset.assetCode}</strong></div>
              <div>ساعات التشغيل الحالية: <strong className="font-mono text-amber-800">{maintenanceAsset.deviceUsageTracker.totalOperatingHours} ساعة</strong></div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">تقرير المهندس / الأعمال المنفذة</label>
              <textarea
                rows={3}
                required
                placeholder="تغيير رأس الليزر، فحص نظام التبريد السائل، المعايرة الدقيقة..."
                value={maintenanceNotes}
                onChange={(e) => setMaintenanceNotes(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setMaintenanceAsset(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                تأكيد الصيانة وتصفير التنبيه
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
