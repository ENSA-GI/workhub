import { Building2, Users, Server, AlertTriangle, TrendingUp, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardSuperAdmin() {
  const kpiData = [
    { title: 'Organisations Totales', value: '47', change: '+3 ce mois', icon: Building2, color: 'text-[#0A6ED1]' },
    { title: 'Utilisateurs Totaux', value: '234', change: '+12 ce mois', icon: Users, color: 'text-green-600' },
    { title: 'Employés Hébergés', value: '2,847', change: '+87 ce mois', icon: Users, color: 'text-purple-600' },
    { title: 'Alertes Actives', value: '2', change: 'Attention requise', icon: AlertTriangle, color: 'text-orange-600' },
  ];

  const usageData = [
    { id: 1, month: 'Jan', users: 180, orgs: 38 },
    { id: 2, month: 'Fév', users: 195, orgs: 40 },
    { id: 3, month: 'Mar', users: 210, orgs: 42 },
    { id: 4, month: 'Avr', users: 234, orgs: 47 },
  ];

  const healthMetrics = [
    { service: 'API Gateway', status: 'Opérationnel', uptime: '99.9%', responseTime: '45ms' },
    { service: 'Base de données', status: 'Opérationnel', uptime: '99.8%', responseTime: '12ms' },
    { service: 'Service de paie', status: 'Opérationnel', uptime: '99.5%', responseTime: '78ms' },
    { service: 'Service d\'authentification', status: 'Dégradé', uptime: '98.2%', responseTime: '156ms' },
  ];

  const recentAlerts = [
    { id: 1, severity: 'warning', message: 'Pic de charge détecté - 450 utilisateurs simultanés', time: 'Il y a 15 min' },
    { id: 2, severity: 'critical', message: 'Service d\'authentification - temps de réponse élevé', time: 'Il y a 1h' },
    { id: 3, severity: 'info', message: 'Sauvegarde automatique terminée avec succès', time: 'Il y a 2h' },
  ];

  return (
    <div className="p-6 bg-[#F5F7FA]">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard Global - Supervision Plateforme</h1>
        <p className="text-sm text-gray-600 mt-1">Vue d'ensemble de l'état de santé et des performances de WorkHub</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Croissance Plateforme */}
        <div className="bg-white border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">Croissance de la Plateforme</h3>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={usageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" key="grid-super-1" />
                <XAxis dataKey="month" stroke="#6B7280" key="xaxis-super-1" />
                <YAxis stroke="#6B7280" key="yaxis-super-1" />
                <Tooltip key="tooltip-super-1" />
                <Line type="monotone" dataKey="users" stroke="#0A6ED1" strokeWidth={2} name="Utilisateurs" key="line-users" />
                <Line type="monotone" dataKey="orgs" stroke="#10B981" strokeWidth={2} name="Organisations" key="line-orgs" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alertes Récentes */}
        <div className="bg-white border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">Alertes Récentes</h3>
          </div>
          <div className="p-4 space-y-3">
            {recentAlerts.map((alert) => (
              <div key={alert.id} className="flex items-start pb-3 border-b border-gray-100 last:border-0">
                <div className={`w-2 h-2 rounded-full mt-2 mr-3 ${
                  alert.severity === 'critical' ? 'bg-red-500' :
                  alert.severity === 'warning' ? 'bg-orange-500' :
                  'bg-blue-500'
                }`}></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* État des Services */}
      <div className="bg-white border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-900">État des Services</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Disponibilité</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Temps de Réponse</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {healthMetrics.map((metric, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{metric.service}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs ${
                      metric.status === 'Opérationnel' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                    }`}>
                      {metric.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{metric.uptime}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{metric.responseTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
