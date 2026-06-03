import { useState } from "react";
import { Link } from "react-router-dom";
import { registerOwner } from "@/lib/authApi";

interface SignupPageProps {
  onRegistered: () => void;
}

export default function SignupPage({ onRegistered }: SignupPageProps) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    termsAccepted: false,
    gdprAccepted: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }
    if (!form.termsAccepted || !form.gdprAccepted) {
      setError("Vous devez accepter les CGU et la politique RGPD");
      return;
    }
    setLoading(true);
    try {
      await registerOwner({
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone || undefined,
        termsAccepted: form.termsAccepted,
        gdprAccepted: form.gdprAccepted,
      });
      setSuccess(true);
      onRegistered();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur d'inscription");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-lg mx-auto mt-16 p-8 bg-white border border-gray-200 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Compte créé</h2>
        <p className="text-gray-600 mb-4">
          Un email de confirmation a été envoyé à <strong>{form.email}</strong>.
          Vérifiez votre boîte mail avant de vous connecter.
        </p>
        <Link to="/login" className="text-[#0A6ED1] hover:underline">
          Aller à la connexion
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto mt-12 p-8 bg-white border border-gray-200 rounded-lg shadow-sm">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Créer une organisation</h1>
      <p className="text-sm text-gray-600 mb-6">
        Inscription en tant que propriétaire (rôle Propriétaire en attente)
      </p>
      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Prénom</label>
            <input
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nom</label>
            <input
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email professionnel</label>
          <input
            type="email"
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Téléphone</label>
          <input
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Mot de passe</label>
          <input
            type="password"
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            minLength={8}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Confirmer le mot de passe</label>
          <input
            type="password"
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            required
          />
        </div>
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.termsAccepted}
            onChange={(e) => setForm({ ...form, termsAccepted: e.target.checked })}
          />
          <span>J'accepte les conditions d'utilisation</span>
        </label>
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.gdprAccepted}
            onChange={(e) => setForm({ ...form, gdprAccepted: e.target.checked })}
          />
          <span>J'accepte la politique RGPD et le traitement de mes données</span>
        </label>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-[#0A6ED1] text-white font-medium rounded hover:bg-[#0959b0] disabled:opacity-50"
        >
          {loading ? "Création..." : "Créer mon compte"}
        </button>
      </form>
      <p className="text-sm text-center mt-4 text-gray-600">
        Déjà inscrit ?{" "}
        <Link to="/login" className="text-[#0A6ED1] hover:underline">
          Se connecter
        </Link>
      </p>
    </div>
  );
}
