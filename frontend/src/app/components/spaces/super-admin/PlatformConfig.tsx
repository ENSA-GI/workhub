import { Settings, Shield, Database, Globe } from 'lucide-react';

export default function PlatformConfig() {
  return (
    <div className="p-6 bg-[#F5F7FA]">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Configuration de la Plateforme</h1>
        <p className="text-sm text-gray-600 mt-1">Paramètres globaux et politiques techniques</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Paramètres Généraux */}
        <div className="bg-white border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex items-center">
            <Settings className="w-5 h-5 text-[#0A6ED1] mr-3" />
            <h3 className="text-base font-semibold text-gray-900">Paramètres Généraux</h3>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom de la plateforme
              </label>
              <input
                type="text"
                defaultValue="WorkHub"
                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL de la plateforme
              </label>
              <input
                type="text"
                defaultValue="https://workhub.ma"
                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email support
              </label>
              <input
                type="email"
                defaultValue="support@workhub.ma"
                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]"
              />
            </div>
            <button className="w-full px-4 py-2 bg-[#0A6ED1] text-white hover:bg-[#0959b0]">
              Enregistrer
            </button>
          </div>
        </div>

        {/* Sécurité */}
        <div className="bg-white border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex items-center">
            <Shield className="w-5 h-5 text-red-600 mr-3" />
            <h3 className="text-base font-semibold text-gray-900">Sécurité Globale</h3>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Durée de session (minutes)
              </label>
              <input
                type="number"
                defaultValue="120"
                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tentatives de connexion max
              </label>
              <input
                type="number"
                defaultValue="5"
                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 border-gray-300 text-[#0A6ED1] focus:ring-[#0A6ED1]"
              />
              <label className="ml-2 text-sm text-gray-700">
                Authentification à deux facteurs obligatoire
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 border-gray-300 text-[#0A6ED1] focus:ring-[#0A6ED1]"
              />
              <label className="ml-2 text-sm text-gray-700">
                Logs d'audit activés
              </label>
            </div>
            <button className="w-full px-4 py-2 bg-[#0A6ED1] text-white hover:bg-[#0959b0]">
              Enregistrer
            </button>
          </div>
        </div>

        {/* Limites Système */}
        <div className="bg-white border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex items-center">
            <Database className="w-5 h-5 text-purple-600 mr-3" />
            <h3 className="text-base font-semibold text-gray-900">Limites Système</h3>
          </div>
          <div className="p-6">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ressource</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Limite</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-900">Organisations max</td>
                  <td className="px-4 py-3 text-sm text-gray-600">1000</td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-xs text-[#0A6ED1] hover:underline">Modifier</button>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-900">Utilisateurs par org (Trial)</td>
                  <td className="px-4 py-3 text-sm text-gray-600">20</td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-xs text-[#0A6ED1] hover:underline">Modifier</button>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-900">Stockage fichiers (Go)</td>
                  <td className="px-4 py-3 text-sm text-gray-600">500</td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-xs text-[#0A6ED1] hover:underline">Modifier</button>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-900">API requests/min</td>
                  <td className="px-4 py-3 text-sm text-gray-600">1000</td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-xs text-[#0A6ED1] hover:underline">Modifier</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Maintenance */}
        <div className="bg-white border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex items-center">
            <Globe className="w-5 h-5 text-green-600 mr-3" />
            <h3 className="text-base font-semibold text-gray-900">Maintenance & Mises à Jour</h3>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prochaine maintenance planifiée
              </label>
              <input
                type="datetime-local"
                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Version actuelle
              </label>
              <input
                type="text"
                defaultValue="v2.5.3"
                disabled
                className="w-full px-3 py-2 border border-gray-300 bg-gray-50 text-gray-600"
              />
            </div>
            <button className="w-full px-4 py-2 bg-orange-600 text-white hover:bg-orange-700">
              Planifier Maintenance
            </button>
            <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50">
              Vérifier Mises à Jour
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
