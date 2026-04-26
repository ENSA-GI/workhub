import { useState } from 'react';
import { Plus, Download, MoreVertical, ChevronRight } from 'lucide-react';

export default function Payroll() {
  const [selectedPayroll, setSelectedPayroll] = useState<number | null>(null);

  const payrolls = [
    { id: 1, month: 'June 2026', employees: 1247, grossAmount: 1895320, deductions: 352820, netAmount: 1542500, status: 'Processed', date: '2026-06-01' },
    { id: 2, month: 'May 2026', employees: 1189, grossAmount: 1789650, deductions: 331150, netAmount: 1458500, status: 'Paid', date: '2026-05-01' },
    { id: 3, month: 'April 2026', employees: 1176, grossAmount: 1752480, deductions: 324480, netAmount: 1428000, status: 'Paid', date: '2026-04-01' },
    { id: 4, month: 'March 2026', employees: 1134, grossAmount: 1689540, deductions: 312540, netAmount: 1377000, status: 'Paid', date: '2026-03-01' },
  ];

  const payrollDetails = [
    { category: 'Base Salary', amount: 1245000 },
    { category: 'Overtime', amount: 85320 },
    { category: 'Bonuses', amount: 235000 },
    { category: 'Allowances', amount: 145000 },
    { category: 'Health Insurance', amount: -125000, isDeduction: true },
    { category: 'Taxes', amount: -187820, isDeduction: true },
    { category: 'Retirement Fund', amount: -40000, isDeduction: true },
  ];

  const selectedPayrollData = payrolls.find(p => p.id === selectedPayroll);

  return (
    <div className="p-6">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Payroll Management</h1>
          <p className="text-sm text-gray-600 mt-1">Process and manage employee payroll</p>
        </div>
        <button className="px-4 py-2 bg-[#0A6ED1] text-white rounded hover:bg-[#0959b0] flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          Generate Payroll
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payroll List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-base font-semibold text-gray-900">Monthly Payroll History</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employees</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gross Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Net Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {payrolls.map((payroll) => (
                    <tr
                      key={payroll.id}
                      className={`hover:bg-gray-50 cursor-pointer ${selectedPayroll === payroll.id ? 'bg-blue-50' : ''}`}
                      onClick={() => setSelectedPayroll(payroll.id)}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{payroll.month}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{payroll.employees.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">${payroll.grossAmount.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">${payroll.netAmount.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs rounded ${
                          payroll.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {payroll.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button className="p-1 hover:bg-gray-100 rounded">
                            <Download className="w-4 h-4 text-gray-600" />
                          </button>
                          <button className="p-1 hover:bg-gray-100 rounded">
                            <MoreVertical className="w-4 h-4 text-gray-600" />
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

        {/* Payroll Detail */}
        <div className="lg:col-span-1">
          {selectedPayrollData ? (
            <div className="bg-white rounded border border-gray-200 p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Payroll Breakdown</h3>

              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-1">Period</p>
                <p className="text-lg font-semibold text-gray-900">{selectedPayrollData.month}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded p-3">
                  <p className="text-xs text-gray-600 mb-1">Employees</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedPayrollData.employees.toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 rounded p-3">
                  <p className="text-xs text-gray-600 mb-1">Status</p>
                  <p className="text-sm">
                    <span className={`inline-flex px-2 py-1 text-xs rounded ${
                      selectedPayrollData.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {selectedPayrollData.status}
                    </span>
                  </p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <h4 className="text-sm font-medium text-gray-900">Components</h4>
                {payrollDetails.map((detail, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <span className="text-sm text-gray-600">{detail.category}</span>
                    <span className={`text-sm font-medium ${detail.isDeduction ? 'text-red-600' : 'text-gray-900'}`}>
                      ${Math.abs(detail.amount).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-gray-200 space-y-2 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Gross Amount</span>
                  <span className="text-sm font-medium text-gray-900">${selectedPayrollData.grossAmount.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Deductions</span>
                  <span className="text-sm font-medium text-red-600">-${selectedPayrollData.deductions.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                  <span className="text-base font-semibold text-gray-900">Net Amount</span>
                  <span className="text-base font-semibold text-[#0A6ED1]">${selectedPayrollData.netAmount.toLocaleString()}</span>
                </div>
              </div>

              <button className="w-full px-4 py-2 bg-[#0A6ED1] text-white rounded hover:bg-[#0959b0] flex items-center justify-center mb-2">
                <Download className="w-4 h-4 mr-2" />
                Download Report
              </button>
              <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 flex items-center justify-center">
                View Details
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          ) : (
            <div className="bg-white rounded border border-gray-200 p-6 flex items-center justify-center h-64">
              <p className="text-sm text-gray-500">Select a payroll to view breakdown</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
