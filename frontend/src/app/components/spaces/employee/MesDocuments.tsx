import { FileText, Upload, Download, Trash2, Plus, Search, AlertCircle, Loader } from 'lucide-react';
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
  mimeType?: string;
  fileUrl: string;
}

export default function MesDocuments() {
  const apiFetch = useApi();
  const organizationId = useOrganizationId();
  const { user } = useUser();
  
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [docType, setDocType] = useState('OTHER');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('Tous');

  
  // Load documents from API
  useEffect(() => {
    if (!organizationId || !user?.publicMetadata?.employeeId) {
      setLoading(false);
      return;
    }
    
    const loadDocuments = async () => {
      try {
        setLoading(true);
        setError('');
        // Fetch documents for the current employee
        const data = await apiFetch(
          `/documents?organizationId=${organizationId}&ownerType=EMPLOYEE&ownerId=${user.publicMetadata.employeeId}`
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
  }, [organizationId, user?.publicMetadata?.employeeId, apiFetch]);

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
      formData.append('ownerType', 'EMPLOYEE');
      formData.append('ownerId', user.publicMetadata.employeeId);
      formData.append('type', docType);
      formData.append('fileName', fileName);

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
        `/documents?organizationId=${organizationId}&ownerType=EMPLOYEE&ownerId=${user.publicMetadata.employeeId}`
      );
      setDocuments(Array.isArray(data) ? data : []);
      
      // Reset form
      setShowUploadForm(false);
      setFileName('');
      setDocType('OTHER');
      setSelectedFile(null);
    } catch (err) {
      console.error('Upload error:', err);
      setUploadError(err instanceof Error ? err.message : 'Erreur lors du téléchargement');
    } finally {
      setUploadLoading(false);
    }
  };

  const categories = ['Tous', 'Administratif', 'Médical', 'Personnel'];

  // Map document types to categories
  const getCategory = (docType: string): string => {
    const typeMap: Record<string, string> = {
      'MEDICAL_CERTIFICATE': 'Médical',
      'CONTRACT': 'Administratif',
      'CIN': 'Personnel',
      'PHOTO': 'Personnel',
      'CV': 'Personnel',
      'DIPLOMA': 'Personnel',
      'OTHER': 'Administratif',
    };
    return typeMap[docType] || 'Administratif';
  };

  const formatFileSize = (bytes: number): string => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (!organizationId || !user?.publicMetadata?.employeeId) {
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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Mes Documents</h1>
          <p className="text-sm text-gray-600 mt-1">Gérez vos documents personnels et administratifs</p>
        </div>
        <button
          onClick={() => setShowUploadForm(!showUploadForm)}
          className="px-4 py-2 bg-[#0A6ED1] text-white hover:bg-[#0959b0] flex items-center disabled:opacity-50"
          disabled={loading}
        >
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un Document
        </button>
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

      {/* Formulaire d'Upload */}
      {showUploadForm && (
        <div className="bg-white border border-gray-200 p-6 mb-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Ajouter un Nouveau Document</h3>
          {uploadError && (
            <div className="bg-red-50 border border-red-200 p-3 mb-4 rounded">
              <p className="text-sm text-red-700">{uploadError}</p>
            </div>
          )}
          <form onSubmit={handleUpload}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom du Document</label>
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]"
                  placeholder="Ex: Certificat médical Avril 2026"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]"
                >
                  <option value="OTHER">Autre</option>
                  <option value="MEDICAL_CERTIFICATE">Certificat Médical</option>
                  <option value="CONTRACT">Contrat</option>
                  <option value="CIN">CIN</option>
                  <option value="PHOTO">Photo</option>
                  <option value="DIPLOMA">Diplôme</option>
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Fichier</label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="w-full px-3 py-2 border border-gray-300"
                required
              />
              <p className="text-xs text-gray-500 mt-2">PDF, JPG, PNG, DOC, DOCX (max 5MB)</p>
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
                  setFileName('');
                  setDocType('OTHER');
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

      {/* Filtres par Catégorie */}
      <div className="bg-white border border-gray-200 p-4 mb-6">
        <div className="flex items-center space-x-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 text-sm ${
                selectedCategory === cat
                  ? 'bg-[#0A6ED1] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white border border-gray-200 p-12 text-center">
          <Loader className="w-8 h-8 text-[#0A6ED1] mx-auto mb-3 animate-spin" />
          <p className="text-gray-600">Chargement de vos documents...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && documents.length === 0 && (
        <div className="bg-white border border-gray-200 p-12 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">Aucun document</p>
          <p className="text-sm text-gray-500 mt-1">Vous n'avez pas encore téléchargé de documents.</p>
        </div>
      )}

      {/* Liste des Documents */}
      {!loading && documents.length > 0 && (
        <div className="bg-white border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">
              Mes Documents ({selectedCategory === 'Tous' ? documents.length : documents.filter(d => getCategory(d.type) === selectedCategory).length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Document</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Catégorie</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date d'ajout</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Taille</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {documents
                  .filter(doc => selectedCategory === 'Tous' || getCategory(doc.type) === selectedCategory)
                  .map((doc) => (
                    <tr key={doc.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <FileText className="w-5 h-5 text-[#0A6ED1] mr-3" />
                          <span className="text-sm font-medium text-gray-900">{doc.fileName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800">
                          {getCategory(doc.type)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(doc.uploadedAt).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatFileSize(doc.fileSize)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 hover:bg-green-50 text-green-600"
                            title="Télécharger"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">À propos de vos documents</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Vous pouvez télécharger vos documents personnels (certificats médicaux, justificatifs, etc.)</li>
          <li>• Les documents administratifs fournis par RH sont en lecture seule</li>
          <li>• Vos documents sont sécurisés et accessibles uniquement par vous et l'équipe RH</li>
          <li>• Formats acceptés : PDF, JPG, PNG (max 10MB par fichier)</li>
        </ul>
      </div>
    </div>
  );
}
