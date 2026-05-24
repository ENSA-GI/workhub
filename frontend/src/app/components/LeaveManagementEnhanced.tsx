import { useState, useEffect } from 'react';
import { Plus, Check, X, Clock, Download } from 'lucide-react';
import LeaveRequestForm from './LeaveRequestForm';
import NotificationToast from './NotificationToast';
import { exportToCSV } from '../utils/dataManager';

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

const initialLeaveRequests: LeaveRequest[] = [
  { id: 1, employee: 'Michael Chen', type: 'Annual Leave', startDate: '2026-05-15', endDate: '2026-05-20', days: 5, status: 'Pending', reason: 'Family vacation', appliedOn: '2026-04-10' },
  { id: 2, employee: 'Sarah Johnson', type: 'Sick Leave', startDate: '2026-05-08', endDate: '2026-05-09', days: 2, status: 'Approved', reason: 'Medical appointment', appliedOn: '2026-05-05' },
  { id: 3, employee: 'Emily Rodriguez', type: 'Annual Leave', startDate: '2026-06-01', endDate: '2026-06-05', days: 5, status: 'Pending', reason: 'Personal travel', appliedOn: '2026-04-18' },
  { id: 4, employee: 'Alex Martinez', type: 'Parental Leave', startDate: '2026-07-01', endDate: '2026-08-01', days: 31, status: 'Approved', reason: 'New baby', appliedOn: '2026-04-01' },
  { id: 5, employee: 'David Kim', type: 'Annual Leave', startDate: '2026-05-22', endDate: '2026-05-24', days: 3, status: 'Rejected', reason: 'Extended weekend', appliedOn: '2026-04-15' },
];

interface LeaveManagementEnhancedProps {
  userRole?: string;
}

export default function LeaveManagementEnhanced({ userRole }: LeaveManagementEnhancedProps) {
  const [view, setView] = useState<'calendar' | 'requests'>('requests');
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info'; visible: boolean }>({
    message: '',
    type: 'success',
    visible: false,
  });

  const rhId = '550e8400-e29b-41d4-a716-446655440000'; // ID Fictif pour le manager

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await fetch(`http://localhost:8080/leave/leave-requests/pending`, {
          headers: { 'Accept': 'application/json' }
        });
        if (res.ok) {
          const data = await res.json();
          const mapped = data.map((d: any) => ({
            id: d.id,
            employee: d.employeeName || 'Employé Fictif',
            type: d.leaveTypeName || 'Congé',
            startDate: d.startDate,
            endDate: d.endDate,
            days: d.requestedDays,
            status: 'Pending',
            reason: d.reason || '',
            appliedOn: d.createdAt || d.startDate
          }));
          setLeaveRequests(mapped);
        }
      } catch (err) {
        console.error('Erreur fetch pending leaves:', err);
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
        body: JSON.stringify({ decision: 'APPROVED', comment: 'Approuvé via UI', reviewedBy: rhId })
      });
      if(res.ok) {
        setLeaveRequests(prev => prev.filter(req => req.id !== id));
        showNotification('Demande de congé approuvée', 'success');
      }
    } catch(err) { console.error(err); }
  };

  const handleReject = async (id: string | number) => {
    try {
      const res = await fetch(`http://localhost:8080/leave/leave-requests/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision: 'REJECTED', comment: 'Rejeté via UI', reviewedBy: rhId })
      });
      if(res.ok) {
        setLeaveRequests(prev => prev.filter(req => req.id !== id));
        showNotification('Demande de congé rejetée', 'info');
      }
    } catch(err) { console.error(err); }
  };

  const handleSaveRequest = (requestData: Partial<LeaveRequest>) => {
    showNotification("Utilisez l'interface employé pour créer une demande.", 'info');
  };

  const handleExport = () => {
    exportToCSV(leaveRequests, 'leave_requests');
    showNotification('Demandes de congé exportées avec succès', 'success');
  };

  const employees = Array.from(new Set(leaveRequests.map(req => req.employee)));

  const pendingCount = leaveRequests.filter(req => req.status === 'Pending').length;
  const approvedThisMonth = leaveRequests.filter(req => {
    const reqDate = new Date(req.appliedOn);
    const now = new Date();
    return req.status === 'Approved' && reqDate.getMonth() === now.getMonth();
  }).length;

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
          <h1 className="text-2xl font-semibold text-gray-900">Gestion des Congés</h1>
          <p className="text-sm text-gray-600 mt-1">Examiner et gérer les demandes de congé des employés</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleExport}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Exporter
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
              <h3 className="text-base font-semibold text-gray-900">Demandes de Congé</h3>
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

            {view === 'requests' ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employé</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durée</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jours</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {leaveRequests.map((request) => (
                      <tr key={request.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-[#0A6ED1] flex items-center justify-center text-white text-sm mr-3">
                              {request.employee.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{request.employee}</p>
                              <p className="text-xs text-gray-500">{request.reason}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{request.type}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(request.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(request.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{request.days}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-1 text-xs rounded ${
                            request.status === 'Approved' ? 'bg-green-100 text-green-800' :
                            request.status === 'Pending' ? 'bg-orange-100 text-orange-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {request.status === 'Pending' && <Clock className="w-3 h-3 mr-1" />}
                            {request.status === 'Approved' && <Check className="w-3 h-3 mr-1" />}
                            {request.status === 'Rejected' && <X className="w-3 h-3 mr-1" />}
                            {request.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {request.status === 'Pending' && (
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => handleApprove(request.id)}
                                className="p-1 hover:bg-green-50 rounded text-green-600"
                                title="Approve"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleReject(request.id)}
                                className="p-1 hover:bg-red-50 rounded text-red-600"
                                title="Reject"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6">
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="text-center text-xs font-medium text-gray-600 py-2">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: 35 }, (_, i) => {
                    const day = i - 2;
                    const currentDate = new Date(2026, 3, day);
                    const hasLeave = leaveRequests.some(req => {
                      const start = new Date(req.startDate);
                      const end = new Date(req.endDate);
                      return currentDate >= start && currentDate <= end && req.status === 'Approved';
                    });
                    return (
                      <div
                        key={i}
                        className={`aspect-square flex items-center justify-center text-sm rounded cursor-pointer ${
                          day < 1 ? 'text-gray-300' :
                          hasLeave ? 'bg-orange-100 text-orange-800 font-medium' :
                          'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {day > 0 ? day : ''}
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 flex items-center space-x-4 text-xs">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-orange-100 rounded mr-2"></div>
                    <span className="text-gray-600">Congé planifié</span>
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
                  <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${(pendingCount / leaveRequests.length) * 100}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">Approuvées ce Mois</span>
                  <span className="text-sm font-medium text-gray-900">{approvedThisMonth}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(approvedThisMonth / leaveRequests.length) * 100}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">Moyenne Jours/Demande</span>
                  <span className="text-sm font-medium text-gray-900">
                    {(leaveRequests.reduce((sum, req) => sum + req.days, 0) / leaveRequests.length).toFixed(1)}
                  </span>
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
