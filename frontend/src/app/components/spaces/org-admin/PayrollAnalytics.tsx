import { useMemo, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { TrendingUp, Loader2 } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { usePayrollAnalyticsYtd, usePayrollBudgetUtilization, usePayrollCharges, usePayrollDepartments, usePayrollTrend, payrollValue } from '@/lib/usePayroll';

export default function PayrollAnalytics() {
  const { user } = useUser();
  const organizationId = (user?.publicMetadata?.organizationId as string) || '';
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  const { data: ytd } = usePayrollAnalyticsYtd(organizationId, year);
  const { data: trend = [], isLoading: trendLoading } = usePayrollTrend(organizationId, year);
  const { data: charges } = usePayrollCharges(organizationId, year);
  const { data: budget } = usePayrollBudgetUtilization(organizationId, year);
  const { data: departments = [] } = usePayrollDepartments(organizationId, month, year);

  const previousPoint = trend.length > 1 ? trend[trend.length - 2] : null;
  const currentPoint = trend.length ? trend[trend.length - 1] : null;
  const variation = previousPoint && currentPoint ? currentPoint.gross - previousPoint.gross : 0;

  const chargesData = useMemo(() => [
    { id: 'cnss', name: 'CNSS', value: payrollValue(charges?.totalCnss), color: '#0A6ED1' },
    { id: 'amo', name: 'AMO', value: payrollValue(charges?.totalAmo), color: '#10B981' },
    { id: 'ir', name: 'IR', value: payrollValue(charges?.totalIr), color: '#F59E0B' },
  ].filter((item) => item.value > 0), [charges]);

  if (!organizationId) {
    return <div className="p-6 text-center text-red-600">ID d'organisation manquant dans Clerk.</div>;
  }

  return (
    <div className="p-6 bg-[#F5F7FA]">
      <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Analytics Paie</h1>
          <p className="text-sm text-gray-600 mt-1">Toutes les métriques viennent du backend</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]">
            {[currentYear, currentYear - 1, currentYear - 2].map((y) => <option key={y} value={y}>Année {y}</option>)}
          </select>
          <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]">
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => <option key={m} value={m}>Mois {m}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 p-6"><h3 className="text-xs font-medium text-gray-500 uppercase mb-2">Masse Salariale YTD</h3><p className="text-3xl font-semibold text-gray-900">MAD {payrollValue(ytd?.totalGrossYtd).toLocaleString('fr-FR')}</p><p className="text-xs text-green-600 mt-1"><TrendingUp className="inline w-3 h-3 mr-1" />backend</p></div>
        <div className="bg-white border border-gray-200 p-6"><h3 className="text-xs font-medium text-gray-500 uppercase mb-2">Salaire Net YTD</h3><p className="text-3xl font-semibold text-green-600">MAD {payrollValue(ytd?.totalNetYtd).toLocaleString('fr-FR')}</p></div>
        <div className="bg-white border border-gray-200 p-6"><h3 className="text-xs font-medium text-gray-500 uppercase mb-2">Charges Sociales YTD</h3><p className="text-3xl font-semibold text-orange-600">MAD {payrollValue(ytd?.totalSocialChargesYtd).toLocaleString('fr-FR')}</p></div>
        <div className="bg-white border border-gray-200 p-6"><h3 className="text-xs font-medium text-gray-500 uppercase mb-2">Coût Moyen / Employé</h3><p className="text-3xl font-semibold text-purple-600">MAD {payrollValue(ytd?.averageCostPerEmployee).toLocaleString('fr-FR')}</p></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between"><h3 className="text-base font-semibold text-gray-900">Évolution de la Masse Salariale</h3>{trendLoading && <Loader2 className="h-4 w-4 animate-spin text-gray-500" />}</div>
          <div className="p-6"><ResponsiveContainer width="100%" height={300}><LineChart data={trend}><CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" /><XAxis dataKey="month" stroke="#6B7280" /><YAxis stroke="#6B7280" /><Tooltip /><Legend /><Line type="monotone" dataKey="gross" stroke="#0A6ED1" strokeWidth={2} name="Brut" /><Line type="monotone" dataKey="net" stroke="#10B981" strokeWidth={2} name="Net" /><Line type="monotone" dataKey="socialCharges" stroke="#F59E0B" strokeWidth={2} name="Charges" /></LineChart></ResponsiveContainer></div>
        </div>

        <div className="bg-white border border-gray-200">
          <div className="p-4 border-b border-gray-200"><h3 className="text-base font-semibold text-gray-900">Coûts par Département</h3></div>
          <div className="p-6"><ResponsiveContainer width="100%" height={300}><BarChart data={departments}><CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" /><XAxis dataKey="departmentName" stroke="#6B7280" /><YAxis stroke="#6B7280" /><Tooltip /><Legend /><Bar dataKey="totalCost" fill="#0A6ED1" name="Coût" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>
        </div>

        <div className="bg-white border border-gray-200">
          <div className="p-4 border-b border-gray-200"><h3 className="text-base font-semibold text-gray-900">Répartition des Charges</h3></div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={chargesData} cx="50%" cy="50%" outerRadius={80} dataKey="value" labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {chargesData.map((entry) => <Cell key={entry.id} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {chargesData.map((charge) => <div key={charge.id} className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200"><span className="text-xs text-gray-700">{charge.name}</span><span className="text-xs font-medium text-gray-900">MAD {charge.value.toLocaleString('fr-FR')}</span></div>)}
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200">
          <div className="p-4 border-b border-gray-200"><h3 className="text-base font-semibold text-gray-900">Budget Annuel</h3></div>
          <div className="p-6 space-y-4">
            <div className="flex justify-between pb-3 border-b border-gray-100"><span className="text-sm text-gray-600">Budget Total</span><span className="text-sm font-medium text-gray-900">MAD {payrollValue(budget?.annualBudget).toLocaleString('fr-FR')}</span></div>
            <div className="flex justify-between pb-3 border-b border-gray-100"><span className="text-sm text-gray-600">Dépensé</span><span className="text-sm font-medium text-gray-900">MAD {payrollValue(budget?.spentAmount).toLocaleString('fr-FR')}</span></div>
            <div className="flex justify-between pb-3 border-b border-gray-100"><span className="text-sm text-gray-600">Restant</span><span className="text-sm font-medium text-green-600">MAD {payrollValue(budget?.remainingAmount).toLocaleString('fr-FR')}</span></div>
            <div className="pt-2"><p className="text-xs text-gray-600 mb-2">Utilisation</p><div className="w-full bg-gray-200 h-3"><div className="bg-[#0A6ED1] h-3" style={{ width: `${budget?.utilizationPercentage ?? 0}%` }} /></div><p className="text-xs text-gray-500 mt-1">{(budget?.utilizationPercentage ?? 0).toFixed(0)}% utilisé</p></div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 mb-6">
        <div className="p-4 border-b border-gray-200"><h3 className="text-base font-semibold text-gray-900">Variation du mois</h3></div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 border border-gray-200 p-4"><p className="text-sm text-gray-600 mb-2">Brut courant</p><p className="text-2xl font-semibold text-gray-900">MAD {currentPoint ? currentPoint.gross.toLocaleString('fr-FR') : '0'}</p></div>
          <div className="bg-gray-50 border border-gray-200 p-4"><p className="text-sm text-gray-600 mb-2">Variation vs mois précédent</p><p className={`text-2xl font-semibold ${variation >= 0 ? 'text-green-600' : 'text-red-600'}`}>{variation >= 0 ? '+' : ''}MAD {Math.abs(variation).toLocaleString('fr-FR')}</p></div>
          <div className="bg-gray-50 border border-gray-200 p-4"><p className="text-sm text-gray-600 mb-2">Statut</p><p className="text-2xl font-semibold text-gray-900">Analyse temps réel</p></div>
        </div>
      </div>
    </div>
  );
}
