import { AlertTriangle, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function SupportIncidents() {
  const incidents = [
    {
      id: 1,
      title: 'Service d\'authentification lent',
      organization: 'TechVision SARL',
      priority: 'Critique',
      status: 'Ouvert',
      createdAt: '2026-04-20 10:30',
      assignedTo: 'Équipe Technique',
      description: 'Temps de réponse du service d\'authentification supérieur à 150ms',
    },
    {
      id: 2,
      title: 'Erreur lors de la génération de paie',
      organization: 'Atlas Commerce',
      priority: 'Haute',
      status: 'En cours',
      createdAt: '2026-04-20 09:15',
      assignedTo: 'Support Niveau 3',
      description: 'Échec de génération de paie pour 5 employés',
    },
    {
      id: 3,
      title: 'Demande d\'augmentation de limite',
      organization: 'Innovate Solutions',
      priority: 'Moyenne',
      status: 'Résolu',
      createdAt: '2026-04-19 16:45',
      assignedTo: 'Admin Plateforme',
      description: 'Demande d\'augmentation de la limite d\'utilisateurs',
    },
    {
      id: 4,
      title: 'Question sur l\'export de données',
      organization: 'Digital Agency',
      priority: 'Basse',
      status: 'Ouvert',
      createdAt: '2026-04-19 14:20',
      assignedTo: 'Support Niveau 1',
      description: 'Assistance pour l\'export de données RGPD',
    },
  ];

  const stats = [
    { label: 'Incidents Ouverts', value: '2', icon: AlertTriangle, color: 'text-red-600' },
    { label: 'En Cours', value: '1', icon: Clock, color: 'text-orange-600' },
    { label: 'Résolus (7j)', value: '12', icon: CheckCircle, color: 'text-green-600' },
    { label: 'Temps Moyen', value: '2.3h', icon: Clock, color: 'text-blue-600' },
  ];

  return (
    <div className="p-6 bg-[#F5F7FA]">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Support & Incidents</h1>
        <p className="text-sm text-gray-600 mt-1">Gestion des tickets et incidents critiques</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <Icon className={`w-5 h-5 ${stat.color} mr-3`} />
                <h3 className="text-xs font-medium text-gray-500 uppercase">{stat.label}</h3>
              </div>
              <p className="text-3xl font-semibold text-gray-900">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Liste des Incidents */}
      <div className="bg-white border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">Tickets & Incidents</h3>
          <button className="px-4 py-2 bg-[#0A6ED1] text-white text-sm hover:bg-[#0959b0]">
            Nouveau Ticket
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Titre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Organisation</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priorité</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigné à</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Créé le</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {incidents.map((incident) => (
                <tr key={incident.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">#{incident.id}</td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900">{incident.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{incident.description}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{incident.organization}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs ${
                      incident.priority === 'Critique' ? 'bg-red-100 text-red-800' :
                      incident.priority === 'Haute' ? 'bg-orange-100 text-orange-800' :
                      incident.priority === 'Moyenne' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {incident.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs ${
                      incident.status === 'Ouvert' ? 'bg-orange-100 text-orange-800' :
                      incident.status === 'En cours' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {incident.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{incident.assignedTo}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{incident.createdAt}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="px-3 py-1 border border-gray-300 text-gray-700 text-xs hover:bg-gray-50">
                      Détails
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
