package com.workhub.org.repo;

import com.workhub.org.domain.OrganizationSettings;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface OrganizationSettingsRepository extends JpaRepository<OrganizationSettings, UUID> {
}
