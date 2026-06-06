import { Shield, Key, User, History, Save, Smartphone } from "lucide-react";
import { useEffect, useState } from "react";
import {
  identityApi,
  clearAuthSession,
  type UserProfile,
  type AuditEntry,
} from "@/lib/identityApi";

interface ProfilePageProps {
  onLogout: () => void;
}

export default function ProfilePage({ onLogout }: ProfilePageProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [mfaSetup, setMfaSetup] = useState<{ secret: string; qrCodeBase64: string } | null>(null);
  const [mfaCode, setMfaCode] = useState("");

  const loadProfile = async () => {
    try {
      const [me, logs] = await Promise.all([
        identityApi.getMe(),
        identityApi.getMyAuditLogs(),
      ]);
      setProfile(me);
      setFirstName(me.firstName || "");
      setLastName(me.lastName || "");
      setPhone(me.phone || "");
      setAuditLogs(logs);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSaveProfile = async () => {
    setError("");
    setSuccess("");
    try {
      const updated = await identityApi.updateMe({ firstName, lastName, phone });
      setProfile(updated);
      setSuccess("Profil mis à jour");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur");
    }
  };

  const handleChangePassword = async () => {
    setError("");
    setSuccess("");
    try {
      await identityApi.changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setSuccess("Mot de passe modifié");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur");
    }
  };

  const handleSetupMfa = async () => {
    setError("");
    try {
      const setup = await identityApi.setupMfa();
      setMfaSetup({ secret: setup.secret, qrCodeBase64: setup.qrCodeBase64 });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur MFA");
    }
  };

  const handleConfirmMfa = async () => {
    setError("");
    try {
      await identityApi.confirmMfa(mfaCode);
      setMfaSetup(null);
      setMfaCode("");
      setSuccess("MFA activé");
      loadProfile();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Code invalide");
    }
  };

  const handleDisableMfa = async () => {
    setError("");
    try {
      await identityApi.disableMfa();
      setSuccess("MFA désactivé");
      loadProfile();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur");
    }
  };

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem("workhub.refreshToken") || undefined;
    try {
      await identityApi.logout(refreshToken);
    } catch {
      /* ignore */
    }
    clearAuthSession();
    onLogout();
  };

  const mfaRequired = profile?.role === "ORG_ADMIN" || profile?.role === "RH_MANAGER";

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <p className="text-gray-600">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-[#F5F7FA] max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Mon profil & Sécurité</h1>
        <p className="text-sm text-gray-600 mt-1">Gérez vos informations et paramètres de sécurité</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">{error}</div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded">{success}</div>
      )}

      <div className="space-y-6">
        {/* Informations */}
        <section className="bg-white border border-gray-200 rounded-lg">
          <div className="p-4 border-b border-gray-200 flex items-center">
            <User className="w-5 h-5 text-[#0A6ED1] mr-2" />
            <h2 className="text-base font-semibold">Informations personnelles</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input value={profile?.email || ""} disabled className="w-full px-3 py-2 border border-gray-300 bg-gray-50 rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>
            <div className="md:col-span-2">
              <button
                onClick={handleSaveProfile}
                className="px-4 py-2 bg-[#0A6ED1] text-white rounded hover:bg-[#0959b0] flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                Enregistrer
              </button>
            </div>
          </div>
        </section>

        {/* Mot de passe */}
        <section className="bg-white border border-gray-200 rounded-lg">
          <div className="p-4 border-b border-gray-200 flex items-center">
            <Key className="w-5 h-5 text-orange-600 mr-2" />
            <h2 className="text-base font-semibold">Mot de passe</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe actuel</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>
            <div className="md:col-span-2">
              <button
                onClick={handleChangePassword}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Changer le mot de passe
              </button>
            </div>
          </div>
        </section>

        {/* MFA */}
        {(mfaRequired || profile?.mfaEnabled) && (
          <section className="bg-white border border-gray-200 rounded-lg">
            <div className="p-4 border-b border-gray-200 flex items-center">
              <Shield className="w-5 h-5 text-purple-600 mr-2" />
              <h2 className="text-base font-semibold">
                Authentification à deux facteurs (MFA)
                {mfaRequired && !profile?.mfaEnabled && (
                  <span className="ml-2 text-xs text-orange-600 font-normal">Obligatoire pour votre rôle</span>
                )}
              </h2>
            </div>
            <div className="p-6">
              {profile?.mfaEnabled ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-green-700">
                    <Smartphone className="w-5 h-5 mr-2" />
                    MFA activé
                  </div>
                  <button onClick={handleDisableMfa} className="px-3 py-1 text-sm border border-red-300 text-red-600 rounded hover:bg-red-50">
                    Désactiver
                  </button>
                </div>
              ) : mfaSetup ? (
                <div className="space-y-4">
                  <img
                    src={`data:image/png;base64,${mfaSetup.qrCodeBase64}`}
                    alt="QR Code MFA"
                    className="w-48 h-48 mx-auto border"
                  />
                  <p className="text-sm text-gray-600 text-center font-mono">{mfaSetup.secret}</p>
                  <input
                    type="text"
                    maxLength={6}
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="Code à 6 chiffres"
                    className="w-full max-w-xs mx-auto block px-3 py-2 border border-gray-300 rounded text-center"
                  />
                  <button
                    onClick={handleConfirmMfa}
                    disabled={mfaCode.length !== 6}
                    className="block mx-auto px-4 py-2 bg-[#0A6ED1] text-white rounded disabled:opacity-50"
                  >
                    Confirmer MFA
                  </button>
                </div>
              ) : (
                <button onClick={handleSetupMfa} className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
                  Configurer MFA
                </button>
              )}
            </div>
          </section>
        )}

        {/* Sessions & Audit */}
        <section className="bg-white border border-gray-200 rounded-lg">
          <div className="p-4 border-b border-gray-200 flex items-center">
            <History className="w-5 h-5 text-gray-600 mr-2" />
            <h2 className="text-base font-semibold">Historique de sécurité</h2>
          </div>
          <div className="p-6">
            <div className="mb-4 flex justify-between items-center">
              <p className="text-sm text-gray-600">Session active sur cet appareil</p>
              <button onClick={handleLogout} className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                Se déconnecter
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 text-gray-500">Action</th>
                    <th className="text-left py-2 text-gray-500">Date</th>
                    <th className="text-left py-2 text-gray-500">IP</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.slice(0, 10).map((log) => (
                    <tr key={log.id} className="border-b border-gray-100">
                      <td className="py-2">{log.action}</td>
                      <td className="py-2 text-gray-600">
                        {new Date(log.createdAt).toLocaleString("fr-FR")}
                      </td>
                      <td className="py-2 text-gray-500">{log.ipAddress || "—"}</td>
                    </tr>
                  ))}
                  {auditLogs.length === 0 && (
                    <tr>
                      <td colSpan={3} className="py-4 text-center text-gray-500">Aucun événement</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
