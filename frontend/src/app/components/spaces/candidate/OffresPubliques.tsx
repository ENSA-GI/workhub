import { Briefcase, MapPin, Clock, DollarSign, Search, Filter, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import FormulairePostulation from './FormulairePostulation';

export default function OffresPubliques() {
  const [selectedOffre, setSelectedOffre] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('Tous');
  const [offres, setOffres] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchRecruitmentData = async () => {
      try {
        const response = await fetch('http://localhost:8085/api/job-offers/public');
        const data = await response.json();
        setOffres(data);
      } catch (error) {
        console.error("Erreur lors du chargement des offres:", error);
      }
    };
    fetchRecruitmentData();
  }, []);

  const types = ['Tous', 'CDI', 'CDD', 'Stage'];

  const filteredOffres = offres.filter((offre) => {
    const matchSearch = (offre.title?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                       (offre.location?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchType = filterType === 'Tous' || offre.contractType === filterType;
    return matchSearch && matchType;
  });

  const offreDetail = selectedOffre ? offres.find((o) => o.id === selectedOffre) : null;

  return (
    <div className="p-6 bg-[#F5F7FA]">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Offres d'Emploi</h1>
        <p className="text-sm text-gray-600 mt-1">Découvrez nos opportunités de carrière</p>
      </div>

      {/* Recherche et Filtres */}
      <div className="bg-white border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par titre ou département..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <div className="flex space-x-2 overflow-x-auto pb-1">
              {types.map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-1.5 text-sm rounded-md whitespace-nowrap transition-colors ${
                    filterType === type
                      ? 'bg-[#0A6ED1] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liste des Offres */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white border border-gray-200 p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              {filteredOffres.length} offre{filteredOffres.length > 1 ? 's' : ''} disponible{filteredOffres.length > 1 ? 's' : ''}
            </h3>
          </div>

          {filteredOffres.map((offre) => (
            <div
              key={offre.id}
              onClick={() => setSelectedOffre(offre.id)}
              className={`bg-white border p-4 cursor-pointer transition-all rounded-lg ${
                selectedOffre === offre.id
                  ? 'border-[#0A6ED1] shadow-md ring-1 ring-[#0A6ED1]'
                  : 'border-gray-200 hover:border-[#0A6ED1] hover:shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-900 flex-1">{offre.title}</h3>
                <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
              </div>
              <p className="text-xs text-gray-600 mb-3">{offre.location}</p>
              <div className="space-y-1">
                <div className="flex items-center text-xs text-gray-600">
                  <MapPin className="w-3 h-3 mr-1 text-gray-400" />
                  <span>{offre.location}</span>
                </div>
                <div className="flex items-center text-xs text-gray-600">
                  <Clock className="w-3 h-3 mr-1 text-gray-400" />
                  <span>{offre.contractType}</span>
                </div>
                <div className="flex items-center text-xs text-gray-600">
                  <DollarSign className="w-3 h-3 mr-1 text-gray-400" />
                  <span>{offre.minSalary || 0} - {offre.maxSalary || 0} MAD</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Détail de l'Offre */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          {offreDetail ? (
            <div>
              <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-start">
                    <div className="w-14 h-14 bg-[#0A6ED1] rounded-xl flex items-center justify-center text-white mr-5 shadow-lg shadow-blue-500/20">
                      <Briefcase className="w-7 h-7" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{offreDetail.title}</h2>
                      <div className="flex items-center mt-2 space-x-4">
                        <span className="flex items-center text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mr-1.5 text-[#0A6ED1]" />
                          {offreDetail.location}
                        </span>
                        <span className="flex items-center text-sm text-gray-600">
                          <Clock className="w-4 h-4 mr-1.5 text-[#0A6ED1]" />
                          {offreDetail.contractType}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="inline-flex px-3 py-1 text-xs font-bold rounded-full bg-blue-50 text-[#0A6ED1] border border-blue-100 uppercase tracking-wider">
                    {offreDetail.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Salaire</p>
                    <p className="text-sm font-semibold text-gray-900">{offreDetail.minSalary || 0} - {offreDetail.maxSalary || 0} MAD</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Expérience</p>
                    <p className="text-sm font-semibold text-gray-900">{offreDetail.minExperience} ans min.</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Contrat</p>
                    <p className="text-sm font-semibold text-gray-900">{offreDetail.contractType}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Localisation</p>
                    <p className="text-sm font-semibold text-gray-900">{offreDetail.location}</p>
                  </div>
                </div>
              </div>

              <div className="p-8">
                <div className="prose prose-blue max-w-none">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Description du poste</h3>
                  <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                    {offreDetail.description}
                  </div>
                </div>

                <div className="mt-10 pt-8 border-t border-gray-100">
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="w-full md:w-auto px-10 py-4 bg-[#0A6ED1] text-white hover:bg-[#0959b0] flex items-center justify-center font-bold rounded-xl shadow-xl shadow-blue-500/25 active:scale-95 transition-all"
                  >
                    <Briefcase className="w-5 h-5 mr-3" />
                    Postuler à cette offre
                  </button>
                  <p className="text-xs text-gray-400 mt-4 italic">
                    Offre publiée le {new Date(offreDetail.createdAt || Date.now()).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-20 text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Briefcase className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Sélectionnez une offre</h3>
              <p className="text-gray-500 text-sm max-w-xs mx-auto">
                Choisissez une offre dans la liste de gauche pour consulter ses détails et postuler.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Candidature (Nouveau Composant) */}
      {isModalOpen && offreDetail && (
        <FormulairePostulation 
          jobOfferId={offreDetail.id}
          jobTitle={offreDetail.title}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            // On peut utiliser un toast ici si disponible, sinon une alerte propre
            alert("Félicitations ! Votre candidature a été transmise avec succès.");
          }}
        />
      )}
    </div>
  );
}
