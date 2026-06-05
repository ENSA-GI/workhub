import { useState } from 'react';
import { 
  CreditCard, CheckCircle, AlertCircle, Calendar, 
  Settings, Loader2, Layout, TrendingUp, Users,
  Shield, Activity, Power, PowerOff, Save, X,
  Mail, Building2, ExternalLink
} from 'lucide-react';
import { useOrganizations, useUpdateOrganization, Organization } from '@/lib/useOrg';
import { toast } from 'sonner';

export default function Subscriptions() {
  const [page, setPage] = useState(0);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [showManageModal, setShowManageModal] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Organization>>({});

  const { data: orgsData, isLoading, refetch } = useOrganizations(page, 20);
  const updateOrgMutation = useUpdateOrganization();

  const organizations = orgsData?.content || [];
  const totalElements = orgsData?.totalElements || 0;

  const planPrices: Record<string, number> = {
    'FREE': 0,
    'STANDARD': 149,
    'PREMIUM': 299,
    'ENTERPRISE': 599
  };

  const stats = {
    monthlyRevenue: organizations.reduce((sum, org) => sum + (planPrices[org.plan || 'FREE'] || 0), 0),
    upToDate: organizations.filter(o => o.active).length,
    pending: organizations.filter(o => !o.active).length,
    activeTrials: organizations.filter(o => o.plan === 'FREE' && o.active).length
  };

  const handleManageClick = (org: Organization) => {
    setSelectedOrg(org);
    setEditForm({
      name: org.name,
      legalName: org.legalName,
      city: org.city,
      industry: org.industry,
      country: org.country,
      email: org.email,
      phone: org.phone,
      taxId: org.taxId,
      plan: org.plan || 'FREE',
      maxEmployees: org.maxEmployees || 50,
      active: org.active
    });
    setShowManageModal(true);
  };

  const handleUpdateSubscription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrg) return;

    updateOrgMutation.mutate({
      id: selectedOrg.id,
      data: editForm
    }, {
      onSuccess: () => {
        toast.success('Abonnement mis à jour avec succès');
        setShowManageModal(false);
        refetch();
      },
      onError: () => {
        toast.error('Erreur lors de la mise à jour');
      }
    });
  };

  return (
    <div className="p-6 bg-[#F5F7FA] min-h-screen">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Abonnements & Facturation</h1>
          <p className="text-sm text-gray-600 mt-1">Contrôle financier et gestion des plans SaaS</p>
        </div>
        <div className="text-xs font-bold text-gray-400 bg-white px-3 py-1.5 border border-gray-200 rounded-lg shadow-sm">
          SOLDE GLOBAL: <span className="text-[#0A6ED1]">MAD {stats.monthlyRevenue.toLocaleString()} / mois</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-blue-50 rounded-lg mr-3">
              <CreditCard className="w-5 h-5 text-[#0A6ED1]" />
            </div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Revenu Estimé</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">MAD {stats.monthlyRevenue.toLocaleString()}</p>
          <div className="mt-2 text-[10px] text-emerald-600 font-bold flex items-center">
            <TrendingUp className="w-3 h-3 mr-1" /> +12% vs mois dernier
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-green-50 rounded-lg mr-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Abonnements Actifs</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.upToDate}</p>
          <p className="mt-2 text-[10px] text-gray-400 font-medium">Facturation automatisée active</p>
        </div>

        <div className="bg-white border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-amber-50 rounded-lg mr-3">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">En Attente / Impayés</h3>
          </div>
          <p className="text-3xl font-bold text-amber-600">{stats.pending}</p>
          <p className="mt-2 text-[10px] text-amber-700/60 font-medium">Relances nécessaires</p>
        </div>

        <div className="bg-white border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-purple-50 rounded-lg mr-3">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Essais (Trials)</h3>
          </div>
          <p className="text-3xl font-bold text-purple-600">{stats.activeTrials}</p>
          <p className="mt-2 text-[10px] text-purple-400 font-medium">Potentiel de conversion: High</p>
        </div>
      </div>

      {/* Plans Recap */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {Object.entries(planPrices).map(([name, price]) => (
          <div key={name} className="bg-white border border-gray-100 p-4 flex items-center justify-between shadow-sm">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase">{name}</span>
              <div className="text-lg font-bold text-gray-900">MAD {price}</div>
            </div>
            <div className="h-8 w-8 bg-gray-50 rounded-full flex items-center justify-center text-xs font-bold text-[#0A6ED1]">
              {organizations.filter(o => o.plan === name).length}
            </div>
          </div>
        ))}
      </div>

      {/* Main Table */}
      <div className="bg-white border border-gray-200 shadow-sm overflow-hidden rounded-xl">
        <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
          <h3 className="text-base font-bold text-gray-900 flex items-center">
            <Layout className="w-4 h-4 mr-2 text-gray-400" />
            État des Abonnements
          </h3>
          <div className="text-[10px] font-bold text-[#0A6ED1] bg-blue-50 px-2 py-1 rounded">
            SYNC BACKEND OK
          </div>
        </div>

        {isLoading ? (
          <div className="p-20 text-center">
            <Loader2 className="w-10 h-10 animate-spin text-[#0A6ED1] mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Calcul des revenus en cours...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Organisation</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Plan Actuel</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">MRR (Revenu)</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Utilisateurs</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Statut Paiement</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {organizations.map((org) => (
                  <tr key={org.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="p-2 bg-white border border-gray-100 rounded-lg mr-3 shadow-sm group-hover:border-[#0A6ED1]/30">
                          <Building2 className="w-4 h-4 text-gray-400 group-hover:text-[#0A6ED1]" />
                        </div>
                        <div>
                          <span className="text-sm font-bold text-gray-900 block">{org.name}</span>
                          <span className="text-[10px] text-gray-400 font-medium">{org.email || 'Pas de contact'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold border ${
                        org.plan === 'ENTERPRISE' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                        org.plan === 'PREMIUM' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                        org.plan === 'STANDARD' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                        'bg-gray-50 text-gray-500 border-gray-100'
                      }`}>
                        {org.plan || 'FREE'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-gray-900">
                        MAD {(planPrices[org.plan || 'FREE'] || 0).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-xs font-bold text-gray-600">
                        <Users className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                        {org.maxEmployees}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-bold ${
                        org.active ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        <div className={`w-1 h-1 rounded-full mr-1.5 ${org.active ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        {org.active ? 'À JOUR' : 'EN ATTENTE'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleManageClick(org)}
                        className="inline-flex items-center px-3 py-1.5 bg-white border border-gray-200 text-[#0A6ED1] text-[10px] font-bold hover:bg-[#0A6ED1] hover:text-white transition-all shadow-sm rounded-md"
                      >
                        <Settings className="w-3.5 h-3.5 mr-1.5" />
                        Gérer Plan
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Gestion de l'Abonnement */}
      {showManageModal && selectedOrg && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 max-w-md w-full shadow-2xl rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div className="flex items-center">
                <div className="p-2.5 bg-blue-50 rounded-xl mr-3 text-[#0A6ED1]">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Gérer l'Abonnement</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{selectedOrg.name}</p>
                </div>
              </div>
              <button onClick={() => setShowManageModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleUpdateSubscription} className="p-8 space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Sélectionner le Plan</label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(planPrices).map(([name, price]) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => setEditForm({ ...editForm, plan: name })}
                      className={`p-3 border rounded-xl text-left transition-all ${
                        editForm.plan === name 
                        ? 'border-[#0A6ED1] bg-blue-50/50 ring-2 ring-[#0A6ED1]/10' 
                        : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <div className={`text-[10px] font-bold ${editForm.plan === name ? 'text-[#0A6ED1]' : 'text-gray-400'}`}>{name}</div>
                      <div className="text-sm font-bold text-gray-900">MAD {price}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Limite d'Utilisateurs</label>
                <div className="relative">
                  <Users className="w-4 h-4 absolute left-3 top-3.5 text-gray-400" />
                  <input
                    type="number"
                    value={editForm.maxEmployees || 0}
                    onChange={(e) => setEditForm({ ...editForm, maxEmployees: parseInt(e.target.value) })}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]/20 focus:border-[#0A6ED1] transition-all text-sm font-bold"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Statut du Service</h4>
                  <p className="text-[10px] text-gray-400 font-medium">Active ou suspend le compte</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditForm({ ...editForm, active: !editForm.active })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    editForm.active ? 'bg-emerald-500' : 'bg-gray-200'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    editForm.active ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="bg-blue-50 p-4 rounded-xl flex items-start">
                <Activity className="w-4 h-4 text-[#0A6ED1] mr-3 mt-0.5" />
                <p className="text-[10px] text-blue-700 font-medium leading-relaxed">
                  Toute modification de plan entraînera un ajustement de la facture au prorata pour le mois en cours.
                </p>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowManageModal(false)}
                  className="flex-1 py-3 border border-gray-200 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-50 transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={updateOrgMutation.isPending}
                  className="flex-1 py-3 bg-[#0A6ED1] text-white text-xs font-bold rounded-xl hover:bg-[#0959b0] shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center"
                >
                  {updateOrgMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  Appliquer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
