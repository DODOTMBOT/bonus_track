"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ExecutionClient({ restaurants, selectedResId, structure }: any) {
  const router = useRouter();
  const [actuals, setActuals] = useState<Record<number, string>>({});

  const handleActualChange = (id: number, val: string) => {
    setActuals(prev => ({ ...prev, [id]: val }));
  };

  const handleTabChange = (id: number) => {
    router.push(`/dashboard/bonuses/execution?resId=${id}`);
  };

  // Функция расчета статуса выполнения
  const getStatus = (art: any, actual: string) => {
    if (!actual) return { label: 'Ожидание', color: 'bg-gray-100 text-gray-400' };

    // Парсим значения для корректного сравнения (убираем двоеточия для времени и пробелы)
    const parse = (v: any) => parseFloat(String(v || "0").replace(/:/g, '').replace(/\s/g, '')) || 0;
    
    const fact = parse(actual);
    const target = parse(art.targetValue);
    const min = parse(art.minValue);

    // Логика "Чем меньше, тем лучше" (например, время или жалобы)
    if (art.isMaxGoal) {
      if (fact <= target) return { label: 'Выполнено', color: 'bg-green-100 text-green-600' };
      if (!art.isStrict && fact <= min) return { label: 'Минимум', color: 'bg-orange-100 text-orange-600' };
      return { label: 'Провал', color: 'bg-red-100 text-red-600' };
    }

    // Логика "Чем больше, тем лучше" (стандартные показатели)
    if (fact >= target) return { label: 'Выполнено', color: 'bg-green-100 text-green-600' };
    if (!art.isStrict && fact >= min) return { label: 'Минимум', color: 'bg-orange-100 text-orange-600' };
    return { label: 'Провал', color: 'bg-red-100 text-red-600' };
  };

  return (
    <div className="space-y-8 text-gray-900 pb-20 max-w-[1400px] mx-auto antialiased">
      
      {/* ТАБЫ ВЫБОРА ОБЪЕКТА */}
      <div className="flex gap-1 p-1 bg-gray-100/50 rounded-2xl border border-gray-100 w-fit">
        {restaurants.map((res: any) => (
          <button key={res.id} onClick={() => handleTabChange(res.id)}
            className={`px-6 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all ${
              selectedResId === res.id ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-gray-600'
            }`}
          > {res.name} </button>
        ))}
      </div>

      {/* СЕТКА БЛОКОВ KPI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {structure.map((block: any) => (
          <div key={block.id} className="bg-white border border-gray-100 rounded-[32px] flex flex-col shadow-sm overflow-hidden">
            {/* Шапка блока */}
            <div className="px-8 py-5 border-b border-gray-50 flex justify-between items-center bg-gray-50/20">
              <h4 className="text-sm font-bold uppercase tracking-tight text-gray-900">{block.name}</h4>
              <span className="text-[9px] font-black text-gray-400 uppercase bg-white px-2 py-1 rounded-lg border border-gray-100 shadow-sm tracking-widest">
                Вес: {block.weight || 0}%
              </span>
            </div>

            <div className="p-8 space-y-10">
              {block.articles.map((art: any) => {
                const status = getStatus(art, actuals[art.id]);
                return (
                  <div key={art.id} className="space-y-3">
                    {/* Инфо по статье */}
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <span className="text-[13px] font-semibold text-gray-800 block">{art.name}</span>
                        <div className="flex gap-3 items-center">
                          <span className="text-[10px] text-gray-400 font-bold uppercase">Цель: <span className="text-gray-700">{art.targetValue}</span></span>
                          {!art.isStrict && (
                            <span className="text-[10px] text-gray-400 font-bold uppercase">Мин: <span className="text-gray-700">{art.minValue}</span></span>
                          )}
                        </div>
                      </div>
                      {/* Бейдж статуса */}
                      <span className={`px-2 py-0.5 rounded-[6px] text-[8px] font-black uppercase tracking-tighter ${status.color}`}>
                        {status.label}
                      </span>
                    </div>

                    {/* Поле ввода факта */}
                    <div className="relative group">
                      <input 
                        type="text"
                        placeholder="Введите факт..."
                        value={actuals[art.id] || ''}
                        onChange={(e) => handleActualChange(art.id, e.target.value)}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:bg-white focus:border-blue-400 outline-none transition-all placeholder:text-gray-300"
                      />
                      {art.valueFormat === 'percent' && (
                        <span className="absolute right-4 top-3 text-gray-300 font-bold text-sm">%</span>
                      )}
                    </div>
                  </div>
                );
              })}
              
              {block.articles.length === 0 && (
                <div className="py-10 text-center text-gray-300 font-medium text-xs italic uppercase tracking-widest">
                  Нет настроенных показателей
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}