const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8888";
const IDENTITY_BASE = import.meta.env.VITE_IDENTITY_URL || "http://localhost:8088";

export interface UserProfile {
  id: string;
  organizationId?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatarUrl?: string;
  role: string;
  active: boolean;
  emailVerified: boolean;
  mfaEnabled: boolean;
  lastLogin?: string;
  createdAt?: string;
}

export interface AuthResponse {
  token: string | null;
  refreshToken: string | null;
  user: UserProfile | null;
  mfaRequired: boolean;
  mfaSessionToken: string | null;
}

export interface AuditEntry {
  id: string;
  action: string;
  details?: string;
  ipAddress?: string;
  createdAt: string;
}

async function identityFetch(path: string, options: RequestInit = {}) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };

  const res = await fetch(`${IDENTITY_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || data.message || "Request failed");
  }
  return data;
}

export function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("workhub.token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const identityApi = {
  login: (email: string, password: string) =>
    identityFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }) as Promise<AuthResponse>,

  verifyMfa: (mfaSessionToken: string, code: string) =>
    identityFetch("/api/auth/mfa/verify", {
      method: "POST",
      body: JSON.stringify({ mfaSessionToken, code }),
    }) as Promise<AuthResponse>,

  refresh: (refreshToken: string) =>
    identityFetch("/api/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    }) as Promise<AuthResponse>,

  logout: (refreshToken?: string) =>
    identityFetch("/api/auth/logout", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ refreshToken }),
    }),

  forgotPassword: (email: string) =>
    identityFetch("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token: string, password: string) =>
    identityFetch("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    }),

  activateAccount: (token: string, password: string) =>
    identityFetch("/api/auth/activate", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    }),

  getMe: () =>
    identityFetch("/api/users/me", { headers: authHeaders() }) as Promise<UserProfile>,

  updateMe: (data: Partial<UserProfile>) =>
    identityFetch("/api/users/me", {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(data),
    }) as Promise<UserProfile>,

  changePassword: (currentPassword: string, newPassword: string) =>
    identityFetch("/api/users/me/change-password", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ currentPassword, newPassword }),
    }),

  getMyAuditLogs: () =>
    identityFetch("/api/users/me/audit", { headers: authHeaders() }) as Promise<AuditEntry[]>,

  setupMfa: () =>
    identityFetch("/api/mfa/setup", {
      method: "POST",
      headers: authHeaders(),
    }) as Promise<{ secret: string; otpAuthUrl: string; qrCodeBase64: string }>,

  confirmMfa: (code: string) =>
    identityFetch("/api/mfa/setup/confirm", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ code }),
    }),

  disableMfa: () =>
    identityFetch("/api/mfa", {
      method: "DELETE",
      headers: authHeaders(),
    }),
};

export function saveAuthSession(data: AuthResponse) {
  if (data.token) localStorage.setItem("workhub.token", data.token);
  if (data.refreshToken) localStorage.setItem("workhub.refreshToken", data.refreshToken);
  localStorage.setItem("workhub.lastActivity", String(Date.now()));
}

export function clearAuthSession() {
  localStorage.removeItem("workhub.token");
  localStorage.removeItem("workhub.refreshToken");
  localStorage.removeItem("workhub.lastActivity");
  localStorage.removeItem("workhub.selectedRole");
}

export function touchActivity() {
  localStorage.setItem("workhub.lastActivity", String(Date.now()));
}

export async function refreshTokenIfNeeded(): Promise<boolean> {
  const refreshToken = localStorage.getItem("workhub.refreshToken");
  if (!refreshToken) return false;
  try {
    const data = await identityApi.refresh(refreshToken);
    saveAuthSession(data);
    return true;
  } catch {
    clearAuthSession();
    return false;
  }
}
