import { Plus, Edit, Trash2, UserCheck } from 'lucide-react';
import { useState } from 'react';

export default function RHUsersManagement() {
  const [rhUsers, setRhUsers] = useState([
    { id: 1, name: 'Fatima Zahra', email: 'fatima@techvision.ma', role: 'RH Manager', department: 'Tous', status: 'Actif', createdAt: '2023-01-15' },
    { id: 2, name: 'Sara Bennani', email: 'sara@techvision.ma', role: 'RH Manager', department: 'IT & Ventes', status: 'Actif', createdAt: '2023-06-20' },
    { id: 3, name: 'Karim Alaoui', email: 'karim@techvision.ma', role: 'RH Manager', department: 'Marketing & Finance', status: 'Actif', createdAt: '2024-02-10' },
  ]);

  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleDelete = (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur RH ?')) {
      setRhUsers(prev => prev.filter(user => user.id !== id));
    }
  };

  return (
    <div className="p-6 bg-[#F5F7FA]">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Utilisateurs RH</h1>
        <p className="text-sm text-gray-600 mt-1">Gestion des RH Managers de votre organisation</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <UserCheck className="w-5 h-5 text-[#0A6ED1] mr-3" />
            <h3 className="text-xs font-medium text-gray-500 uppercase">RH Managers Actifs</h3>
          </div>
          <p className="text-3xl font-semibold text-gray-900">{rhUsers.filter(u => u.status === 'Actif').length}</p>
        </div>
        <div className="bg-white border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <UserCheck className="w-5 h-5 text-green-600 mr-3" />
            <h3 className="text-xs font-medium text-gray-500 uppercase">Accès Complet</h3>
          </div>
          <p className="text-3xl font-semibold text-gray-900">{rhUsers.filter(u => u.department === 'Tous').length}</p>
        </div>
        <div className="bg-white border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <UserCheck className="w-5 h-5 text-purple-600 mr-3" />
            <h3 className="text-xs font-medium text-gray-500 uppercase">Accès Restreint</h3>
          </div>
          <p className="text-3xl font-semibold text-gray-900">{rhUsers.filter(u => u.department !== 'Tous').length}</p>
        </div>
      </div>

      {/* Liste des Utilisateurs RH */}
      <div className="bg-white border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">Liste des RH Managers</h3>
          <button
            onClick={() => setIsFormOpen(true)}
            className="px-4 py-2 bg-[#0A6ED1] text-white hover:bg-[#0959b0] flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un RH Manager
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rôle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Départements</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Créé le</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {rhUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-[#0A6ED1] flex items-center justify-center text-white text-sm mr-3">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{user.role}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.department}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2 py-1 text-xs bg-green-100 text-green-800">
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button className="p-1 hover:bg-blue-50 text-blue-600">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="p-1 hover:bg-red-50 text-red-600"
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
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">À propos des RH Managers</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Les RH Managers peuvent gérer les employés, la paie, les congés et le recrutement</li>
          <li>• Vous pouvez restreindre leur accès à certains départements uniquement</li>
          <li>• Toutes les actions sont tracées dans l'historique d'audit</li>
          <li>• Seul l'Administrateur d'Organisation peut créer/supprimer des RH Managers</li>
        </ul>
      </div>
    </div>
  );
}
