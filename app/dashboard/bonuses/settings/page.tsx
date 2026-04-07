import { getRestaurants, getBonusStructure, getBonusFundRules } from '@/app/actions';
import SettingsClient from './SettingsClient';

type Props = {
  searchParams: Promise<{ resId?: string; tab?: string }>;
};

export default async function BonusSettingsPage({ searchParams }: Props) {
  const params = await searchParams;
  const restaurants = await getRestaurants();
  
  const selectedResId = params.resId ? Number(params.resId) : null;
  const activeTab = params.tab || 'constructor';
  
  // Загружаем данные из базы
  const structure = selectedResId ? await getBonusStructure(selectedResId) : [];
  const fundRules = selectedResId ? await getBonusFundRules(selectedResId) : [];

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tighter text-gray-900">Настройка премий</h1>
        <p className="text-gray-400 mt-1 text-sm font-medium">Управление структурой KPI и распределением фонда</p>
      </header>

      <SettingsClient 
        restaurants={restaurants} 
        initialStructure={structure} 
        initialFundRules={fundRules} // Передаем правила фонда
        selectedResId={selectedResId}
        activeTab={activeTab}
      />
    </div>
  );
}