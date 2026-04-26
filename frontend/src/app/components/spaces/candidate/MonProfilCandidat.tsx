import { User, Edit, Save, X, Upload, Download, Linkedin } from 'lucide-react';
import { useState } from 'react';

export default function MonProfilCandidat() {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    nom: 'Alami',
    prenom: 'Karim',
    email: 'karim.alami@email.com',
    telephone: '+212 6 98 76 54 32',
    adresse: '45 Rue des Orangers, Casablanca',
    linkedinUrl: 'https://linkedin.com/in/karimalami',
  });

  const [preferences, setPreferences] = useState({
    typeContrat: ['CDI', 'CDD'],
    localisation: ['Casablanca', 'Rabat'],
    salaireSouhaite: 'MAD 5,000 - MAD 7,000',
    disponibilite: 'Immédiate',
    teletravail: true,
  });

  const cvActuel = {
    nom: 'CV_Karim_Alami_2026.pdf',
    dateUpload: '2026-04-10',
    taille: '245 KB',
  };

  const handleSave = () => {
    setIsEditing(false);
    // Logique de sauvegarde
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <div className="p-6 bg-[#F5F7FA]">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Mon Profil Candidat</h1>
          <p className="text-sm text-gray-600 mt-1">Gérez vos informations et préférences de recherche</p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-[#0A6ED1] text-white hover:bg-[#0959b0] flex items-center"
          >
            <Edit className="w-4 h-4 mr-2" />
            Modifier mon profil
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Informations Personnelles */}
        <div className="lg:col-span-2 bg-white border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">Informations Personnelles</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                <input
                  type="text"
                  value={profileData.nom}
                  onChange={(e) => setProfileData({ ...profileData, nom: e.target.value })}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border border-gray-300 ${
                    isEditing ? 'focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]' : 'bg-gray-50'
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                <input
                  type="text"
                  value={profileData.prenom}
                  onChange={(e) => setProfileData({ ...profileData, prenom: e.target.value })}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border border-gray-300 ${
                    isEditing ? 'focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]' : 'bg-gray-50'
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border border-gray-300 ${
                    isEditing ? 'focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]' : 'bg-gray-50'
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                <input
                  type="text"
                  value={profileData.telephone}
                  onChange={(e) => setProfileData({ ...profileData, telephone: e.target.value })}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border border-gray-300 ${
                    isEditing ? 'focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]' : 'bg-gray-50'
                  }`}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
                <input
                  type="text"
                  value={profileData.adresse}
                  onChange={(e) => setProfileData({ ...profileData, adresse: e.target.value })}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border border-gray-300 ${
                    isEditing ? 'focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]' : 'bg-gray-50'
                  }`}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Profil LinkedIn</label>
                <div className="flex items-center">
                  <Linkedin className="w-5 h-5 text-[#0A6ED1] mr-2" />
                  <input
                    type="url"
                    value={profileData.linkedinUrl}
                    onChange={(e) => setProfileData({ ...profileData, linkedinUrl: e.target.value })}
                    disabled={!isEditing}
                    placeholder="https://linkedin.com/in/votre-profil"
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

        {/* CV Actuel */}
        <div className="bg-white border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">CV Actuel</h3>
          </div>
          <div className="p-6">
            <div className="bg-gray-50 border border-gray-200 p-4 mb-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{cvActuel.nom}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Uploadé le {new Date(cvActuel.dateUpload).toLocaleDateString('fr-FR')}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{cvActuel.taille}</p>
                </div>
              </div>
              <button className="w-full px-3 py-2 border border-gray-300 text-gray-700 text-sm hover:bg-gray-50 flex items-center justify-center mt-3">
                <Download className="w-4 h-4 mr-2" />
                Télécharger
              </button>
            </div>

            <div className="border-2 border-dashed border-gray-300 p-6 text-center hover:border-[#0A6ED1] cursor-pointer">
              <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600 mb-1">Mettre à jour mon CV</p>
              <p className="text-xs text-gray-500">PDF (max 5MB)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Préférences de Recherche */}
      <div className="bg-white border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-900">Préférences de Recherche</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type de Contrat Recherché</label>
              <div className="space-y-2">
                {['CDI', 'CDD', 'Stage', 'Freelance'].map((type) => (
                  <label key={type} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={preferences.typeContrat.includes(type)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setPreferences({
                            ...preferences,
                            typeContrat: [...preferences.typeContrat, type],
                          });
                        } else {
                          setPreferences({
                            ...preferences,
                            typeContrat: preferences.typeContrat.filter((t) => t !== type),
                          });
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Localisation Préférée</label>
              <div className="space-y-2">
                {['Casablanca', 'Rabat', 'Marrakech', 'Tanger', 'Remote'].map((loc) => (
                  <label key={loc} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={preferences.localisation.includes(loc)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setPreferences({
                            ...preferences,
                            localisation: [...preferences.localisation, loc],
                          });
                        } else {
                          setPreferences({
                            ...preferences,
                            localisation: preferences.localisation.filter((l) => l !== loc),
                          });
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">{loc}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Salaire Souhaité</label>
              <input
                type="text"
                value={preferences.salaireSouhaite}
                onChange={(e) => setPreferences({ ...preferences, salaireSouhaite: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0A6ED1] mb-4"
              />

              <label className="block text-sm font-medium text-gray-700 mb-2">Disponibilité</label>
              <select
                value={preferences.disponibilite}
                onChange={(e) => setPreferences({ ...preferences, disponibilite: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0A6ED1] mb-4"
              >
                <option>Immédiate</option>
                <option>1 mois</option>
                <option>2 mois</option>
                <option>3 mois</option>
              </select>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={preferences.teletravail}
                  onChange={(e) => setPreferences({ ...preferences, teletravail: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Ouvert au télétravail</span>
              </label>
            </div>
          </div>

          <div className="mt-6">
            <button className="px-6 py-2 bg-[#0A6ED1] text-white hover:bg-[#0959b0]">
              Enregistrer les Préférences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
