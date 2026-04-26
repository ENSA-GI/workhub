import { Calendar, TrendingUp, AlertTriangle, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';

export default function CongesAnalytics() {
  const absencesParDepartement = [
    { id: 'abs-it', departement: 'IT', utilisation: 68, total: 330 },
    { id: 'abs-ventes', departement: 'Ventes', utilisation: 72, total: 264 },
    { id: 'abs-marketing', departement: 'Marketing', utilisation: 85, total: 176 },
    { id: 'abs-finance', departement: 'Finance', utilisation: 58, total: 132 },
    { id: 'abs-rh', departement: 'RH', utilisation: 65, total: 88 },
  ];

  const typesCongés = [
    { name: 'Congé Annuel', value: 182, color: '#0A6ED1' },
    { name: 'Congé Maladie', value: 45, color: '#F59E0B' },
    { name: 'Congé Exceptionnel', value: 18, color: '#10B981' },
    { name: 'Congé Sans Solde', value: 8, color: '#6B7280' },
  ];

  const periodesCritiques = [
    { periode: 'Mai 2026', absences: 18, pourcentage: 40, critique: true },
    { periode: 'Juin 2026', absences: 22, pourcentage: 49, critique: true },
    { periode: 'Juillet 2026', absences: 25, pourcentage: 56, critique: true },
    { periode: 'Août 2026', absences: 28, pourcentage: 62, critique: true },
  ];

  const kpis = [
    { label: 'Taux Utilisation Global', value: '71%', trend: 'up', change: '+5%', color: 'text-orange-600' },
    { label: 'Jours Pris (YTD)', value: '253', trend: 'up', change: '+48j', color: 'text-blue-600' },
    { label: 'Demandes en Attente', value: '12', trend: 'stable', change: '', color: 'text-gray-600' },
    { label: 'Taux Absentéisme', value: '2.3%', trend: 'down', change: '-0.2%', color: 'text-green-600' },
  ];

  const calendrierGlobal = [
    { date: '2026-04-21', employe: 'Mohammed Alami', departement: 'IT', type: 'Congé Annuel', jours: 3 },
    { date: '2026-04-22', employe: 'Sara Bennani', departement: 'RH', type: 'Congé Exceptionnel', jours: 1 },
    { date: '2026-04-25', employe: 'Fatima Zahra', departement: 'RH', type: 'Congé Annuel', jours: 5 },
    { date: '2026-04-28', employe: 'Youssef Bennani', departement: 'IT', type: 'Congé Annuel', jours: 3 },
    { date: '2026-05-02', employe: 'Ahmed Tazi', departement: 'Ventes', type: 'Congé Annuel', jours: 7 },
  ];

  return (
    <div className="p-6 bg-[#F5F7FA]">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Analytics Congés</h1>
        <p className="text-sm text-gray-600 mt-1">Vue d'ensemble et statistiques des congés</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {kpis.map((kpi, index) => (
          <div key={index} className="bg-white border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-medium text-gray-500 uppercase">{kpi.label}</h3>
              {kpi.trend === 'up' ? (
                <TrendingUp className={`w-4 h-4 ${kpi.color}`} />
              ) : kpi.trend === 'down' ? (
                <TrendingUp className={`w-4 h-4 ${kpi.color} transform rotate-180`} />
              ) : null}
            </div>
            <p className="text-3xl font-semibold text-gray-900 mb-1">{kpi.value}</p>
            {kpi.change && <p className={`text-xs ${kpi.color}`}>{kpi.change}</p>}
          </div>
        ))}
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Utilisation par Département */}
        <div className="bg-white border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">Taux d'Utilisation par Département</h3>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={absencesParDepartement}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" key="grid-abs" />
                <XAxis dataKey="departement" stroke="#6B7280" key="xaxis-abs" />
                <YAxis stroke="#6B7280" key="yaxis-abs" />
                <Tooltip key="tooltip-abs" />
                <Legend key="legend-abs" />
                <Bar dataKey="utilisation" fill="#0A6ED1" name="Taux d'utilisation (%)" key="bar-abs" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Types de Congés */}
        <div className="bg-white border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">Répartition par Type de Congé</h3>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={typesCongés}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  key="pie-conges"
                >
                  {typesCongés.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip key="tooltip-pie" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Périodes Critiques */}
      <div className="bg-white border border-gray-200 mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-orange-600 mr-2" />
            <h3 className="text-base font-semibold text-gray-900">Absences Critiques - Période Estivale</h3>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {periodesCritiques.map((periode, index) => (
              <div key={index} className="bg-orange-50 border border-orange-200 p-4">
                <p className="text-sm font-medium text-orange-900 mb-2">{periode.periode}</p>
                <p className="text-2xl font-semibold text-gray-900 mb-1">{periode.absences} employés</p>
                <p className="text-xs text-orange-700">{periode.pourcentage}% de l'effectif</p>
                <div className="mt-3 w-full bg-orange-200 h-2">
                  <div className="bg-orange-600 h-2" style={{ width: `${periode.pourcentage}%` }}></div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-orange-100 border-l-4 border-orange-600">
            <p className="text-sm text-orange-900">
              ⚠️ Attention : Les mois de Juin, Juillet et Août présentent plus de 49% d'absences. Planification recommandée.
            </p>
          </div>
        </div>
      </div>

      {/* Calendrier Global */}
      <div className="bg-white border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center">
            <Calendar className="w-5 h-5 text-[#0A6ED1] mr-2" />
            <h3 className="text-base font-semibold text-gray-900">Calendrier Global des Absences à Venir</h3>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date Début</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employé</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Département</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durée</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {calendrierGlobal.map((absence, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(absence.date).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{absence.employe}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{absence.departement}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800">
                      {absence.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{absence.jours} jour{absence.jours > 1 ? 's' : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">Mode Observatoire Uniquement</h4>
        <p className="text-sm text-blue-800">
          En tant qu'Administrateur d'Organisation, vous avez accès aux statistiques et au calendrier global des congés.
          L'approbation et la gestion des demandes sont effectuées par l'équipe RH.
        </p>
      </div>
    </div>
  );
}
