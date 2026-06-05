import { useMemo, useState } from 'react';
import { FileText, Download, Eye, CheckCircle, Clock, Calendar, Search, Filter, Loader2 } from 'lucide-react';
import { useMarkPayslipAsRead, usePayrollItems, usePayrolls, payrollValue } from '@/lib/usePayroll';
import { useOrganizationId } from '@/lib/useOrganizationId';
import { useEmployees, useUsers } from '@/lib/useEmployees';

export default function PayslipsManagement() {
  const organizationId = useOrganizationId();
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Tous');
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7));

  const { data: payrolls = [] } = usePayrolls(organizationId);
  const activePayroll = useMemo(() => payrolls[0], [payrolls]);
  const { data: items = [], isLoading } = usePayrollItems(activePayroll?.id || '');
  const markAsRead = useMarkPayslipAsRead();

  const { data: employeesData } = useEmployees(organizationId, 0, 100);
  const { data: usersData = [] } = useUsers(organizationId);

  const employeeUserMap = useMemo(() => {
    const map = new Map<string, { userId: string; email: string }>();
    if (employeesData?.content) {
      employeesData.content.forEach((emp) => {
        map.set(emp.id, { userId: emp.userId, email: emp.personalEmail });
      });
    }
    return map;
  }, [employeesData]);

  const userNamesMap = useMemo(() => {
    const map = new Map<string, string>();
    if (Array.isArray(usersData)) {
      usersData.forEach((user) => {
        const name = [user.firstName, user.lastName].filter(Boolean).join(' ');
        map.set(user.id, name);
      });
    }
    return map;
  }, [usersData]);

  const getEmployeeFullName = (employeeId: string) => {
    const empInfo = employeeUserMap.get(employeeId);
    if (!empInfo) return employeeId;
    const name = userNamesMap.get(empInfo.userId);
    return name || empInfo.email || employeeId;
  };

  const payslips = items.map((item) => ({
    id: item.id,
    employeId: item.employeeId,
    nom: getEmployeeFullName(item.employeeId),
    departement: '—',
    poste: '—',
    mois: activePayroll ? `${String(activePayroll.year)}-${String(activePayroll.month).padStart(2, '0')}` : filterMonth,
    salaireBrut: payrollValue(item.grossSalary),
    salaireNet: payrollValue(item.netSalary),
    statut: item.isRead ? 'Consulté' : 'Généré',
    dateEnvoi: item.readAt || null,
    lu: !!item.isRead,
    bulletinPdfUrl: item.bulletinPdfUrl,
  }));

  const filteredPayslips = payslips.filter((p) => {
    const matchSearch = `${p.nom} ${p.employeId}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'Tous' || p.statut === filterStatus;
    return matchSearch && matchStatus;
  });

  const selectedPayslipDetail = payslips.find((p) => p.id === selectedItemId) || payslips[0];
  const statsRead = payslips.filter((p) => p.lu).length;
  const totalNet = payslips.reduce((sum, p) => sum + p.salaireNet, 0);

  if (!organizationId) {
    return <div className="p-6 text-center text-red-600">ID d'organisation manquant dans la session.</div>;
  }

  const handleDownload = (itemId: string) => {
    window.location.href = `/payroll/payrolls/items/${itemId}/download`;
  };

  const handleOpenPayslip = async (itemId: string) => {
    setSelectedItemId(itemId);
    await markAsRead.mutateAsync({ itemId });
  };

  return (
    <div className="p-6 bg-[#F5F7FA]">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Gestion des Bulletins de Paie</h1>
          <p className="text-sm text-gray-600 mt-1">Bulletins centralisés</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Télécharger Tout (ZIP)
          </button>
          <button className="px-4 py-2 bg-[#0A6ED1] text-white hover:bg-[#0959b0] flex items-center" disabled>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Envoyer par email
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 p-6"><h3 className="text-xs font-medium text-gray-500 uppercase mb-2">Bulletins Générés</h3><p className="text-3xl font-semibold text-gray-900">{payslips.length}</p></div>
        <div className="bg-white border border-gray-200 p-6"><h3 className="text-xs font-medium text-gray-500 uppercase mb-2">Consultés</h3><p className="text-3xl font-semibold text-blue-600">{statsRead}</p></div>
        <div className="bg-white border border-gray-200 p-6"><h3 className="text-xs font-medium text-gray-500 uppercase mb-2">Net Total</h3><p className="text-3xl font-semibold text-purple-600">MAD {totalNet.toLocaleString('fr-FR')}</p></div>
        <div className="bg-white border border-gray-200 p-6"><h3 className="text-xs font-medium text-gray-500 uppercase mb-2">Paie liée</h3><p className="text-3xl font-semibold text-gray-900">{activePayroll ? `${activePayroll.month}/${activePayroll.year}` : '—'}</p></div>
      </div>

      <div className="bg-white border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Rechercher par ID employé..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]" />
          </div>
          <div className="flex items-center space-x-2"><Calendar className="w-5 h-5 text-gray-500" /><input type="month" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]" /></div>
          <div className="flex items-center space-x-2"><Filter className="w-5 h-5 text-gray-500" /><select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]"><option>Tous</option><option>Généré</option><option>Consulté</option></select></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white border border-gray-200">
          <div className="p-4 border-b border-gray-200"><h3 className="text-base font-semibold text-gray-900">Liste des Bulletins ({filteredPayslips.length})</h3></div>
          <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
            {filteredPayslips.map((payslip) => (
              <div key={payslip.id} className={`p-4 transition-all ${selectedPayslipDetail?.id === payslip.id ? 'bg-blue-50 border-l-4 border-[#0A6ED1]' : 'hover:bg-gray-50'}`}>
                <div className="flex items-start mb-2">
                  <div className="mr-3 mt-1 p-1"><FileText className="w-5 h-5 text-[#0A6ED1]" /></div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2 cursor-pointer" onClick={() => handleOpenPayslip(payslip.id)}>
                      <div className="flex-1"><p className="text-sm font-semibold text-gray-900">{payslip.nom}</p><p className="text-xs text-gray-600 mt-1">{payslip.employeId}</p></div>
                      {payslip.lu ? <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" /> : <Clock className="w-5 h-5 text-orange-600 flex-shrink-0" />}
                    </div>
                    <div className="flex items-center justify-between mt-3 cursor-pointer" onClick={() => handleOpenPayslip(payslip.id)}>
                      <span className="text-xs font-medium text-gray-900">MAD {payslip.salaireNet.toLocaleString('fr-FR')}</span>
                      <span className={`inline-flex px-2 py-1 text-xs ${payslip.lu ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>{payslip.statut}</span>
                    </div>
                    {payslip.lu && <div className="mt-2 pt-2 border-t border-gray-200"><p className="text-xs text-blue-600 flex items-center"><Eye className="w-3 h-3 mr-1" />Consulté</p></div>}
                  </div>
                </div>
              </div>
            ))}
            {!isLoading && filteredPayslips.length === 0 && <div className="p-6 text-center text-sm text-gray-500">Aucun bulletin trouvé pour cette paie.</div>}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white border border-gray-200">
          {selectedPayslipDetail ? (
            <div>
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Bulletin de Paie</h3>
                  <p className="text-sm text-gray-600 mt-1">{selectedPayslipDetail.nom}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button onClick={() => handleDownload(selectedPayslipDetail.id)} className="px-3 py-1 border border-gray-300 text-gray-700 text-sm hover:bg-gray-50 flex items-center"><Download className="w-4 h-4 mr-1" />Télécharger</button>
                  <button className="px-3 py-1 bg-[#0A6ED1] text-white text-sm hover:bg-[#0959b0] flex items-center" disabled><Loader2 className="w-4 h-4 mr-1 animate-spin" />Envoyer</button>
                </div>
              </div>

              <div className="p-6 bg-gray-50">
                <div className="bg-white border-2 border-gray-300 p-8 shadow-lg max-w-2xl mx-auto">
                  <div className="flex items-start justify-between mb-8 pb-6 border-b-2 border-gray-300">
                    <div><h2 className="text-2xl font-bold text-gray-900 mb-2">WorkHub</h2><p className="text-sm text-gray-600">Bulletin généré par le système</p></div>
                    <div className="text-right"><h3 className="text-lg font-semibold text-gray-900 mb-2">BULLETIN DE PAIE</h3><p className="text-sm text-gray-600">Période: {filterMonth}</p></div>
                  </div>

                  <div className="mb-6"><h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">Informations Employé</h4><div className="grid grid-cols-2 gap-4"><div><p className="text-xs text-gray-500">Identifiant</p><p className="text-sm font-medium text-gray-900">{selectedPayslipDetail.employeId}</p></div><div><p className="text-xs text-gray-500">Statut</p><p className="text-sm font-medium text-gray-900">{selectedPayslipDetail.statut}</p></div></div></div>

                  <div className="mb-6"><h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">Montants</h4><table className="w-full text-sm"><tbody className="divide-y divide-gray-200"><tr><td className="py-2 text-gray-700">Salaire Brut</td><td className="py-2 text-right font-medium text-gray-900">MAD {selectedPayslipDetail.salaireBrut.toLocaleString('fr-FR')}</td></tr><tr><td className="py-2 text-gray-700">Salaire Net</td><td className="py-2 text-right font-medium text-gray-900">MAD {selectedPayslipDetail.salaireNet.toLocaleString('fr-FR')}</td></tr></tbody></table></div>

                  <div className="bg-[#0A6ED1] text-white p-4 mt-6"><div className="flex items-center justify-between"><span className="text-sm font-medium uppercase">Net à Payer</span><span className="text-2xl font-bold">MAD {selectedPayslipDetail.salaireNet.toLocaleString('fr-FR')}</span></div></div>
                </div>
              </div>

              {selectedPayslipDetail.dateEnvoi && <div className="p-4 bg-green-50 border-t border-green-200"><div className="flex items-center"><CheckCircle className="w-5 h-5 text-green-600 mr-2" /><div><p className="text-sm font-medium text-green-900">Bulletin consulté</p><p className="text-xs text-green-700 mt-1">{selectedPayslipDetail.dateEnvoi}</p></div></div></div>}
            </div>
          ) : (
            <div className="p-12 text-center"><FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" /><p className="text-sm text-gray-600">Sélectionnez un bulletin pour voir les détails</p></div>
          )}
        </div>
      </div>
    </div>
  );
}
