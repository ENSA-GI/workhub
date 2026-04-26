import { Calendar, Plus, Upload, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useState } from 'react';

export default function MesCongesEmployee() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'Congé Annuel',
    dateDebut: '',
    dateFin: '',
    justification: '',
  });

  const soldeCongés = {
    acquis: 22,
    pris: 8,
    enAttente: 3,
    restant: 11,
  };

  const historiqueDemandes = [
    { id: 1, type: 'Congé Annuel', dateDebut: '2026-04-25', dateFin: '2026-04-29', jours: 5, statut: 'En attente', date: '2026-04-18', justification: 'Vacances familiales' },
    { id: 2, type: 'Congé Annuel', dateDebut: '2026-04-10', dateFin: '2026-04-12', jours: 3, statut: 'Approuvé', date: '2026-04-05', justification: 'Voyage personnel', reponseRH: 'Approuvé par Sara Bennani' },
    { id: 3, type: 'Congé Maladie', dateDebut: '2026-03-20', dateFin: '2026-03-22', jours: 3, statut: 'Approuvé', date: '2026-03-19', justification: 'Maladie', certificatMedical: true },
    { id: 4, type: 'Congé Annuel', dateDebut: '2026-02-15', dateFin: '2026-02-16', jours: 2, statut: 'Refusé', date: '2026-02-10', justification: 'Raisons personnelles', reponseRH: 'Période de forte charge' },
  ];

  const calculateDays = () => {
    if (formData.dateDebut && formData.dateFin) {
      const start = new Date(formData.dateDebut);
      const end = new Date(formData.dateFin);
      const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      return diff > 0 ? diff : 0;
    }
    return 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowForm(false);
    setFormData({
      type: 'Congé Annuel',
      dateDebut: '',
      dateFin: '',
      justification: '',
    });
  };

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case 'Approuvé':
        return 'bg-green-100 text-green-800';
      case 'Refusé':
        return 'bg-red-100 text-red-800';
      case 'En attente':
        return 'bg-orange-100 text-orange-800';
      case 'Reporté':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatutIcon = (statut: string) => {
    switch (statut) {
      case 'Approuvé':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'Refusé':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'En attente':
        return <Clock className="w-5 h-5 text-orange-600" />;
      default:
        return <Calendar className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <div className="p-6 bg-[#F5F7FA]">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Mes Congés</h1>
          <p className="text-sm text-gray-600 mt-1">Gérez vos demandes de congés et consultez votre solde</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-[#0A6ED1] text-white hover:bg-[#0959b0] flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle Demande
        </button>
      </div>

      {/* Solde de Congés */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 p-6">
          <h3 className="text-xs font-medium text-gray-500 uppercase mb-2">Jours Acquis</h3>
          <p className="text-3xl font-semibold text-gray-900">{soldeCongés.acquis}</p>
        </div>
        <div className="bg-white border border-gray-200 p-6">
          <h3 className="text-xs font-medium text-gray-500 uppercase mb-2">Jours Pris</h3>
          <p className="text-3xl font-semibold text-gray-900">{soldeCongés.pris}</p>
        </div>
        <div className="bg-white border border-gray-200 p-6">
          <h3 className="text-xs font-medium text-gray-500 uppercase mb-2">En Attente</h3>
          <p className="text-3xl font-semibold text-orange-600">{soldeCongés.enAttente}</p>
        </div>
        <div className="bg-white border border-gray-200 p-6">
          <h3 className="text-xs font-medium text-gray-500 uppercase mb-2">Restants</h3>
          <p className="text-3xl font-semibold text-[#0A6ED1]">{soldeCongés.restant}</p>
        </div>
      </div>

      {/* Formulaire Nouvelle Demande */}
      {showForm && (
        <div className="bg-white border border-gray-200 p-6 mb-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Nouvelle Demande de Congé</h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type de Congé</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]"
                  required
                >
                  <option>Congé Annuel</option>
                  <option>Congé Maladie</option>
                  <option>Congé Exceptionnel</option>
                  <option>Congé Sans Solde</option>
                </select>
              </div>
              <div></div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date de Début</label>
                <input
                  type="date"
                  value={formData.dateDebut}
                  onChange={(e) => setFormData({ ...formData, dateDebut: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date de Fin</label>
                <input
                  type="date"
                  value={formData.dateFin}
                  onChange={(e) => setFormData({ ...formData, dateFin: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]"
                  required
                />
              </div>
            </div>

            {formData.dateDebut && formData.dateFin && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200">
                <p className="text-sm text-blue-900">
                  Durée : <span className="font-semibold">{calculateDays()} jour(s)</span>
                </p>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Justification</label>
              <textarea
                value={formData.justification}
                onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]"
                placeholder="Motif de votre demande..."
                required
              ></textarea>
            </div>

            {formData.type === 'Congé Maladie' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Certificat Médical</label>
                <div className="border-2 border-dashed border-gray-300 p-6 text-center hover:border-[#0A6ED1] cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Cliquez pour télécharger le certificat médical</p>
                  <p className="text-xs text-gray-500 mt-1">PDF, JPG ou PNG (max 5MB)</p>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-4">
              <button
                type="submit"
                className="px-4 py-2 bg-[#0A6ED1] text-white hover:bg-[#0959b0]"
              >
                Soumettre la Demande
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Historique des Demandes */}
      <div className="bg-white border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-900">Historique de Mes Demandes</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {historiqueDemandes.map((demande) => (
              <div key={demande.id} className="border border-gray-200 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start">
                    {getStatutIcon(demande.statut)}
                    <div className="ml-3">
                      <h4 className="text-sm font-semibold text-gray-900">{demande.type}</h4>
                      <p className="text-xs text-gray-600 mt-1">
                        Du {new Date(demande.dateDebut).toLocaleDateString('fr-FR')} au{' '}
                        {new Date(demande.dateFin).toLocaleDateString('fr-FR')} ({demande.jours} jours)
                      </p>
                    </div>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs ${getStatutBadge(demande.statut)}`}>
                    {demande.statut}
                  </span>
                </div>
                <div className="pl-8">
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">Justification :</span> {demande.justification}
                  </p>
                  {demande.certificatMedical && (
                    <p className="text-xs text-blue-600 mb-2">
                      📎 Certificat médical joint
                    </p>
                  )}
                  {demande.reponseRH && (
                    <div className="mt-2 p-2 bg-gray-50 border-l-4 border-gray-300">
                      <p className="text-xs text-gray-700">
                        <span className="font-medium">Réponse RH :</span> {demande.reponseRH}
                      </p>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    Demandé le {new Date(demande.date).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
