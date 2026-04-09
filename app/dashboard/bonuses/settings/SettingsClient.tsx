"use client";

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createBonusBlock, createBonusArticle, deleteBonusArticle, deleteBonusBlock } from '@/app/actions';

export function SettingsClient({ serializedRestaurants, serializedStructure, serializedMetrics, selectedResId }: any) {
  const router = useRouter();
  
  const restaurants = useMemo(() => JSON.parse(serializedRestaurants || "[]"), [serializedRestaurants]);
  const initialStructure = useMemo(() => JSON.parse(serializedStructure || "[]"), [serializedStructure]);
  const metrics = useMemo(() => JSON.parse(serializedMetrics || "[]"), [serializedMetrics]);

  const updateUrl = (id: string | number) => {
    router.push(`/dashboard/bonuses/settings?resId=${id}`);
  };

  return (
    <div className="space-y-8 pb-20 text-gray-900 max-w-[1400px] mx-auto antialiased">
      
      {/* ТАБЫ ПИЦЦЕРИЙ */}
      <div className="flex flex-wrap gap-1 p-1 bg-gray-100/50 rounded-2xl border border-gray-100 w-fit">
        {restaurants.map((res: any) => (
          <button key={res.id} onClick={() => updateUrl(res.id)}
            className={`px-6 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all ${selectedResId === res.id ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
          >
            {res.name}
          </button>
        ))}
      </div>

      {!selectedResId ? (
        <div className="bg-white p-20 rounded-[32px] border border-gray-100 text-center text-gray-400 font-bold uppercase tracking-widest text-[10px]">
          Выберите объект управления
        </div>
      ) : (
        <div className="space-y-10">
          
          {/* ФОРМЫ СБОРКИ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
            <div className="space-y-4">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 ml-1">Создать новый блок</h3>
              <form action={createBonusBlock} className="flex gap-2">
                <input type="hidden" name="restaurantId" value={selectedResId} />
                <input name="name" placeholder="Название (напр. Прибыль)..." className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-blue-400 transition-all text-sm font-bold" required />
                <button className="w-11 h-11 flex items-center justify-center bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-all active:scale-95">+</button>
              </form>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 ml-1">Привязать метрику к блоку</h3>
              <form action={createBonusArticle} className="flex gap-2">
                <select name="metricId" className="flex-1 text-sm font-bold outline-none bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-gray-600 focus:bg-white focus:border-blue-400" required>
                  <option value="">Выберите метрику...</option>
                  {metrics.map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
                <select name="blockId" className="text-sm font-bold outline-none bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-gray-600 focus:bg-white focus:border-blue-400" required>
                  <option value="">В какой блок...</option>
                  {initialStructure.map((block: any) => <option key={block.id} value={block.id}>{block.name}</option>)}
                </select>
                <button className="px-5 h-11 bg-black text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 transition-all active:scale-95">Связать</button>
              </form>
            </div>
          </div>

          {/* СЕТКА БЛОКОВ */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {initialStructure.map((block: any) => (
              <div key={block.id} className="bg-white border border-gray-100 rounded-[32px] shadow-sm flex flex-col overflow-hidden">
                <div className="px-8 py-5 border-b border-gray-50 bg-gray-50/20 flex items-center justify-between">
                  <h4 className="text-sm font-bold uppercase tracking-tight">{block.name}</h4>
                  <div className="flex gap-2 items-center">
                    <div className="w-6 h-6 flex items-center justify-center bg-white border border-gray-200 rounded-full text-[10px] font-bold text-gray-400 shadow-sm">{block.articles.length}</div>
                    <button onClick={async () => { if(confirm('Удалить весь блок?')) await deleteBonusBlock(block.id); }} className="text-gray-300 hover:text-red-500 font-bold ml-2">✕</button>
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  {block.articles.map((art: any) => (
                    <div key={art.id} className="w-full group p-4 flex flex-col text-left transition-all rounded-2xl bg-gray-50/50 border border-transparent hover:bg-white hover:border-gray-100 relative">
                      <div className="flex items-center justify-between w-full pr-6">
                        <span className="text-[13px] font-semibold text-gray-800 group-hover:text-black leading-tight">{art.name}</span>
                        {art.isMaxGoal && <span className="text-[8px] bg-orange-50 text-orange-500 px-1.5 py-0.5 rounded font-black uppercase tracking-tighter shrink-0 ml-2">max</span>}
                      </div>
                      {(art.targetValue || art.minValue) && (
                        <div className="flex gap-4 items-center mt-2.5">
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Цель: <span className="text-gray-900">{art.targetValue}</span></span>
                          {!art.isStrict && <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Мин: <span className="text-gray-900">{art.minValue}</span></span>}
                        </div>
                      )}
                      
                      {/* Удаление статьи из блока */}
                      <button 
                        onClick={async () => { await deleteBonusArticle(art.id); }} 
                        className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 font-bold transition-opacity"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  {block.articles.length === 0 && (
                    <div className="text-center p-6 text-[10px] font-bold uppercase tracking-widest text-gray-300">
                      В блоке нет метрик
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}