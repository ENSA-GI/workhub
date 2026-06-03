import { Plus, Edit, Trash2, UserCheck, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useOrganizationId } from '@/lib/useOrganizationId';
import { API_BASE } from '@/lib/authApi';

interface RhUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  active: boolean;
  phone?: string;
}

export default function RHUsersManagement() {
  const organizationId = useOrganizationId();
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '' });

  const token = localStorage.getItem('workhub.token');

  const { data: rhUsers = [], isLoading } = useQuery<RhUser[]>({
    queryKey: ['rh-users', organizationId],
    queryFn: async () => {
      const res = await fetch(
        `${API_BASE}/identity/api/users?organizationId=${organizationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error('Chargement impossible');
      const users = await res.json();
      return users.filter((u: RhUser) => u.role === 'RH_MANAGER');
    },
    enabled: !!organizationId && !!token,
  });

  const inviteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(
        `${API_BASE}/identity/api/users/invite-rh-manager?organizationId=${organizationId}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(form),
        }
      );
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rh-users', organizationId] });
      setIsFormOpen(false);
      setForm({ firstName: '', lastName: '', email: '', phone: '' });
    },
  });

  const activeCount = rhUsers.filter((u) => u.active).length;

  return (
    <div className="p-6 bg-[#F5F7FA]">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Utilisateurs RH</h1>
          <p className="text-sm text-gray-600 mt-1">Gestion des RH Managers — invitations par email</p>
        </div>
        <button
          type="button"
          onClick={() => setIsFormOpen(true)}
          className="flex items-center px-4 py-2 bg-[#0A6ED1] text-white text-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Inviter un RH Manager
        </button>
      </div>

      {isFormOpen && (
        <div className="mb-6 bg-white border p-4 rounded">
          <h3 className="font-medium mb-3">Nouvelle invitation</h3>
          <div className="grid grid-cols-2 gap-3">
            <input
              className="border rounded px-3 py-2"
              placeholder="Prénom"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            />
            <input
              className="border rounded px-3 py-2"
              placeholder="Nom"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            />
            <input
              className="border rounded px-3 py-2 col-span-2"
              placeholder="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <input
              className="border rounded px-3 py-2 col-span-2"
              placeholder="Téléphone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => inviteMutation.mutate()}
              disabled={inviteMutation.isPending}
              className="px-4 py-2 bg-[#0A6ED1] text-white text-sm rounded"
            >
              {inviteMutation.isPending ? 'Envoi...' : 'Envoyer invitation'}
            </button>
            <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 border text-sm">
              Annuler
            </button>
          </div>
          {inviteMutation.isError && (
            <p className="text-red-600 text-sm mt-2">Erreur lors de l'invitation</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border p-6">
          <UserCheck className="w-5 h-5 text-[#0A6ED1] mb-2" />
          <p className="text-xs text-gray-500 uppercase">RH Managers</p>
          <p className="text-3xl font-semibold">{activeCount}</p>
        </div>
      </div>

      {isLoading ? (
        <Loader2 className="animate-spin w-6 h-6 text-[#0A6ED1]" />
      ) : (
        <div className="bg-white border">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-3">Nom</th>
                <th className="text-left p-3">Email</th>
                <th className="text-left p-3">Statut</th>
              </tr>
            </thead>
            <tbody>
              {rhUsers.map((u) => (
                <tr key={u.id} className="border-b">
                  <td className="p-3">
                    {u.firstName} {u.lastName}
                  </td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">{u.active ? 'Actif' : 'Inactif'}</td>
                </tr>
              ))}
              {rhUsers.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-6 text-center text-gray-500">
                    Aucun RH Manager. Invitez le premier responsable RH.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
