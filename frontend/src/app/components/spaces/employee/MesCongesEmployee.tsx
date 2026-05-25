import { Calendar, Plus, CheckCircle, XCircle, Clock, Search, Filter } from 'lucide-react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useUser } from '@clerk/clerk-react';

const ORG_ID = '550e8400-e29b-41d4-a716-446655440000';
const API_BASE = 'http://localhost:8080';
const DEMO_EMPLOYEE_ID = '111e8400-e29b-41d4-a716-446655440000';

interface LeaveBalance {
  year: number;
  totalDays: number;
  usedDays: number;
  pendingDays: number;
  remainingDays: number;
  carriedOverDays: number;
}

interface LeaveRequest {
  id: string;
  employeeId: string;
  leaveTypeName: string;
  startDate: string;
  endDate: string;
  requestedDays: number;
  reason: string;
  status: string;
  reviewComment?: string;
}

interface LeaveType {
  id: string;
  name: string;
  organizationId: string;
  defaultDays: number;
  requiresCertificate: boolean;
  requiresSupportingDocument: boolean;
}

const STATUS_MAP: Record<string, string> = {
  PENDING: 'En attente',
  APPROVED: 'Approuvé',
  REJECTED: 'Refusé',
  CANCELLED: 'Annulé',
};

function normalizeStatus(s: string): string {
  return STATUS_MAP[s] ?? s;
}

function getBadgeClass(s: string): string {
  const normalizedStatus = normalizeStatus(s);
  if (normalizedStatus === 'Approuvé') return 'bg-green-100 text-green-800';
  if (normalizedStatus === 'Refusé') return 'bg-red-100 text-red-800';
  if (normalizedStatus === 'En attente') return 'bg-orange-100 text-orange-800';
  return 'bg-gray-100 text-gray-800';
}

function StatusIcon({ status }: { status: string }) {
  const normalizedStatus = normalizeStatus(status);
  if (normalizedStatus === 'Approuvé') return <CheckCircle className="w-5 h-5 text-green-600" />;
  if (normalizedStatus === 'Refusé') return <XCircle className="w-5 h-5 text-red-600" />;
  if (normalizedStatus === 'En attente') return <Clock className="w-5 h-5 text-orange-600" />;
  return <Calendar className="w-5 h-5 text-blue-600" />;
}

function formatDate(raw: string | undefined): string {
  if (!raw) return 'Date inconnue';
  try {
    const date = new Date(raw);
    return date.toLocaleDateString('fr-FR');
  } catch {
    return raw;
  }
}

function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

