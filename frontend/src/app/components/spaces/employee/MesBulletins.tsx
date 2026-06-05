import { useMemo, useState } from 'react';
import { Download, Eye, FileText, Calendar } from 'lucide-react';
import { useEmployeePayslips, payrollValue, PayrollItem } from '@/lib/usePayroll';
import { useUser } from '@/lib/useUser';

type EmployeePayslip = PayrollItem & { payroll?: { month: number; year: number } | null };

export default function MesBulletins() {
  const { user } = useUser();
  const employeeId = (user?.publicMetadata?.employeeId as string) || '';
  const [selectedBulletinId, setSelectedBulletinId] = useState<string>('');
  const { data: bulletins = [], isLoading } = useEmployeePayslips(employeeId);

  const selectedBulletin = useMemo(
    () => (bulletins.find((b) => b.id === selectedBulletinId) as EmployeePayslip | undefined) || (bulletins[0] as EmployeePayslip | undefined),
    [bulletins, selectedBulletinId]
  );
  const totalGross = bulletins.reduce((sum, b) => sum + payrollValue(b.grossSalary), 0);
  const totalNet = bulletins.reduce((sum, b) => sum + payrollValue(b.netSalary), 0);
  const totalCharges = bulletins.reduce((sum, b) => sum + payrollValue(b.cnssDeduction) + payrollValue(b.amoDeduction) + payrollValue(b.irDeduction), 0);

  if (!employeeId) {
    return <div className="p-6 text-center text-red-600">ID employe manquant dans la session.</div>;
  }

  const handleDownload = async (id: string) => {
    try {
      const response = await fetch(`/payroll/payrolls/items/${id}/download`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('workhub.token')}` },
      });
      if (!response.ok) throw new Error('Failed to download PDF');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bulletin_${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Erreur de telechargement', err);
    }
  };

  const handleSelect = (id: string) => {
    setSelectedBulletinId(id);
  };

  const selectedPeriod = selectedBulletin?.payroll
    ? `${selectedBulletin.payroll.month}/${selectedBulletin.payroll.year}`
    : 'Bulletin';

  return (
    <div className="p-6 bg-[#F5F7FA]">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Mes Bulletins de Paie</h1>
        <p className="text-sm text-gray-600 mt-1">Vos documents officiels</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">Historique des Bulletins</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Periode</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Salaire Brut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Salaire Net</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {bulletins.map((bulletin) => {
                  const payslip = bulletin as EmployeePayslip;
                  const period = payslip.payroll ? `${payslip.payroll.month}/${payslip.payroll.year}` : bulletin.id;

                  return (
                    <tr key={bulletin.id} className={`hover:bg-gray-50 cursor-pointer ${selectedBulletin?.id === bulletin.id ? 'bg-blue-50' : ''}`} onClick={() => handleSelect(bulletin.id)}>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <FileText className="w-4 h-4 text-[#0A6ED1] mr-2" />
                          <span className="text-sm font-medium text-gray-900">{period}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">MAD {payrollValue(bulletin.grossSalary).toLocaleString('fr-FR')}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">MAD {payrollValue(bulletin.netSalary).toLocaleString('fr-FR')}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button onClick={(e) => { e.stopPropagation(); handleSelect(bulletin.id); }} className="p-1 hover:bg-blue-50 text-blue-600" title="Voir details">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleDownload(bulletin.id); }} className="p-1 hover:bg-green-50 text-green-600" title="Telecharger PDF">
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {!isLoading && bulletins.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">Aucun bulletin disponible pour cet employe.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">Detail du Bulletin</h3>
          </div>
          <div className="p-6">
            {selectedBulletin ? (
              <div className="space-y-4">
                <div className="pb-4 border-b border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-1">{selectedPeriod}</h4>
                  <p className="text-xs text-gray-500">Bulletin de paie officiel</p>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Salaire Brut</span>
                    <span className="text-sm font-medium text-gray-900">MAD {payrollValue(selectedBulletin.grossSalary).toLocaleString('fr-FR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Salaire Net</span>
                    <span className="text-sm font-medium text-gray-900">MAD {payrollValue(selectedBulletin.netSalary).toLocaleString('fr-FR')}</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t-2 border-gray-300">
                    <span className="text-sm font-bold text-gray-900 uppercase">Net a Payer</span>
                    <span className="text-xl font-bold text-[#0A6ED1]">MAD {payrollValue(selectedBulletin.netSalary).toLocaleString('fr-FR')}</span>
                  </div>
                </div>
                <button onClick={() => handleDownload(selectedBulletin.id)} className="w-full px-4 py-3 bg-[#0A6ED1] text-white hover:bg-[#0959b0] flex items-center justify-center mt-6">
                  <Download className="w-4 h-4 mr-2" />Telecharger PDF
                </button>
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-sm text-gray-600">Selectionnez un bulletin pour voir les details</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center">
          <Calendar className="w-5 h-5 text-[#0A6ED1] mr-2" />
          <h3 className="text-base font-semibold text-gray-900">Recapitulatif</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gray-50 border border-gray-200 p-4">
              <p className="text-xs text-gray-500 uppercase font-medium mb-2">Total Brut</p>
              <p className="text-2xl font-semibold text-gray-900">MAD {totalGross.toLocaleString('fr-FR')}</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 p-4">
              <p className="text-xs text-gray-500 uppercase font-medium mb-2">Total Retenues</p>
              <p className="text-2xl font-semibold text-red-600">MAD {totalCharges.toLocaleString('fr-FR')}</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 p-4">
              <p className="text-xs text-gray-500 uppercase font-medium mb-2">Total Net</p>
              <p className="text-2xl font-semibold text-green-600">MAD {totalNet.toLocaleString('fr-FR')}</p>
            </div>
            <div className="bg-blue-50 border border-[#0A6ED1] p-4">
              <p className="text-xs text-gray-500 uppercase font-medium mb-2">Bulletins</p>
              <p className="text-2xl font-semibold text-[#0A6ED1]">{bulletins.length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
