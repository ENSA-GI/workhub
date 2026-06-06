import { FileText, Upload, Download, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function MesDocumentsCandidat() {
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadType, setUploadType] = useState<'cv' | 'lettre' | null>(null);

  const cvVersions = [
    { id: 1, nom: 'CV_Karim_Alami_2026.pdf', date: '2026-04-10', taille: '245 KB', actuel: true },
    { id: 2, nom: 'CV_Karim_Alami_Dev.pdf', date: '2026-03-15', taille: '238 KB', actuel: false },
    { id: 3, nom: 'CV_Karim_Alami_2025.pdf', date: '2025-12-20', taille: '232 KB', actuel: false },
  ];

  const lettresMotivation = [
    { id: 1, nom: 'LM_DevOps_TechVision.pdf', date: '2026-04-10', taille: '156 KB', offre: 'DevOps Engineer' },
    { id: 2, nom: 'LM_FullStack_TechVision.pdf', date: '2026-04-16', taille: '148 KB', offre: 'Développeur Full-Stack' },
  ];

  const handleDelete = (type: 'cv' | 'lettre', id: number, nom: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer "${nom}" ?`)) {
      // Logique de suppression
    }
  };

  const handleSetActuel = (id: number) => {
    // Logique pour définir comme CV actuel
  };

  return (
    <div className="p-6 bg-[#F5F7FA]">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Mes Documents</h1>
        <p className="text-sm text-gray-600 mt-1">Gérez vos CV et lettres de motivation</p>
      </div>

      {/* Upload Form */}
      {showUploadForm && (
        <div className="bg-white border border-gray-200 p-6 mb-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            Ajouter un {uploadType === 'cv' ? 'CV' : 'Lettre de Motivation'}
          </h3>
          <form>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Nom du Document</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]"
                placeholder={uploadType === 'cv' ? 'Ex: CV_Nom_Prénom_2026.pdf' : 'Ex: LM_Poste_Entreprise.pdf'}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Fichier</label>
              <div className="border-2 border-dashed border-gray-300 p-8 text-center hover:border-[#0A6ED1] cursor-pointer">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-1">Cliquez pour télécharger ou glissez-déposez</p>
                <p className="text-xs text-gray-500">PDF (max 5MB)</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button type="submit" className="px-4 py-2 bg-[#0A6ED1] text-white hover:bg-[#0959b0]">
                Télécharger
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowUploadForm(false);
                  setUploadType(null);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CV Versions */}
        <div className="bg-white border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">Mes CV ({cvVersions.length})</h3>
            <button
              onClick={() => {
                setShowUploadForm(true);
                setUploadType('cv');
              }}
              className="px-3 py-1 bg-[#0A6ED1] text-white text-sm hover:bg-[#0959b0] flex items-center"
            >
              <Upload className="w-3 h-3 mr-1" />
              Ajouter
            </button>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {cvVersions.map((cv) => (
                <div
                  key={cv.id}
                  className={`border p-4 ${
                    cv.actuel ? 'border-[#0A6ED1] bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start flex-1">
                      <FileText className={`w-5 h-5 mr-3 mt-0.5 ${cv.actuel ? 'text-[#0A6ED1]' : 'text-gray-400'}`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{cv.nom}</p>
                        <p className="text-xs text-gray-600 mt-1">
                          {new Date(cv.date).toLocaleDateString('fr-FR')} • {cv.taille}
                        </p>
                        {cv.actuel && (
                          <span className="inline-flex px-2 py-1 text-xs bg-[#0A6ED1] text-white mt-2">
                            CV Actuel
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 mt-3">
                    <button className="flex-1 px-3 py-1 border border-gray-300 text-gray-700 text-xs hover:bg-gray-50 flex items-center justify-center">
                      <Download className="w-3 h-3 mr-1" />
                      Télécharger
                    </button>
                    {!cv.actuel && (
                      <>
                        <button
                          onClick={() => handleSetActuel(cv.id)}
                          className="flex-1 px-3 py-1 bg-[#0A6ED1] text-white text-xs hover:bg-[#0959b0]"
                        >
                          Définir comme actuel
                        </button>
                        <button
                          onClick={() => handleDelete('cv', cv.id, cv.nom)}
                          className="p-1 hover:bg-red-50 text-red-600"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Lettres de Motivation */}
        <div className="bg-white border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">Lettres de Motivation ({lettresMotivation.length})</h3>
            <button
              onClick={() => {
                setShowUploadForm(true);
                setUploadType('lettre');
              }}
              className="px-3 py-1 bg-[#0A6ED1] text-white text-sm hover:bg-[#0959b0] flex items-center"
            >
              <Upload className="w-3 h-3 mr-1" />
              Ajouter
            </button>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {lettresMotivation.map((lettre) => (
                <div key={lettre.id} className="border border-gray-200 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start flex-1">
                      <FileText className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{lettre.nom}</p>
                        <p className="text-xs text-gray-600 mt-1">
                          {new Date(lettre.date).toLocaleDateString('fr-FR')} • {lettre.taille}
                        </p>
                        <p className="text-xs text-[#0A6ED1] mt-1">Pour: {lettre.offre}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 mt-3">
                    <button className="flex-1 px-3 py-1 border border-gray-300 text-gray-700 text-xs hover:bg-gray-50 flex items-center justify-center">
                      <Download className="w-3 h-3 mr-1" />
                      Télécharger
                    </button>
                    <button
                      onClick={() => handleDelete('lettre', lettre.id, lettre.nom)}
                      className="p-1 hover:bg-red-50 text-red-600"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">Conseils pour vos documents</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Gardez votre CV à jour avec vos dernières expériences et compétences</li>
          <li>• Personnalisez votre lettre de motivation pour chaque offre</li>
          <li>• Utilisez des noms de fichiers clairs et professionnels</li>
          <li>• Format recommandé : PDF (max 5MB par fichier)</li>
          <li>• Le CV marqué "actuel" sera utilisé automatiquement lors de vos candidatures</li>
        </ul>
      </div>
    </div>
  );
}
