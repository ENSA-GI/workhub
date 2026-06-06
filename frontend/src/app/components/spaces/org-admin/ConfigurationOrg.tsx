import { useEffect, useMemo, useState } from 'react';
import type React from 'react';
import { AlertCircle, Briefcase, Building2, Calendar, Loader2, Plus, Trash2 } from 'lucide-react';
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

type Feedback = { type: 'success' | 'error'; message: string };

export default function ConfigurationOrg() {
  const organizationId = useOrganizationId();

  const { data: org, isLoading: isOrgLoading } = useOrganization(organizationId);
  const { data: settings, isLoading: isSettingsLoading } = useOrganizationSettings(organizationId);
  const updateOrgMutation = useUpdateOrganization();
  const updateSettingsMutation = useUpdateOrganizationSettings();

  const { data: deptsData, isLoading: isDeptsLoading } = useDepartments(organizationId, 0, 100, true);
  const createDeptMutation = useCreateDepartment();
  const deleteDeptMutation = useDeleteDepartment();

  const { data: positionsData, isLoading: isPositionsLoading } = usePositions(organizationId, 0, 100, true);
  const createPosMutation = useCreatePosition();
  const deletePosMutation = useDeletePosition();

  const [annualLeave, setAnnualLeave] = useState('22');
  const [maxCarryOver, setMaxCarryOver] = useState('10');
  const [companyName, setCompanyName] = useState('');
  const [legalName, setLegalName] = useState('');
  const [companyCity, setCompanyCity] = useState('');
  const [companyCountry, setCompanyCountry] = useState('');
  const [newDeptName, setNewDeptName] = useState('');
  const [newPosTitle, setNewPosTitle] = useState('');
  const [newPosCategory, setNewPosCategory] = useState<'CADRE' | 'AGENT_MAITRISE' | 'EMPLOYE' | 'STAGIAIRE'>('EMPLOYE');
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const departments = useMemo(() => deptsData?.content ?? [], [deptsData]);
  const positions = useMemo(() => positionsData?.content ?? [], [positionsData]);
  const isLoading = isOrgLoading || isSettingsLoading || isDeptsLoading || isPositionsLoading;

  useEffect(() => {
    if (!org) return;
    setCompanyName(org.name || '');
    setLegalName(org.legalName || org.name || '');
    setCompanyCity(org.city || '');
    setCompanyCountry(org.country || 'Maroc');
  }, [org]);

  useEffect(() => {
    if (!settings) return;
    setAnnualLeave(String(settings.leavePolicyDaysPerYear ?? 22));
    setMaxCarryOver(String(settings.leavePolicyMaxCarryOver ?? 10));
  }, [settings]);

  if (!organizationId) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600">Erreur : ID d'organisation manquant dans la session.</p>
      </div>
    );
  }

  const showSuccess = (message: string) => setFeedback({ type: 'success', message });
  const showError = (message: string) => setFeedback({ type: 'error', message });

  const handleSaveCompanyInfo = () => {
    const trimmedName = companyName.trim();
    if (!trimmedName) {
      showError("Le nom de l'entreprise est obligatoire.");
      return;
    }

    setFeedback(null);
    updateOrgMutation.mutate({
      id: organizationId,
      data: {
        name: trimmedName,
        legalName: legalName.trim() || trimmedName,
        city: companyCity.trim(),
        country: companyCountry.trim() || 'Maroc',
        active: org?.active ?? true,
      }
    }, {
      onSuccess: () => showSuccess("Informations de l'organisation enregistrees."),
      onError: (error) => showError(error.message || "Impossible d'enregistrer les informations de l'organisation.")
    });
  };

  const handleSaveLeavePolicy = () => {
    const leaveDays = Number.parseInt(annualLeave, 10);
    const carryOverDays = Number.parseInt(maxCarryOver, 10);
    if (Number.isNaN(leaveDays) || leaveDays < 0 || Number.isNaN(carryOverDays) || carryOverDays < 0) {
      showError('Les valeurs de conges doivent etre des nombres positifs.');
      return;
    }

    setFeedback(null);
    updateSettingsMutation.mutate({
      id: organizationId,
      data: {
        leavePolicyDaysPerYear: leaveDays,
        leavePolicyMaxCarryOver: carryOverDays,
      }
    }, {
      onSuccess: () => showSuccess('Politique de conges enregistree. Elle sera utilisee pour les soldes de conges.'),
      onError: (error) => showError(error.message || "Impossible d'enregistrer la politique de conges.")
    });
  };

  const handleAddDept = (event: React.FormEvent) => {
    event.preventDefault();
    const name = newDeptName.trim();
    if (!name) return;

    setFeedback(null);
    createDeptMutation.mutate({
      organizationId,
      name,
      description: "Departement cree depuis la console d'administration"
    }, {
      onSuccess: () => {
        setNewDeptName('');
        showSuccess('Departement ajoute au referentiel RH.');
      },
      onError: (error) => showError(error.message || "Impossible d'ajouter ce departement.")
    });
  };

  const handleDeleteDept = (id: string, name: string) => {
    if (!confirm(`Desactiver le departement "${name}" ? Il ne sera plus propose dans les listes actives.`)) return;

    setFeedback(null);
    deleteDeptMutation.mutate({ id, organizationId }, {
      onSuccess: () => showSuccess('Departement desactive.'),
      onError: (error) => showError(error.message || 'Impossible de desactiver ce departement.')
    });
  };

  const handleAddPos = (event: React.FormEvent) => {
    event.preventDefault();
    const title = newPosTitle.trim();
    if (!title) return;

    setFeedback(null);
    createPosMutation.mutate({
      organizationId,
      title,
      category: newPosCategory,
      description: "Poste cree depuis la console d'administration"
    }, {
      onSuccess: () => {
        setNewPosTitle('');
        showSuccess('Poste ajoute au referentiel RH.');
      },
      onError: (error) => showError(error.message || "Impossible d'ajouter ce poste.")
    });
  };

  const handleDeletePos = (id: string, title: string) => {
    if (!confirm(`Desactiver le poste "${title}" ? Il ne sera plus propose dans les listes actives.`)) return;

    setFeedback(null);
    deletePosMutation.mutate({ id, organizationId }, {
      onSuccess: () => showSuccess('Poste desactive.'),
      onError: (error) => showError(error.message || 'Impossible de desactiver ce poste.')
    });
  };

  return (
    <div className="min-h-full bg-[#F5F7FA] p-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Configuration RH</h1>
          <p className="mt-1 text-sm text-gray-600">
            Parametres utilises par les modules employes, conges et paie de votre organisation.
          </p>
        </div>
        {isLoading && (
          <div className="flex items-center text-sm text-[#0A6ED1]">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Chargement...
          </div>
        )}
      </div>

      {feedback && (
        <div className={`mb-6 border px-4 py-3 text-sm ${
          feedback.type === 'success'
            ? 'border-green-200 bg-green-50 text-green-700'
            : 'border-red-200 bg-red-50 text-red-700'
        }`}>
          {feedback.message}
        </div>
      )}

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <SummaryCard label="Departements actifs" value={departments.length} />
        <SummaryCard label="Postes actifs" value={positions.length} />
        <SummaryCard label="Conges annuels" value={`${annualLeave || 0} jours`} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Section
          icon={<Building2 className="h-5 w-5 text-[#0A6ED1]" />}
          title="Identite de l'organisation"
          description="Ces informations sont affichees dans l'espace admin et peuvent etre reprises dans les documents generes."
        >
          <div className="space-y-4">
            <TextField label="Nom commercial" value={companyName} onChange={setCompanyName} required />
            <TextField label="Raison sociale" value={legalName} onChange={setLegalName} />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <TextField label="Ville" value={companyCity} onChange={setCompanyCity} />
              <TextField label="Pays" value={companyCountry} onChange={setCompanyCountry} />
            </div>
            <PrimaryButton onClick={handleSaveCompanyInfo} loading={updateOrgMutation.isPending}>
              Enregistrer l'identite
            </PrimaryButton>
          </div>
        </Section>

        <Section
          icon={<Calendar className="h-5 w-5 text-[#0A6ED1]" />}
          title="Politique de conges"
          description="Ces valeurs servent de reference pour calculer et controler les soldes de conges des employes."
        >
          <div className="space-y-4">
            <NumberField label="Droits annuels par employe" suffix="jours" value={annualLeave} onChange={setAnnualLeave} />
            <NumberField label="Report maximum autorise" suffix="jours" value={maxCarryOver} onChange={setMaxCarryOver} />
            <div className="flex gap-3 border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <p>
                Le solde exact d'un employe depend ensuite des regles du module conges et des demandes validees.
              </p>
            </div>
            <PrimaryButton onClick={handleSaveLeavePolicy} loading={updateSettingsMutation.isPending}>
              Enregistrer la politique
            </PrimaryButton>
          </div>
        </Section>

        <Section
          icon={<Briefcase className="h-5 w-5 text-[#0A6ED1]" />}
          title="Referentiel des departements"
          description="Utilise pour classer les employes et faciliter le filtrage RH. La desactivation conserve l'historique."
        >
          <form onSubmit={handleAddDept} className="mb-4 flex gap-2">
            <input
              type="text"
              placeholder="Ex: Ressources Humaines"
              value={newDeptName}
              onChange={(e) => setNewDeptName(e.target.value)}
              className="flex-1 border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]"
            />
            <button
              type="submit"
              disabled={createDeptMutation.isPending || !newDeptName.trim()}
              className="flex items-center bg-[#0A6ED1] px-4 py-2 text-sm text-white hover:bg-[#0959b0] disabled:opacity-50"
            >
              {createDeptMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Ajouter
            </button>
          </form>
          <ReferenceList
            emptyMessage="Aucun departement actif."
            items={departments.map((dept) => ({
              id: dept.id,
              title: dept.name,
              subtitle: dept.description,
              disabled: deleteDeptMutation.isPending,
              onDisable: () => handleDeleteDept(dept.id, dept.name),
            }))}
          />
        </Section>

        <Section
          icon={<Briefcase className="h-5 w-5 text-[#0A6ED1]" />}
          title="Referentiel des postes"
          description="Utilise dans les fiches employes pour standardiser les intitules et categories professionnelles."
        >
          <form onSubmit={handleAddPos} className="mb-4 space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ex: Comptable, Developpeur, Responsable RH"
                value={newPosTitle}
                onChange={(e) => setNewPosTitle(e.target.value)}
                className="flex-1 border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]"
              />
              <select
                value={newPosCategory}
                onChange={(e) => setNewPosCategory(e.target.value as typeof newPosCategory)}
                className="border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]"
              >
                <option value="CADRE">Cadre</option>
                <option value="AGENT_MAITRISE">Maitrise</option>
                <option value="EMPLOYE">Employe</option>
                <option value="STAGIAIRE">Stagiaire</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={createPosMutation.isPending || !newPosTitle.trim()}
              className="flex w-full items-center justify-center bg-[#0A6ED1] px-4 py-2 text-sm text-white hover:bg-[#0959b0] disabled:opacity-50"
            >
              {createPosMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Ajouter le poste
            </button>
          </form>
          <ReferenceList
            emptyMessage="Aucun poste actif."
            items={positions.map((pos) => ({
              id: pos.id,
              title: pos.title,
              subtitle: formatCategory(pos.category),
              disabled: deletePosMutation.isPending,
              onDisable: () => handleDeletePos(pos.id, pos.title),
            }))}
          />
        </Section>
      </div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border border-gray-200 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function Section({ icon, title, description, children }: { icon: React.ReactNode; title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="border border-gray-200 bg-white">
      <div className="border-b border-gray-200 p-5">
        <div className="flex items-center gap-3">
          {icon}
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        </div>
        <p className="mt-2 text-sm leading-6 text-gray-600">{description}</p>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function TextField({ label, value, onChange, required = false }: { label: string; value: string; onChange: (value: string) => void; required?: boolean }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-gray-700">
        {label}{required && <span className="text-red-600"> *</span>}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]"
      />
    </label>
  );
}

function NumberField({ label, suffix, value, onChange }: { label: string; suffix: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-gray-700">{label}</span>
      <div className="flex">
        <input
          type="number"
          min="0"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]"
        />
        <span className="border border-l-0 border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-600">{suffix}</span>
      </div>
    </label>
  );
}

function PrimaryButton({ children, onClick, loading }: { children: React.ReactNode; onClick: () => void; loading: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="flex w-full items-center justify-center bg-[#0A6ED1] px-4 py-2 text-sm font-medium text-white hover:bg-[#0959b0] disabled:opacity-50"
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

function ReferenceList({
  items,
  emptyMessage,
}: {
  items: Array<{ id: string; title: string; subtitle?: string; disabled: boolean; onDisable: () => void }>;
  emptyMessage: string;
}) {
  if (items.length === 0) {
    return <p className="border border-dashed border-gray-300 p-4 text-center text-sm text-gray-500">{emptyMessage}</p>;
  }

  return (
    <div className="max-h-[320px] space-y-2 overflow-y-auto">
      {items.map((item) => (
        <div key={item.id} className="flex items-center justify-between border border-gray-200 p-3">
          <div>
            <p className="text-sm font-medium text-gray-900">{item.title}</p>
            {item.subtitle && <p className="mt-0.5 text-xs text-gray-500">{item.subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={item.onDisable}
            disabled={item.disabled}
            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
            title="Desactiver"
          >
            <Trash2 className="h-4 w-4" />
            Desactiver
          </button>
        </div>
      ))}
    </div>
  );
}

function formatCategory(category: string) {
  switch (category) {
    case 'CADRE':
      return 'Cadre';
    case 'AGENT_MAITRISE':
      return 'Agent de maitrise';
    case 'STAGIAIRE':
      return 'Stagiaire';
    default:
      return 'Employe';
  }
}
