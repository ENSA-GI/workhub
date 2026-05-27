import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { Calendar, Download, CheckCircle, Search, Filter, Loader2 } from 'lucide-react';
import { useDepartments } from '@/lib/useOrg';
import { useEmployees } from '@/lib/useEmployees';
import { useGeneratePayroll, usePayrollConfig, usePayrollItems, usePayrolls, payrollValue } from '@/lib/usePayroll';

function parseRate(value: number | string | null | undefined, fallback: number) {
  if (value === null || value === undefined || value === '') return fallback;
  const numeric = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(numeric) ? numeric / 100 : fallback;
}

function monthLabel(selectedMonth: string) {
  return new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(new Date(`${selectedMonth}-01`));
}

export default function PayrollGeneration() {
  const navigate = useNavigate();
  const { user } = useUser();
  const organizationId = (user?.publicMetadata?.organizationId as string) || '';
  const generatedBy = (user?.publicMetadata?.employeeId as string) || '';
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('Tous');

  const { data: employeesData, isLoading: employeesLoading } = useEmployees(organizationId, 0, 200, 'ACTIVE');
  const { data: departmentsData } = useDepartments(organizationId, 0, 200);
  const { data: payrollConfig } = usePayrollConfig(organizationId);
  const { data: payrolls = [] } = usePayrolls(organizationId);
  const generatePayroll = useGeneratePayroll();

  const employees = employeesData?.content || [];
  const departments = departmentsData?.content || [];
  const departmentsOptions = ['Tous', ...departments.map((dept) => dept.name)];

  const rateCnss = parseRate(payrollConfig?.cnssEmployeeRate, 0.0448);
  const rateAmo = parseRate(payrollConfig?.amoEmployeeRate, 0.0226);
  const rateIr = 0.10;

  const selectedYear = Number(selectedMonth.split('-')[0]);
  const selectedMonthNumber = Number(selectedMonth.split('-')[1]);
  const selectedPayroll = useMemo(() => payrolls.find((payroll) => payroll.year === selectedYear && payroll.month === selectedMonthNumber) || null, [payrolls, selectedYear, selectedMonthNumber]);
  const { data: selectedPayrollItems = [] } = usePayrollItems(selectedPayroll?.id || '');

  const enrichedEmployees = useMemo(() => employees.map((emp) => {
    const department = departments.find((d) => d.id === emp.departmentId)?.name || emp.departmentId || 'Non spécifié';
    const base = (emp.baseSalary || 0) + (emp.transportBonus || 0) + (emp.mealBonus || 0);
    return {
      ...emp,
      department,
      estimatedGross: base,
      estimatedNet: base - (base * rateCnss) - (base * rateAmo) - (base * rateIr),
    };
  }), [employees, departments, rateAmo, rateCnss, rateIr]);

  const payrollRows = useMemo(() => selectedPayrollItems.map((item) => {
    const employee = employees.find((emp) => emp.id === item.employeeId);
    const department = departments.find((d) => d.id === employee?.departmentId)?.name || employee?.departmentId || 'Non spécifié';
    const adjustments = Array.isArray(item.adjustments) ? item.adjustments : [];
    const adjustmentTotal = adjustments.reduce((sum, adj) => {
      const amount = payrollValue(adj.amount);
      return sum + (adj.type === 'DEDUCTION' ? -amount : amount);
    }, 0);

    return {
      id: item.id,
      employeeId: item.employeeId,
      department,
      positionId: employee?.positionId || '—',
      label: employee?.cin || employee?.userId || item.employeeId,
      estimatedGross: payrollValue(item.grossSalary),
      estimatedNet: payrollValue(item.netSalary),
      adjustmentTotal,
    };
  }), [departments, employees, selectedPayrollItems]);

  const displayRows = selectedPayroll ? payrollRows : enrichedEmployees.map((emp) => ({
    id: emp.id,
    employeeId: emp.id,
    department: emp.department,
    positionId: emp.positionId,
    label: emp.cin || emp.userId || emp.id,
    estimatedGross: emp.estimatedGross,
    estimatedNet: emp.estimatedNet,
    adjustmentTotal: 0,
  }));

  const filteredEmployees = displayRows.filter((emp) => {
    const searchTarget = `${emp.id} ${emp.userId} ${emp.cin}`.toLowerCase();
    const matchSearch = searchTarget.includes(searchTerm.toLowerCase());
    const matchDept = filterDept === 'Tous' || emp.department === filterDept;
    return matchSearch && matchDept;
  });

  const totalGross = filteredEmployees.reduce((sum, emp) => sum + emp.estimatedGross, 0);
  const totalNet = filteredEmployees.reduce((sum, emp) => sum + emp.estimatedNet, 0);
  const totalCharges = totalGross - totalNet;
  const hasGeneratedPayroll = !!selectedPayroll;

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
    return <div className="p-6 text-center text-red-600">ID d'organisation manquant dans Clerk. Les données doivent venir du backend.</div>;
  }

  return (
    <div className="p-6 bg-[#F5F7FA]">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Génération de la Paie</h1>
          <p className="text-sm text-gray-600 mt-1">
            {hasGeneratedPayroll
              ? 'Paie générée pour cette période chargée depuis le backend'
              : 'Aperçu des employés avant génération, chargé depuis le backend'}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button disabled className="px-4 py-2 border border-gray-300 text-gray-500 bg-white flex items-center cursor-not-allowed">
            <Download className="w-4 h-4 mr-2" />
            Exporter via backend
          </button>
          <button onClick={handleGeneratePayroll} disabled={generatePayroll.isPending || employeesLoading} className="px-6 py-2 bg-[#0A6ED1] text-white hover:bg-[#0959b0] flex items-center disabled:opacity-60">
            {generatePayroll.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
            Générer la Paie
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center space-x-4">
            <Calendar className="w-5 h-5 text-[#0A6ED1]" />
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Période de Paie</label>
              <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="px-4 py-2 border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]" />
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-center"><p className="text-xs text-gray-500 uppercase mb-1">Période</p><p className="text-sm font-medium text-gray-900">{monthLabel(selectedMonth)}</p></div>
            <div className="text-center"><p className="text-xs text-gray-500 uppercase mb-1">Employés actifs</p><p className="text-lg font-semibold text-gray-900">{employees.length}</p></div>
            <div className="text-center"><p className="text-xs text-gray-500 uppercase mb-1">Source</p><p className="text-sm font-medium text-gray-900">{hasGeneratedPayroll ? 'Backend paie' : 'Aperçu RH'}</p></div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Rechercher par nom ou matricule..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]" />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]">
              {departmentsOptions.map((dept) => <option key={dept} value={dept}>{dept === 'Tous' ? 'Tous les départements' : dept}</option>)}
            </select>
          </div>
          <div className="flex items-center justify-end text-sm text-gray-600">{filteredEmployees.length} employé{filteredEmployees.length > 1 ? 's' : ''} trouvé{filteredEmployees.length > 1 ? 's' : ''}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 p-6"><h3 className="text-xs font-medium text-gray-500 uppercase mb-2">Salaire Brut Total</h3><p className="text-3xl font-semibold text-gray-900">MAD {totalGross.toLocaleString('fr-FR')}</p></div>
        <div className="bg-white border border-gray-200 p-6"><h3 className="text-xs font-medium text-gray-500 uppercase mb-2">Salaire Net Total</h3><p className="text-3xl font-semibold text-green-600">MAD {totalNet.toLocaleString('fr-FR')}</p></div>
        <div className="bg-white border border-gray-200 p-6"><h3 className="text-xs font-medium text-gray-500 uppercase mb-2">Charges Sociales</h3><p className="text-3xl font-semibold text-orange-600">MAD {totalCharges.toLocaleString('fr-FR')}</p></div>
        <div className="bg-white border border-gray-200 p-6"><h3 className="text-xs font-medium text-gray-500 uppercase mb-2">Coût Total Employeur</h3><p className="text-3xl font-semibold text-purple-600">MAD {(totalGross + totalCharges).toLocaleString('fr-FR')}</p></div>
      </div>

      <div className="bg-white border border-gray-200 mb-6">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">Détail des Salaires - {monthLabel(selectedMonth)}</h3>
          <span className="text-sm text-gray-500">
            {hasGeneratedPayroll
              ? 'Données réelles de la paie générée avec ajustements backend'
              : `Taux backend: CNSS ${((rateCnss * 100).toFixed(2))}% | AMO ${((rateAmo * 100).toFixed(2))}% | IR ${((rateIr * 100).toFixed(0))}%`}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Matricule</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employé</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Département</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Poste</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ajustements</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Salaire Brut</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Salaire Net</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 text-sm font-medium text-gray-900">{emp.id.slice(0, 8)}</td>
                  <td className="px-4 py-4 text-sm text-gray-900">{emp.label}</td>
                  <td className="px-4 py-4 text-sm text-gray-600">{emp.department}</td>
                  <td className="px-4 py-4 text-sm text-gray-600">{emp.positionId}</td>
                  <td className="px-4 py-4 text-sm text-right text-gray-600">MAD {emp.adjustmentTotal.toLocaleString('fr-FR')}</td>
                  <td className="px-4 py-4 text-sm text-right text-gray-900">MAD {emp.estimatedGross.toLocaleString('fr-FR')}</td>
                  <td className="px-4 py-4 text-sm text-right font-semibold text-gray-900">MAD {emp.estimatedNet.toLocaleString('fr-FR')}</td>
                </tr>
              ))}
              {!employeesLoading && filteredEmployees.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">Aucune donnée disponible pour cette période.</td></tr>
              )}
            </tbody>
            <tfoot className="bg-gray-50 border-t-2 border-gray-300">
              <tr>
                <td colSpan={4} className="px-4 py-4 text-sm font-semibold text-gray-900 uppercase">Total Général ({filteredEmployees.length} employés)</td>
                <td className="px-4 py-4 text-sm text-right font-semibold text-gray-900">MAD {filteredEmployees.reduce((sum, emp) => sum + (emp.adjustmentTotal || 0), 0).toLocaleString('fr-FR')}</td>
                <td className="px-4 py-4 text-sm text-right font-semibold text-gray-900">MAD {totalGross.toLocaleString('fr-FR')}</td>
                <td className="px-4 py-4 text-sm text-right font-semibold text-gray-900">MAD {totalNet.toLocaleString('fr-FR')}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 p-4">
        <div className="flex items-start">
          <CheckCircle className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-blue-900 mb-2">Données backend uniquement</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Les employés viennent du service employee</li>
              <li>• Les départements viennent du service org</li>
              <li>• Les taux viennent de la configuration de paie en base</li>
              <li>• La génération lance la création réelle de la paie côté backend</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
