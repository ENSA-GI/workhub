package com.workhub.identity.kafka.event;

import java.util.UUID;

public record EmailVerificationEvent(
        UUID userId,
        String email,
        String firstName,
        String verificationToken,
        String verificationUrl
) {}
