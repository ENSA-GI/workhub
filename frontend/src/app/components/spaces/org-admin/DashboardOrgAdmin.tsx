import { Users, DollarSign, Building2, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useOrganizationId } from '@/lib/useOrganizationId';
import { useOrgDashboard, useDepartments } from '@/lib/useOrg';

export default function DashboardOrgAdmin() {
  const organizationId = useOrganizationId();
  const { data: dashboard } = useOrgDashboard(organizationId);
  const { data: depts } = useDepartments(organizationId);

  const kpiData = [
    {
      title: 'Départements actifs',
      value: String(dashboard?.activeDepartmentsCount ?? 0),
      icon: Building2,
      color: 'text-[#0A6ED1]',
    },
    {
      title: 'Postes actifs',
      value: String(dashboard?.activePositionsCount ?? 0),
      icon: Users,
      color: 'text-green-600',
    },
    {
      title: 'Employés',
      value: String(dashboard?.employeeCount ?? '—'),
      icon: DollarSign,
      color: 'text-purple-600',
    },
    {
      title: 'RH Managers',
      value: String(dashboard?.rhManagerCount ?? '—'),
      icon: UserCheck,
      color: 'text-orange-600',
    },
  ];

  return (
    <div className="p-6 bg-[#F5F7FA]">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Tableau de bord organisation</h1>
          <p className="text-sm text-gray-600 mt-1">Vue d'ensemble — données API</p>
        </div>
        <Link
          to="/onboarding"
          className="px-4 py-2 bg-[#0A6ED1] text-white text-sm rounded hover:bg-[#0959b0]"
        >
          Assistant configuration
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {kpiData.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.title} className="bg-white border border-gray-200 p-6">
              <Icon className={`w-6 h-6 ${kpi.color} mb-4`} />
              <h3 className="text-xs font-medium text-gray-500 uppercase mb-2">{kpi.title}</h3>
              <p className="text-3xl font-semibold text-gray-900">{kpi.value}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-white border border-gray-200 p-6">
        <h3 className="text-base font-semibold mb-4">Départements</h3>
        <ul className="space-y-2">
          {(depts?.content ?? []).map((d) => (
            <li key={d.id} className="flex justify-between text-sm border-b pb-2">
              <span>{d.name}</span>
              <span className="text-gray-500">{d.active ? 'Actif' : 'Inactif'}</span>
            </li>
          ))}
          {(depts?.content?.length ?? 0) === 0 && (
            <li className="text-gray-500 text-sm">
              Aucun département — lancez l&apos;
              <Link to="/onboarding" className="text-[#0A6ED1] underline">
                assistant configuration
              </Link>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
