import { Users, DollarSign, Calendar, Loader2 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useEmployees } from '@/lib/useEmployees';
import { payrollValue, usePayrollAnalyticsYtd, usePayrollCharges, usePayrollDepartments, usePayrollTrend, usePayrollBudgetUtilization } from '@/lib/usePayroll';
import { useOrganizationId } from '@/lib/useOrganizationId';

export default function DashboardRHManager() {
  const organizationId = useOrganizationId();
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const { data: employeesData } = useEmployees(organizationId, 0, 200, 'ACTIVE');
  const { data: ytd } = usePayrollAnalyticsYtd(organizationId, currentYear);
  const { data: trend = [], isLoading: trendLoading } = usePayrollTrend(organizationId, currentYear);
  const { data: charges } = usePayrollCharges(organizationId, currentYear);
  const { data: budget } = usePayrollBudgetUtilization(organizationId, currentYear);
  const { data: departments = [] } = usePayrollDepartments(organizationId, currentMonth, currentYear);

  const chargesData = [
    { name: 'CNSS', value: payrollValue(charges?.totalCnss), color: '#0A6ED1' },
    { name: 'AMO', value: payrollValue(charges?.totalAmo), color: '#10B981' },
    { name: 'IR', value: payrollValue(charges?.totalIr), color: '#F59E0B' },
  ].filter((item) => item.value > 0);

  if (!organizationId) {
    return <div className="p-6 text-center text-red-600">ID d'organisation manquant dans Clerk.</div>;
  }

  return (
    <div className="p-6 bg-[#F5F7FA]">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard RH</h1>
        <p className="text-sm text-gray-600 mt-1">Vue d'ensemble branchée sur les APIs de paie et d'effectifs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 p-6"><div className="flex items-center justify-between mb-4"><h3 className="text-xs font-medium text-gray-500 uppercase">Effectif Actuel</h3><Users className="w-5 h-5 text-[#0A6ED1]" /></div><p className="text-3xl font-semibold text-gray-900 mb-1">{employeesData?.content.length || 0}</p></div>
        <div className="bg-white border border-gray-200 p-6"><div className="flex items-center justify-between mb-4"><h3 className="text-xs font-medium text-gray-500 uppercase">Masse Salariale</h3><DollarSign className="w-5 h-5 text-green-600" /></div><p className="text-3xl font-semibold text-gray-900 mb-1">MAD {payrollValue(ytd?.totalGrossYtd).toLocaleString('fr-FR')}</p></div>
        <div className="bg-white border border-gray-200 p-6"><div className="flex items-center justify-between mb-4"><h3 className="text-xs font-medium text-gray-500 uppercase">Coût Moyen/Employé</h3><DollarSign className="w-5 h-5 text-purple-600" /></div><p className="text-3xl font-semibold text-gray-900 mb-1">MAD {payrollValue(ytd?.averageCostPerEmployee).toLocaleString('fr-FR')}</p></div>
        <div className="bg-white border border-gray-200 p-6"><div className="flex items-center justify-between mb-4"><h3 className="text-xs font-medium text-gray-500 uppercase">Budget Utilisé</h3><Calendar className="w-5 h-5 text-orange-600" /></div><p className="text-3xl font-semibold text-gray-900 mb-1">{(budget?.utilizationPercentage ?? 0).toFixed(0)}%</p></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between"><h3 className="text-base font-semibold text-gray-900">Évolution de la Paie</h3>{trendLoading && <Loader2 className="h-4 w-4 animate-spin text-gray-500" />}</div>
          <div className="p-6"><ResponsiveContainer width="100%" height={250}><LineChart data={trend}><CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" /><XAxis dataKey="month" stroke="#6B7280" /><YAxis stroke="#6B7280" /><Tooltip /><Legend /><Line type="monotone" dataKey="gross" stroke="#0A6ED1" strokeWidth={2} name="Brut" /></LineChart></ResponsiveContainer></div>
        </div>

        <div className="bg-white border border-gray-200">
          <div className="p-4 border-b border-gray-200"><h3 className="text-base font-semibold text-gray-900">Répartition par Département</h3></div>
          <div className="p-6"><ResponsiveContainer width="100%" height={250}><BarChart data={departments}><CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" /><XAxis dataKey="departmentName" stroke="#6B7280" /><YAxis stroke="#6B7280" /><Tooltip /><Legend /><Bar dataKey="employeeCount" fill="#0A6ED1" name="Employés" /></BarChart></ResponsiveContainer></div>
        </div>

        <div className="bg-white border border-gray-200">
          <div className="p-4 border-b border-gray-200"><h3 className="text-base font-semibold text-gray-900">Charges Sociales</h3></div>
          <div className="p-6"><ResponsiveContainer width="100%" height={250}><PieChart><Pie data={chargesData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>{chargesData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div>
        </div>

        <div className="bg-white border border-gray-200">
          <div className="p-4 border-b border-gray-200"><h3 className="text-base font-semibold text-gray-900">Budget</h3></div>
          <div className="p-6 space-y-4">
            <div className="flex justify-between"><span className="text-sm text-gray-600">Budget annuel</span><span className="text-sm font-medium text-gray-900">MAD {payrollValue(budget?.annualBudget).toLocaleString('fr-FR')}</span></div>
            <div className="flex justify-between"><span className="text-sm text-gray-600">Dépensé</span><span className="text-sm font-medium text-gray-900">MAD {payrollValue(budget?.spentAmount).toLocaleString('fr-FR')}</span></div>
            <div className="flex justify-between"><span className="text-sm text-gray-600">Restant</span><span className="text-sm font-medium text-green-600">MAD {payrollValue(budget?.remainingAmount).toLocaleString('fr-FR')}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
