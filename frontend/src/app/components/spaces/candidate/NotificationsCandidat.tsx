import { Bell, CheckCircle, Calendar, FileText, AlertCircle, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';

export default function NotificationsCandidat() {
  const { user } = useUser();
  const [selectedFilter, setSelectedFilter] = useState('Toutes');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [candidateId, setCandidateId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user?.primaryEmailAddress?.emailAddress) return;
      try {
        const email = user.primaryEmailAddress.emailAddress;
        // 1. Get candidateId by email
        const candRes = await fetch(`http://localhost:8085/api/candidates/by-email?email=${email}`);
        if (!candRes.ok) throw new Error("Candidat non trouvé");
        const candidate = await candRes.json();
        setCandidateId(candidate.id);

        // 2. Get notifications
        const notifRes = await fetch(`http://localhost:8080/notifications/notifications?userId=${candidate.id}`);
        if (!notifRes.ok) throw new Error("Notifications non chargées");
        const data = await notifRes.json();

        // 3. Map notifications
        const mapped = data.map((n: any) => {
          let type = 'info';
          let categorie = 'Statut';
          if (n.type === 'INTERVIEW_SCHEDULED') {
            type = 'info';
            categorie = 'Entretien';
          } else if (n.title.toLowerCase().includes('accept') || n.title.toLowerCase().includes('félicitation') || n.title.toLowerCase().includes('retenu')) {
            type = 'success';
            categorie = 'Candidature';
          } else if (n.title.toLowerCase().includes('non retenu') || n.title.toLowerCase().includes('refus')) {
            type = 'error';
            categorie = 'Candidature';
          }

          return {
            id: n.id,
            type: type,
            categorie: categorie,
            titre: n.title,
            message: n.message,
            date: n.createdAt,
            lu: n.isRead,
          };
        });

        setNotifications(mapped);
      } catch (err) {
        console.error("Erreur lors de la récupération des notifications:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const categories = ['Toutes', 'Candidature', 'Entretien', 'Statut'];

  const filteredNotifications = selectedFilter === 'Toutes'
    ? notifications
    : notifications.filter((notif) => notif.categorie === selectedFilter);

  const nonLues = notifications.filter((n) => !n.lu).length;

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

  const handleMarkAsRead = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:8080/notifications/notifications/${id}/read`, {
        method: 'POST',
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, lu: true } : n));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    if (!candidateId) return;
    try {
      const res = await fetch(`http://localhost:8080/notifications/notifications/read-all?userId=${candidateId}`, {
        method: 'POST',
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, lu: true })));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette notification ?')) {
      try {
        const res = await fetch(`http://localhost:8080/notifications/notifications/${id}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          setNotifications(prev => prev.filter(n => n.id !== id));
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-[#F5F7FA] min-h-screen flex items-center justify-center">
        <p className="text-gray-600 text-sm">Chargement des notifications...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-[#F5F7FA]">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Notifications</h1>
        <p className="text-sm text-gray-600 mt-1">
          Restez informé de l'évolution de vos candidatures
          {nonLues > 0 && (
            <span className="ml-2 inline-flex px-2 py-1 text-xs bg-red-100 text-red-800">
              {nonLues} non lue{nonLues > 1 ? 's' : ''}
            </span>
          )}
        </p>
      </div>

      {/* Filtres */}
      <div className="bg-white border border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filtrer par :</span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedFilter(cat)}
                className={`px-3 py-1 text-sm ${
                  selectedFilter === cat
                    ? 'bg-[#0A6ED1] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          {nonLues > 0 && (
            <button 
              onClick={handleMarkAllRead}
              className="text-sm text-[#0A6ED1] hover:underline"
            >
              Tout marquer comme lu
            </button>
          )}
        </div>
      </div>

      {/* Liste des Notifications */}
      <div className="bg-white border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-900">
            {selectedFilter === 'Toutes' ? 'Toutes les Notifications' : `Notifications - ${selectedFilter}`}{' '}
            ({filteredNotifications.length})
          </h3>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => !notif.lu && handleMarkAsRead(notif.id)}
                className={`p-6 hover:bg-gray-50 transition-colors cursor-pointer ${
                  !notif.lu ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    {getTypeIcon(notif.type)}
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-1">
                          <h4 className="text-sm font-semibold text-gray-900">{notif.titre}</h4>
                          {!notif.lu && (
                            <span className="ml-2 w-2 h-2 bg-blue-600 rounded-full"></span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{notif.message}</p>
                        <div className="flex items-center text-xs text-gray-500">
                          <span className="inline-flex px-2 py-1 bg-gray-100 text-gray-700 mr-2">
                            {notif.categorie}
                          </span>
                          <Calendar className="w-3 h-3 mr-1" />
                          <span>{new Date(notif.date).toLocaleString('fr-FR')}</span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(notif.id);
                        }}
                        className="ml-4 p-1 hover:bg-red-50 text-red-600 flex-shrink-0"
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
      </div>

      {/* Statistiques */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 p-4">
          <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Total</h4>
          <p className="text-2xl font-semibold text-gray-900">{notifications.length}</p>
        </div>
        <div className="bg-white border border-gray-200 p-4">
          <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Non Lues</h4>
          <p className="text-2xl font-semibold text-blue-600">{nonLues}</p>
        </div>
        <div className="bg-white border border-gray-200 p-4">
          <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Candidatures</h4>
          <p className="text-2xl font-semibold text-gray-900">
            {notifications.filter((n) => n.categorie === 'Candidature').length}
          </p>
        </div>
        <div className="bg-white border border-gray-200 p-4">
          <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Entretiens</h4>
          <p className="text-2xl font-semibold text-gray-900">
            {notifications.filter((n) => n.categorie === 'Entretien').length}
          </p>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 p-4">
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
