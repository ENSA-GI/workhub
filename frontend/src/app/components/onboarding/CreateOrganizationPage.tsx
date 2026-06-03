import { useState } from "react";
import { createOrganizationOnboard } from "@/lib/authApi";

interface CreateOrganizationPageProps {
  token: string;
  onComplete: (token: string) => void;
}

export default function CreateOrganizationPage({ token, onComplete }: CreateOrganizationPageProps) {
  const [form, setForm] = useState({
    name: "",
    legalName: "",
    industry: "",
    taxId: "",
    address: "",
    city: "",
    phone: "",
    email: "",
    country: "Maroc",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await createOrganizationOnboard(token, form);
      onComplete(res.token);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-8 bg-white border rounded-lg">
      <h2 className="text-xl font-bold mb-4">Créer votre organisation</h2>
      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Nom commercial *"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Raison sociale *"
          value={form.legalName}
          onChange={(e) => setForm({ ...form, legalName: e.target.value })}
          required
        />
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Secteur d'activité"
          value={form.industry}
          onChange={(e) => setForm({ ...form, industry: e.target.value })}
        />
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Identifiant fiscal (ICE)"
          value={form.taxId}
          onChange={(e) => setForm({ ...form, taxId: e.target.value })}
        />
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Adresse du siège"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
        />
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Ville"
          value={form.city}
          onChange={(e) => setForm({ ...form, city: e.target.value })}
        />
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Téléphone entreprise"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-[#0A6ED1] text-white rounded font-medium"
        >
          {loading ? "Création..." : "Créer l'organisation"}
        </button>
      </form>
    </div>
  );
}
