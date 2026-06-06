import { useState } from 'react';
import { 
  Building2, Users, TrendingUp, AlertCircle, Plus, Loader2, 
  Settings, Shield, Activity, Power, PowerOff, Save, X, 
  Mail, Phone, CreditCard, Layout, Info, UserCheck
} from 'lucide-react';
import { 
  useOrganizations, useCreateOrganization, useUpdateOrganization, 
  Organization, useOrganizationAdmin, useRegisterOrganization,
  useOrganizationsStats
} from '@/lib/useOrg';
import { identityApi } from '@/lib/identityApi';
import { toast } from 'sonner';

export default function OrganizationsView() {
  const [page, setPage] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'subscription' | 'status'>('general');

  // Form states for creation
  const [name, setName] = useState('');
  const [legalName, setLegalName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Admin form states for creation
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminFirstName, setAdminFirstName] = useState('');
  const [adminLastName, setAdminLastName] = useState('');

  // Form state for creating admin for existing org
  const [showAddAdminForm, setShowAddAdminForm] = useState(false);
  const [newAdminForm, setNewAdminForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });

  // Form states for management
  const [editForm, setEditForm] = useState<Partial<Organization>>({});

  const { data: orgsData, isLoading, refetch } = useOrganizations(page, 5);
  const { data: statsData, isLoading: isLoadingStats } = useOrganizationsStats();
  
  const createOrgMutation = useCreateOrganization();
  const registerOrgMutation = useRegisterOrganization();
  const updateOrgMutation = useUpdateOrganization();
  
  const { data: adminUsers, isLoading: isLoadingAdmin, refetch: refetchAdmin } = useOrganizationAdmin(selectedOrg?.id || '');
  const orgAdmin = adminUsers?.[0];

  const handleToggleAdminStatus = async () => {
    if (!orgAdmin) return;
    
    try {
      if (orgAdmin.active) {
        await identityApi.deactivateUser(orgAdmin.id);
        toast.success('Administrateur désactivé avec succès');
      } else {
        await identityApi.reactivateUser(orgAdmin.id);
        toast.success('Administrateur réactivé avec succès');
      }
      refetchAdmin();
    } catch (error) {
      toast.error('Erreur lors du changement de statut de l\'administrateur');
      console.error(error);
    }
  };

  const handleCreateOrg = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && legalName && adminEmail && adminPassword) {
      registerOrgMutation.mutate({
        name,
        legalName,
        taxId,
        email,
        phone,
        adminEmail,
        adminPassword,
        adminFirstName,
        adminLastName,
        city: '', // Optional fields
        industry: '',
        country: 'Maroc'
      }, {
        onSuccess: () => {
          setShowCreateModal(false);
          // Reset fields
          setName('');
          setLegalName('');
          setTaxId('');
          setEmail('');
          setPhone('');
          setAdminEmail('');
          setAdminPassword('');
          setAdminFirstName('');
          setAdminLastName('');
          toast.success('Organisation et administrateur créés avec succès');
          refetch();
        },
        onError: (error) => {
          toast.error('Erreur: ' + error.message);
        }
      });
    } else {
      toast.error('Veuillez remplir les informations de l\'organisation et de l\'administrateur');
    }
  };

  const handleCreateAdminForOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrg) return;

    try {
      await identityApi.provisionUser({
        organizationId: selectedOrg.id,
        email: newAdminForm.email,
        password: newAdminForm.password,
        firstName: newAdminForm.firstName,
        lastName: newAdminForm.lastName,
        role: 'ORG_ADMIN'
      });
      toast.success('Administrateur créé avec succès');
      setShowAddAdminForm(false);
      setNewAdminForm({ email: '', password: '', firstName: '', lastName: '' });
      refetchAdmin();
    } catch (error: any) {
      toast.error('Erreur: ' + error.message);
    }
  };

  const handleManageClick = (org: Organization) => {
    setSelectedOrg(org);
    setEditForm({
      name: org.name,
      legalName: org.legalName,
      email: org.email,
      phone: org.phone,
      taxId: org.taxId,
      plan: org.plan || 'STANDARD',
      maxEmployees: org.maxEmployees || 50,
      active: org.active
    });
    setActiveTab('general');
    setShowManageModal(true);
  };

  const handleUpdateOrg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrg) return;

    updateOrgMutation.mutate({
      id: selectedOrg.id,
      data: editForm
    }, {
      onSuccess: () => {
        toast.success('Organisation mise à jour avec succès');
        setShowManageModal(false);
        refetch();
      },
      onError: () => {
        toast.error('Erreur lors de la mise à jour');
      }
    });
  };

  const toggleStatus = () => {
    if (!selectedOrg) return;
    const newStatus = !editForm.active;
    
    setEditForm(prev => ({ ...prev, active: newStatus }));
    
    updateOrgMutation.mutate({
      id: selectedOrg.id,
      data: { ...editForm, active: newStatus }
    }, {
      onSuccess: () => {
        toast.success(`Organisation ${newStatus ? 'activée' : 'désactivée'} avec succès`);
        refetch();
      }
    });
  };

  const organizations = orgsData?.content || [];
  const allOrgs = statsData?.content || [];
  
  // Handle both old and new Spring Data pagination formats
  const totalElements = orgsData?.page?.totalElements ?? orgsData?.totalElements ?? allOrgs.length;
  const totalPages = orgsData?.page?.totalPages ?? orgsData?.totalPages ?? Math.ceil(totalElements / 5);

  // Global KPIs calculation using allOrgs
  const activeCount = allOrgs.filter(o => o.active).length;
  const inactiveCount = allOrgs.filter(o => !o.active).length;
  const totalEmployees = allOrgs.reduce((sum, org) => sum + (org.maxEmployees || 0), 0);

  return (
    <div className="p-6 bg-[#F5F7FA] min-h-screen">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Administration des Organisations</h1>
          <p className="text-sm text-gray-600 mt-1">Contrôle complet de la plateforme WorkHub</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-[#0A6ED1] text-white hover:bg-[#0959b0] transition-colors flex items-center text-sm font-semibold shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle Organisation
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-blue-50 rounded-lg mr-3">
              <Building2 className="w-5 h-5 text-[#0A6ED1]" />
            </div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total</h3>
          </div>
          {isLoadingStats ? (
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          ) : (
            <p className="text-3xl font-bold text-gray-900">{totalElements}</p>
          )}
        </div>

        <div className="bg-white border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-green-50 rounded-lg mr-3">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Employés</h3>
          </div>
          {isLoadingStats ? (
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          ) : (
            <p className="text-3xl font-bold text-gray-900">
              {totalEmployees}
            </p>
          )}
        </div>

        <div className="bg-white border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-emerald-50 rounded-lg mr-3">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Actives</h3>
          </div>
          {isLoadingStats ? (
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          ) : (
            <p className="text-3xl font-bold text-emerald-600">
              {activeCount}
            </p>
          )}
        </div>

        <div className="bg-white border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-red-50 rounded-lg mr-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Inactives</h3>
          </div>
          {isLoadingStats ? (
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          ) : (
            <p className="text-3xl font-bold text-red-600">
              {inactiveCount}
            </p>
          )}
        </div>
      </div>

      {/* Liste des Organisations */}
      <div className="bg-white border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
          <h3 className="text-base font-semibold text-gray-900 flex items-center">
            <Layout className="w-4 h-4 mr-2 text-gray-400" />
            Liste des Organisations
          </h3>
          <div className="text-xs text-gray-500 font-medium">
            Mise à jour en temps réel
          </div>
        </div>
        
        {isLoading ? (
          <div className="p-20 text-center">
            <Loader2 className="w-10 h-10 animate-spin text-[#0A6ED1] mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Récupération des données sécurisées...</p>
          </div>
        ) : organizations.length === 0 ? (
          <div className="p-20 text-center">
            <Building2 className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">Aucune organisation trouvée</p>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="mt-4 text-[#0A6ED1] hover:underline font-semibold"
            >
              Créer la première organisation
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Organisation</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Capacité</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Plan</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ICE / Fiscal</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {organizations.map((org) => (
                  <tr key={org.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-lg mr-3 ${org.active ? 'bg-blue-50 text-[#0A6ED1]' : 'bg-gray-100 text-gray-400'}`}>
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-sm font-bold text-gray-900 block group-hover:text-[#0A6ED1] transition-colors">{org.name}</span>
                          <span className="text-xs text-gray-500 flex items-center mt-0.5">
                            <Mail className="w-3 h-3 mr-1" />
                            {org.email || 'Aucun email'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-600 font-medium">
                        <Users className="w-4 h-4 mr-1.5 text-gray-400" />
                        {org.maxEmployees || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                        org.plan === 'ENTERPRISE' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                        org.plan === 'PREMIUM' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                        'bg-gray-50 text-gray-600 border-gray-100'
                      }`}>
                        {org.plan || 'STANDARD'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        org.active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${org.active ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        {org.active ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 font-mono font-medium">
                      {org.taxId || '—'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleManageClick(org)}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-200 bg-white text-gray-700 text-xs font-bold hover:bg-[#0A6ED1] hover:text-white hover:border-[#0A6ED1] transition-all shadow-sm rounded-md"
                      >
                        <Settings className="w-3.5 h-3.5 mr-1.5" />
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
        <div className="p-4 border-t border-gray-200 bg-gray-50/30 flex justify-between items-center">
          <span className="text-xs text-gray-500 font-medium">
            Affichage de <span className="text-gray-900">{organizations.length}</span> sur <span className="text-gray-900">{totalElements}</span> organisations
          </span>
          <div className="flex space-x-2">
            <button
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
              className="px-4 py-1.5 border border-gray-200 bg-white text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-all rounded shadow-sm"
            >
              Précédent
            </button>
            <div className="flex items-center px-2 text-xs font-bold text-gray-500">
              Page {page + 1} / {totalPages}
            </div>
            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage(page + 1)}
              className="px-4 py-1.5 border border-gray-200 bg-white text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-all rounded shadow-sm"
            >
              Suivant
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Gestion Complète */}
      {showManageModal && selectedOrg && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 max-w-2xl w-full shadow-2xl rounded-xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <div className="flex items-center">
                <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100 mr-4 text-[#0A6ED1]">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedOrg.name}</h3>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">ID: {selectedOrg.id}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowManageModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs Navigation */}
            <div className="flex border-b border-gray-100 px-6 bg-white">
              <button 
                onClick={() => setActiveTab('general')}
                className={`py-4 px-4 text-sm font-bold border-b-2 transition-all flex items-center ${
                  activeTab === 'general' ? 'border-[#0A6ED1] text-[#0A6ED1]' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Info className="w-4 h-4 mr-2" />
                Informations Générales
              </button>
              <button 
                onClick={() => setActiveTab('subscription')}
                className={`py-4 px-4 text-sm font-bold border-b-2 transition-all flex items-center ${
                  activeTab === 'subscription' ? 'border-[#0A6ED1] text-[#0A6ED1]' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Abonnement & Plan
              </button>
              <button 
                onClick={() => setActiveTab('status')}
                className={`py-4 px-4 text-sm font-bold border-b-2 transition-all flex items-center ${
                  activeTab === 'status' ? 'border-[#0A6ED1] text-[#0A6ED1]' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Shield className="w-4 h-4 mr-2" />
                Statut & Sécurité
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8">
              {activeTab === 'general' && (
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nom commercial</label>
                    <input
                      type="text"
                      value={editForm.name || ''}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]/20 focus:border-[#0A6ED1] transition-all text-sm font-medium"
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Raison sociale</label>
                    <input
                      type="text"
                      value={editForm.legalName || ''}
                      onChange={(e) => setEditForm({ ...editForm, legalName: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]/20 focus:border-[#0A6ED1] transition-all text-sm font-medium"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email de contact</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                      <input
                        type="email"
                        value={editForm.email || ''}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]/20 focus:border-[#0A6ED1] transition-all text-sm font-medium"
                      />
                    </div>
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Téléphone</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                      <input
                        type="text"
                        value={editForm.phone || ''}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]/20 focus:border-[#0A6ED1] transition-all text-sm font-medium"
                      />
                    </div>
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">ICE / Identifiant Fiscal</label>
                    <input
                      type="text"
                      value={editForm.taxId || ''}
                      onChange={(e) => setEditForm({ ...editForm, taxId: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]/20 focus:border-[#0A6ED1] transition-all text-sm font-mono font-medium"
                    />
                  </div>

                  {/* Section Administrateur */}
                  <div className="col-span-2 mt-4 pt-6 border-t border-gray-100">
                    <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center">
                      <UserCheck className="w-4 h-4 mr-2 text-[#0A6ED1]" />
                      Administrateur de l'organisation (ORG_ADMIN)
                    </h4>
                    
                    {isLoadingAdmin ? (
                      <div className="flex items-center space-x-2 text-sm text-gray-500 bg-gray-50 p-4 rounded-lg">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Recherche de l'administrateur...</span>
                      </div>
                    ) : orgAdmin ? (
                      <div className={`border rounded-xl p-4 flex items-center transition-all ${
                        orgAdmin.active ? 'bg-blue-50/30 border-blue-100' : 'bg-gray-50 border-gray-200 opacity-75'
                      }`}>
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg mr-4 shadow-sm border ${
                          orgAdmin.active ? 'bg-white border-blue-100 text-[#0A6ED1]' : 'bg-gray-100 border-gray-200 text-gray-400'
                        }`}>
                          {orgAdmin.firstName?.[0] || orgAdmin.email[0].toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className={`text-sm font-bold ${orgAdmin.active ? 'text-gray-900' : 'text-gray-500'}`}>
                            {orgAdmin.firstName} {orgAdmin.lastName}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center mt-1">
                            <Mail className="w-3 h-3 mr-1" />
                            {orgAdmin.email}
                          </div>
                          <div className="flex items-center mt-2 space-x-2">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                              orgAdmin.active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {orgAdmin.active ? 'Actif' : 'Désactivé'}
                            </span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 uppercase tracking-tighter">
                              ORG_ADMIN
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleToggleAdminStatus();
                            }}
                            className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm border ${
                              orgAdmin.active 
                                ? 'bg-white border-red-200 text-red-600 hover:bg-red-50' 
                                : 'bg-[#0A6ED1] border-[#0A6ED1] text-white hover:bg-[#0959b0]'
                            }`}
                          >
                            {orgAdmin.active ? (
                              <><PowerOff className="w-3.5 h-3.5 mr-1.5" /> Désactiver</>
                            ) : (
                              <><Power className="w-3.5 h-3.5 mr-1.5" /> Activer</>
                            )}
                          </button>
                          <div className="text-[10px] text-gray-400 mt-2">
                            Dernier accès: {orgAdmin.lastLogin ? new Date(orgAdmin.lastLogin).toLocaleDateString() : 'Jamais'}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-amber-50 border border-amber-100 rounded-lg p-6">
                        {!showAddAdminForm ? (
                          <div className="flex flex-col items-center text-center">
                            <AlertCircle className="w-8 h-8 text-amber-500 mb-3" />
                            <div className="text-sm font-bold text-amber-900">Aucun administrateur trouvé</div>
                            <p className="text-xs text-amber-700 mt-2 mb-4 max-w-xs">
                              Cette organisation n'a pas encore de compte administrateur principal configuré.
                            </p>
                            <button
                              onClick={() => setShowAddAdminForm(true)}
                              className="px-4 py-2 bg-[#0A6ED1] text-white text-xs font-bold rounded-lg hover:bg-[#0959b0] transition-all flex items-center"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Créer un administrateur maintenant
                            </button>
                          </div>
                        ) : (
                          <form onSubmit={handleCreateAdminForOrg} className="space-y-4">
                            <div className="flex justify-between items-center mb-2">
                              <h5 className="text-xs font-bold text-amber-900 uppercase">Nouvel Administrateur</h5>
                              <button 
                                type="button" 
                                onClick={() => setShowAddAdminForm(false)}
                                className="text-amber-700 hover:text-amber-900 text-xs font-bold"
                              >
                                Annuler
                              </button>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="col-span-2">
                                <label className="block text-[10px] font-bold text-amber-800 uppercase mb-1">Email professionnel</label>
                                <input
                                  type="email"
                                  required
                                  value={newAdminForm.email}
                                  onChange={(e) => setNewAdminForm({...newAdminForm, email: e.target.value})}
                                  className="w-full px-3 py-2 bg-white border border-amber-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#0A6ED1]"
                                />
                              </div>
                              <div className="col-span-2">
                                <label className="block text-[10px] font-bold text-amber-800 uppercase mb-1">Mot de passe provisoire</label>
                                <input
                                  type="password"
                                  required
                                  value={newAdminForm.password}
                                  onChange={(e) => setNewAdminForm({...newAdminForm, password: e.target.value})}
                                  className="w-full px-3 py-2 bg-white border border-amber-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#0A6ED1]"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-amber-800 uppercase mb-1">Prénom</label>
                                <input
                                  type="text"
                                  value={newAdminForm.firstName}
                                  onChange={(e) => setNewAdminForm({...newAdminForm, firstName: e.target.value})}
                                  className="w-full px-3 py-2 bg-white border border-amber-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#0A6ED1]"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-amber-800 uppercase mb-1">Nom</label>
                                <input
                                  type="text"
                                  value={newAdminForm.lastName}
                                  onChange={(e) => setNewAdminForm({...newAdminForm, lastName: e.target.value})}
                                  className="w-full px-3 py-2 bg-white border border-amber-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#0A6ED1]"
                                />
                              </div>
                            </div>
                            <button
                              type="submit"
                              className="w-full py-2 bg-[#0A6ED1] text-white text-xs font-bold rounded hover:bg-[#0959b0] transition-all shadow-sm"
                            >
                              Finaliser la création du compte
                            </button>
                          </form>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'subscription' && (
                <div className="space-y-8">
                  <div className="bg-blue-50/50 border border-blue-100 p-5 rounded-xl flex items-start">
                    <Activity className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-blue-900">Abonnement Actuel</h4>
                      <p className="text-xs text-blue-700 mt-1 font-medium leading-relaxed">
                        Le plan définit les fonctionnalités accessibles et les limites de stockage. 
                        Toute modification prend effet immédiatement.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Formule / Plan</label>
                      <select
                        value={editForm.plan || 'STANDARD'}
                        onChange={(e) => setEditForm({ ...editForm, plan: e.target.value })}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]/20 focus:border-[#0A6ED1] transition-all text-sm font-bold"
                      >
                        <option value="FREE">FREE (Essai)</option>
                        <option value="STANDARD">STANDARD</option>
                        <option value="PREMIUM">PREMIUM</option>
                        <option value="ENTERPRISE">ENTERPRISE</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Limite d'employés</label>
                      <input
                        type="number"
                        value={editForm.maxEmployees || 0}
                        onChange={(e) => setEditForm({ ...editForm, maxEmployees: parseInt(e.target.value) })}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]/20 focus:border-[#0A6ED1] transition-all text-sm font-bold"
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Statistiques d'utilisation</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <span className="text-xs text-gray-500 block mb-1 font-bold uppercase">Utilisateurs</span>
                        <span className="text-lg font-bold text-gray-900">12 / {editForm.maxEmployees}</span>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <span className="text-xs text-gray-500 block mb-1 font-bold uppercase">Stockage</span>
                        <span className="text-lg font-bold text-gray-900">1.2 GB</span>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <span className="text-xs text-gray-500 block mb-1 font-bold uppercase">API Calls</span>
                        <span className="text-lg font-bold text-gray-900">45k / mo</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'status' && (
                <div className="space-y-8">
                  <div className="flex items-center justify-between p-6 border rounded-xl bg-white shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center">
                      <div className={`p-3 rounded-xl mr-4 ${editForm.active ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                        {editForm.active ? <Power className="w-6 h-6" /> : <PowerOff className="w-6 h-6" />}
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-gray-900">Statut de l'organisation</h4>
                        <p className="text-sm text-gray-500 mt-1 font-medium">
                          {editForm.active 
                            ? "L'organisation est active et peut accéder à tous ses services." 
                            : "L'organisation est suspendue. L'accès est bloqué pour tous les utilisateurs."}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={toggleStatus}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${
                        editForm.active ? 'bg-emerald-500' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                          editForm.active ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="bg-amber-50 border border-amber-100 p-5 rounded-xl flex items-start">
                    <AlertCircle className="w-5 h-5 text-amber-600 mr-3 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-amber-900">Attention : Gestion Professionnelle</h4>
                      <p className="text-xs text-amber-700 mt-1.5 font-medium leading-relaxed">
                        Conformément à la politique de sécurité, la suppression définitive est remplacée par la désactivation. 
                        Cela permet de conserver les données d'audit et l'historique légal tout en révoquant tout accès technique.
                      </p>
                    </div>
                  </div>

                  <div className="pt-4">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Journal de sécurité récent</h4>
                    <div className="space-y-3">
                      {[1, 2].map((_, i) => (
                        <div key={i} className="flex items-center text-xs text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100">
                          <Activity className="w-3.5 h-3.5 mr-2 text-gray-400" />
                          <span className="font-bold text-gray-700">Modification du plan</span>
                          <span className="mx-2">•</span>
                          <span>Il y a 2 jours par Super Admin</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowManageModal(false)}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 hover:bg-white text-sm font-bold rounded-lg transition-all"
              >
                Annuler
              </button>
              <button
                onClick={handleUpdateOrg}
                disabled={updateOrgMutation.isPending}
                className="px-8 py-2.5 bg-[#0A6ED1] text-white hover:bg-[#0959b0] text-sm font-bold flex items-center shadow-lg shadow-blue-500/20 rounded-lg transition-all disabled:opacity-50"
              >
                {updateOrgMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Sauvegarder les modifications
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Création d'Organisation (Existing, but styled) */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 p-8 max-w-2xl w-full shadow-2xl rounded-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Nouvelle Organisation</h3>
                <p className="text-xs text-gray-500 mt-1">Configurez l'entité et son administrateur principal</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateOrg} className="space-y-8">
              {/* Section 1: Organisation */}
              <div>
                <h4 className="text-xs font-bold text-[#0A6ED1] uppercase tracking-widest mb-4 flex items-center">
                  <Building2 className="w-4 h-4 mr-2" />
                  Détails de l'organisation
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Nom commercial</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]/20 focus:border-[#0A6ED1] text-sm font-medium"
                      placeholder="Ex: TechVision Maroc"
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Raison sociale</label>
                    <input
                      type="text"
                      required
                      value={legalName}
                      onChange={(e) => setLegalName(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]/20 focus:border-[#0A6ED1] text-sm font-medium"
                      placeholder="Ex: TechVision SARL"
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">ICE / Identifiant Fiscal</label>
                    <input
                      type="text"
                      value={taxId}
                      onChange={(e) => setTaxId(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]/20 focus:border-[#0A6ED1] text-sm font-mono font-medium"
                      placeholder="ICE..."
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Email de contact</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]/20 focus:border-[#0A6ED1] text-sm font-medium"
                      placeholder="contact@entreprise.ma"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Téléphone</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]/20 focus:border-[#0A6ED1] text-sm font-medium"
                      placeholder="+212..."
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Administrateur */}
              <div>
                <h4 className="text-xs font-bold text-[#0A6ED1] uppercase tracking-widest mb-4 flex items-center">
                  <UserCheck className="w-4 h-4 mr-2" />
                  Compte Administrateur (ORG_ADMIN)
                </h4>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Email Admin</label>
                    <input
                      type="email"
                      required
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]/20 focus:border-[#0A6ED1] text-sm font-medium"
                      placeholder="admin@entreprise.com"
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Mot de passe</label>
                    <input
                      type="password"
                      required
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]/20 focus:border-[#0A6ED1] text-sm font-medium"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Prénom</label>
                    <input
                      type="text"
                      value={adminFirstName}
                      onChange={(e) => setAdminFirstName(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]/20 focus:border-[#0A6ED1] text-sm font-medium"
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Nom</label>
                    <input
                      type="text"
                      value={adminLastName}
                      onChange={(e) => setAdminLastName(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]/20 focus:border-[#0A6ED1] text-sm font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 justify-end pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-bold rounded-lg transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={registerOrgMutation.isPending || !name || !legalName || !adminEmail || !adminPassword}
                  className="px-8 py-2.5 bg-[#0A6ED1] text-white hover:bg-[#0959b0] text-sm font-bold flex items-center shadow-lg shadow-blue-500/20 rounded-lg transition-all disabled:opacity-50"
                >
                  {registerOrgMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  Finaliser et Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
