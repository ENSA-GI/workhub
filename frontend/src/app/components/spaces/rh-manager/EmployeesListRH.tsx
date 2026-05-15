import { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Users, Search, Plus, Edit2, Archive, Eye, Filter, RefreshCw } from "lucide-react";
import { useEmployees, useSearchEmployees, Employee } from '@/lib/useEmployees';
import EmployeeFormModal from './EmployeeFormModal';
import EmployeeDetailModal from './EmployeeDetailModal';
import ArchiveEmployeeModal from './ArchiveEmployeeModal';

export default function EmployeesListRH() {
    const { user } = useUser();
    const organizationId = (user?.publicMetadata?.organizationId as string) || '';

    const [page, setPage] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [status, setStatus] = useState<'ACTIVE' | 'ARCHIVED'>('ACTIVE');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [viewMode, setViewMode] = useState<'detail' | 'edit' | 'archive' | null>(null);

    const { data: employeesData, isLoading, refetch } = useEmployees(organizationId, page, 20, status);
    const { data: searchData, isLoading: isSearching } = useSearchEmployees(
        organizationId,
        searchQuery,
        page,
        20
    );

    const displayData = searchQuery.length > 2 ? searchData : employeesData;
    const employees = displayData?.content || [];

    const handleView = (emp: Employee) => {
        setSelectedEmployee(emp);
        setViewMode('detail');
    };

    const handleEdit = (emp: Employee) => {
        setSelectedEmployee(emp);
        setViewMode('edit');
    };

    const handleArchive = (emp: Employee) => {
        setSelectedEmployee(emp);
        setViewMode('archive');
    };

    const closeModals = () => {
        setSelectedEmployee(null);
        setViewMode(null);
        setShowCreateModal(false);
    };

    if (!organizationId) {
        return (
            <div className="p-6 text-center">
                <p className="text-red-600">Erreur : Organization ID manquant dans les métadonnées Clerk</p>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-[#0A6ED1]/10 border-2 border-[#0A6ED1] flex items-center justify-center">
                        <Users className="w-6 h-6 text-[#0A6ED1]" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Gestion des Employés</h1>
                        <p className="text-sm text-gray-600">
                            {displayData?.totalElements || 0} employé(s) • Page {page + 1} sur {displayData?.totalPages || 1}
                        </p>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => refetch()}
                        className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        <span>Actualiser</span>
                    </button>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-6 py-2 bg-[#0A6ED1] text-white hover:bg-[#0959b0] transition-colors flex items-center space-x-2"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Nouvel Employé</span>
                    </button>
                </div>
            </div>

            {/* Filtres & Recherche */}
            <div className="mb-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Rechercher par CIN, email, nom..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 focus:border-[#0A6ED1] focus:ring-1 focus:ring-[#0A6ED1] outline-none"
                    />
                </div>
                <div className="flex items-center space-x-2">
                    <Filter className="w-5 h-5 text-gray-500" />
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as 'ACTIVE' | 'ARCHIVED')}
                        className="flex-1 px-3 py-2 border border-gray-300 focus:border-[#0A6ED1] focus:ring-1 focus:ring-[#0A6ED1] outline-none"
                    >
                        <option value="ACTIVE">Actifs</option>
                        <option value="ARCHIVED">Archivés</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            {isLoading || isSearching ? (
                <div className="bg-white border border-gray-200 p-12 text-center">
                    <div className="inline-block w-8 h-8 border-4 border-[#0A6ED1] border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-gray-600">Chargement...</p>
                </div>
            ) : employees.length === 0 ? (
                <div className="bg-white border border-gray-200 p-12 text-center">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">Aucun employé trouvé</p>
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="mt-4 text-[#0A6ED1] hover:underline text-sm"
                        >
                            Réinitialiser la recherche
                        </button>
                    )}
                </div>
            ) : (
                <div className="bg-white border border-gray-200 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-[#F5F7FA] border-b border-gray-200">
                        <tr>
                            <th className="text-left text-xs font-semibold text-gray-700 uppercase px-6 py-4">CIN</th>
                            <th className="text-left text-xs font-semibold text-gray-700 uppercase px-6 py-4">Email</th>
                            <th className="text-left text-xs font-semibold text-gray-700 uppercase px-6 py-4">Catégorie</th>
                            <th className="text-left text-xs font-semibold text-gray-700 uppercase px-6 py-4">Embauche</th>
                            <th className="text-left text-xs font-semibold text-gray-700 uppercase px-6 py-4">Salaire</th>
                            <th className="text-left text-xs font-semibold text-gray-700 uppercase px-6 py-4">Statut</th>
                            <th className="text-left text-xs font-semibold text-gray-700 uppercase px-6 py-4">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {employees.map((emp) => (
                            <tr key={emp.id} className="border-b border-gray-100 hover:bg-[#F5F7FA] transition-colors">
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">{emp.cin}</td>
                                <td className="px-6 py-4 text-sm text-gray-700">{emp.personalEmail}</td>
                                <td className="px-6 py-4 text-sm text-gray-700">
                    <span className="px-2 py-1 bg-[#0A6ED1]/10 text-[#0A6ED1] text-xs font-medium">
                      {emp.category}
                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-700">
                                    {new Date(emp.hireDate).toLocaleDateString('fr-FR')}
                                </td>
                                <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                                    {emp.baseSalary.toLocaleString('fr-FR')} MAD
                                </td>
                                <td className="px-6 py-4">
                    <span
                        className={`inline-block px-2 py-1 text-xs font-medium ${
                            emp.status === 'ACTIVE'
                                ? 'bg-green-100 text-green-700'
                                : emp.status === 'ON_LEAVE'
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-gray-100 text-gray-700'
                        }`}
                    >
                      {emp.status}
                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => handleView(emp)}
                                            className="p-2 hover:bg-gray-100 transition-colors group"
                                            title="Voir détails"
                                        >
                                            <Eye className="w-4 h-4 text-gray-600 group-hover:text-[#0A6ED1]" />
                                        </button>
                                        {emp.status === 'ACTIVE' && (
                                            <>
                                                <button
                                                    onClick={() => handleEdit(emp)}
                                                    className="p-2 hover:bg-[#0A6ED1]/10 transition-colors group"
                                                    title="Modifier"
                                                >
                                                    <Edit2 className="w-4 h-4 text-[#0A6ED1]" />
                                                </button>
                                                <button
                                                    onClick={() => handleArchive(emp)}
                                                    className="p-2 hover:bg-red-50 transition-colors group"
                                                    title="Archiver"
                                                >
                                                    <Archive className="w-4 h-4 text-red-600" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            <div className="mt-6 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                    Affichage {employees.length > 0 ? page * 20 + 1 : 0} à{' '}
                    {Math.min((page + 1) * 20, displayData?.totalElements || 0)} sur {displayData?.totalElements || 0}
                </p>
                <div className="flex space-x-2">
                    <button
                        disabled={page === 0}
                        onClick={() => setPage(page - 1)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Précédent
                    </button>
                    <button
                        disabled={!displayData || page >= displayData.totalPages - 1}
                        onClick={() => setPage(page + 1)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Suivant
                    </button>
                </div>
            </div>

            {/* Modals */}
            {showCreateModal && <EmployeeFormModal organizationId={organizationId} onClose={closeModals} />}
            {viewMode === 'detail' && selectedEmployee && (
                <EmployeeDetailModal employee={selectedEmployee} onClose={closeModals} />
            )}
            {viewMode === 'edit' && selectedEmployee && (
                <EmployeeFormModal
                    organizationId={organizationId}
                    employee={selectedEmployee}
                    onClose={closeModals}
                />
            )}
            {viewMode === 'archive' && selectedEmployee && (
                <ArchiveEmployeeModal
                    employee={selectedEmployee}
                    organizationId={organizationId}
                    onClose={closeModals}
                />
            )}
        </div>
    );
}