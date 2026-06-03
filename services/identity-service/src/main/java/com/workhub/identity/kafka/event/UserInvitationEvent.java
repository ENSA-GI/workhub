package com.workhub.identity.kafka.event;

import java.util.UUID;

public record UserInvitationEvent(
        UUID userId,
        UUID organizationId,
        String email,
        String firstName,
        String role,
        String invitationToken,
        String invitationUrl
) {}
