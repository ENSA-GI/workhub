import { Calendar, TrendingUp, AlertTriangle, Search, Filter } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';

const API_BASE = 'http://localhost:8080';
const DEMO_EMPLOYEE_ID = '111e8400-e29b-41d4-a716-446655440000';
const DEMO_EMPLOYEE_NAMES: Record<string, string> = {
  '111e8400-e29b-41d4-a716-446655440000': 'Mohammed Alami',
};

interface LeaveRequest {
  id: string;
  employeeId: string;
  leaveTypeName: string;
  startDate: string;
  endDate: string;
  requestedDays: number;
  reason: string;
  status: string;
  employeeName?: string;
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
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [periodFilter, setPeriodFilter] = useState('upcoming');

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

  const getEmployeeName = (request: LeaveRequest) =>
    request.employeeName || DEMO_EMPLOYEE_NAMES[request.employeeId] || 'Employe non reference';

  const typeOptions = useMemo(
    () => Array.from(new Set(requests.map(req => req.leaveTypeName))).sort(),
    [requests]
  );

  const filteredRequests = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return requests.filter(req => {
      const query = searchTerm.trim().toLowerCase();
      const employeeName = getEmployeeName(req).toLowerCase();
      const startDate = new Date(req.startDate);
      const endDate = new Date(req.endDate);
      endDate.setHours(23, 59, 59, 999);

      const matchesSearch = !query ||
        employeeName.includes(query) ||
        req.leaveTypeName.toLowerCase().includes(query) ||
        req.reason.toLowerCase().includes(query);
      const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
      const matchesType = typeFilter === 'all' || req.leaveTypeName === typeFilter;
      const matchesPeriod =
        periodFilter === 'all' ||
        (periodFilter === 'upcoming' && startDate > today) ||
        (periodFilter === 'current' && startDate <= today && endDate >= today) ||
        (periodFilter === 'past' && endDate < today);

      return matchesSearch && matchesStatus && matchesType && matchesPeriod;
    });
  }, [requests, searchTerm, statusFilter, typeFilter, periodFilter]);

  const analytics = useMemo(() => {
    const activeRequests = filteredRequests.filter(req => req.status !== 'CANCELLED');
    const approvedRequests = filteredRequests.filter(req => req.status === 'APPROVED');
    const pendingRequests = filteredRequests.filter(req => req.status === 'PENDING');
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
      calendar: activeRequests.slice(0, 12),
    };
  }, [filteredRequests, balance]);

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

      <div className="bg-white border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]"
              placeholder="Rechercher employe, type, motif..."
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]"
          >
            <option value="all">Tous les statuts</option>
            <option value="PENDING">En attente</option>
            <option value="APPROVED">Approuvee</option>
            <option value="REJECTED">Refusee</option>
            <option value="CANCELLED">Annulee</option>
          </select>
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]"
          >
            <option value="all">Tous les types</option>
            {typeOptions.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          {[
            { value: 'all', label: 'Toutes les periodes' },
            { value: 'upcoming', label: 'A venir' },
            { value: 'current', label: 'En cours' },
            { value: 'past', label: 'Passees' },
          ].map(option => (
            <button
              key={option.value}
              type="button"
              onClick={() => setPeriodFilter(option.value)}
              className={`px-3 py-1 text-xs rounded-full border ${
                periodFilter === option.value
                  ? 'bg-[#0A6ED1] text-white border-[#0A6ED1]'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
              }`}
            >
              {option.label}
            </button>
          ))}
          <span className="ml-auto text-xs text-gray-500">{filteredRequests.length} resultat(s)</span>
        </div>
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
            <h3 className="text-base font-semibold text-gray-900">Calendrier Global des Absences</h3>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {analytics.calendar.map((absence) => (
                <tr key={absence.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(absence.startDate).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{getEmployeeName(absence)}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800">
                      {absence.leaveTypeName}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {absence.requestedDays} jour{Number(absence.requestedDays) > 1 ? 's' : ''}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs rounded ${
                      absence.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                      absence.status === 'PENDING' ? 'bg-orange-100 text-orange-800' :
                      absence.status === 'CANCELLED' ? 'bg-gray-100 text-gray-700' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {absence.status === 'APPROVED' ? 'Approuvee' :
                        absence.status === 'PENDING' ? 'En attente' :
                        absence.status === 'CANCELLED' ? 'Annulee' : 'Refusee'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {analytics.calendar.length === 0 && (
            <div className="py-10 text-center text-sm text-gray-500">Aucune absence ne correspond aux filtres.</div>
          )}
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
