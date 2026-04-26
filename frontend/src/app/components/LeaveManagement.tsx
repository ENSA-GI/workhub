import { useState } from 'react';
import { Plus, Check, X, Clock } from 'lucide-react';

export default function LeaveManagement() {
  const [view, setView] = useState<'calendar' | 'requests'>('requests');

  const leaveRequests = [
    { id: 1, employee: 'Michael Chen', type: 'Annual Leave', startDate: '2026-05-15', endDate: '2026-05-20', days: 5, status: 'Pending', reason: 'Family vacation', appliedOn: '2026-04-10' },
    { id: 2, employee: 'Sarah Johnson', type: 'Sick Leave', startDate: '2026-05-08', endDate: '2026-05-09', days: 2, status: 'Approved', reason: 'Medical appointment', appliedOn: '2026-05-05' },
    { id: 3, employee: 'Emily Rodriguez', type: 'Annual Leave', startDate: '2026-06-01', endDate: '2026-06-05', days: 5, status: 'Pending', reason: 'Personal travel', appliedOn: '2026-04-18' },
    { id: 4, employee: 'Alex Martinez', type: 'Parental Leave', startDate: '2026-07-01', endDate: '2026-08-01', days: 31, status: 'Approved', reason: 'New baby', appliedOn: '2026-04-01' },
    { id: 5, employee: 'David Kim', type: 'Annual Leave', startDate: '2026-05-22', endDate: '2026-05-24', days: 3, status: 'Rejected', reason: 'Extended weekend', appliedOn: '2026-04-15' },
  ];

  const upcomingLeaves = [
    { date: '2026-05-15', employee: 'Michael Chen', type: 'Annual Leave' },
    { date: '2026-05-22', employee: 'Jessica Brown', type: 'Annual Leave' },
    { date: '2026-06-01', employee: 'Emily Rodriguez', type: 'Annual Leave' },
    { date: '2026-07-01', employee: 'Alex Martinez', type: 'Parental Leave' },
  ];

  return (
    <div className="p-6">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Leave Management</h1>
          <p className="text-sm text-gray-600 mt-1">Review and manage employee leave requests</p>
        </div>
        <button className="px-4 py-2 bg-[#0A6ED1] text-white rounded hover:bg-[#0959b0] flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          New Leave Request
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leave Requests */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded border border-gray-200">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">Leave Requests</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => setView('requests')}
                  className={`px-3 py-1 text-sm rounded ${view === 'requests' ? 'bg-[#0A6ED1] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  Requests
                </button>
                <button
                  onClick={() => setView('calendar')}
                  className={`px-3 py-1 text-sm rounded ${view === 'calendar' ? 'bg-[#0A6ED1] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  Calendar
                </button>
              </div>
            </div>

            {view === 'requests' ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
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
                            <span className="text-sm font-medium text-gray-900">{request.employee}</span>
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
                              <button className="p-1 hover:bg-green-50 rounded text-green-600">
                                <Check className="w-4 h-4" />
                              </button>
                              <button className="p-1 hover:bg-red-50 rounded text-red-600">
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
                    const hasLeave = day > 0 && day < 30 && Math.random() > 0.8;
                    return (
                      <div
                        key={i}
                        className={`aspect-square flex items-center justify-center text-sm rounded ${
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
                    <span className="text-gray-600">Leave scheduled</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Leaves */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded border border-gray-200 p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Upcoming Leaves</h3>
            <div className="space-y-4">
              {upcomingLeaves.map((leave, index) => (
                <div key={index} className="pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                  <p className="text-sm font-medium text-gray-900">{leave.employee}</p>
                  <p className="text-xs text-gray-600 mt-1">{leave.type}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(leave.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Statistics */}
          <div className="bg-white rounded border border-gray-200 p-6 mt-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Statistics</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">Pending Requests</span>
                  <span className="text-sm font-medium text-gray-900">23</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-orange-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">Approved This Month</span>
                  <span className="text-sm font-medium text-gray-900">87</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '72%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">Average Days/Request</span>
                  <span className="text-sm font-medium text-gray-900">4.2</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
