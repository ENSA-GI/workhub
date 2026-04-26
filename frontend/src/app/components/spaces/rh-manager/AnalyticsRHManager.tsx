import { BookOpen, Award, TrendingUp, Users, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

export default function AnalyticsRHManager() {
  const competencesPresentes = [
    { id: 'comp-1', competence: 'JavaScript/React', niveau: 85, employes: 12 },
    { id: 'comp-2', competence: 'Python', niveau: 70, employes: 8 },
    { id: 'comp-3', competence: 'SQL/Bases de données', niveau: 75, employes: 10 },
    { id: 'comp-4', competence: 'DevOps/CI-CD', niveau: 60, employes: 6 },
    { id: 'comp-5', competence: 'Cloud (AWS/Azure)', niveau: 55, employes: 5 },
  ];

  const gapCompetences = [
    { competence: 'Machine Learning', present: 30, requis: 80 },
    { competence: 'Cybersécurité', present: 40, requis: 85 },
    { competence: 'Architecture Cloud', present: 55, requis: 90 },
    { competence: 'Kubernetes', present: 35, requis: 75 },
    { competence: 'Data Science', present: 45, requis: 80 },
  ];

  const formationsRecommandees = [
    {
      id: 1,
      titre: 'Machine Learning & IA - Fondamentaux',
      competence: 'Machine Learning',
      gap: 50,
      duree: '5 jours',
      priorite: 'Haute',
      cible: '8-10 employés',
      cout: 'MAD 4,500',
    },
    {
      id: 2,
      titre: 'Cybersécurité Avancée - OWASP & Best Practices',
      competence: 'Cybersécurité',
      gap: 45,
      duree: '4 jours',
      priorite: 'Haute',
      cible: '6-8 employés',
      cout: 'MAD 3,800',
    },
    {
      id: 3,
      titre: 'Kubernetes pour DevOps',
      competence: 'Kubernetes',
      gap: 40,
      duree: '3 jours',
      priorite: 'Moyenne',
      cible: '5-6 employés',
      cout: 'MAD 2,900',
    },
    {
      id: 4,
      titre: 'Architecture Cloud AWS - Solutions Architect',
      competence: 'Architecture Cloud',
      gap: 35,
      duree: '5 jours',
      priorite: 'Moyenne',
      cible: '4-5 employés',
      cout: 'MAD 4,200',
    },
    {
      id: 5,
      titre: 'Data Science avec Python & Pandas',
      competence: 'Data Science',
      gap: 35,
      duree: '4 jours',
      priorite: 'Basse',
      cible: '6-7 employés',
      cout: 'MAD 3,500',
    },
  ];

  const indicateursRH = [
    { label: 'Satisfaction Employés', value: '83%', trend: 'stable', color: 'text-blue-600' },
    { label: 'Taux de Rétention', value: '89%', trend: 'up', color: 'text-green-600' },
    { label: 'Engagement Moyen', value: '76%', trend: 'up', color: 'text-purple-600' },
    { label: 'Productivité', value: '91%', trend: 'up', color: 'text-orange-600' },
  ];

  return (
    <div className="p-6 bg-[#F5F7FA]">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Analytics & Formations</h1>
        <p className="text-sm text-gray-600 mt-1">Analyses RH et recommandations de développement des compétences</p>
      </div>

      {/* Indicateurs RH Globaux */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {indicateursRH.map((indic, index) => (
          <div key={index} className="bg-white border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-medium text-gray-500 uppercase">{indic.label}</h3>
              {indic.trend === 'up' ? (
                <TrendingUp className={`w-4 h-4 ${indic.color}`} />
              ) : (
                <div className="w-4 h-4"></div>
              )}
            </div>
            <p className="text-3xl font-semibold text-gray-900">{indic.value}</p>
          </div>
        ))}
      </div>

      {/* Compétences Présentes et Gap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Compétences Présentes */}
        <div className="bg-white border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">Compétences Présentes dans l'Équipe</h3>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={competencesPresentes}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" key="grid-comp" />
                <XAxis dataKey="competence" stroke="#6B7280" angle={-45} textAnchor="end" height={100} key="xaxis-comp" />
                <YAxis stroke="#6B7280" key="yaxis-comp" />
                <Tooltip key="tooltip-comp" />
                <Legend key="legend-comp" />
                <Bar dataKey="niveau" fill="#0A6ED1" name="Niveau moyen (%)" key="bar-comp" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gap de Compétences */}
        <div className="bg-white border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">Gap de Compétences</h3>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={gapCompetences}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" key="grid-gap" />
                <XAxis dataKey="competence" stroke="#6B7280" angle={-45} textAnchor="end" height={100} key="xaxis-gap" />
                <YAxis stroke="#6B7280" key="yaxis-gap" />
                <Tooltip key="tooltip-gap" />
                <Legend key="legend-gap" />
                <Bar dataKey="present" fill="#10B981" name="Niveau actuel (%)" key="bar-present" />
                <Bar dataKey="requis" fill="#F59E0B" name="Niveau requis (%)" key="bar-requis" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Formations Recommandées */}
      <div className="bg-white border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Top Formations Recommandées</h3>
            <p className="text-sm text-gray-600 mt-1">Basé sur l'analyse des gaps de compétences</p>
          </div>
          <BookOpen className="w-6 h-6 text-[#0A6ED1]" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Formation</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Compétence Ciblée</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gap</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durée</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priorité</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cible</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Coût Estimé</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {formationsRecommandees.map((formation) => (
                <tr key={formation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-start">
                      <Award className="w-5 h-5 text-[#0A6ED1] mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-sm font-medium text-gray-900">{formation.titre}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{formation.competence}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 h-2 mr-2">
                        <div
                          className="bg-orange-600 h-2"
                          style={{ width: `${formation.gap}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-900">{formation.gap}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{formation.duree}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs ${
                        formation.priorite === 'Haute'
                          ? 'bg-red-100 text-red-800'
                          : formation.priorite === 'Moyenne'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {formation.priorite}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{formation.cible}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{formation.cout}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 p-4">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-blue-900 mb-2">Recommandations IA</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Prioriser les formations en Machine Learning et Cybersécurité pour combler les gaps critiques</li>
              <li>• Planifier les sessions sur Q2-Q3 2026 pour maximiser l'impact opérationnel</li>
              <li>• Considérer des formations certifiantes pour augmenter la rétention des talents</li>
              <li>• Budget estimé total pour le top 5 formations : MAD 18,900</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
