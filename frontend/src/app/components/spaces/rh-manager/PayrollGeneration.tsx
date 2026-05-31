import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { Calendar, Download, CheckCircle, Search, Loader2, AlertCircle } from 'lucide-react';
import { useGeneratePayroll, usePayrollItems, usePayrolls, payrollValue } from '@/lib/usePayroll';
import { useOrganizationId } from '@/lib/useOrganizationId';

function monthLabel(selectedMonth: string) {
  return new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(new Date(`${selectedMonth}-01`));
}

export default function PayrollGeneration() {
  const navigate = useNavigate();
  const { user } = useUser();
  const organizationId = useOrganizationId();
  const generatedBy = (user?.publicMetadata?.employeeId as string) || '';
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [monthTouched, setMonthTouched] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: payrolls = [] } = usePayrolls(organizationId);
  const generatePayroll = useGeneratePayroll();

  const selectedYear = Number(selectedMonth.split('-')[0]);
  const selectedMonthNumber = Number(selectedMonth.split('-')[1]);
  const selectedPayroll = useMemo(() => payrolls.find((payroll) => payroll.year === selectedYear && payroll.month === selectedMonthNumber) || null, [payrolls, selectedYear, selectedMonthNumber]);
  const { data: selectedPayrollItems = [], isLoading: selectedPayrollItemsLoading } = usePayrollItems(selectedPayroll?.id || '');

  const payrollRows = useMemo(() => selectedPayrollItems.map((item) => {
    const adjustments = Array.isArray(item.adjustments) ? item.adjustments : [];
    const adjustmentTotal = adjustments.reduce((sum, adj) => {
      const amount = payrollValue(adj.amount);
      return sum + (adj.type === 'DEDUCTION' ? -amount : amount);
    }, 0);

    return {
      id: item.id,
      employeeId: item.employeeId,
      estimatedGross: payrollValue(item.grossSalary),
      estimatedNet: payrollValue(item.netSalary),
      adjustmentTotal,
    };
  }), [selectedPayrollItems]);

  const filteredEmployees = payrollRows.filter((emp) => {
    const searchTarget = `${emp.id} ${emp.employeeId}`.toLowerCase();
    return searchTarget.includes(searchTerm.toLowerCase());
  });

  const totalGross = filteredEmployees.reduce((sum, emp) => sum + emp.estimatedGross, 0);
  const totalNet = filteredEmployees.reduce((sum, emp) => sum + emp.estimatedNet, 0);
  const hasGeneratedPayroll = !!selectedPayroll;
  const selectedPeriodLabel = selectedPayroll ? monthLabel(`${selectedPayroll.year}-${String(selectedPayroll.month).padStart(2, '0')}`) : monthLabel(selectedMonth);
  const hasRenderableRows = hasGeneratedPayroll && !selectedPayrollItemsLoading && filteredEmployees.length > 0;

  const handleMonthChange = (value: string) => setSelectedMonth(value);

  const handleGeneratePayroll = async () => {
    if (!organizationId || !generatedBy) {
      alert('Organization ID ou generatedBy manquant dans Clerk.');
      return;
    }

    const [yearStr, monthStr] = selectedMonth.split('-');
    await generatePayroll.mutateAsync({
      organizationId,
      generatedBy,
      year: Number(yearStr),
      month: Number(monthStr),
    });

    navigate('/payroll');
  };

  if (!organizationId) {
    return <div className="p-6 text-center text-red-600">Aucune organisation active trouvée dans Clerk. Vérifie que l'utilisateur est bien rattaché à une organisation.</div>;
  }

  return (
    <div className="p-6 bg-[#F5F7FA]">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Génération de la Paie</h1>
          <p className="text-sm text-gray-600 mt-1">
            {hasGeneratedPayroll
              ? 'Paie générée pour cette période chargée depuis le backend'
              : 'Aucune paie backend pour cette période. Le tableau restera vide tant qu’elle n’existe pas.'}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => selectedPayroll && window.open(`/payroll/payrolls/${selectedPayroll.id}/payslips/export-zip`, '_blank')}
            disabled={!selectedPayroll}
            className="px-4 py-2 border border-gray-300 bg-white flex items-center disabled:text-gray-400 disabled:cursor-not-allowed text-gray-700 hover:bg-gray-50"
            title={selectedPayroll ? 'Exporter les bulletins ZIP' : 'Exporter disponible après génération'}
          >
            <Download className="w-4 h-4 mr-2" />
            {selectedPayroll ? 'Exporter ZIP' : 'Export indisponible'}
          </button>
          <button onClick={handleGeneratePayroll} disabled={generatePayroll.isPending} className="px-6 py-2 bg-[#0A6ED1] text-white hover:bg-[#0959b0] flex items-center disabled:opacity-60">
            {generatePayroll.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
            {selectedPayroll ? 'Régénérer la Paie' : 'Générer la Paie'}
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center space-x-4">
            <Calendar className="w-5 h-5 text-[#0A6ED1]" />
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Période de Paie</label>
              <input type="month" value={selectedMonth} onChange={(e) => handleMonthChange(e.target.value)} className="px-4 py-2 border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]" />
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-center"><p className="text-xs text-gray-500 uppercase mb-1">Période</p><p className="text-sm font-medium text-gray-900">{selectedPeriodLabel}</p></div>
            <div className="text-center"><p className="text-xs text-gray-500 uppercase mb-1">Lignes backend</p><p className="text-lg font-semibold text-gray-900">{selectedPayrollItems.length}</p></div>
            <div className="text-center"><p className="text-xs text-gray-500 uppercase mb-1">Source</p><p className="text-sm font-medium text-gray-900">{hasGeneratedPayroll ? 'Backend paie' : 'Aucune paie'}</p></div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 mb-6">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">Détail des Salaires - {selectedPeriodLabel}</h3>
          <span className="text-sm text-gray-500">{hasGeneratedPayroll ? 'Données réelles de la paie générée avec ajustements backend' : 'Tableau vide tant qu’aucune paie backend n’existe'}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Matricule</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ajustements</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Salaire Brut</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Salaire Net</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {hasRenderableRows && filteredEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 text-sm font-medium text-gray-900">{emp.id.slice(0, 8)}</td>
                  <td className="px-4 py-4 text-sm text-right text-gray-600">MAD {emp.adjustmentTotal.toLocaleString('fr-FR')}</td>
                  <td className="px-4 py-4 text-sm text-right text-gray-900">MAD {emp.estimatedGross.toLocaleString('fr-FR')}</td>
                  <td className="px-4 py-4 text-sm text-right font-semibold text-gray-900">MAD {emp.estimatedNet.toLocaleString('fr-FR')}</td>
                </tr>
              ))}
              {hasGeneratedPayroll && !selectedPayrollItemsLoading && filteredEmployees.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-500">Aucune ligne de paie disponible pour cette période.</td></tr>
              )}
              {!hasGeneratedPayroll && (
                <tr>
                  <td colSpan={4} className="px-4 py-8">
                    <div className="flex flex-col items-center justify-center text-center text-gray-600">
                      <AlertCircle className="w-10 h-10 text-gray-400 mb-3" />
                      <p className="font-medium text-gray-900 mb-1">Aucune paie générée pour {selectedPeriodLabel}</p>
                      <p className="text-sm max-w-xl">
                        Le tableau reste vide tant qu’aucune paie backend n’existe pour cette période.
                        Lancez la génération pour charger les lignes réelles et les ajustements.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
            {hasRenderableRows && (
              <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                <tr>
                  <td colSpan={1} className="px-4 py-4 text-sm font-semibold text-gray-900 uppercase">Total Général ({filteredEmployees.length} lignes)</td>
                  <td className="px-4 py-4 text-sm text-right font-semibold text-gray-900">MAD {filteredEmployees.reduce((sum, emp) => sum + (emp.adjustmentTotal || 0), 0).toLocaleString('fr-FR')}</td>
                  <td className="px-4 py-4 text-sm text-right font-semibold text-gray-900">MAD {totalGross.toLocaleString('fr-FR')}</td>
                  <td className="px-4 py-4 text-sm text-right font-semibold text-gray-900">MAD {totalNet.toLocaleString('fr-FR')}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
