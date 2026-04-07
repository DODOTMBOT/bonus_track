import { getUsers, createUser, deleteUser } from '../actions';

export default async function Dashboard() {
  const users = await getUsers();

  return (
    <div>
      <header className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Управление доступом</h1>
        <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded-full border border-gray-200">
          Суперадмин: <span className="text-black font-medium text-xs">ONLINE</span>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Форма создания */}
        <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm h-fit">
          <h3 className="text-lg font-semibold mb-6">Новый аккаунт</h3>
          <form action={createUser} className="space-y-4">
            <input 
              name="login" 
              placeholder="Логин" 
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-black" 
            />
            <input 
              name="password" 
              type="text"
              placeholder="Пароль" 
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-black" 
            />
            <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-all mt-2">
              Добавить в базу
            </button>
          </form>
        </div>

        {/* Таблица пользователей */}
        <div className="xl:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-semibold uppercase text-gray-400">Логин</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase text-gray-400">Пароль</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase text-gray-400 text-right">Действие</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{user.login}</td>
                  <td className="px-6 py-4">
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-600">
                      {user.password}
                    </code>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <form action={async () => { "use server"; await deleteUser(user.id); }}>
                      <button className="text-red-400 hover:text-red-600 text-sm font-medium transition-colors">
                        Удалить
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-10 text-center text-gray-400 italic">
                    Список пользователей пуст
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}