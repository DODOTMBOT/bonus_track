import { getRestaurants, getBonusFundRules, getBonusStructure } from '@/app/actions';
import FundClient from './FundClient';

export default async function BonusFundPage({ searchParams }: any) {
  const params = await searchParams;
  const rawRestaurants = await getRestaurants();
  
  const selectedResId = params.resId ? Number(params.resId) : (rawRestaurants[0]?.id || null);
  
  const [rawFundRules, rawStructure] = await Promise.all([
    selectedResId ? getBonusFundRules(selectedResId) : Promise.resolve([]),
    selectedResId ? getBonusStructure(selectedResId) : Promise.resolve([])
  ]);

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <header className="space-y-1">
        <h1 className="text-4xl font-black tracking-tighter text-gray-900 leading-none">
          Премиальный фонд
        </h1>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">
          Настройка сетки оборота и распределение весов KPI
        </p>
      </header>

      <FundClient 
        restaurants={JSON.parse(JSON.stringify(rawRestaurants))} 
        selectedResId={selectedResId} 
        initialFundRules={JSON.parse(JSON.stringify(rawFundRules))} 
        structure={JSON.parse(JSON.stringify(rawStructure))} 
      />
    </div>
  );
}