import { useAuth, useUser } from '@clerk/clerk-react';

const asString = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

export function useOrganizationId() {
  const { user } = useUser();
  const { orgId, sessionClaims } = useAuth();
  const claims = sessionClaims as Record<string, unknown> | null | undefined;
  const publicMetadata = user?.publicMetadata as Record<string, unknown> | undefined;

  return (
    asString(orgId) ||
    asString(claims?.org_id) ||
    asString(claims?.organization_id) ||
    asString(publicMetadata?.organizationId) ||
    asString(import.meta.env.VITE_CLERK_ORGANIZATION_ID) ||
    asString(import.meta.env.VITE_ORGANIZATION_ID)
  );
}

void useOrganizationId;

