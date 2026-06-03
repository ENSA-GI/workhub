package com.workhub.identity.util;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.UUID;

public class SecurityUtils {

    public static UUID currentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof Jwt jwt) {
            return UUID.fromString(jwt.getSubject());
        }
        throw new AccessDeniedException("Non authentifié");
    }

    public static UUID currentOrganizationId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof Jwt jwt) {
            String orgId = jwt.getClaimAsString("org_id");
            if (orgId == null || orgId.isBlank()) {
                return null;
            }
            return UUID.fromString(orgId);
        }
        throw new AccessDeniedException("Non authentifié");
    }

    public static String currentRole() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof Jwt jwt) {
            return jwt.getClaimAsString("role");
        }
        throw new AccessDeniedException("Non authentifié");
    }

    public static void validateOrganizationAccess(UUID requestedOrgId) {
        String role = currentRole();
        if ("SUPER_ADMIN".equals(role)) {
            return;
        }
        UUID tokenOrg = currentOrganizationId();
        if (tokenOrg == null || !tokenOrg.equals(requestedOrgId)) {
            throw new AccessDeniedException("Accès refusé à cette organisation");
        }
    }

    public static void requirePurpose(String expected) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof Jwt jwt) {
            String purpose = jwt.getClaimAsString("purpose");
            if (expected.equals(purpose)) {
                return;
            }
        }
        throw new AccessDeniedException("Token non autorisé pour cette opération");
    }
}
