export function decodeJwtPayload(token: string): Record<string, unknown> | null {
    try {
        return JSON.parse(atob(token.split(".")[1]));
    } catch {
        return null;
    }
}

/**
 * Hook utilitaire pour récupérer l'org_id depuis le JWT local.
 * Décode le payload Base64 du token stocké dans localStorage.
 */
export function useOrganizationId(): string {
    const token = localStorage.getItem("workhub.token");
    if (!token) return "";

    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.org_id || payload.organization_id || "";
    } catch {
        return "";
    }
}

/**
 * Récupère le rôle de l'utilisateur depuis le JWT local.
 */
export function useCurrentRole(): string {
    const token = localStorage.getItem("workhub.token");
    if (!token) return "";

    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.role || "";
    } catch {
        return "";
    }
}
