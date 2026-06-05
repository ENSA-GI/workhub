import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { identityApi, saveAuthSession, type AuthResponse } from "@/lib/identityApi";
import logo from '@/imports/Capture_d_écran_2026-04-20_183125-removebg-preview.png';

interface LoginProps {
  onLoginSuccess: (token: string, user: AuthResponse["user"]) => void;
  onMfaRequired: (mfaSessionToken: string) => void;
}

export default function Login({ onLoginSuccess, onMfaRequired }: LoginProps) {
  const [searchParams] = useSearchParams();
  const justRegistered = searchParams.get('registered');
  const [registrationSuccess, setRegistrationSuccess] = useState(!!justRegistered);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (justRegistered) {
      const timer = setTimeout(() => setRegistrationSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [justRegistered]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await identityApi.login(email, password);

      if (data.mfaRequired && data.mfaSessionToken) {
        onMfaRequired(data.mfaSessionToken);
        return;
      }

      if (!data.token) throw new Error("Authentication failed");

      // #region debug-point B:login-success
      fetch("http://127.0.0.1:7777/event", { method: "POST", body: JSON.stringify({ sessionId: "login-empty-response", runId: "post-fix", hypothesisId: "B", location: "Login.tsx", msg: "[DEBUG] Login success callback about to run", data: { pathname: window.location.pathname, hasToken: Boolean(data.token), userRole: data.user?.role ?? null }, ts: Date.now() }) }).catch(() => {});
      // #endregion

      saveAuthSession(data);
      onLoginSuccess(data.token, data.user);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            <Link to="/" className="flex items-center">
              <img src={logo} alt="WorkHub" className="h-16" />
            </Link>
            <button
              onClick={() => window.location.href = "/"}
              className="text-sm text-[#0A6ED1] hover:underline"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      </header>
      <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA] p-4">
        <div className="w-full max-w-md bg-white border border-gray-200 rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-semibold text-center text-gray-900 mb-6">Se connecter</h2>

          {registrationSuccess && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded">
              ✅ Organisation créée avec succès ! Vous pouvez maintenant vous connecter avec votre compte administrateur.
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]"
              />
            </div>
            <div className="text-right">
              <Link to="/forgot-password" className="text-sm text-[#0A6ED1] hover:underline">
                Mot de passe oublié ?
              </Link>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#0A6ED1] text-white font-medium rounded hover:bg-[#0959b0] disabled:opacity-50"
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          {/* Lien vers l'inscription */}
          <div className="mt-4 text-center text-sm">
            <span className="text-gray-600">Vous n'avez pas encore d'organisation ? </span>
            <Link to="/register" className="text-[#0A6ED1] font-medium hover:underline">
              Créer mon organisation
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
