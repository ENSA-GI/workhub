import { AlertCircle, Bell, CheckCircle, FileText, Filter, Trash2, XCircle } from 'lucide-react';

import { useCallback, useEffect, useMemo, useState } from 'react';

const API_BASE = 'http://localhost:8080';
const DEMO_EMPLOYEE_ID = '111e8400-e29b-41d4-a716-446655440000';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  isRead: boolean;
  createdAt: string;
}

const CATEGORY_BY_TYPE: Record<string, string> = {
  LEAVE_REQUEST: 'Conges',
  LEAVE_APPROVED: 'Conges',
  LEAVE_REJECTED: 'Conges',
  PAYROLL_GENERATED: 'Paie',
  PROFILE_UPDATED: 'Profil',
  DOCUMENT_UPLOADED: 'RH',
  EMPLOYEE_CREATED: 'RH',
  SALARY_CHANGED: 'RH',
};

const categories = ['Toutes', 'Conges', 'Paie', 'Profil', 'RH'];

function categoryOf(notification: Notification) {
  return CATEGORY_BY_TYPE[notification.type] || 'RH';
}

function visualType(notification: Notification) {
  if (notification.type === 'LEAVE_APPROVED') return 'success';
  if (notification.type === 'LEAVE_REJECTED') return 'error';
  if (notification.type === 'LEAVE_REQUEST') return 'warning';
  return 'info';
}

export default function NotificationsEmployee() {
  const userId = (() => { try { const t = localStorage.getItem('workhub.token'); return t ? JSON.parse(atob(t.split('.')[1])).sub || DEMO_EMPLOYEE_ID : DEMO_EMPLOYEE_ID; } catch { return DEMO_EMPLOYEE_ID; } })();
  const [selectedFilter, setSelectedFilter] = useState('Toutes');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadNotifications = useCallback(async () => {
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
      console.error('Erreur notifications:', err);
      setError('Impossible de charger les notifications.');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const filteredNotifications = useMemo(() => {
    if (selectedFilter === 'Toutes') return notifications;
    return notifications.filter((notification) => categoryOf(notification) === selectedFilter);
  }, [notifications, selectedFilter]);

  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'error':
        return <XCircle className="w-6 h-6 text-red-600" />;
      case 'warning':
        return <AlertCircle className="w-6 h-6 text-orange-600" />;
      default:
        return <FileText className="w-6 h-6 text-blue-600" />;
    }
  };

  const markAllRead = async () => {
    await fetch(`${API_BASE}/notifications/notifications/read-all?userId=${userId}`, {
      method: 'POST',
    });
    await loadNotifications();
  };

  const markRead = async (notification: Notification) => {
    if (notification.isRead) return;
    await fetch(`${API_BASE}/notifications/notifications/${notification.id}/read`, {
      method: 'POST',
    });
    setNotifications((current) =>
      current.map((item) => item.id === notification.id ? { ...item, isRead: true } : item)
    );
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer cette notification ?')) return;
    await fetch(`${API_BASE}/notifications/notifications/${id}`, {
      method: 'DELETE',
    });
    setNotifications((current) => current.filter((notification) => notification.id !== id));
  };

  return (
    <div className="p-6 bg-[#F5F7FA] min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Notifications</h1>
        <p className="text-sm text-gray-600 mt-1">
          Suivez vos alertes de conges, paie et RH
          {unreadCount > 0 && (
            <span className="ml-2 inline-flex px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
              {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
            </span>
          )}
        </p>
      </div>

      <div className="bg-white border border-gray-200 p-4 mb-6 rounded">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filtrer par :</span>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedFilter(category)}
                className={`px-3 py-1 text-sm rounded ${
                  selectedFilter === category
                    ? 'bg-[#0A6ED1] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          <button onClick={markAllRead} className="text-sm text-[#0A6ED1] hover:underline disabled:opacity-50" disabled={!unreadCount}>
            Tout marquer comme lu
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-900">
            {selectedFilter === 'Toutes' ? 'Toutes les notifications' : `Notifications - ${selectedFilter}`} ({filteredNotifications.length})
          </h3>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-600">Chargement...</div>
        ) : error ? (
          <div className="p-12 text-center text-red-600">{error}</div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => markRead(notification)}
                  className={`w-full text-left p-6 hover:bg-gray-50 transition-colors ${
                    !notification.isRead ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0">{getTypeIcon(visualType(notification))}</div>
                    <div className="ml-4 flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center mb-1">
                            <h4 className="text-sm font-semibold text-gray-900">{notification.title}</h4>
                            {!notification.isRead && <span className="ml-2 w-2 h-2 bg-blue-600 rounded-full" />}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                          <div className="flex items-center text-xs text-gray-500">
                            <span className="inline-flex px-2 py-1 bg-gray-100 text-gray-700 mr-2 rounded">
                              {categoryOf(notification)}
                            </span>
                            <span>{new Date(notification.createdAt).toLocaleString('fr-FR')}</span>
                          </div>
                        </div>
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(event) => {
                            event.stopPropagation();
                            handleDelete(notification.id);
                          }}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault();
                              event.stopPropagation();
                              handleDelete(notification.id);
                            }
                          }}
                          className="p-1 hover:bg-red-50 text-red-600 flex-shrink-0 rounded"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="p-12 text-center">
                <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">Aucune notification pour cette categorie</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 p-4 rounded">
          <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Total</h4>
          <p className="text-2xl font-semibold text-gray-900">{notifications.length}</p>
        </div>
        <div className="bg-white border border-gray-200 p-4 rounded">
          <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Non lues</h4>
          <p className="text-2xl font-semibold text-blue-600">{unreadCount}</p>
        </div>
        <div className="bg-white border border-gray-200 p-4 rounded">
          <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Conges</h4>
          <p className="text-2xl font-semibold text-gray-900">
            {notifications.filter((notification) => categoryOf(notification) === 'Conges').length}
          </p>
        </div>
        <div className="bg-white border border-gray-200 p-4 rounded">
          <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Paie</h4>
          <p className="text-2xl font-semibold text-gray-900">
            {notifications.filter((notification) => categoryOf(notification) === 'Paie').length}
          </p>
        </div>
      </div>
    </div>
  );
}
