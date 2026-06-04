package com.workhub.identity.api.dto;

import com.workhub.identity.domain.Role;
import com.workhub.identity.domain.User;

import java.time.Instant;
import java.util.UUID;

public record UserDto(
        UUID id,
        UUID organizationId,
        String email,
        String firstName,
        String lastName,
        String phone,
        String avatarUrl,
        Role role,
        Boolean active,
        Boolean emailVerified,
        Boolean mfaEnabled,
        Instant lastLogin,
        Instant createdAt
) {
    public static UserDto from(User user) {
        return new UserDto(
                user.getId(),
                user.getOrganizationId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getPhone(),
                user.getAvatarUrl(),
                user.getRole(),
                user.getActive(),
                user.getEmailVerified(),
                user.getMfaEnabled(),
                user.getLastLogin(),
                user.getCreatedAt()
        );
    }
}
