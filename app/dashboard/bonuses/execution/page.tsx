import { getRestaurants, getBonusStructure } from '@/app/actions';
import ExecutionClient from './ExecutionClient';

type Props = {
  searchParams: Promise<{ resId?: string }>;
};

export default async function KPIExecutionPage({ searchParams }: Props) {
  const params = await searchParams;
  const restaurants = await getRestaurants();
  
  const selectedResId = params.resId ? Number(params.resId) : (restaurants[0]?.id || null);
  const structure = selectedResId ? await getBonusStructure(selectedResId) : [];

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <header className="space-y-1">
        <h1 className="text-4xl font-black tracking-tighter text-gray-900 leading-none">
          Выполнение KPI
        </h1>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">
          Контроль фактических показателей и расчет премии
        </p>
      </header>

      <ExecutionClient 
        restaurants={restaurants} 
        selectedResId={selectedResId} 
        structure={structure} 
      />
    </div>
  );
}