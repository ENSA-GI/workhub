import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Plus, Download, MoreVertical, ChevronRight } from 'lucide-react';
import NotificationToast from './NotificationToast';
import { saveToLocalStorage, loadFromLocalStorage, exportToCSV } from '../utils/dataManager';

interface Payroll {
  id: number;
  month: string;
  employees: number;
  grossAmount: number;
  deductions: number;
  netAmount: number;
  status: string;
  date: string;
}

const initialPayrolls: Payroll[] = [
  { id: 1, month: 'Juin 2026', employees: 1247, grossAmount: 1895320, deductions: 352820, netAmount: 1542500, status: 'Traité', date: '2026-06-01' },
  { id: 2, month: 'Mai 2026', employees: 1189, grossAmount: 1789650, deductions: 331150, netAmount: 1458500, status: 'Payé', date: '2026-05-01' },
  { id: 3, month: 'Avril 2026', employees: 1176, grossAmount: 1752480, deductions: 324480, netAmount: 1428000, status: 'Payé', date: '2026-04-01' },
  { id: 4, month: 'Mars 2026', employees: 1134, grossAmount: 1689540, deductions: 312540, netAmount: 1377000, status: 'Payé', date: '2026-03-01' },
];

const payrollDetails = [
  { category: 'Salaire de Base', amount: 1245000 },
  { category: 'Heures Supplémentaires', amount: 85320 },
  { category: 'Primes', amount: 235000 },
  { category: 'Indemnités', amount: 145000 },
  { category: 'Assurance Maladie', amount: -125000, isDeduction: true },
  { category: 'Impôts', amount: -187820, isDeduction: true },
  { category: 'Caisse de Retraite', amount: -40000, isDeduction: true },
];

export default function PayrollEnhanced() {
  const navigate = useNavigate();
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [selectedPayroll, setSelectedPayroll] = useState<number | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info'; visible: boolean }>({
    message: '',
    type: 'success',
    visible: false,
  });

  useEffect(() => {
    const saved = loadFromLocalStorage('workhub_payrolls', initialPayrolls);
    setPayrolls(saved);
  }, []);

  useEffect(() => {
    if (payrolls.length > 0) {
      saveToLocalStorage('workhub_payrolls', payrolls);
    }
  }, [payrolls]);

  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ message, type, visible: true });
  };

  const handleGeneratePayroll = () => {
    // Rediriger vers la page de génération de paie détaillée
    navigate('/payroll-generation');
  };

  const handleMarkAsPayé = (id: number) => {
    setPayrolls(prev => prev.map(p => p.id === id ? { ...p, status: 'Payé' } : p));
    showNotification('Paie marquée comme payée', 'success');
  };

  const handleExport = () => {
    exportToCSV(payrolls, 'payroll_history');
    showNotification('Payroll history exported', 'success');
  };

  const handleDownloadReport = (payroll: Payroll) => {
    const reportData = [{
      Mois: payroll.month,
      Employés: payroll.employees,
      'Montant Brut': payroll.grossAmount,
      Retenues: payroll.deductions,
      'Montant Net': payroll.netAmount,
      Statut: payroll.status,
      Date: payroll.date,
    }];
    exportToCSV(reportData, `payroll_MAD{payroll.month.replace(' ', '_')}`);
    showNotification('Rapport de paie téléchargé', 'success');
  };

  const selectedPayrollData = payrolls.find(p => p.id === selectedPayroll);

  return (
    <div className="p-6">
      <NotificationToast
        message={notification.message}
        type={notification.type}
        isVisible={notification.visible}
        onClose={() => setNotification({ ...notification, visible: false })}
      />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Gestion de la Paie</h1>
          <p className="text-sm text-gray-600 mt-1">Traiter et gérer la paie des employés</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleExport}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Tout Exporter
          </button>
          <button
            onClick={handleGeneratePayroll}
            className="px-4 py-2 bg-[#0A6ED1] text-white rounded hover:bg-[#0959b0] flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Générer la Paie
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-base font-semibold text-gray-900">Historique Mensuel de la Paie</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Période</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employés</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant Brut</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant Net</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {payrolls.map((payroll) => (
                    <tr
                      key={payroll.id}
                      className={`hover:bg-gray-50 cursor-pointer MAD{selectedPayroll === payroll.id ? 'bg-blue-50' : ''}`}
                      onClick={() => setSelectedPayroll(payroll.id)}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{payroll.month}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{payroll.employees.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">MAD{payroll.grossAmount.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">MAD{payroll.netAmount.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs rounded MAD{
                          payroll.status === 'Payé'
                            ? 'bg-green-100 text-green-800'
                            : payroll.status === 'Brouillon'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {payroll.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadReport(payroll);
                            }}
                            className="p-1 hover:bg-gray-100 rounded"
                            title="Télécharger Rapport"
                          >
                            <Download className="w-4 h-4 text-gray-600" />
                          </button>
                          {payroll.status === 'Brouillon' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate('/payroll-generation');
                              }}
                              className="px-2 py-1 text-xs bg-orange-600 text-white rounded hover:bg-orange-700"
                            >
                              Modifier
                            </button>
                          )}
                          {payroll.status === 'Traité' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsPayé(payroll.id);
                              }}
                              className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                            >
                              Marquer comme Payé
                            </button>
                          )}
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
          {selectedPayrollData ? (
            <div className="bg-white rounded border border-gray-200 p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Détail de la Paie</h3>

              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-1">Période</p>
                <p className="text-lg font-semibold text-gray-900">{selectedPayrollData.month}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded p-3">
                  <p className="text-xs text-gray-600 mb-1">Employés</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedPayrollData.employees.toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 rounded p-3">
                  <p className="text-xs text-gray-600 mb-1">Statut</p>
                  <p className="text-sm">
                    <span className={`inline-flex px-2 py-1 text-xs rounded MAD{
                      selectedPayrollData.status === 'Payé' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {selectedPayrollData.status}
                    </span>
                  </p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <h4 className="text-sm font-medium text-gray-900">Composants</h4>
                {payrollDetails.map((detail, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <span className="text-sm text-gray-600">{detail.category}</span>
                    <span className={`text-sm font-medium MAD{detail.isDeduction ? 'text-red-600' : 'text-gray-900'}`}>
                      MAD{Math.abs(detail.amount).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-gray-200 space-y-2 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Montant Brut</span>
                  <span className="text-sm font-medium text-gray-900">MAD{selectedPayrollData.grossAmount.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Retenues</span>
                  <span className="text-sm font-medium text-red-600">-MAD{selectedPayrollData.deductions.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                  <span className="text-base font-semibold text-gray-900">Montant Net</span>
                  <span className="text-base font-semibold text-[#0A6ED1]">MAD{selectedPayrollData.netAmount.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={() => handleDownloadReport(selectedPayrollData)}
                className="w-full px-4 py-2 bg-[#0A6ED1] text-white rounded hover:bg-[#0959b0] flex items-center justify-center mb-2"
              >
                <Download className="w-4 h-4 mr-2" />
                Télécharger Rapport
              </button>
              {selectedPayrollData.status === 'Traité' && (
                <button
                  onClick={() => handleMarkAsPayé(selectedPayrollData.id)}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 mb-2"
                >
                  Marquer comme Payé
                </button>
              )}
              <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 flex items-center justify-center">
                Voir Détails
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          ) : (
            <div className="bg-white rounded border border-gray-200 p-6 flex items-center justify-center h-64">
              <p className="text-sm text-gray-500">Sélectionnez une paie pour voir le détail</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
