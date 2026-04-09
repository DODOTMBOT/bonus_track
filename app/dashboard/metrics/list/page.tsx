import { getMetrics } from '@/app/actions';
import { MetricsClient } from './MetricsClient';

export default async function MetricsPage() {
  const rawMetrics = await getMetrics();
  
  // Очистка от Prisma
  const metrics = JSON.parse(JSON.stringify(rawMetrics));

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <header className="space-y-1">
        <h1 className="text-4xl font-black tracking-tighter text-gray-900 leading-none">
          Метрики
        </h1>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">
          Справочник показателей
        </p>
      </header>

      <MetricsClient serializedMetrics={JSON.stringify(metrics)} />
    </div>
  );
}