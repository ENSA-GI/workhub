import { TrendingUp, TrendingDown, Users, AlertTriangle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function AnalyticsOrgAdmin() {
  const turnoverData = [
    { id: 1, month: 'Jan', turnover: 3.2, prediction: 3.5 },
    { id: 2, month: 'Fév', turnover: 2.8, prediction: 3.2 },
    { id: 3, month: 'Mar', turnover: 3.1, prediction: 3.8 },
    { id: 4, month: 'Avr', turnover: 4.2, prediction: 4.5 },
  ];

  const departmentPerformance = [
    { id: 1, name: 'IT', satisfaction: 85, retention: 92 },
    { id: 2, name: 'Ventes', satisfaction: 78, retention: 85 },
    { id: 3, name: 'Marketing', satisfaction: 88, retention: 90 },
    { id: 4, name: 'RH', satisfaction: 82, retention: 95 },
  ];

  const contractDistribution = [
    { name: 'CDI', value: 32, color: '#0A6ED1' },
    { name: 'CDD', value: 8, color: '#10B981' },
    { name: 'Stage', value: 5, color: '#F59E0B' },
  ];

  const kpis = [
    { label: 'Taux de Turnover', value: '4.2%', trend: 'up', change: '+0.3%', color: 'text-red-600' },
    { label: 'Taux de Rétention', value: '89%', trend: 'up', change: '+2%', color: 'text-green-600' },
    { label: 'Satisfaction Moyenne', value: '83%', trend: 'down', change: '-1%', color: 'text-orange-600' },
    { label: 'Temps Moyen Recrutement', value: '21 jours', trend: 'down', change: '-3j', color: 'text-green-600' },
  ];

  return (
    <div className="p-6 bg-[#F5F7FA]">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Analytics RH</h1>
        <p className="text-sm text-gray-600 mt-1">Indicateurs consolidés et analyses prédictives</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {kpis.map((kpi, index) => (
          <div key={index} className="bg-white border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-medium text-gray-500 uppercase">{kpi.label}</h3>
              {kpi.trend === 'up' ? (
                <TrendingUp className={`w-4 h-4 ${kpi.color}`} />
              ) : (
                <TrendingDown className={`w-4 h-4 ${kpi.color}`} />
              )}
            </div>
            <p className="text-3xl font-semibold text-gray-900 mb-1">{kpi.value}</p>
            <p className={`text-xs ${kpi.color}`}>{kpi.change}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Prédiction Turnover */}
        <div className="bg-white border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">Prédiction du Turnover</h3>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={turnoverData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" key="grid-turn" />
                <XAxis dataKey="month" stroke="#6B7280" key="xaxis-turn" />
                <YAxis stroke="#6B7280" key="yaxis-turn" />
                <Tooltip key="tooltip-turn" />
                <Legend key="legend-turn" />
                <Line type="monotone" dataKey="turnover" stroke="#0A6ED1" strokeWidth={2} name="Réel" key="line-real" />
                <Line type="monotone" dataKey="prediction" stroke="#F59E0B" strokeWidth={2} strokeDasharray="5 5" name="Prédiction" key="line-pred" />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-4 p-3 bg-orange-50 border border-orange-200">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-orange-600 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-orange-900">Attention</p>
                  <p className="text-xs text-orange-800 mt-1">
                    Le turnover prévu pour le mois prochain est de 4.5%, supérieur à la moyenne sectorielle (3.8%)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance par Département */}
        <div className="bg-white border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">Performance par Département</h3>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={departmentPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" key="grid-perf" />
                <XAxis dataKey="name" stroke="#6B7280" key="xaxis-perf" />
                <YAxis stroke="#6B7280" key="yaxis-perf" />
                <Tooltip key="tooltip-perf" />
                <Legend key="legend-perf" />
                <Bar dataKey="satisfaction" fill="#0A6ED1" name="Satisfaction %" key="bar-sat" />
                <Bar dataKey="retention" fill="#10B981" name="Rétention %" key="bar-ret" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Répartition des Contrats */}
        <div className="bg-white border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">Répartition par Type de Contrat</h3>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={contractDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  key="pie-contract"
                >
                  {contractDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip key="tooltip-pie" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Indicateurs Clés */}
        <div className="bg-white border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">Indicateurs Clés</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <span className="text-sm text-gray-600">Âge moyen</span>
              <span className="text-sm font-medium text-gray-900">34.2 ans</span>
            </div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <span className="text-sm text-gray-600">Ancienneté moyenne</span>
              <span className="text-sm font-medium text-gray-900">3.8 ans</span>
            </div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <span className="text-sm text-gray-600">Ratio Homme/Femme</span>
              <span className="text-sm font-medium text-gray-900">58% / 42%</span>
            </div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <span className="text-sm text-gray-600">Taux d'absentéisme</span>
              <span className="text-sm font-medium text-gray-900">2.3%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Coût moyen par employé</span>
              <span className="text-sm font-medium text-gray-900">MAD 4,418/mois</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
