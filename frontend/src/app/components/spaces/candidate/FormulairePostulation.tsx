import React, { useState } from 'react';
import { X, Upload, CheckCircle, AlertCircle } from 'lucide-react';

interface FormulairePostulationProps {
  jobOfferId: string;
  jobTitle: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function FormulairePostulation({ jobOfferId, jobTitle, onClose, onSuccess }: FormulairePostulationProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    coverLetter: ''
  });
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cvFile) {
      setError("Veuillez uploader votre CV au format PDF.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const formDataToSubmit = new FormData();
    
    const applicationData = {
      jobOfferId: jobOfferId,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      coverLetter: formData.coverLetter
    };

    formDataToSubmit.append('data', JSON.stringify(applicationData));
    formDataToSubmit.append('cv', cvFile);

    try {
      const response = await fetch('http://localhost:8085/api/applications/apply', {
        method: 'POST',
        body: formDataToSubmit,
      });

      if (response.ok) {
        onSuccess();
      } else if (response.status === 409) {
        setError("Vous avez déjà postulé à cette offre.");
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Une erreur est survenue lors de l'envoi.");
      }
    } catch (err) {
      console.error("Erreur:", err);
      setError("Erreur de connexion au serveur.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-[#1F3A5F] p-6 text-white flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">Postuler à l'offre</h2>
            <p className="text-blue-200 text-sm mt-1">{jobTitle}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 flex items-center text-red-700 text-sm">
              <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Prénom *</label>
              <input
                required
                type="text"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A6ED1] focus:border-transparent transition-all outline-none"
                placeholder="Ex: Jean"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nom *</label>
              <input
                required
                type="text"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A6ED1] focus:border-transparent transition-all outline-none"
                placeholder="Ex: Dupont"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email *</label>
              <input
                required
                type="email"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A6ED1] focus:border-transparent transition-all outline-none"
                placeholder="jean.dupont@exemple.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Téléphone</label>
              <input
                type="tel"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A6ED1] focus:border-transparent transition-all outline-none"
                placeholder="+212 600 000 000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Lettre de motivation (Optionnel)</label>
            <textarea
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A6ED1] focus:border-transparent transition-all outline-none h-32 resize-none"
              placeholder="Parlez-nous de vous et de votre motivation..."
              value={formData.coverLetter}
              onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">CV (PDF uniquement) *</label>
            <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg transition-colors ${cvFile ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-[#0A6ED1]'}`}>
              <div className="space-y-1 text-center">
                {cvFile ? (
                  <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                ) : (
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                )}
                <div className="flex text-sm text-gray-600">
                  <label className="relative cursor-pointer font-semibold text-[#0A6ED1] hover:text-[#0959b0] rounded-md transition-colors">
                    <span>{cvFile ? "Modifier le CV" : "Télécharger votre CV"}</span>
                    <input
                      required
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                      className="sr-only"
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500">
                  {cvFile ? cvFile.name : "PDF uniquement (Max. 10MB)"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 px-6 py-3 text-white font-semibold rounded-lg transition-all shadow-lg ${isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-[#0A6ED1] hover:bg-[#0959b0] hover:shadow-blue-500/25 active:scale-95'}`}
            >
              {isSubmitting ? "Envoi en cours..." : "Soumettre ma candidature"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
