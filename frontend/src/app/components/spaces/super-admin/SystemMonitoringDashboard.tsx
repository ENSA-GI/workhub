import { Activity, Server, Database, Cloud, CheckCircle, AlertTriangle, XCircle, TrendingUp, Zap } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function SystemMonitoringDashboard() {
  const servicesStatus = [
    { name: 'API Gateway', status: 'UP', uptime: '99.99%', responseTime: '45ms', color: 'green' },
    { name: 'Auth Service', status: 'UP', uptime: '99.95%', responseTime: '32ms', color: 'green' },
    { name: 'Database Primary', status: 'UP', uptime: '99.98%', responseTime: '12ms', color: 'green' },
    { name: 'Database Replica', status: 'UP', uptime: '99.97%', responseTime: '15ms', color: 'green' },
    { name: 'Storage Service', status: 'UP', uptime: '99.92%', responseTime: '78ms', color: 'green' },
    { name: 'Email Service', status: 'DEGRADED', uptime: '98.50%', responseTime: '450ms', color: 'orange' },
    { name: 'Analytics Engine', status: 'UP', uptime: '99.88%', responseTime: '120ms', color: 'green' },
    { name: 'Background Jobs', status: 'UP', uptime: '99.94%', responseTime: '89ms', color: 'green' },
  ];

  const cpuData = [
    { id: 'cpu-1', time: '14:00', usage: 42 },
    { id: 'cpu-2', time: '14:05', usage: 45 },
    { id: 'cpu-3', time: '14:10', usage: 48 },
    { id: 'cpu-4', time: '14:15', usage: 52 },
    { id: 'cpu-5', time: '14:20', usage: 49 },
    { id: 'cpu-6', time: '14:25', usage: 45 },
    { id: 'cpu-7', time: '14:30', usage: 43 },
  ];

  const memoryData = [
    { id: 'mem-1', time: '14:00', usage: 6.1 },
    { id: 'mem-2', time: '14:05', usage: 6.2 },
    { id: 'mem-3', time: '14:10', usage: 6.4 },
    { id: 'mem-4', time: '14:15', usage: 6.5 },
    { id: 'mem-5', time: '14:20', usage: 6.3 },
    { id: 'mem-6', time: '14:25', usage: 6.2 },
    { id: 'mem-7', time: '14:30', usage: 6.2 },
  ];

  const trafficData = [
    { id: 'traffic-1', time: '14:00', requests: 1250 },
    { id: 'traffic-2', time: '14:05', requests: 1420 },
    { id: 'traffic-3', time: '14:10', requests: 1680 },
    { id: 'traffic-4', time: '14:15', requests: 1950 },
    { id: 'traffic-5', time: '14:20', requests: 1720 },
    { id: 'traffic-6', time: '14:25', requests: 1580 },
    { id: 'traffic-7', time: '14:30', requests: 1450 },
  ];

  const activeAlerts = [
    { id: 1, severity: 'warning', service: 'Email Service', message: 'Temps de réponse élevé (>400ms)', time: '14:22' },
    { id: 2, severity: 'info', service: 'Database', message: 'Connexions simultanées élevées (450/500)', time: '14:15' },
  ];

  const kpis = [
    { label: 'CPU Usage', value: '45%', status: 'normal', trend: 'stable', icon: Activity },
    { label: 'Memory', value: '6.2 GB / 16 GB', status: 'normal', trend: 'stable', icon: Server },
    { label: 'Database Load', value: '450 / 500', status: 'warning', trend: 'up', icon: Database },
    { label: 'Uptime', value: '99.95%', status: 'normal', trend: 'up', icon: CheckCircle },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'UP':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'DEGRADED':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'DOWN':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Activity className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="p-6 bg-[#F5F7FA]">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Monitoring Système</h1>
        <p className="text-sm text-gray-600 mt-1">Vue globale en temps réel de la santé de la plateforme</p>
      </div>

      {/* KPIs Principaux */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="bg-white border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-medium text-gray-500 uppercase">{kpi.label}</h3>
                <Icon className={`w-5 h-5 ${
                  kpi.status === 'warning' ? 'text-orange-600' : 'text-[#0A6ED1]'
                }`} />
              </div>
              <p className="text-2xl font-semibold text-gray-900 mb-1">{kpi.value}</p>
              <div className={`flex items-center text-xs ${
                kpi.trend === 'up' ? 'text-green-600' : kpi.trend === 'down' ? 'text-red-600' : 'text-gray-600'
              }`}>
                <TrendingUp className={`w-3 h-3 mr-1 ${kpi.trend === 'down' ? 'rotate-180' : ''}`} />
                <span>{kpi.trend === 'stable' ? 'Stable' : kpi.trend === 'up' ? 'En hausse' : 'En baisse'}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Alertes Actives */}
      {activeAlerts.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 p-4 mb-6">
          <div className="flex items-center mb-3">
            <AlertTriangle className="w-5 h-5 text-orange-600 mr-2" />
            <h3 className="text-sm font-semibold text-orange-900">{activeAlerts.length} Alerte(s) Active(s)</h3>
          </div>
          <div className="space-y-2">
            {activeAlerts.map((alert) => (
              <div key={alert.id} className="flex items-start justify-between bg-white border border-orange-200 p-3">
                <div className="flex-1">
                  <div className="flex items-center mb-1">
                    <span className={`inline-flex px-2 py-0.5 text-xs mr-2 ${
                      alert.severity === 'warning' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {alert.severity.toUpperCase()}
                    </span>
                    <span className="text-sm font-medium text-gray-900">{alert.service}</span>
                  </div>
                  <p className="text-sm text-gray-700">{alert.message}</p>
                </div>
                <span className="text-xs text-gray-500 ml-4">{alert.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Graphiques de Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* CPU Usage */}
        <div className="bg-white border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">CPU Usage (%)</h3>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={cpuData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" key="grid-cpu" />
                <XAxis dataKey="time" stroke="#6B7280" key="xaxis-cpu" />
                <YAxis stroke="#6B7280" key="yaxis-cpu" />
                <Tooltip key="tooltip-cpu" />
                <Area type="monotone" dataKey="usage" stroke="#0A6ED1" fill="#0A6ED1" fillOpacity={0.3} key="area-cpu" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Memory Usage */}
        <div className="bg-white border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">Memory Usage (GB)</h3>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={memoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" key="grid-mem" />
                <XAxis dataKey="time" stroke="#6B7280" key="xaxis-mem" />
                <YAxis stroke="#6B7280" key="yaxis-mem" />
                <Tooltip key="tooltip-mem" />
                <Area type="monotone" dataKey="usage" stroke="#10B981" fill="#10B981" fillOpacity={0.3} key="area-mem" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Traffic */}
        <div className="bg-white border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">Traffic (req/min)</h3>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trafficData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" key="grid-traffic" />
                <XAxis dataKey="time" stroke="#6B7280" key="xaxis-traffic" />
                <YAxis stroke="#6B7280" key="yaxis-traffic" />
                <Tooltip key="tooltip-traffic" />
                <Line type="monotone" dataKey="requests" stroke="#F59E0B" strokeWidth={2} key="line-traffic" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Statut des Services */}
      <div className="bg-white border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center">
            <Zap className="w-5 h-5 text-[#0A6ED1] mr-2" />
            <h3 className="text-base font-semibold text-gray-900">Statut des Services</h3>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {servicesStatus.map((service) => (
              <div
                key={service.name}
                className={`border-2 p-4 ${
                  service.status === 'UP'
                    ? 'border-green-200 bg-green-50'
                    : service.status === 'DEGRADED'
                    ? 'border-orange-200 bg-orange-50'
                    : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-900">{service.name}</h4>
                  {getStatusIcon(service.status)}
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Status</span>
                    <span className={`font-medium ${
                      service.status === 'UP' ? 'text-green-600' :
                      service.status === 'DEGRADED' ? 'text-orange-600' : 'text-red-600'
                    }`}>
                      {service.status}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Uptime</span>
                    <span className="font-medium text-gray-900">{service.uptime}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Response</span>
                    <span className="font-medium text-gray-900">{service.responseTime}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
