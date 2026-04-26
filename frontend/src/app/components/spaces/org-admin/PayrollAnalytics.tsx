import { DollarSign, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function PayrollAnalytics() {
  const masseSalarialeEvolution = [
    { id: 'ms-jan', mois: 'Jan', masseSalariale: 168000, charges: 33600 },
    { id: 'ms-fev', mois: 'Fév', masseSalariale: 176000, charges: 35200 },
    { id: 'ms-mar', mois: 'Mar', masseSalariale: 185000, charges: 37000 },
    { id: 'ms-avr', mois: 'Avr', masseSalariale: 198000, charges: 39600 },
  ];

  const coutParDepartement = [
    { id: 'dept-it', departement: 'IT', cout: 82500 },
    { id: 'dept-ventes', departement: 'Ventes', cout: 52800 },
    { id: 'dept-marketing', departement: 'Marketing', cout: 35200 },
    { id: 'dept-finance', departement: 'Finance', cout: 19800 },
    { id: 'dept-rh', departement: 'RH', cout: 7700 },
  ];

  const kpis = [
    { label: 'Masse Salariale Avril', value: 'MAD 198,000', trend: 'up', change: '+7%', color: 'text-green-600' },
    { label: 'Coût Moyen/Employé', value: 'MAD 4,400', trend: 'up', change: '+2%', color: 'text-orange-600' },
    { label: 'Charges Sociales', value: 'MAD 39,600', trend: 'up', change: '+7%', color: 'text-blue-600' },
    { label: 'Budget Annuel Utilisé', value: '32%', trend: 'stable', change: '', color: 'text-gray-600' },
  ];

  const comparaison = [
    { periode: 'Mars vs Avril', variation: '+7.0%', montant: '+MAD 13,000' },
    { periode: 'Févr vs Avril', variation: '+12.5%', montant: '+MAD 22,000' },
    { periode: 'Jan vs Avril', variation: '+17.9%', montant: '+MAD 30,000' },
  ];

  return (
    <div className="p-6 bg-[#F5F7FA]">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Analytics Paie</h1>
        <p className="text-sm text-gray-600 mt-1">Vue analytique de la masse salariale et des coûts</p>
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
                <TrendingDown className={`w-4 h-4 ${kpi.color}`} />
              ) : null}
            </div>
            <p className="text-3xl font-semibold text-gray-900 mb-1">{kpi.value}</p>
            {kpi.change && <p className={`text-xs ${kpi.color}`}>{kpi.change}</p>}
          </div>
        ))}
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Évolution Masse Salariale */}
        <div className="bg-white border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">Évolution de la Masse Salariale</h3>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={masseSalarialeEvolution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" key="grid-ms" />
                <XAxis dataKey="mois" stroke="#6B7280" key="xaxis-ms" />
                <YAxis stroke="#6B7280" key="yaxis-ms" />
                <Tooltip key="tooltip-ms" />
                <Legend key="legend-ms" />
                <Line type="monotone" dataKey="masseSalariale" stroke="#0A6ED1" strokeWidth={2} name="Masse Salariale (MAD )" key="line-ms" />
                <Line type="monotone" dataKey="charges" stroke="#F59E0B" strokeWidth={2} name="Charges Sociales (MAD )" key="line-charges" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Coût par Département */}
        <div className="bg-white border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">Coûts par Département (Avril)</h3>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={coutParDepartement}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" key="grid-dept" />
                <XAxis dataKey="departement" stroke="#6B7280" key="xaxis-dept" />
                <YAxis stroke="#6B7280" key="yaxis-dept" />
                <Tooltip key="tooltip-dept" />
                <Legend key="legend-dept" />
                <Bar dataKey="cout" fill="#10B981" name="Coût (MAD )" key="bar-dept" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Comparaisons */}
      <div className="bg-white border border-gray-200 mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center">
            <BarChart3 className="w-5 h-5 text-[#0A6ED1] mr-2" />
            <h3 className="text-base font-semibold text-gray-900">Comparaisons Mensuelles</h3>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {comparaison.map((comp, index) => (
              <div key={index} className="bg-gray-50 border border-gray-200 p-4">
                <p className="text-sm text-gray-600 mb-2">{comp.periode}</p>
                <p className="text-2xl font-semibold text-gray-900 mb-1">{comp.variation}</p>
                <p className="text-sm text-green-600">{comp.montant}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Résumés Détaillés */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Répartition des Coûts */}
        <div className="bg-white border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">Répartition des Coûts (Avril)</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex justify-between pb-3 border-b border-gray-100">
              <span className="text-sm text-gray-600">Salaires Bruts</span>
              <span className="text-sm font-medium text-gray-900">MAD 198,000</span>
            </div>
            <div className="flex justify-between pb-3 border-b border-gray-100">
              <span className="text-sm text-gray-600">Charges Patronales (20%)</span>
              <span className="text-sm font-medium text-gray-900">MAD 39,600</span>
            </div>
            <div className="flex justify-between pb-3 border-b border-gray-100">
              <span className="text-sm text-gray-600">Primes Variables</span>
              <span className="text-sm font-medium text-gray-900">MAD 8,500</span>
            </div>
            <div className="flex justify-between pb-3 border-b border-gray-100">
              <span className="text-sm text-gray-600">Avantages (tickets, assurance)</span>
              <span className="text-sm font-medium text-gray-900">MAD 4,200</span>
            </div>
            <div className="flex justify-between pt-2 border-t-2 border-gray-300">
              <span className="text-sm font-semibold text-gray-900">Coût Total</span>
              <span className="text-base font-bold text-[#0A6ED1]">MAD 250,300</span>
            </div>
          </div>
        </div>

        {/* Budget Annuel */}
        <div className="bg-white border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">Budget Annuel 2026</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex justify-between pb-3 border-b border-gray-100">
              <span className="text-sm text-gray-600">Budget Total Annuel</span>
              <span className="text-sm font-medium text-gray-900">MAD 2,400,000</span>
            </div>
            <div className="flex justify-between pb-3 border-b border-gray-100">
              <span className="text-sm text-gray-600">Dépensé (Jan-Avr)</span>
              <span className="text-sm font-medium text-gray-900">MAD 762,000</span>
            </div>
            <div className="flex justify-between pb-3 border-b border-gray-100">
              <span className="text-sm text-gray-600">Restant</span>
              <span className="text-sm font-medium text-green-600">MAD 1,638,000</span>
            </div>
            <div className="flex justify-between pb-3 border-b border-gray-100">
              <span className="text-sm text-gray-600">Projection Fin d'Année</span>
              <span className="text-sm font-medium text-gray-900">MAD 2,376,000</span>
            </div>
            <div className="pt-2">
              <p className="text-xs text-gray-600 mb-2">Utilisation</p>
              <div className="w-full bg-gray-200 h-3">
                <div className="bg-[#0A6ED1] h-3" style={{ width: '32%' }}></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">32% utilisé</p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">Mode Analyse Uniquement</h4>
        <p className="text-sm text-blue-800">
          En tant qu'Administrateur d'Organisation, vous avez accès aux analyses et rapports de paie.
          La génération de la paie et l'ajout de primes sont effectués par l'équipe RH.
        </p>
      </div>
    </div>
  );
}
