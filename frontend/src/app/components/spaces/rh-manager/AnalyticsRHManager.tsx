import { BookOpen, Award, TrendingUp, AlertCircle, BarChart3, PieChart, LineChart } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { motion } from 'motion/react';

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
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 max-w-7xl mx-auto space-y-8"
    >
      <div className="flex items-center space-x-4 mb-6">
        <motion.div 
          initial={{ scale: 0.8, rotate: -10 }} 
          animate={{ scale: 1, rotate: 0 }} 
          className="w-14 h-14 bg-gradient-to-tr from-[#0A6ED1] to-purple-500 rounded-2xl shadow-lg shadow-blue-500/30 flex items-center justify-center text-white"
        >
          <BarChart3 className="w-7 h-7" />
        </motion.div>
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">Analytics & Formations</h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">Analyses RH et recommandations de développement des compétences</p>
        </div>
      </div>

      {/* Indicateurs RH Globaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {indicateursRH.map((indic, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/80 backdrop-blur-xl border border-white/20 p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(10,110,209,0.1)] transition-all hover:-translate-y-1 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
               {index % 2 === 0 ? <PieChart className="w-16 h-16" /> : <LineChart className="w-16 h-16" />}
            </div>
            <div className="flex items-center justify-between mb-4 relative z-10">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">{indic.label}</h3>
              {indic.trend === 'up' && (
                <div className="p-2 bg-green-50 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
              )}
            </div>
            <p className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-gray-900 to-gray-600 relative z-10">{indic.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Compétences Présentes et Gap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Compétences Présentes */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-50/50 bg-gray-50/30">
            <h3 className="text-lg font-bold text-gray-900">Compétences Présentes dans l'Équipe</h3>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={competencesPresentes}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="competence" stroke="#9CA3AF" angle={-45} textAnchor="end" height={100} tick={{fontSize: 12}} />
                <YAxis stroke="#9CA3AF" tick={{fontSize: 12}} />
                <Tooltip cursor={{fill: '#f9fafb'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                <Legend wrapperStyle={{paddingTop: '20px'}} />
                <Bar dataKey="niveau" fill="url(#colorNiveau)" name="Niveau moyen (%)" radius={[4, 4, 0, 0]} />
                <defs>
                  <linearGradient id="colorNiveau" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0A6ED1" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="#0A6ED1" stopOpacity={0.4}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Gap de Compétences */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-50/50 bg-gray-50/30">
            <h3 className="text-lg font-bold text-gray-900">Analyse de Gap de Compétences</h3>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={gapCompetences}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="competence" stroke="#9CA3AF" angle={-45} textAnchor="end" height={100} tick={{fontSize: 12}} />
                <YAxis stroke="#9CA3AF" tick={{fontSize: 12}} />
                <Tooltip cursor={{fill: '#f9fafb'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                <Legend wrapperStyle={{paddingTop: '20px'}} />
                <Bar dataKey="present" fill="#10B981" name="Niveau actuel (%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="requis" fill="#F59E0B" name="Niveau requis (%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Top Formations Recommandées */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <div className="p-6 border-b border-gray-50/50 bg-gray-50/30 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Top Formations Recommandées</h3>
            <p className="text-sm text-gray-500 mt-1">Basé sur l'analyse des gaps de compétences</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-xl">
            <BookOpen className="w-6 h-6 text-[#0A6ED1]" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Formation</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Compétence Ciblée</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Gap</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Durée</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Priorité</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Cible</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Coût Estimé</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {formationsRecommandees.map((formation, idx) => (
                <motion.tr 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + (idx * 0.05) }}
                  key={formation.id} 
                  className="hover:bg-blue-50/30 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors mr-3">
                        <Award className="w-4 h-4 text-gray-400 group-hover:text-[#0A6ED1]" />
                      </div>
                      <span className="text-sm font-bold text-gray-800">{formation.titre}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-md">
                      {formation.competence}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-100 h-2 mr-2 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-orange-400 to-red-500 h-2 rounded-full"
                          style={{ width: `${formation.gap}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-gray-700">{formation.gap}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 font-medium">{formation.duree}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${
                        formation.priorite === 'Haute'
                          ? 'bg-red-50 text-red-600 border border-red-100'
                          : formation.priorite === 'Moyenne'
                          ? 'bg-orange-50 text-orange-600 border border-orange-100'
                          : 'bg-blue-50 text-blue-600 border border-blue-100'
                      }`}
                    >
                      {formation.priorite}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 font-medium">{formation.cible}</td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">{formation.cout}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Info Box */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100/50 p-6 rounded-3xl shadow-sm relative overflow-hidden"
      >
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl"></div>
        <div className="flex items-start relative z-10">
          <div className="p-3 bg-white rounded-2xl shadow-sm mr-4">
            <AlertCircle className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h4 className="text-base font-bold text-blue-900 mb-2">Recommandations IA (WorkHub AI)</h4>
            <ul className="text-sm text-blue-800/80 space-y-2 font-medium">
              <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-2"></span> Prioriser les formations en Machine Learning et Cybersécurité pour combler les gaps critiques</li>
              <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-2"></span> Planifier les sessions sur Q2-Q3 2026 pour maximiser l'impact opérationnel</li>
              <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-2"></span> Considérer des formations certifiantes pour augmenter la rétention des talents</li>
              <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-2"></span> Budget estimé total pour le top 5 formations : <strong className="ml-1 text-blue-900">MAD 18,900</strong></li>
            </ul>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
