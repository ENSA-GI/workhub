import { useState } from "react";
import { Link } from "react-router-dom";
import { identityApi } from "@/lib/identityApi";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [devToken, setDevToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setDevToken("");
    setLoading(true);

    try {
      const data = await identityApi.forgotPassword(email);
      setMessage(data.message);
      if (data.devToken) setDevToken(data.devToken);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA] p-4">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-lg shadow-sm p-8">
        <h2 className="text-2xl font-semibold text-center text-gray-900 mb-2">Mot de passe oublié</h2>
        <p className="text-sm text-gray-600 text-center mb-6">
          Entrez votre email pour recevoir un lien de réinitialisation
        </p>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">{error}</div>
        )}
        {message && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded">
            {message}
            {devToken && (
              <p className="mt-2">
                Token dev :{" "}
                <Link to={`/reset-password?token=${devToken}`} className="underline font-mono text-xs break-all">
                  {devToken}
                </Link>
              </p>
            )}
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
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#0A6ED1] text-white font-medium rounded hover:bg-[#0959b0] disabled:opacity-50"
          >
            {loading ? "Envoi..." : "Envoyer le lien"}
          </button>
          <Link to="/" className="block text-center text-sm text-[#0A6ED1] hover:underline">
            Retour à la connexion
          </Link>
        </form>
      </div>
    </div>
  );
}
