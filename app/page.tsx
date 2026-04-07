"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [login, setLogin] = useState('');
  const [pass, setPass] = useState('');
  const router = useRouter();

  const checkAccess = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Твои данные для входа (можно поменять на любые)
    const SUPER_LOGIN = "admin";
    const SUPER_PASS = "admin123";

    if (login === SUPER_LOGIN && pass === SUPER_PASS) {
      router.push('/dashboard');
    } else {
      alert('Неверные учетные данные суперадмина');
    }
  };

  return (
    <main className="min-h-screen bg-[#F8F7F4] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-[420px]">
        {/* Логотип */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-white rounded-full" />
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900">AdminOS</span>
        </div>

        <div className="bg-white rounded-[24px] p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-900">С возвращением</h1>
            <p className="text-gray-500 text-sm mt-1">Введите данные суперадмина</p>
          </div>

          <form onSubmit={checkAccess} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 ml-1">Логин</label>
              <input 
                type="text" 
                placeholder="Username"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                className="w-full bg-[#F9F9F9] border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-400 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 ml-1">Пароль</label>
              <input 
                type="password" 
                placeholder="••••••••"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                className="w-full bg-[#F9F9F9] border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-400 transition-all"
              />
            </div>
            
            <button className="w-full bg-black text-white py-4 rounded-xl font-medium hover:bg-gray-800 transition-all active:scale-[0.98] mt-2">
              Войти в панель
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}