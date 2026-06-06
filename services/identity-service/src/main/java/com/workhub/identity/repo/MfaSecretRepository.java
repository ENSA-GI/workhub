package com.workhub.identity.repo;

import com.workhub.identity.domain.MfaSecret;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface MfaSecretRepository extends JpaRepository<MfaSecret, UUID> {
}
