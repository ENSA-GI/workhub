import { useEffect, useMemo, useState } from 'react';
import { Save, FileText, DollarSign, Percent, Calendar, AlertCircle, Loader2 } from 'lucide-react';
import { useOrganization } from '@/lib/useOrg';
import { payrollValue, usePayrollBudgetUtilization, usePayrollConfig, useSavePayrollBudget, useUpdatePayrollConfig } from '@/lib/usePayroll';
import { useOrganizationId } from '@/lib/useOrganizationId';

export default function PayrollSettings() {
  const organizationId = useOrganizationId();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const { data: org } = useOrganization(organizationId);
  const { data: payrollConfig } = usePayrollConfig(organizationId);
  const { data: budgetUtilization } = usePayrollBudgetUtilization(organizationId, selectedYear);
  const updateConfig = useUpdatePayrollConfig();
  const saveBudget = useSavePayrollBudget();

  const [cnssRate, setCnssRate] = useState('');
  const [amoRate, setAmoRate] = useState('');
  const [childDeduction, setChildDeduction] = useState('');
  const [maxChildrenDeduction, setMaxChildrenDeduction] = useState('');
  const [irBracketsText, setIrBracketsText] = useState('');
  const [annualBudget, setAnnualBudget] = useState('');

  useEffect(() => {
    if (payrollConfig) {
      setCnssRate(String(payrollConfig.cnssEmployeeRate ?? ''));
      setAmoRate(String(payrollConfig.amoEmployeeRate ?? ''));
      setChildDeduction(String(payrollConfig.childDeduction ?? ''));
      setMaxChildrenDeduction(String(payrollConfig.maxChildrenDeduction ?? ''));
      setIrBracketsText(payrollConfig.irBrackets || '');
    }
  }, [payrollConfig]);

  useEffect(() => {
    if (budgetUtilization) {
      setAnnualBudget(String(payrollValue(budgetUtilization.annualBudget)));
    }
  }, [budgetUtilization]);

  const parsedBrackets = useMemo(() => {
    if (!irBracketsText) return [] as Array<{ min: number; max: number | null; rate: number; description?: string }>;
    try {
      return JSON.parse(irBracketsText);
    } catch {
      return [] as Array<{ min: number; max: number | null; rate: number; description?: string }>;
    }
  }, [irBracketsText]);

  if (!organizationId) {
    return <div className="p-6 text-center text-red-600">ID d'organisation manquant dans Clerk.</div>;
  }

  const handleSaveConfig = async () => {
    await updateConfig.mutateAsync({
      orgId: organizationId,
      data: {
        ...payrollConfig,
        organizationId,
        cnssEmployeeRate: Number(cnssRate || 0),
        amoEmployeeRate: Number(amoRate || 0),
        childDeduction: Number(childDeduction || 0),
        maxChildrenDeduction: Number(maxChildrenDeduction || 0),
        irBrackets: irBracketsText,
      } as any,
    });
  };

  const handleSaveBudget = async () => {
    await saveBudget.mutateAsync({
      orgId: organizationId,
      year: selectedYear,
      totalBudget: Number(annualBudget || 0),
    });
  };

  return (
    <div className="p-6 bg-[#F5F7FA]">
      <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Paramètres de Paie</h1>
          <p className="text-sm text-gray-600 mt-1">Configuration réelle chargée depuis la base de données</p>
        </div>
        <button onClick={handleSaveConfig} className="px-6 py-2 bg-[#0A6ED1] text-white hover:bg-[#0959b0] flex items-center disabled:opacity-60">
          {updateConfig.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Enregistrer
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white border border-gray-200 p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Cotisations sociales</h3>
          <div className="space-y-4">
            <div><label className="block text-xs font-medium text-gray-500 uppercase mb-1">CNSS salarié (%)</label><input type="number" step="0.01" value={cnssRate} onChange={(e) => setCnssRate(e.target.value)} className="w-full px-3 py-2 border border-gray-300" /></div>
            <div><label className="block text-xs font-medium text-gray-500 uppercase mb-1">AMO salarié (%)</label><input type="number" step="0.01" value={amoRate} onChange={(e) => setAmoRate(e.target.value)} className="w-full px-3 py-2 border border-gray-300" /></div>
            <div><label className="block text-xs font-medium text-gray-500 uppercase mb-1">Déduction enfant</label><input type="number" value={childDeduction} onChange={(e) => setChildDeduction(e.target.value)} className="w-full px-3 py-2 border border-gray-300" /></div>
            <div><label className="block text-xs font-medium text-gray-500 uppercase mb-1">Nombre max d'enfants</label><input type="number" value={maxChildrenDeduction} onChange={(e) => setMaxChildrenDeduction(e.target.value)} className="w-full px-3 py-2 border border-gray-300" /></div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Budget annuel</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3"><Calendar className="w-5 h-5 text-[#0A6ED1]" /><select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className="flex-1 px-3 py-2 border border-gray-300">{[new Date().getFullYear(), new Date().getFullYear() - 1, new Date().getFullYear() - 2].map((y) => <option key={y} value={y}>Année {y}</option>)}</select></div>
            <div><label className="block text-xs font-medium text-gray-500 uppercase mb-1">Montant total budget</label><input type="number" value={annualBudget} onChange={(e) => setAnnualBudget(e.target.value)} className="w-full px-3 py-2 border border-gray-300" /></div>
            <button onClick={handleSaveBudget} className="px-4 py-2 bg-[#0A6ED1] text-white rounded flex items-center disabled:opacity-60">{saveBudget.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <DollarSign className="w-4 h-4 mr-2" />}Sauvegarder le budget</button>
            <div className="text-sm text-gray-600">Dépensé: MAD {payrollValue(budgetUtilization?.spentAmount).toLocaleString('fr-FR')}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4"><h3 className="text-base font-semibold text-gray-900">Barème IR reçu du backend</h3><Percent className="w-5 h-5 text-[#0A6ED1]" /></div>
          <div className="space-y-3">
            {parsedBrackets.length > 0 ? parsedBrackets.map((bracket: any, index: number) => (
              <div key={index} className="flex items-center justify-between border-b border-gray-100 pb-2">
                <span className="text-sm text-gray-700">{bracket.description || `Tranche ${index + 1}`}</span>
                <span className="text-sm font-medium text-gray-900">{bracket.rate}%</span>
              </div>
            )) : <p className="text-sm text-gray-500">Aucun barème IR disponible en base.</p>}
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4"><h3 className="text-base font-semibold text-gray-900">Informations entreprise</h3><FileText className="w-5 h-5 text-[#0A6ED1]" /></div>
          <div className="space-y-2 text-sm text-gray-700">
            <p><span className="font-medium">Nom:</span> {org?.name || org?.legalName || 'Non défini'}</p>
            <p><span className="font-medium">Adresse:</span> {org?.address || 'Non définie'}</p>
            <p><span className="font-medium">ICE / Tax ID:</span> {org?.taxId || 'Non défini'}</p>
            <p><span className="font-medium">Affiliation CNSS:</span> {org?.cnssAffiliation || 'Non définie'}</p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 p-4">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-blue-900 mb-2">Important</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Ces valeurs sont lues et sauvegardées via l'API de paie</li>
              <li>• Les configurations précédentes restent en base avec leur date d'effet</li>
              <li>• Les champs sans valeur backend apparaissent volontairement vides</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
