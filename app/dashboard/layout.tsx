"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isBonusOpen, setIsBonusOpen] = useState(pathname.includes('/bonuses'));
  const [isMetricsOpen, setIsMetricsOpen] = useState(pathname.includes('/metrics'));

  const isActive = (path: string) => pathname === path;

  return (
    <div className="min-h-screen bg-[#F8F7F4] flex font-sans">
      <aside className="w-64 border-r border-gray-200 bg-white p-6 sticky top-0 h-screen hidden md:block">
        <div className="flex items-center gap-2 mb-10 px-2">
          <div className="w-6 h-6 bg-black rounded shadow-sm" />
          <span className="font-bold tracking-tight text-gray-900 uppercase text-[10px] tracking-[0.2em]">AdminOS</span>
        </div>
        
        <nav className="space-y-1">
          <Link href="/dashboard" className={`block p-3 rounded-xl transition-all text-sm ${isActive('/dashboard') ? 'bg-gray-100 text-black font-bold' : 'text-gray-400 hover:text-black hover:bg-gray-50 font-medium'}`}>Пользователи</Link>
          <Link href="/dashboard/restaurants" className={`block p-3 rounded-xl transition-all text-sm ${isActive('/dashboard/restaurants') ? 'bg-gray-100 text-black font-bold' : 'text-gray-400 hover:text-black hover:bg-gray-50 font-medium'}`}>Рестораны</Link>

          <div>
            <button onClick={() => setIsBonusOpen(!isBonusOpen)} className={`w-full flex items-center justify-between p-3 rounded-xl transition-all text-sm ${isBonusOpen || pathname.includes('/bonuses') ? 'text-black font-bold' : 'text-gray-400 hover:text-black hover:bg-gray-50 font-medium'}`}>
              <span>Премия</span>
              <span className={`text-[10px] transform transition-transform ${isBonusOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>

            {isBonusOpen && (
              <div className="pl-4 mt-1 space-y-1 border-l-2 border-gray-50 ml-3">
                <Link href="/dashboard/bonuses/settings" className={`block p-3 rounded-xl text-[13px] transition-all ${isActive('/dashboard/bonuses/settings') ? 'text-black font-bold' : 'text-gray-400 hover:text-black font-medium'}`}>Настройки премий</Link>
                <Link href="/dashboard/bonuses/fund" className={`block p-3 rounded-xl text-[13px] transition-all ${isActive('/dashboard/bonuses/fund') ? 'text-black font-bold' : 'text-gray-400 hover:text-black font-medium'}`}>Премиальный фонд</Link>
                <Link href="/dashboard/bonuses/execution" className={`block p-3 rounded-xl text-[13px] transition-all ${isActive('/dashboard/bonuses/execution') ? 'text-black font-bold' : 'text-gray-400 hover:text-black font-medium'}`}>Выполнение KPI</Link>
              </div>
            )}
          </div>

          <div>
            <button onClick={() => setIsMetricsOpen(!isMetricsOpen)} className={`w-full flex items-center justify-between p-3 rounded-xl transition-all text-sm ${isMetricsOpen || pathname.includes('/metrics') ? 'text-black font-bold' : 'text-gray-400 hover:text-black hover:bg-gray-50 font-medium'}`}>
              <span>Показатели</span>
              <span className={`text-[10px] transform transition-transform ${isMetricsOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>

            {isMetricsOpen && (
              <div className="pl-4 mt-1 space-y-1 border-l-2 border-gray-50 ml-3">
                <Link href="/dashboard/metrics/list" className={`block p-3 rounded-xl text-[13px] transition-all ${isActive('/dashboard/metrics/list') ? 'text-black font-bold' : 'text-gray-400 hover:text-black font-medium'}`}>Метрики</Link>
                <Link href="/dashboard/metrics/targets" className={`block p-3 rounded-xl text-[13px] transition-all ${isActive('/dashboard/metrics/targets') ? 'text-black font-bold' : 'text-gray-400 hover:text-black font-medium'}`}>Целевые показатели</Link>
              </div>
            )}
          </div>
        </nav>
      </aside>

      <main className="flex-1 p-10 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}