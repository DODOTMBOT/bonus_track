import { getRestaurants, createRestaurant } from '../../actions';

export default async function RestaurantsPage() {
  const restaurants = await getRestaurants();

  return (
    <div>
      <header className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Рестораны</h1>
        <p className="text-gray-500 mt-1 text-sm">Управление сетью заведений</p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Форма создания */}
        <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm h-fit sticky top-10">
          <h3 className="text-lg font-semibold mb-6">Добавить ресторан</h3>
          <form action={createRestaurant} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Название</label>
              <input name="name" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-black" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Адрес</label>
              <input name="address" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-black" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Управляющий (ФИО)</label>
              <input name="manager" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-black" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Терр. управляющий (ФИО)</label>
              <input name="territorial" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-black" />
            </div>
            <button type="submit" className="w-full bg-black text-white py-4 rounded-xl font-medium hover:bg-gray-800 transition-all mt-4">
              Создать запись
            </button>
          </form>
        </div>

        {/* Список ресторанов */}
        <div className="xl:col-span-2 space-y-4">
          {restaurants.map(res => (
            <div key={res.id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col md:flex-row justify-between gap-6 hover:border-gray-300 transition-colors">
              <div>
                <h4 className="text-xl font-bold text-gray-900">{res.name}</h4>
                <p className="text-gray-500 text-sm mt-1">{res.address}</p>
              </div>
              <div className="flex flex-col gap-2 min-w-[200px]">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span className="text-xs font-medium text-gray-600">Упр: {res.manager}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-400 rounded-full" />
                  <span className="text-xs font-medium text-gray-600">Терр: {res.territorial}</span>
                </div>
              </div>
            </div>
          ))}
          {restaurants.length === 0 && (
            <div className="p-20 text-center border-2 border-dashed border-gray-200 rounded-3xl text-gray-400">
              Пока не добавлено ни одного ресторана
            </div>
          )}
        </div>
      </div>
    </div>
  );
}