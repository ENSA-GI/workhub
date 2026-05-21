import { useState } from 'react';
import { Building2, Users, TrendingUp, AlertCircle, Plus, Loader2, ArrowRight } from 'lucide-react';
import { useOrganizations, useCreateOrganization } from '@/lib/useOrg';

export default function OrganizationsView() {
  const [page, setPage] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [legalName, setLegalName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const { data: orgsData, isLoading, refetch } = useOrganizations(page, 20);
  const createOrgMutation = useCreateOrganization();

  const handleCreateOrg = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && legalName) {
      createOrgMutation.mutate({
        name,
        legalName,
        taxId,
        email,
        phone,
        active: true,
        plan: 'STANDARD',
        maxEmployees: 50
      }, {
        onSuccess: () => {
          setShowCreateModal(false);
          setName('');
          setLegalName('');
          setTaxId('');
          setEmail('');
          setPhone('');
          refetch();
        }
      });
    }
  };

  const organizations = orgsData?.content || [];
  const totalElements = orgsData?.totalElements || 0;
  const totalPages = orgsData?.totalPages || 1;

  return (
    <div className="p-6 bg-[#F5F7FA]">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Organisations</h1>
          <p className="text-sm text-gray-600 mt-1">Supervision de toutes les organisations sur la plateforme</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-[#0A6ED1] text-white hover:bg-[#0959b0] transition-colors flex items-center text-sm font-semibold"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle Organisation
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Building2 className="w-5 h-5 text-[#0A6ED1] mr-3" />
            <h3 className="text-xs font-medium text-gray-500 uppercase">Organisations Totales</h3>
          </div>
          {isLoading ? (
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          ) : (
            <p className="text-3xl font-semibold text-gray-900">{totalElements}</p>
          )}
        </div>

        <div className="bg-white border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Users className="w-5 h-5 text-green-600 mr-3" />
            <h3 className="text-xs font-medium text-gray-500 uppercase">Employés Totaux</h3>
          </div>
          {isLoading ? (
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          ) : (
            <p className="text-3xl font-semibold text-gray-900">
              {organizations.reduce((sum, org) => sum + (org.maxEmployees || 0), 0)}
            </p>
          )}
        </div>

        <div className="bg-white border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <TrendingUp className="w-5 h-5 text-green-600 mr-3" />
            <h3 className="text-xs font-medium text-gray-500 uppercase">Actives</h3>
          </div>
          {isLoading ? (
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          ) : (
            <p className="text-3xl font-semibold text-gray-900">
              {organizations.filter(o => o.active).length}
            </p>
          )}
        </div>

        <div className="bg-white border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <AlertCircle className="w-5 h-5 text-orange-600 mr-3" />
            <h3 className="text-xs font-medium text-gray-500 uppercase">Inactives</h3>
          </div>
          {isLoading ? (
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          ) : (
            <p className="text-3xl font-semibold text-gray-900">
              {organizations.filter(o => !o.active).length}
            </p>
          )}
        </div>
      </div>

      {/* Liste des Organisations */}
      <div className="bg-white border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-900">Liste des Organisations enregistrées</h3>
        </div>
        
        {isLoading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#0A6ED1] mx-auto" />
            <p className="text-gray-500 mt-2 text-sm">Chargement des données en temps réel...</p>
          </div>
        ) : organizations.length === 0 ? (
          <div className="p-12 text-center">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">Aucune organisation enregistrée sur la plateforme.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Organisation</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacité Employés</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Formule / Plan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Identifiant Fiscal</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {organizations.map((org) => (
                  <tr key={org.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Building2 className="w-5 h-5 text-[#0A6ED1] mr-3" />
                        <div>
                          <span className="text-sm font-medium text-gray-900 block">{org.name}</span>
                          <span className="text-xs text-gray-500">{org.email || 'Aucun email'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{org.maxEmployees} max</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2 py-1 text-xs bg-purple-100 text-purple-800 font-semibold">
                        {org.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold ${
                        org.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {org.active ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-mono">
                      {org.taxId || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="px-3 py-1 border border-gray-300 text-gray-700 text-xs hover:bg-gray-50 transition-colors">
                        Gérer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="p-4 border-t border-gray-200 flex justify-between items-center">
          <span className="text-xs text-gray-500">
            Page {page + 1} sur {totalPages} • Total {totalElements}
          </span>
          <div className="flex space-x-1">
            <button
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1 border border-gray-300 text-xs hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Précédent
            </button>
            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1 border border-gray-300 text-xs hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Suivant
            </button>
          </div>
        </div>
      </div>

      {/* Modal Création d'Organisation */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 p-6 max-w-md w-full shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Créer une nouvelle organisation</h3>
            <form onSubmit={handleCreateOrg} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Nom commercial</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#0A6ED1] text-sm"
                  placeholder="Ex: TechVision Maroc"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Raison sociale</label>
                <input
                  type="text"
                  required
                  value={legalName}
                  onChange={(e) => setLegalName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#0A6ED1] text-sm"
                  placeholder="Ex: TechVision SARL"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Identifiant Fiscal / ICE</label>
                <input
                  type="text"
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#0A6ED1] text-sm"
                  placeholder="ICE00123456..."
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Email de contact</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#0A6ED1] text-sm"
                  placeholder="contact@entreprise.com"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Téléphone de contact</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#0A6ED1] text-sm"
                  placeholder="+212520..."
                />
              </div>
              <div className="flex space-x-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={createOrgMutation.isPending || !name || !legalName}
                  className="px-4 py-2 bg-[#0A6ED1] text-white hover:bg-[#0959b0] text-sm font-semibold flex items-center disabled:opacity-50"
                >
                  {createOrgMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
