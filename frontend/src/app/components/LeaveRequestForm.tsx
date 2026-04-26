import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface LeaveRequest {
  id: number;
  employee: string;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  status: string;
  reason: string;
  appliedOn: string;
}

interface LeaveRequestFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (leave: Partial<LeaveRequest>) => void;
  employees: string[];
}

export default function LeaveRequestForm({ isOpen, onClose, onSave, employees }: LeaveRequestFormProps) {
  const [formData, setFormData] = useState({
    employee: '',
    type: 'Annual Leave',
    startDate: '',
    endDate: '',
    reason: '',
  });

  const calculateDays = (start: string, end: string) => {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const days = calculateDays(formData.startDate, formData.endDate);
    onSave({
      ...formData,
      days,
      status: 'Pending',
      appliedOn: new Date().toISOString().split('T')[0],
    });
    setFormData({
      employee: '',
      type: 'Annual Leave',
      startDate: '',
      endDate: '',
      reason: '',
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded border border-gray-200 w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">New Leave Request</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employee *
              </label>
              <select
                value={formData.employee}
                onChange={(e) => setFormData({ ...formData, employee: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#0A6ED1] focus:border-transparent"
                required
              >
                <option value="">Select Employee</option>
                {employees.map((emp, index) => (
                  <option key={index} value={emp}>{emp}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Leave Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#0A6ED1] focus:border-transparent"
                required
              >
                <option value="Annual Leave">Annual Leave</option>
                <option value="Sick Leave">Sick Leave</option>
                <option value="Parental Leave">Parental Leave</option>
                <option value="Unpaid Leave">Unpaid Leave</option>
                <option value="Maternity Leave">Maternity Leave</option>
                <option value="Paternity Leave">Paternity Leave</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#0A6ED1] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date *
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#0A6ED1] focus:border-transparent"
                  required
                  min={formData.startDate}
                />
              </div>
            </div>

            {formData.startDate && formData.endDate && (
              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <p className="text-sm text-blue-900">
                  Duration: <span className="font-semibold">{calculateDays(formData.startDate, formData.endDate)} day(s)</span>
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason *
              </label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#0A6ED1] focus:border-transparent"
                placeholder="Please provide a reason for your leave request..."
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#0A6ED1] text-white rounded hover:bg-[#0959b0]"
            >
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
