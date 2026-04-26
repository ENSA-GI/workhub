import { Users, DollarSign, TrendingUp, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardOrgAdmin() {
  const kpiData = [
    { title: 'Effectif Total', value: '45', change: '+3 ce mois', icon: Users, color: 'text-[#0A6ED1]' },
    { title: 'Masse Salariale', value: 'MAD 198,450', change: '+2.5%', icon: DollarSign, color: 'text-green-600' },
    { title: 'Taux de Présence', value: '94%', change: '+1.2%', icon: TrendingUp, color: 'text-purple-600' },
    { title: 'Congés en Cours', value: '8', change: '3 en attente', icon: Calendar, color: 'text-orange-600' },
  ];

  const departmentData = [
    { id: 'dept-it', name: 'IT', employees: 15 },
    { id: 'dept-ventes', name: 'Ventes', employees: 12 },
    { id: 'dept-marketing', name: 'Marketing', employees: 8 },
    { id: 'dept-rh', name: 'RH', employees: 5 },
    { id: 'dept-finance', name: 'Finance', employees: 5 },
  ];

  return (
    <div className="p-6 bg-[#F5F7FA]">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Tableau de Bord - TechVision SARL</h1>
        <p className="text-sm text-gray-600 mt-1">Vue d'ensemble de votre organisation</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {kpiData.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.title} className="bg-white border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <Icon className={`w-6 h-6 ${kpi.color}`} />
              </div>
              <h3 className="text-xs font-medium text-gray-500 uppercase mb-2">{kpi.title}</h3>
              <p className="text-3xl font-semibold text-gray-900 mb-1">{kpi.value}</p>
              <p className="text-xs text-gray-600">{kpi.change}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Effectifs par Département */}
        <div className="bg-white border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">Effectifs par Département</h3>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={departmentData}>
                <CartesianGrid key="grid-1" strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis key="xaxis-1" dataKey="name" stroke="#6B7280" />
                <YAxis key="yaxis-1" stroke="#6B7280" />
                <Tooltip key="tooltip-1" />
                <Bar key="bar-1" dataKey="employees" fill="#0A6ED1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activités Récentes */}
        <div className="bg-white border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">Activités Récentes</h3>
          </div>
          <div className="p-4 space-y-3">
            {[
              { action: 'Nouvel employé', detail: 'Sarah Martin (Développeuse)', time: 'Il y a 2h' },
              { action: 'Paie validée', detail: 'Mars 2026 - 45 employés', time: 'Il y a 5h' },
              { action: 'Congé approuvé', detail: 'Mohammed Alami - 5 jours', time: 'Hier' },
              { action: 'Configuration', detail: 'Grille salariale mise à jour', time: 'Il y a 2 jours' },
            ].map((activity, index) => (
              <div key={index} className="flex items-start pb-3 border-b border-gray-100 last:border-0">
                <div className="w-2 h-2 bg-[#0A6ED1] rounded-full mt-2 mr-3"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-600">{activity.detail}</p>
                </div>
                <span className="text-xs text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
