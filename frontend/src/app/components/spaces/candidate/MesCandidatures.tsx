import { Briefcase, Calendar, CheckCircle, Clock, XCircle, MapPin, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useUser } from '@/lib/useUser';

export default function MesCandidatures() {
  const { user } = useUser();
  const [selectedCandidature, setSelectedCandidature] = useState<string | null>(null);
  const [candidatures, setCandidatures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCandidatures = async () => {
      if (!user?.primaryEmailAddress?.emailAddress) return;
      
      try {
        const email = user.primaryEmailAddress.emailAddress;
        const response = await fetch(`http://localhost:8085/api/applications/candidate/${email}`);
        const data = await response.json();
        
        const mappedApps = data.map((app: any) => ({
          id: app.id,
          offre: app.jobTitle,
          departement: "IT", // Info non présente dans le DTO pour l'instant
          localisation: "Casablanca", // Info non présente dans le DTO pour l'instant
          dateCandidature: app.appliedAt,
          statut: app.status === 'NEW' ? 'En cours' : app.status,
          etape: app.aiScore ? `Analyse IA terminée (${app.aiScore}%)` : 'Analyse en cours...',
          aiScore: app.aiScore,
          historique: [
            { date: app.appliedAt, action: 'Candidature reçue', details: 'Votre candidature a été enregistrée avec succès' },
            { date: new Date().toISOString(), action: 'Analyse IA', details: app.aiScore ? 'L\'IA a terminé l\'évaluation de votre profil.' : 'L\'IA analyse votre CV en ce moment même.' }
          ]
        }));
        
        setCandidatures(mappedApps);
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchCandidatures();
    }
  }, [user]);

  const candidatureDetail = selectedCandidature
    ? candidatures.find((c) => c.id === selectedCandidature)
    : null;

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case 'En cours':
        return 'bg-blue-100 text-blue-800';
      case 'Accepté':
        return 'bg-green-100 text-green-800';
      case 'Refusé':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatutIcon = (statut: string) => {
    switch (statut) {
      case 'En cours':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'Accepté':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'Refusé':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Briefcase className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="p-6 bg-[#F5F7FA]">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Mes Candidatures</h1>
        <p className="text-sm text-gray-600 mt-1">Suivez l'état de vos candidatures en temps réel</p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-200 p-6">
          <h3 className="text-xs font-medium text-gray-500 uppercase mb-2">Total Candidatures</h3>
          <p className="text-3xl font-semibold text-gray-900">{candidatures.length}</p>
        </div>
        <div className="bg-white border border-gray-200 p-6">
          <h3 className="text-xs font-medium text-gray-500 uppercase mb-2">En Cours</h3>
          <p className="text-3xl font-semibold text-blue-600">
            {candidatures.filter((c) => c.statut === 'En cours').length}
          </p>
        </div>
        <div className="bg-white border border-gray-200 p-6">
          <h3 className="text-xs font-medium text-gray-500 uppercase mb-2">Entretiens Planifiés</h3>
          <p className="text-3xl font-semibold text-green-600">
            {candidatures.filter((c) => c.entretien).length}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liste des Candidatures */}
        <div className="lg:col-span-1 space-y-4">
          {candidatures.map((candidature) => (
            <div
              key={candidature.id}
              onClick={() => setSelectedCandidature(candidature.id)}
              className={`bg-white border p-4 cursor-pointer transition-all ${
                selectedCandidature === candidature.id
                  ? 'border-[#0A6ED1] shadow-md'
                  : 'border-gray-200 hover:border-[#0A6ED1] hover:shadow-sm'
              }`}
            >
              <div className="flex items-start mb-3">
                {getStatutIcon(candidature.statut)}
                <div className="ml-3 flex-1">
                  <h3 className="text-sm font-semibold text-gray-900">{candidature.offre}</h3>
                  <p className="text-xs text-gray-600 mt-1">{candidature.departement}</p>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`inline-flex px-2 py-1 text-xs mb-1 ${getStatutBadge(candidature.statut)}`}>
                    {candidature.statut}
                  </span>
                  {candidature.aiScore && (
                    <span className="flex items-center text-[10px] font-bold text-green-600 bg-green-50 px-1 rounded">
                      <TrendingUp className="w-2 h-2 mr-0.5" />
                      Score IA: {candidature.aiScore}%
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-1 mb-3">
                <div className="flex items-center text-xs text-gray-600">
                  <MapPin className="w-3 h-3 mr-1" />
                  <span>{candidature.localisation}</span>
                </div>
                <div className="flex items-center text-xs text-gray-600">
                  <Calendar className="w-3 h-3 mr-1" />
                  <span>Postulé le {new Date(candidature.dateCandidature).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100">
                <p className="text-xs font-medium text-[#0A6ED1]">{candidature.etape}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Détail de la Candidature */}
        <div className="lg:col-span-2 bg-white border border-gray-200">
          {candidatureDetail ? (
            <div>
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{candidatureDetail.offre}</h2>
                    <p className="text-sm text-gray-600 mt-1">{candidatureDetail.departement}</p>
                  </div>
                  <span className={`inline-flex px-3 py-1 text-xs ${getStatutBadge(candidatureDetail.statut)}`}>
                    {candidatureDetail.statut}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2 text-[#0A6ED1]" />
                    <span>{candidatureDetail.localisation}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2 text-[#0A6ED1]" />
                    <span>{new Date(candidatureDetail.dateCandidature).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
              </div>

              {/* Entretien Planifié */}
              {candidatureDetail.entretien && (
                <div className="p-6 bg-green-50 border-b border-green-200">
                  <h3 className="text-base font-semibold text-green-900 mb-3 flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    Entretien Planifié
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-green-700 mb-1">Date et Heure</p>
                      <p className="text-sm font-medium text-green-900">
                        {new Date(candidatureDetail.entretien.date).toLocaleDateString('fr-FR')} à{' '}
                        {candidatureDetail.entretien.heure}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-green-700 mb-1">Mode</p>
                      <p className="text-sm font-medium text-green-900">{candidatureDetail.entretien.mode}</p>
                    </div>
                    {candidatureDetail.entretien.lien && (
                      <div className="md:col-span-2">
                        <p className="text-xs text-green-700 mb-1">Lien de visio</p>
                        <a
                          href={candidatureDetail.entretien.lien}
                          className="text-sm text-[#0A6ED1] hover:underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {candidatureDetail.entretien.lien}
                        </a>
                      </div>
                    )}
                    {candidatureDetail.entretien.adresse && (
                      <div className="md:col-span-2">
                        <p className="text-xs text-green-700 mb-1">Adresse</p>
                        <p className="text-sm text-green-900">{candidatureDetail.entretien.adresse}</p>
                      </div>
                    )}
                    <div className="md:col-span-2">
                      <p className="text-xs text-green-700 mb-1">Interviewers</p>
                      <p className="text-sm text-green-900">{candidatureDetail.entretien.interviewers.join(', ')}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Historique */}
              <div className="p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4">Historique de la Candidature</h3>
                <div className="space-y-4">
                  {candidatureDetail.historique.map((entry, index) => (
                    <div key={index} className="flex items-start">
                      <div className="flex-shrink-0 w-2 h-2 bg-[#0A6ED1] rounded-full mt-2"></div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">{entry.action}</h4>
                            <p className="text-xs text-gray-600 mt-1">{entry.details}</p>
                          </div>
                          <p className="text-xs text-gray-500">
                            {new Date(entry.date).toLocaleString('fr-FR')}
                          </p>
                        </div>
                        {index < candidatureDetail.historique.length - 1 && (
                          <div className="w-px h-6 bg-gray-200 ml-1 mt-2"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center">
              <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">Sélectionnez une candidature pour voir les détails</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

