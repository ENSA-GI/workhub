import { useEffect, useState, useMemo } from 'react';
import { Users, DollarSign, TrendingUp, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useApi } from '@/lib/useApi';
import { useOrganizationId } from '@/lib/useOrganizationId';

const DEFAULT_ORG_ID = '550e8400-e29b-41d4-a716-446655440000';

interface Employee {
  id: string;
  firstName?: string;
  lastName?: string;
  personalEmail?: string;
  baseSalary?: number;
  departmentId?: string;
  positionId?: string;
  hireDate?: string;
  createdAt?: string;
}

interface Department {
  id: string;
  name: string;
}

interface LeaveRequest {
  id: string;
  employeeId: string;
  startDate: string;
  endDate: string;
  status: string;
  requestedDays?: number;
  leaveTypeName?: string;
}

interface Payroll {
  id: string;
  month: number;
  year: number;
  status: string;
  totalNetSalary?: number;
  totalGrossSalary?: number;
}

export default function DashboardOrgAdmin() {
  const apiFetch = useApi();
  const orgId = useOrganizationId() || DEFAULT_ORG_ID;

  const [orgName, setOrgName] = useState('TechVision SARL');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      try {
        const [orgRes, empRes, deptRes, leaveRes, payrollRes] = await Promise.all([
          apiFetch(`/org/orgs/${orgId}`).catch(() => null),
          apiFetch(`/employee/employees?organizationId=${orgId}&status=ACTIVE&size=200`).catch(() => null),
          apiFetch(`/org/orgs/${orgId}/departments?page=0&size=100`).catch(() => null),
          apiFetch(`/leave/leave-requests/all`).catch(() => null),
          apiFetch(`/payroll/payrolls?organizationId=${orgId}`).catch(() => null),
        ]);

        if (orgRes && orgRes.name) {
          setOrgName(orgRes.name);
        }
        if (empRes && empRes.content) {
          setEmployees(empRes.content);
        }
        if (deptRes && deptRes.content) {
          setDepartments(deptRes.content);
        }
        if (leaveRes) {
          setLeaves(Array.isArray(leaveRes) ? leaveRes : []);
        }
        if (payrollRes) {
          setPayrolls(Array.isArray(payrollRes) ? payrollRes : []);
        }
      } catch (err) {
        console.error('Error loading org admin dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    if (orgId) {
      loadDashboardData();
    }
  }, [orgId]);

  // Calculations
  const totalEmployees = employees.length;

  const basePayrollMass = useMemo(() => {
    return employees.reduce((sum, emp) => sum + Number(emp.baseSalary || 0), 0);
  }, [employees]);

  const latestPayroll = useMemo(() => {
    if (payrolls.length === 0) return null;
    return [...payrolls].sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    })[0];
  }, [payrolls]);

  const payrollValueStr = useMemo(() => {
    if (latestPayroll) {
      const amt = latestPayroll.totalNetSalary || latestPayroll.totalGrossSalary || basePayrollMass;
      return `MAD ${Number(amt).toLocaleString('fr-FR')}`;
    }
    return `MAD ${Number(basePayrollMass).toLocaleString('fr-FR')}`;
  }, [latestPayroll, basePayrollMass]);

  const payrollChangeStr = useMemo(() => {
    if (latestPayroll) {
      const monthNames = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
      const monthLabel = monthNames[latestPayroll.month - 1] || `${latestPayroll.month}`;
      return `${monthLabel} ${latestPayroll.year} (${latestPayroll.status})`;
    }
    return 'Masse salariale mensuelle de base';
  }, [latestPayroll]);

  const activeLeaves = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return leaves.filter(req => {
      if (req.status !== 'APPROVED') return false;
      const start = new Date(req.startDate);
      const end = new Date(req.endDate);
      end.setHours(23, 59, 59, 999);
      return today >= start && today <= end;
    });
  }, [leaves]);

  const pendingLeaves = useMemo(() => {
    return leaves.filter(req => req.status === 'PENDING');
  }, [leaves]);

  const presenceRate = useMemo(() => {
    if (totalEmployees === 0) return 100;
    const rate = Math.round((1 - activeLeaves.length / totalEmployees) * 100);
    return Math.max(0, Math.min(100, rate));
  }, [totalEmployees, activeLeaves]);

  const kpiData = [
    { title: 'Effectif Total', value: `${totalEmployees}`, change: `Actifs dans l'organisation`, icon: Users, color: 'text-[#0A6ED1]' },
    { title: 'Masse Salariale', value: payrollValueStr, change: payrollChangeStr, icon: DollarSign, color: 'text-green-600' },
    { title: 'Taux de Présence', value: `${presenceRate}%`, change: `${activeLeaves.length} en congé aujourd'hui`, icon: TrendingUp, color: 'text-purple-600' },
    { title: 'Congés en Cours', value: `${activeLeaves.length}`, change: `${pendingLeaves.length} en attente`, icon: Calendar, color: 'text-orange-600' },
  ];

  // Department distribution
  const departmentData = useMemo(() => {
    const deptCounts: Record<string, number> = {};
    employees.forEach(emp => {
      const dId = emp.departmentId;
      if (dId) {
        deptCounts[dId] = (deptCounts[dId] || 0) + 1;
      }
    });

    const list = departments.map(dept => ({
      id: dept.id,
      name: dept.name,
      employees: deptCounts[dept.id] || 0
    })).filter(d => d.employees > 0);

    if (list.length === 0) {
      // Fallback using employees categories or raw names if no departments returned
      return [
        { id: 'dept-it', name: 'IT', employees: employees.filter(e => e.departmentId === 'dept-it').length || 0 },
        { id: 'dept-ventes', name: 'Ventes', employees: employees.filter(e => e.departmentId === 'dept-ventes').length || 0 },
        { id: 'dept-marketing', name: 'Marketing', employees: employees.filter(e => e.departmentId === 'dept-marketing').length || 0 },
        { id: 'dept-rh', name: 'RH', employees: employees.filter(e => e.departmentId === 'dept-rh').length || 0 },
        { id: 'dept-finance', name: 'Finance', employees: employees.filter(e => e.departmentId === 'dept-finance').length || 0 },
      ].filter(d => d.employees > 0);
    }
    return list;
  }, [departments, employees]);

  // Recent Activities
  const recentActivities = useMemo(() => {
    const activities: { action: string; detail: string; time: string }[] = [];

    // 1. Latest employee hired
    const sortedEmps = [...employees].sort((a, b) => {
      const dateA = new Date(a.createdAt || a.hireDate || 0);
      const dateB = new Date(b.createdAt || b.hireDate || 0);
      return dateB.getTime() - dateA.getTime();
    });
    if (sortedEmps.length > 0) {
      const latestEmp = sortedEmps[0];
      const name = `${latestEmp.firstName || ''} ${latestEmp.lastName || latestEmp.personalEmail || ''}`.trim();
      const hireDateStr = latestEmp.hireDate ? new Date(latestEmp.hireDate).toLocaleDateString('fr-FR') : 'récemment';
      activities.push({
        action: 'Nouvel employé',
        detail: `${name} (Rejoint le ${hireDateStr})`,
        time: 'Récent'
      });
    }

    // 2. Latest payroll validation
    if (latestPayroll) {
      const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
      const monthLabel = monthNames[latestPayroll.month - 1] || `${latestPayroll.month}`;
      activities.push({
        action: `Paie ${latestPayroll.status === 'PAID' ? 'payée' : latestPayroll.status === 'VALIDATED' ? 'validée' : 'générée'}`,
        detail: `${monthLabel} ${latestPayroll.year} - ${totalEmployees} employés`,
        time: 'Période active'
      });
    } else {
      activities.push({
        action: 'Configuration de paie',
        detail: 'Grille salariale de l\'organisation active',
        time: 'Actif'
      });
    }

    // 3. Latest approved leave
    const approvedLeavesList = leaves.filter(req => req.status === 'APPROVED').sort((a, b) => {
      return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    });
    if (approvedLeavesList.length > 0) {
      const latestLeave = approvedLeavesList[0];
      const emp = employees.find(e => e.id === latestLeave.employeeId);
      const name = emp ? `${emp.firstName || ''} ${emp.lastName || ''}`.trim() : 'Employé';
      activities.push({
        action: 'Congé approuvé',
        detail: `${name} - ${latestLeave.requestedDays || 0} jours (${latestLeave.leaveTypeName || 'Congé'})`,
        time: `Début: ${new Date(latestLeave.startDate).toLocaleDateString('fr-FR')}`
      });
    }

    // 4. Latest pending leave request
    const pendingLeavesList = leaves.filter(req => req.status === 'PENDING').sort((a, b) => {
      return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    });
    if (pendingLeavesList.length > 0) {
      const latestPending = pendingLeavesList[0];
      const emp = employees.find(e => e.id === latestPending.employeeId);
      const name = emp ? `${emp.firstName || ''} ${emp.lastName || ''}`.trim() : 'Employé';
      activities.push({
        action: 'Congé en attente',
        detail: `${name} demande ${latestPending.requestedDays || 0} jours (${latestPending.leaveTypeName || 'Congé'})`,
        time: 'En attente'
      });
    } else {
      activities.push({
        action: 'Absences gérées',
        detail: 'Toutes les demandes de congé sont traitées',
        time: 'À jour'
      });
    }

    // Fill up to 4 items with defaults if needed
    while (activities.length < 4) {
      activities.push({
        action: 'Système',
        detail: 'Pas d\'autres activités récentes',
        time: 'Maintenant'
      });
    }

    return activities.slice(0, 4);
  }, [employees, latestPayroll, leaves, totalEmployees]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-[#F5F7FA]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0A6ED1] mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-[#F5F7FA]">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Tableau de Bord - {orgName}</h1>
        <p className="text-sm text-gray-600 mt-1">Vue d'ensemble en temps réel de votre organisation</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {kpiData.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.title} className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <Icon className={`w-6 h-6 ${kpi.color}`} />
              </div>
              <h3 className="text-xs font-medium text-gray-500 uppercase mb-2">{kpi.title}</h3>
              <p className="text-3xl font-semibold text-gray-900 mb-1">{kpi.value}</p>
              <p className="text-xs text-gray-600">{kpi.change}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Effectifs par Département */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">Effectifs par Département</h3>
          </div>
          <div className="p-6">
            {departmentData.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-12">Aucun effectif par département.</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={departmentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip />
                  <Bar dataKey="employees" fill="#0A6ED1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Activités Récentes */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">Activités Récentes</h3>
          </div>
          <div className="p-4 space-y-3">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start pb-3 border-b border-gray-100 last:border-0">
                <div className="w-2 h-2 bg-[#0A6ED1] rounded-full mt-2 mr-3"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-600">{activity.detail}</p>
                </div>
                <span className="text-xs text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
