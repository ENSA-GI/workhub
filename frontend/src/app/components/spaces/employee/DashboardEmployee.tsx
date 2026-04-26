import { User, FileText, Calendar, Bell, Download, Clock } from 'lucide-react';

export default function DashboardEmployee() {
  const employee = {
    name: 'Mohammed Alami',
    poste: 'Développeur Full-Stack',
    department: 'IT',
    dateEntree: '2023-03-15',
    photo: 'MA',
  };

  const soldeCongés = {
    acquis: 22,
    pris: 8,
    enAttente: 3,
    restant: 11,
  };

  const demandesEnAttente = [
    { id: 1, type: 'Congé Annuel', dates: '25 Avr - 29 Avr 2026', jours: 5, statut: 'En attente' },
  ];

  const notificationsRecentes = [
    { id: 1, type: 'success', message: 'Votre demande de congé du 10-12 Avr a été approuvée', date: '2026-04-18' },
    { id: 2, type: 'info', message: 'Nouveau bulletin disponible pour Mars 2026', date: '2026-04-01' },
    { id: 3, type: 'info', message: 'Mise à jour de votre profil confirmée', date: '2026-03-28' },
  ];

  return (
    <div className="p-6 bg-[#F5F7FA]">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Bienvenue, {employee.name}</h1>
        <p className="text-sm text-gray-600 mt-1">Votre espace personnel WorkHub</p>
      </div>

      {/* Résumé Profil */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white border border-gray-200 p-6">
          <div className="flex items-start mb-4">
            <div className="w-16 h-16 bg-[#0A6ED1] flex items-center justify-center text-white text-xl mr-4">
              {employee.photo}
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">{employee.name}</h3>
              <p className="text-sm text-gray-600">{employee.poste}</p>
              <p className="text-xs text-gray-500 mt-1">{employee.department}</p>
            </div>
          </div>
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="w-4 h-4 mr-2" />
              <span>Depuis le {new Date(employee.dateEntree).toLocaleDateString('fr-FR')}</span>
            </div>
          </div>
        </div>

        {/* Prochain Bulletin */}
        <div className="bg-white border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <FileText className="w-5 h-5 text-green-600 mr-3" />
            <h3 className="text-xs font-medium text-gray-500 uppercase">Prochain Bulletin</h3>
          </div>
          <p className="text-2xl font-semibold text-gray-900 mb-2">Avril 2026</p>
          <p className="text-sm text-gray-600 mb-4">Disponible le 1er Mai 2026</p>
          <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 text-sm hover:bg-gray-200 flex items-center justify-center">
            <Download className="w-4 h-4 mr-2" />
            Dernier bulletin (Mars)
          </button>
        </div>

        {/* Solde Congés */}
        <div className="bg-white border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Calendar className="w-5 h-5 text-purple-600 mr-3" />
            <h3 className="text-xs font-medium text-gray-500 uppercase">Solde de Congés</h3>
          </div>
          <p className="text-2xl font-semibold text-gray-900 mb-4">{soldeCongés.restant} jours</p>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600">Acquis</span>
              <span className="font-medium text-gray-900">{soldeCongés.acquis} jours</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Pris</span>
              <span className="font-medium text-gray-900">{soldeCongés.pris} jours</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">En attente</span>
              <span className="font-medium text-orange-600">{soldeCongés.enAttente} jours</span>
            </div>
          </div>
        </div>
      </div>

      {/* Demandes en Attente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">Demandes en Attente</h3>
          </div>
          <div className="p-6">
            {demandesEnAttente.length > 0 ? (
              <div className="space-y-4">
                {demandesEnAttente.map((demande) => (
                  <div key={demande.id} className="bg-orange-50 border border-orange-200 p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{demande.type}</h4>
                        <p className="text-xs text-gray-600 mt-1">{demande.dates}</p>
                        <p className="text-xs text-gray-600">{demande.jours} jours</p>
                      </div>
                      <span className="inline-flex px-2 py-1 text-xs bg-orange-100 text-orange-800">
                        {demande.statut}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-600">Aucune demande en attente</p>
            )}
          </div>
        </div>

        {/* Notifications Récentes */}
        <div className="bg-white border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center">
              <Bell className="w-5 h-5 text-[#0A6ED1] mr-2" />
              <h3 className="text-base font-semibold text-gray-900">Notifications Récentes</h3>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {notificationsRecentes.map((notif) => (
                <div key={notif.id} className="pb-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-start">
                    <div
                      className={`w-2 h-2 mt-1.5 mr-3 flex-shrink-0 ${
                        notif.type === 'success' ? 'bg-green-600' : 'bg-blue-600'
                      }`}
                    ></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{notif.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notif.date).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Actions Rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="bg-white border border-gray-200 p-6 hover:border-[#0A6ED1] hover:shadow-md transition-all">
          <Calendar className="w-8 h-8 text-[#0A6ED1] mb-3" />
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Demander un Congé</h3>
          <p className="text-xs text-gray-600">Soumettre une nouvelle demande</p>
        </button>
        <button className="bg-white border border-gray-200 p-6 hover:border-[#0A6ED1] hover:shadow-md transition-all">
          <FileText className="w-8 h-8 text-green-600 mb-3" />
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Mes Bulletins</h3>
          <p className="text-xs text-gray-600">Consulter et télécharger</p>
        </button>
        <button className="bg-white border border-gray-200 p-6 hover:border-[#0A6ED1] hover:shadow-md transition-all">
          <User className="w-8 h-8 text-purple-600 mb-3" />
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Mon Profil</h3>
          <p className="text-xs text-gray-600">Mettre à jour mes informations</p>
        </button>
      </div>
    </div>
  );
}
