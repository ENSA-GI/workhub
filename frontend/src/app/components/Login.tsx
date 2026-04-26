import { useState } from 'react';
import logo from '../../imports/Capture_d_écran_2026-04-20_183125-removebg-preview.png';

interface LoginProps {
  onLogin: () => void;
  role: string;
  onBack: () => void;
}

export default function Login({ onLogin, role, onBack }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const getRoleTitle = (role: string) => {
    const titles: { [key: string]: string } = {
      admin: 'Administrateur RH',
      manager: 'Manager',
      employee: 'Employé',
      recruiter: 'Recruteur',
      candidate: 'Candidat',
    };
    return titles[role] || 'Utilisateur';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="mb-4 text-sm text-[#0A6ED1] hover:underline flex items-center"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Retour au choix des espaces
        </button>

        {/* Logo */}
        <div className="text-center mb-8">
          <img src={logo} alt="WorkHub" className="h-16 mx-auto mb-4" />
          <h1 className="text-2xl font-semibold text-gray-900">Connexion - {getRoleTitle(role)}</h1>
          <p className="text-sm text-gray-600 mt-2">Smart HR. Stronger Organizations.</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded border border-gray-200 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Sign In</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#0A6ED1] focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#0A6ED1] focus:border-transparent"
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="w-4 h-4 border-gray-300 rounded text-[#0A6ED1] focus:ring-[#0A6ED1]" />
                <span className="ml-2 text-sm text-gray-700">Remember me</span>
              </label>
              <a href="#" className="text-sm text-[#0A6ED1] hover:underline">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 bg-[#0A6ED1] text-white rounded hover:bg-[#0959b0] transition-colors"
            >
              Sign In
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              Don't have an account?{' '}
              <a href="#" className="text-[#0A6ED1] hover:underline">
                Contact your administrator
              </a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>&copy; 2026 WorkHub. All rights reserved.</p>
          <div className="mt-2 space-x-4">
            <a href="#" className="hover:text-gray-700">Privacy Policy</a>
            <a href="#" className="hover:text-gray-700">Terms of Service</a>
            <a href="#" className="hover:text-gray-700">Support</a>
          </div>
        </div>
      </div>
    </div>
  );
}
