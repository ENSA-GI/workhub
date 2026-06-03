package com.workhub.org.util;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.UUID;

public class SecurityUtils {

    /**
     * Validates that the current authenticated user belongs to the requested organization.
     * Uses the 'org_id' claim from the WorkHub JWT.
     */
    public static void validateOrganizationAccess(UUID requestedOrgId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AccessDeniedException("User is not authenticated");
        }

        if (authentication.getPrincipal() instanceof Jwt jwt) {
            String tokenOrgId = jwt.getClaimAsString("org_id");
            
            if (tokenOrgId == null || tokenOrgId.isBlank()) {
                throw new AccessDeniedException("No organization context found in token");
            }
            
            if (!tokenOrgId.equals(requestedOrgId.toString())) {
                throw new AccessDeniedException("Access denied to the requested organization");
            }
        } else {
            throw new AccessDeniedException("Invalid authentication principal");
        }
    }
}