export default function MesCongesEmployee() {
  const { user } = useUser();

  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [periodFilter, setPeriodFilter] = useState('all');
  const [formData, setFormData] = useState({
    typeId: '',
    startDate: '',
    endDate: '',
    reason: ''
  });

  const [balance, setBalance] = useState<LeaveBalance | null>(null);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(true);

  const employeeId = (
    user?.publicMetadata?.employeeId ||
    user?.unsafeMetadata?.employeeId ||
    DEMO_EMPLOYEE_ID
  ) as string;

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const headers = {
        'Content-Type': 'application/json'
      };

      const [reqRes, balRes, typesRes] = await Promise.all([
        fetch(`${API_BASE}/leave/leave-requests?employeeId=${employeeId}`, { headers }),
        fetch(`${API_BASE}/leave/leave-balances?employeeId=${employeeId}`, { headers }),
        fetch(`${API_BASE}/leave/leave-types?organizationId=${ORG_ID}`, { headers }),
      ]);

      if (reqRes.ok) {
        const data: LeaveRequest[] = await reqRes.json();
        setRequests(Array.isArray(data) ? data : []);
      } else {
        setRequests([]);
      }

      if (balRes.ok) {
        const balanceData: LeaveBalance = await balRes.json();
        setBalance(balanceData);
      } else {
        const currentYear = new Date().getFullYear();
        setBalance({
          year: currentYear,
          totalDays: 22,
          usedDays: 0,
          pendingDays: 0,
          remainingDays: 22,
          carriedOverDays: 0
        });
      }

      if (typesRes.ok) {
        const types: LeaveType[] = await typesRes.json();
        if (types.length > 0) {
          setLeaveTypes(types);
          setFormData(prev => ({ ...prev, typeId: types[0].id }));
        }
      }
    } catch (err) {
      console.error('API error:', err);
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const availableTypeNames = useMemo(
      () => Array.from(new Set(requests.map(request => request.leaveTypeName))).sort(),
      [requests]
  );

  const filteredRequests = useMemo(() => {
    const today = startOfToday();
    return requests.filter(request => {
      const query = searchTerm.trim().toLowerCase();
      const matchesSearch = !query ||
          request.leaveTypeName.toLowerCase().includes(query) ||
          request.reason.toLowerCase().includes(query) ||
          normalizeStatus(request.status).toLowerCase().includes(query);

      const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
      const matchesType = typeFilter === 'all' || request.leaveTypeName === typeFilter;
      const startDate = new Date(request.startDate);
      const endDate = new Date(request.endDate);
      endDate.setHours(23, 59, 59, 999);
      const matchesPeriod =
          periodFilter === 'all' ||
          (periodFilter === 'upcoming' && startDate > today) ||
          (periodFilter === 'current' && startDate <= today && endDate >= today) ||
          (periodFilter === 'past' && endDate < today);

      return matchesSearch && matchesStatus && matchesType && matchesPeriod;
    });
  }, [requests, searchTerm, statusFilter, typeFilter, periodFilter]);

  const filteredStats = useMemo(() => ({
    totalRequests: filteredRequests.length,
    totalDays: filteredRequests.reduce((sum, request) => sum + Number(request.requestedDays || 0), 0),
    pendingRequests: filteredRequests.filter(request => request.status === 'PENDING').length,
    pendingDays: filteredRequests
        .filter(request => request.status === 'PENDING')
        .reduce((sum, request) => sum + Number(request.requestedDays || 0), 0),
    approvedDays: filteredRequests
        .filter(request => request.status === 'APPROVED')
        .reduce((sum, request) => sum + Number(request.requestedDays || 0), 0),
  }), [filteredRequests]);

  const balanceSummary = useMemo(() => {
    if (!balance) return null;
    const entitlement = Number(balance.totalDays || 0) + Number(balance.carriedOverDays || 0);
    const used = Number(balance.usedDays || 0);
    return {
      entitlement,
      used,
      pending: Number(balance.pendingDays || 0),
      remaining: Number(balance.remainingDays || 0),
      overused: Math.max(0, used - entitlement),
    };
  }, [balance]);

  const calculateDays = () => {
    if (!formData.startDate || !formData.endDate) return 0;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const diff = Math.ceil((end.getTime() - start.getTime()) / 86400000) + 1;
    return diff > 0 ? diff : 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
      alert('Utilisateur non connecté');
      return;
    }

    setSubmitting(true);
    try {
      const requestBody = {
        employeeId,
        leaveTypeId: formData.typeId,
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason
      };

      const response = await fetch(`${API_BASE}/leave/leave-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        await loadData();
        setShowForm(false);
        setFormData({
          typeId: leaveTypes[0]?.id || '',
          startDate: '',
          endDate: '',
          reason: ''
        });
        alert('Demande de congé soumise avec succès');
      } else {
        const errorText = await response.text();
        console.error('Server error:', response.status, errorText);
        alert(`Erreur ${response.status}: ${errorText || 'Échec de la soumission'}`);
      }
    } catch (err) {
      console.error('Network error:', err);
      alert('Erreur réseau. Vérifiez que le serveur tourne sur localhost:8080');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    if (!window.confirm('Confirmer l annulation de cette demande ?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/leave/leave-requests/${requestId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await loadData();
        alert('Demande annulee avec succes');
      } else {
        const errorText = await response.text();
        console.error('Cancel error:', response.status, errorText);
        alert(`Erreur ${response.status}: ${errorText || 'Annulation impossible'}`);
      }
    } catch (err) {
      console.error('Network error:', err);
      alert('Erreur reseau. Verifiez que le serveur tourne sur localhost:8080');
    }
  };

  if (loading) {
    return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0A6ED1] mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement...</p>
          </div>
        </div>
    );
  }

  return (
      <div className="p-6 bg-[#F5F7FA] min-h-screen">
        {/* En-tête */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Mes Congés</h1>
            <p className="text-sm text-gray-600 mt-1">
              Gérez vos demandes de congés et consultez votre solde
            </p>
          </div>
          <button
              onClick={() => setShowForm(prev => !prev)}
              className="px-4 py-2 bg-[#0A6ED1] text-white hover:bg-[#0959b0] rounded-lg flex items-center transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle Demande
          </button>
        </div>

        {/* Cartes de solde */}
        {balance && balanceSummary && (
            <div className="mb-6">
              <div className="mb-3">
                <h2 className="text-sm font-semibold text-gray-900">Solde annuel en jours</h2>
                <p className="text-xs text-gray-500">
                  Ces cartes affichent des jours de conge, pas le nombre de demandes.
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { label: 'Année', value: balance.year, color: 'text-gray-900' },
                { label: 'Droits disponibles', value: balanceSummary.entitlement, color: 'text-gray-900' },
                { label: 'Jours approuves', value: balanceSummary.used, color: 'text-gray-900' },
                { label: 'Jours demandes', value: balanceSummary.pending, color: 'text-orange-600' },
                {
                  label: balanceSummary.overused > 0 ? 'Depassement' : 'Jours restants',
                  value: balanceSummary.overused > 0 ? balanceSummary.overused : balanceSummary.remaining,
                  color: balanceSummary.overused > 0 ? 'text-red-600' : 'text-[#0A6ED1]'
                },
              ].map(card => (
                  <div key={card.label} className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
                    <h3 className="text-xs font-medium text-gray-500 uppercase mb-2">{card.label}</h3>
                    <p className={`text-3xl font-semibold ${card.color}`}>{card.value}</p>
                  </div>
              ))}
              </div>
              {balanceSummary.overused > 0 && (
                  <div className="mt-3 border border-red-200 bg-red-50 px-4 py-3 rounded-lg">
                    <p className="text-sm text-red-800">
                      Les donnees de test depassent le droit annuel : {balanceSummary.used} jours approuves pour {balanceSummary.entitlement} jours disponibles.
                    </p>
                  </div>
              )}
            </div>
        )}

        {/* Formulaire */}
        {showForm && (
            <div className="bg-white border border-gray-200 p-6 mb-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Nouvelle Demande de Congé</h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de Congé
                  </label>
                  <select
                      value={formData.typeId}
                      onChange={e => setFormData(prev => ({ ...prev, typeId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]"
                      required
                  >
                    <option value="" disabled>Sélectionnez un type</option>
                    {leaveTypes.map(type => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date de Début
                    </label>
                    <input
                        type="date"
                        value={formData.startDate}
                        onChange={e => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]"
                        required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date de Fin
                    </label>
                    <input
                        type="date"
                        value={formData.endDate}
                        onChange={e => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]"
                        required
                    />
                  </div>
                </div>

                {calculateDays() > 0 && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-900">
                        Durée: <span className="font-semibold">{calculateDays()} jour(s)</span>
                      </p>
                    </div>
                )}

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Justification
                  </label>
                  <textarea
                      value={formData.reason}
                      onChange={e => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]"
                      placeholder="Motif de votre demande..."
                      required
                  />
                </div>

                <div className="flex items-center space-x-4">
                  <button
                      type="submit"
                      disabled={submitting}
                      className="px-4 py-2 bg-[#0A6ED1] text-white hover:bg-[#0959b0] rounded-lg disabled:opacity-50 transition-colors"
                  >
                    {submitting ? 'Envoi en cours...' : 'Soumettre la Demande'}
                  </button>
                  <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
        )}

        {/* Historique */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Historique des Demandes</h3>
              <span className="text-sm text-gray-500">{filteredRequests.length} / {requests.length} demande(s)</span>
            </div>
            <p className="text-xs text-gray-500 mb-3">
              Ce resume concerne seulement les demandes visibles apres recherche et filtres.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
              {[
                { label: 'Demandes visibles', value: filteredStats.totalRequests, color: 'text-gray-900' },
                { label: 'Jours visibles', value: filteredStats.totalDays, color: 'text-gray-900' },
                { label: 'Demandes attente', value: filteredStats.pendingRequests, color: 'text-orange-600' },
                { label: 'Jours attente', value: filteredStats.pendingDays, color: 'text-orange-600' },
                { label: 'Jours approuves', value: filteredStats.approvedDays, color: 'text-green-600' },
              ].map(stat => (
                  <div key={stat.label} className="border border-gray-200 rounded-lg bg-gray-50 px-3 py-2">
                    <p className="text-[11px] uppercase text-gray-500">{stat.label}</p>
                    <p className={`text-lg font-semibold ${stat.color}`}>{stat.value}</p>
                  </div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="relative md:col-span-2">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]"
                    placeholder="Rechercher type, motif, statut..."
                />
              </div>
              <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]"
              >
                <option value="all">Tous les statuts</option>
                <option value="PENDING">En attente</option>
                <option value="APPROVED">Approuve</option>
                <option value="REJECTED">Refuse</option>
                <option value="CANCELLED">Annule</option>
              </select>
              <select
                  value={typeFilter}
                  onChange={e => setTypeFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]"
              >
                <option value="all">Tous les types</option>
                {availableTypeNames.map(type => (
                    <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              {[
                { value: 'all', label: 'Toutes les periodes' },
                { value: 'upcoming', label: 'A venir' },
                { value: 'current', label: 'En cours' },
                { value: 'past', label: 'Passees' },
              ].map(option => (
                  <button
                      key={option.value}
                      type="button"
                      onClick={() => setPeriodFilter(option.value)}
                      className={`px-3 py-1 text-xs rounded-full border ${
                          periodFilter === option.value
                              ? 'bg-[#0A6ED1] text-white border-[#0A6ED1]'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                      }`}
                  >
                    {option.label}
                  </button>
              ))}
            </div>
          </div>
          <div className="p-6">
            {requests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">Aucune demande pour le moment.</p>
                  <button
                      onClick={() => setShowForm(true)}
                      className="mt-4 text-[#0A6ED1] hover:underline text-sm"
                  >
                    Créer votre première demande
                  </button>
                </div>
            ) : filteredRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">Aucune demande ne correspond aux filtres.</p>
                </div>
            ) : (
                <div className="space-y-4">
                  {filteredRequests.map(request => (
                      <div key={request.id} className="border border-gray-200 p-4 rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start">
                            <StatusIcon status={request.status} />
                            <div className="ml-3">
                              <h4 className="text-sm font-semibold text-gray-900">
                                {request.leaveTypeName}
                              </h4>
                              <p className="text-xs text-gray-600 mt-1">
                                Du {formatDate(request.startDate)} au {formatDate(request.endDate)}
                                {request.requestedDays && ` — ${request.requestedDays} jour(s)`}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getBadgeClass(request.status)}`}>
                              {normalizeStatus(request.status)}
                            </span>
                            {request.status === 'PENDING' && (
                                <button
                                    type="button"
                                    onClick={() => handleCancelRequest(request.id)}
                                    className="inline-flex items-center px-3 py-1 text-xs border border-red-200 text-red-700 bg-red-50 hover:bg-red-100 rounded-full transition-colors"
                                    title="Annuler la demande"
                                >
                                  Annuler
                                </button>
                            )}
                          </div>
                        </div>
                        <div className="pl-8">
                          <p className="text-sm text-gray-600 mb-1">
                            <span className="font-medium">Motif :</span> {request.reason}
                          </p>
                          {request.reviewComment && (
                              <div className="mt-2 p-2 bg-gray-50 border-l-4 border-gray-300 rounded">
                                <p className="text-xs text-gray-700">
                                  <span className="font-medium">Réponse RH :</span> {request.reviewComment}
                                </p>
                              </div>
                          )}
                        </div>
                      </div>
                  ))}
                </div>
            )}
          </div>
        </div>
      </div>
  );
}
