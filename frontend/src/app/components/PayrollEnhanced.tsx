import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Download, ChevronRight, Loader2, MoreVertical, Search } from 'lucide-react';
import { usePayPayroll, usePayrollItems, usePayrolls, payrollValue, Payroll, useUpdatePayrollStatus, useExportPayslipsZip } from '@/lib/usePayroll';
import { useOrganizationId } from '@/lib/useOrganizationId';
import { useUser } from '@/lib/useUser';

function monthLabel(payroll: Payroll) {
  return new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(new Date(payroll.year, payroll.month - 1, 1));
}

export default function PayrollEnhanced() {
  const navigate = useNavigate();
  const { user } = useUser();
  const organizationId = useOrganizationId();
  const userId = user?.id || '';

  const { data: payrolls = [], isLoading, error } = usePayrolls(organizationId);
  const [selectedPayrollId, setSelectedPayrollId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const filteredPayrolls = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return payrolls;

    return payrolls.filter((payroll) => {
      const numericPeriod = `${String(payroll.month).padStart(2, '0')}/${payroll.year}`;
      const target = `${monthLabel(payroll)} ${numericPeriod} ${payroll.status} ${payroll.id}`.toLowerCase();
      return target.includes(query);
    });
  }, [payrolls, searchTerm]);
  const selectedPayroll = useMemo(() => filteredPayrolls.find((payroll) => payroll.id === selectedPayrollId) ?? filteredPayrolls[0] ?? null, [filteredPayrolls, selectedPayrollId]);
  const { data: selectedItems = [] } = usePayrollItems(selectedPayroll?.id || '');
  const statusMutation = useUpdatePayrollStatus();
  const payMutation = usePayPayroll();
  const exportZipMutation = useExportPayslipsZip();

  const selectedGross = selectedPayroll ? payrollValue(selectedPayroll.totalGrossSalary) : 0;
  const selectedNet = selectedPayroll ? payrollValue(selectedPayroll.totalNetSalary) : 0;
  const selectedDeductions = selectedPayroll ? payrollValue(selectedPayroll.totalCnss) + payrollValue(selectedPayroll.totalAmo) + payrollValue(selectedPayroll.totalIr) : 0;

  if (!organizationId) {
    return <div className="p-6 text-center text-red-600">ID d'organisation manquant dans la session. La paie n'a pas pu être chargée.</div>;
  }

  const handleValidatePayroll = async () => {
    if (!selectedPayroll || !userId) return;
    try {
      await statusMutation.mutateAsync({ payrollId: selectedPayroll.id, status: 'VALIDATED', updatedBy: userId });
    } catch (err) {
      console.error(err);
    }
  };

  const handlePayPayroll = async () => {
    if (!selectedPayroll || !userId) return;
    try {
      await payMutation.mutateAsync({ payrollId: selectedPayroll.id, updatedBy: userId });
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportZip = async (payrollId: string) => {
    try {
      const blob = await exportZipMutation.mutateAsync(payrollId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bulletins_paie_${payrollId}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Erreur lors de l'export ZIP", err);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Gestion de la Paie</h1>
          <p className="text-sm text-gray-600 mt-1">Données du système central</p>
        </div>
        <div className="flex space-x-3">
          <button onClick={() => navigate('/payroll-generation')} className="px-4 py-2 bg-[#0A6ED1] text-white rounded hover:bg-[#0959b0] flex items-center"><Plus className="w-4 h-4 mr-2" />Générer la Paie</button>
        </div>
      </div>

      {error && <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">Impossible de charger l'historique de paie.</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded border border-gray-200">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">Historique Mensuel de la Paie</h3>
              {isLoading && <Loader2 className="h-4 w-4 animate-spin text-gray-500" />}
            </div>
            <div className="p-4 border-b border-gray-200">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par periode, statut ou reference..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0A6ED1] rounded text-sm"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Période</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employés</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Brut</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Net</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th><th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th></tr></thead>
                <tbody className="divide-y divide-gray-200">
                  {!isLoading && filteredPayrolls.length === 0 && <tr><td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">{payrolls.length === 0 ? 'Aucune paie trouvée pour cette organisation.' : 'Aucune paie ne correspond à la recherche.'}</td></tr>}
                  {filteredPayrolls.map((payroll) => (
                    <tr key={payroll.id} className={`hover:bg-gray-50 cursor-pointer ${selectedPayroll?.id === payroll.id ? 'bg-blue-50' : ''}`} onClick={() => setSelectedPayrollId(payroll.id)}>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{monthLabel(payroll)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{selectedItems.length || '—'}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">MAD {payrollValue(payroll.totalGrossSalary).toLocaleString('fr-FR')}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">MAD {payrollValue(payroll.totalNetSalary).toLocaleString('fr-FR')}</td>
                      <td className="px-6 py-4"><span className={`inline-flex px-2 py-1 text-xs rounded ${payroll.status === 'PAID' ? 'bg-green-100 text-green-800' : payroll.status === 'VALIDATED' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'}`}>{payroll.status}</span></td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button onClick={(e) => { e.stopPropagation(); handleExportZip(payroll.id); }} disabled={exportZipMutation.isPending} className="p-1 hover:bg-gray-100 rounded disabled:opacity-50" title="Télécharger tous les bulletins en ZIP">
                            {exportZipMutation.isPending && selectedPayrollId === payroll.id ? <Loader2 className="w-4 h-4 text-gray-600 animate-spin" /> : <Download className="w-4 h-4 text-gray-600" />}
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); navigate(`/payroll-details?id=${payroll.id}`); }} className="p-1 hover:bg-gray-100 rounded" title="Détails">
                            <MoreVertical className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          {selectedPayroll ? (
            <div className="bg-white rounded border border-gray-200 p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Détail de la Paie</h3>
              <div className="mb-4"><p className="text-sm text-gray-600 mb-1">Période</p><p className="text-lg font-semibold text-gray-900">{monthLabel(selectedPayroll)}</p></div>
              <div className="grid grid-cols-2 gap-4 mb-6"><div className="bg-gray-50 rounded p-3"><p className="text-xs text-gray-600 mb-1">Bulletins</p><p className="text-lg font-semibold text-gray-900">{selectedItems.length}</p></div><div className="bg-gray-50 rounded p-3"><p className="text-xs text-gray-600 mb-1">Statut</p><p className="text-sm font-medium text-gray-900">{selectedPayroll.status}</p></div></div>
              <div className="space-y-3 mb-6"><h4 className="text-sm font-medium text-gray-900">Montants calculés</h4><div className="flex items-center justify-between py-2 border-b border-gray-100"><span className="text-sm text-gray-600">Brut</span><span className="text-sm font-medium text-gray-900">MAD {selectedGross.toLocaleString('fr-FR')}</span></div><div className="flex items-center justify-between py-2 border-b border-gray-100"><span className="text-sm text-gray-600">Retenues</span><span className="text-sm font-medium text-gray-900">MAD {selectedDeductions.toLocaleString('fr-FR')}</span></div><div className="flex items-center justify-between pt-2 border-t border-gray-200"><span className="text-base font-semibold text-gray-900">Net</span><span className="text-base font-semibold text-[#0A6ED1]">MAD {selectedNet.toLocaleString('fr-FR')}</span></div>
                <div className="flex items-center space-x-3 mt-4">
                  <button
                    disabled={!selectedPayroll || selectedPayroll.status === 'PAID' || statusMutation.isPending || payMutation.isPending}
                    onClick={selectedPayroll.status === 'DRAFT' ? handleValidatePayroll : handlePayPayroll}
                    className="w-full px-4 py-2 bg-[#0A6ED1] text-white hover:bg-[#0959b0] flex items-center justify-center rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {(statusMutation.isPending || payMutation.isPending) ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : null}
                    {selectedPayroll?.status === 'PAID' ? 'Déjà payée' : selectedPayroll?.status === 'VALIDATED' ? 'Marquer comme payée' : 'Valider la paie'}
                  </button>
                </div>
              </div>
              <button onClick={() => navigate(`/payroll-details?id=${selectedPayroll.id}`)} className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 flex items-center justify-center">{selectedPayroll.status === 'DRAFT' ? 'Voir / Ajuster les détails' : 'Voir les détails'}<ChevronRight className="w-4 h-4 ml-1" /></button>
            </div>
          ) : <div className="bg-white rounded border border-gray-200 p-6 flex items-center justify-center h-64"><p className="text-sm text-gray-500">Sélectionnez une paie pour voir le détail</p></div>}
        </div>
      </div>
    </div>
  );
}

