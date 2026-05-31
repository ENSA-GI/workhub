import { Briefcase, TrendingUp, Clock, Users, BarChart3 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function RecruitmentAnalytics() {
  const performanceOffres = [
    { id: 'off-1', offre: 'Dev Full-Stack', candidatures: 43, preselectiones: 12, entretiens: 5, embauches: 1 },
    { id: 'off-2', offre: 'DevOps Engineer', candidatures: 38, preselectiones: 10, entretiens: 4, embauches: 0 },
    { id: 'off-3', offre: 'Chef Projet Marketing', candidatures: 52, preselectiones: 15, entretiens: 6, embauches: 1 },
    { id: 'off-4', offre: 'Analyste Données', candidatures: 31, preselectiones: 8, entretiens: 3, embauches: 0 },
    { id: 'off-5', offre: 'Resp. Commercial', candidatures: 29, preselectiones: 7, entretiens: 2, embauches: 0 },
  ];

  const tempsRecrutement = [
    { id: 'tr-jan', mois: 'Jan', temps: 28 },
    { id: 'tr-fev', mois: 'Fév', temps: 24 },
    { id: 'tr-mar', mois: 'Mar', temps: 22 },
    { id: 'tr-avr', mois: 'Avr', temps: 21 },
  ];

  const tauxConversion = [
    { id: 'tc-jan', mois: 'Jan', taux: 12 },
    { id: 'tc-fev', mois: 'Fév', taux: 14 },
    { id: 'tc-mar', mois: 'Mar', taux: 15 },
    { id: 'tc-avr', mois: 'Avr', taux: 16 },
  ];

  const kpis = [
    { label: 'Offres Actives', value: '7', trend: 'stable', change: '', color: 'text-gray-600' },
    { label: 'Candidatures Reçues', value: '193', trend: 'up', change: '+12%', color: 'text-green-600' },
    { label: 'Temps Moyen Recrutement', value: '21 jours', trend: 'down', change: '-3j', color: 'text-green-600' },
    { label: 'Taux de Conversion', value: '16%', trend: 'up', change: '+2%', color: 'text-green-600' },
  ];

  const offresActives = [
    { id: 1, titre: 'Développeur Full-Stack Senior', departement: 'IT', candidatures: 43, statut: 'Ouverte', datePublication: '2026-04-15' },
    { id: 2, titre: 'DevOps Engineer', departement: 'IT', candidatures: 38, statut: 'Ouverte', datePublication: '2026-04-05' },
    { id: 3, titre: 'Chef de Projet Marketing Digital', departement: 'Marketing', candidatures: 52, statut: 'Ouverte', datePublication: '2026-04-12' },
    { id: 4, titre: 'Analyste de Données', departement: 'IT', candidatures: 31, statut: 'Ouverte', datePublication: '2026-04-10' },
    { id: 5, titre: 'Responsable Commercial', departement: 'Ventes', candidatures: 29, statut: 'Ouverte', datePublication: '2026-04-08' },
  ];

  return (
    <div className="p-6 bg-[#F5F7FA]">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Analytics Recrutement</h1>
        <p className="text-sm text-gray-600 mt-1">Suivi de la performance du recrutement</p>
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
        {/* Temps Moyen de Recrutement */}
        <div className="bg-white border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">Temps Moyen de Recrutement (jours)</h3>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={tempsRecrutement}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" key="grid-temps" />
                <XAxis dataKey="mois" stroke="#6B7280" key="xaxis-temps" />
                <YAxis stroke="#6B7280" key="yaxis-temps" />
                <Tooltip key="tooltip-temps" />
                <Legend key="legend-temps" />
                <Line type="monotone" dataKey="temps" stroke="#0A6ED1" strokeWidth={2} name="Jours" key="line-temps" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Taux de Conversion */}
        <div className="bg-white border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">Taux de Conversion (%)</h3>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={tauxConversion}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" key="grid-taux" />
                <XAxis dataKey="mois" stroke="#6B7280" key="xaxis-taux" />
                <YAxis stroke="#6B7280" key="yaxis-taux" />
                <Tooltip key="tooltip-taux" />
                <Legend key="legend-taux" />
                <Line type="monotone" dataKey="taux" stroke="#10B981" strokeWidth={2} name="Taux (%)" key="line-taux" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Performance des Offres */}
      <div className="bg-white border border-gray-200 mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center">
            <BarChart3 className="w-5 h-5 text-[#0A6ED1] mr-2" />
            <h3 className="text-base font-semibold text-gray-900">Performance par Offre</h3>
          </div>
        </div>
        <div className="p-6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceOffres}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" key="grid-perf" />
              <XAxis dataKey="offre" stroke="#6B7280" angle={-45} textAnchor="end" height={100} key="xaxis-perf" />
              <YAxis stroke="#6B7280" key="yaxis-perf" />
              <Tooltip key="tooltip-perf" />
              <Legend key="legend-perf" />
              <Bar dataKey="candidatures" fill="#0A6ED1" name="Candidatures" key="bar-cand" />
              <Bar dataKey="preselectiones" fill="#F59E0B" name="Présélections" key="bar-presel" />
              <Bar dataKey="entretiens" fill="#10B981" name="Entretiens" key="bar-ent" />
              <Bar dataKey="embauches" fill="#8B5CF6" name="Embauches" key="bar-emb" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Liste des Offres Actives */}
      <div className="bg-white border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">Offres Actives</h3>
            <span className="inline-flex px-3 py-1 text-xs bg-green-100 text-green-800">
              {offresActives.length} offres
            </span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Offre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Département</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Candidatures</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Publiée le</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {offresActives.map((offre) => (
                <tr key={offre.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Briefcase className="w-4 h-4 text-[#0A6ED1] mr-2" />
                      <span className="text-sm font-medium text-gray-900">{offre.titre}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{offre.departement}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">{offre.candidatures}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2 py-1 text-xs bg-green-100 text-green-800">
                      {offre.statut}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(offre.datePublication).toLocaleDateString('fr-FR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Statistiques Détaillées */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 p-6">
          <h4 className="text-xs font-medium text-gray-500 uppercase mb-3">Funnel de Conversion</h4>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Candidatures</span>
                <span className="font-medium text-gray-900">193 (100%)</span>
              </div>
              <div className="w-full bg-gray-200 h-2">
                <div className="bg-[#0A6ED1] h-2" style={{ width: '100%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Présélections</span>
                <span className="font-medium text-gray-900">52 (27%)</span>
              </div>
              <div className="w-full bg-gray-200 h-2">
                <div className="bg-[#F59E0B] h-2" style={{ width: '27%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Entretiens</span>
                <span className="font-medium text-gray-900">20 (10%)</span>
              </div>
              <div className="w-full bg-gray-200 h-2">
                <div className="bg-[#10B981] h-2" style={{ width: '10%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Embauches</span>
                <span className="font-medium text-gray-900">2 (1%)</span>
              </div>
              <div className="w-full bg-gray-200 h-2">
                <div className="bg-[#8B5CF6] h-2" style={{ width: '1%' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-6">
          <h4 className="text-xs font-medium text-gray-500 uppercase mb-3">Sources Candidatures</h4>
          <div className="space-y-3">
            <div className="flex justify-between pb-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">LinkedIn</span>
              <span className="text-sm font-medium text-gray-900">78 (40%)</span>
            </div>
            <div className="flex justify-between pb-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Site Carrières</span>
              <span className="text-sm font-medium text-gray-900">65 (34%)</span>
            </div>
            <div className="flex justify-between pb-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Référencement</span>
              <span className="text-sm font-medium text-gray-900">32 (17%)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Autres</span>
              <span className="text-sm font-medium text-gray-900">18 (9%)</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-6">
          <h4 className="text-xs font-medium text-gray-500 uppercase mb-3">Coûts Recrutement</h4>
          <div className="space-y-3">
            <div className="flex justify-between pb-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Coût par Embauche</span>
              <span className="text-sm font-medium text-gray-900">MAD 3,450</span>
            </div>
            <div className="flex justify-between pb-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Budget Q1 2026</span>
              <span className="text-sm font-medium text-gray-900">MAD 12,000</span>
            </div>
            <div className="flex justify-between pb-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Dépensé</span>
              <span className="text-sm font-medium text-gray-900">MAD 6,900</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Restant</span>
              <span className="text-sm font-medium text-green-600">MAD 5,100</span>
            </div>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">Mode Suivi Performance Uniquement</h4>
        <p className="text-sm text-blue-800">
          En tant qu'Administrateur d'Organisation, vous avez accès aux KPIs et statistiques de recrutement.
          La gestion des candidatures et le processus de recrutement sont effectués par l'équipe RH.
        </p>
      </div>
    </div>
  );
}
