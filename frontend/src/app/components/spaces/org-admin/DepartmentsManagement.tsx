import { useState } from 'react';
import { 
  Building2, Plus, Loader2, Search, MoreVertical, 
  Edit2, Trash2, Users, Layout, AlertCircle, CheckCircle2,
  X, Save, Info, Power, PowerOff
} from 'lucide-react';
import { 
  useDepartments, useCreateDepartment, useDeleteDepartment, useUpdateDepartment,
  Department
} from '@/lib/useOrg';
import { useUser } from '@/lib/useUser';
import { toast } from 'sonner';

export default function DepartmentsManagement() {
  const { user } = useUser();
  const orgId = user?.publicMetadata?.orgId || '';
  
  const [searchTerm, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Form state
  const [deptName, setDeptName] = useState('');
  const [deptDesc, setDeptDesc] = useState('');
  const [deptActive, setDeptActive] = useState(true);

  const { data: deptsData, isLoading, refetch } = useDepartments(orgId);
  const createDeptMutation = useCreateDepartment();
  const updateDeptMutation = useUpdateDepartment();
  const deleteDeptMutation = useDeleteDepartment();

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId) return;

    createDeptMutation.mutate({
      organizationId: orgId,
      name: deptName,
      description: deptDesc
    }, {
      onSuccess: () => {
        toast.success('Département créé avec succès');
        setShowCreateModal(false);
        setDeptName('');
        setDeptDesc('');
        refetch();
      },
      onError: (error) => {
        toast.error('Erreur: ' + error.message);
      }
    });
  };

  const handleEditClick = (dept: Department) => {
    setSelectedDept(dept);
    setDeptName(dept.name);
    setDeptDesc(dept.description || '');
    setDeptActive(dept.active);
    setShowEditModal(true);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId || !selectedDept) return;

    updateDeptMutation.mutate({
      id: selectedDept.id,
      organizationId: orgId,
      data: {
        name: deptName,
        description: deptDesc,
        active: deptActive
      }
    }, {
      onSuccess: () => {
        toast.success('Département mis à jour avec succès');
        setShowEditModal(false);
        refetch();
      },
      onError: (error) => {
        toast.error('Erreur: ' + error.message);
      }
    });
  };

  const handleDelete = (id: string) => {
    deleteDeptMutation.mutate({ id, organizationId: orgId }, {
      onSuccess: () => {
        toast.success('Département désactivé avec succès');
        setShowDeleteConfirm(null);
        refetch();
      },
      onError: (error) => {
        toast.error('Erreur: ' + error.message);
      }
    });
  };

  const departments = deptsData?.content || [];
  const filteredDepts = departments.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats calculate
  const totalCount = departments.length;
  const activeCount = departments.filter(d => d.active).length;

  return (
    <div className="p-6 bg-[#F5F7FA] min-h-screen">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Départements</h1>
          <p className="text-sm text-gray-600 mt-1">Organisez votre structure d'entreprise et gérez les unités opérationnelles</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 bg-[#0A6ED1] text-white hover:bg-[#0959b0] transition-all flex items-center text-sm font-bold shadow-lg shadow-blue-500/20 rounded-lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouveau Département
        </button>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Layout className="w-5 h-5 text-[#0A6ED1]" />
            </div>
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded uppercase">Structure</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{totalCount}</div>
          <div className="text-xs text-gray-500 mt-1 font-medium">Départements totaux</div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded uppercase">Actifs</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {activeCount}
          </div>
          <div className="text-xs text-gray-500 mt-1 font-medium">Unités opérationnelles</div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded uppercase">RH</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">SYNC</div>
          <div className="text-xs text-gray-500 mt-1 font-medium">Alignement organigramme</div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-4 border border-gray-200 rounded-t-xl flex items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un département..."
            value={searchTerm}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]/20 focus:border-[#0A6ED1] text-sm transition-all"
          />
        </div>
      </div>

      {/* List Table */}
      <div className="bg-white border border-gray-200 rounded-b-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-20 text-center">
            <Loader2 className="w-10 h-10 animate-spin text-[#0A6ED1] mx-auto mb-4" />
            <p className="text-gray-500 font-medium font-mono text-xs uppercase tracking-widest">Initialisation de la structure...</p>
          </div>
        ) : filteredDepts.length === 0 ? (
          <div className="p-20 text-center">
            <Building2 className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">Aucun département trouvé</p>
            <p className="text-sm text-gray-400 mt-1">Commencez par structurer votre organisation</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Département</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredDepts.map((dept) => (
                  <tr key={dept.id} className="hover:bg-blue-50/20 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-lg mr-4 ${dept.active ? 'bg-blue-50 text-[#0A6ED1]' : 'bg-gray-100 text-gray-400'}`}>
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900 group-hover:text-[#0A6ED1] transition-colors">
                            {dept.name}
                          </div>
                          <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                            ID: {dept.id.substring(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600 line-clamp-1 max-w-xs">
                        {dept.description || <span className="italic text-gray-300">Aucune description</span>}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        dept.active ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
                      }`}>
                        <div className={`w-1 h-1 rounded-full mr-1.5 ${dept.active ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        {dept.active ? 'ACTIF' : 'INACTIF'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <button 
                          onClick={() => handleEditClick(dept)}
                          className="p-2 text-gray-400 hover:text-[#0A6ED1] hover:bg-blue-50 rounded-lg transition-all"
                          title="Modifier"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setShowDeleteConfirm(dept.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Désactiver"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 max-w-md w-full shadow-2xl rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center">
                <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-100 mr-3 text-[#0A6ED1]">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Nouveau Département</h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-8 space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Nom du département</label>
                <input
                  type="text"
                  required
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]/20 focus:border-[#0A6ED1] transition-all text-sm font-bold"
                  placeholder="Ex: Ressources Humaines, IT, Finance..."
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Description (Optionnel)</label>
                <textarea
                  value={deptDesc}
                  onChange={(e) => setDeptDesc(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]/20 focus:border-[#0A6ED1] transition-all text-sm min-h-[100px]"
                  placeholder="Décrivez les responsabilités de ce département..."
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-xl flex items-start">
                <Info className="w-4 h-4 text-[#0A6ED1] mr-3 mt-0.5" />
                <p className="text-[10px] text-blue-700 font-medium leading-relaxed">
                  La création d'un département permet d'y affecter des employés et de structurer vos rapports analytiques par unité.
                </p>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-3 border border-gray-200 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-50 transition-all uppercase tracking-widest"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={createDeptMutation.isPending || !deptName}
                  className="flex-1 py-3 bg-[#0A6ED1] text-white text-xs font-bold rounded-xl hover:bg-[#0959b0] shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center uppercase tracking-widest"
                >
                  {createDeptMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedDept && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 max-w-md w-full shadow-2xl rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center">
                <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-100 mr-3 text-[#0A6ED1]">
                  <Edit2 className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Modifier le Département</h3>
              </div>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-8 space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Nom du département</label>
                <input
                  type="text"
                  required
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]/20 focus:border-[#0A6ED1] transition-all text-sm font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Description</label>
                <textarea
                  value={deptDesc}
                  onChange={(e) => setDeptDesc(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]/20 focus:border-[#0A6ED1] transition-all text-sm min-h-[100px]"
                />
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Statut Opérationnel</h4>
                  <p className="text-[10px] text-gray-400 font-medium">Active ou suspend l'unité</p>
                </div>
                <button
                  type="button"
                  onClick={() => setDeptActive(!deptActive)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    deptActive ? 'bg-emerald-500' : 'bg-gray-200'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    deptActive ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-3 border border-gray-200 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-50 transition-all uppercase tracking-widest"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={updateDeptMutation.isPending || !deptName}
                  className="flex-1 py-3 bg-[#0A6ED1] text-white text-xs font-bold rounded-xl hover:bg-[#0959b0] shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center uppercase tracking-widest"
                >
                  {updateDeptMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 max-w-sm w-full shadow-2xl rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Désactiver le département ?</h3>
            <p className="text-sm text-gray-500 mb-8 leading-relaxed">
              Cette action suspendre l'unité opérationnelle mais conservera l'historique des employés y étant rattachés.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 py-3 border border-gray-200 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-50 transition-all uppercase tracking-widest"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                disabled={deleteDeptMutation.isPending}
                className="flex-1 py-3 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 shadow-lg shadow-red-500/20 transition-all uppercase tracking-widest"
              >
                {deleteDeptMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
