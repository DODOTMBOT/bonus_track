import { getRestaurants, getMetrics, getMetricTargets } from '@/app/actions';
import { TargetsClient } from './TargetsClient';

type Props = {
  searchParams: Promise<{ resId?: string }>;
};

export default async function TargetsPage(props: Props) {
  const params = await props.searchParams;
  const rawRestaurants = await getRestaurants();
  const selectedResId = params.resId ? Number(params.resId) : (rawRestaurants[0]?.id || null);
  
  const [rawMetrics, rawTargets] = await Promise.all([
    getMetrics(),
    selectedResId ? getMetricTargets(selectedResId) : Promise.resolve([])
  ]);

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <header className="space-y-1">
        <h1 className="text-4xl font-black tracking-tighter text-gray-900 leading-none">
          Целевые показатели
        </h1>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">
          Настройка целевых значений метрик для каждого ресторана
        </p>
      </header>

      <TargetsClient 
        serializedRestaurants={JSON.stringify(rawRestaurants)} 
        selectedResId={selectedResId}
        serializedMetrics={JSON.stringify(rawMetrics)}
        serializedTargets={JSON.stringify(rawTargets)}
      />
    </div>
  );
}