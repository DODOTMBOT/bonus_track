"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBonusBlock, createBonusArticle, updateArticleValues } from '@/app/actions';
import { motion, AnimatePresence } from 'framer-motion';

export default function SettingsClient({ restaurants, initialStructure, selectedResId }: any) {
  const router = useRouter();
  
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [tempFormat, setTempFormat] = useState<string>('');
  const [isStrict, setIsStrict] = useState(false);
  const [isMaxGoal, setIsMaxGoal] = useState(false);

  const updateUrl = (id: string | number) => {
    router.push(`/dashboard/bonuses/settings?resId=${id}`);
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
    const baseClass = "w-full bg-gray-50 border border-gray-100 focus:border-blue-400 focus:bg-white rounded-xl px-4 py-3 text-sm font-bold outline-none transition-all text-gray-900";
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
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">
            {tempFormat === 'currency' ? '₽' : '%'}
          </span>
        )}
      </div>
    );
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
          
          {/* ФОРМЫ СОЗДАНИЯ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
            <div className="space-y-4">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 ml-1">Новый блок KPI</h3>
              <form action={createBonusBlock} className="flex gap-2">
                <input type="hidden" name="restaurantId" value={selectedResId} />
                <input name="name" placeholder="Название блока (напр. Прибыль)..." className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-blue-400 transition-all text-sm font-bold" required />
                <button className="w-11 h-11 flex items-center justify-center bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-all active:scale-95">+</button>
              </form>
            </div>
            <div className="space-y-4">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 ml-1">Новая статья</h3>
              <form action={createBonusArticle} className="flex gap-2">
                <input name="name" placeholder="Название статьи..." className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-blue-400 transition-all text-sm font-bold" required />
                <select name="blockId" className="text-sm font-bold outline-none bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-gray-600 focus:bg-white focus:border-blue-400" required>
                  <option value="">Блок...</option>
                  {initialStructure.map((block: any) => <option key={block.id} value={block.id}>{block.name}</option>)}
                </select>
                <button className="px-5 h-11 bg-black text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 transition-all active:scale-95">Добавить</button>
              </form>
            </div>
          </div>

          {/* СЕТКА БЛОКОВ */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {initialStructure.map((block: any) => (
              <div key={block.id} className="bg-white border border-gray-100 rounded-[32px] shadow-sm flex flex-col overflow-hidden hover:shadow-md transition-all">
                <div className="px-8 py-5 border-b border-gray-50 bg-gray-50/20 flex items-center justify-between">
                  <h4 className="text-sm font-bold uppercase tracking-tight">{block.name}</h4>
                  <div className="w-6 h-6 flex items-center justify-center bg-white border border-gray-200 rounded-full text-[10px] font-bold text-gray-400 shadow-sm">
                    {block.articles.length}
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  {block.articles.map((art: any) => (
                    <button key={art.id} onClick={() => setSelectedArticle(art)} className="w-full group p-4 flex flex-col text-left transition-all rounded-2xl hover:bg-gray-50 border border-transparent hover:border-gray-100">
                      <div className="flex items-center justify-between w-full">
                        <span className="text-[13px] font-semibold text-gray-800 group-hover:text-black leading-tight">{art.name}</span>
                        {art.isMaxGoal && <span className="text-[8px] bg-orange-50 text-orange-500 px-1.5 py-0.5 rounded font-black uppercase tracking-tighter ml-3 shrink-0">max</span>}
                      </div>
                      {(art.targetValue || art.minValue) && (
                        <div className="flex gap-4 items-center mt-2.5">
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Цель: <span className="text-gray-900">{art.targetValue}</span></span>
                          {!art.isStrict && <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Мин: <span className="text-gray-900">{art.minValue}</span></span>}
                        </div>
                      )}
                    </button>
                  ))}
                  {block.articles.length === 0 && (
                    <div className="text-center p-6 text-[10px] font-bold uppercase tracking-widest text-gray-300">
                      Пустой блок
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* МОДАЛКА РЕДАКТИРОВАНИЯ СТАТЬИ */}
      <AnimatePresence>
        {selectedArticle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 text-gray-900">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedArticle(null)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }} className="relative w-full max-w-lg bg-white rounded-[32px] p-10 shadow-2xl">
              <form action={async (formData) => { await updateArticleValues(formData); setSelectedArticle(null); }} className="space-y-8">
                <input type="hidden" name="id" value={selectedArticle.id} />
                <header className="text-center sm:text-left">
                  <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold mb-1">Настройка показателя</p>
                  <h3 className="text-2xl font-black tracking-tighter text-gray-900 leading-tight">{selectedArticle.name}</h3>
                </header>

                {/* Форматы */}
                <div className="grid grid-cols-3 gap-2">
                  {formats.map((fmt) => (
                    <label key={fmt.id} className="cursor-pointer">
                      <input type="radio" name="valueFormat" value={fmt.id} className="peer sr-only" checked={tempFormat === fmt.id} onChange={(e) => setTempFormat(e.target.value)} />
                      <div className="py-2.5 rounded-xl border border-gray-100 text-[10px] font-bold text-center text-gray-400 peer-checked:border-blue-600 peer-checked:bg-blue-600 peer-checked:text-white transition-all uppercase tracking-tighter shadow-sm">{fmt.label}</div>
                    </label>
                  ))}
                </div>

                {/* Тип цели */}
                <div className="p-1 bg-gray-50 rounded-xl flex border border-gray-100">
                  <button type="button" onClick={() => setIsStrict(false)} className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${!isStrict ? 'bg-white shadow-sm text-black' : 'text-gray-400 hover:text-gray-600'}`}>С минимумом</button>
                  <button type="button" onClick={() => setIsStrict(true)} className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${isStrict ? 'bg-white shadow-sm text-black' : 'text-gray-400 hover:text-gray-600'}`}>Строго 100%</button>
                  <input type="hidden" name="isStrict" value={String(isStrict)} />
                </div>

                {/* Значения */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2 sm:col-span-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Целевое значение</span>
                    <DynamicInput name="targetValue" defaultValue={selectedArticle.targetValue || ""} />
                  </div>
                  <AnimatePresence mode="wait">
                    {!isStrict && (
                      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-2 col-span-2 sm:col-span-1">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Минимальное (порог)</span>
                        <DynamicInput name="minValue" defaultValue={selectedArticle.minValue || ""} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Направление */}
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

                {/* Кнопки */}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setSelectedArticle(null)} className="flex-1 py-4 text-[11px] font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-all">Отмена</button>
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