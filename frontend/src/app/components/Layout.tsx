import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, DollarSign, Calendar, Briefcase, Bell, Search, Home, Building2, FileText, AlertTriangle, Settings, BarChart3, UserCog, User, Folder, TrendingUp, Receipt, Shield } from 'lucide-react';
import logo from '../../imports/Capture_d_écran_2026-04-20_185048-removebg-preview.png';
import { useUser } from '@/lib/useUser';
import { motion, AnimatePresence } from 'motion/react';

interface LayoutProps {
  children: React.ReactNode;
  userRole: string;
  onBackToHome: () => void;
  isSimpleLayout?: boolean;
}

export default function Layout({ children, userRole, onBackToHome}: LayoutProps) {
  const location = useLocation();

  const getRoleTitle = (role: string) => {
    const titles: { [key: string]: string } = {
      'super-admin': 'Super Administrateur',
      'org-admin': 'Administrateur Organisation',
      'rh-manager': 'RH Manager',
      admin: 'Administrateur RH',
      manager: 'Manager',
      employee: 'Employé',
      recruiter: 'Recruteur',
      candidate: 'Candidat',
    };
    return titles[role] || 'Utilisateur';
  };

  const { user } = useUser();

  const userName = user && (user.firstName || user.lastName)
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
    : (user?.primaryEmailAddress?.emailAddress || getRoleTitle(userRole));

  const userInitials = user && (user.firstName || user.lastName)
    ? `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase()
    : userName.substring(0, 2).toUpperCase();

  const getNavigationForRole = (role: string) => {
    const allNavigation = [
      { name: 'Tableau de bord', href: '/', icon: LayoutDashboard },
      { name: 'Employés', href: '/employees', icon: Users },
      { name: 'Paie', href: '/payroll', icon: DollarSign },
      { name: 'Congés', href: '/leave', icon: Calendar },
      { name: 'Recrutement', href: '/recruitment', icon: Briefcase },
    ];

    const superAdminNav = [
      { name: 'Tableau de bord', href: '/', icon: LayoutDashboard },
      { name: 'Organisations', href: '/organizations', icon: Building2 },
      { name: 'Abonnements', href: '/subscriptions', icon: DollarSign },
      { name: 'Surveillance', href: '/monitoring', icon: Home },
      { name: 'Logs', href: '/logs', icon: FileText },
      { name: 'Support', href: '/support', icon: AlertTriangle },
      { name: 'Configuration', href: '/config', icon: Settings },
      { name: 'Profil & Sécurité', href: '/profile', icon: Shield },
    ];

    const orgAdminNav = [
      { name: 'Tableau de bord', href: '/', icon: LayoutDashboard },
      { name: 'Employés', href: '/employees', icon: Users },
      { name: 'Analytique Paie', href: '/payroll', icon: BarChart3 },
      { name: 'Paramètres de paie', href: '/payroll-settings', icon: Settings },
      { name: 'Congés', href: '/leave', icon: Calendar },
      { name: 'Recrutement', href: '/recruitment', icon: Briefcase },
      { name: 'Analytique', href: '/analytics', icon: BarChart3 },
      { name: 'Utilisateurs RH', href: '/rh-users', icon: UserCog },
      { name: 'Configuration', href: '/config', icon: Settings },
      { name: 'Historique', href: '/audit', icon: FileText },
      { name: 'Profil & Sécurité', href: '/profile', icon: Shield },
    ];

    const rhManagerNav = [
      { name: 'Tableau de bord RH', href: '/', icon: LayoutDashboard },
      { name: 'Employés', href: '/employees', icon: Users },
      { name: 'Paie', href: '/payroll', icon: DollarSign },
      { name: 'Historique Paie', href: '/payroll-history', icon: TrendingUp },
      { name: 'Congés', href: '/leave', icon: Calendar },
      { name: 'Recrutement', href: '/recruitment', icon: Briefcase },
      { name: 'Analytique', href: '/analytics', icon: BarChart3 },
      { name: 'Profil & Sécurité', href: '/profile', icon: Shield },
    ];

    const employeeNav = [
      { name: 'Tableau de bord', href: '/', icon: LayoutDashboard },
      { name: 'Mon Profil', href: '/profil', icon: User },
      { name: 'Mes Bulletins', href: '/bulletins', icon: FileText },
      { name: 'Mes Congés', href: '/conges', icon: Calendar },
      { name: 'Mes Documents', href: '/documents', icon: Folder },
      { name: 'Notifications', href: '/notifications', icon: Bell },
      { name: 'Profil & Sécurité', href: '/profile', icon: Shield },
    ];

    const candidateNav = [
      { name: 'Offres', href: '/', icon: Briefcase },
      { name: 'Mes Candidatures', href: '/candidatures', icon: FileText },
      { name: 'Mon Profil', href: '/profil', icon: User },
      { name: 'Mes Documents', href: '/documents', icon: Folder },
      { name: 'Notifications', href: '/notifications', icon: Bell },
      { name: 'Profil & Sécurité', href: '/profile', icon: Shield },
    ];

    switch (role) {
      case 'super-admin':
        return superAdminNav;
      case 'org-admin':
        return orgAdminNav;
      case 'rh-manager':
        return rhManagerNav;
      case 'manager':
        return [
          { name: 'Mon Équipe', href: '/', icon: Users },
          { name: 'Congés', href: '/leave', icon: Calendar },
          { name: 'Profil & Sécurité', href: '/profile', icon: Shield },
        ];
      case 'employee':
        return employeeNav;
      case 'recruiter':
        return [{ name: 'Recrutement', href: '/', icon: Briefcase }];
      case 'candidate':
        return candidateNav;
      default:
        return allNavigation;
    }
  };

  const navigation = getNavigationForRole(userRole);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-slate-50 p-4 overflow-hidden relative">
      {/* Background decorations - Animated Blobs */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-purple-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-indigo-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Sidebar */}
      <motion.aside 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-64 bg-[#1F3A5F]/80 backdrop-blur-2xl text-white flex flex-col rounded-[2rem] shadow-2xl overflow-hidden z-20 border border-white/10"
      >
        {/* Logo */}
        <div className="h-24 flex items-center justify-center px-6 border-b border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-50"></div>
          <img
            src={logo}
            alt="WorkHub"
            className="h-16 w-auto relative z-10 animate-float drop-shadow-md"
          />
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto overflow-x-hidden relative z-50">
          {navigation.map((item, index) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <motion.div
                key={item.name}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <Link
                  to={item.href}
                  className={`flex items-center px-4 py-3 mb-2 rounded-xl transition-all duration-300 group relative z-50 overflow-hidden ${
                    active
                      ? 'bg-gradient-to-r from-[#0A6ED1] to-blue-500 shadow-lg shadow-blue-500/30 text-white translate-x-2'
                      : 'text-white/70 hover:bg-white/10 hover:text-white hover:translate-x-2'
                  }`}
                >
                  {active && (
                    <div className="absolute inset-0 bg-white/10 w-full h-full animate-pulse pointer-events-none" />
                  )}
                  <Icon className={`w-5 h-5 mr-3 transition-transform duration-300 relative z-10 ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
                  <span className="font-medium tracking-wide relative z-10 text-sm">{item.name}</span>
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-white/5 bg-black/10">
          <div className="px-4 py-3">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0A6ED1] to-purple-500 flex items-center justify-center mr-3 shadow-lg ring-2 ring-white/20">
                <span className="text-sm font-bold">{userInitials}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate tracking-wide">{userName}</p>
                <p className="text-xs text-white/50 truncate">Espace {getRoleTitle(userRole)}</p>
              </div>
            </div>
            <button
              onClick={onBackToHome}
              className="w-full flex items-center justify-center px-3 py-2.5 bg-white/5 hover:bg-white/15 rounded-xl text-sm font-medium text-white/90 transition-all duration-200 hover:shadow-md border border-white/10"
            >
              <Home className="w-4 h-4 mr-2" />
              Retour à l'accueil
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10 pl-6">
        {/* Header */}
        <motion.header 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="h-16 glass rounded-2xl mb-6 flex items-center justify-between px-6 sticky top-0 z-30 transition-all duration-300"
        >
          <div className="flex-1 max-w-xl">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#0A6ED1] transition-colors" />
              <input
                type="text"
                placeholder="Rechercher des employés, documents..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50/50 border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]/50 focus:bg-white transition-all duration-300 placeholder-gray-400"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4 ml-6">
            <button className="p-2 hover:bg-gray-100/80 rounded-xl relative transition-colors shadow-sm bg-white/50 border border-gray-200/50">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            </button>
            <div className="flex items-center space-x-3 px-3 py-1.5 bg-white/60 border border-gray-200/50 rounded-xl shadow-sm hover:shadow transition-shadow cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#0A6ED1] to-indigo-500 flex items-center justify-center shadow-inner">
                <span className="text-xs font-bold text-white">{userInitials}</span>
              </div>
              <span className="text-sm font-semibold text-gray-700 pr-2">{userName}</span>
            </div>
            <button
              onClick={onBackToHome}
              className="p-2 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors shadow-sm bg-white/50 border border-gray-200/50 group"
              title="Déconnexion"
            >
              <Home className="w-5 h-5 text-gray-600 group-hover:text-red-600 transition-colors" />
            </button>
          </div>
        </motion.header>

        {/* Page content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto pb-4 rounded-2xl relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
