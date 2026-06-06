import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Briefcase, Building, FileText, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface JobPosting {
  id: number;
  title: string;
  department: string;
  openings: number;
  applicants: number;
  status: string;
  description?: string;
  requirements?: string;
}

interface JobPostingFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (job: Partial<JobPosting>) => void;
}

export default function JobPostingForm({ isOpen, onClose, onSave }: JobPostingFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    openings: '1',
    description: '',
    requirements: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      openings: parseInt(formData.openings),
      applicants: 0,
      status: 'Active',
    });
    setFormData({
      title: '',
      department: '',
      openings: '1',
      description: '',
      requirements: '',
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
        className="bg-white max-w-2xl w-full max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100"
      >
        <div className="bg-white border-b border-gray-100 px-6 py-5 flex items-center justify-between z-10 shadow-sm">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-tr from-[#0A6ED1] to-blue-400 rounded-xl shadow-md shadow-blue-500/20 flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">Publier une offre</h2>
              <p className="text-sm font-medium text-gray-500 mt-0.5">Créer une nouvelle offre d'emploi</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 bg-slate-50/50 space-y-6">
          <div className="space-y-5 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-500" /> Titre du poste *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={inputClasses}
                placeholder="ex: Senior Software Engineer"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                  <Building className="w-4 h-4 text-indigo-500" /> Département *
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className={inputClasses}
                  required
                >
                  <option value="">Sélectionner</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Product">Product</option>
                  <option value="Design">Design</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="HR">HR</option>
                  <option value="Finance">Finance</option>
                  <option value="Operations">Operations</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Nombre de postes *
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.openings}
                  onChange={(e) => setFormData({ ...formData, openings: e.target.value })}
                  className={inputClasses}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Description du poste *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className={`${inputClasses} resize-none`}
                placeholder="Décrivez le rôle, les responsabilités..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Exigences (Requirements) *
              </label>
              <textarea
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                rows={4}
                className={`${inputClasses} resize-none`}
                placeholder="Liste des compétences, expériences, diplômes requis..."
                required
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={onClose} className="px-6 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors">
              Annuler
            </button>
            <button type="submit" className="px-6 py-2.5 bg-gradient-to-r from-[#0A6ED1] to-blue-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all shadow-md shadow-blue-500/20 active:scale-95 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" /> Publier l'offre
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
