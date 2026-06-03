import { useMemo, useState, useEffect } from 'react';
import { Plus, Check, X, Clock, Download, Search, Filter, ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import LeaveRequestForm from './LeaveRequestForm';
import NotificationToast from './NotificationToast';
import { useOrganizationId } from '@/lib/useOrganizationId';

interface LeaveRequest {
  id: string | number;
  employee: string;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  status: string;
  reason: string;
  appliedOn: string;
}

interface LeaveManagementEnhancedProps {
  userRole?: string;
}

interface EmployeeRecord {
  id: string;
  cin?: string;
  personalEmail?: string;
}

const DEMO_EMPLOYEE_NAMES: Record<string, string> = {
  '111e8400-e29b-41d4-a716-446655440000': 'Mohammed Alami',
};

const STATUS_LABELS: Record<string, string> = {
  Pending: 'En attente',
  Approved: 'Approuvee',
  Rejected: 'Refusee',
  Cancelled: 'Annulee',
};

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tous les statuts' },
  { value: 'Pending', label: 'En attente' },
  { value: 'Approved', label: 'Approuvee' },
  { value: 'Rejected', label: 'Refusee' },
  { value: 'Cancelled', label: 'Annulee' },
];

const WEEK_DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

function mapStatus(status: string) {
  if (status === 'PENDING') return 'Pending';
  if (status === 'APPROVED') return 'Approved';
  if (status === 'REJECTED') return 'Rejected';
  if (status === 'CANCELLED') return 'Cancelled';
  return status;
}

function titleCase(value: string) {
  return value
    .split(/[.\s_-]+/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

function employeeDisplayName(employee?: EmployeeRecord) {
  if (!employee) return '';
  if (employee.personalEmail) {
    return titleCase(employee.personalEmail.split('@')[0]);
  }
  return employee.cin || '';
}

function formatDate(raw: string) {
  return new Date(raw).toLocaleDateString('fr-FR');
}

function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isDateInRequest(date: Date, request: LeaveRequest) {
  const start = new Date(request.startDate);
  const end = new Date(request.endDate);
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  return date >= start && date <= end;
}

function getMonthDays(monthDate: Date) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const firstMondayOffset = (firstDay.getDay() + 6) % 7;
  const gridStart = new Date(year, month, 1 - firstMondayOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    return date;
  });
}

