import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { identityApi, saveAuthSession } from "@/lib/identityApi";

interface MfaVerifyProps {
  mfaSessionToken: string;
  onSuccess: (token: string) => void;
  onCancel: () => void;
}

export default function MfaVerify({ mfaSessionToken, onSuccess, onCancel }: MfaVerifyProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await identityApi.verifyMfa(mfaSessionToken, code);
      if (!data.token) throw new Error("Verification failed");
      saveAuthSession(data);
      onSuccess(data.token);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Code invalide");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA] p-4">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-lg shadow-sm p-8">
        <h2 className="text-2xl font-semibold text-center text-gray-900 mb-2">Vérification MFA</h2>
        <p className="text-sm text-gray-600 text-center mb-6">
          Entrez le code à 6 chiffres de votre application d'authentification
        </p>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Code TOTP</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              required
              autoFocus
              className="w-full px-3 py-2 border border-gray-300 rounded text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]"
              placeholder="000000"
            />
          </div>
          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full py-2.5 bg-[#0A6ED1] text-white font-medium rounded hover:bg-[#0959b0] disabled:opacity-50"
          >
            {loading ? "Vérification..." : "Vérifier"}
          </button>
          <button
            type="button"
            onClick={() => { onCancel(); navigate("/"); }}
            className="w-full py-2 text-sm text-gray-600 hover:text-gray-900"
          >
            Annuler
          </button>
        </form>
      </div>
    </div>
  );
}
