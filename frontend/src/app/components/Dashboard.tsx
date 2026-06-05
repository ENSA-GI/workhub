import { Users, UserCheck, FileText, DollarSign, TrendingUp } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useEmployees } from '@/lib/useEmployees';
import { usePayrollAnalyticsYtd, usePayrollTrend, payrollValue } from '@/lib/usePayroll';
import { useOrganizationId } from '@/lib/useOrganizationId';

export default function Dashboard() {
  const organizationId = useOrganizationId();
  const currentYear = new Date().getFullYear();

  const { data: employeesData } = useEmployees(organizationId, 0, 200, 'ACTIVE');
  const { data: ytd } = usePayrollAnalyticsYtd(organizationId, currentYear);
  const { data: trend = [] } = usePayrollTrend(organizationId, currentYear);

  const kpiData = [
    { title: 'Employees actifs', value: `${employeesData?.content.length || 0}`, trend: 'up', icon: Users, color: 'bg-blue-50 text-[#0A6ED1]' },
    { title: 'Paie brute YTD', value: `MAD ${payrollValue(ytd?.totalGrossYtd).toLocaleString('fr-FR')}`, trend: 'up', icon: DollarSign, color: 'bg-green-50 text-green-600' },
    { title: 'Net YTD', value: `MAD ${payrollValue(ytd?.totalNetYtd).toLocaleString('fr-FR')}`, trend: 'up', icon: FileText, color: 'bg-orange-50 text-orange-600' },
    { title: 'Coût moyen', value: `MAD ${payrollValue(ytd?.averageCostPerEmployee).toLocaleString('fr-FR')}`, trend: 'up', icon: UserCheck, color: 'bg-purple-50 text-purple-600' },
  ];

  const employeeGrowthData = trend.map((point) => ({ month: point.month, employees: Math.max(0, Math.round(point.gross / Math.max(1, payrollValue(ytd?.averageCostPerEmployee)))) }));
  const payrollData = trend.map((point) => ({ month: point.month, amount: point.gross }));

  if (!organizationId) {
    return <div className="p-6 text-center text-red-600">ID d'organisation manquant dans la session.</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6"><h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1><p className="text-sm text-gray-600 mt-1">Vue de synthèse des données</p></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">{kpiData.map((kpi) => { const Icon = kpi.icon; return (<div key={kpi.title} className="bg-white rounded border border-gray-200 p-6"><div className="flex items-center justify-between mb-4"><div className={`w-12 h-12 rounded flex items-center justify-center ${kpi.color}`}><Icon className="w-6 h-6" /></div><div className="flex items-center text-sm text-green-600"><TrendingUp className="w-4 h-4 mr-1" />système central</div></div><h3 className="text-sm text-gray-600 mb-1">{kpi.title}</h3><p className="text-2xl font-semibold text-gray-900">{kpi.value}</p></div>); })}</div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded border border-gray-200 p-6"><h3 className="text-base font-semibold text-gray-900 mb-4">Employee Growth</h3><ResponsiveContainer width="100%" height={300}><LineChart data={employeeGrowthData}><CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" /><XAxis dataKey="month" stroke="#6B7280" /><YAxis stroke="#6B7280" /><Tooltip /><Line type="monotone" dataKey="employees" stroke="#0A6ED1" strokeWidth={2} dot={{ fill: '#0A6ED1', r: 4 }} /></LineChart></ResponsiveContainer></div>
        <div className="bg-white rounded border border-gray-200 p-6"><h3 className="text-base font-semibold text-gray-900 mb-4">Payroll Evolution</h3><ResponsiveContainer width="100%" height={300}><BarChart data={payrollData}><CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" /><XAxis dataKey="month" stroke="#6B7280" /><YAxis stroke="#6B7280" /><Tooltip /><Bar dataKey="amount" fill="#0A6ED1" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>
      </div>
      <div className="bg-white rounded border border-gray-200 p-6"><h3 className="text-base font-semibold text-gray-900 mb-4">Activités réelles</h3><p className="text-sm text-gray-500">Les activités métier devront être récupérées d'un endpoint d'audit ou de notifications. Aucune donnée fictive n'est affichée ici.</p></div>
    </div>
  );
}
