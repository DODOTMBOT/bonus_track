"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { setActiveFundRule, saveBonusFundRules, updateBlockWeight, updateArticleWeight } from '@/app/actions';

export default function FundClient({ restaurants, selectedResId, initialFundRules, structure }: any) {
  const router = useRouter();

  const [fundRules, setFundRules] = useState<any[]>(initialFundRules || []);

  useEffect(() => {
    if (initialFundRules && initialFundRules.length > 0) {
      setFundRules(initialFundRules);
    } else {
      setFundRules([{ condition: 'до', threshold: '', percent: '', baseValue: '' }]);
    }
  }, [initialFundRules, selectedResId]);

  const formatDisplay = (val: any) => {
    if (val === null || val === undefined || val === "") return "0";
    return Math.round(val).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  const parseRaw = (val: string) => val.toString().replace(/\s/g, "").replace(",", ".");

  const updateFundRule = (index: number, field: string, value: any) => {
    const newRules = [...fundRules];
    newRules[index][field] = field === 'condition' ? value : parseRaw(value);
    setFundRules(newRules);
  };

  const handleSaveFund = async () => {
    if (!selectedResId) return alert("Выберите ресторан");
    await saveBonusFundRules(Number(selectedResId), fundRules);
    alert("Сетка фонда сохранена!");
  };

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

  const distributeEqually = async (block: any) => {
    const count = block.articles.length;
    if (count === 0) return;
    const newWeights = { ...localArticleWeights };
    const baseWeight = Math.floor((100 / count) * 10) / 10;
    let currentTotal = 0;

    for (let i = 0; i < count; i++) {
      const art = block.articles[i];
      let finalWeight: number = (i === count - 1) ? Math.round((100 - currentTotal) * 10) / 10 : baseWeight;
      currentTotal += baseWeight;
      newWeights[art.id] = finalWeight;
      await updateArticleWeight(art.id, finalWeight);
    }
    setLocalArticleWeights(newWeights);
  };

  return (
    <div className="space-y-8 text-gray-900 pb-20 max-w-[1400px] mx-auto antialiased">
      <div className="flex flex-wrap gap-1 p-1 bg-gray-100/50 rounded-2xl border border-gray-100 w-fit">
        {restaurants.map((res: any) => (
          <button key={res.id} onClick={() => router.push(`/dashboard/bonuses/fund?resId=${res.id}`)}
            className={`px-6 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all ${selectedResId === res.id ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
          > {res.name} </button>
        ))}
      </div>

      <section className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-8 py-5 border-b border-gray-50 flex justify-between items-center bg-gray-50/20">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Сетка оборота и бюджета</span>
          {totalFundAmount > 0 && <span className="text-[11px] font-black text-blue-600 uppercase">Активный фонд: {formatDisplay(totalFundAmount)} ₽</span>}
        </div>
        <table className="w-full text-left">
          <thead className="bg-gray-50/50 border-b border-gray-50 text-[9px] font-bold uppercase text-gray-400 tracking-widest">
            <tr>
              <th className="px-6 py-4 text-center w-12">Выбор</th>
              <th className="px-6 py-4">Условие</th>
              <th className="px-6 py-4">Оборот пиццерии</th>
              <th className="px-6 py-4 text-center">Процент</th>
              <th className="px-6 py-4">База для расчета</th>
              <th className="px-6 py-4 text-right">Сумма фонда</th>
              <th className="px-4 py-4 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-[12px]">
            {fundRules.map((rule, idx) => {
              const isSelected = activeRuleId === rule.id && rule.id !== undefined;
              return (
                <tr key={idx} className={`transition-all ${isSelected ? 'bg-blue-50/30' : 'hover:bg-gray-50/30'}`}>
                  <td className="px-6 py-3 text-center">
                    {rule.id ? (
                      <button onClick={() => setActiveFundRule(selectedResId, rule.id)} className={`w-4 h-4 rounded-full border-2 mx-auto flex items-center justify-center transition-all ${isSelected ? 'border-blue-600 bg-blue-600' : 'border-gray-300'}`}>
                        {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                      </button>
                    ) : <span className="text-gray-300 text-[10px]">Новая</span>}
                  </td>
                  <td className="px-6 py-3">
                    <select value={rule.condition} onChange={(e) => updateFundRule(idx, 'condition', e.target.value)} className="bg-transparent font-bold text-gray-600 outline-none cursor-pointer uppercase text-[10px] tracking-widest">
                      <option value="до">до</option><option value="свыше">свыше</option>
                    </select>
                  </td>
                  <td className="px-6 py-3"><input type="text" value={formatDisplay(rule.threshold)} onChange={(e) => updateFundRule(idx, 'threshold', e.target.value)} className="w-full bg-transparent font-bold text-gray-900 outline-none" placeholder="0" /></td>
                  <td className="px-6 py-3"><div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-2 py-1"><input type="text" value={rule.percent} onChange={(e) => updateFundRule(idx, 'percent', e.target.value)} className="w-8 text-center font-bold text-blue-600 outline-none" /><span className="text-[10px] text-gray-400 font-bold">%</span></div></td>
                  <td className="px-6 py-3"><input type="text" value={formatDisplay(rule.baseValue)} onChange={(e) => updateFundRule(idx, 'baseValue', e.target.value)} className="w-full bg-transparent font-bold text-gray-900 outline-none" placeholder="0" /></td>
                  <td className="px-6 py-3 text-right font-black text-gray-900">{formatDisplay(Math.round(Number(rule.baseValue || 0) * (Number(rule.percent || 0) / 100)))} ₽</td>
                  <td className="px-4 py-3"><button onClick={() => setFundRules(fundRules.filter((_, i) => i !== idx))} className="text-gray-300 hover:text-red-500 font-bold">✕</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="p-5 bg-gray-50/30 border-t border-gray-50 flex justify-between items-center">
          <button onClick={() => setFundRules([...fundRules, { condition: 'до', threshold: '', percent: '', baseValue: '' }])} className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-all">+ Добавить строку</button>
          <button onClick={handleSaveFund} className="px-8 py-3 bg-black text-white rounded-xl text-[10px] font-bold uppercase tracking-widest active:scale-95 transition-all">Сохранить сетку</button>
        </div>
      </section>

      <section className="space-y-6 pt-4">
        <div className="flex justify-between items-center px-1">
           <h3 className="font-bold uppercase text-[11px] tracking-[0.2em] text-gray-400 italic">Распределение весов KPI</h3>
           {isBlockError && (
             <span className="text-[9px] font-bold text-red-500 bg-red-50 px-3 py-1 rounded-lg border border-red-100 uppercase tracking-widest">
               Сумма блоков: {totalBlockWeight}%
             </span>
           )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {structure.map((block: any) => {
            const bWeight = localBlockWeights[block.id] || 0;
            const bMoney = (totalFundAmount * bWeight) / 100;
            const articlesSum = Math.round(block.articles.reduce((sum: number, a: any) => sum + (localArticleWeights[a.id] || 0), 0) * 10) / 10;
            const isArtError = articlesSum !== 100 && block.articles.length > 0;

            return (
              <div key={block.id} className={`bg-white border rounded-[32px] transition-all flex flex-col shadow-sm ${isArtError ? 'border-red-200 ring-4 ring-red-50/50' : 'border-gray-100'}`}>
                <div className="px-8 py-6 flex justify-between items-center">
                  <h4 className="text-[13px] font-bold uppercase tracking-wider text-gray-900">{block.name}</h4>
                  <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-1.5 border border-gray-100 focus-within:bg-white transition-all">
                    <input type="text" value={bWeight} onChange={(e) => setLocalBlockWeights({...localBlockWeights, [block.id]: parseFloat(e.target.value) || 0})} onBlur={() => updateBlockWeight(block.id, bWeight)} className="w-8 text-center font-bold text-sm bg-transparent outline-none" />
                    <span className="text-[10px] font-bold text-gray-300">%</span>
                  </div>
                </div>

                <div className="px-8 pb-8 space-y-6">
                  <div className={`flex justify-between items-center px-4 py-3 rounded-2xl ${isArtError ? 'bg-red-50 text-red-600' : 'bg-blue-50/50 text-blue-600'}`}>
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Бюджет блока</span>
                    <span className="text-base font-bold tracking-tight">{formatDisplay(bMoney)} ₽</span>
                  </div>

                  <div className="space-y-6">
                    {block.articles.map((art: any) => {
                      const aWeight = localArticleWeights[art.id] || 0;
                      const aMoney = (bMoney * aWeight) / 100;
                      return (
                        <div key={art.id} className="space-y-3">
                          <div className="flex justify-between items-start">
                            <span className="text-[13px] font-semibold text-gray-800">{art.name}</span>
                            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 rounded-lg px-2.5 py-1 focus-within:bg-white transition-all">
                              <input type="text" value={aWeight} onChange={(e) => setLocalArticleWeights({...localArticleWeights, [art.id]: parseFloat(e.target.value) || 0})} onBlur={() => updateArticleWeight(art.id, aWeight)} className="w-7 text-center font-bold text-[11px] bg-transparent outline-none" />
                              <span className="text-[9px] font-bold text-gray-300">%</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                             <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div style={{ width: `${aWeight}%` }} className={`h-full transition-all duration-500 ${isArtError ? 'bg-red-400' : 'bg-blue-500'}`} />
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

                  {isArtError && (
                    <div className="pt-2 space-y-3">
                      <div className="py-2 bg-red-600 rounded-xl text-center shadow-lg shadow-red-100"><span className="text-[9px] font-bold text-white uppercase tracking-[0.2em]">Сумма в блоке: {articlesSum}%</span></div>
                      <button onClick={() => distributeEqually(block)} className="w-full py-2.5 rounded-xl border border-red-200 text-red-500 text-[10px] font-bold uppercase tracking-widest hover:bg-red-50 transition-all active:scale-[0.98]">Распределить поровну</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}