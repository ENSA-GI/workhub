import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar, UserCheck, CheckCircle, FileText } from 'lucide-react';
import { motion } from 'motion/react';

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

  const inputClasses = "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#0A6ED1] focus:ring-2 focus:ring-[#0A6ED1]/20 outline-none transition-all";

  const modalContent = (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white max-w-lg w-full max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100"
      >
        <div className="bg-white border-b border-gray-100 px-6 py-5 flex items-center justify-between z-10 shadow-sm">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-tr from-[#0A6ED1] to-blue-400 rounded-xl shadow-md shadow-blue-500/20 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">Nouvelle Demande</h2>
              <p className="text-sm font-medium text-gray-500 mt-0.5">Formulaire de demande de congé</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 bg-slate-50/50 space-y-6">
          <div className="space-y-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-blue-500" /> Employé *
              </label>
              <select
                value={formData.employee}
                onChange={(e) => setFormData({ ...formData, employee: e.target.value })}
                className={inputClasses}
                required
              >
                <option value="">Sélectionner un employé</option>
                {employees.map((emp, index) => (
                  <option key={index} value={emp}>{emp}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-500" /> Type de congé *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className={inputClasses}
                required
              >
                <option value="Annual Leave">Congé Annuel</option>
                <option value="Sick Leave">Congé Maladie</option>
                <option value="Parental Leave">Congé Parental</option>
                <option value="Unpaid Leave">Congé Sans Solde</option>
                <option value="Maternity Leave">Congé Maternité</option>
                <option value="Paternity Leave">Congé Paternité</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date de début *</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className={inputClasses}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date de fin *</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className={inputClasses}
                  required
                  min={formData.startDate}
                />
              </div>
            </div>

            {formData.startDate && formData.endDate && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Durée calculée</p>
                  <p className="text-sm text-blue-700 mt-1">La demande concerne <span className="font-bold text-blue-800">{calculateDays(formData.startDate, formData.endDate)} jour(s)</span> au total.</p>
                </div>
              </motion.div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Motif *</label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                rows={3}
                className={`${inputClasses} resize-none`}
                placeholder="Veuillez fournir une raison pour votre demande..."
                required
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={onClose} className="px-6 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors">
              Annuler
            </button>
            <button type="submit" className="px-6 py-2.5 bg-gradient-to-r from-[#0A6ED1] to-blue-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all shadow-md shadow-blue-500/20 active:scale-95">
              Soumettre
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
