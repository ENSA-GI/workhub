import { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Plus, Trash2, AlertCircle, CheckCircle, Loader2, ArrowLeft } from 'lucide-react';
import { usePayrollItems, usePayrolls, payrollValue, useAddPayrollAdjustment, useDeletePayrollAdjustment } from '@/lib/usePayroll';
import NotificationToast from '../../NotificationToast';
import { useOrganizationId } from '@/lib/useOrganizationId';
import { useEmployees, useUsers } from '@/lib/useEmployees';

interface PayrollAdjustment {
  id: string;
  payrollItemId: string;
  employeeId: string;
  type: 'OVERTIME' | 'BONUS' | 'DEDUCTION';
  amount: number;
  description?: string;
  createdAt: string;
}


export default function PayrollDetailAdjustments() {
  const [searchParams] = useSearchParams();
  const payrollId = searchParams.get('id');
  const navigate = useNavigate();

  const organizationId = useOrganizationId();

  const { data: payrolls = [] } = usePayrolls(organizationId);
  const activePayroll = payrolls.find((p) => p.id === payrollId) || payrolls[0];
  const { data: payrollItems = [] } = usePayrollItems(activePayroll?.id || '');

  const addAdjustmentMutation = useAddPayrollAdjustment();
  const deleteAdjustmentMutation = useDeletePayrollAdjustment();

  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [checkedItemIds, setCheckedItemIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

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

  // Form state
  const [formData, setFormData] = useState({
    type: 'OVERTIME' as 'OVERTIME' | 'BONUS' | 'DEDUCTION',
    amount: '',
    description: '',
    preset: 'OVERTIME'
  });

  const selectedItem = useMemo(() => payrollItems.find((item) => item.id === selectedItemId) || payrollItems[0], [payrollItems, selectedItemId]);

  const filteredItems = useMemo(() => {
    return payrollItems.filter((item) => {
      const fullName = getEmployeeFullName(item.employeeId);
      const target = `${fullName} ${item.employeeId}`.toLowerCase();
      return target.includes(searchTerm.toLowerCase());
    });
  }, [payrollItems, searchTerm, employeeUserMap, userNamesMap]);

  const selectedAdjustments = (selectedItem as any)?.adjustments || [];
  const overtimeTotal = selectedAdjustments
    .filter((adj: PayrollAdjustment) => adj.type === 'OVERTIME')
    .reduce((sum: number, adj: PayrollAdjustment) => sum + Number(adj.amount || 0), 0);
  const bonusTotal = selectedAdjustments
    .filter((adj: PayrollAdjustment) => adj.type === 'BONUS')
    .reduce((sum: number, adj: PayrollAdjustment) => sum + Number(adj.amount || 0), 0);
  const deductionTotal = selectedAdjustments
    .filter((adj: PayrollAdjustment) => adj.type === 'DEDUCTION')
    .reduce((sum: number, adj: PayrollAdjustment) => sum + Number(adj.amount || 0), 0);

  // Calculer les totaux depuis le backend, avec fallback si besoin
  const calculateTotals = (item: any) => {
    const base = payrollValue(item.baseSalary) || 0;
    const transport = payrollValue(item.transportBonus) || 0;
    const meal = payrollValue(item.mealBonus) || 0;
    const perf = payrollValue(item.performanceBonus) || 0;
    return {
      gross: payrollValue(item.grossSalary) || (base + transport + meal + perf),
      net: payrollValue(item.netSalary) || 0,
    };
  };

  const handleAddAdjustment = async () => {
    const targetItems = checkedItemIds.length > 0 ? checkedItemIds : (selectedItem ? [selectedItem.id] : []);

    if (targetItems.length === 0 || !formData.amount) {
      setNotification({ type: 'error', message: 'Veuillez sélectionner au moins un employé et remplir le montant' });
      return;
    }

    try {
      await Promise.all(targetItems.map(itemId =>
        addAdjustmentMutation.mutateAsync({
          payrollItemId: itemId,
          type: formData.type,
          amount: parseFloat(formData.amount),
          description: formData.description,
        })
      ));

      setNotification({
        type: 'success',
        message: `Ajustement ajouté avec succès`,
      });

      // Réinitialiser le formulaire
      setFormData({ type: 'OVERTIME', amount: '', description: '', preset: 'OVERTIME' });
      setCheckedItemIds([]);
      setShowAddForm(false);
    } catch (error: any) {
      setNotification({
        type: 'error',
        message: error.message || 'Erreur lors de l\'ajout de l\'ajustement',
      });
    }
  };

  const handleDeleteAdjustment = async (adjustmentId: string) => {
    if (!window.confirm('Supprimer cet ajustement ?')) return;

    try {
      await deleteAdjustmentMutation.mutateAsync(adjustmentId);

      setNotification({
        type: 'success',
        message: 'Ajustement supprimé avec succès',
      });
    } catch (error: any) {
      setNotification({
        type: 'error',
        message: error.message || 'Erreur lors de la suppression',
      });
    }
  };

  const handleCheckAll = () => {
    const filteredItemIds = filteredItems.map((item) => item.id);
    const areAllFilteredItemsChecked = filteredItemIds.every((id) => checkedItemIds.includes(id));

    if (areAllFilteredItemsChecked) {
      setCheckedItemIds((current) => current.filter((id) => !filteredItemIds.includes(id)));
    } else {
      setCheckedItemIds((current) => Array.from(new Set([...current, ...filteredItemIds])));
    }
  };

  const isReadOnly = activePayroll?.status !== 'DRAFT';

  if (!activePayroll) {
    return <div className="p-6 text-center text-red-600">ID d'organisation manquant</div>;
  }

  const totals = selectedItem ? calculateTotals(selectedItem) : { gross: 0, net: 0 };

  return (
    <div className="p-6 bg-[#F5F7FA]">
      {notification && (
        <NotificationToast
          message={notification.message}
          type={notification.type}
          isVisible={true}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Détails et Ajustements</h1>
          <p className="text-sm text-gray-600 mt-1">Période : {new Date(activePayroll.year, activePayroll.month - 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })} - Statut : <span className={`font-semibold ${isReadOnly ? 'text-green-600' : 'text-orange-600'}`}>{activePayroll.status}</span></p>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={() => navigate('/payroll')} className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center rounded">
            <ArrowLeft className="w-4 h-4 mr-2" /> Retour au tableau
          </button>
          {!isReadOnly && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2 bg-[#0A6ED1] text-white hover:bg-[#0959b0] flex items-center rounded"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter Ajustement
            </button>
          )}
        </div>
      </div>

      {showAddForm && !isReadOnly && (
        <div className="bg-white border border-gray-200 p-4 mb-6 rounded">
          <h3 className="font-semibold text-gray-900 mb-4">Ajouter un Ajustement {checkedItemIds.length > 0 ? `(${checkedItemIds.length} employés sélectionnés)` : ''}</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={formData.preset}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'OVERTIME') {
                    setFormData({ ...formData, preset: val, type: 'OVERTIME', description: '' });
                  } else if (val.startsWith('BONUS_')) {
                    setFormData({ ...formData, preset: val, type: 'BONUS', description: val.split('_')[1] });
                  } else if (val === 'BONUS') {
                    setFormData({ ...formData, preset: val, type: 'BONUS', description: '' });
                  } else if (val === 'DEDUCTION') {
                    setFormData({ ...formData, preset: val, type: 'DEDUCTION', description: '' });
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0A6ED1] rounded"
              >
                <option value="OVERTIME">Heures Supplémentaires</option>
                <option value="BONUS_Prime de rendement (Exceptionnelle)">Prime de rendement (Exceptionnelle)</option>
                <option value="BONUS_Prime de projet">Prime de projet</option>
                <option value="BONUS_Prime de déplacement">Prime de déplacement</option>
                <option value="BONUS">Autre prime spécifique...</option>
                <option value="DEDUCTION">Déduction (Retard, Absence...)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Montant (MAD)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0A6ED1] rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Raison</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Ex: Prime de rendement"
                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0A6ED1] rounded"
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={handleAddAdjustment}
                disabled={addAdjustmentMutation.isPending}
                className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded flex items-center disabled:opacity-50"
              >
                {addAdjustmentMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                Ajouter
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                disabled={addAdjustmentMutation.isPending}
                className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded disabled:opacity-50"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-1 bg-white border border-gray-200 rounded">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Employés ({filteredItems.length})</h3>
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full mt-3 px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0A6ED1] rounded text-sm"
            />
            {!isReadOnly && (
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500">Cochez pour appliquer en masse</span>
                <button
                  onClick={handleCheckAll}
                  className="text-xs text-[#0A6ED1] hover:underline"
                >
                  {checkedItemIds.length === filteredItems.length ? 'Désélectionner tout' : 'Sélectionner tout'}
                </button>
              </div>
            )}
          </div>
          <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className={`p-4 cursor-pointer transition-colors flex items-center ${
                  selectedItem?.id === item.id ? 'bg-blue-50 border-l-4 border-[#0A6ED1]' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3 w-full" onClick={() => setSelectedItemId(item.id)}>
                  {!isReadOnly && (
                    <input
                      type="checkbox"
                      checked={checkedItemIds.includes(item.id)}
                      onChange={(e) => {
                        if (e.target.checked) setCheckedItemIds([...checkedItemIds, item.id]);
                        else setCheckedItemIds(checkedItemIds.filter(id => id !== item.id));
                      }}
                      className="w-4 h-4 text-[#0A6ED1] border-gray-300 rounded focus:ring-[#0A6ED1]"
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{getEmployeeFullName(item.employeeId)}</p>
                    <p className="text-xs text-gray-600 mt-1">MAD {payrollValue(item.netSalary).toLocaleString('fr-FR')}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2">
          {selectedItem ? (
            <div className="bg-white border border-gray-200 rounded overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h3 className="font-semibold text-gray-900">Détail des Salaires - {getEmployeeFullName(selectedItem.employeeId)}</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Composante</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-700">Montant</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-2 text-gray-700">Salaire de base</td>
                      <td className="px-4 py-2 text-right text-gray-900">MAD {payrollValue(selectedItem.baseSalary).toLocaleString('fr-FR')}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-gray-700">Prime Transport</td>
                      <td className="px-4 py-2 text-right text-gray-900">MAD {payrollValue(selectedItem.transportBonus).toLocaleString('fr-FR')}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-gray-700">Prime Repas</td>
                      <td className="px-4 py-2 text-right text-gray-900">MAD {payrollValue(selectedItem.mealBonus).toLocaleString('fr-FR')}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-gray-700">Heures Supplémentaires</td>
                      <td className="px-4 py-2 text-right text-green-600">MAD {overtimeTotal.toLocaleString('fr-FR')}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-gray-700">Primes</td>
                      <td className="px-4 py-2 text-right text-green-600">MAD {bonusTotal.toLocaleString('fr-FR')}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-gray-700">Déductions</td>
                      <td className="px-4 py-2 text-right text-red-600">MAD {deductionTotal.toLocaleString('fr-FR')}</td>
                    </tr>
                    <tr className="bg-blue-50">
                      <td className="px-4 py-2 font-medium text-gray-900">Salaire Brut</td>
                      <td className="px-4 py-2 text-right font-semibold text-gray-900">MAD {totals.gross.toLocaleString('fr-FR')}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-gray-700">CNSS</td>
                      <td className="px-4 py-2 text-right text-gray-900">- MAD {payrollValue(selectedItem.cnssDeduction).toLocaleString('fr-FR')}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-gray-700">AMO</td>
                      <td className="px-4 py-2 text-right text-gray-900">- MAD {payrollValue(selectedItem.amoDeduction).toLocaleString('fr-FR')}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-gray-700">IR</td>
                      <td className="px-4 py-2 text-right text-gray-900">- MAD {payrollValue(selectedItem.irDeduction).toLocaleString('fr-FR')}</td>
                    </tr>
                    <tr className="bg-green-50 border-t-2 border-green-300">
                      <td className="px-4 py-3 font-bold text-gray-900">Net à Payer</td>
                      <td className="px-4 py-3 text-right font-bold text-green-600">MAD {totals.net.toLocaleString('fr-FR')}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {selectedAdjustments.length > 0 && (
                <div className="p-4 border-t border-gray-200 bg-blue-50">
                  <h4 className="font-medium text-gray-900 mb-3">Ajustements Appliqués</h4>
                  <div className="space-y-2">
                    {selectedAdjustments.map((adj: PayrollAdjustment) => (
                      <div key={adj.id} className="flex items-center justify-between bg-white p-3 rounded border border-gray-200">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{adj.type === 'OVERTIME' ? '⏱️ H. Supp.' : adj.type === 'BONUS' ? '⭐ Prime' : '📉 Déduction'}</p>
                          {adj.description && <p className="text-xs text-gray-600">{adj.description}</p>}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`font-medium ${adj.type === 'DEDUCTION' ? 'text-red-600' : 'text-green-600'}`}>
                            {adj.type === 'DEDUCTION' ? '-' : '+'} MAD {Math.abs(adj.amount).toLocaleString('fr-FR')}
                          </span>
                          {!isReadOnly && (
                            <button
                              onClick={() => handleDeleteAdjustment(adj.id)}
                              className="p-1 hover:bg-red-50 rounded text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded p-8 flex items-center justify-center h-96">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">Sélectionnez un employé pour voir les détails</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

