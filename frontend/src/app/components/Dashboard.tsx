import { Users, UserCheck, FileText, DollarSign, TrendingUp, Activity } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useEmployees } from '@/lib/useEmployees';
import { usePayrollAnalyticsYtd, usePayrollTrend, payrollValue } from '@/lib/usePayroll';
import { useOrganizationId } from '@/lib/useOrganizationId';
import { motion } from 'motion/react';

export default function Dashboard() {
  const organizationId = useOrganizationId();
  const currentYear = new Date().getFullYear();

  const { data: employeesData } = useEmployees(organizationId, 0, 200, 'ACTIVE');
  const { data: ytd } = usePayrollAnalyticsYtd(organizationId, currentYear);
  const { data: trend = [] } = usePayrollTrend(organizationId, currentYear);

  const isDemoMode = employeesData?.content?.length === 0 || !employeesData;
  const displayEmployees = isDemoMode ? 142 : employeesData.content.length;
  const displayGross = isDemoMode ? '1 250 400' : payrollValue(ytd?.totalGrossYtd).toLocaleString('fr-FR');
  const displayNet = isDemoMode ? '980 200' : payrollValue(ytd?.totalNetYtd).toLocaleString('fr-FR');
  const displayAvgCost = isDemoMode ? '8 805' : payrollValue(ytd?.averageCostPerEmployee).toLocaleString('fr-FR');

  const kpiData = [
    { title: 'Employés actifs', value: `${displayEmployees}`, trend: 'up', icon: Users, color: 'text-[#0A6ED1]', bg: 'bg-blue-50' },
    { title: 'Paie brute YTD', value: `MAD ${displayGross}`, trend: 'up', icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
    { title: 'Net YTD', value: `MAD ${displayNet}`, trend: 'up', icon: FileText, color: 'text-orange-600', bg: 'bg-orange-50' },
    { title: 'Coût moyen', value: `MAD ${displayAvgCost}`, trend: 'up', icon: UserCheck, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  const employeeGrowthData = isDemoMode 
    ? [ { month: 1, employees: 120 }, { month: 2, employees: 125 }, { month: 3, employees: 128 }, { month: 4, employees: 135 }, { month: 5, employees: 138 }, { month: 6, employees: 142 } ]
    : trend.map((point) => ({ month: point.month, employees: Math.max(0, Math.round(point.gross / Math.max(1, payrollValue(ytd?.averageCostPerEmployee)))) }));
    
  const payrollData = isDemoMode
    ? [ { month: 1, amount: 200000 }, { month: 2, amount: 208000 }, { month: 3, amount: 215000 }, { month: 4, amount: 230000 }, { month: 5, amount: 235000 }, { month: 6, amount: 245000 } ]
    : trend.map((point) => ({ month: point.month, amount: point.gross }));

  const getColors = (index: number) => {
    const colors = ['#0A6ED1', '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e'];
    return colors[index % colors.length];
  };

  if (!organizationId) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="glass-card p-8 rounded-3xl text-center max-w-md">
          <Activity className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Accès restreint</h2>
          <p className="text-sm text-gray-500">ID d'organisation manquant dans la session. Veuillez vous reconnecter.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 pb-24">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">Tableau de Bord Global</h1>
        <p className="text-sm text-gray-500 mt-1">Vue d'ensemble stratégique et financière</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpiData.map((kpi, index) => { 
          const Icon = kpi.icon; 
          return (
            <motion.div 
              key={kpi.title} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.1 }}
              className="glass-card glass-card-hover rounded-3xl p-6 relative overflow-hidden"
            >
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br from-white/40 to-transparent rounded-full pointer-events-none" />
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className={`p-2.5 rounded-xl ${kpi.bg} shadow-sm`}>
                  <Icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
                <div className="flex items-center text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full shadow-sm">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +12%
                </div>
              </div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 relative z-10">{kpi.title}</h3>
              <p className="text-3xl font-bold text-gray-900 relative z-10">{kpi.value}</p>
            </motion.div>
          ); 
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="glass-card rounded-3xl overflow-hidden glass-card-hover"
        >
          <div className="p-5 border-b border-gray-100/50 bg-white/40">
            <h3 className="text-lg font-bold text-gray-800">Croissance des effectifs</h3>
          </div>
          <div className="p-6 bg-white/20">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={employeeGrowthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEmployees" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0A6ED1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0A6ED1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis dataKey="month" stroke="#9CA3AF" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis stroke="#9CA3AF" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(8px)' }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="employees" 
                  name="Employés"
                  stroke="#0A6ED1" 
                  strokeWidth={4} 
                  dot={{ fill: '#ffffff', stroke: '#0A6ED1', strokeWidth: 2, r: 4 }} 
                  activeDot={{ r: 6, fill: '#0A6ED1', stroke: '#ffffff', strokeWidth: 2 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="glass-card rounded-3xl overflow-hidden glass-card-hover"
        >
          <div className="p-5 border-b border-gray-100/50 bg-white/40">
            <h3 className="text-lg font-bold text-gray-800">Évolution de la Masse Salariale</h3>
          </div>
          <div className="p-6 bg-white/20">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={payrollData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis dataKey="month" stroke="#9CA3AF" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis stroke="#9CA3AF" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} tickFormatter={(value) => `${value / 1000}k`} />
                <Tooltip 
                  cursor={{fill: 'rgba(243, 244, 246, 0.4)'}} 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(8px)' }} 
                  formatter={(value: number) => [`MAD ${value.toLocaleString('fr-FR')}`, 'Montant']}
                />
                <Bar dataKey="amount" name="Montant" radius={[6, 6, 0, 0]} maxBarSize={50}>
                  {payrollData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getColors(index)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
