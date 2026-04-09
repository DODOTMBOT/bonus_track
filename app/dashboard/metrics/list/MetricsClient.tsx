"use client";

import { useMemo } from 'react';
import { createMetric, deleteMetric, updateMetric } from '@/app/actions';

export function MetricsClient({ serializedMetrics }: { serializedMetrics: string }) {
  const metrics = useMemo(() => JSON.parse(serializedMetrics || "[]"), [serializedMetrics]);

  const handleUpdate = async (id: number, name: string) => {
    await updateMetric(id, name);
  };

  return (
    <div className="space-y-8">
      {/* Форма создания */}
      <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex items-center gap-4">
        <form action={createMetric} className="flex w-full gap-4 items-center">
          <input 
            name="name" 
            placeholder="Название новой метрики..." 
            className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:bg-white focus:border-blue-400 outline-none transition-all placeholder:text-gray-300"
            required
          />
          <button type="submit" className="px-8 py-4 bg-black text-white rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all hover:bg-gray-800 active:scale-95">
            Создать
          </button>
        </form>
      </div>

      {/* Список метрик */}
      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden p-3">
        {metrics.length === 0 ? (
           <div className="py-10 text-center text-gray-300 font-medium text-xs italic uppercase tracking-widest">
             Пока нет созданных метрик
           </div>
        ) : (
          <div className="space-y-2">
            {metrics.map((m: any) => (
              <div key={m.id} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-[24px] border border-gray-100 hover:bg-white hover:shadow-sm transition-all group">
                <input 
                  defaultValue={m.name}
                  onBlur={(e) => handleUpdate(m.id, e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none font-bold text-gray-900 px-2"
                />
                <button 
                  onClick={async () => {
                    if (confirm('Удалить метрику?')) await deleteMetric(m.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 px-4 py-2 text-red-500 font-bold text-[10px] uppercase tracking-widest hover:bg-red-50 rounded-xl transition-all"
                >
                  Удалить
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}