export default function LeaveManagementEnhanced({ userRole }: LeaveManagementEnhancedProps) {
  const organizationId = useOrganizationId();
  const [view, setView] = useState<'calendar' | 'requests'>('requests');
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info'; visible: boolean }>({
    message: '',
    type: 'success',
    visible: false,
  });

  const rhId = '550e8400-e29b-41d4-a716-446655440000';

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const [res, employeesRes] = await Promise.all([
          fetch('http://localhost:8080/leave/leave-requests/all', {
            headers: { Accept: 'application/json' },
          }),
          fetch(`/employee/employees?organizationId=${organizationId}&status=ACTIVE&size=200`, {
            headers: { Accept: 'application/json' },
          }),
        ]);

        let employeeNames = new Map<string, string>();
        if (employeesRes.ok) {
          const employeesPage = await employeesRes.json();
          const employees: EmployeeRecord[] = Array.isArray(employeesPage?.content) ? employeesPage.content : [];
          employeeNames = new Map(employees.map(employee => [employee.id, employeeDisplayName(employee)]));
        }

        if (res.ok) {
          const data = await res.json();
          const mapped = data.map((d: any) => ({
            id: d.id,
            employee: d.employeeName || employeeNames.get(d.employeeId) || DEMO_EMPLOYEE_NAMES[d.employeeId] || 'Employe non reference',
            type: d.leaveTypeName || 'Conge',
            startDate: d.startDate,
            endDate: d.endDate,
            days: Number(d.requestedDays || 0),
            status: mapStatus(d.status),
            reason: d.reason || '',
            appliedOn: d.createdAt || d.startDate,
          }));
          setLeaveRequests(mapped);
        }
      } catch (err) {
        console.error('Erreur fetch leaves:', err);
      }
    };
    fetchRequests();
  }, []);

  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ message, type, visible: true });
  };

  const handleApprove = async (id: string | number) => {
    try {
      const res = await fetch(`http://localhost:8080/leave/leave-requests/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision: 'APPROVED', comment: 'Approuve via UI', reviewedBy: rhId }),
      });
      if (res.ok) {
        setLeaveRequests(prev => prev.map(req => req.id === id ? { ...req, status: 'Approved' } : req));
        showNotification('Demande de conge approuvee', 'success');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (id: string | number) => {
    try {
      const res = await fetch(`http://localhost:8080/leave/leave-requests/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision: 'REJECTED', comment: 'Rejete via UI', reviewedBy: rhId }),
      });
      if (res.ok) {
        setLeaveRequests(prev => prev.map(req => req.id === id ? { ...req, status: 'Rejected' } : req));
        showNotification('Demande de conge rejetee', 'info');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveRequest = () => {
    showNotification("Utilisez l'interface employe pour creer une demande.", 'info');
  };

  const types = useMemo(() => Array.from(new Set(leaveRequests.map(req => req.type))).sort(), [leaveRequests]);

  const filteredRequests = useMemo(() => {
    const today = startOfToday();
    return leaveRequests.filter(req => {
      const query = searchTerm.trim().toLowerCase();
      const matchesSearch = !query ||
        req.employee.toLowerCase().includes(query) ||
        req.type.toLowerCase().includes(query) ||
        req.reason.toLowerCase().includes(query) ||
        String(req.id).toLowerCase().includes(query);

      const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
      const matchesType = typeFilter === 'all' || req.type === typeFilter;

      const start = new Date(req.startDate);
      const end = new Date(req.endDate);
      end.setHours(23, 59, 59, 999);
      const matchesDate =
        dateFilter === 'all' ||
        (dateFilter === 'upcoming' && start > today) ||
        (dateFilter === 'current' && start <= today && end >= today) ||
        (dateFilter === 'past' && end < today);

      return matchesSearch && matchesStatus && matchesType && matchesDate;
    });
  }, [leaveRequests, searchTerm, statusFilter, typeFilter, dateFilter]);

  const calendarRequests = useMemo(
    () => filteredRequests.filter(req => req.status === 'Approved' || req.status === 'Pending'),
    [filteredRequests],
  );

  const selectedDayRequests = useMemo(
    () => calendarRequests.filter(req => isDateInRequest(selectedDate, req)),
    [calendarRequests, selectedDate],
  );

  const calendarDays = useMemo(() => getMonthDays(calendarMonth), [calendarMonth]);
  const employees = Array.from(new Set(leaveRequests.map(req => req.employee)));

  const pendingCount = leaveRequests.filter(req => req.status === 'Pending').length;
  const approvedCount = leaveRequests.filter(req => req.status === 'Approved').length;
  const cancelledCount = leaveRequests.filter(req => req.status === 'Cancelled').length;
  const totalRequests = leaveRequests.length;
  const averageDays = totalRequests > 0
    ? (leaveRequests.reduce((sum, req) => sum + Number(req.days || 0), 0) / totalRequests).toFixed(1)
    : '0.0';

  const handleExport = () => {
    const rows = filteredRequests.map(req => `
      <tr>
        <td>${req.employee}</td>
        <td>${req.type}</td>
        <td>${formatDate(req.startDate)} - ${formatDate(req.endDate)}</td>
        <td>${req.days}</td>
        <td>${STATUS_LABELS[req.status] || req.status}</td>
        <td>${req.reason || ''}</td>
      </tr>
    `).join('');
    const printable = window.open('', '_blank');
    if (!printable) {
      showNotification('Impossible d ouvrir la fenetre PDF', 'error');
      return;
    }
    printable.document.write(`
      <html>
        <head>
          <title>Demandes de conges</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #111827; }
            h1 { font-size: 22px; margin-bottom: 4px; }
            p { color: #4b5563; margin-top: 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
            th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; }
            th { background: #f3f4f6; }
          </style>
        </head>
        <body>
          <h1>Rapport des demandes de conges</h1>
          <p>Export PDF genere le ${new Date().toLocaleString('fr-FR')}</p>
          <table>
            <thead>
              <tr>
                <th>Employe</th><th>Type</th><th>Periode</th><th>Jours</th><th>Statut</th><th>Motif</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </body>
      </html>
    `);
    printable.document.close();
    printable.focus();
    printable.print();
    showNotification('Export PDF pret', 'success');
  };

  return (
    <div className="p-6">
      <NotificationToast
        message={notification.message}
        type={notification.type}
        isVisible={notification.visible}
        onClose={() => setNotification({ ...notification, visible: false })}
      />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Gestion des Conges</h1>
          <p className="text-sm text-gray-600 mt-1">Examiner et gerer les demandes de conge des employes</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleExport}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </button>
          {userRole !== 'rh-manager' && (
            <button
              onClick={() => setIsFormOpen(true)}
              className="px-4 py-2 bg-[#0A6ED1] text-white rounded hover:bg-[#0959b0] flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle Demande
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded border border-gray-200">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">Demandes de Conge</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => setView('requests')}
                  className={`px-3 py-1 text-sm rounded ${view === 'requests' ? 'bg-[#0A6ED1] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  Demandes
                </button>
                <button
                  onClick={() => setView('calendar')}
                  className={`px-3 py-1 text-sm rounded ${view === 'calendar' ? 'bg-[#0A6ED1] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  Calendrier
                </button>
              </div>
            </div>

            <div className="p-4 border-b border-gray-200 bg-gray-50">
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
                  {STATUS_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                <select
                  value={typeFilter}
                  onChange={e => setTypeFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]"
                >
                  <option value="all">Tous les types</option>
                  {types.map(type => (
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
                    onClick={() => setDateFilter(option.value)}
                    className={`px-3 py-1 text-xs rounded-full border ${
                      dateFilter === option.value
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

            {view === 'requests' ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employe</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duree</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jours</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredRequests.map((request) => (
                      <tr key={request.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-[#0A6ED1] flex items-center justify-center text-white text-sm mr-3">
                              {request.employee.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{request.employee}</p>
                              <p className="text-xs text-gray-500">{request.reason}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{request.type}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {formatDate(request.startDate)} - {formatDate(request.endDate)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{request.days}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-1 text-xs rounded ${
                            request.status === 'Approved' ? 'bg-green-100 text-green-800' :
                            request.status === 'Pending' ? 'bg-orange-100 text-orange-800' :
                            request.status === 'Cancelled' ? 'bg-gray-100 text-gray-700' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {request.status === 'Pending' && <Clock className="w-3 h-3 mr-1" />}
                            {request.status === 'Approved' && <Check className="w-3 h-3 mr-1" />}
                            {request.status === 'Rejected' && <X className="w-3 h-3 mr-1" />}
                            {STATUS_LABELS[request.status] || request.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {request.status === 'Pending' && (
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => handleApprove(request.id)}
                                className="p-1 hover:bg-green-50 rounded text-green-600"
                                title="Approuver"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleReject(request.id)}
                                className="p-1 hover:bg-red-50 rounded text-red-600"
                                title="Refuser"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                          {request.status !== 'Pending' && (
                            <span className="text-xs text-gray-400">Aucune action</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredRequests.length === 0 && (
                  <div className="py-12 text-center text-sm text-gray-500">Aucune demande ne correspond aux filtres.</div>
                )}
              </div>
            ) : (
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">
                      {calendarMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                    </h4>
                    <p className="text-xs text-gray-500">Demandes approuvees et en attente selon les filtres actifs</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                      className="p-2 border border-gray-300 rounded hover:bg-gray-50"
                      title="Mois precedent"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        const today = new Date();
                        setCalendarMonth(today);
                        setSelectedDate(today);
                      }}
                      className="px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50"
                    >
                      Aujourd'hui
                    </button>
                    <button
                      onClick={() => setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                      className="p-2 border border-gray-300 rounded hover:bg-gray-50"
                      title="Mois suivant"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-5">
                  <div className="border border-gray-200 rounded overflow-hidden">
                    <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
                      {WEEK_DAYS.map(day => (
                        <div key={day} className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                          {day}
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7">
                      {calendarDays.map(date => {
                        const dayRequests = calendarRequests.filter(req => isDateInRequest(date, req));
                        const isCurrentMonth = date.getMonth() === calendarMonth.getMonth();
                        const isSelected = isSameDay(date, selectedDate);
                        const hasApproved = dayRequests.some(req => req.status === 'Approved');
                        const hasPending = dayRequests.some(req => req.status === 'Pending');

                        return (
                          <button
                            key={date.toISOString()}
                            onClick={() => setSelectedDate(date)}
                            className={`min-h-[92px] border-r border-b border-gray-200 p-2 text-left hover:bg-blue-50 transition-colors ${
                              isCurrentMonth ? 'bg-white' : 'bg-gray-50 text-gray-400'
                            } ${isSelected ? 'ring-2 ring-[#0A6ED1] ring-inset' : ''}`}
                          >
                            <div className="flex items-center justify-between">
                              <span className={`text-sm font-medium ${isSameDay(date, new Date()) ? 'text-[#0A6ED1]' : ''}`}>
                                {date.getDate()}
                              </span>
                              {dayRequests.length > 0 && (
                                <span className="text-[11px] text-gray-500">{dayRequests.length}</span>
                              )}
                            </div>
                            <div className="mt-2 space-y-1">
                              {dayRequests.slice(0, 2).map(req => (
                                <div
                                  key={`${date.toISOString()}-${req.id}`}
                                  className={`truncate rounded px-2 py-1 text-[11px] ${
                                    req.status === 'Approved'
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-orange-100 text-orange-800'
                                  }`}
                                  title={`${req.employee} - ${req.type}`}
                                >
                                  {req.employee}
                                </div>
                              ))}
                              {dayRequests.length > 2 && (
                                <div className="text-[11px] text-gray-500">+{dayRequests.length - 2} autre(s)</div>
                              )}
                              <div className="flex gap-1 pt-1">
                                {hasApproved && <span className="w-2 h-2 rounded-full bg-green-500" />}
                                {hasPending && <span className="w-2 h-2 rounded-full bg-orange-500" />}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <CalendarDays className="w-4 h-4 text-[#0A6ED1]" />
                      <h4 className="text-sm font-semibold text-gray-900">{formatDate(selectedDate.toISOString())}</h4>
                    </div>
                    <div className="space-y-3">
                      {selectedDayRequests.length === 0 && (
                        <p className="text-sm text-gray-500">Aucune absence pour cette date.</p>
                      )}
                      {selectedDayRequests.map(req => (
                        <div key={req.id} className="border border-gray-200 rounded p-3">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-medium text-gray-900 truncate">{req.employee}</p>
                            <span className={`text-[11px] px-2 py-1 rounded ${
                              req.status === 'Approved' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                            }`}>
                              {STATUS_LABELS[req.status]}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">{req.type} - {req.days} jour(s)</p>
                          <p className="text-xs text-gray-500 mt-1">{formatDate(req.startDate)} - {formatDate(req.endDate)}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex items-center gap-4 text-xs text-gray-600">
                      <span className="inline-flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500" />Approuvee</span>
                      <span className="inline-flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-orange-500" />En attente</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded border border-gray-200 p-6 mb-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Statistiques</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">Demandes en Attente</span>
                  <span className="text-sm font-medium text-gray-900">{pendingCount}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${totalRequests ? (pendingCount / totalRequests) * 100 : 0}%` }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">Approuvees</span>
                  <span className="text-sm font-medium text-gray-900">{approvedCount}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${totalRequests ? (approvedCount / totalRequests) * 100 : 0}%` }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">Moyenne Jours/Demande</span>
                  <span className="text-sm font-medium text-gray-900">{averageDays}</span>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">Annulees</span>
                  <span className="text-sm font-medium text-gray-900">{cancelledCount}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gray-500 h-2 rounded-full" style={{ width: `${totalRequests ? (cancelledCount / totalRequests) * 100 : 0}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {userRole !== 'rh-manager' && (
        <LeaveRequestForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSave={handleSaveRequest}
          employees={employees}
        />
      )}
    </div>
  );
}
