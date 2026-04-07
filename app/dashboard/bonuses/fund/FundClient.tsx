"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { setActiveFundRule, updateBlockWeight, updateArticleWeight } from '@/app/actions';
import { motion, AnimatePresence } from 'framer-motion';

export default function FundClient({ restaurants, selectedResId, fundRules, structure }: any) {
  const router = useRouter();
  const [localBlockWeights, setLocalBlockWeights] = useState<Record<number, number>>({});
  const [localArticleWeights, setLocalArticleWeights] = useState<Record<number, number>>({});

  useEffect(() => {
    const bWeights: Record<number, number> = {};
    const aWeights: Record<number, number> = {};
    structure.forEach((block: any) => {
      bWeights[block.id] = block.weight || 0;
      block.articles.forEach((art: any) => { aWeights[art.id] = art.weight || 0; });
    });
    setLocalBlockWeights(bWeights);
    setLocalArticleWeights(aWeights);
  }, [structure]);

  const activeRes = restaurants.find((r: any) => r.id === selectedResId);
  const activeRuleId = activeRes?.activeFundRuleId;
  const selectedRule = fundRules.find((r: any) => r.id === activeRuleId);
  const totalFundAmount = selectedRule ? (selectedRule.baseValue * (selectedRule.percent / 100)) : 0;

  const totalBlockWeight = Object.values(localBlockWeights).reduce((sum, w) => sum + w, 0);
  const isBlockError = totalBlockWeight !== 100;

  const formatDisplay = (val: any) => {
    if (!val && val !== 0) return "0";
    return Math.round(val).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  // ИСПРАВЛЕННАЯ ФУНКЦИЯ РАСПРЕДЕЛЕНИЯ ПОРОВНУ
  const distributeEqually = async (block: any) => {
    const count = block.articles.length;
    if (count === 0) return;

    const newWeights = { ...localArticleWeights };
    // Базовый вес с одним знаком после запятой (например, 33.3)
    const baseWeight = Math.floor((100 / count) * 10) / 10;
    let currentTotal = 0;

    for (let i = 0; i < count; i++) {
      const art = block.articles[i];
      let finalWeight: number;

      if (i === count - 1) {
        // Последней статье отдаем всё, что осталось до 100
        finalWeight = Math.round((100 - currentTotal) * 10) / 10;
      } else {
        finalWeight = baseWeight;
        currentTotal += baseWeight;
      }

      newWeights[art.id] = finalWeight;
      await updateArticleWeight(art.id, finalWeight);
    }

    setLocalArticleWeights(newWeights);
  };

  return (
    <div className="space-y-8 text-gray-900 pb-20 max-w-[1400px] mx-auto antialiased">
      
      {/* 1. ТАБЫ */}
      <div className="flex gap-1 p-1 bg-gray-100/50 rounded-2xl border border-gray-100 w-fit">
        {restaurants.map((res: any) => (
          <button key={res.id} onClick={() => router.push(`/dashboard/bonuses/fund?resId=${res.id}`)}
            className={`px-6 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all ${selectedResId === res.id ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
          > {res.name} </button>
        ))}
      </div>

      {/* 2. СЕТКА ФОНДА */}
      <section className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-8 py-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/20">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">База расчета фонда</span>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Итого фонд:</span>
            <span className="text-sm font-bold text-blue-600">{formatDisplay(totalFundAmount)} ₽</span>
          </div>
        </div>
        <table className="w-full text-left border-collapse">
          <tbody className="divide-y divide-gray-50 text-[12px]">
            {fundRules.map((rule: any) => {
              const isSelected = activeRuleId === rule.id;
              return (
                <tr key={rule.id} onClick={() => setActiveFundRule(selectedResId, rule.id)} className={`cursor-pointer transition-all ${isSelected ? 'bg-blue-50/30' : 'hover:bg-gray-50/20'}`}>
                  <td className="px-8 py-3.5 w-12 text-center">
                    <div className={`w-4 h-4 rounded-full border-2 mx-auto flex items-center justify-center transition-all ${isSelected ? 'border-blue-600 bg-blue-600' : 'border-gray-200'}`}>
                      {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </div>
                  </td>
                  <td className="px-6 py-3.5 italic text-gray-500 font-medium uppercase text-[10px] tracking-widest">{rule.condition} {formatDisplay(rule.threshold)}</td>
                  <td className="px-6 py-3.5 text-center text-blue-600 font-bold">{rule.percent}%</td>
                  <td className="px-8 py-3.5 text-right font-bold text-gray-900">{formatDisplay(rule.baseValue * (rule.percent / 100))} ₽</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      {/* 3. БЛОКИ KPI */}
      <section className="space-y-6">
        <div className="flex justify-between items-center px-1">
           <h3 className="font-bold uppercase text-[11px] tracking-[0.2em] text-gray-400 italic">Распределение по статьям</h3>
           <AnimatePresence>
            {isBlockError && (
              <motion.span initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-[9px] font-bold text-red-500 bg-red-50 px-3 py-1 rounded-lg border border-red-100 uppercase tracking-widest">
                Сумма блоков: {totalBlockWeight}%
              </motion.span>
            )}
           </AnimatePresence>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {structure.map((block: any) => {
            const bWeight = localBlockWeights[block.id] || 0;
            const bMoney = (totalFundAmount * bWeight) / 100;
            
            // Расчет суммы с округлением до 1 знака (чтобы не было хвоста из 999999)
            const articlesSum = Math.round(block.articles.reduce((sum: number, a: any) => sum + (localArticleWeights[a.id] || 0), 0) * 10) / 10;
            const isArtError = articlesSum !== 100 && block.articles.length > 0;

            return (
              <div key={block.id} className={`bg-white border rounded-[32px] transition-all duration-500 flex flex-col shadow-sm ${isArtError ? 'border-red-200 ring-4 ring-red-50/50' : 'border-gray-100'}`}>
                {/* Header Блока */}
                <div className="px-8 py-6 flex justify-between items-center">
                  <h4 className="text-[13px] font-bold uppercase tracking-wider text-gray-900">{block.name}</h4>
                  <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-1.5 border border-gray-100 focus-within:bg-white focus-within:border-blue-200 transition-all">
                    <input type="text" value={bWeight} onChange={(e) => setLocalBlockWeights({...localBlockWeights, [block.id]: parseFloat(e.target.value) || 0})}
                      onBlur={() => updateBlockWeight(block.id, bWeight)} className="w-8 text-center font-bold text-sm bg-transparent outline-none" />
                    <span className="text-[10px] font-bold text-gray-300">%</span>
                  </div>
                </div>

                <div className="px-8 pb-8 space-y-6">
                  {/* Бюджет блока */}
                  <div className={`flex justify-between items-center px-4 py-3 rounded-2xl transition-colors ${isArtError ? 'bg-red-50 text-red-600' : 'bg-blue-50/50 text-blue-600'}`}>
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Бюджет блока</span>
                    <span className="text-base font-bold tracking-tight">{formatDisplay(bMoney)} ₽</span>
                  </div>

                  {/* Статьи */}
                  <div className="space-y-6">
                    {block.articles.map((art: any) => {
                      const aWeight = localArticleWeights[art.id] || 0;
                      const aMoney = (bMoney * aWeight) / 100;
                      return (
                        <div key={art.id} className="space-y-3">
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <span className="text-[13px] font-semibold text-gray-800 block">{art.name}</span>
                              <div className="flex gap-4 items-center">
                                <span className="text-[11px] text-gray-400 font-medium">ЦЕЛЬ: <span className="text-gray-700 font-bold">{art.targetValue}</span></span>
                                {art.minValue && <span className="text-[11px] text-gray-400 font-medium">МИН: <span className="text-gray-700 font-bold">{art.minValue}</span></span>}
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 rounded-lg px-2.5 py-1 focus-within:bg-white focus-within:border-blue-200 transition-all">
                              <input type="text" value={aWeight} onChange={(e) => setLocalArticleWeights({...localArticleWeights, [art.id]: parseFloat(e.target.value) || 0})}
                                onBlur={() => updateArticleWeight(art.id, aWeight)} className="w-7 text-center font-bold text-[11px] bg-transparent outline-none" />
                              <span className="text-[9px] font-bold text-gray-300">%</span>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                             <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${aWeight}%` }} transition={{ duration: 1 }}
                                  className={`h-full ${isArtError ? 'bg-red-400' : 'bg-blue-500'}`} />
                             </div>
                             <div className="flex justify-between items-center">
                                <span className="text-[9px] font-bold text-gray-300 uppercase tracking-tighter">Доля в блоке</span>
                                <span className={`text-[12px] font-bold ${isArtError ? 'text-red-500' : 'text-gray-900'}`}>{formatDisplay(aMoney)} ₽</span>
                             </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* КНОПКА РАСПРЕДЕЛИТЬ ПОРОВНУ */}
                  <AnimatePresence mode="wait">
                    {isArtError && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="pt-2 space-y-3">
                        <div className="py-2.5 bg-red-600 rounded-xl text-center shadow-lg shadow-red-100 relative group overflow-hidden">
                          <span className="text-[9px] font-bold text-white uppercase tracking-[0.2em]">Сумма в блоке: {articlesSum}%</span>
                        </div>
                        <button 
                          onClick={() => distributeEqually(block)}
                          className="w-full py-3 rounded-xl border border-red-200 text-red-500 text-[10px] font-bold uppercase tracking-widest hover:bg-red-50 transition-all active:scale-[0.98]"
                        >
                          Распределить поровну
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}