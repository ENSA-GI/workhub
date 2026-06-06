import { createPortal } from 'react-dom';
import { X, User, MapPin, Briefcase, DollarSign, Calendar, FileText } from 'lucide-react';
import { motion } from 'motion/react';
import { Employee } from '@/lib/useEmployees';

interface Props {
    employee: Employee;
    onClose: () => void;
}

export default function EmployeeDetailModal({ employee, onClose }: Props) {
    const sections = [
        {
            icon: User,
            title: 'Informations Personnelles',
            color: 'text-blue-500',
            bg: 'bg-blue-50',
            border: 'border-blue-100',
            items: [
                { label: 'CIN', value: employee.cin },
                { label: 'Email', value: employee.personalEmail },
                { label: 'Téléphone', value: employee.personalPhone || 'N/A' },
                { label: 'Date de naissance', value: new Date(employee.birthDate).toLocaleDateString('fr-FR') },
                { label: 'Lieu de naissance', value: employee.birthPlace || 'N/A' },
                { label: 'Situation familiale', value: employee.maritalStatus },
                { label: 'Enfants à charge', value: employee.childrenCount.toString() },
            ],
        },
        {
            icon: MapPin,
            title: 'Adresse',
            color: 'text-purple-500',
            bg: 'bg-purple-50',
            border: 'border-purple-100',
            items: [
                { label: 'Adresse', value: employee.address || 'N/A' },
                { label: 'Ville', value: employee.city || 'N/A' },
                { label: 'Code postal', value: employee.postalCode || 'N/A' },
            ],
        },
        {
            icon: Briefcase,
            title: 'Contrat & Poste',
            color: 'text-indigo-500',
            bg: 'bg-indigo-50',
            border: 'border-indigo-100',
            items: [
                { label: 'Date d\'embauche', value: new Date(employee.hireDate).toLocaleDateString('fr-FR') },
                { label: 'Type de contrat', value: employee.contractType },
                { label: 'Catégorie', value: employee.category },
                { label: 'Statut', value: employee.status },
            ],
        },
        {
            icon: DollarSign,
            title: 'Rémunération',
            color: 'text-emerald-500',
            bg: 'bg-emerald-50',
            border: 'border-emerald-100',
            items: [
                { label: 'Salaire de base', value: `${employee.baseSalary.toLocaleString('fr-FR')} MAD` },
                { label: 'Prime transport', value: `${employee.transportBonus.toLocaleString('fr-FR')} MAD` },
                { label: 'Prime repas', value: `${employee.mealBonus.toLocaleString('fr-FR')} MAD` },
                {
                    label: 'Total brut',
                    value: `${(employee.baseSalary + employee.transportBonus + employee.mealBonus).toLocaleString('fr-FR')} MAD`,
                    highlight: true
                },
            ],
        },
        {
            icon: FileText,
            title: 'Informations Sociales',
            color: 'text-orange-500',
            bg: 'bg-orange-50',
            border: 'border-orange-100',
            items: [
                { label: 'N° CNSS', value: employee.cnssNumber || 'N/A' },
                { label: 'N° AMO', value: employee.amoNumber || 'N/A' },
                { label: 'Banque', value: employee.bankName || 'N/A' },
                { label: 'RIB', value: employee.bankAccount || 'N/A' },
            ],
        },
        {
            icon: Calendar,
            title: 'Historique',
            color: 'text-gray-500',
            bg: 'bg-gray-50',
            border: 'border-gray-100',
            items: [
                { label: 'Créé le', value: new Date(employee.createdAt).toLocaleString('fr-FR') },
                { label: 'Mis à jour le', value: new Date(employee.updatedAt).toLocaleString('fr-FR') },
            ],
        },
    ];

    const modalContent = (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 sm:p-6">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-white max-w-4xl w-full max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100"
            >
                {/* Header */}
                <div className="bg-white border-b border-gray-100 px-6 py-5 flex items-center justify-between z-10 shadow-sm relative">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-tr from-[#0A6ED1] to-blue-400 rounded-xl shadow-md shadow-blue-500/20 flex items-center justify-center">
                            <User className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Détails Employé</h2>
                            <p className="text-sm font-medium text-gray-500 mt-0.5">{employee.cin} • <span className="text-gray-400 font-normal">{employee.personalEmail}</span></p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-2 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-gray-500 hover:text-gray-700"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {sections.map((section, idx) => {
                            const Icon = section.icon;
                            return (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    key={section.title} 
                                    className={`bg-white rounded-xl border ${section.border} overflow-hidden shadow-sm hover:shadow-md transition-shadow`}
                                >
                                    <div className={`${section.bg} border-b ${section.border} px-5 py-3 flex items-center space-x-3`}>
                                        <div className={`p-1.5 bg-white rounded-lg shadow-sm ${section.color}`}>
                                            <Icon className="w-4 h-4" />
                                        </div>
                                        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">{section.title}</h3>
                                    </div>
                                    <div className="p-5 grid grid-cols-2 gap-y-4 gap-x-4">
                                        {section.items.map((item) => (
                                            <div key={item.label} className={item.highlight ? "col-span-2 bg-emerald-50/50 p-3 rounded-lg border border-emerald-100" : ""}>
                                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{item.label}</p>
                                                <p className={`text-sm ${item.highlight ? "font-bold text-emerald-700 text-lg" : "font-medium text-gray-900"}`}>
                                                    {item.value}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-white border-t border-gray-100 px-6 py-4 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-8 py-2.5 bg-gradient-to-r from-[#0A6ED1] to-blue-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all shadow-md shadow-blue-500/20 active:scale-95"
                    >
                        Fermer
                    </button>
                </div>
            </motion.div>
        </div>
    );

    return createPortal(modalContent, document.body);
}