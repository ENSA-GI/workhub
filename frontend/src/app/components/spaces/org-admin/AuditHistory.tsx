import { Filter, Download, User, DollarSign, Calendar, FileText } from 'lucide-react';

export default function AuditHistory() {
  const auditLogs = [
    { id: 1, action: 'Création employé', user: 'Fatima Zahra (RH)', details: 'Nouvel employé : Sarah Martin - Développeuse', timestamp: '2026-04-20 14:35:22', category: 'Employés', critical: false },
    { id: 2, action: 'Validation paie', user: 'Youssef Bennani (Admin)', details: 'Paie validée pour Mars 2026 - 45 employés', timestamp: '2026-04-20 10:15:00', category: 'Paie', critical: true },
    { id: 3, action: 'Approbation congé', user: 'Sara Bennani (RH)', details: 'Congé approuvé - Mohammed Alami - 5 jours', timestamp: '2026-04-19 16:20:18', category: 'Congés', critical: false },
    { id: 4, action: 'Modification grille salariale', user: 'Youssef Bennani (Admin)', details: 'Mise à jour catégorie Senior : MAD 5500-MAD 8000', timestamp: '2026-04-19 11:05:45', category: 'Configuration', critical: true },
    { id: 5, action: 'Création département', user: 'Youssef Bennani (Admin)', details: 'Nouveau département : Innovation & R&D', timestamp: '2026-04-18 09:30:12', category: 'Configuration', critical: false },
    { id: 6, action: 'Publication offre', user: 'Fatima Zahra (RH)', details: 'Nouvelle offre : Senior DevOps Engineer', timestamp: '2026-04-17 14:45:33', category: 'Recrutement', critical: false },
    { id: 7, action: 'Export données RGPD', user: 'Youssef Bennani (Admin)', details: 'Export complet des données entreprise', timestamp: '2026-04-15 10:00:00', category: 'Export', critical: true },
    { id: 8, action: 'Suppression employé', user: 'Fatima Zahra (RH)', details: 'Archivage employé : Ahmed Tazi - Démission', timestamp: '2026-04-12 16:15:22', category: 'Employés', critical: true },
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Employés': return User;
      case 'Paie': return DollarSign;
      case 'Congés': return Calendar;
      default: return FileText;
    }
  };

  return (
    <div className="p-6 bg-[#F5F7FA]">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Historique & Audit</h1>
        <p className="text-sm text-gray-600 mt-1">Journal de toutes les actions RH avec traçabilité complète</p>
      </div>

      {/* Filtres */}
      <div className="bg-white border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Période</label>
            <select className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]">
              <option>Dernières 24h</option>
              <option>7 derniers jours</option>
              <option>30 derniers jours</option>
              <option>Tout</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
            <select className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]">
              <option>Toutes</option>
              <option>Employés</option>
              <option>Paie</option>
              <option>Congés</option>
              <option>Recrutement</option>
              <option>Configuration</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Utilisateur</label>
            <select className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]">
              <option>Tous</option>
              <option>Fatima Zahra (RH)</option>
              <option>Sara Bennani (RH)</option>
              <option>Youssef Bennani (Admin)</option>
            </select>
          </div>
          <div className="flex items-end">
            <button className="w-full px-4 py-2 bg-[#0A6ED1] text-white hover:bg-[#0959b0] flex items-center justify-center">
              <Filter className="w-4 h-4 mr-2" />
              Filtrer
            </button>
          </div>
        </div>
      </div>

      {/* Liste des Actions */}
      <div className="bg-white border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">Journal des Actions</h3>
          <button className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Horodatage</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Catégorie</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Détails</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utilisateur</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {auditLogs.map((log) => {
                const Icon = getCategoryIcon(log.category);
                return (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-600">{log.timestamp}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Icon className="w-4 h-4 text-[#0A6ED1] mr-2" />
                        <span className="text-sm text-gray-900">{log.category}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{log.action}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{log.details}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{log.user}</td>
                    <td className="px-6 py-4">
                      {log.critical ? (
                        <span className="inline-flex px-2 py-1 text-xs bg-orange-100 text-orange-800">
                          Critique
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800">
                          Standard
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">À propos de l'audit</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Toutes les actions critiques sont enregistrées automatiquement</li>
          <li>• Les logs sont conservés pendant 7 ans pour conformité RGPD</li>
          <li>• Les actions critiques nécessitent une validation supplémentaire</li>
          <li>• Vous pouvez exporter l'historique complet à tout moment</li>
        </ul>
      </div>
    </div>
  );
}
