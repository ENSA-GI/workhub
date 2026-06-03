/** Chemins relatifs : proxy Vite (5173) ou nginx (3000) → api-gateway */
const IDENTITY_BASE = import.meta.env.VITE_IDENTITY_URL || "/identity";
const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

export { IDENTITY_BASE, API_BASE };

export type LoginStatus =
  | "SUCCESS"
  | "EMAIL_NOT_VERIFIED"
  | "MFA_SETUP_REQUIRED"
  | "MFA_REQUIRED"
  | "ACCOUNT_INACTIVE"
  | "ORG_SETUP_REQUIRED";

export interface AuthResponse {
  status: LoginStatus;
  token: string | null;
  user?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: string;
    organizationId?: string;
    emailVerified?: boolean;
    mfaEnabled?: boolean;
  };
  message?: string;
}

export async function registerOwner(data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  termsAccepted: boolean;
  gdprAccepted: boolean;
}) {
  const res = await fetch(`${IDENTITY_BASE}/api/auth/register-owner`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || "Inscription échouée");
  }
  return res.json();
}

export async function login(email: string, password: string, mfaCode?: string): Promise<AuthResponse> {
  const res = await fetch(`${IDENTITY_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, mfaCode }),
  });
  if (!res.ok) throw new Error("Identifiants invalides");
  return res.json();
}

export async function verifyEmail(token: string) {
  const res = await fetch(`${IDENTITY_BASE}/api/auth/verify-email?token=${encodeURIComponent(token)}`);
  if (!res.ok) throw new Error("Lien de vérification invalide ou expiré");
  return res.json();
}

export async function mfaSetup(token: string) {
  const res = await fetch(`${IDENTITY_BASE}/api/auth/mfa/setup`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Échec configuration MFA");
  return res.json() as Promise<{ secret: string; qrCodeDataUri: string }>;
}

export async function mfaConfirm(token: string, code: string): Promise<AuthResponse> {
  const res = await fetch(`${IDENTITY_BASE}/api/auth/mfa/confirm`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ code }),
  });
  if (!res.ok) throw new Error("Code MFA invalide");
  return res.json();
}

export async function mfaVerify(token: string, code: string): Promise<AuthResponse> {
  const res = await fetch(`${IDENTITY_BASE}/api/auth/mfa/verify`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ code }),
  });
  if (!res.ok) throw new Error("Code MFA invalide");
  return res.json();
}

export async function createOrganizationOnboard(
  token: string,
  data: Record<string, string | undefined>
) {
  const res = await fetch(`${IDENTITY_BASE}/api/onboarding/organization`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || "Création organisation échouée");
  }
  return res.json();
}
