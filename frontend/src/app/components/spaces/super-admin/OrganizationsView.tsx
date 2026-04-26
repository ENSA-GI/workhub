import { Building2, Users, TrendingUp, AlertCircle } from 'lucide-react';
import { useState } from 'react';

export default function OrganizationsView() {
  const [organizations] = useState([
    { id: 1, name: 'TechVision SARL', employees: 45, status: 'Actif', subscription: 'Premium', lastActivity: '2026-04-20' },
    { id: 2, name: 'Atlas Commerce', employees: 80, status: 'Actif', subscription: 'Enterprise', lastActivity: '2026-04-20' },
    { id: 3, name: 'Innovate Solutions', employees: 25, status: 'Actif', subscription: 'Standard', lastActivity: '2026-04-19' },
    { id: 4, name: 'Digital Agency', employees: 15, status: 'Inactif', subscription: 'Trial', lastActivity: '2026-04-10' },
  ]);

  return (
    <div className="p-6 bg-[#F5F7FA]">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Organisations</h1>
        <p className="text-sm text-gray-600 mt-1">Supervision de toutes les organisations sur la plateforme</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Building2 className="w-5 h-5 text-[#0A6ED1] mr-3" />
            <h3 className="text-xs font-medium text-gray-500 uppercase">Organisations Totales</h3>
          </div>
          <p className="text-3xl font-semibold text-gray-900">{organizations.length}</p>
        </div>

        <div className="bg-white border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Users className="w-5 h-5 text-green-600 mr-3" />
            <h3 className="text-xs font-medium text-gray-500 uppercase">Employés Totaux</h3>
          </div>
          <p className="text-3xl font-semibold text-gray-900">{organizations.reduce((sum, org) => sum + org.employees, 0)}</p>
        </div>

        <div className="bg-white border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <TrendingUp className="w-5 h-5 text-green-600 mr-3" />
            <h3 className="text-xs font-medium text-gray-500 uppercase">Actives</h3>
          </div>
          <p className="text-3xl font-semibold text-gray-900">{organizations.filter(o => o.status === 'Actif').length}</p>
        </div>

        <div className="bg-white border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <AlertCircle className="w-5 h-5 text-orange-600 mr-3" />
            <h3 className="text-xs font-medium text-gray-500 uppercase">Inactives</h3>
          </div>
          <p className="text-3xl font-semibold text-gray-900">{organizations.filter(o => o.status === 'Inactif').length}</p>
        </div>
      </div>

      {/* Liste des Organisations */}
      <div className="bg-white border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-900">Liste des Organisations</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Organisation</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employés</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Abonnement</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dernière Activité</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {organizations.map((org) => (
                <tr key={org.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Building2 className="w-5 h-5 text-[#0A6ED1] mr-3" />
                      <span className="text-sm font-medium text-gray-900">{org.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{org.employees}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs ${
                      org.subscription === 'Enterprise' ? 'bg-purple-100 text-purple-800' :
                      org.subscription === 'Premium' ? 'bg-blue-100 text-blue-800' :
                      org.subscription === 'Standard' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {org.subscription}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs ${
                      org.status === 'Actif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {org.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(org.lastActivity).toLocaleDateString('fr-FR')}
                  </td>
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
