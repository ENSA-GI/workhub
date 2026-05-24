import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, DollarSign, Calendar, Briefcase, Bell, Search, Home, Building2, FileText, AlertTriangle, Settings, BarChart3, UserCog, Download, User, Folder, TrendingUp, Receipt } from 'lucide-react';
import logo from '../../imports/Capture_d_écran_2026-04-20_185048-removebg-preview.png';

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
    ];

    const orgAdminNav = [
      { name: 'Tableau de bord', href: '/', icon: LayoutDashboard },
      { name: 'Employés', href: '/employees', icon: Users },
      { name: 'Paie', href: '/payroll', icon: DollarSign },
      { name: 'Paramètres Paie', href: '/payroll-settings', icon: Settings },
      { name: 'Congés', href: '/leave', icon: Calendar },
      { name: 'Recrutement', href: '/recruitment', icon: Briefcase },
      { name: 'Analytique', href: '/analytics', icon: BarChart3 },
      { name: 'Utilisateurs RH', href: '/rh-users', icon: UserCog },
      { name: 'Configuration', href: '/config', icon: Settings },
      { name: 'Historique', href: '/audit', icon: FileText },
      { name: 'Export Données', href: '/export', icon: Download },
    ];

    const rhManagerNav = [
      { name: 'Tableau de bord RH', href: '/', icon: LayoutDashboard },
      { name: 'Employés', href: '/employees', icon: Users },
      { name: 'Paie', href: '/payroll', icon: DollarSign },
      { name: 'Générer Paie', href: '/payroll-generation', icon: Receipt },
      { name: 'Bulletins', href: '/payroll-bulletins', icon: FileText },
      { name: 'Historique Paie', href: '/payroll-history', icon: TrendingUp },
      { name: 'Congés', href: '/leave', icon: Calendar },
      { name: 'Recrutement', href: '/recruitment', icon: Briefcase },
      { name: 'Analytique', href: '/analytics', icon: BarChart3 },
    ];

    const employeeNav = [
      { name: 'Tableau de bord', href: '/', icon: LayoutDashboard },
      { name: 'Mon Profil', href: '/profil', icon: User },
      { name: 'Mes Bulletins', href: '/bulletins', icon: FileText },
      { name: 'Mes Congés', href: '/conges', icon: Calendar },
      { name: 'Mes Documents', href: '/documents', icon: Folder },
      { name: 'Notifications', href: '/notifications', icon: Bell },
    ];

    const candidateNav = [
      { name: 'Offres', href: '/', icon: Briefcase },
      { name: 'Mes Candidatures', href: '/candidatures', icon: FileText },
      { name: 'Mon Profil', href: '/profil', icon: User },
      { name: 'Mes Documents', href: '/documents', icon: Folder },
      { name: 'Notifications', href: '/notifications', icon: Bell },
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
    <div className="flex h-screen bg-[#F5F7FA]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1F3A5F] text-white flex flex-col">
        {/* Logo */}
        <div className="h-20 flex items-center justify-center px-6 border-b border-white/10">
          <img
            src={logo}
            alt="WorkHub"
            className="h-14 w-auto"
          />
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-4 py-3 mb-1 rounded transition-colors ${
                  active
                    ? 'bg-[#0A6ED1] text-white'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-white/10">
          <div className="px-4 py-3">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 rounded-full bg-[#0A6ED1] flex items-center justify-center mr-3">
                <span className="text-sm font-medium">{getRoleTitle(userRole).substring(0, 2).toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{getRoleTitle(userRole)}</p>
                <p className="text-xs text-white/60 truncate">Espace {getRoleTitle(userRole)}</p>
              </div>
            </div>
            <button
              onClick={onBackToHome}
              className="w-full flex items-center justify-center px-3 py-2 bg-white/10 hover:bg-white/20 rounded text-sm text-white transition-colors"
            >
              <Home className="w-4 h-4 mr-2" />
              Retour à l'accueil
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search employees, documents, or anything..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#0A6ED1] focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4 ml-6">
            <button className="p-2 hover:bg-gray-100 rounded-full relative">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded">
              <div className="w-6 h-6 rounded-full bg-[#0A6ED1] flex items-center justify-center">
                <span className="text-xs font-medium text-white">{getRoleTitle(userRole).substring(0, 2).toUpperCase()}</span>
              </div>
              <span className="text-sm font-medium text-gray-700">{getRoleTitle(userRole)}</span>
            </div>
            <button
              onClick={onBackToHome}
              className="p-2 hover:bg-gray-100 rounded-full"
              title="Retour à l'accueil"
            >
              <Home className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
