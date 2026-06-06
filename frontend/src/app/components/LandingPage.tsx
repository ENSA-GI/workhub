import { Building2, Users, Briefcase, UserCircle, Shield, CheckCircle, BarChart3, Globe, TrendingUp, Zap, Lock, CloudCog, Brain, Award, ChevronRight, Play } from 'lucide-react';
import logo from '../../imports/Capture_d_écran_2026-04-20_183125-removebg-preview.png';
import footerLogo from '../../imports/Capture_d_écran_2026-04-20_185048-removebg-preview.png';
import { useNavigate } from 'react-router-dom';


const generateMockToken = (role: string) => {
  const payload = {
    sub: `demo-${role}`,
    role: role.toUpperCase(),
    organizationId: '550e8400-e29b-41d4-a716-446655440000', // ID organisation par défaut
    email: `${role}@workhub.ma`,
    exp: Math.floor(Date.now() / 1000) + 3600
  };
  const base64Payload = btoa(JSON.stringify(payload));
  // En-tête JWT standard + signature factice
  return `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${base64Payload}.fake_signature`;
};

export default function LandingPage() {
  const navigate = useNavigate();

  const handleRoleClick = (role: string) => {
    const fakeToken = generateMockToken(role);
    localStorage.setItem("workhub.token", fakeToken);
    localStorage.setItem("workhub.selectedRole", role);
    // Forcer le rechargement pour que App détecte le token
    window.location.href = "/";
  };
  const actors = [
    {
      role: 'super-admin',
      title: 'Super Admin',
      icon: Shield,
      color: '#EF4444',
    },
    {
      role: 'org-admin',
      title: 'Admin Org',
      icon: Building2,
      color: '#0A6ED1',
    },
    {
      role: 'rh-manager',
      title: 'Manager RH',
      icon: Users,
      color: '#8B5CF6',
    },
    {
      role: 'employee',
      title: 'Employé',
      icon: UserCircle,
      color: '#10B981',
    },
    {
      role: 'candidate',
      title: 'Candidat',
      icon: Briefcase,
      color: '#F59E0B',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header / Navigation */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center">
              <img
                src={logo}
                alt="WorkHub"
                className="h-16"
              />
            </div>

            {/* Navigation Menu */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#home" className="text-sm text-gray-700 hover:text-[#0A6ED1] transition-colors">Accueil</a>
              <a href="#features" className="text-sm text-gray-700 hover:text-[#0A6ED1] transition-colors">Fonctionnalités</a>
              <a href="#solutions" className="text-sm text-gray-700 hover:text-[#0A6ED1] transition-colors">Solutions</a>
              <a href="#pricing" className="text-sm text-gray-700 hover:text-[#0A6ED1] transition-colors">Tarifs</a>
              <a href="#about" className="text-sm text-gray-700 hover:text-[#0A6ED1] transition-colors">À Propos</a>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/login')}
                className="px-5 py-2 bg-[#0A6ED1] text-white text-sm hover:bg-[#0959b0] transition-colors"
              >
                Connexion
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="hidden">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/80 uppercase tracking-wide">Accès Rapide:</span>
            <div className="flex items-center space-x-3">
              {actors.map((actor) => {
                const Icon = actor.icon;
                return (
                  <button
                    key={actor.role}
                    onClick={() => handleRoleClick(actor.role)}
                    className="group flex items-center space-x-2 px-4 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 transition-all"
                    style={{ borderLeftWidth: '3px', borderLeftColor: actor.color }}
                  >
                    <Icon className="w-4 h-4 text-white" />
                    <span className="text-xs text-white font-medium">{actor.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section id="home" className="bg-white">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: Text */}
            <div>
              <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
                RH Intelligente.<br />Organisations Plus Fortes.
              </h1>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                WorkHub transforme la gestion des ressources humaines avec une automatisation intelligente,
                un traitement de paie transparent, un recrutement alimenté par IA, et des analyses complètes.
                Conçu pour les entreprises modernes qui exigent efficacité, conformité et évolutivité.
              </p>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate('/login')}
                  className="px-6 py-3 bg-[#0A6ED1] text-white hover:bg-[#0959b0] transition-colors flex items-center"
                >
                  Connexion
                </button>
                <button className="px-6 py-3 border-2 border-gray-300 text-gray-700 hover:border-[#0A6ED1] hover:text-[#0A6ED1] transition-colors flex items-center">
                  <Play className="w-4 h-4 mr-2" />
                  Demander une Démo
                </button>
              </div>
            </div>

            {/* Right: Dashboard Mockup */}
            <div className="relative">
              <div className="bg-gradient-to-br from-[#F5F7FA] to-white border border-gray-200 p-6 shadow-2xl">
                <div className="bg-white border border-gray-200 p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-semibold text-gray-900 uppercase">Vue d'Ensemble</h3>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-red-500"></div>
                      <div className="w-2 h-2 bg-yellow-500"></div>
                      <div className="w-2 h-2 bg-green-500"></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#F5F7FA] p-3">
                      <p className="text-xs text-gray-500 mb-1">Total Employés</p>
                      <p className="text-2xl font-bold text-gray-900">245</p>
                      <p className="text-xs text-green-600">+12% ce mois</p>
                    </div>
                    <div className="bg-[#F5F7FA] p-3">
                      <p className="text-xs text-gray-500 mb-1">Coût Paie</p>
                      <p className="text-2xl font-bold text-gray-900">MAD 1.2M</p>
                      <p className="text-xs text-blue-600">Mensuel</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white border border-gray-200 p-4">
                  <div className="h-32 bg-gradient-to-r from-[#0A6ED1]/10 to-[#0A6ED1]/5 flex items-end justify-between px-2 pb-2">
                    {[40, 65, 45, 80, 55, 90, 70].map((height, i) => (
                      <div
                        key={i}
                        className="w-8 bg-[#0A6ED1]"
                        style={{ height: `${height}%` }}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Accent Elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-[#0A6ED1]/10 -z-10"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gray-100 -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section id="features" className="bg-[#F5F7FA] py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Tout ce dont vous avez besoin pour gérer vos équipes</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Outils RH complets conçus pour l'efficacité, la conformité et la croissance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Users, title: 'Gestion des Employés', desc: 'Cycle de vie complet des employés de l\'intégration au départ' },
              { icon: BarChart3, title: 'Automatisation de la Paie', desc: 'Calculs de salaire automatisés, conformité fiscale et traitement des paiements' },
              { icon: CheckCircle, title: 'Gestion des Congés', desc: 'Suivi simplifié des absences, approbations et gestion du calendrier' },
              { icon: Briefcase, title: 'Recrutement avec IA', desc: 'Sélection de candidats par IA, notation et planification d\'entretiens' },
              { icon: TrendingUp, title: 'Analytique & Insights', desc: 'Tableaux de bord en temps réel, analyses prédictives et rapports personnalisés' },
              { icon: Lock, title: 'Multi-tenant Sécurisé', desc: 'Sécurité de niveau entreprise avec données isolées par organisation' },
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-white border border-gray-200 p-8 hover:border-[#0A6ED1] hover:shadow-lg transition-all">
                  <div className="w-12 h-12 bg-[#F5F7FA] border-l-4 border-[#0A6ED1] flex items-center justify-center mb-6">
                    <Icon className="w-6 h-6 text-[#0A6ED1]" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Value / Benefits Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Pourquoi WorkHub?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Conçu pour donner aux organisations les outils dont elles ont besoin pour réussir
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Zap, title: 'Réduire la Charge RH', desc: 'Automatisez les tâches répétitives et libérez votre équipe pour un travail stratégique' },
              { icon: TrendingUp, title: 'Automatiser les Processus', desc: 'De la paie aux approbations de congés, tout fonctionne en automatique' },
              { icon: BarChart3, title: 'Améliorer la Prise de Décision', desc: 'Les insights basés sur les données vous aident à prendre de meilleures décisions RH' },
              { icon: CloudCog, title: 'Centraliser toute la RH', desc: 'Une plateforme pour les employés, la paie, les congés et le recrutement' },
            ].map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-[#0A6ED1]/10 border-2 border-[#0A6ED1] mx-auto mb-6 flex items-center justify-center">
                    <Icon className="w-8 h-8 text-[#0A6ED1]" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{benefit.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{benefit.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* AI Highlight Section */}
      <section className="bg-gradient-to-br from-[#1F3A5F] to-[#2D5A8F] py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="flex items-center mb-6">
                <Brain className="w-8 h-8 text-[#0A6ED1] mr-3" />
                <h2 className="text-4xl font-bold text-white">Propulsé par une RH Intelligente</h2>
              </div>
              <p className="text-lg text-white/80 mb-8 leading-relaxed">
                Exploitez l'IA pour prendre de meilleures décisions de recrutement, prédire les tendances
                et optimiser vos opérations RH avec des insights d'apprentissage automatique.
              </p>
              <div className="space-y-4">
                {[
                  'Analyse automatisée de CV et classement des candidats',
                  'Notation intelligente des candidats basée sur les exigences du poste',
                  'Prédiction du turnover et recommandations de rétention',
                  'Analyse intelligente des lacunes de compétences et suggestions de formation',
                ].map((item, index) => (
                  <div key={index} className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-[#0A6ED1] mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-white/90 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-8">
              <div className="space-y-4">
                <div className="bg-white/20 p-4 border-l-4 border-[#0A6ED1]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/80 text-xs uppercase">Score Candidat</span>
                    <span className="text-white font-bold text-lg">94%</span>
                  </div>
                  <div className="w-full bg-white/20 h-2">
                    <div className="bg-[#0A6ED1] h-2" style={{ width: '94%' }}></div>
                  </div>
                </div>
                <div className="bg-white/20 p-4 border-l-4 border-green-500">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/80 text-xs uppercase">Adéquation Compétences</span>
                    <span className="text-white font-bold text-lg">87%</span>
                  </div>
                  <div className="w-full bg-white/20 h-2">
                    <div className="bg-green-500 h-2" style={{ width: '87%' }}></div>
                  </div>
                </div>
                <div className="bg-white/20 p-4 border-l-4 border-yellow-500">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/80 text-xs uppercase">Adéquation Culturelle</span>
                    <span className="text-white font-bold text-lg">78%</span>
                  </div>
                  <div className="w-full bg-white/20 h-2">
                    <div className="bg-yellow-500 h-2" style={{ width: '78%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Case Section */}
      <section id="solutions" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Conçu pour les organisations modernes</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Que vous soyez une petite équipe ou une grande entreprise, WorkHub évolue avec vous
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Users, title: 'PME', desc: 'Parfait pour les petites et moyennes entreprises qui souhaitent professionnaliser leurs opérations RH', stats: '10-500 employés' },
              { icon: Building2, title: 'Équipes RH', desc: 'Donnez à vos départements RH des outils qui automatisent les flux de travail et améliorent l\'efficacité', stats: 'Toute taille d\'organisation' },
              { icon: TrendingUp, title: 'Entreprises en Croissance', desc: 'Faites évoluer vos opérations RH à mesure que votre équipe grandit sans ajouter de complexité', stats: 'Équipes en croissance rapide' },
            ].map((usecase, index) => {
              const Icon = usecase.icon;
              return (
                <div key={index} className="bg-[#F5F7FA] border border-gray-200 p-8 hover:shadow-lg transition-shadow">
                  <Icon className="w-12 h-12 text-[#0A6ED1] mb-6" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{usecase.title}</h3>
                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">{usecase.desc}</p>
                  <div className="inline-block px-3 py-1 bg-[#0A6ED1]/10 border border-[#0A6ED1]/20">
                    <span className="text-xs text-[#0A6ED1] font-medium">{usecase.stats}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section className="bg-[#F5F7FA] py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Voyez WorkHub en action</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Tableaux de bord complets avec données en temps réel et insights exploitables
            </p>
          </div>

          <div className="bg-white border-2 border-gray-200 p-8 shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
              {[
                { label: 'Total Employés', value: '245', change: '+12%', color: 'blue' },
                { label: 'Paie ce Mois', value: 'MAD 1.2M', change: '+5%', color: 'green' },
                { label: 'Congés Actifs', value: '18', change: '-3', color: 'orange' },
                { label: 'Postes Ouverts', value: '7', change: '+2', color: 'purple' },
              ].map((kpi, index) => (
                <div key={index} className="bg-[#F5F7FA] border border-gray-200 p-6">
                  <p className="text-xs text-gray-500 uppercase mb-2">{kpi.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mb-1">{kpi.value}</p>
                  <p className={`text-xs text-${kpi.color}-600`}>{kpi.change}</p>
                </div>
              ))}
            </div>
            <div className="border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase">Métriques de Performance</h3>
              <div className="h-64 bg-gradient-to-b from-[#F5F7FA] to-white flex items-end justify-between px-4 pb-4">
                {[45, 68, 52, 79, 63, 88, 72, 95, 81, 67, 92, 85].map((height, i) => (
                  <div
                    key={i}
                    className="flex-1 mx-1 bg-[#0A6ED1] hover:bg-[#0959b0] transition-colors"
                    style={{ height: `${height}%` }}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Fait confiance par les grandes organisations</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { company: 'TechCorp Maroc', role: 'Directrice RH', quote: 'WorkHub a transformé nos opérations RH. Nous avons réduit le temps de traitement de la paie de 75% et amélioré considérablement la satisfaction des employés.', name: 'Sarah Bennani' },
              { company: 'Innovation Ltd', role: 'PDG', quote: 'Le module de recrutement alimenté par IA nous a aidés à embaucher les meilleurs talents 3x plus rapidement. La notation des candidats est remarquablement précise.', name: 'Mohammed Alami' },
              { company: 'Growth Inc', role: 'Responsable RH', quote: 'Meilleur investissement que nous ayons fait. Le tableau de bord analytique nous donne des insights que nous n\'avions jamais eus auparavant. Hautement recommandé pour les entreprises en croissance.', name: 'Fatima Zahra' },
            ].map((testimonial, index) => (
              <div key={index} className="bg-[#F5F7FA] border border-gray-200 p-8">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Award key={i} className="w-4 h-4 text-[#0A6ED1] fill-current" />
                  ))}
                </div>
                <p className="text-sm text-gray-700 mb-6 leading-relaxed italic">"{testimonial.quote}"</p>
                <div className="border-t border-gray-300 pt-4">
                  <p className="text-sm font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-xs text-gray-600">{testimonial.role}, {testimonial.company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="bg-gradient-to-r from-[#0A6ED1] to-[#0959b0] py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Transformez votre gestion RH aujourd'hui</h2>
          <p className="text-lg text-white/90 mb-8 leading-relaxed">
            Rejoignez des centaines d'organisations qui font confiance à WorkHub pour leurs opérations RH.
            Commencez votre essai gratuit ou planifiez une démo personnalisée avec notre équipe.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto px-8 py-4 bg-white text-[#0A6ED1] font-semibold hover:bg-gray-100 transition-colors"
            >
              Connexion
            </button>
            <button className="w-full sm:w-auto px-8 py-4 border-2 border-white text-white font-semibold hover:bg-white hover:text-[#0A6ED1] transition-colors">
              Contacter les Ventes
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1F3A5F] text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <img
                src={footerLogo}
                alt="WorkHub"
                className="h-12 mb-4"
              />
              <p className="text-sm text-white/70">
                Plateforme RH intelligente pour les entreprises modernes
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4 uppercase">Produit</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li><a href="#features" className="hover:text-white transition-colors">Fonctionnalités</a></li>
                <li><a href="#solutions" className="hover:text-white transition-colors">Solutions</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Tarifs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Sécurité</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4 uppercase">Entreprise</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li><a href="#about" className="hover:text-white transition-colors">À Propos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Carrières</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4 uppercase">Support</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li><a href="#" className="hover:text-white transition-colors">Centre d'Aide</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Référence API</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Politique de Confidentialité</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/20 pt-8 flex flex-col md:flex-row items-center justify-between">
            <p className="text-sm text-white/70">&copy; 2026 WorkHub. Tous droits réservés.</p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <a href="#" className="text-white/70 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                </svg>
              </a>
              <a href="#" className="text-white/70 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
