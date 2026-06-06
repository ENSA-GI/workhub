import { useState, useEffect } from 'react';
import { Search, Filter, Plus, MoreVertical, Mail, Phone, MapPin, Download, Trash2, Edit } from 'lucide-react';
import EmployeeForm from './EmployeeForm';
import NotificationToast from './NotificationToast';
import { saveToLocalStorage, loadFromLocalStorage, exportToCSV } from '../utils/dataManager';

interface Employee {
  id: number;
  name: string;
  position: string;
  department: string;
  status: string;
  email: string;
  phone: string;
  location: string;
  joined: string;
  salary?: number;
  contractType?: string;
}

const initialEmployees: Employee[] = [
  { id: 1, name: 'Sarah Johnson', position: 'Senior Developer', department: 'Engineering', status: 'Active', email: 'sarah.j@workhub.com', phone: '+1 234-567-8901', location: 'New York', joined: '2023-01-15', salary: 8500, contractType: 'Full-time' },
  { id: 2, name: 'Michael Chen', position: 'Product Manager', department: 'Product', status: 'Active', email: 'michael.c@workhub.com', phone: '+1 234-567-8902', location: 'San Francisco', joined: '2022-08-20', salary: 9200, contractType: 'Full-time' },
  { id: 3, name: 'Emily Rodriguez', position: 'UX Designer', department: 'Design', status: 'Active', email: 'emily.r@workhub.com', phone: '+1 234-567-8903', location: 'Austin', joined: '2023-03-10', salary: 7800, contractType: 'Full-time' },
  { id: 4, name: 'Alex Martinez', position: 'Team Lead', department: 'Engineering', status: 'Active', email: 'alex.m@workhub.com', phone: '+1 234-567-8904', location: 'Seattle', joined: '2021-11-05', salary: 10500, contractType: 'Full-time' },
  { id: 5, name: 'David Kim', position: 'Data Analyst', department: 'Analytics', status: 'Active', email: 'david.k@workhub.com', phone: '+1 234-567-8905', location: 'Chicago', joined: '2023-02-28', salary: 7200, contractType: 'Full-time' },
  { id: 6, name: 'Jessica Brown', position: 'HR Manager', department: 'HR', status: 'Active', email: 'jessica.b@workhub.com', phone: '+1 234-567-8906', location: 'Boston', joined: '2022-06-15', salary: 8000, contractType: 'Full-time' },
  { id: 7, name: 'Ryan Thompson', position: 'DevOps Engineer', department: 'Engineering', status: 'On Leave', email: 'ryan.t@workhub.com', phone: '+1 234-567-8907', location: 'Denver', joined: '2022-10-12', salary: 9000, contractType: 'Full-time' },
  { id: 8, name: 'Lisa Anderson', position: 'Marketing Director', department: 'Marketing', status: 'Active', email: 'lisa.a@workhub.com', phone: '+1 234-567-8908', location: 'Los Angeles', joined: '2021-09-01', salary: 9800, contractType: 'Full-time' },
];

export default function EmployeesEnhanced() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info'; visible: boolean }>({
    message: '',
    type: 'success',
    visible: false,
  });

  useEffect(() => {
    const savedEmployees = loadFromLocalStorage('workhub_employees', initialEmployees);
    setEmployees(savedEmployees);
  }, []);

  useEffect(() => {
    if (employees.length > 0) {
      saveToLocalStorage('workhub_employees', employees);
    }
  }, [employees]);

  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ message, type, visible: true });
  };

  const handleSaveEmployee = (employeeData: Partial<Employee>) => {
    if (employeeData.id) {
      setEmployees(prev => prev.map(emp => emp.id === employeeData.id ? { ...emp, ...employeeData } as Employee : emp));
      showNotification('Employee updated successfully', 'success');
    } else {
      const newEmployee = {
        ...employeeData,
        id: Math.max(...employees.map(e => e.id), 0) + 1,
      } as Employee;
      setEmployees(prev => [...prev, newEmployee]);
      showNotification('Employee added successfully', 'success');
    }
    setEditingEmployee(null);
  };

  const handleDeleteEmployee = (id: number) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      setEmployees(prev => prev.filter(emp => emp.id !== id));
      if (selectedEmployee === id) {
        setSelectedEmployee(null);
      }
      showNotification('Employee deleted successfully', 'success');
    }
  };

  const handleExport = () => {
    exportToCSV(employees, 'employees');
    showNotification('Employees exported successfully', 'success');
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = !departmentFilter || emp.department === departmentFilter;
    return matchesSearch && matchesDepartment;
  });

  const selectedEmp = employees.find(emp => emp.id === selectedEmployee);
  const departments = Array.from(new Set(employees.map(emp => emp.department)));

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
          <h1 className="text-2xl font-semibold text-gray-900">Employee Management</h1>
          <p className="text-sm text-gray-600 mt-1">Manage your organization's employees</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleExport}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          <button
            onClick={() => {
              setEditingEmployee(null);
              setIsFormOpen(true);
            }}
            className="px-4 py-2 bg-[#0A6ED1] text-white rounded hover:bg-[#0959b0] flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Employee
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded border border-gray-200">
            <div className="p-4 border-b border-gray-200 flex items-center space-x-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, position, or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#0A6ED1] focus:border-transparent"
                />
              </div>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#0A6ED1] focus:border-transparent"
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

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
                  {filteredEmployees.map((employee) => (
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
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingEmployee(employee);
                              setIsFormOpen(true);
                            }}
                            className="p-1 hover:bg-blue-50 rounded text-blue-600"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteEmployee(employee.id);
                            }}
                            className="p-1 hover:bg-red-50 rounded text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

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

                {selectedEmp.salary && (
                  <div>
                    <label className="text-xs text-gray-500 uppercase">Monthly Salary</label>
                    <p className="text-sm text-gray-900 mt-1">${selectedEmp.salary.toLocaleString()}</p>
                  </div>
                )}

                {selectedEmp.contractType && (
                  <div>
                    <label className="text-xs text-gray-500 uppercase">Contract Type</label>
                    <p className="text-sm text-gray-900 mt-1">{selectedEmp.contractType}</p>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setEditingEmployee(selectedEmp);
                    setIsFormOpen(true);
                  }}
                  className="w-full px-4 py-2 bg-[#0A6ED1] text-white rounded hover:bg-[#0959b0] mb-2"
                >
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

      <EmployeeForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingEmployee(null);
        }}
        onSave={handleSaveEmployee}
        employee={editingEmployee}
      />
    </div>
  );
}
