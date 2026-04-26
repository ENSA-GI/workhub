package com.workhub.identity.repo;

import com.workhub.identity.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    List<User> findByOrganizationId(UUID organizationId);
    Optional<User> findByClerkId(String clerkId);
}