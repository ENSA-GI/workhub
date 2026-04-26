import { Settings, Calendar, DollarSign, Briefcase } from 'lucide-react';

export default function ConfigurationOrg() {
  return (
    <div className="p-6 bg-[#F5F7FA]">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Configuration de l'Organisation</h1>
        <p className="text-sm text-gray-600 mt-1">Paramétrage RH de votre entreprise</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Politique de Congés */}
        <div className="bg-white border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex items-center">
            <Calendar className="w-5 h-5 text-[#0A6ED1] mr-3" />
            <h3 className="text-base font-semibold text-gray-900">Politique de Congés</h3>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jours de congés annuels
              </label>
              <input
                type="number"
                defaultValue="25"
                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jours de congés maladie
              </label>
              <input
                type="number"
                defaultValue="10"
                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]"
              />
            </div>
            <button className="w-full px-4 py-2 bg-[#0A6ED1] text-white hover:bg-[#0959b0]">
              Enregistrer
            </button>
          </div>
        </div>

        {/* Grille Salariale */}
        <div className="bg-white border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex items-center">
            <DollarSign className="w-5 h-5 text-green-600 mr-3" />
            <h3 className="text-base font-semibold text-gray-900">Grille Salariale</h3>
          </div>
          <div className="p-6">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Catégorie</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Salaire Min</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Salaire Max</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-900">Junior</td>
                  <td className="px-4 py-3 text-sm text-gray-600">MAD 2,500</td>
                  <td className="px-4 py-3 text-sm text-gray-600">MAD 3,500</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-900">Confirmé</td>
                  <td className="px-4 py-3 text-sm text-gray-600">MAD 3,500</td>
                  <td className="px-4 py-3 text-sm text-gray-600">MAD 5,500</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-900">Senior</td>
                  <td className="px-4 py-3 text-sm text-gray-600">MAD 5,500</td>
                  <td className="px-4 py-3 text-sm text-gray-600">MAD 8,000</td>
                </tr>
              </tbody>
            </table>
            <button className="w-full mt-4 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50">
              Modifier la Grille
            </button>
          </div>
        </div>

        {/* Départements */}
        <div className="bg-white border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex items-center">
            <Briefcase className="w-5 h-5 text-purple-600 mr-3" />
            <h3 className="text-base font-semibold text-gray-900">Départements</h3>
          </div>
          <div className="p-6">
            <div className="space-y-2 mb-4">
              {['IT & Développement', 'Ventes & Commerce', 'Marketing', 'Ressources Humaines', 'Finance & Comptabilité'].map((dept, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-gray-200">
                  <span className="text-sm text-gray-900">{dept}</span>
                  <button className="text-xs text-gray-600 hover:text-red-600">Supprimer</button>
                </div>
              ))}
            </div>
            <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50">
              + Ajouter un Département
            </button>
          </div>
        </div>

        {/* Informations Entreprise */}
        <div className="bg-white border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex items-center">
            <Settings className="w-5 h-5 text-gray-600 mr-3" />
            <h3 className="text-base font-semibold text-gray-900">Informations Entreprise</h3>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nom de l'entreprise</label>
              <input
                type="text"
                defaultValue="TechVision SARL"
                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Numéro SIRET</label>
              <input
                type="text"
                defaultValue="123 456 789 00012"
                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]"
              />
            </div>
            <button className="w-full px-4 py-2 bg-[#0A6ED1] text-white hover:bg-[#0959b0]">
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
