import { FileText, Upload, Download, Trash2, AlertCircle, Loader } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useApi } from '@/lib/useApi';
import { useOrganizationId } from '@/lib/useOrganizationId';
import { useUser } from '@/lib/useUser';

interface Document {
  id: string;
  fileName: string;
  type: string;
  uploadedAt: string;
  fileSize: number;
  description?: string;
  fileUrl: string;
}

export default function MesDocumentsCandidat() {
  const apiFetch = useApi();
  const organizationId = useOrganizationId();
  const { user } = useUser();

  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadType, setUploadType] = useState<'cv' | 'lettre' | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Load documents from API
  useEffect(() => {
    if (!organizationId || !user?.id) {
      setLoading(false);
      return;
    }
    
    const loadDocuments = async () => {
      try {
        setLoading(true);
        setError('');
        // Fetch documents for the current candidate
        const data = await apiFetch(
          `/documents?organizationId=${organizationId}&ownerType=CANDIDATE&ownerId=${user.id}`
        );
        setDocuments(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error loading documents:', err);
        setError('Impossible de charger vos documents. Veuillez réessayer.');
        setDocuments([]);
      } finally {
        setLoading(false);
      }
    };

    loadDocuments();
  }, [organizationId, user?.id, apiFetch]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !fileName) {
      setUploadError('Veuillez sélectionner un fichier et donner un nom');
      return;
    }

    try {
      setUploadLoading(true);
      setUploadError('');

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('organizationId', organizationId);
      formData.append('ownerType', 'CANDIDATE');
      formData.append('ownerId', user.id);
      formData.append('type', uploadType === 'cv' ? 'CV' : 'OTHER');
      formData.append('fileName', fileName);
      formData.append('description', uploadType === 'lettre' ? fileName : '');

      // Upload file via gateway
      const token = localStorage.getItem('workhub.token');
      const response = await fetch('/documents/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Erreur lors de l\'upload');
      }

      // Reload documents
      const data = await apiFetch(
        `/documents?organizationId=${organizationId}&ownerType=CANDIDATE&ownerId=${user.id}`
      );
      setDocuments(Array.isArray(data) ? data : []);
      
      // Reset form
      setShowUploadForm(false);
      setUploadType(null);
      setFileName('');
      setSelectedFile(null);
    } catch (err) {
      console.error('Upload error:', err);
      setUploadError(err instanceof Error ? err.message : 'Erreur lors du téléchargement');
    } finally {
      setUploadLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Separate CVs and lettres
  const cvVersions = documents.filter(doc => doc.type === 'CV');
  const lettresMotivation = documents.filter(doc => doc.type === 'OTHER');

  if (!organizationId || !user?.id) {
    return (
      <div className="p-6 bg-[#F5F7FA]">
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
            <div>
              <h3 className="text-sm font-semibold text-yellow-900">Informations manquantes</h3>
              <p className="text-sm text-yellow-700 mt-1">Impossible de charger vos documents. Veuillez vous reconnecter.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-[#F5F7FA]">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Mes Documents</h1>
        <p className="text-sm text-gray-600 mt-1">Gérez vos CV et lettres de motivation</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 p-4 mb-6 rounded">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3" />
            <div>
              <h3 className="text-sm font-semibold text-red-900">Erreur</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Upload Form */}
      {showUploadForm && (
        <div className="bg-white border border-gray-200 p-6 mb-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            Ajouter un {uploadType === 'cv' ? 'CV' : 'Lettre de Motivation'}
          </h3>
          {uploadError && (
            <div className="bg-red-50 border border-red-200 p-3 mb-4 rounded">
              <p className="text-sm text-red-700">{uploadError}</p>
            </div>
          )}
          <form onSubmit={handleUpload}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Nom du Document</label>
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]"
                placeholder={uploadType === 'cv' ? 'Ex: CV_Nom_Prénom_2026.pdf' : 'Ex: LM_Poste_Entreprise.pdf'}
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Fichier</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="w-full px-3 py-2 border border-gray-300"
                required
              />
              <p className="text-xs text-gray-500 mt-2">PDF, DOC, DOCX (max 5MB)</p>
            </div>

            <div className="flex items-center space-x-4">
              <button
                type="submit"
                disabled={uploadLoading}
                className="px-4 py-2 bg-[#0A6ED1] text-white hover:bg-[#0959b0] disabled:opacity-50"
              >
                {uploadLoading ? 'En cours...' : 'Télécharger'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowUploadForm(false);
                  setUploadType(null);
                  setFileName('');
                  setSelectedFile(null);
                  setUploadError('');
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {loading && (
        <div className="bg-white border border-gray-200 p-12 text-center">
          <Loader className="w-8 h-8 text-[#0A6ED1] mx-auto mb-3 animate-spin" />
          <p className="text-gray-600">Chargement de vos documents...</p>
        </div>
      )}

      {!loading && (
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
            {cvVersions.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Aucun CV téléchargé</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cvVersions.map((cv) => (
                  <div key={cv.id} className="border border-gray-200 p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-start flex-1">
                        <FileText className="w-5 h-5 text-[#0A6ED1] mr-3 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{cv.fileName}</p>
                          <p className="text-xs text-gray-600 mt-1">
                            {new Date(cv.uploadedAt).toLocaleDateString('fr-FR')} • {formatFileSize(cv.fileSize)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 mt-3">
                      <a
                        href={cv.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 px-3 py-1 border border-gray-300 text-gray-700 text-xs hover:bg-gray-50 flex items-center justify-center"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Télécharger
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
            {lettresMotivation.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Aucune lettre de motivation</p>
              </div>
            ) : (
              <div className="space-y-4">
                {lettresMotivation.map((lettre) => (
                  <div key={lettre.id} className="border border-gray-200 p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-start flex-1">
                        <FileText className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{lettre.fileName}</p>
                          <p className="text-xs text-gray-600 mt-1">
                            {new Date(lettre.uploadedAt).toLocaleDateString('fr-FR')} • {formatFileSize(lettre.fileSize)}
                          </p>
                          {lettre.description && (
                            <p className="text-xs text-[#0A6ED1] mt-1">Pour: {lettre.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 mt-3">
                      <a
                        href={lettre.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 px-3 py-1 border border-gray-300 text-gray-700 text-xs hover:bg-gray-50 flex items-center justify-center"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Télécharger
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        </div>
      )}</div>

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
