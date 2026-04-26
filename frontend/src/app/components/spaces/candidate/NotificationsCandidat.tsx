import { Bell, CheckCircle, Calendar, FileText, AlertCircle, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function NotificationsCandidat() {
  const [selectedFilter, setSelectedFilter] = useState('Toutes');

  const notifications = [
    {
      id: 1,
      type: 'success',
      categorie: 'Candidature',
      titre: 'Candidature confirmée',
      message: 'Votre candidature pour le poste "Développeur Full-Stack Senior" a bien été reçue',
      date: '2026-04-16 14:35',
      lu: false,
    },
    {
      id: 2,
      type: 'info',
      categorie: 'Entretien',
      titre: 'Convocation entretien',
      message: 'Vous êtes convoqué à un entretien pour le poste "Développeur Full-Stack Senior" le 25 Avril 2026 à 14:00',
      date: '2026-04-18 15:20',
      lu: false,
    },
    {
      id: 3,
      type: 'warning',
      categorie: 'Entretien',
      titre: 'Rappel entretien',
      message: 'Rappel : Entretien technique pour "DevOps Engineer" demain à 10:00 en présentiel',
      date: '2026-04-22 09:00',
      lu: true,
    },
    {
      id: 4,
      type: 'info',
      categorie: 'Statut',
      titre: 'Mise à jour statut candidature',
      message: 'Votre candidature pour "DevOps Engineer" est passée en phase "Entretien technique"',
      date: '2026-04-18 14:00',
      lu: true,
    },
    {
      id: 5,
      type: 'success',
      categorie: 'Candidature',
      titre: 'Candidature confirmée',
      message: 'Votre candidature pour le poste "DevOps Engineer" a bien été reçue',
      date: '2026-04-10 09:20',
      lu: true,
    },
    {
      id: 6,
      type: 'error',
      categorie: 'Statut',
      titre: 'Candidature non retenue',
      message: 'Nous vous remercions pour votre candidature au poste "Analyste de Données". Malheureusement, votre profil ne correspond pas aux exigences actuelles.',
      date: '2026-04-12 16:45',
      lu: true,
    },
  ];

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

  const handleDelete = (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette notification ?')) {
      // Logique de suppression
    }
  };

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
          <button className="text-sm text-[#0A6ED1] hover:underline">
            Tout marquer comme lu
          </button>
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
                className={`p-6 hover:bg-gray-50 transition-colors ${
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
                        onClick={() => handleDelete(notif.id)}
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
