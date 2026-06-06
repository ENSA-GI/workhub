import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { identityApi } from "@/lib/identityApi";

export default function ActivateAccount() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    setLoading(true);
    try {
      await identityApi.activateAccount(token, password);
      setSuccess(true);
      setTimeout(() => navigate("/"), 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA] p-4">
        <p className="text-red-600">Lien d'activation invalide</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA] p-4">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-lg shadow-sm p-8">
        <h2 className="text-2xl font-semibold text-center text-gray-900 mb-2">Activer votre compte</h2>
        <p className="text-sm text-gray-600 text-center mb-6">
          Définissez votre mot de passe pour votre première connexion
        </p>
        {success ? (
          <div className="p-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded text-center">
            Compte activé. Redirection vers la connexion...
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">{error}</div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={12}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#0A6ED1] text-white font-medium rounded hover:bg-[#0959b0] disabled:opacity-50"
              >
                {loading ? "Activation..." : "Activer mon compte"}
              </button>
              <Link to="/" className="block text-center text-sm text-[#0A6ED1] hover:underline">
                Retour à la connexion
              </Link>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
