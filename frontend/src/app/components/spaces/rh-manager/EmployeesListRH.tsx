import { useState } from 'react';
import { Users, Search, Plus, Edit2, Archive, Eye, Filter, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from 'motion/react';
import { useEmployees, useSearchEmployees, Employee } from '@/lib/useEmployees';
import EmployeeFormModal from './EmployeeFormModal';
import EmployeeDetailModal from './EmployeeDetailModal';
import ArchiveEmployeeModal from './ArchiveEmployeeModal';
import { useOrganizationId } from '@/lib/useOrganizationId';

export default function EmployeesListRH() {
    const organizationId = useOrganizationId();

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
                <p className="text-red-600">Erreur : Organization ID manquant dans la session</p>
            </div>
        );
    }

    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="p-6 max-w-7xl mx-auto"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                    <motion.div 
                        initial={{ scale: 0.8, rotate: -10 }} 
                        animate={{ scale: 1, rotate: 0 }} 
                        className="w-14 h-14 bg-gradient-to-tr from-[#0A6ED1] to-blue-400 rounded-2xl shadow-lg shadow-blue-500/30 flex items-center justify-center text-white"
                    >
                        <Users className="w-7 h-7" />
                    </motion.div>
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">Gestion des Employés</h1>
                        <p className="text-sm text-gray-500 mt-1 font-medium">
                            {displayData?.totalElements || 0} employé(s) • Page {page + 1} sur {displayData?.totalPages || 1}
                        </p>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => refetch()}
                        className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl shadow-sm transition-all duration-200 flex items-center space-x-2 active:scale-95"
                    >
                        <RefreshCw className="w-4 h-4" />
                        <span className="font-medium">Actualiser</span>
                    </button>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-6 py-2.5 bg-gradient-to-r from-[#0A6ED1] to-blue-600 text-white hover:from-blue-600 hover:to-indigo-600 rounded-xl shadow-md shadow-blue-500/30 transition-all duration-300 flex items-center space-x-2 active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        <span className="font-semibold">Nouvel Employé</span>
                    </button>
                </div>
            </div>

            {/* Filtres & Recherche */}
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-6 grid grid-cols-1 lg:grid-cols-3 gap-4"
            >
                <div className="lg:col-span-2 relative group">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-[#0A6ED1] transition-colors w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Rechercher par CIN, email, nom..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm focus:border-[#0A6ED1] focus:ring-2 focus:ring-[#0A6ED1]/20 outline-none transition-all"
                    />
                </div>
                <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-xl px-4 shadow-sm focus-within:ring-2 focus-within:ring-[#0A6ED1]/20 transition-all">
                    <Filter className="w-5 h-5 text-gray-500" />
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as 'ACTIVE' | 'ARCHIVED')}
                        className="flex-1 py-3 bg-transparent border-none outline-none text-gray-700 font-medium cursor-pointer"
                    >
                        <option value="ACTIVE">Actifs</option>
                        <option value="ARCHIVED">Archivés</option>
                    </select>
                </div>
            </motion.div>

            {/* Table */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden"
            >
                {isLoading || isSearching ? (
                    <div className="p-12 text-center">
                        <div className="inline-block w-10 h-10 border-4 border-[#0A6ED1]/30 border-t-[#0A6ED1] rounded-full animate-spin"></div>
                        <p className="mt-4 text-gray-500 font-medium">Chargement des données...</p>
                    </div>
                ) : employees.length === 0 ? (
                    <div className="p-16 text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users className="w-10 h-10 text-gray-400" />
                        </div>
                        <p className="text-lg font-semibold text-gray-900">Aucun employé trouvé</p>
                        <p className="text-gray-500 mt-1">Modifiez vos filtres ou effectuez une nouvelle recherche.</p>
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="mt-4 px-4 py-2 bg-blue-50 text-[#0A6ED1] font-medium rounded-lg hover:bg-blue-100 transition-colors"
                            >
                                Réinitialiser la recherche
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="text-xs font-bold text-gray-500 uppercase tracking-wider px-6 py-4">CIN</th>
                                <th className="text-xs font-bold text-gray-500 uppercase tracking-wider px-6 py-4">Email</th>
                                <th className="text-xs font-bold text-gray-500 uppercase tracking-wider px-6 py-4">Catégorie</th>
                                <th className="text-xs font-bold text-gray-500 uppercase tracking-wider px-6 py-4">Embauche</th>
                                <th className="text-xs font-bold text-gray-500 uppercase tracking-wider px-6 py-4">Salaire</th>
                                <th className="text-xs font-bold text-gray-500 uppercase tracking-wider px-6 py-4">Statut</th>
                                <th className="text-xs font-bold text-gray-500 uppercase tracking-wider px-6 py-4">Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            <AnimatePresence>
                                {employees.map((emp, idx) => (
                                    <motion.tr 
                                        key={emp.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors group"
                                    >
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-semibold bg-gray-100 text-gray-800">
                                                {emp.cin}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 font-medium">{emp.personalEmail}</td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-100 shadow-sm">
                                              {emp.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                                            {new Date(emp.hireDate).toLocaleDateString('fr-FR')}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-gray-900">
                                            {emp.baseSalary.toLocaleString('fr-FR')} <span className="text-gray-400 text-xs ml-1">MAD</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-full shadow-sm ${
                                                    emp.status === 'ACTIVE'
                                                        ? 'bg-green-50 text-green-700 border border-green-200'
                                                        : emp.status === 'ON_LEAVE'
                                                            ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                                                            : 'bg-gray-50 text-gray-700 border border-gray-200'
                                                }`}
                                            >
                                              {emp.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-1 opacity-70 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleView(emp)}
                                                    className="p-2 bg-white rounded-lg hover:bg-blue-50 border border-transparent hover:border-blue-100 shadow-sm transition-all group/btn"
                                                    title="Voir détails"
                                                >
                                                    <Eye className="w-4 h-4 text-gray-400 group-hover/btn:text-blue-600" />
                                                </button>
                                                {emp.status === 'ACTIVE' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleEdit(emp)}
                                                            className="p-2 bg-white rounded-lg hover:bg-blue-50 border border-transparent hover:border-blue-100 shadow-sm transition-all group/btn"
                                                            title="Modifier"
                                                        >
                                                            <Edit2 className="w-4 h-4 text-gray-400 group-hover/btn:text-blue-600" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleArchive(emp)}
                                                            className="p-2 bg-white rounded-lg hover:bg-red-50 border border-transparent hover:border-red-100 shadow-sm transition-all group/btn"
                                                            title="Archiver"
                                                        >
                                                            <Archive className="w-4 h-4 text-gray-400 group-hover/btn:text-red-500" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                )}
            </motion.div>

            {/* Pagination */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-6 flex items-center justify-between"
            >
                <p className="text-sm text-gray-500 font-medium">
                    Affichage {employees.length > 0 ? page * 20 + 1 : 0} à{' '}
                    {Math.min((page + 1) * 20, displayData?.totalElements || 0)} sur <span className="font-bold text-gray-900">{displayData?.totalElements || 0}</span>
                </p>
                <div className="flex space-x-2">
                    <button
                        disabled={page === 0}
                        onClick={() => setPage(page - 1)}
                        className="px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 font-medium"
                    >
                        Précédent
                    </button>
                    <button
                        disabled={!displayData || page >= displayData.totalPages - 1}
                        onClick={() => setPage(page + 1)}
                        className="px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 font-medium"
                    >
                        Suivant
                    </button>
                </div>
            </motion.div>

            {/* Modals */}
            <AnimatePresence>
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
            </AnimatePresence>
        </motion.div>
    );
}