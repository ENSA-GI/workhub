import { Users, DollarSign, Calendar, Loader2 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion } from 'motion/react';
import { useEmployees } from '@/lib/useEmployees';
import { payrollValue, usePayrollAnalyticsYtd, usePayrollCharges, usePayrollDepartments, usePayrollTrend, usePayrollBudgetUtilization } from '@/lib/usePayroll';
import { useOrganizationId } from '@/lib/useOrganizationId';

export default function DashboardRHManager() {
  const organizationId = useOrganizationId();
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const { data: employeesData } = useEmployees(organizationId, 0, 200, 'ACTIVE');
  const { data: ytd } = usePayrollAnalyticsYtd(organizationId, currentYear);
  const { data: trendData = [], isLoading: trendLoading } = usePayrollTrend(organizationId, currentYear);
  const { data: charges } = usePayrollCharges(organizationId, currentYear);
  const { data: budgetData } = usePayrollBudgetUtilization(organizationId, currentYear);
  const { data: deptsData = [] } = usePayrollDepartments(organizationId, currentMonth, currentYear);

  // MODE DÉMO (Fallback)
  const isDemoMode = !employeesData || employeesData.content.length === 0;

  const displayEmployees = isDemoMode ? 45 : (employeesData?.content.length || 0);
  const displayYtd = isDemoMode ? 1420500 : payrollValue(ytd?.totalGrossYtd);
  const displayAvgCost = isDemoMode ? 8250 : payrollValue(ytd?.averageCostPerEmployee);
  
  const budget = isDemoMode ? {
    utilizationPercentage: 72,
    annualBudget: 2000000,
    spentAmount: 1440000,
    remainingAmount: 560000
  } : budgetData;

  const trend = isDemoMode ? [
    { month: 1, gross: 200000 }, { month: 2, gross: 208000 }, { month: 3, gross: 215000 },
    { month: 4, gross: 230000 }, { month: 5, gross: 235000 }, { month: 6, gross: 245000 }
  ] : trendData;

  const departments = isDemoMode ? [
    { departmentName: 'IT', employeeCount: 18 },
    { departmentName: 'Ventes', employeeCount: 12 },
    { departmentName: 'Marketing', employeeCount: 8 },
    { departmentName: 'RH', employeeCount: 4 },
    { departmentName: 'Finance', employeeCount: 3 }
  ] : deptsData;

  const rawChargesData = isDemoMode ? [
    { name: 'CNSS', value: 85000, color: '#0A6ED1' },
    { name: 'AMO', value: 32000, color: '#10B981' },
    { name: 'IR', value: 145000, color: '#F59E0B' },
  ] : [
    { name: 'CNSS', value: payrollValue(charges?.totalCnss), color: '#0A6ED1' },
    { name: 'AMO', value: payrollValue(charges?.totalAmo), color: '#10B981' },
    { name: 'IR', value: payrollValue(charges?.totalIr), color: '#F59E0B' },
  ];

  const chargesData = rawChargesData.filter((item) => item.value > 0);

  if (!organizationId) {
    return <div className="p-6 text-center text-red-600">ID d'organisation manquant dans la session.</div>;
  }

  return (
    <div className="p-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">Dashboard RH</h1>
        <p className="text-sm text-gray-500 mt-1">Vue d'ensemble branchée sur les APIs de paie et d'effectifs</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card glass-card-hover rounded-3xl p-6"><div className="flex items-center justify-between mb-4"><h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Effectif Actuel</h3><div className="p-2 bg-blue-50 rounded-xl"><Users className="w-5 h-5 text-[#0A6ED1]" /></div></div><p className="text-4xl font-bold text-gray-900 mb-1">{displayEmployees}</p></motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card glass-card-hover rounded-3xl p-6"><div className="flex items-center justify-between mb-4"><h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Masse Salariale</h3><div className="p-2 bg-green-50 rounded-xl"><DollarSign className="w-5 h-5 text-green-600" /></div></div><p className="text-4xl font-bold text-gray-900 mb-1">MAD {displayYtd.toLocaleString('fr-FR')}</p></motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card glass-card-hover rounded-3xl p-6"><div className="flex items-center justify-between mb-4"><h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Coût Moyen/Employé</h3><div className="p-2 bg-purple-50 rounded-xl"><DollarSign className="w-5 h-5 text-purple-600" /></div></div><p className="text-4xl font-bold text-gray-900 mb-1">MAD {displayAvgCost.toLocaleString('fr-FR')}</p></motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card glass-card-hover rounded-3xl p-6"><div className="flex items-center justify-between mb-4"><h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Budget Utilisé</h3><div className="p-2 bg-orange-50 rounded-xl"><Calendar className="w-5 h-5 text-orange-600" /></div></div><p className="text-4xl font-bold text-gray-900 mb-1">{(budget?.utilizationPercentage ?? 0).toFixed(0)}%</p></motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }} className="glass-card rounded-3xl overflow-hidden glass-card-hover">
          <div className="p-5 border-b border-gray-100 bg-white/50 flex items-center justify-between"><h3 className="text-lg font-bold text-gray-800">Évolution de la Paie</h3>{trendLoading && !isDemoMode && <Loader2 className="h-4 w-4 animate-spin text-gray-500" />}</div>
          <div className="p-6 bg-white/30"><ResponsiveContainer width="100%" height={280}><LineChart data={trend}><CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} /><XAxis dataKey="month" stroke="#9CA3AF" axisLine={false} tickLine={false} /><YAxis stroke="#9CA3AF" axisLine={false} tickLine={false} /><Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} /><Legend /><Line type="monotone" dataKey="gross" stroke="url(#colorGross)" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} name="Brut" />
            <defs>
              <linearGradient id="colorGross" x1="0" y1="0" x2="1" y2="0">
                <stop offset="5%" stopColor="#0A6ED1" />
                <stop offset="95%" stopColor="#6366f1" />
              </linearGradient>
            </defs>
          </LineChart></ResponsiveContainer></div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 }} className="glass-card rounded-3xl overflow-hidden glass-card-hover">
          <div className="p-5 border-b border-gray-100 bg-white/50"><h3 className="text-lg font-bold text-gray-800">Répartition par Département</h3></div>
          <div className="p-6 bg-white/30"><ResponsiveContainer width="100%" height={280}><BarChart data={departments}><CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} /><XAxis dataKey="departmentName" stroke="#9CA3AF" axisLine={false} tickLine={false} /><YAxis stroke="#9CA3AF" axisLine={false} tickLine={false} /><Tooltip cursor={{fill: 'rgba(243, 244, 246, 0.5)'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} /><Legend /><Bar dataKey="employeeCount" fill="#0A6ED1" radius={[4, 4, 0, 0]} name="Employés" /></BarChart></ResponsiveContainer></div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.7 }} className="glass-card rounded-3xl overflow-hidden glass-card-hover">
          <div className="p-5 border-b border-gray-100 bg-white/50"><h3 className="text-lg font-bold text-gray-800">Charges Sociales</h3></div>
          <div className="p-6 bg-white/30"><ResponsiveContainer width="100%" height={280}><PieChart><Pie data={chargesData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" stroke="none" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>{chargesData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}</Pie><Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} /></PieChart></ResponsiveContainer></div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8 }} className="glass-card rounded-3xl overflow-hidden glass-card-hover">
          <div className="p-5 border-b border-gray-100 bg-white/50"><h3 className="text-lg font-bold text-gray-800">Budget</h3></div>
          <div className="p-8 space-y-6 bg-white/30">
            <div className="flex justify-between items-center p-4 bg-white/50 rounded-2xl border border-gray-100 shadow-sm"><span className="text-sm font-medium text-gray-500 uppercase">Budget annuel</span><span className="text-xl font-bold text-gray-900">MAD {payrollValue(budget?.annualBudget).toLocaleString('fr-FR')}</span></div>
            <div className="flex justify-between items-center p-4 bg-white/50 rounded-2xl border border-gray-100 shadow-sm"><span className="text-sm font-medium text-gray-500 uppercase">Dépensé</span><span className="text-xl font-bold text-gray-900">MAD {payrollValue(budget?.spentAmount).toLocaleString('fr-FR')}</span></div>
            <div className="flex justify-between items-center p-4 bg-green-50 rounded-2xl border border-green-100 shadow-sm"><span className="text-sm font-medium text-green-700 uppercase">Restant</span><span className="text-2xl font-black text-green-600">MAD {payrollValue(budget?.remainingAmount).toLocaleString('fr-FR')}</span></div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
