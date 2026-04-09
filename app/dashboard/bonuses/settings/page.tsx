import { getRestaurants, getBonusStructure, getMetrics } from '@/app/actions';
import { SettingsClient } from './SettingsClient';

type Props = {
  searchParams: Promise<{ resId?: string }>;
};

export default async function BonusSettingsPage(props: Props) {
  const params = await props.searchParams;
  const rawRestaurants = await getRestaurants();
  const selectedResId = params.resId ? Number(params.resId) : (rawRestaurants[0]?.id || null);
  
  const [rawStructure, rawMetrics] = await Promise.all([
    selectedResId ? getBonusStructure(selectedResId) : Promise.resolve([]),
    getMetrics()
  ]);

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <header className="space-y-1">
        <h1 className="text-4xl font-black tracking-tighter text-gray-900 leading-none">
          Конструктор KPI
        </h1>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">
          Сборка показателей для объекта
        </p>
      </header>

      <SettingsClient 
        serializedRestaurants={JSON.stringify(rawRestaurants)} 
        serializedStructure={JSON.stringify(rawStructure)} 
        serializedMetrics={JSON.stringify(rawMetrics)}
        selectedResId={selectedResId}
      />
    </div>
  );
}