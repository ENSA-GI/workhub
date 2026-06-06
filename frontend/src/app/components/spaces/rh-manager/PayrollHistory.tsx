import { useState } from 'react';
import { Download, Calendar, Users, BarChart3, PieChart as PieChartIcon, TrendingUp, Loader2 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { usePayrolls, payrollValue, usePayrollTrend, usePayrollDepartments, usePayrollCharges, usePayrollBudgetUtilization } from '@/lib/usePayroll';
import { useOrganizationId } from '@/lib/useOrganizationId';

export default function PayrollHistory() {
  const organizationId = useOrganizationId();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState('');

  const { data: payrolls = [] } = usePayrolls(organizationId);
  const { data: trend = [], isLoading: trendLoading } = usePayrollTrend(organizationId, selectedYear);
  const { data: departments = [] } = usePayrollDepartments(organizationId, selectedMonth, selectedYear);
  const { data: charges } = usePayrollCharges(organizationId, selectedYear);
  const { data: budget } = usePayrollBudgetUtilization(organizationId, selectedYear);

  const payrollsForYear = payrolls.filter((payroll) => payroll.year === selectedYear);
  const currentPayroll = payrollsForYear.find((payroll) => payroll.month === selectedMonth) || payrollsForYear[0];
  const chargesData = [
    { name: 'CNSS', value: payrollValue(charges?.totalCnss), color: '#0A6ED1' },
    { name: 'AMO', value: payrollValue(charges?.totalAmo), color: '#10B981' },
    { name: 'IR', value: payrollValue(charges?.totalIr), color: '#F59E0B' },
  ].filter((item) => item.value > 0);

  const handleExportReport = async () => {
    setIsExporting(true);
    setExportError('');

    try {
      const token = localStorage.getItem('workhub.token');
      const response = await fetch(`/payroll/payrolls/export/report?orgId=${organizationId}&year=${selectedYear}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) throw new Error(`Erreur HTTP ${response.status}`);

      const url = window.URL.createObjectURL(await response.blob());
      const link = document.createElement('a');
      link.href = url;
      link.download = `rapport_professionnel_paie_${selectedYear}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setExportError(error instanceof Error ? error.message : "Impossible d'exporter le rapport");
    } finally {
      setIsExporting(false);
    }
  };

  if (!organizationId) {
    return <div className="p-6 text-center text-red-600">ID d'organisation manquant dans la session.</div>;
  }

  return (
    <div className="p-6 bg-[#F5F7FA]">
      <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Historique et Statistiques de Paie</h1>
          <p className="text-sm text-gray-600 mt-1">Historique des données consolidées</p>
        </div>
        <div className="flex items-center space-x-3">
          <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className="px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]">
            {[currentYear, currentYear - 1, currentYear - 2].map((year) => <option key={year} value={year}>Année {year}</option>)}
          </select>
          <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))} className="px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]">
            {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => <option key={month} value={month}>Mois {month}</option>)}
          </select>
          <button onClick={handleExportReport} disabled={isExporting} className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center disabled:opacity-50 disabled:cursor-not-allowed">
            {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
            {isExporting ? 'Export en cours...' : 'Exporter Rapport PDF'}
          </button>
        </div>
      </div>
      {exportError && <div className="mb-4 border border-red-200 bg-red-50 p-3 text-sm text-red-700">{exportError}</div>}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 p-6"><h3 className="text-xs font-medium text-gray-500 uppercase mb-2">Masse Salariale Brute YTD</h3><p className="text-3xl font-semibold text-gray-900">MAD {payrollValue(budget?.spentAmount).toLocaleString('fr-FR')}</p></div>
        <div className="bg-white border border-gray-200 p-6"><h3 className="text-xs font-medium text-gray-500 uppercase mb-2">Salaire Net Total YTD</h3><p className="text-3xl font-semibold text-green-600">MAD {payrollValue(budget?.spentAmount) - payrollValue(charges?.totalCnss) - payrollValue(charges?.totalAmo) - payrollValue(charges?.totalIr)}</p></div>
        <div className="bg-white border border-gray-200 p-6"><h3 className="text-xs font-medium text-gray-500 uppercase mb-2">Charges Sociales YTD</h3><p className="text-3xl font-semibold text-orange-600">MAD {payrollValue(charges?.totalCnss) + payrollValue(charges?.totalAmo) + payrollValue(charges?.totalIr)}</p></div>
        <div className="bg-white border border-gray-200 p-6"><h3 className="text-xs font-medium text-gray-500 uppercase mb-2">Budget Utilisé</h3><p className="text-3xl font-semibold text-purple-600">{(budget?.utilizationPercentage ?? 0).toFixed(0)}%</p></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between"><div className="flex items-center"><Calendar className="w-5 h-5 text-[#0A6ED1] mr-2" /><h3 className="text-base font-semibold text-gray-900">Évolution Mensuelle de la Masse Salariale</h3></div>{trendLoading && <Loader2 className="h-4 w-4 animate-spin text-gray-500" />}</div>
          <div className="p-6"><ResponsiveContainer width="100%" height={300}><LineChart data={trend}><CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" /><XAxis dataKey="month" stroke="#6B7280" /><YAxis stroke="#6B7280" /><Tooltip /><Legend /><Line type="monotone" dataKey="gross" stroke="#0A6ED1" strokeWidth={2} name="Brut" /><Line type="monotone" dataKey="net" stroke="#10B981" strokeWidth={2} name="Net" /><Line type="monotone" dataKey="socialCharges" stroke="#F59E0B" strokeWidth={2} name="Charges" /></LineChart></ResponsiveContainer></div>
        </div>

        <div className="bg-white border border-gray-200">
          <div className="p-4 border-b border-gray-200"><div className="flex items-center"><BarChart3 className="w-5 h-5 text-[#0A6ED1] mr-2" /><h3 className="text-base font-semibold text-gray-900">Coûts Salariaux par Département</h3></div></div>
          <div className="p-6"><ResponsiveContainer width="100%" height={300}><BarChart data={departments}><CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" /><XAxis dataKey="departmentName" stroke="#6B7280" /><YAxis stroke="#6B7280" /><Tooltip /><Legend /><Bar dataKey="totalCost" fill="#0A6ED1" name="Coût" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>
        </div>

        <div className="bg-white border border-gray-200">
          <div className="p-4 border-b border-gray-200"><div className="flex items-center"><PieChartIcon className="w-5 h-5 text-[#0A6ED1] mr-2" /><h3 className="text-base font-semibold text-gray-900">Répartition des Charges Sociales</h3></div></div>
          <div className="p-6"><ResponsiveContainer width="100%" height={300}><PieChart><Pie data={chargesData} cx="50%" cy="50%" labelLine={false} outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>{chargesData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div>
        </div>

        <div className="bg-white border border-gray-200">
          <div className="p-4 border-b border-gray-200"><div className="flex items-center"><Users className="w-5 h-5 text-[#0A6ED1] mr-2" /><h3 className="text-base font-semibold text-gray-900">Coût Moyen par Département</h3></div></div>
          <div className="p-6 space-y-4">
            {departments.map((dept) => {
              const avgCost = dept.employeeCount > 0 ? dept.totalCost / dept.employeeCount : 0;
              return (<div key={dept.departmentName}><div className="flex items-center justify-between mb-2"><span className="text-sm font-medium text-gray-900">{dept.departmentName}</span><span className="text-sm font-semibold text-gray-900">MAD {avgCost.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}</span></div><div className="w-full bg-gray-200 h-3"><div className="bg-[#0A6ED1] h-3" style={{ width: `${Math.min(100, (avgCost / Math.max(1, ...departments.map((d) => d.employeeCount ? d.totalCost / d.employeeCount : 0))) * 100)}%` }} /></div><p className="text-xs text-gray-600 mt-1">{dept.employeeCount} employés</p></div>);
            })}
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 mb-6">
        <div className="p-4 border-b border-gray-200"><div className="flex items-center"><TrendingUp className="w-5 h-5 text-[#0A6ED1] mr-2" /><h3 className="text-base font-semibold text-gray-900">Variation mensuelle</h3></div></div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mois</th><th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Brut</th><th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Net</th><th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Charges</th><th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Variation</th></tr></thead>
            <tbody className="divide-y divide-gray-200">
              {trend.map((month, index) => {
                const previous = index > 0 ? trend[index - 1].gross : month.gross;
                const variation = previous ? ((month.gross - previous) / previous) * 100 : 0;
                return (<tr key={month.month} className="hover:bg-gray-50"><td className="px-6 py-4 text-sm font-medium text-gray-900">{month.month}</td><td className="px-6 py-4 text-sm text-right text-gray-900">MAD {month.gross.toLocaleString('fr-FR')}</td><td className="px-6 py-4 text-sm text-right text-green-600">MAD {month.net.toLocaleString('fr-FR')}</td><td className="px-6 py-4 text-sm text-right text-gray-600">MAD {month.socialCharges.toLocaleString('fr-FR')}</td><td className="px-6 py-4 text-sm text-right"><span className={variation >= 0 ? 'text-green-600' : 'text-red-600'}>{variation >= 0 ? '+' : ''}{variation.toFixed(1)}%</span></td></tr>);
              })}
            </tbody>
          </table>
        </div>
      </div>

      {currentPayroll && (
        <div className="bg-white border border-gray-200 p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Paie sélectionnée</h3>
          <p className="text-sm text-gray-600">Période: {currentPayroll.month}/{currentPayroll.year} — Statut: {currentPayroll.status}</p>
        </div>
      )}
    </div>
  );
}
