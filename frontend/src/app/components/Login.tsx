import { useState } from "react";
import { Link } from "react-router-dom";
import { login, mfaVerify, type AuthResponse } from "@/lib/authApi";
import MfaSetupPage from "./onboarding/MfaSetupPage";
import CreateOrganizationPage from "./onboarding/CreateOrganizationPage";

interface LoginProps {
  onLoginSuccess: (token: string, user: AuthResponse["user"]) => void;
}

type Step = "credentials" | "mfa" | "mfa_setup" | "create_org";

export default function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<Step>("credentials");
  const [pendingToken, setPendingToken] = useState<string | null>(null);

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await login(email, password);
      handleAuthResponse(data);
    } catch {
      setError("Identifiants invalides");
    } finally {
      setLoading(false);
    }
  };

  const handleAuthResponse = (data: AuthResponse) => {
    if (data.status === "EMAIL_NOT_VERIFIED") {
      setError(data.message || "Email non vérifié");
      return;
    }
    if (data.status === "MFA_SETUP_REQUIRED" && data.token) {
      setPendingToken(data.token);
      setStep("mfa_setup");
      return;
    }
    if (data.status === "MFA_REQUIRED" && data.token) {
      setPendingToken(data.token);
      setStep("mfa");
      return;
    }
    if (data.status === "ORG_SETUP_REQUIRED" && data.token) {
      setPendingToken(data.token);
      setStep("create_org");
      return;
    }
    if (data.status === "SUCCESS" && data.token) {
      onLoginSuccess(data.token, data.user);
    }
  };

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingToken) return;
    setLoading(true);
    try {
      const data = await mfaVerify(pendingToken, mfaCode);
      handleAuthResponse(data);
    } catch {
      setError("Code MFA invalide");
    } finally {
      setLoading(false);
    }
  };

  if (step === "mfa_setup" && pendingToken) {
    return (
      <MfaSetupPage
        token={pendingToken}
        onComplete={(token, status) => {
          if (status === "ORG_SETUP_REQUIRED") {
            setPendingToken(token);
            setStep("create_org");
          } else {
            onLoginSuccess(token, undefined);
          }
        }}
      />
    );
  }

  if (step === "create_org" && pendingToken) {
    return (
      <CreateOrganizationPage
        token={pendingToken}
        onComplete={(token) => onLoginSuccess(token, undefined)}
      />
    );
  }

  if (step === "mfa") {
    return (
      <div className="max-w-md mx-auto mt-16 p-8 bg-white border rounded-lg">
        <h2 className="text-xl font-bold mb-4">Code MFA</h2>
        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
        <form onSubmit={handleMfaSubmit}>
          <input
            className="w-full border rounded px-3 py-2 mb-4 text-center tracking-widest"
            placeholder="000000"
            maxLength={6}
            value={mfaCode}
            onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ""))}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-[#0A6ED1] text-white rounded"
          >
            Valider
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-16 p-8 bg-white border border-gray-200 rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold text-center mb-6">Se connecter</h2>
      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
      <form onSubmit={handleCredentials} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Mot de passe</label>
          <input
            type="password"
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-[#0A6ED1] text-white font-medium rounded hover:bg-[#0959b0] disabled:opacity-50"
        >
          {loading ? "Connexion..." : "Se connecter"}
        </button>
      </form>
      <p className="text-sm text-center mt-4 text-gray-600">
        <Link to="/signup" className="text-[#0A6ED1] hover:underline">
          Créer une organisation
        </Link>
      </p>
    </div>
  );
}
