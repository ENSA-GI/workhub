import { Users, TrendingUp, DollarSign, Calendar, Briefcase, UserPlus } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function DashboardRHManager() {
  const effectifsEvolution = [
    { id: 'eff-jan', month: 'Jan', effectif: 38 },
    { id: 'eff-fev', month: 'Fév', effectif: 40 },
    { id: 'eff-mar', month: 'Mar', effectif: 42 },
    { id: 'eff-avr', month: 'Avr', effectif: 45 },
  ];

  const departementRepartition = [
    { id: 'dept-it', name: 'IT', count: 15 },
    { id: 'dept-ventes', name: 'Ventes', count: 12 },
    { id: 'dept-marketing', name: 'Marketing', count: 8 },
    { id: 'dept-finance', name: 'Finance', count: 6 },
    { id: 'dept-rh', name: 'RH', count: 4 },
  ];

  const contractTypes = [
    { name: 'CDI', value: 32, color: '#0A6ED1' },
    { name: 'CDD', value: 8, color: '#10B981' },
    { name: 'Stage', value: 5, color: '#F59E0B' },
  ];

  const paieEvolution = [
    { id: 'paie-jan', month: 'Jan', masse: 168000 },
    { id: 'paie-fev', month: 'Fév', masse: 176000 },
    { id: 'paie-mar', month: 'Mar', masse: 185000 },
    { id: 'paie-avr', month: 'Avr', masse: 198000 },
  ];

  const congesParDept = [
    { id: 'cong-it', dept: 'IT', taux: 68 },
    { id: 'cong-ventes', dept: 'Ventes', taux: 72 },
    { id: 'cong-marketing', dept: 'Marketing', taux: 85 },
    { id: 'cong-finance', dept: 'Finance', taux: 58 },
  ];

  return (
    <div className="p-6 bg-[#F5F7FA]">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard RH</h1>
        <p className="text-sm text-gray-600 mt-1">Vue d'ensemble de la gestion des ressources humaines</p>
      </div>

      {/* KPIs Principaux */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-medium text-gray-500 uppercase">Effectif Actuel</h3>
            <Users className="w-5 h-5 text-[#0A6ED1]" />
          </div>
          <p className="text-3xl font-semibold text-gray-900 mb-1">45</p>
          <div className="flex items-center text-xs text-green-600">
            <TrendingUp className="w-3 h-3 mr-1" />
            <span>+3 ce mois</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-medium text-gray-500 uppercase">Masse Salariale</h3>
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-semibold text-gray-900 mb-1">MAD 198,000</p>
          <p className="text-xs text-gray-600">Avril 2026</p>
        </div>

        <div className="bg-white border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-medium text-gray-500 uppercase">Coût Moyen/Employé</h3>
            <DollarSign className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-semibold text-gray-900 mb-1">MAD 4,400</p>
          <p className="text-xs text-gray-600">Par mois</p>
        </div>

        <div className="bg-white border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-medium text-gray-500 uppercase">Taux Utilisation Congés</h3>
            <Calendar className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-3xl font-semibold text-gray-900 mb-1">71%</p>
          <p className="text-xs text-gray-600">Moyenne entreprise</p>
        </div>
      </div>

      {/* Graphiques Effectifs et Paie */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Évolution Effectifs */}
        <div className="bg-white border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">Évolution des Effectifs</h3>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={effectifsEvolution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" key="grid-eff" />
                <XAxis dataKey="month" stroke="#6B7280" key="xaxis-eff" />
                <YAxis stroke="#6B7280" key="yaxis-eff" />
                <Tooltip key="tooltip-eff" />
                <Legend key="legend-eff" />
                <Line type="monotone" dataKey="effectif" stroke="#0A6ED1" strokeWidth={2} name="Employés" key="line-eff" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Évolution Masse Salariale */}
        <div className="bg-white border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">Évolution de la Paie</h3>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={paieEvolution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" key="grid-paie" />
                <XAxis dataKey="month" stroke="#6B7280" key="xaxis-paie" />
                <YAxis stroke="#6B7280" key="yaxis-paie" />
                <Tooltip key="tooltip-paie" />
                <Legend key="legend-paie" />
                <Line type="monotone" dataKey="masse" stroke="#10B981" strokeWidth={2} name="Masse Salariale (MAD )" key="line-paie" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Répartition par Département */}
        <div className="bg-white border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">Répartition par Département</h3>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={departementRepartition}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" key="grid-dept" />
                <XAxis dataKey="name" stroke="#6B7280" key="xaxis-dept" />
                <YAxis stroke="#6B7280" key="yaxis-dept" />
                <Tooltip key="tooltip-dept" />
                <Legend key="legend-dept" />
                <Bar dataKey="count" fill="#0A6ED1" name="Employés" key="bar-dept" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Type de Contrat */}
        <div className="bg-white border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">Type de Contrat</h3>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={contractTypes}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  key="pie-contract"
                >
                  {contractTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip key="tooltip-pie" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Congés et Recrutement */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Taux d'utilisation des congés par département */}
        <div className="bg-white border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">Départements les Plus Absents</h3>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={congesParDept} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" key="grid-cong" />
                <XAxis type="number" stroke="#6B7280" key="xaxis-cong" />
                <YAxis type="category" dataKey="dept" stroke="#6B7280" key="yaxis-cong" />
                <Tooltip key="tooltip-cong" />
                <Legend key="legend-cong" />
                <Bar dataKey="taux" fill="#F59E0B" name="Taux d'utilisation (%)" key="bar-cong" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Indicateurs Recrutement */}
        <div className="bg-white border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">Recrutement</h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center">
                <Briefcase className="w-5 h-5 text-[#0A6ED1] mr-3" />
                <span className="text-sm text-gray-600">Offres Actives</span>
              </div>
              <span className="text-2xl font-semibold text-gray-900">7</span>
            </div>
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center">
                <UserPlus className="w-5 h-5 text-green-600 mr-3" />
                <span className="text-sm text-gray-600">Candidatures Reçues</span>
              </div>
              <span className="text-2xl font-semibold text-gray-900">43</span>
            </div>
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-purple-600 mr-3" />
                <span className="text-sm text-gray-600">Temps Moyen Recrutement</span>
              </div>
              <span className="text-2xl font-semibold text-gray-900">21j</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <TrendingUp className="w-5 h-5 text-orange-600 mr-3" />
                <span className="text-sm text-gray-600">Taux de Conversion</span>
              </div>
              <span className="text-2xl font-semibold text-gray-900">16%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
