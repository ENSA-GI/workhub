package com.workhub.employee.util;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.UUID;

public class SecurityUtils {

    public static void validateOrganizationAccess(UUID requestedOrgId) {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof Jwt jwt)) {
            throw new AccessDeniedException("Non authentifié");
        }
        String role = jwt.getClaimAsString("role");
        if ("SUPER_ADMIN".equals(role)) return;
        String orgId = jwt.getClaimAsString("org_id");
        if (orgId == null || !orgId.equals(requestedOrgId.toString())) {
            throw new AccessDeniedException("Accès refusé");
        }
    }
}
