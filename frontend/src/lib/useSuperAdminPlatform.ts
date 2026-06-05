import { useCallback, useEffect, useState } from 'react';
import type { Organization } from './useOrg';
import {
  AuditLogEntry,
  IdentityUser,
  buildGrowthSeries,
  countAllEmployees,
  fetchAllOrganizations,
  fetchAllUsers,
  fetchAuditLogs,
} from './superAdminApi';

export interface PlatformAlert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  time: string;
  service?: string;
}

export interface SuperAdminPlatformData {
  organizations: Organization[];
  users: IdentityUser[];
  auditLogs: AuditLogEntry[];
  totalOrgs: number;
  totalUsers: number;
  totalEmployees: number;
  growthSeries: { month: string; users: number; orgs: number }[];
  alerts: PlatformAlert[];
  orgsCreatedThisMonth: number;
  usersCreatedThisMonth: number;
}

const empty: SuperAdminPlatformData = {
  organizations: [],
  users: [],
  auditLogs: [],
  totalOrgs: 0,
  totalUsers: 0,
  totalEmployees: 0,
  growthSeries: [],
  alerts: [],
  orgsCreatedThisMonth: 0,
  usersCreatedThisMonth: 0,
};

function startOfMonth(d = new Date()): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function buildAlertsFromAudit(logs: AuditLogEntry[]): PlatformAlert[] {
  return logs
    .filter((log) => {
      const action = log.action?.toUpperCase() ?? '';
      return action.includes('DELETE') || action.includes('ERROR') || action.includes('FAIL');
    })
    .slice(0, 10)
    .map((log) => ({
      id: log.id,
      severity: log.action?.toUpperCase().includes('ERROR') ? 'critical' as const : 'warning' as const,
      message: `${log.action} — ${log.entityType}`,
      time: log.timestamp,
      service: log.entityType,
    }));
}

export function useSuperAdminPlatform(autoRefreshMs = 0) {
  const [data, setData] = useState<SuperAdminPlatformData>(empty);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const [organizations, users, auditLogs] = await Promise.all([
        fetchAllOrganizations(),
        fetchAllUsers(),
        fetchAuditLogs().catch(() => [] as AuditLogEntry[]),
      ]);

      const totalEmployees = await countAllEmployees(organizations);
      const monthStart = startOfMonth();

      const orgsCreatedThisMonth = organizations.filter(
        (o) => o.createdAt && new Date(o.createdAt) >= monthStart
      ).length;

      const usersCreatedThisMonth = users.filter(
        (u) => u.createdAt && new Date(u.createdAt) >= monthStart
      ).length;

      const alerts = buildAlertsFromAudit(auditLogs);

      setData({
        organizations,
        users,
        auditLogs,
        totalOrgs: organizations.length,
        totalUsers: users.length,
        totalEmployees,
        growthSeries: buildGrowthSeries(organizations, users),
        alerts,
        orgsCreatedThisMonth,
        usersCreatedThisMonth,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    if (!autoRefreshMs) return;
    const id = setInterval(load, autoRefreshMs);
    return () => clearInterval(id);
  }, [load, autoRefreshMs]);

  return { ...data, loading, error, refetch: load };
}
