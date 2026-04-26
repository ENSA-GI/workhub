import { CreditCard, CheckCircle, AlertCircle, Calendar } from 'lucide-react';

export default function Subscriptions() {
  const subscriptions = [
    {
      id: 1,
      organization: 'TechVision SARL',
      plan: 'Premium',
      price: 'MAD 299/mois',
      status: 'Actif',
      nextBilling: '2026-05-01',
      paymentStatus: 'À jour',
      users: 45,
    },
    {
      id: 2,
      organization: 'Atlas Commerce',
      plan: 'Enterprise',
      price: 'MAD 599/mois',
      status: 'Actif',
      nextBilling: '2026-05-15',
      paymentStatus: 'À jour',
      users: 80,
    },
    {
      id: 3,
      organization: 'Innovate Solutions',
      plan: 'Standard',
      price: 'MAD 149/mois',
      status: 'Actif',
      nextBilling: '2026-04-28',
      paymentStatus: 'À jour',
      users: 25,
    },
    {
      id: 4,
      organization: 'Digital Agency',
      plan: 'Trial',
      price: 'MAD 0/mois',
      status: 'Trial',
      nextBilling: '2026-05-05',
      paymentStatus: 'En attente',
      users: 15,
    },
  ];

  const plans = [
    { name: 'Trial', price: 'MAD 0', duration: '14 jours', users: 'Jusqu\'à 20 utilisateurs' },
    { name: 'Standard', price: 'MAD 149', duration: 'par mois', users: 'Jusqu\'à 50 utilisateurs' },
    { name: 'Premium', price: 'MAD 299', duration: 'par mois', users: 'Jusqu\'à 100 utilisateurs' },
    { name: 'Enterprise', price: 'MAD 599', duration: 'par mois', users: 'Utilisateurs illimités' },
  ];

  return (
    <div className="p-6 bg-[#F5F7FA]">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Abonnements & Facturation</h1>
        <p className="text-sm text-gray-600 mt-1">Gestion des abonnements et paiements des organisations</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <CreditCard className="w-5 h-5 text-[#0A6ED1] mr-3" />
            <h3 className="text-xs font-medium text-gray-500 uppercase">Revenu Mensuel</h3>
          </div>
          <p className="text-3xl font-semibold text-gray-900">MAD 1,047</p>
        </div>
        <div className="bg-white border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
            <h3 className="text-xs font-medium text-gray-500 uppercase">Paiements À Jour</h3>
          </div>
          <p className="text-3xl font-semibold text-gray-900">3</p>
        </div>
        <div className="bg-white border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <AlertCircle className="w-5 h-5 text-orange-600 mr-3" />
            <h3 className="text-xs font-medium text-gray-500 uppercase">En Attente</h3>
          </div>
          <p className="text-3xl font-semibold text-gray-900">1</p>
        </div>
        <div className="bg-white border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Calendar className="w-5 h-5 text-purple-600 mr-3" />
            <h3 className="text-xs font-medium text-gray-500 uppercase">Trials Actifs</h3>
          </div>
          <p className="text-3xl font-semibold text-gray-900">1</p>
        </div>
      </div>

      {/* Plans Disponibles */}
      <div className="bg-white border border-gray-200 mb-6">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-900">Plans Disponibles</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {plans.map((plan, index) => (
              <div key={index} className="border border-gray-200 p-6 text-center">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">{plan.name}</h4>
                <p className="text-3xl font-bold text-[#0A6ED1] mb-1">{plan.price}</p>
                <p className="text-sm text-gray-600 mb-4">{plan.duration}</p>
                <p className="text-xs text-gray-500">{plan.users}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Liste des Abonnements */}
      <div className="bg-white border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-900">Abonnements Actifs</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Organisation</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prix</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utilisateurs</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prochain Paiement</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut Paiement</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {subscriptions.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{sub.organization}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs ${
                      sub.plan === 'Enterprise' ? 'bg-purple-100 text-purple-800' :
                      sub.plan === 'Premium' ? 'bg-blue-100 text-blue-800' :
                      sub.plan === 'Standard' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {sub.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{sub.price}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{sub.users}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(sub.nextBilling).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs ${
                      sub.paymentStatus === 'À jour' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                    }`}>
                      {sub.paymentStatus}
                    </span>
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
