import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOrganizationId } from "@/lib/useOrganizationId";
import { useApi } from "@/lib/useApi";
import { useOrganizationSettings, useUpdateOrganizationSettings } from "@/lib/useOrg";

const STEPS = ["Départements", "Paie", "Congés", "Personnalisation", "RH Manager"];

export default function OnboardingWizard() {
  const orgId = useOrganizationId();
  const apiFetch = useApi();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const { data: settings } = useOrganizationSettings(orgId);
  const updateSettings = useUpdateOrganizationSettings();

  const [leaveDays, setLeaveDays] = useState("22");
  const [carryOver, setCarryOver] = useState("10");
  const [logoUrl, setLogoUrl] = useState("");
  const [legalMentions, setLegalMentions] = useState("");

  const finishStep = async () => {
    if (step === 2 && orgId) {
      await updateSettings.mutateAsync({
        orgId,
        data: {
          leavePolicyDaysPerYear: parseInt(leaveDays, 10),
          leavePolicyMaxCarryOver: parseInt(carryOver, 10),
        },
      });
    }
    if (step === 3 && orgId) {
      await updateSettings.mutateAsync({
        orgId,
        data: {
          payrollTemplateLogoUrl: logoUrl || undefined,
          payrollTemplateLegalMentions: legalMentions || undefined,
        },
      });
    }
    if (step === 0 && orgId) {
      await apiFetch(`/org/orgs/${orgId}/onboarding/setup-defaults`, { method: "POST" });
    }
    if (step < STEPS.length - 1) setStep(step + 1);
    else navigate("/");
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-2">Configuration initiale</h1>
      <p className="text-sm text-gray-600 mb-6">
        Étape {step + 1} / {STEPS.length} — {STEPS[step]}
      </p>
      <div className="bg-white border p-6 rounded-lg mb-6">
        {step === 0 && (
          <p>Création des départements Commercial, Technique et RH pour votre organisation.</p>
        )}
        {step === 1 && (
          <p>Les taux CNSS/AMO et le barème IR par défaut sont appliqués. Ajustez-les dans Paramètres paie.</p>
        )}
        {step === 2 && (
          <div className="space-y-3">
            <label className="block text-sm">Jours de congés annuels</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={leaveDays}
              onChange={(e) => setLeaveDays(e.target.value)}
            />
            <label className="block text-sm">Report maximum (jours)</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={carryOver}
              onChange={(e) => setCarryOver(e.target.value)}
            />
          </div>
        )}
        {step === 3 && (
          <div className="space-y-3">
            <label className="block text-sm">URL logo (bulletins)</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
            />
            <label className="block text-sm">Mentions légales bulletins</label>
            <textarea
              className="w-full border rounded px-3 py-2"
              rows={4}
              value={legalMentions}
              onChange={(e) => setLegalMentions(e.target.value)}
            />
          </div>
        )}
        {step === 4 && (
          <p>
            Invitez votre premier RH Manager depuis{" "}
            <button
              type="button"
              className="text-[#0A6ED1] underline"
              onClick={() => navigate("/rh-users")}
            >
              Utilisateurs RH
            </button>
            .
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={finishStep}
        className="px-6 py-2 bg-[#0A6ED1] text-white rounded"
      >
        {step < STEPS.length - 1 ? "Continuer" : "Terminer"}
      </button>
    </div>
  );
}
