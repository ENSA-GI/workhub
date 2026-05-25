import { Calendar, TrendingUp, AlertTriangle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';

const API_BASE = 'http://localhost:8080';
const DEMO_EMPLOYEE_ID = '111e8400-e29b-41d4-a716-446655440000';

interface LeaveRequest {
  id: string;
  employeeId: string;
  leaveTypeName: string;
  startDate: string;
  endDate: string;
  requestedDays: number;
  reason: string;
  status: string;
}

interface LeaveBalance {
  totalDays: number;
  usedDays: number;
  pendingDays: number;
  remainingDays: number;
  carriedOverDays: number;
}

export default function CongesAnalytics() {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [balance, setBalance] = useState<LeaveBalance | null>(null);

  useEffect(() => {
    async function loadLeaveAnalytics() {
      const [requestsRes, balanceRes] = await Promise.all([
        fetch(`${API_BASE}/leave/leave-requests/all`, { headers: { Accept: 'application/json' } }),
        fetch(`${API_BASE}/leave/leave-balances?employeeId=${DEMO_EMPLOYEE_ID}`, { headers: { Accept: 'application/json' } }),
      ]);

      if (requestsRes.ok) {
        setRequests(await requestsRes.json());
      }
      if (balanceRes.ok) {
        setBalance(await balanceRes.json());
      }
    }

    loadLeaveAnalytics().catch(err => console.error('Erreur analytics conges:', err));
  }, []);

  const analytics = useMemo(() => {
    const activeRequests = requests.filter(req => req.status !== 'CANCELLED');
    const approvedRequests = requests.filter(req => req.status === 'APPROVED');
    const pendingRequests = requests.filter(req => req.status === 'PENDING');
    const totalEntitlement = Number(balance?.totalDays || 0) + Number(balance?.carriedOverDays || 0);
    const usedDays = Number(balance?.usedDays || 0);
    const pendingDays = Number(balance?.pendingDays || 0);
    const utilisation = totalEntitlement > 0 ? Math.round((usedDays / totalEntitlement) * 100) : 0;
    const colors = ['#0A6ED1', '#F59E0B', '#10B981', '#6B7280', '#EF4444'];

    const byType = Array.from(activeRequests.reduce((acc, req) => {
      acc.set(req.leaveTypeName, (acc.get(req.leaveTypeName) || 0) + Number(req.requestedDays || 0));
      return acc;
    }, new Map<string, number>())).map(([name, value], index) => ({
      name,
      value,
      color: colors[index % colors.length],
    }));

    const byMonth = Array.from(activeRequests.reduce((acc, req) => {
      const key = new Date(req.startDate).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
      acc.set(key, (acc.get(key) || 0) + Number(req.requestedDays || 0));
      return acc;
    }, new Map<string, number>())).map(([periode, absences]) => ({
      periode,
      absences,
      pourcentage: totalEntitlement > 0 ? Math.min(100, Math.round((absences / totalEntitlement) * 100)) : 0,
    }));

    return {
      usedDays,
      pendingDays,
      utilisation,
      approvedCount: approvedRequests.length,
      pendingCount: pendingRequests.length,
      globalUsage: [{ departement: 'Organisation', utilisation, total: usedDays }],
      byType,
      byMonth,
      calendar: approvedRequests.filter(req => new Date(req.endDate) >= new Date()).slice(0, 8),
    };
  }, [requests, balance]);

  const kpis = [
    { label: 'Taux Utilisation Global', value: `${analytics.utilisation}%`, trend: 'up', change: '', color: 'text-orange-600' },
    { label: 'Jours Pris (YTD)', value: `${analytics.usedDays}`, trend: 'up', change: '', color: 'text-blue-600' },
    { label: 'Demandes en Attente', value: `${analytics.pendingCount}`, trend: 'stable', change: `${analytics.pendingDays}j`, color: 'text-gray-600' },
    { label: 'Demandes Approuvees', value: `${analytics.approvedCount}`, trend: 'down', change: '', color: 'text-green-600' },
  ];

  return (
    <div className="p-6 bg-[#F5F7FA]">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Analytics Conges</h1>
        <p className="text-sm text-gray-600 mt-1">Vue d'ensemble reelle des demandes de conges</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-white border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-medium text-gray-500 uppercase">{kpi.label}</h3>
              {kpi.trend === 'up' ? (
                <TrendingUp className={`w-4 h-4 ${kpi.color}`} />
              ) : kpi.trend === 'down' ? (
                <TrendingUp className={`w-4 h-4 ${kpi.color} transform rotate-180`} />
              ) : null}
            </div>
            <p className="text-3xl font-semibold text-gray-900 mb-1">{kpi.value}</p>
            {kpi.change && <p className={`text-xs ${kpi.color}`}>{kpi.change}</p>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">Taux d'Utilisation Global</h3>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.globalUsage}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="departement" stroke="#6B7280" />
                <YAxis stroke="#6B7280" domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="utilisation" fill="#0A6ED1" name="Taux d'utilisation (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">Repartition par Type de Conge</h3>
          </div>
          <div className="p-6">
            {analytics.byType.length === 0 ? (
              <p className="text-sm text-gray-500">Aucune demande a afficher.</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.byType}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analytics.byType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-orange-600 mr-2" />
            <h3 className="text-base font-semibold text-gray-900">Periodes les Plus Chargees</h3>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {analytics.byMonth.slice(0, 4).map((periode) => (
              <div key={periode.periode} className="bg-orange-50 border border-orange-200 p-4">
                <p className="text-sm font-medium text-orange-900 mb-2">{periode.periode}</p>
                <p className="text-2xl font-semibold text-gray-900 mb-1">{periode.absences} jour(s)</p>
                <p className="text-xs text-orange-700">{periode.pourcentage}% du solde annuel</p>
                <div className="mt-3 w-full bg-orange-200 h-2">
                  <div className="bg-orange-600 h-2" style={{ width: `${periode.pourcentage}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center">
            <Calendar className="w-5 h-5 text-[#0A6ED1] mr-2" />
            <h3 className="text-base font-semibold text-gray-900">Calendrier Global des Absences a Venir</h3>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date Debut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employe</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duree</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {analytics.calendar.map((absence) => (
                <tr key={absence.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(absence.startDate).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{absence.employeeId}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800">
                      {absence.leaveTypeName}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {absence.requestedDays} jour{Number(absence.requestedDays) > 1 ? 's' : ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">Mode Observatoire Uniquement</h4>
        <p className="text-sm text-blue-800">
          Ces indicateurs utilisent les demandes reelles du service conges. La validation reste geree par l'espace RH.
        </p>
      </div>
    </div>
  );
}
