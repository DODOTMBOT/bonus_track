"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { updateMetricTargetValues } from '@/app/actions';
import { motion, AnimatePresence } from 'framer-motion';

export function TargetsClient({ serializedRestaurants, selectedResId, serializedMetrics, serializedTargets }: any) {
  const router = useRouter();
  
  const restaurants = useMemo(() => JSON.parse(serializedRestaurants || "[]"), [serializedRestaurants]);
  const metrics = useMemo(() => JSON.parse(serializedMetrics || "[]"), [serializedMetrics]);
  const targetsData = useMemo(() => JSON.parse(serializedTargets || "[]"), [serializedTargets]);

  const [selectedMetric, setSelectedMetric] = useState<any>(null);
  const [tempFormat, setTempFormat] = useState<string>('');
  const [isStrict, setIsStrict] = useState(false);
  const [isMaxGoal, setIsMaxGoal] = useState(false);

  useEffect(() => {
    if (selectedMetric) {
      const target = targetsData.find((t: any) => t.metricId === selectedMetric.id) || {};
      setTempFormat(target.valueFormat || 'decimal');
      setIsStrict(target.isStrict || false);
      setIsMaxGoal(target.isMaxGoal || false);
    }
  }, [selectedMetric, targetsData]);

  const formats = [
    { id: 'date', label: 'Дата', ex: '01.01' },
    { id: 'decimal', label: 'Числа', ex: '4,90' },
    { id: 'time', label: 'Время', ex: '00:35' },
    { id: 'currency', label: 'Деньги', ex: '1 450 ₽' },
    { id: 'percent', label: 'Проценты', ex: '90%' },
  ];

  const handleTabChange = (id: number) => {
    router.push(`/dashboard/metrics/targets?resId=${id}`);
  };

  const DynamicInput = ({ name, defaultValue }: { name: string, defaultValue: string }) => {
    const baseClass = "w-full bg-gray-50 border border-gray-100 focus:border-blue-400 focus:bg-white rounded-xl px-4 py-3 text-sm font-bold outline-none transition-all text-gray-900";
    const typeMap: any = { date: 'date', decimal: 'number', time: 'time' };
    return (
      <div className="relative">
        <input name={name} type={typeMap[tempFormat] || 'text'} defaultValue={defaultValue} className={baseClass} placeholder="0" />
        {(tempFormat === 'currency' || tempFormat === 'percent') && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">
            {tempFormat === 'currency' ? '₽' : '%'}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8 text-gray-900 pb-20">
      
      <div className="flex flex-wrap gap-1 p-1 bg-gray-100/50 rounded-2xl border border-gray-100 w-fit">
        {restaurants.map((res: any) => (
          <button key={res.id} onClick={() => handleTabChange(res.id)}
            className={`px-6 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all ${selectedResId === res.id ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
          > {res.name} </button>
        ))}
      </div>

      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden p-8">
        {metrics.length === 0 ? (
          <div className="py-10 text-center text-gray-300 font-medium text-xs italic uppercase tracking-widest">
            Нет метрик. Создайте их в разделе "Метрики".
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {metrics.map((m: any) => {
              const target = targetsData.find((t: any) => t.metricId === m.id) || {};
              return (
                <button key={m.id} onClick={() => setSelectedMetric(m)} className="bg-gray-50/50 p-6 rounded-[24px] border border-gray-100 space-y-3 shadow-sm hover:shadow-md transition-all text-left group">
                  <span className="text-[13px] font-bold text-gray-800 block group-hover:text-blue-600 transition-colors leading-tight">{m.name}</span>
                  
                  <div className="flex flex-wrap gap-4 mt-2">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Цель</span>
                      <span className="text-sm font-black text-gray-900">{target.targetValue || "—"}</span>
                    </div>
                    {!target.isStrict && (
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Мин</span>
                        <span className="text-sm font-black text-gray-900">{target.minValue || "—"}</span>
                      </div>
                    )}
                  </div>
                  {target.isMaxGoal && <span className="inline-block mt-2 text-[8px] bg-orange-50 text-orange-500 px-2 py-1 rounded font-black uppercase tracking-tighter">Чем меньше, тем лучше (max)</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* МОДАЛКА НАСТРОЙКИ */}
      <AnimatePresence>
        {selectedMetric && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 text-gray-900">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedMetric(null)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }} className="relative w-full max-w-lg bg-white rounded-[32px] p-10 shadow-2xl">
              <form action={async (formData) => { await updateMetricTargetValues(formData); setSelectedMetric(null); }} className="space-y-8">
                <input type="hidden" name="restaurantId" value={selectedResId} />
                <input type="hidden" name="metricId" value={selectedMetric.id} />
                
                <header className="text-center sm:text-left">
                  <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold mb-1">Настройка показателя</p>
                  <h3 className="text-2xl font-black tracking-tighter text-gray-900 leading-tight">{selectedMetric.name}</h3>
                </header>

                <div className="grid grid-cols-3 gap-2">
                  {formats.map((fmt) => (
                    <label key={fmt.id} className="cursor-pointer">
                      <input type="radio" name="valueFormat" value={fmt.id} className="peer sr-only" checked={tempFormat === fmt.id} onChange={(e) => setTempFormat(e.target.value)} />
                      <div className="py-2.5 rounded-xl border border-gray-100 text-[10px] font-bold text-center text-gray-400 peer-checked:border-blue-600 peer-checked:bg-blue-600 peer-checked:text-white transition-all uppercase tracking-tighter shadow-sm">{fmt.label}</div>
                    </label>
                  ))}
                </div>

                <div className="p-1 bg-gray-50 rounded-xl flex border border-gray-100">
                  <button type="button" onClick={() => setIsStrict(false)} className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${!isStrict ? 'bg-white shadow-sm text-black' : 'text-gray-400 hover:text-gray-600'}`}>С минимумом</button>
                  <button type="button" onClick={() => setIsStrict(true)} className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${isStrict ? 'bg-white shadow-sm text-black' : 'text-gray-400 hover:text-gray-600'}`}>Строго 100%</button>
                  <input type="hidden" name="isStrict" value={String(isStrict)} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2 sm:col-span-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Целевое значение</span>
                    <DynamicInput name="targetValue" defaultValue={targetsData.find((t: any) => t.metricId === selectedMetric.id)?.targetValue || ""} />
                  </div>
                  <AnimatePresence mode="wait">
                    {!isStrict && (
                      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-2 col-span-2 sm:col-span-1">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Минимальное (порог)</span>
                        <DynamicInput name="minValue" defaultValue={targetsData.find((t: any) => t.metricId === selectedMetric.id)?.minValue || ""} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex items-center justify-between p-5 bg-gray-50/50 border border-gray-100 rounded-2xl">
                  <div className="flex flex-col">
                    <span className="text-[13px] font-bold text-gray-900">Направление цели</span>
                    <span className="text-[10px] text-gray-500 uppercase font-bold mt-0.5">{isMaxGoal ? "Чем меньше, тем лучше" : "Чем больше, тем лучше"}</span>
                  </div>
                  <button type="button" onClick={() => setIsMaxGoal(!isMaxGoal)} className={`w-14 h-7 rounded-full transition-colors relative shadow-inner border border-transparent ${isMaxGoal ? 'bg-blue-600' : 'bg-gray-300'}`}>
                    <motion.div animate={{ x: isMaxGoal ? 30 : 4 }} className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm" />
                  </button>
                  <input type="hidden" name="isMaxGoal" value={String(isMaxGoal)} />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setSelectedMetric(null)} className="flex-1 py-4 text-[11px] font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-all">Отмена</button>
                  <button type="submit" className="flex-1 py-4 bg-black text-white rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all hover:bg-gray-800 active:scale-[0.98] shadow-lg shadow-black/10">Сохранить</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}