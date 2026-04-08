"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { saveBonusActual } from '@/app/actions';

// Именованный экспорт!
export function ExecutionClient({
  serializedRestaurants,
  selectedResId,
  selectedPeriod,
  serializedStructure,
  serializedFundRules,
  serializedActualsData
}: any) {
  const router = useRouter();

  // Распаковываем безопасные строки обратно в объекты
  const restaurants = useMemo(() => JSON.parse(serializedRestaurants || "[]"), [serializedRestaurants]);
  const structure = useMemo(() => JSON.parse(serializedStructure || "[]"), [serializedStructure]);
  const fundRules = useMemo(() => JSON.parse(serializedFundRules || "[]"), [serializedFundRules]);
  const actualsData = useMemo(() => JSON.parse(serializedActualsData || "[]"), [serializedActualsData]);

  const [localActuals, setLocalActuals] = useState<Record<number, string>>({});

  useEffect(() => {
    const map: Record<number, string> = {};
    actualsData.forEach((a: any) => { map[a.articleId] = a.value; });
    setLocalActuals(map);
  }, [actualsData]);

  const handleUrlUpdate = (resId: number | string, period: string) => {
    router.push(`/dashboard/bonuses/execution?resId=${resId}&period=${period}`);
  };

  const handleActualBlur = async (artId: number) => {
    const val = localActuals[artId] || "";
    await saveBonusActual(Number(selectedResId), artId, selectedPeriod, val);
  };

  // --- КАЛЬКУЛЯТОР ---
  const activeRes = restaurants.find((r: any) => r.id === selectedResId);
  const activeRuleId = activeRes?.activeFundRuleId;
  const selectedRule = fundRules.find((r: any) => r.id === activeRuleId);
  const totalFundAmount = selectedRule ? (selectedRule.baseValue * (selectedRule.percent / 100)) : 0;

  const formatDisplay = (val: any) => {
    if (!val && val !== 0) return "0";
    return Math.round(val).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  const parseNum = (v: any) => parseFloat(String(v || "0").replace(/:/g, '').replace(/\s/g, '').replace(',', '.')) || 0;

  const getStatus = (art: any, actual: string) => {
    if (!actual) return { label: 'Ожидание', color: 'bg-gray-100 text-gray-400', payout: 0 };
    
    const fact = parseNum(actual);
    const target = parseNum(art.targetValue);
    const min = parseNum(art.minValue);

    if (art.isMaxGoal) {
      if (fact <= target) return { label: 'Выполнено (100%)', color: 'bg-green-100 text-green-700', payout: 1 };
      if (!art.isStrict && fact <= min) return { label: 'Минимум (50%)', color: 'bg-orange-100 text-orange-700', payout: 0.5 };
      return { label: 'Провал (0%)', color: 'bg-red-100 text-red-600', payout: 0 };
    } else {
      if (fact >= target) return { label: 'Выполнено (100%)', color: 'bg-green-100 text-green-700', payout: 1 };
      if (!art.isStrict && fact >= min) return { label: 'Минимум (50%)', color: 'bg-orange-100 text-orange-700', payout: 0.5 };
      return { label: 'Провал (0%)', color: 'bg-red-100 text-red-600', payout: 0 };
    }
  };

  let totalEarned = 0;
  structure.forEach((block: any) => {
    const bWeight = block.weight || 0;
    const bMoney = (totalFundAmount * bWeight) / 100;
    block.articles.forEach((art: any) => {
      const aWeight = art.weight || 0;
      const aMoney = (bMoney * aWeight) / 100;
      const status = getStatus(art, localActuals[art.id]);
      totalEarned += aMoney * status.payout;
    });
  });

  return (
    <div className="space-y-8 text-gray-900 pb-20 max-w-[1400px] mx-auto antialiased">
      
      <div className="flex flex-col lg:flex-row justify-between gap-6 items-start lg:items-center bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
        <div className="flex flex-wrap gap-4 items-center">
          <select 
            value={selectedResId || ""} onChange={(e) => handleUrlUpdate(e.target.value, selectedPeriod)}
            className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold outline-none cursor-pointer"
          >
            <option value="">Выберите объект...</option>
            {restaurants.map((r: any) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
          
          <input 
            type="month" value={selectedPeriod} onChange={(e) => handleUrlUpdate(selectedResId, e.target.value)}
            className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold outline-none cursor-pointer"
          />
        </div>

        <div className="flex items-center gap-4 bg-gray-900 px-6 py-4 rounded-2xl shadow-lg w-full lg:w-auto justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">К выплате за месяц</span>
            <span className="text-xl font-black text-white">{formatDisplay(totalEarned)} ₽</span>
          </div>
          <div className="h-8 w-px bg-gray-700 hidden sm:block"></div>
          <div className="flex flex-col text-right">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Макс. фонд</span>
            <span className="text-sm font-bold text-gray-400">{formatDisplay(totalFundAmount)} ₽</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {structure.map((block: any) => {
          const bMoney = (totalFundAmount * (block.weight || 0)) / 100;
          
          let blockEarned = 0;
          block.articles.forEach((art: any) => {
            const status = getStatus(art, localActuals[art.id]);
            blockEarned += ((bMoney * (art.weight || 0)) / 100) * status.payout;
          });

          return (
            <div key={block.id} className="bg-white border border-gray-100 rounded-[32px] flex flex-col shadow-sm overflow-hidden">
              <div className="px-8 py-5 border-b border-gray-50 flex justify-between items-center bg-gray-50/20">
                <h4 className="text-[13px] font-bold uppercase tracking-wider text-gray-900">{block.name}</h4>
                <div className="flex flex-col text-right">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Итог блока</span>
                  <span className="text-sm font-black text-blue-600">{formatDisplay(blockEarned)} <span className="text-[10px] text-gray-400">/ {formatDisplay(bMoney)} ₽</span></span>
                </div>
              </div>

              <div className="p-8 space-y-8">
                {block.articles.map((art: any) => {
                  const aMoney = (bMoney * (art.weight || 0)) / 100;
                  const status = getStatus(art, localActuals[art.id]);
                  const earned = aMoney * status.payout;

                  return (
                    <div key={art.id} className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <span className="text-[13px] font-semibold text-gray-800 block">{art.name}</span>
                          <div className="flex gap-4 items-center">
                            <span className="text-[10px] text-gray-400 font-bold uppercase">Ц: <span className="text-gray-700">{art.targetValue}</span></span>
                            {!art.isStrict && <span className="text-[10px] text-gray-400 font-bold uppercase">М: <span className="text-gray-700">{art.minValue}</span></span>}
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${status.color.replace('bg-', 'border-').replace('100', '200')} ${status.color}`}>
                          {status.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="relative flex-1 group">
                          <input 
                            type="text" placeholder="Факт..." value={localActuals[art.id] || ''}
                            onChange={(e) => setLocalActuals(prev => ({ ...prev, [art.id]: e.target.value }))}
                            onBlur={() => handleActualBlur(art.id)}
                            className={`w-full bg-gray-50 border rounded-xl px-4 py-3 text-sm font-bold focus:bg-white outline-none transition-all placeholder:text-gray-300 ${status.payout === 1 ? 'border-green-300 focus:border-green-500' : status.payout === 0.5 ? 'border-orange-300 focus:border-orange-500' : localActuals[art.id] ? 'border-red-300 focus:border-red-500' : 'border-gray-100 focus:border-blue-400'}`}
                          />
                        </div>
                        <div className="flex flex-col items-end min-w-[80px]">
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Премия</span>
                          <span className={`text-sm font-black ${status.payout === 1 ? 'text-green-600' : status.payout === 0.5 ? 'text-orange-500' : 'text-gray-400'}`}>
                            {formatDisplay(earned)} ₽
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}