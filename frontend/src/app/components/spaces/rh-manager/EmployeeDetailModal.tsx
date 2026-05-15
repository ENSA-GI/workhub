import { X, User, MapPin, Briefcase, DollarSign, Calendar, FileText } from 'lucide-react';
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
            items: [
                { label: 'Adresse', value: employee.address || 'N/A' },
                { label: 'Ville', value: employee.city || 'N/A' },
                { label: 'Code postal', value: employee.postalCode || 'N/A' },
            ],
        },
        {
            icon: Briefcase,
            title: 'Contrat & Poste',
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
            items: [
                { label: 'Salaire de base', value: `${employee.baseSalary.toLocaleString('fr-FR')} MAD` },
                { label: 'Prime transport', value: `${employee.transportBonus.toLocaleString('fr-FR')} MAD` },
                { label: 'Prime repas', value: `${employee.mealBonus.toLocaleString('fr-FR')} MAD` },
                {
                    label: 'Total brut',
                    value: `${(employee.baseSalary + employee.transportBonus + employee.mealBonus).toLocaleString('fr-FR')} MAD`,
                },
            ],
        },
        {
            icon: FileText,
            title: 'Informations Sociales',
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
            items: [
                { label: 'Créé le', value: new Date(employee.createdAt).toLocaleString('fr-FR') },
                { label: 'Mis à jour le', value: new Date(employee.updatedAt).toLocaleString('fr-FR') },
            ],
        },
    ];

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white max-w-4xl w-full my-8">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-[#0A6ED1]/10 border-2 border-[#0A6ED1] flex items-center justify-center">
                            <User className="w-5 h-5 text-[#0A6ED1]" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Détails Employé</h2>
                            <p className="text-sm text-gray-600">{employee.cin} • {employee.personalEmail}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 transition-colors">
                        <X className="w-5 h-5 text-gray-600" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {sections.map((section) => {
                        const Icon = section.icon;
                        return (
                            <div key={section.title} className="bg-[#F5F7FA] border border-gray-200 p-6">
                                <div className="flex items-center space-x-2 mb-4">
                                    <Icon className="w-5 h-5 text-[#0A6ED1]" />
                                    <h3 className="text-sm font-semibold text-gray-900 uppercase">{section.title}</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {section.items.map((item) => (
                                        <div key={item.label}>
                                            <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                                            <p className="text-sm font-medium text-gray-900">{item.value}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-[#0A6ED1] text-white hover:bg-[#0959b0] transition-colors"
                    >
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    );
}