"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { saveMetricTarget } from '@/app/actions';

export function TargetsClient({ serializedRestaurants, selectedResId, serializedMetrics, serializedTargets }: any) {
  const router = useRouter();
  
  const restaurants = useMemo(() => JSON.parse(serializedRestaurants || "[]"), [serializedRestaurants]);
  const metrics = useMemo(() => JSON.parse(serializedMetrics || "[]"), [serializedMetrics]);
  const targetsData = useMemo(() => JSON.parse(serializedTargets || "[]"), [serializedTargets]);

  const [localTargets, setLocalTargets] = useState<Record<number, string>>({});

  useEffect(() => {
    const map: Record<number, string> = {};
    targetsData.forEach((t: any) => { map[t.metricId] = t.value; });
    setLocalTargets(map);
  }, [targetsData]);

  const handleTabChange = (id: number) => {
    router.push(`/dashboard/metrics/targets?resId=${id}`);
  };

  const handleBlur = async (metricId: number) => {
    const val = localTargets[metricId] || "";
    await saveMetricTarget(Number(selectedResId), metricId, val);
  };

  return (
    <div className="space-y-8 text-gray-900 pb-20">
      {/* ТАБЫ */}
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
            {metrics.map((m: any) => (
              <div key={m.id} className="bg-gray-50/50 p-6 rounded-[24px] border border-gray-100 space-y-4 shadow-sm hover:shadow-md transition-all">
                <span className="text-[13px] font-bold text-gray-800">{m.name}</span>
                <input 
                  type="text" 
                  placeholder="Целевое значение..." 
                  value={localTargets[m.id] || ''}
                  onChange={(e) => setLocalTargets(prev => ({...prev, [m.id]: e.target.value}))}
                  onBlur={() => handleBlur(m.id)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold focus:border-blue-400 outline-none transition-all placeholder:text-gray-300"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}