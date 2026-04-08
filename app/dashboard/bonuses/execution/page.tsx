import { getRestaurants, getBonusStructure, getBonusFundRules, getBonusActuals } from '@/app/actions';
import { ExecutionClient } from './ExecutionClient';

type Props = {
  searchParams: Promise<{ resId?: string, period?: string }>;
};

export default async function KPIExecutionPage(props: Props) {
  const params = await props.searchParams;
  const rawRestaurants = await getRestaurants();
  
  const selectedResId = params.resId ? Number(params.resId) : (rawRestaurants[0]?.id || null);
  
  const date = new Date();
  const currentPeriod = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  const selectedPeriod = params.period || currentPeriod;

  const [rawStructure, rawFundRules, rawActuals] = await Promise.all([
    selectedResId ? getBonusStructure(selectedResId) : Promise.resolve([]),
    selectedResId ? getBonusFundRules(selectedResId) : Promise.resolve([]),
    selectedResId ? getBonusActuals(selectedResId, selectedPeriod) : Promise.resolve([])
  ]);

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <header className="space-y-1">
        <h1 className="text-4xl font-black tracking-tighter text-gray-900 leading-none">
          Выполнение KPI
        </h1>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">
          Ввод факта и расчет итоговой премии
        </p>
      </header>

      {/* Передаем строго как строки, чтобы обойти баг Next.js */}
      <ExecutionClient 
        serializedRestaurants={JSON.stringify(rawRestaurants)} 
        selectedResId={selectedResId} 
        selectedPeriod={selectedPeriod}
        serializedStructure={JSON.stringify(rawStructure)} 
        serializedFundRules={JSON.stringify(rawFundRules)}
        serializedActualsData={JSON.stringify(rawActuals)}
      />
    </div>
  );
}