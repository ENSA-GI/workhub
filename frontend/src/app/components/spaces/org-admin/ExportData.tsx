import { Download, FileText, Database, Calendar, Users } from 'lucide-react';

export default function ExportData() {
  const exportOptions = [
    {
      title: 'Données Employés',
      description: 'Export complet de tous les employés (nom, email, poste, département, etc.)',
      icon: Users,
      formats: ['CSV', 'Excel', 'PDF'],
      color: 'text-[#0A6ED1]',
    },
    {
      title: 'Historique de Paie',
      description: 'Bulletins de paie et historique des salaires versés',
      icon: FileText,
      formats: ['CSV', 'Excel', 'PDF'],
      color: 'text-green-600',
    },
    {
      title: 'Registre des Congés',
      description: 'Historique complet des demandes et validations de congés',
      icon: Calendar,
      formats: ['CSV', 'Excel'],
      color: 'text-purple-600',
    },
    {
      title: 'Données Complètes RGPD',
      description: 'Export de toutes les données de l\'organisation (conformité RGPD)',
      icon: Database,
      formats: ['JSON', 'ZIP'],
      color: 'text-orange-600',
    },
  ];

  const recentExports = [
    { id: 1, type: 'Employés', format: 'CSV', user: 'Youssef Bennani', date: '2026-04-15 10:30', size: '245 KB' },
    { id: 2, type: 'Paie Mars 2026', format: 'PDF', user: 'Fatima Zahra', date: '2026-04-01 14:15', size: '1.2 MB' },
    { id: 3, type: 'Congés Q1 2026', format: 'Excel', user: 'Sara Bennani', date: '2026-03-31 09:45', size: '87 KB' },
  ];

  return (
    <div className="p-6 bg-[#F5F7FA]">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Export de Données</h1>
        <p className="text-sm text-gray-600 mt-1">Récupération et extraction des données de votre organisation</p>
      </div>

      {/* Options d'Export */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {exportOptions.map((option, index) => {
          const Icon = option.icon;
          return (
            <div key={index} className="bg-white border border-gray-200 p-6">
              <div className="flex items-start mb-4">
                <div className={`w-12 h-12 bg-gray-50 border border-gray-200 flex items-center justify-center mr-4`}>
                  <Icon className={`w-6 h-6 ${option.color}`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-gray-900 mb-1">{option.title}</h3>
                  <p className="text-sm text-gray-600">{option.description}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  {option.formats.map((format, idx) => (
                    <button
                      key={idx}
                      className="px-3 py-1 border border-gray-300 text-gray-700 text-xs hover:bg-gray-50"
                    >
                      {format}
                    </button>
                  ))}
                </div>
                <button className="px-4 py-2 bg-[#0A6ED1] text-white text-sm hover:bg-[#0959b0] flex items-center">
                  <Download className="w-4 h-4 mr-2" />
                  Exporter
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Exports Récents */}
      <div className="bg-white border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-900">Exports Récents</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Format</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utilisateur</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Taille</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentExports.map((exp) => (
                <tr key={exp.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{exp.type}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800">
                      {exp.format}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{exp.user}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{exp.date}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{exp.size}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="px-3 py-1 border border-gray-300 text-gray-700 text-xs hover:bg-gray-50 flex items-center ml-auto">
                      <Download className="w-3 h-3 mr-1" />
                      Télécharger
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info RGPD */}
      <div className="mt-6 bg-blue-50 border border-blue-200 p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">Conformité RGPD</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Toutes les exportations sont tracées dans l'historique d'audit</li>
          <li>• Les données exportées sont chiffrées et sécurisées</li>
          <li>• Vous pouvez exporter toutes les données de votre organisation à tout moment</li>
          <li>• Les employés peuvent demander l'export de leurs données personnelles</li>
        </ul>
      </div>
    </div>
  );
}
