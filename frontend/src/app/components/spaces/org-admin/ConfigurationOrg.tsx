import { useState, useEffect } from 'react';
import { Settings, Calendar, DollarSign, Briefcase, Trash2, Plus, Loader2 } from 'lucide-react';
import {
  useOrganization,
  useUpdateOrganization,
  useOrganizationSettings,
  useUpdateOrganizationSettings,
  useDepartments,
  useCreateDepartment,
  useDeleteDepartment,
  usePositions,
  useCreatePosition,
  useDeletePosition
} from '@/lib/useOrg';
import { useOrganizationId } from '@/lib/useOrganizationId';

export default function ConfigurationOrg() {
  const organizationId = useOrganizationId();

  const { data: org, isLoading: isOrgLoading } = useOrganization(organizationId);
  const updateOrgMutation = useUpdateOrganization();
  const { data: orgSettings } = useOrganizationSettings(organizationId);
  const updateSettingsMutation = useUpdateOrganizationSettings();

  const { data: deptsData, isLoading: isDeptsLoading } = useDepartments(organizationId);
  const createDeptMutation = useCreateDepartment();
  const deleteDeptMutation = useDeleteDepartment();

  const { data: positionsData, isLoading: isPositionsLoading } = usePositions(organizationId);
  const createPosMutation = useCreatePosition();
  const deletePosMutation = useDeletePosition();

  // Local states
  const [annualLeave, setAnnualLeave] = useState('25');
  const [sickLeave, setSickLeave] = useState('10');
  const [companyName, setCompanyName] = useState('');
  const [companySiret, setCompanySiret] = useState('');
  const [newDeptName, setNewDeptName] = useState('');
  const [newPosTitle, setNewPosTitle] = useState('');
  const [newPosCategory, setNewPosCategory] = useState<'CADRE' | 'AGENT_MAITRISE' | 'EMPLOYE' | 'STAGIAIRE'>('EMPLOYE');

  useEffect(() => {
    if (org) {
      setCompanyName(org.name || '');
      setCompanySiret(org.taxId || '');
      if (org.settings) {
        setAnnualLeave(String(org.settings.annual_leave_days || 25));
        // @ts-ignore
        setSickLeave(String(org.settings.sick_leave_days || 10));
      }
    }
  }, [org, orgSettings]);

  if (!organizationId) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600">Erreur : ID d'organisation manquant. Reconnectez-vous.</p>
      </div>
    );
  }

  const handleSaveLeavePolicy = () => {
    updateSettingsMutation.mutate({
      orgId: organizationId,
      data: {
        leavePolicyDaysPerYear: parseInt(annualLeave, 10) || 22,
        leavePolicyMaxCarryOver: parseInt(sickLeave, 10) || 10,
      },
    });
  };

  const handleSaveCompanyInfo = () => {
    updateOrgMutation.mutate({
      id: organizationId,
      data: {
        name: companyName,
        taxId: companySiret
      }
    });
  };

  const handleAddDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (newDeptName.trim()) {
      createDeptMutation.mutate({
        organizationId,
        name: newDeptName.trim(),
        description: 'Département créé depuis la console d\'administration'
      }, {
        onSuccess: () => setNewDeptName('')
      });
    }
  };

  const handleDeleteDept = (id: string) => {
    if (confirm('Voulez-vous vraiment supprimer ce département ?')) {
      deleteDeptMutation.mutate({ id, organizationId });
    }
  };

  const handleAddPos = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPosTitle.trim()) {
      createPosMutation.mutate({
        organizationId,
        title: newPosTitle.trim(),
        category: newPosCategory,
        description: 'Poste créé depuis la console d\'administration'
      }, {
        onSuccess: () => setNewPosTitle('')
      });
    }
  };

  const handleDeletePos = (id: string) => {
    if (confirm('Voulez-vous vraiment supprimer ce poste ?')) {
      deletePosMutation.mutate({ id, organizationId });
    }
  };

  const isSaving = updateOrgMutation.isPending;

  return (
    <div className="p-6 bg-[#F5F7FA]">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Configuration de l'Organisation</h1>
          <p className="text-sm text-gray-600 mt-1">Paramétrage RH de votre entreprise en temps réel</p>
        </div>
        {(isOrgLoading || isDeptsLoading || isPositionsLoading) && (
          <div className="flex items-center text-[#0A6ED1]">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            <span className="text-sm">Chargement...</span>
          </div>
        )}
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
                value={annualLeave}
                onChange={(e) => setAnnualLeave(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jours de congés maladie
              </label>
              <input
                type="number"
                value={sickLeave}
                onChange={(e) => setSickLeave(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]"
              />
            </div>
            <button
              onClick={handleSaveLeavePolicy}
              disabled={isSaving}
              className="w-full px-4 py-2 bg-[#0A6ED1] text-white hover:bg-[#0959b0] disabled:opacity-50 transition-colors flex justify-center items-center"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Enregistrer la politique
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
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Identifiant Fiscal / ICE</label>
              <input
                type="text"
                value={companySiret}
                onChange={(e) => setCompanySiret(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]"
              />
            </div>
            <button
              onClick={handleSaveCompanyInfo}
              disabled={isSaving}
              className="w-full px-4 py-2 bg-[#0A6ED1] text-white hover:bg-[#0959b0] disabled:opacity-50 transition-colors flex justify-center items-center"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Enregistrer l'identité
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
            <div className="space-y-2 mb-4 max-h-[300px] overflow-y-auto">
              {deptsData?.content.length === 0 ? (
                <p className="text-sm text-gray-500 italic p-3 text-center border border-dashed">Aucun département configuré.</p>
              ) : (
                deptsData?.content.map((dept) => (
                  <div key={dept.id} className="flex items-center justify-between p-3 border border-gray-200">
                    <span className="text-sm text-gray-900 font-medium">{dept.name}</span>
                    <button
                      onClick={() => handleDeleteDept(dept.id)}
                      className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                      title="Supprimer le département"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
            <form onSubmit={handleAddDept} className="flex space-x-2">
              <input
                type="text"
                placeholder="Nom du département..."
                value={newDeptName}
                onChange={(e) => setNewDeptName(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0A6ED1] text-sm"
              />
              <button
                type="submit"
                disabled={createDeptMutation.isPending || !newDeptName.trim()}
                className="px-4 py-2 bg-[#0A6ED1] text-white hover:bg-[#0959b0] disabled:opacity-50 text-sm flex items-center"
              >
                <Plus className="w-4 h-4 mr-1" /> Ajouter
              </button>
            </form>
          </div>
        </div>

        {/* Grille Salariale & Postes */}
        <div className="bg-white border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex items-center">
            <DollarSign className="w-5 h-5 text-green-600 mr-3" />
            <h3 className="text-base font-semibold text-gray-900">Postes de l'Organisation</h3>
          </div>
          <div className="p-6">
            <div className="space-y-2 mb-4 max-h-[300px] overflow-y-auto">
              {positionsData?.content.length === 0 ? (
                <p className="text-sm text-gray-500 italic p-3 text-center border border-dashed">Aucun poste configuré.</p>
              ) : (
                positionsData?.content.map((pos) => (
                  <div key={pos.id} className="flex items-center justify-between p-3 border border-gray-200">
                    <div>
                      <span className="text-sm text-gray-900 font-medium block">{pos.title}</span>
                      <span className="text-xs text-[#0A6ED1] bg-[#0A6ED1]/10 px-2 py-0.5 mt-0.5 inline-block font-semibold">
                        {pos.category}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeletePos(pos.id)}
                      className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                      title="Supprimer le poste"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
            <form onSubmit={handleAddPos} className="space-y-2 border-t pt-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Titre du poste..."
                  value={newPosTitle}
                  onChange={(e) => setNewPosTitle(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0A6ED1] text-sm"
                />
                <select
                  value={newPosCategory}
                  onChange={(e) => setNewPosCategory(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0A6ED1] text-sm"
                >
                  <option value="CADRE">Cadre</option>
                  <option value="AGENT_MAITRISE">Maîtrise</option>
                  <option value="EMPLOYE">Employé</option>
                  <option value="STAGIAIRE">Stagiaire</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={createPosMutation.isPending || !newPosTitle.trim()}
                className="w-full px-4 py-2 bg-[#0A6ED1] text-white hover:bg-[#0959b0] disabled:opacity-50 text-sm flex justify-center items-center"
              >
                <Plus className="w-4 h-4 mr-1" /> Ajouter le poste
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
