import { Bell, CheckCircle, Calendar, FileText, AlertCircle, Trash2, RefreshCw } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/lib/useUser';

const API_BASE = 'http://localhost:8080';

interface BackendNotification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsCandidat() {
  const { user } = useUser();
  const [selectedFilter, setSelectedFilter] = useState('Toutes');
  const [notifications, setNotifications] = useState<BackendNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const userId = user?.id;

  const getCategory = (type: string) => {
    if (type === 'INTERVIEW_SCHEDULED') return 'Entretien';
    if (type === 'NEW_APPLICATION') return 'Candidature';
    return 'Statut';
  };

  const getVisualType = (notif: BackendNotification) => {
    if (notif.type === 'INTERVIEW_SCHEDULED') return 'info';
    const msg = notif.message.toLowerCase();
    if (msg.includes('accept') || msg.includes('felicitation') || msg.includes('félicitation')) return 'success';
    if (msg.includes('pas ete retenu') || msg.includes('non retenu') || msg.includes('pas été retenu')) return 'error';
    return 'warning';
  };

  const loadNotifications = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE}/notifications/notifications?userId=${userId}`);
      if (!response.ok) {
        throw new Error(await response.text());
      }
      const data = await response.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Erreur chargement notifications:', err);
      setError('Impossible de charger les notifications.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      loadNotifications();
    }
  }, [userId, loadNotifications]);

  const categories = ['Toutes', 'Candidature', 'Entretien', 'Statut'];

  const filteredNotifications = selectedFilter === 'Toutes'
    ? notifications
    : notifications.filter((notif) => getCategory(notif.type) === selectedFilter);

  const nonLues = notifications.filter((n) => !n.isRead).length;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-6 h-6 text-red-600" />;
      case 'warning':
        return <AlertCircle className="w-6 h-6 text-orange-600" />;
      default:
        return <FileText className="w-6 h-6 text-blue-600" />;
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette notification ?')) {
      try {
        const res = await fetch(`${API_BASE}/notifications/notifications/${id}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          setNotifications(prev => prev.filter(n => n.id !== id));
        }
      } catch (err) {
        console.error('Erreur lors de la suppression:', err);
      }
    }
  };

  const handleMarkRead = async (id: string, isRead: boolean) => {
    if (isRead) return;
    try {
      const res = await fetch(`${API_BASE}/notifications/notifications/${id}/read`, {
        method: 'POST',
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      }
    } catch (err) {
      console.error('Erreur marquage lu:', err);
    }
  };

  const handleMarkAllRead = async () => {
    if (nonLues === 0) return;
    try {
      const res = await fetch(`${API_BASE}/notifications/notifications/read-all?userId=${userId}`, {
        method: 'POST',
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      }
    } catch (err) {
      console.error('Erreur tout marquer lu:', err);
    }
  };

  return (
    <div className="p-6 bg-[#F5F7FA] min-h-screen">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-600 mt-1">
            Restez informé de l'évolution de vos candidatures
            {nonLues > 0 && (
              <span className="ml-2 inline-flex px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                {nonLues} non lue{nonLues > 1 ? 's' : ''}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={loadNotifications}
          disabled={loading || !userId}
          className="px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded hover:bg-gray-50 flex items-center shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </div>

      {/* Filtres */}
      <div className="bg-white border border-gray-200 p-4 mb-6 rounded shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Bell className="w-5 h-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filtrer par :</span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedFilter(cat)}
                className={`px-3 py-1 text-sm rounded ${
                  selectedFilter === cat
                    ? 'bg-[#0A6ED1] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <button 
            onClick={handleMarkAllRead}
            disabled={nonLues === 0}
            className="text-sm text-[#0A6ED1] hover:underline disabled:opacity-50 text-left"
          >
            Tout marquer comme lu
          </button>
        </div>
      </div>

      {/* Liste des Notifications */}
      <div className="bg-white border border-gray-200 rounded shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-900">
            {selectedFilter === 'Toutes' ? 'Toutes les Notifications' : `Notifications - ${selectedFilter}`}{' '}
            ({filteredNotifications.length})
          </h3>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500">Chargement...</div>
        ) : error ? (
          <div className="p-12 text-center text-red-500">{error}</div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleMarkRead(notif.id, notif.isRead)}
                  className={`p-6 hover:bg-gray-50 transition-colors cursor-pointer ${
                    !notif.isRead ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      {getTypeIcon(getVisualType(notif))}
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-1">
                            <h4 className="text-sm font-semibold text-gray-900">{notif.title}</h4>
                            {!notif.isRead && (
                              <span className="ml-2 w-2 h-2 bg-blue-600 rounded-full"></span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{notif.message}</p>
                          <div className="flex items-center text-xs text-gray-500">
                            <span className="inline-flex px-2 py-1 bg-gray-100 text-gray-700 mr-2 rounded">
                              {getCategory(notif.type)}
                            </span>
                            <Calendar className="w-3 h-3 mr-1" />
                            <span>{new Date(notif.createdAt).toLocaleString('fr-FR')}</span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(notif.id);
                          }}
                          className="ml-4 p-1.5 hover:bg-red-50 text-red-600 rounded transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">Aucune notification pour cette catégorie</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Statistiques */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 p-4 rounded shadow-sm">
          <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Total</h4>
          <p className="text-2xl font-semibold text-gray-900">{notifications.length}</p>
        </div>
        <div className="bg-white border border-gray-200 p-4 rounded shadow-sm">
          <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Non Lues</h4>
          <p className="text-2xl font-semibold text-blue-600">{nonLues}</p>
        </div>
        <div className="bg-white border border-gray-200 p-4 rounded shadow-sm">
          <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Candidatures</h4>
          <p className="text-2xl font-semibold text-gray-900">
            {notifications.filter((n) => getCategory(n.type) === 'Candidature').length}
          </p>
        </div>
        <div className="bg-white border border-gray-200 p-4 rounded shadow-sm">
          <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Entretiens</h4>
          <p className="text-2xl font-semibold text-gray-900">
            {notifications.filter((n) => getCategory(n.type) === 'Entretien').length}
          </p>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 p-4 rounded">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">Préférences de notification</h4>
        <p className="text-sm text-blue-800 mb-3">
          Vous recevrez également ces notifications par email à l'adresse que vous avez fournie lors de votre inscription.
        </p>
        <button className="text-sm text-[#0A6ED1] hover:underline">
          Gérer mes préférences email
        </button>
      </div>
    </div>
  );
}
