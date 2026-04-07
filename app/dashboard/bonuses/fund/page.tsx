import { getRestaurants, getBonusFundRules, getBonusStructure } from '@/app/actions';
import FundClient from './FundClient';

type Props = {
  searchParams: Promise<{ resId?: string }>;
};

export default async function BonusFundPage({ searchParams }: Props) {
  // 1. Получаем параметры URL
  const params = await searchParams;
  const restaurants = await getRestaurants();
  
  // 2. Определяем выбранную пиццерию (ID из URL или первая из списка)
  const selectedResId = params.resId ? Number(params.resId) : (restaurants[0]?.id || null);
  
  // 3. Загружаем все данные для этого объекта параллельно
  const [fundRules, structure] = await Promise.all([
    selectedResId ? getBonusFundRules(selectedResId) : Promise.resolve([]),
    selectedResId ? getBonusStructure(selectedResId) : Promise.resolve([])
  ]);

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      {/* Шапка страницы */}
      <header className="space-y-1">
        <h1 className="text-4xl font-black tracking-tighter text-gray-900 leading-none">
          Премиальный фонд
        </h1>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">
          Управление бюджетом и KPI объекта
        </p>
      </header>

      {/* Клиентская часть с табами и контентом */}
      <FundClient 
        restaurants={restaurants} 
        selectedResId={selectedResId} 
        fundRules={fundRules} 
        structure={structure} 
      />
    </div>
  );
}