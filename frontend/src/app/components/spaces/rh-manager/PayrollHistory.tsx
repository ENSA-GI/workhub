import { TrendingUp, Download, Calendar, DollarSign, Users, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { useState } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function PayrollHistory() {
  const [selectedYear, setSelectedYear] = useState('2026');

  const monthlyEvolution = [
    { id: 'jan', mois: 'Jan', salaireBrut: 198000, salaireNet: 151740, charges: 46260 },
    { id: 'feb', mois: 'Fév', salaireBrut: 198000, salaireNet: 151740, charges: 46260 },
    { id: 'mar', mois: 'Mar', salaireBrut: 205000, salaireNet: 157050, charges: 47950 },
    { id: 'apr', mois: 'Avr', salaireBrut: 208000, salaireNet: 159360, charges: 48640 },
    { id: 'may', mois: 'Mai', salaireBrut: 208000, salaireNet: 159360, charges: 48640 },
    { id: 'jun', mois: 'Juin', salaireBrut: 212000, salaireNet: 162480, charges: 49520 },
  ];

  const departmentCosts = [
    { id: 'dept-it', departement: 'IT', cout: 85000, employees: 15 },
    { id: 'dept-ventes', departement: 'Ventes', cout: 62000, employees: 12 },
    { id: 'dept-marketing', departement: 'Marketing', cout: 38000, employees: 8 },
    { id: 'dept-rh', departement: 'RH', cout: 28000, employees: 5 },
    { id: 'dept-finance', departement: 'Finance', cout: 35000, employees: 5 },
  ];

  const chargesDistribution = [
    { id: 'cnss', name: 'CNSS', value: 9318, color: '#0A6ED1' },
    { id: 'amo', name: 'AMO', value: 4701, color: '#10B981' },
    { id: 'ir', name: 'IR', value: 20800, color: '#F59E0B' },
    { id: 'autres', name: 'Autres', value: 4000, color: '#8B5CF6' },
  ];

  const yearlyComparison = [
    { periode: 'Q1 2026', masseSalariale: 'MAD 601,000', variation: '+3.2%', employesMoyens: 44 },
    { periode: 'Q2 2026', masseSalariale: 'MAD 628,000', variation: '+4.5%', employesMoyens: 45 },
    { periode: 'Cumul 2026', masseSalariale: 'MAD 1,229,000', variation: '+3.8%', employesMoyens: 45 },
  ];

  const totalBrutYTD = monthlyEvolution.reduce((sum, m) => sum + m.salaireBrut, 0);
  const totalNetYTD = monthlyEvolution.reduce((sum, m) => sum + m.salaireNet, 0);
  const totalChargesYTD = monthlyEvolution.reduce((sum, m) => sum + m.charges, 0);

  return (
    <div className="p-6 bg-[#F5F7FA]">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Historique et Statistiques de Paie</h1>
          <p className="text-sm text-gray-600 mt-1">Analysez l'évolution de vos coûts salariaux</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]"
          >
            <option value="2026">Année 2026</option>
            <option value="2025">Année 2025</option>
            <option value="2024">Année 2024</option>
          </select>
          <button className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Exporter Rapport
          </button>
        </div>
      </div>

      {/* Year-to-Date Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <BarChart3 className="w-6 h-6 text-[#0A6ED1]" />
          </div>
          <h3 className="text-xs font-medium text-gray-500 uppercase mb-2">Masse Salariale Brute YTD</h3>
          <p className="text-3xl font-semibold text-gray-900">MAD {totalBrutYTD.toLocaleString()}</p>
          <p className="text-xs text-green-600 mt-1">+3.8% vs 2025</p>
        </div>
        <div className="bg-white border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <DollarSign className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-xs font-medium text-gray-500 uppercase mb-2">Salaire Net Total YTD</h3>
          <p className="text-3xl font-semibold text-green-600">MAD {totalNetYTD.toLocaleString()}</p>
          <p className="text-xs text-gray-600 mt-1">76.7% du brut</p>
        </div>
        <div className="bg-white border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <TrendingUp className="w-6 h-6 text-orange-600" />
          </div>
          <h3 className="text-xs font-medium text-gray-500 uppercase mb-2">Charges Sociales YTD</h3>
          <p className="text-3xl font-semibold text-orange-600">MAD {totalChargesYTD.toLocaleString()}</p>
          <p className="text-xs text-gray-600 mt-1">23.3% du brut</p>
        </div>
        <div className="bg-white border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <Users className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-xs font-medium text-gray-500 uppercase mb-2">Coût Moyen par Employé</h3>
          <p className="text-3xl font-semibold text-purple-600">MAD 4,622</p>
          <p className="text-xs text-gray-600 mt-1">Par mois</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Monthly Evolution */}
        <div className="bg-white border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center">
              <Calendar className="w-5 h-5 text-[#0A6ED1] mr-2" />
              <h3 className="text-base font-semibold text-gray-900">Évolution Mensuelle de la Masse Salariale</h3>
            </div>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyEvolution}>
                <CartesianGrid key="grid-1" strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis key="xaxis-1" dataKey="mois" stroke="#6B7280" />
                <YAxis key="yaxis-1" stroke="#6B7280" />
                <Tooltip key="tooltip-1" />
                <Legend key="legend-1" />
                <Line key="line-brut" type="monotone" dataKey="salaireBrut" stroke="#0A6ED1" strokeWidth={2} name="Salaire Brut (MAD)" />
                <Line key="line-net" type="monotone" dataKey="salaireNet" stroke="#10B981" strokeWidth={2} name="Salaire Net (MAD)" />
                <Line key="line-charges" type="monotone" dataKey="charges" stroke="#F59E0B" strokeWidth={2} name="Charges (MAD)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Costs */}
        <div className="bg-white border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center">
              <BarChart3 className="w-5 h-5 text-[#0A6ED1] mr-2" />
              <h3 className="text-base font-semibold text-gray-900">Coûts Salariaux par Département (Avril)</h3>
            </div>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentCosts}>
                <CartesianGrid key="grid-2" strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis key="xaxis-2" dataKey="departement" stroke="#6B7280" />
                <YAxis key="yaxis-2" stroke="#6B7280" />
                <Tooltip key="tooltip-2" />
                <Legend key="legend-2" />
                <Bar key="bar-cout" dataKey="cout" fill="#0A6ED1" name="Coût (MAD)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charges Distribution */}
        <div className="bg-white border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center">
              <PieChartIcon className="w-5 h-5 text-[#0A6ED1] mr-2" />
              <h3 className="text-base font-semibold text-gray-900">Répartition des Charges Sociales</h3>
            </div>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  key="pie-1"
                  data={chargesDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chargesDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip key="tooltip-3" />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {chargesDistribution.map((charge) => (
                <div key={charge.id} className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200">
                  <div className="flex items-center">
                    <div className="w-3 h-3 mr-2" style={{ backgroundColor: charge.color }}></div>
                    <span className="text-xs text-gray-700">{charge.name}</span>
                  </div>
                  <span className="text-xs font-medium text-gray-900">MAD {charge.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cost per Employee by Department */}
        <div className="bg-white border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center">
              <Users className="w-5 h-5 text-[#0A6ED1] mr-2" />
              <h3 className="text-base font-semibold text-gray-900">Coût Moyen par Département</h3>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {departmentCosts.map((dept) => {
                const avgCost = dept.cout / dept.employees;
                const maxCost = Math.max(...departmentCosts.map(d => d.cout / d.employees));
                const percentage = (avgCost / maxCost) * 100;

                return (
                  <div key={dept.id}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">{dept.departement}</span>
                      <span className="text-sm font-semibold text-gray-900">MAD {avgCost.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}</span>
                    </div>
                    <div className="w-full bg-gray-200 h-3">
                      <div
                        className="bg-[#0A6ED1] h-3"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{dept.employees} employés</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Quarterly Comparison */}
      <div className="bg-white border border-gray-200 mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center">
            <TrendingUp className="w-5 h-5 text-[#0A6ED1] mr-2" />
            <h3 className="text-base font-semibold text-gray-900">Comparaisons Trimestrielles</h3>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {yearlyComparison.map((comp, index) => (
              <div key={index} className="bg-gray-50 border border-gray-200 p-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-4">{comp.periode}</h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 uppercase mb-1">Masse Salariale</p>
                    <p className="text-2xl font-semibold text-gray-900">{comp.masseSalariale}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase mb-1">Variation</p>
                    <p className="text-lg font-medium text-green-600">{comp.variation}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase mb-1">Effectif Moyen</p>
                    <p className="text-lg font-medium text-gray-900">{comp.employesMoyens} employés</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Historical Data Table */}
      <div className="bg-white border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-900">Historique Mensuel Détaillé - 2026</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mois</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Salaire Brut</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">CNSS</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">AMO</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">IR</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Salaire Net</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Variation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {monthlyEvolution.map((month, index) => {
                const cnss = month.salaireBrut * 0.0448;
                const amo = month.salaireBrut * 0.0226;
                const ir = month.salaireBrut * 0.10;
                const variation = index > 0 ? ((month.salaireBrut - monthlyEvolution[index - 1].salaireBrut) / monthlyEvolution[index - 1].salaireBrut * 100).toFixed(1) : '0.0';

                return (
                  <tr key={month.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{month.mois} 2026</td>
                    <td className="px-6 py-4 text-sm text-right text-gray-900">MAD {month.salaireBrut.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-right text-gray-600">MAD {cnss.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}</td>
                    <td className="px-6 py-4 text-sm text-right text-gray-600">MAD {amo.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}</td>
                    <td className="px-6 py-4 text-sm text-right text-gray-600">MAD {ir.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}</td>
                    <td className="px-6 py-4 text-sm text-right font-medium text-green-600">MAD {month.salaireNet.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-right">
                      <span className={`${parseFloat(variation) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {parseFloat(variation) >= 0 ? '+' : ''}{variation}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-gray-50 border-t-2 border-gray-300">
              <tr>
                <td className="px-6 py-4 text-sm font-semibold text-gray-900 uppercase">Total YTD</td>
                <td className="px-6 py-4 text-sm text-right font-semibold text-gray-900">MAD {totalBrutYTD.toLocaleString()}</td>
                <td className="px-6 py-4 text-sm text-right font-semibold text-gray-900">MAD {(totalBrutYTD * 0.0448).toLocaleString('fr-FR', { maximumFractionDigits: 0 })}</td>
                <td className="px-6 py-4 text-sm text-right font-semibold text-gray-900">MAD {(totalBrutYTD * 0.0226).toLocaleString('fr-FR', { maximumFractionDigits: 0 })}</td>
                <td className="px-6 py-4 text-sm text-right font-semibold text-gray-900">MAD {(totalBrutYTD * 0.10).toLocaleString('fr-FR', { maximumFractionDigits: 0 })}</td>
                <td className="px-6 py-4 text-sm text-right font-semibold text-green-600">MAD {totalNetYTD.toLocaleString()}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
