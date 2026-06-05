import type { Organization, PageResponse } from './useOrg';

export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';
export const IDENTITY_BASE = import.meta.env.VITE_IDENTITY_URL || 'http://localhost:8088';

export function authHeaders(): HeadersInit {
  const token = localStorage.getItem('workhub.token');
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { headers: authHeaders() });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`API ${res.status} on ${path}: ${txt}`);
  }
  return res.json() as Promise<T>;
}

export interface IdentityUser {
  id: string;
  organizationId?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  active: boolean;
  createdAt?: string;
}

export interface AuditLogEntry {
  id: string;
  organizationId?: string;
  userId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  timestamp: string;
}

export const PLAN_PRICES_MAD: Record<string, number> = {
  FREE: 0,
  TRIAL: 0,
  STANDARD: 149,
  PREMIUM: 299,
  ENTERPRISE: 599,
};

export function planLabel(plan?: string): string {
  if (!plan) return 'FREE';
  return plan.toUpperCase();
}

export function planPrice(plan?: string): string {
  const key = planLabel(plan);
  const amount = PLAN_PRICES_MAD[key] ?? 0;
  return amount === 0 ? 'MAD 0/mois' : `MAD ${amount}/mois`;
}

export async function fetchAllOrganizations(): Promise<Organization[]> {
  const size = 100;
  let page = 0;
  const all: Organization[] = [];
  let totalPages = 1;

  while (page < totalPages) {
    const data = await apiGet<PageResponse<Organization>>(
      `/org/orgs?page=${page}&size=${size}`
    );
    all.push(...(data.content || []));
    totalPages = data.totalPages ?? 1;
    page += 1;
  }

  return all;
}

export async function fetchAllUsers(): Promise<IdentityUser[]> {
  const res = await fetch(`${API_BASE}/identity/api/users`, { headers: authHeaders() });
  if (!res.ok) {
    const fallback = await fetch(`${IDENTITY_BASE}/api/users`, { headers: authHeaders() });
    if (!fallback.ok) {
      throw new Error(`Impossible de charger les utilisateurs (${res.status})`);
    }
    return fallback.json();
  }
  return res.json();
}

export async function fetchAuditLogs(): Promise<AuditLogEntry[]> {
  try {
    return await apiGet<AuditLogEntry[]>('/audit/audit-logs');
  } catch {
    return apiGet<AuditLogEntry[]>('/api/audit-logs');
  }
}

export async function countEmployeesForOrg(organizationId: string): Promise<number> {
  try {
    const data = await apiGet<PageResponse<{ id: string }>>(
      `/employee/employees?organizationId=${organizationId}&status=ACTIVE&page=0&size=1`
    );
    return data.totalElements ?? 0;
  } catch {
    return 0;
  }
}

export async function countAllEmployees(organizations: Organization[]): Promise<number> {
  const counts = await Promise.all(
    organizations.map((org) => countEmployeesForOrg(org.id))
  );
  return counts.reduce((sum, n) => sum + n, 0);
}

export function buildGrowthSeries(
  organizations: Organization[],
  users: IdentityUser[],
  months = 6
): { month: string; users: number; orgs: number }[] {
  const now = new Date();
  const series: { month: string; users: number; orgs: number }[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
    const label = d.toLocaleDateString('fr-FR', { month: 'short' });

    const orgs = organizations.filter((o) => {
      if (!o.createdAt) return true;
      return new Date(o.createdAt) <= end;
    }).length;

    const userCount = users.filter((u) => {
      if (!u.createdAt) return true;
      return new Date(u.createdAt) <= end;
    }).length;

    series.push({ month: label, orgs, users: userCount });
  }

  return series;
}

export function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "À l'instant";
  if (mins < 60) return `Il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  return `Il y a ${days}j`;
}
