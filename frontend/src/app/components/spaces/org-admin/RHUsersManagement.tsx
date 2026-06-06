import { Plus, Trash2, UserCheck, Loader2, AlertCircle, RotateCcw } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useCreateUser, useDeactivateUser, useReactivateUser, useUsers } from '@/lib/useEmployees';
import { useOrganizationId } from '@/lib/useOrganizationId';

export default function RHUsersManagement() {
  const organizationId = useOrganizationId();
  const { data: users = [], isLoading, error } = useUsers(organizationId);
  const createUser = useCreateUser();
  const deactivateUser = useDeactivateUser();
  const reactivateUser = useReactivateUser();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: 'RhManager@123',
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const rhUsers = useMemo(
    () => users.filter((user) => user.role === 'RH_MANAGER'),
    [users]
  );
  const activeRhUsers = rhUsers.filter((user) => user.active);
  const inactiveRhUsers = rhUsers.filter((user) => !user.active);

  if (!organizationId) {
    return <div className="p-6 text-center text-red-600">ID d'organisation manquant dans la session.</div>;
  }

  const resetForm = () => {
    setForm({ firstName: '', lastName: '', email: '', phone: '', password: 'RhManager@123' });
  };

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);

    try {
      await createUser.mutateAsync({
        organizationId,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        password: form.password,
        role: 'RH_MANAGER',
      });
      setMessage({ type: 'success', text: 'RH Manager cree avec succes.' });
      resetForm();
      setIsFormOpen(false);
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : "Impossible de creer l'utilisateur RH." });
    }
  };

  const handleDeactivate = async (userId: string) => {
    if (!window.confirm('Desactiver cet utilisateur RH ?')) return;
    setMessage(null);

    try {
      await deactivateUser.mutateAsync({ userId, organizationId });
      setMessage({ type: 'success', text: 'Utilisateur RH desactive.' });
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : "Impossible de desactiver l'utilisateur RH." });
    }
  };

  const handleReactivate = async (userId: string) => {
    if (!window.confirm('Reactiver cet utilisateur RH et lui envoyer un email avec un mot de passe temporaire ?')) return;
    setMessage(null);

    try {
      await reactivateUser.mutateAsync({ userId, organizationId });
      setMessage({ type: 'success', text: 'Utilisateur RH reactive. Un email avec un mot de passe temporaire a ete envoye.' });
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : "Impossible de reactiver l'utilisateur RH." });
    }
  };

  return (
    <div className="p-6 bg-[#F5F7FA]">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Utilisateurs RH</h1>
          <p className="text-sm text-gray-600 mt-1">Gestion des comptes RH Managers de votre organisation</p>
        </div>
        <button
          onClick={() => setIsFormOpen((current) => !current)}
          className="px-4 py-2 bg-[#0A6ED1] text-white hover:bg-[#0959b0] flex items-center rounded"
        >
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un RH Manager
        </button>
      </div>

      {message && (
        <div className={`mb-4 border p-3 text-sm ${message.type === 'success' ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
          {message.text}
        </div>
      )}
      {error && (
        <div className="mb-4 border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          Impossible de charger les utilisateurs RH.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <UserCheck className="w-5 h-5 text-[#0A6ED1] mr-3" />
            <h3 className="text-xs font-medium text-gray-500 uppercase">RH Managers actifs</h3>
          </div>
          <p className="text-3xl font-semibold text-gray-900">{activeRhUsers.length}</p>
        </div>
        <div className="bg-white border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <UserCheck className="w-5 h-5 text-gray-600 mr-3" />
            <h3 className="text-xs font-medium text-gray-500 uppercase">Total RH</h3>
          </div>
          <p className="text-3xl font-semibold text-gray-900">{rhUsers.length}</p>
        </div>
        <div className="bg-white border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <UserCheck className="w-5 h-5 text-orange-600 mr-3" />
            <h3 className="text-xs font-medium text-gray-500 uppercase">Desactives</h3>
          </div>
          <p className="text-3xl font-semibold text-gray-900">{inactiveRhUsers.length}</p>
        </div>
      </div>

      {isFormOpen && (
        <form onSubmit={handleCreate} className="bg-white border border-gray-200 p-5 mb-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Nouveau RH Manager</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prenom</label>
              <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
              <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telephone</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe initial</label>
              <input type="text" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]" />
              <p className="text-xs text-gray-500 mt-1">Minimum 12 caracteres avec majuscule, minuscule, chiffre et caractere special.</p>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-5">
            <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded">Annuler</button>
            <button type="submit" disabled={createUser.isPending} className="px-4 py-2 bg-[#0A6ED1] text-white hover:bg-[#0959b0] rounded flex items-center disabled:opacity-50">
              {createUser.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Creer le compte
            </button>
          </div>
        </form>
      )}

      <div className="bg-white border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">Liste des RH Managers</h3>
          {isLoading && <Loader2 className="w-4 h-4 animate-spin text-gray-500" />}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cree le</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {!isLoading && rhUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                    Aucun RH Manager trouve pour cette organisation.
                  </td>
                </tr>
              )}
              {rhUsers.map((user) => {
                const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email;
                const initials = fullName.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();

                return (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-[#0A6ED1] flex items-center justify-center text-white text-sm mr-3 rounded">
                          {initials}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{fullName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">RH Manager</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs ${user.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>
                        {user.active ? 'Actif' : 'Desactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {user.active ? (
                        <button
                          onClick={() => handleDeactivate(user.id)}
                          disabled={deactivateUser.isPending}
                          className="p-1 hover:bg-red-50 text-red-600 disabled:opacity-40 disabled:cursor-not-allowed"
                          title="Desactiver"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleReactivate(user.id)}
                          disabled={reactivateUser.isPending}
                          className="p-1 hover:bg-green-50 text-green-700 disabled:opacity-40 disabled:cursor-not-allowed"
                          title="Reactiver et envoyer les identifiants"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-semibold text-blue-900 mb-1">A propos des RH Managers</h4>
          <p className="text-sm text-blue-800">
            Un RH Manager peut gerer les employes, la paie, les conges et le recrutement de l'organisation.
            La suppression des comptes est volontairement remplacee par une desactivation pour conserver l'historique.
            Lors d'une reactivation, un mot de passe temporaire est genere et envoye par email.
          </p>
        </div>
      </div>
    </div>
  );
}
