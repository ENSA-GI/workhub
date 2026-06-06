import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Archive, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useArchiveEmployee, Employee, ArchiveEmployeeRequest } from '@/lib/useEmployees';

interface Props {
    employee: Employee;
    organizationId: string;
    onClose: () => void;
}

export default function ArchiveEmployeeModal({ employee, organizationId, onClose }: Props) {
    const archiveMutation = useArchiveEmployee();

    const [form, setForm] = useState<ArchiveEmployeeRequest>({
        departureReason: 'RESIGNATION',
        departureDate: new Date().toISOString().split('T')[0],
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!confirm(`Confirmer l'archivage de ${employee.cin} ?`)) return;

        try {
            await archiveMutation.mutateAsync({
                id: employee.id,
                organizationId,
                data: form,
            });
            alert('✅ Employé archivé avec succès');
            onClose();
        } catch (err: any) {
            alert('❌ Erreur : ' + (err.message || 'Erreur inconnue'));
        }
    };

    const modalContent = (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-white max-w-lg w-full rounded-2xl shadow-2xl overflow-hidden border border-gray-100"
            >
                {/* Header */}
                <div className="bg-red-50/80 border-b border-red-100 px-6 py-5 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-red-100 flex items-center justify-center">
                            <Archive className="w-6 h-6 text-red-500" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-red-900">Archiver Employé</h2>
                            <p className="text-sm text-red-600/80 mt-0.5">Retirer cet employé des actifs</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-2 hover:bg-white rounded-xl transition-colors text-red-400 hover:text-red-600 shadow-sm border border-transparent hover:border-red-100"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Info */}
                <div className="px-6 py-4 bg-yellow-50/50 border-b border-yellow-100 flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm text-gray-800">
                            <strong>{employee.cin}</strong> • {employee.personalEmail}
                        </p>
                        <p className="text-xs text-yellow-700 mt-1">
                            Cette action passera l'employé en statut "Archivé". Son compte sera désactivé.
                        </p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5 bg-white">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Raison du départ *</label>
                        <select
                            required
                            value={form.departureReason}
                            onChange={(e) => setForm({ ...form, departureReason: e.target.value as any })}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#0A6ED1] focus:ring-2 focus:ring-[#0A6ED1]/20 outline-none transition-all"
                        >
                            <option value="RESIGNATION">Démission</option>
                            <option value="TERMINATION">Licenciement</option>
                            <option value="END_OF_CONTRACT">Fin de contrat</option>
                            <option value="RETIREMENT">Retraite</option>
                            <option value="DEATH">Décès</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date de départ *</label>
                        <input
                            required
                            type="date"
                            value={form.departureDate}
                            onChange={(e) => setForm({ ...form, departureDate: e.target.value })}
                            max={new Date().toISOString().split('T')[0]}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#0A6ED1] focus:ring-2 focus:ring-[#0A6ED1]/20 outline-none transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Commentaires</label>
                        <textarea
                            value={form.comments || ''}
                            onChange={(e) => setForm({ ...form, comments: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#0A6ED1] focus:ring-2 focus:ring-[#0A6ED1]/20 outline-none transition-all resize-none"
                            placeholder="Raison détaillée, contexte..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Solde de tout compte (MAD)</label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={form.finalSettlementAmount || ''}
                            onChange={(e) => setForm({ ...form, finalSettlementAmount: parseFloat(e.target.value) })}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#0A6ED1] focus:ring-2 focus:ring-[#0A6ED1]/20 outline-none transition-all"
                            placeholder="Montant final à verser"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-100 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={archiveMutation.isPending}
                            className="px-6 py-2.5 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50 shadow-md shadow-red-500/20"
                        >
                            {archiveMutation.isPending ? 'Archivage en cours...' : 'Confirmer l\'archivage'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );

    return createPortal(modalContent, document.body);
}