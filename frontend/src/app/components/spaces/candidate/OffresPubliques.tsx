import { Briefcase, MapPin, Clock, DollarSign, Search, Filter, ChevronRight } from 'lucide-react';
import { useState } from 'react';

export default function OffresPubliques() {
  const [selectedOffre, setSelectedOffre] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('Tous');

  const offres = [
    {
      id: 1,
      titre: 'Développeur Full-Stack Senior',
      departement: 'IT',
      type: 'CDI',
      localisation: 'Casablanca, Maroc',
      salaire: 'MAD 5,500 - MAD 8,000',
      experience: '5+ ans',
      datePublication: '2026-04-15',
      description: 'Nous recherchons un développeur Full-Stack expérimenté pour rejoindre notre équipe IT dynamique.',
      responsabilites: [
        'Développer et maintenir des applications web complexes',
        'Collaborer avec les équipes produit et design',
        'Participer aux revues de code et mentorat',
        'Optimiser les performances des applications',
      ],
      competences: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Docker'],
      statut: 'Ouverte',
    },
    {
      id: 2,
      titre: 'Chef de Projet Marketing Digital',
      departement: 'Marketing',
      type: 'CDI',
      localisation: 'Rabat, Maroc',
      salaire: 'MAD 4,000 - MAD 6,000',
      experience: '3-5 ans',
      datePublication: '2026-04-12',
      description: 'Rejoignez notre équipe marketing en tant que chef de projet pour gérer nos campagnes digitales.',
      responsabilites: [
        'Planifier et exécuter les campagnes marketing',
        'Analyser les performances et ROI',
        'Gérer le budget marketing digital',
        'Coordonner avec les agences externes',
      ],
      competences: ['Google Analytics', 'SEO/SEM', 'Social Media', 'Content Marketing'],
      statut: 'Ouverte',
    },
    {
      id: 3,
      titre: 'Analyste de Données',
      departement: 'IT',
      type: 'CDD',
      localisation: 'Casablanca, Maroc',
      salaire: 'MAD 3,500 - MAD 5,000',
      experience: '2-4 ans',
      datePublication: '2026-04-10',
      description: 'Nous cherchons un analyste de données pour transformer nos données en insights actionnables.',
      responsabilites: [
        'Collecter et analyser les données business',
        'Créer des dashboards et rapports',
        'Identifier les tendances et opportunités',
        'Collaborer avec les équipes métier',
      ],
      competences: ['Python', 'SQL', 'Tableau', 'Excel', 'Statistics'],
      statut: 'Ouverte',
    },
    {
      id: 4,
      titre: 'Responsable Commercial',
      departement: 'Ventes',
      type: 'CDI',
      localisation: 'Casablanca, Maroc',
      salaire: 'MAD 4,500 - MAD 7,000',
      experience: '4+ ans',
      datePublication: '2026-04-08',
      description: 'Développez notre portefeuille clients en tant que responsable commercial B2B.',
      responsabilites: [
        'Prospecter et développer le portefeuille clients',
        'Négocier et conclure les ventes',
        'Assurer le suivi client',
        'Atteindre les objectifs de vente',
      ],
      competences: ['Vente B2B', 'Négociation', 'CRM', 'Prospection'],
      statut: 'Ouverte',
    },
    {
      id: 5,
      titre: 'DevOps Engineer',
      departement: 'IT',
      type: 'CDI',
      localisation: 'Remote',
      salaire: 'MAD 6,000 - MAD 9,000',
      experience: '4-6 ans',
      datePublication: '2026-04-05',
      description: 'Rejoignez notre équipe infrastructure pour optimiser nos pipelines CI/CD.',
      responsabilites: [
        'Gérer et maintenir l\'infrastructure cloud',
        'Automatiser les déploiements',
        'Monitorer la performance des systèmes',
        'Assurer la sécurité des applications',
      ],
      competences: ['AWS', 'Kubernetes', 'Docker', 'Terraform', 'CI/CD'],
      statut: 'Ouverte',
    },
  ];

  const types = ['Tous', 'CDI', 'CDD', 'Stage'];

  const filteredOffres = offres.filter((offre) => {
    const matchSearch = offre.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       offre.departement.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = filterType === 'Tous' || offre.type === filterType;
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
            {types.map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-2 text-sm ${
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liste des Offres */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              {filteredOffres.length} offre{filteredOffres.length > 1 ? 's' : ''} disponible{filteredOffres.length > 1 ? 's' : ''}
            </h3>
          </div>

          {filteredOffres.map((offre) => (
            <div
              key={offre.id}
              onClick={() => setSelectedOffre(offre.id)}
              className={`bg-white border p-4 cursor-pointer transition-all ${
                selectedOffre === offre.id
                  ? 'border-[#0A6ED1] shadow-md'
                  : 'border-gray-200 hover:border-[#0A6ED1] hover:shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-900 flex-1">{offre.titre}</h3>
                <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
              </div>
              <p className="text-xs text-gray-600 mb-3">{offre.departement}</p>
              <div className="space-y-1">
                <div className="flex items-center text-xs text-gray-600">
                  <MapPin className="w-3 h-3 mr-1" />
                  <span>{offre.localisation}</span>
                </div>
                <div className="flex items-center text-xs text-gray-600">
                  <Clock className="w-3 h-3 mr-1" />
                  <span>{offre.type}</span>
                </div>
                <div className="flex items-center text-xs text-gray-600">
                  <DollarSign className="w-3 h-3 mr-1" />
                  <span>{offre.salaire}</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  Publié le {new Date(offre.datePublication).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Détail de l'Offre */}
        <div className="lg:col-span-2 bg-white border border-gray-200">
          {offreDetail ? (
            <div>
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-[#0A6ED1] flex items-center justify-center text-white mr-4">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">{offreDetail.titre}</h2>
                      <p className="text-sm text-gray-600 mt-1">{offreDetail.departement}</p>
                    </div>
                  </div>
                  <span className="inline-flex px-3 py-1 text-xs bg-green-100 text-green-800">
                    {offreDetail.statut}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2 text-[#0A6ED1]" />
                    <span>{offreDetail.localisation}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2 text-[#0A6ED1]" />
                    <span>{offreDetail.type}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="w-4 h-4 mr-2 text-[#0A6ED1]" />
                    <span>{offreDetail.salaire}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Briefcase className="w-4 h-4 mr-2 text-[#0A6ED1]" />
                    <span>{offreDetail.experience} d'expérience</span>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="mb-6">
                  <h3 className="text-base font-semibold text-gray-900 mb-3">Description</h3>
                  <p className="text-sm text-gray-600">{offreDetail.description}</p>
                </div>

                <div className="mb-6">
                  <h3 className="text-base font-semibold text-gray-900 mb-3">Responsabilités</h3>
                  <ul className="space-y-2">
                    {offreDetail.responsabilites.map((resp, index) => (
                      <li key={index} className="flex items-start text-sm text-gray-600">
                        <span className="w-1.5 h-1.5 bg-[#0A6ED1] rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mb-6">
                  <h3 className="text-base font-semibold text-gray-900 mb-3">Compétences Requises</h3>
                  <div className="flex flex-wrap gap-2">
                    {offreDetail.competences.map((comp, index) => (
                      <span
                        key={index}
                        className="inline-flex px-3 py-1 text-xs bg-blue-100 text-blue-800"
                      >
                        {comp}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <button className="w-full px-6 py-3 bg-[#0A6ED1] text-white hover:bg-[#0959b0] flex items-center justify-center">
                    <Briefcase className="w-5 h-5 mr-2" />
                    Postuler à cette offre
                  </button>
                  <p className="text-xs text-gray-500 text-center mt-2">
                    Publié le {new Date(offreDetail.datePublication).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center">
              <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">Sélectionnez une offre pour voir les détails</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
