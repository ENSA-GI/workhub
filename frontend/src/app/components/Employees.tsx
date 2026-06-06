import { useState } from 'react';
import { Search, Filter, Plus, MoreVertical, Mail, Phone, MapPin } from 'lucide-react';

export default function Employees() {
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null);

  const employees = [
    { id: 1, name: 'Sarah Johnson', position: 'Senior Developer', department: 'Engineering', status: 'Active', email: 'sarah.j@workhub.com', phone: '+1 234-567-8901', location: 'New York', joined: '2023-01-15' },
    { id: 2, name: 'Michael Chen', position: 'Product Manager', department: 'Product', status: 'Active', email: 'michael.c@workhub.com', phone: '+1 234-567-8902', location: 'San Francisco', joined: '2022-08-20' },
    { id: 3, name: 'Emily Rodriguez', position: 'UX Designer', department: 'Design', status: 'Active', email: 'emily.r@workhub.com', phone: '+1 234-567-8903', location: 'Austin', joined: '2023-03-10' },
    { id: 4, name: 'Alex Martinez', position: 'Team Lead', department: 'Engineering', status: 'Active', email: 'alex.m@workhub.com', phone: '+1 234-567-8904', location: 'Seattle', joined: '2021-11-05' },
    { id: 5, name: 'David Kim', position: 'Data Analyst', department: 'Analytics', status: 'Active', email: 'david.k@workhub.com', phone: '+1 234-567-8905', location: 'Chicago', joined: '2023-02-28' },
    { id: 6, name: 'Jessica Brown', position: 'HR Manager', department: 'HR', status: 'Active', email: 'jessica.b@workhub.com', phone: '+1 234-567-8906', location: 'Boston', joined: '2022-06-15' },
    { id: 7, name: 'Ryan Thompson', position: 'DevOps Engineer', department: 'Engineering', status: 'On Leave', email: 'ryan.t@workhub.com', phone: '+1 234-567-8907', location: 'Denver', joined: '2022-10-12' },
    { id: 8, name: 'Lisa Anderson', position: 'Marketing Director', department: 'Marketing', status: 'Active', email: 'lisa.a@workhub.com', phone: '+1 234-567-8908', location: 'Los Angeles', joined: '2021-09-01' },
  ];

  const selectedEmp = employees.find(emp => emp.id === selectedEmployee);

  return (
    <div className="p-6">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Employee Management</h1>
          <p className="text-sm text-gray-600 mt-1">Manage your organization's employees</p>
        </div>
        <button className="px-4 py-2 bg-[#0A6ED1] text-white rounded hover:bg-[#0959b0] flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          Add Employee
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Employee List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded border border-gray-200">
            {/* Filters */}
            <div className="p-4 border-b border-gray-200 flex items-center space-x-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, position, or department..."
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#0A6ED1] focus:border-transparent"
                />
              </div>
              <button className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 flex items-center">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {employees.map((employee) => (
                    <tr
                      key={employee.id}
                      className={`hover:bg-gray-50 cursor-pointer ${selectedEmployee === employee.id ? 'bg-blue-50' : ''}`}
                      onClick={() => setSelectedEmployee(employee.id)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-[#0A6ED1] flex items-center justify-center text-white text-sm mr-3">
                            {employee.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="text-sm font-medium text-gray-900">{employee.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{employee.position}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{employee.department}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs rounded ${
                          employee.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                        }`}>
                          {employee.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <MoreVertical className="w-4 h-4 text-gray-600" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Employee Detail */}
        <div className="lg:col-span-1">
          {selectedEmp ? (
            <div className="bg-white rounded border border-gray-200 p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Employee Details</h3>

              <div className="flex flex-col items-center mb-6">
                <div className="w-20 h-20 rounded-full bg-[#0A6ED1] flex items-center justify-center text-white text-2xl mb-3">
                  {selectedEmp.name.split(' ').map(n => n[0]).join('')}
                </div>
                <h4 className="text-lg font-semibold text-gray-900">{selectedEmp.name}</h4>
                <p className="text-sm text-gray-600">{selectedEmp.position}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-500 uppercase">Department</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedEmp.department}</p>
                </div>

                <div>
                  <label className="text-xs text-gray-500 uppercase">Status</label>
                  <p className="text-sm mt-1">
                    <span className={`inline-flex px-2 py-1 text-xs rounded ${
                      selectedEmp.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                    }`}>
                      {selectedEmp.status}
                    </span>
                  </p>
                </div>

                <div>
                  <label className="text-xs text-gray-500 uppercase flex items-center mb-1">
                    <Mail className="w-3 h-3 mr-1" />
                    Email
                  </label>
                  <p className="text-sm text-gray-900">{selectedEmp.email}</p>
                </div>

                <div>
                  <label className="text-xs text-gray-500 uppercase flex items-center mb-1">
                    <Phone className="w-3 h-3 mr-1" />
                    Phone
                  </label>
                  <p className="text-sm text-gray-900">{selectedEmp.phone}</p>
                </div>

                <div>
                  <label className="text-xs text-gray-500 uppercase flex items-center mb-1">
                    <MapPin className="w-3 h-3 mr-1" />
                    Location
                  </label>
                  <p className="text-sm text-gray-900">{selectedEmp.location}</p>
                </div>

                <div>
                  <label className="text-xs text-gray-500 uppercase">Joined Date</label>
                  <p className="text-sm text-gray-900 mt-1">{new Date(selectedEmp.joined).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <button className="w-full px-4 py-2 bg-[#0A6ED1] text-white rounded hover:bg-[#0959b0] mb-2">
                  Edit Employee
                </button>
                <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
                  View Documents
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded border border-gray-200 p-6 flex items-center justify-center h-64">
              <p className="text-sm text-gray-500">Select an employee to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
