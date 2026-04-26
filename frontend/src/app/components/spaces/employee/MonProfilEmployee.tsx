import { User, Edit, Save, X, Calendar, DollarSign, Download, CreditCard } from 'lucide-react';
import { useState } from 'react';

export default function MonProfilEmployee() {
  const [isEditing, setIsEditing] = useState(false);
  const [editableData, setEditableData] = useState({
    adresse: '15 Rue Mohammed V, Casablanca',
    telephone: '+212 6 12 34 56 78',
    rib: 'MA64 0111 2222 3333 4444 5555 66',
  });

  const employeeData = {
    nom: 'Mohammed Alami',
    prenom: 'Mohammed',
    email: 'mohammed.alami@techvision.ma',
    dateNaissance: '1990-05-15',
    cin: 'AB123456',
    poste: 'Développeur Full-Stack',
    department: 'IT',
    dateEntree: '2023-03-15',
    typeContrat: 'CDI',
    statut: 'Actif',
  };

  const historiqueSalaire = [
    { id: 1, date: '2024-01-01', salaire: 6500, typeChangement: 'Augmentation annuelle' },
    { id: 2, date: '2023-07-01', salaire: 6000, typeChangement: 'Promotion' },
    { id: 3, date: '2023-03-15', salaire: 5500, typeChangement: 'Salaire initial' },
  ];

  const documents = [
    { id: 1, nom: 'Contrat de travail', type: 'PDF', date: '2023-03-15', taille: '245 KB' },
    { id: 2, nom: 'Attestation de travail', type: 'PDF', date: '2026-01-10', taille: '128 KB' },
    { id: 3, nom: 'Certificat médical', type: 'PDF', date: '2025-11-20', taille: '89 KB' },
  ];

  const soldeCongés = {
    acquis: 22,
    pris: 8,
    enAttente: 3,
    restant: 11,
  };

  const handleSave = () => {
    setIsEditing(false);
    // Logique de sauvegarde
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditableData({
      adresse: '15 Rue Mohammed V, Casablanca',
      telephone: '+212 6 12 34 56 78',
      rib: 'MA64 0111 2222 3333 4444 5555 66',
    });
  };

  return (
    <div className="p-6 bg-[#F5F7FA]">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Mon Profil</h1>
          <p className="text-sm text-gray-600 mt-1">Consultez et mettez à jour vos informations personnelles</p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-[#0A6ED1] text-white hover:bg-[#0959b0] flex items-center"
          >
            <Edit className="w-4 h-4 mr-2" />
            Modifier mes informations
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Informations Personnelles */}
        <div className="lg:col-span-2 bg-white border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">Informations Personnelles</h3>
            {isEditing && (
              <p className="text-xs text-orange-600 mt-1">* Les champs grisés sont en lecture seule</p>
            )}
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                <input
                  type="text"
                  value={employeeData.nom}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                <input
                  type="text"
                  value={employeeData.prenom}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={employeeData.email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date de Naissance</label>
                <input
                  type="text"
                  value={new Date(employeeData.dateNaissance).toLocaleDateString('fr-FR')}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CIN</label>
                <input
                  type="text"
                  value={employeeData.cin}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone *</label>
                <input
                  type="text"
                  value={editableData.telephone}
                  onChange={(e) => setEditableData({ ...editableData, telephone: e.target.value })}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border border-gray-300 ${
                    isEditing ? 'focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]' : 'bg-gray-50'
                  }`}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Adresse *</label>
                <input
                  type="text"
                  value={editableData.adresse}
                  onChange={(e) => setEditableData({ ...editableData, adresse: e.target.value })}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border border-gray-300 ${
                    isEditing ? 'focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]' : 'bg-gray-50'
                  }`}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">RIB Bancaire *</label>
                <div className="flex items-center">
                  <CreditCard className="w-5 h-5 text-gray-400 mr-2" />
                  <input
                    type="text"
                    value={editableData.rib}
                    onChange={(e) => setEditableData({ ...editableData, rib: e.target.value })}
                    disabled={!isEditing}
                    className={`flex-1 px-3 py-2 border border-gray-300 ${
                      isEditing ? 'focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]' : 'bg-gray-50'
                    }`}
                  />
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="mt-6 flex items-center space-x-4">
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-[#0A6ED1] text-white hover:bg-[#0959b0] flex items-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Enregistrer
                </button>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center"
                >
                  <X className="w-4 h-4 mr-2" />
                  Annuler
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Solde Congés */}
        <div className="bg-white border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center">
              <Calendar className="w-5 h-5 text-purple-600 mr-2" />
              <h3 className="text-base font-semibold text-gray-900">Solde de Congés</h3>
            </div>
          </div>
          <div className="p-6">
            <div className="mb-4">
              <p className="text-3xl font-semibold text-gray-900">{soldeCongés.restant} jours</p>
              <p className="text-sm text-gray-600">Disponibles</p>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between pb-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Acquis</span>
                <span className="text-sm font-medium text-gray-900">{soldeCongés.acquis} jours</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Pris</span>
                <span className="text-sm font-medium text-gray-900">{soldeCongés.pris} jours</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">En attente</span>
                <span className="text-sm font-medium text-orange-600">{soldeCongés.enAttente} jours</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Informations Contractuelles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">Informations Contractuelles</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex justify-between pb-3 border-b border-gray-100">
              <span className="text-sm text-gray-600">Poste</span>
              <span className="text-sm font-medium text-gray-900">{employeeData.poste}</span>
            </div>
            <div className="flex justify-between pb-3 border-b border-gray-100">
              <span className="text-sm text-gray-600">Département</span>
              <span className="text-sm font-medium text-gray-900">{employeeData.department}</span>
            </div>
            <div className="flex justify-between pb-3 border-b border-gray-100">
              <span className="text-sm text-gray-600">Type de Contrat</span>
              <span className="text-sm font-medium text-gray-900">{employeeData.typeContrat}</span>
            </div>
            <div className="flex justify-between pb-3 border-b border-gray-100">
              <span className="text-sm text-gray-600">Date d'entrée</span>
              <span className="text-sm font-medium text-gray-900">
                {new Date(employeeData.dateEntree).toLocaleDateString('fr-FR')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Statut</span>
              <span className="inline-flex px-2 py-1 text-xs bg-green-100 text-green-800">
                {employeeData.statut}
              </span>
            </div>
          </div>
        </div>

        {/* Historique de Salaire */}
        <div className="bg-white border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center">
              <DollarSign className="w-5 h-5 text-green-600 mr-2" />
              <h3 className="text-base font-semibold text-gray-900">Historique de Salaire</h3>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {historiqueSalaire.map((entry) => (
                <div key={entry.id} className="pb-4 border-b border-gray-100 last:border-b-0">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">MAD {entry.salaire.toLocaleString()}/mois</span>
                    <span className="text-xs text-gray-500">
                      {new Date(entry.date).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">{entry.typeChangement}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Documents Téléchargeables */}
      <div className="bg-white border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-900">Documents Téléchargeables</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Document</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Taille</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{doc.nom}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800">{doc.type}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(doc.date).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{doc.taille}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="px-3 py-1 border border-gray-300 text-gray-700 text-xs hover:bg-gray-50 flex items-center ml-auto">
                      <Download className="w-3 h-3 mr-1" />
                      Télécharger
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
