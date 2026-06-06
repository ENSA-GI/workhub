import { useEffect, useMemo, useState } from 'react';
import { Save, FileText, DollarSign, Percent, Calendar, AlertCircle, Loader2 } from 'lucide-react';
import { useOrganization } from '@/lib/useOrg';
import { payrollValue, usePayrollBudgetUtilization, usePayrollConfig, useSavePayrollBudget, useUpdatePayrollConfig } from '@/lib/usePayroll';
import { useOrganizationId } from '@/lib/useOrganizationId';

function formatIrBrackets(value: string) {
  if (!value) return '';
  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
}

export default function PayrollSettings() {
  const organizationId = useOrganizationId();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const { data: org } = useOrganization(organizationId);
  const configQuery = usePayrollConfig(organizationId);
  const budgetQuery = usePayrollBudgetUtilization(organizationId, selectedYear);
  const payrollConfig = configQuery.data;
  const budgetUtilization = budgetQuery.data;
  const updateConfig = useUpdatePayrollConfig();
  const saveBudget = useSavePayrollBudget();

  const [cnssRate, setCnssRate] = useState('');
  const [amoRate, setAmoRate] = useState('');
  const [childDeduction, setChildDeduction] = useState('');
  const [maxChildrenDeduction, setMaxChildrenDeduction] = useState('');
  const [irBracketsText, setIrBracketsText] = useState('');
  const [annualBudget, setAnnualBudget] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (payrollConfig) {
      setCnssRate(String(payrollValue(payrollConfig.cnssEmployeeRate) * 100));
      setAmoRate(String(payrollValue(payrollConfig.amoEmployeeRate) * 100));
      setChildDeduction(String(payrollConfig.childDeduction ?? ''));
      setMaxChildrenDeduction(String(payrollConfig.maxChildrenDeduction ?? ''));
      setIrBracketsText(formatIrBrackets(payrollConfig.irBrackets || ''));
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
    return <div className="p-6 text-center text-red-600">ID d'organisation manquant dans la session.</div>;
  }

  const handleSaveConfig = async () => {
    setFeedback(null);
    const cnssPercentage = Number(cnssRate);
    const amoPercentage = Number(amoRate);
    const childAmount = Number(childDeduction);
    const maxChildren = Number(maxChildrenDeduction);

    if ([cnssPercentage, amoPercentage, childAmount, maxChildren].some((value) => !Number.isFinite(value))
      || cnssPercentage < 0 || cnssPercentage > 100 || amoPercentage < 0 || amoPercentage > 100
      || childAmount < 0 || maxChildren < 0 || !Number.isInteger(maxChildren)) {
      setFeedback({ type: 'error', message: 'Vérifiez les taux, la déduction enfant et le nombre maximal d’enfants.' });
      return;
    }
    if (parsedBrackets.length === 0) {
      setFeedback({ type: 'error', message: 'Le barème IR doit être un tableau JSON valide contenant au moins une tranche.' });
      return;
    }

    try {
      await updateConfig.mutateAsync({
        orgId: organizationId,
        data: {
          organizationId,
          cnssEmployeeRate: cnssPercentage / 100,
          amoEmployeeRate: amoPercentage / 100,
          childDeduction: childAmount,
          maxChildrenDeduction: maxChildren,
          irBrackets: JSON.stringify(parsedBrackets),
          effectiveDate: new Date().toISOString().slice(0, 10),
          active: true,
        },
      });
      setFeedback({ type: 'success', message: 'Les paramètres de paie ont été enregistrés.' });
    } catch (error) {
      setFeedback({ type: 'error', message: error instanceof Error ? error.message : 'Impossible d’enregistrer les paramètres.' });
    }
  };

  const handleSaveBudget = async () => {
    setFeedback(null);
    const totalBudget = Number(annualBudget);
    if (!Number.isFinite(totalBudget) || totalBudget < 0) {
      setFeedback({ type: 'error', message: 'Le budget annuel doit être un montant positif.' });
      return;
    }
    try {
      await saveBudget.mutateAsync({ orgId: organizationId, year: selectedYear, totalBudget });
      setFeedback({ type: 'success', message: `Le budget ${selectedYear} a été enregistré.` });
    } catch (error) {
      setFeedback({ type: 'error', message: error instanceof Error ? error.message : 'Impossible d’enregistrer le budget.' });
    }
  };

  return (
    <div className="p-6 bg-[#F5F7FA]">
      <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Paramètres de Paie</h1>
          <p className="text-sm text-gray-600 mt-1">Configuration réelle chargée depuis la base de données</p>
        </div>
        <button onClick={handleSaveConfig} disabled={updateConfig.isPending} className="px-6 py-2 bg-[#0A6ED1] text-white hover:bg-[#0959b0] flex items-center disabled:opacity-60">
          {updateConfig.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Enregistrer
        </button>
      </div>
      {feedback && <div className={`mb-4 border p-3 text-sm ${feedback.type === 'success' ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700'}`}>{feedback.message}</div>}
      {(configQuery.isError || budgetQuery.isError) && <div className="mb-4 border border-red-200 bg-red-50 p-3 text-sm text-red-700">Certaines données de configuration n'ont pas pu être chargées.</div>}
      {(configQuery.isLoading || budgetQuery.isLoading) && <div className="mb-4 flex items-center text-sm text-gray-600"><Loader2 className="w-4 h-4 mr-2 animate-spin" />Chargement des paramètres...</div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white border border-gray-200 p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Cotisations sociales</h3>
          <div className="space-y-4">
            <div><label className="block text-xs font-medium text-gray-500 uppercase mb-1">CNSS salarié (%)</label><input type="number" min="0" max="100" step="0.01" value={cnssRate} onChange={(e) => setCnssRate(e.target.value)} className="w-full px-3 py-2 border border-gray-300" /><p className="text-xs text-gray-500 mt-1">Exemple : saisir 4,48 pour appliquer 4,48 %.</p></div>
            <div><label className="block text-xs font-medium text-gray-500 uppercase mb-1">AMO salarié (%)</label><input type="number" min="0" max="100" step="0.01" value={amoRate} onChange={(e) => setAmoRate(e.target.value)} className="w-full px-3 py-2 border border-gray-300" /></div>
            <div><label className="block text-xs font-medium text-gray-500 uppercase mb-1">Déduction par enfant (MAD)</label><input type="number" min="0" step="0.01" value={childDeduction} onChange={(e) => setChildDeduction(e.target.value)} className="w-full px-3 py-2 border border-gray-300" /></div>
            <div><label className="block text-xs font-medium text-gray-500 uppercase mb-1">Nombre max d'enfants</label><input type="number" min="0" step="1" value={maxChildrenDeduction} onChange={(e) => setMaxChildrenDeduction(e.target.value)} className="w-full px-3 py-2 border border-gray-300" /></div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Budget annuel</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3"><Calendar className="w-5 h-5 text-[#0A6ED1]" /><select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className="flex-1 px-3 py-2 border border-gray-300">{[new Date().getFullYear(), new Date().getFullYear() - 1, new Date().getFullYear() - 2].map((y) => <option key={y} value={y}>Année {y}</option>)}</select></div>
            <div><label className="block text-xs font-medium text-gray-500 uppercase mb-1">Montant total budget</label><input type="number" min="0" step="0.01" value={annualBudget} onChange={(e) => setAnnualBudget(e.target.value)} className="w-full px-3 py-2 border border-gray-300" /></div>
            <button onClick={handleSaveBudget} disabled={saveBudget.isPending} className="px-4 py-2 bg-[#0A6ED1] text-white rounded flex items-center disabled:opacity-60">{saveBudget.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <DollarSign className="w-4 h-4 mr-2" />}Sauvegarder le budget</button>
            <div className="text-sm text-gray-600">Dépensé: MAD {payrollValue(budgetUtilization?.spentAmount).toLocaleString('fr-FR')}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4"><h3 className="text-base font-semibold text-gray-900">Barème IR</h3><Percent className="w-5 h-5 text-[#0A6ED1]" /></div>
          <div className="space-y-3">
            {parsedBrackets.length > 0 ? parsedBrackets.map((bracket: any, index: number) => (
              <div key={index} className="flex items-center justify-between border-b border-gray-100 pb-2">
                <span className="text-sm text-gray-700">{bracket.description || `Tranche ${index + 1}`}</span>
                <span className="text-sm font-medium text-gray-900">{payrollValue(bracket.rate) * 100}%</span>
              </div>
            )) : <p className="text-sm text-gray-500">Aucun barème IR disponible en base.</p>}
            <div className="pt-3">
              <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Barème IR au format JSON</label>
              <textarea value={irBracketsText} onChange={(e) => setIrBracketsText(e.target.value)} rows={10} className="w-full px-3 py-2 border border-gray-300 font-mono text-xs" />
              <p className="text-xs text-gray-500 mt-1">Les taux sont stockés en décimal : 0.10 correspond à 10 %.</p>
            </div>
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
              <li>• Chaque enregistrement crée une nouvelle version active immédiatement; les anciennes versions restent en base</li>
              <li>• Les champs sans valeur apparaissent volontairement vides</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
