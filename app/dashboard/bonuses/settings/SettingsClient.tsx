"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  createBonusBlock, 
  createBonusArticle, 
  updateArticleValues, 
  saveBonusFundRules 
} from '@/app/actions';
import { motion, AnimatePresence } from 'framer-motion';

export default function SettingsClient({ 
  restaurants, 
  initialStructure, 
  initialFundRules, 
  selectedResId, 
  activeTab 
}: any) {
  const router = useRouter();
  
  // Состояния для модалки KPI
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [tempFormat, setTempFormat] = useState<string>('');
  const [isStrict, setIsStrict] = useState(false);
  const [isMaxGoal, setIsMaxGoal] = useState(false);

  // --- ЛОГИКА ФОНДА ---
  const [fundRules, setFundRules] = useState<any[]>(initialFundRules || []);

  // Синхронизация: когда сервер присылает новые данные после сохранения, обновляем стейт
  useEffect(() => {
    if (initialFundRules && initialFundRules.length > 0) {
      setFundRules(initialFundRules);
    } else if (activeTab === 'fund') {
      setFundRules([{ condition: 'до', threshold: '', percent: '', baseValue: '' }]);
    }
  }, [initialFundRules, selectedResId]);

  // Форматирование для отображения (с пробелами)
  const formatDisplay = (val: any) => {
    if (val === null || val === undefined || val === "") return "";
    const str = val.toString().replace(/\s/g, "");
    return str.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  // Очистка для базы (без пробелов)
  const parseRaw = (val: string) => {
    return val.toString().replace(/\s/g, "").replace(",", ".");
  };

  const updateFundRule = (index: number, field: string, value: any) => {
    const newRules = [...fundRules];
    if (field === 'condition') {
      newRules[index][field] = value;
    } else {
      newRules[index][field] = parseRaw(value);
    }
    setFundRules(newRules);
  };

  const handleSaveFund = async () => {
    if (!selectedResId) return alert("Выберите ресторан");
    await saveBonusFundRules(Number(selectedResId), fundRules);
    alert("Сетка премиального фонда сохранена!");
  };

  const addFundRow = () => {
    setFundRules([...fundRules, { condition: 'до', threshold: '', percent: '', baseValue: '' }]);
  };

  const removeFundRow = (index: number) => {
    setFundRules(fundRules.filter((_, i) => i !== index));
  };

  // --- ОБЩАЯ ЛОГИКА ---
  const updateUrl = (id: string | number | null, tab: string) => {
    const resParam = id ? `resId=${id}` : '';
    const tabParam = `tab=${tab}`;
    router.push(`/dashboard/bonuses/settings?${[resParam, tabParam].filter(Boolean).join('&')}`);
  };

  useEffect(() => {
    if (selectedArticle) {
      setTempFormat(selectedArticle.valueFormat || 'decimal');
      setIsStrict(selectedArticle.isStrict || false);
      setIsMaxGoal(selectedArticle.isMaxGoal || false);
    }
  }, [selectedArticle]);

  const formats = [
    { id: 'date', label: 'Дата', ex: '01.01.2026' },
    { id: 'decimal', label: 'Числа', ex: '4,90' },
    { id: 'time', label: 'Время', ex: '00:35:00' },
    { id: 'currency', label: 'Деньги', ex: '1 450 ₽' },
    { id: 'letter', label: 'Буквы', ex: 'A, B, C' },
    { id: 'percent', label: 'Проценты', ex: '90%' },
  ];

  const DynamicInput = ({ name, defaultValue }: { name: string, defaultValue: string }) => {
    const baseClass = "w-full bg-white border border-gray-200 focus:border-black rounded-xl px-4 py-3 text-lg font-medium outline-none transition-all text-gray-900";
    if (tempFormat === 'letter') {
      return (
        <select name={name} defaultValue={defaultValue} className={baseClass}>
          <option value="">—</option>
          {['A', 'B', 'C', 'D'].map(l => <option key={l} value={l}>{l}</option>)}
        </select>
      );
    }
    const typeMap: any = { date: 'date', decimal: 'number', time: 'time' };
    return (
      <div className="relative">
        <input name={name} type={typeMap[tempFormat] || 'text'} defaultValue={defaultValue} className={baseClass} placeholder="0" />
        {(tempFormat === 'currency' || tempFormat === 'percent') && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
            {tempFormat === 'currency' ? '₽' : '%'}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8 pb-20 text-gray-900">
      {/* TABS */}
      <div className="flex gap-1 p-1 bg-gray-100/50 w-fit rounded-2xl border border-gray-100">
        <button 
          onClick={() => updateUrl(selectedResId, 'constructor')}
          className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'constructor' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
        >
          Конструктор KPI
        </button>
        <button 
          onClick={() => updateUrl(selectedResId, 'fund')}
          className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'fund' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
        >
          Распределение фонда
        </button>
      </div>

      {activeTab === 'constructor' ? (
        <div className="space-y-10">
          <div className="bg-white p-2 rounded-2xl border border-gray-100 flex items-center shadow-sm">
            <select 
              value={selectedResId || ""}
              onChange={(e) => updateUrl(e.target.value, 'constructor')}
              className="w-full bg-transparent px-4 py-3 text-sm font-bold text-gray-600 outline-none appearance-none cursor-pointer"
            >
              <option value="">Выбрать объект управления...</option>
              {restaurants.map((res: any) => <option key={res.id} value={res.id}>{res.name}</option>)}
            </select>
          </div>

          {selectedResId && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white/50 p-8 rounded-[32px] border border-gray-100/50">
                <div className="space-y-4">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Новый блок</h3>
                  <form action={createBonusBlock} className="flex gap-2">
                    <input type="hidden" name="restaurantId" value={selectedResId} />
                    <input name="name" placeholder="Название..." className="flex-1 bg-white border border-gray-100 rounded-xl px-4 py-2 outline-none focus:border-black transition-all text-sm" required />
                    <button className="w-10 h-10 flex items-center justify-center bg-black text-white rounded-xl font-bold">+</button>
                  </form>
                </div>
                <div className="space-y-4">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Новая статья</h3>
                  <form action={createBonusArticle} className="flex gap-2">
                    <input name="name" placeholder="Название..." className="flex-1 bg-white border border-gray-100 rounded-xl px-4 py-2 outline-none focus:border-black transition-all text-sm" required />
                    <select name="blockId" className="text-sm outline-none bg-white border border-gray-100 rounded-xl px-3 py-2 text-gray-600" required>
                      <option value="">Блок...</option>
                      {initialStructure.map((block: any) => <option key={block.id} value={block.id}>{block.name}</option>)}
                    </select>
                    <button className="px-4 h-10 bg-black text-white rounded-xl text-xs font-bold uppercase tracking-widest">OK</button>
                  </form>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {initialStructure.map((block: any) => (
                  <div key={block.id} className="bg-white border border-gray-100 rounded-[24px] shadow-sm flex flex-col overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
                      <h4 className="text-sm font-bold uppercase tracking-wider">{block.name}</h4>
                      <div className="w-5 h-5 flex items-center justify-center bg-white border border-gray-200 rounded-full text-[9px] font-bold text-gray-400">
                        {block.articles.length}
                      </div>
                    </div>
                    <div className="p-2 space-y-1">
                      {block.articles.map((art: any) => (
                        <button key={art.id} onClick={() => setSelectedArticle(art)} className="w-full group p-4 flex flex-col text-left transition-all rounded-2xl hover:bg-gray-50">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-gray-800">{art.name}</span>
                            {art.isMaxGoal && <span className="text-[8px] bg-orange-50 text-orange-500 px-1.5 py-0.5 rounded font-black uppercase">max</span>}
                          </div>
                          {(art.targetValue || art.minValue) && (
                            <div className="flex gap-4 text-[10px] mt-2">
                              <span className="text-gray-400 font-medium tracking-tighter uppercase">ЦЕЛЬ: <b className="text-gray-900 not-italic">{art.targetValue}</b></span>
                              {!art.isStrict && <span className="text-gray-400 font-medium tracking-tighter uppercase">МИН: <b className="text-gray-900 not-italic">{art.minValue}</b></span>}
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        /* TAB: FUND DISTRIBUTION */
        <div className="space-y-6">
          {!selectedResId ? (
             <div className="bg-white p-20 rounded-[40px] border border-gray-100 text-center text-gray-400 font-medium italic">
                Выберите объект в «Конструкторе KPI»
             </div>
          ) : (
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full text-left table-fixed">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest w-[120px]">Условие</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">Оборот пиццерии</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest text-center w-[100px]"> %</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">От суммы</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">Итого фонд</th>
                    <th className="px-6 py-5 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {fundRules.map((rule, idx) => (
                    <tr key={idx} className="group hover:bg-gray-50/30 transition-all">
                      <td className="px-8 py-4 text-gray-900 font-black italic text-lg">
                        <select 
                          value={rule.condition}
                          onChange={(e) => updateFundRule(idx, 'condition', e.target.value)}
                          className="bg-transparent outline-none cursor-pointer"
                        >
                          <option value="до">до</option>
                          <option value="свыше">свыше</option>
                        </select>
                      </td>
                      <td className="px-8 py-4">
                        <input 
                          type="text"
                          value={formatDisplay(rule.threshold)}
                          onChange={(e) => updateFundRule(idx, 'threshold', e.target.value)}
                          className="w-full bg-transparent font-bold text-gray-900 outline-none text-lg"
                        />
                      </td>
                      <td className="px-8 py-4">
                        <input 
                          type="text"
                          value={rule.percent}
                          onChange={(e) => updateFundRule(idx, 'percent', e.target.value)}
                          className="w-full bg-blue-50 text-blue-600 rounded-xl py-2 text-center font-black outline-none border-2 border-transparent focus:border-blue-200 transition-all"
                        />
                      </td>
                      <td className="px-8 py-4">
                        <input 
                          type="text"
                          value={formatDisplay(rule.baseValue)}
                          onChange={(e) => updateFundRule(idx, 'baseValue', e.target.value)}
                          className="w-full bg-transparent font-bold text-gray-900 outline-none text-lg"
                        />
                      </td>
                      <td className="px-8 py-4 text-right font-black text-gray-900 text-lg">
                        {formatDisplay(Math.round(Number(rule.baseValue || 0) * (Number(rule.percent || 0) / 100)))} ₽
                      </td>
                      <td className="px-6 py-4">
                        <button onClick={() => removeFundRow(idx)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100">✕</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="p-8 bg-gray-50/30 border-t border-gray-50 flex justify-between items-center">
                <button onClick={addFundRow} className="text-[11px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-all">+ Добавить строку</button>
                <button onClick={handleSaveFund} className="px-10 py-4 bg-black text-white rounded-[20px] text-[11px] font-black uppercase tracking-widest shadow-xl shadow-black/10 active:scale-95 transition-all">Сохранить изменения</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal Articles */}
      <AnimatePresence>
        {selectedArticle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 text-gray-900">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedArticle(null)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 10 }} className="relative w-full max-w-lg bg-white rounded-[32px] p-10 shadow-2xl">
              <form action={async (formData) => { await updateArticleValues(formData); setSelectedArticle(null); }} className="space-y-8">
                <input type="hidden" name="id" value={selectedArticle.id} />
                <header className="text-center sm:text-left">
                  <h3 className="text-2xl font-bold tracking-tighter text-gray-900 uppercase tracking-widest text-sm text-gray-400">Параметры KPI</h3>
                  <p className="text-2xl font-black text-gray-900 mt-2">{selectedArticle.name}</p>
                </header>
                <div className="grid grid-cols-3 gap-2">
                  {formats.map((fmt) => (
                    <label key={fmt.id} className="cursor-pointer">
                      <input type="radio" name="valueFormat" value={fmt.id} className="peer sr-only" checked={tempFormat === fmt.id} onChange={(e) => setTempFormat(e.target.value)} />
                      <div className="py-2.5 rounded-xl border border-gray-100 text-[10px] font-bold text-center text-gray-400 peer-checked:border-black peer-checked:bg-black peer-checked:text-white transition-all uppercase tracking-tighter">{fmt.label}</div>
                    </label>
                  ))}
                </div>
                <div className="p-1 bg-gray-50 rounded-xl flex">
                  <button type="button" onClick={() => setIsStrict(false)} className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${!isStrict ? 'bg-white shadow-sm text-black' : 'text-gray-400'}`}>Не строгий</button>
                  <button type="button" onClick={() => setIsStrict(true)} className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${isStrict ? 'bg-white shadow-sm text-black' : 'text-gray-400'}`}>Строгий</button>
                  <input type="hidden" name="isStrict" value={String(isStrict)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2 sm:col-span-1">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1">Целевое</span>
                    <DynamicInput name="targetValue" defaultValue={selectedArticle.targetValue || ""} />
                  </div>
                  <AnimatePresence mode="wait">
                    {!isStrict && (
                      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="space-y-2 col-span-2 sm:col-span-1">
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1">Минимальное</span>
                        <DynamicInput name="minValue" defaultValue={selectedArticle.minValue || ""} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-900">Направление</span>
                    <span className="text-[9px] text-gray-400 uppercase font-black">{isMaxGoal ? "Максимум (не выше)" : "Минимум (не ниже)"}</span>
                  </div>
                  <button type="button" onClick={() => setIsMaxGoal(!isMaxGoal)} className={`w-12 h-6 rounded-full transition-colors relative ${isMaxGoal ? 'bg-black' : 'bg-gray-200'}`}>
                    <motion.div animate={{ x: isMaxGoal ? 26 : 4 }} className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                  </button>
                  <input type="hidden" name="isMaxGoal" value={String(isMaxGoal)} />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setSelectedArticle(null)} className="flex-1 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Отмена</button>
                  <button type="submit" className="flex-1 py-4 bg-black text-white rounded-2xl text-xs font-bold uppercase tracking-widest transition-all">Сохранить</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}