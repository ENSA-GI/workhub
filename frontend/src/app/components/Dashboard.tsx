import { Users, UserCheck, FileText, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const kpiData = [
    {
      title: 'Total Employees',
      value: '1,247',
      change: '+12%',
      trend: 'up',
      icon: Users,
      color: 'bg-blue-50 text-[#0A6ED1]',
    },
    {
      title: 'Active Employees',
      value: '1,189',
      change: '+5%',
      trend: 'up',
      icon: UserCheck,
      color: 'bg-green-50 text-green-600',
    },
    {
      title: 'Pending Leave Requests',
      value: '23',
      change: '-8%',
      trend: 'down',
      icon: FileText,
      color: 'bg-orange-50 text-orange-600',
    },
    {
      title: 'Monthly Payroll',
      value: '$842,500',
      change: '+3%',
      trend: 'up',
      icon: DollarSign,
      color: 'bg-purple-50 text-purple-600',
    },
  ];

  const employeeGrowthData = [
    { id: 'emp-jan', month: 'Jan', employees: 1020 },
    { id: 'emp-feb', month: 'Feb', employees: 1065 },
    { id: 'emp-mar', month: 'Mar', employees: 1098 },
    { id: 'emp-apr', month: 'Apr', employees: 1134 },
    { id: 'emp-may', month: 'May', employees: 1176 },
    { id: 'emp-jun', month: 'Jun', employees: 1247 },
  ];

  const payrollData = [
    { id: 'pay-jan', month: 'Jan', amount: 752 },
    { id: 'pay-feb', month: 'Feb', amount: 783 },
    { id: 'pay-mar', month: 'Mar', amount: 805 },
    { id: 'pay-apr', month: 'Apr', amount: 816 },
    { id: 'pay-may', month: 'May', amount: 829 },
    { id: 'pay-jun', month: 'Jun', amount: 843 },
  ];

  const recentActivities = [
    { id: 1, type: 'Employee Onboarding', name: 'Sarah Johnson joined as Senior Developer', time: '2 hours ago', status: 'success' },
    { id: 2, type: 'Leave Request', name: 'Michael Chen requested 5 days leave', time: '4 hours ago', status: 'pending' },
    { id: 3, type: 'Payroll', name: 'May payroll processed successfully', time: '1 day ago', status: 'success' },
    { id: 4, type: 'Recruitment', name: 'New job posting: Marketing Manager', time: '2 days ago', status: 'info' },
    { id: 5, type: 'Employee Update', name: 'Alex Martinez promoted to Team Lead', time: '3 days ago', status: 'success' },
  ];

  return (
    <div className="p-6">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-600 mt-1">Welcome back! Here's what's happening in your organization.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {kpiData.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.title} className="bg-white rounded border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded flex items-center justify-center ${kpi.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className={`flex items-center text-sm ${kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {kpi.trend === 'up' ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                  {kpi.change}
                </div>
              </div>
              <h3 className="text-sm text-gray-600 mb-1">{kpi.title}</h3>
              <p className="text-2xl font-semibold text-gray-900">{kpi.value}</p>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Employee Growth */}
        <div className="bg-white rounded border border-gray-200 p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Employee Growth</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={employeeGrowthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" key="grid-1" />
              <XAxis dataKey="month" stroke="#6B7280" key="xaxis-1" />
              <YAxis stroke="#6B7280" key="yaxis-1" />
              <Tooltip key="tooltip-1" />
              <Line type="monotone" dataKey="employees" stroke="#0A6ED1" strokeWidth={2} dot={{ fill: '#0A6ED1', r: 4 }} key="line-1" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Payroll Evolution */}
        <div className="bg-white rounded border border-gray-200 p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Payroll Evolution (in thousands)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={payrollData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" key="grid-2" />
              <XAxis dataKey="month" stroke="#6B7280" key="xaxis-2" />
              <YAxis stroke="#6B7280" key="yaxis-2" />
              <Tooltip key="tooltip-2" />
              <Bar dataKey="amount" fill="#0A6ED1" radius={[4, 4, 0, 0]} key="bar-2" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded border border-gray-200 p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Recent Activities</h3>
        <div className="space-y-4">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="flex items-start pb-4 border-b border-gray-100 last:border-0 last:pb-0">
              <div className={`w-2 h-2 rounded-full mt-2 mr-3 ${
                activity.status === 'success' ? 'bg-green-500' :
                activity.status === 'pending' ? 'bg-orange-500' :
                'bg-blue-500'
              }`}></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{activity.name}</p>
                <p className="text-xs text-gray-500 mt-1">{activity.type}</p>
              </div>
              <span className="text-xs text-gray-500 ml-4 whitespace-nowrap">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
