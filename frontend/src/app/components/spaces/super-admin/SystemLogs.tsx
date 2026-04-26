import { FileText, Search, Filter, Download, AlertCircle, Info, AlertTriangle, XCircle } from 'lucide-react';
import { useState } from 'react';

export default function SystemLogs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('Tous');
  const [filterService, setFilterService] = useState('Tous');

  const logs = [
    { id: 1, type: 'INFO', service: 'API Gateway', message: 'Organisation "TechVision" - Nouvelle paie générée avec succès', timestamp: '2026-04-20 14:32:15', details: 'User: fatima@techvision.ma | Request ID: req_abc123' },
    { id: 2, type: 'WARNING', service: 'Auth Service', message: 'Pic de connexions détecté (450 utilisateurs simultanés)', timestamp: '2026-04-20 14:15:03', details: 'Threshold: 400 | Current: 450 | Peak: 468' },
    { id: 3, type: 'INFO', service: 'Database', message: 'Sauvegarde automatique effectuée avec succès', timestamp: '2026-04-20 13:00:00', details: 'Backup size: 2.4GB | Duration: 45s' },
    { id: 4, type: 'ERROR', service: 'Database', message: 'Échec connexion base de données (retry réussi)', timestamp: '2026-04-20 12:45:22', details: 'Error: Connection timeout | Retry: Success after 2s' },
    { id: 5, type: 'INFO', service: 'Email Service', message: 'Notification email envoyée - Nouveau bulletin disponible', timestamp: '2026-04-20 12:30:45', details: 'To: mohammed.alami@techvision.ma | Template: payslip_notification' },
    { id: 6, type: 'WARNING', service: 'Storage Service', message: 'Espace disque à 75% de capacité', timestamp: '2026-04-20 12:00:00', details: 'Used: 750GB / Total: 1TB' },
    { id: 7, type: 'INFO', service: 'Background Jobs', message: 'Traitement batch analytics complété', timestamp: '2026-04-20 11:45:12', details: 'Jobs processed: 1,245 | Duration: 15m' },
    { id: 8, type: 'ERROR', service: 'Email Service', message: 'Échec envoi email - Destinataire invalide', timestamp: '2026-04-20 11:30:22', details: 'To: invalid@domain | Error: SMTP 550 User not found' },
    { id: 9, type: 'INFO', service: 'API Gateway', message: 'Nouvelle organisation enregistrée', timestamp: '2026-04-20 11:15:08', details: 'Organization: InnovateTech | Plan: Premium | Users: 100' },
    { id: 10, type: 'WARNING', service: 'Analytics Engine', message: 'Requête longue détectée (>5s)', timestamp: '2026-04-20 11:00:33', details: 'Query: turnover_prediction | Duration: 7.2s' },
    { id: 11, type: 'INFO', service: 'Auth Service', message: 'Connexion administrateur - IP: 192.168.1.100', timestamp: '2026-04-20 10:45:19', details: 'User: admin@workhub.ma | Location: Casablanca, MA' },
    { id: 12, type: 'ERROR', service: 'Storage Service', message: 'Échec upload fichier - Taille dépassée', timestamp: '2026-04-20 10:30:44', details: 'File: cv_large.pdf | Size: 12MB | Limit: 10MB' },
  ];

  const services = ['Tous', 'API Gateway', 'Auth Service', 'Database', 'Email Service', 'Storage Service', 'Background Jobs', 'Analytics Engine'];
  const types = ['Tous', 'INFO', 'WARNING', 'ERROR'];

  const filteredLogs = logs.filter((log) => {
    const matchSearch =
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = filterType === 'Tous' || log.type === filterType;
    const matchService = filterService === 'Tous' || log.service === filterService;
    return matchSearch && matchType && matchService;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'INFO':
        return <Info className="w-5 h-5 text-blue-600" />;
      case 'WARNING':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'ERROR':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-400" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'INFO':
        return 'bg-blue-100 text-blue-800';
      case 'WARNING':
        return 'bg-orange-100 text-orange-800';
      case 'ERROR':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = {
    total: logs.length,
    info: logs.filter((l) => l.type === 'INFO').length,
    warning: logs.filter((l) => l.type === 'WARNING').length,
    error: logs.filter((l) => l.type === 'ERROR').length,
  };

  return (
    <div className="p-6 bg-[#F5F7FA]">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Logs Système</h1>
        <p className="text-sm text-gray-600 mt-1">Détails techniques précis et historique des événements</p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 p-6">
          <h3 className="text-xs font-medium text-gray-500 uppercase mb-2">Total Logs</h3>
          <p className="text-3xl font-semibold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white border border-gray-200 p-6">
          <h3 className="text-xs font-medium text-gray-500 uppercase mb-2">Info</h3>
          <p className="text-3xl font-semibold text-blue-600">{stats.info}</p>
        </div>
        <div className="bg-white border border-gray-200 p-6">
          <h3 className="text-xs font-medium text-gray-500 uppercase mb-2">Warning</h3>
          <p className="text-3xl font-semibold text-orange-600">{stats.warning}</p>
        </div>
        <div className="bg-white border border-gray-200 p-6">
          <h3 className="text-xs font-medium text-gray-500 uppercase mb-2">Error</h3>
          <p className="text-3xl font-semibold text-red-600">{stats.error}</p>
        </div>
      </div>

      {/* Filtres et Recherche */}
      <div className="bg-white border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher dans les logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]"
            />
          </div>
          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]"
            >
              {types.map((type) => (
                <option key={type} value={type}>
                  Type: {type}
                </option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={filterService}
              onChange={(e) => setFilterService(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]"
            >
              {services.map((service) => (
                <option key={service} value={service}>
                  Service: {service}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Liste des Logs */}
      <div className="bg-white border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">
            Logs ({filteredLogs.length})
          </h3>
          <button className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center text-sm">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </button>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredLogs.map((log) => (
            <div key={log.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-4">
                  {getTypeIcon(log.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex px-2 py-1 text-xs ${getTypeBadge(log.type)}`}>
                        {log.type}
                      </span>
                      <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-700">
                        {log.service}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">{log.timestamp}</span>
                  </div>
                  <p className="text-sm text-gray-900 mb-2">{log.message}</p>
                  <div className="bg-gray-50 border border-gray-200 p-3">
                    <p className="text-xs text-gray-600 font-mono">{log.details}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 p-4">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-blue-900 mb-2">À propos des logs</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Les logs sont conservés pendant 90 jours</li>
              <li>• Les logs ERROR déclenchent automatiquement des alertes</li>
              <li>• Utilisez les filtres pour affiner votre recherche</li>
              <li>• Les logs peuvent être exportés pour analyse externe</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
