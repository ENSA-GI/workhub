import { FileText, Upload, Download, Trash2, Plus, Search } from 'lucide-react';
import { useState } from 'react';

export default function MesDocuments() {
  const [showUploadForm, setShowUploadForm] = useState(false);

  const documents = [
    { id: 1, nom: 'Contrat de travail', categorie: 'Administratif', type: 'PDF', date: '2023-03-15', taille: '245 KB', modifiable: false },
    { id: 2, nom: 'Attestation de travail', categorie: 'Administratif', type: 'PDF', date: '2026-01-10', taille: '128 KB', modifiable: false },
    { id: 3, nom: 'Certificat médical - Mars 2026', categorie: 'Médical', type: 'PDF', date: '2026-03-19', taille: '89 KB', modifiable: true },
    { id: 4, nom: 'Justificatif de domicile', categorie: 'Personnel', type: 'PDF', date: '2026-02-05', taille: '156 KB', modifiable: true },
    { id: 5, nom: 'RIB Bancaire', categorie: 'Administratif', type: 'PDF', date: '2023-03-15', taille: '67 KB', modifiable: true },
    { id: 6, nom: 'Copie CIN', categorie: 'Personnel', type: 'PDF', date: '2023-03-15', taille: '98 KB', modifiable: false },
  ];

  const categories = ['Tous', 'Administratif', 'Médical', 'Personnel'];
  const [selectedCategory, setSelectedCategory] = useState('Tous');

  const filteredDocuments = selectedCategory === 'Tous'
    ? documents
    : documents.filter((doc) => doc.categorie === selectedCategory);

  const handleDelete = (id: number, nom: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer "${nom}" ?`)) {
      // Logique de suppression
    }
  };

  return (
    <div className="p-6 bg-[#F5F7FA]">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Mes Documents</h1>
          <p className="text-sm text-gray-600 mt-1">Gérez vos documents personnels et administratifs</p>
        </div>
        <button
          onClick={() => setShowUploadForm(!showUploadForm)}
          className="px-4 py-2 bg-[#0A6ED1] text-white hover:bg-[#0959b0] flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un Document
        </button>
      </div>

      {/* Formulaire d'Upload */}
      {showUploadForm && (
        <div className="bg-white border border-gray-200 p-6 mb-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Ajouter un Nouveau Document</h3>
          <form>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom du Document</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]"
                  placeholder="Ex: Certificat médical Avril 2026"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
                <select className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]">
                  <option>Personnel</option>
                  <option>Médical</option>
                  <option>Administratif</option>
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Fichier</label>
              <div className="border-2 border-dashed border-gray-300 p-8 text-center hover:border-[#0A6ED1] cursor-pointer">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-1">Cliquez pour télécharger ou glissez-déposez</p>
                <p className="text-xs text-gray-500">PDF, JPG, PNG (max 10MB)</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                type="submit"
                className="px-4 py-2 bg-[#0A6ED1] text-white hover:bg-[#0959b0]"
              >
                Télécharger
              </button>
              <button
                type="button"
                onClick={() => setShowUploadForm(false)}
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

      {/* Liste des Documents */}
      <div className="bg-white border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-900">
            Mes Documents ({filteredDocuments.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Document</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Catégorie</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date d'ajout</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Taille</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredDocuments.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-[#0A6ED1] mr-3" />
                      <span className="text-sm font-medium text-gray-900">{doc.nom}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs ${
                        doc.categorie === 'Administratif'
                          ? 'bg-blue-100 text-blue-800'
                          : doc.categorie === 'Médical'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {doc.categorie}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{doc.type}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(doc.date).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{doc.taille}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        className="p-1 hover:bg-green-50 text-green-600"
                        title="Télécharger"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      {doc.modifiable && (
                        <button
                          onClick={() => handleDelete(doc.id, doc.nom)}
                          className="p-1 hover:bg-red-50 text-red-600"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
