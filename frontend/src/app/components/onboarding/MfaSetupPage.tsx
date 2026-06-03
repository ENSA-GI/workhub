import { useEffect, useState } from "react";
import { mfaConfirm, mfaSetup } from "@/lib/authApi";

interface MfaSetupPageProps {
  token: string;
  onComplete: (fullToken: string, status: string) => void;
}

export default function MfaSetupPage({ token, onComplete }: MfaSetupPageProps) {
  const [qrUri, setQrUri] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    mfaSetup(token)
      .then((res) => setQrUri(res.qrCodeDataUri))
      .catch(() => setError("Impossible de charger la configuration MFA"));
  }, [token]);

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await mfaConfirm(token, code);
      if (res.token) onComplete(res.token, res.status);
    } catch {
      setError("Code invalide");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-8 bg-white border rounded-lg">
      <h2 className="text-xl font-bold mb-2">Activer l'authentification MFA</h2>
      <p className="text-sm text-gray-600 mb-4">
        Scannez le QR code avec votre application d'authentification, puis entrez le code à 6 chiffres.
      </p>
      {qrUri && (
        <img src={qrUri} alt="QR MFA" className="mx-auto mb-4 w-48 h-48" />
      )}
      {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
      <form onSubmit={handleConfirm}>
        <input
          className="w-full border rounded px-3 py-2 mb-4 text-center tracking-widest"
          placeholder="000000"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          required
        />
        <button
          type="submit"
          disabled={loading || code.length < 6}
          className="w-full py-2 bg-[#0A6ED1] text-white rounded disabled:opacity-50"
        >
          {loading ? "Validation..." : "Activer MFA"}
        </button>
      </form>
    </div>
  );
}
