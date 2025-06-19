import { useState, useEffect } from 'react';
import { Package, Pill as Pills, PackageCheck, AlertTriangle, ShoppingCart, TrendingUp, Clock } from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import StatCard from '../components/StatCard';
import { mockDashboardData } from '../data/mockData';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(mockDashboardData);
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Painel de Controle</h1>
      
      {/* Linha de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total de Medicamentos"
          value={dashboardData.stats.totalMedications}
          icon={<Pills className="h-6 w-6 text-blue-700" />}
          color="blue"
        />
        <StatCard
          title="Lotes Ativos"
          value={dashboardData.stats.activeBatches}
          icon={<Package className="h-6 w-6 text-green-700" />}
          trend={{ value: 12, isUpward: true }}
          color="green"
        />
        <StatCard
          title="Itens com Estoque Baixo"
          value={dashboardData.stats.lowStockItems}
          icon={<AlertTriangle className="h-6 w-6 text-red-700" />}
          color="red"
        />
        <StatCard
          title="Vencendo em Breve"
          value={dashboardData.stats.expiringSoon}
          icon={<Clock className="h-6 w-6 text-orange-700" />}
          color="orange"
        />
      </div>
      
      {/* Linha de Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Movimentações de Estoque */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Movimentações de Estoque (Últimos 7 Dias)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={dashboardData.inventoryMovements}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="in" name="Entrada de Estoque" stroke="#4F46E5" strokeWidth={2} />
              <Line type="monotone" dataKey="out" name="Saída de Estoque" stroke="#EF4444" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Gráfico dos Top 5 Medicamentos */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Top 5 Medicamentos (Por Uso)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={dashboardData.topMedications}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="quantity" name="Unidades" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Linha Inferior */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Distribuição de Estoque */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Distribuição de Estoque</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={dashboardData.stockDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {dashboardData.stockDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Atividade Recente */}
        <div className="col-span-1 lg:col-span-2 bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Atividade Recente</h2>
          </div>
          <div className="px-6 py-4">
            <ul className="divide-y divide-gray-200">
              {dashboardData.recentActivity.map((activity, index) => (
                <li key={index} className="py-3">
                  <div className="flex items-start">
                    <div className={`p-2 rounded-full mr-3 ${
                      activity.type === 'in' 
                        ? 'bg-green-100 text-green-600' 
                        : activity.type === 'out' 
                          ? 'bg-red-100 text-red-600' 
                          : 'bg-blue-100 text-blue-600'
                    }`}>
                      {activity.type === 'in' ? (
                        <PackageCheck size={16} />
                      ) : activity.type === 'out' ? (
                        <ShoppingCart size={16} />
                      ) : (
                        <TrendingUp size={16} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">
                        {activity.description}
                      </p>
                      <p className="text-sm text-gray-500">
                        {activity.user} • {activity.time}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
            <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-800">
              Ver toda a atividade
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;