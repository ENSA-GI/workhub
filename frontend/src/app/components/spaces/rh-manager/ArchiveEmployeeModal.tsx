import { useState } from 'react';
import { X, Archive } from 'lucide-react';
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

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white max-w-lg w-full">
                {/* Header */}
                <div className="bg-red-50 border-b border-red-200 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-red-100 border-2 border-red-600 flex items-center justify-center">
                            <Archive className="w-5 h-5 text-red-600" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Archiver Employé</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-red-100 transition-colors">
                        <X className="w-5 h-5 text-gray-600" />
                    </button>
                </div>

                {/* Info */}
                <div className="p-6 bg-yellow-50 border-b border-yellow-200">
                    <p className="text-sm text-gray-700">
                        <strong>{employee.cin}</strong> • {employee.personalEmail}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                        Cette action passera l'employé en statut "Archivé". Le compte Clerk sera désactivé.
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Raison du départ *</label>
                        <select
                            required
                            value={form.departureReason}
                            onChange={(e) => setForm({ ...form, departureReason: e.target.value as any })}
                            className="w-full px-3 py-2 border border-gray-300 focus:border-[#0A6ED1] focus:ring-1 focus:ring-[#0A6ED1] outline-none"
                        >
                            <option value="RESIGNATION">Démission</option>
                            <option value="TERMINATION">Licenciement</option>
                            <option value="END_OF_CONTRACT">Fin de contrat</option>
                            <option value="RETIREMENT">Retraite</option>
                            <option value="DEATH">Décès</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date de départ *</label>
                        <input
                            required
                            type="date"
                            value={form.departureDate}
                            onChange={(e) => setForm({ ...form, departureDate: e.target.value })}
                            max={new Date().toISOString().split('T')[0]}
                            className="w-full px-3 py-2 border border-gray-300 focus:border-[#0A6ED1] focus:ring-1 focus:ring-[#0A6ED1] outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Commentaires</label>
                        <textarea
                            value={form.comments || ''}
                            onChange={(e) => setForm({ ...form, comments: e.target.value })}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 focus:border-[#0A6ED1] focus:ring-1 focus:ring-[#0A6ED1] outline-none"
                            placeholder="Raison détaillée, contexte..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Solde de tout compte (MAD)</label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={form.finalSettlementAmount || ''}
                            onChange={(e) => setForm({ ...form, finalSettlementAmount: parseFloat(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 focus:border-[#0A6ED1] focus:ring-1 focus:ring-[#0A6ED1] outline-none"
                            placeholder="Montant final à verser"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={archiveMutation.isPending}
                            className="px-6 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                            {archiveMutation.isPending ? 'Archivage...' : 'Archiver'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}