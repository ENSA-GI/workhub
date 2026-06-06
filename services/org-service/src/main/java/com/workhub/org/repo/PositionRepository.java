package com.workhub.org.repo;

import com.workhub.org.domain.Position;
import com.workhub.org.domain.ProfessionalCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.UUID;
import java.util.Optional;

public interface PositionRepository extends JpaRepository<Position, UUID>, JpaSpecificationExecutor<Position> {
    Page<Position> findByOrganizationId(UUID organizationId, Pageable pageable);
    Page<Position> findByOrganizationIdAndTitleContainingIgnoreCase(UUID organizationId, String title, Pageable pageable);
    Page<Position> findByOrganizationIdAndCategory(UUID organizationId, ProfessionalCategory category, Pageable pageable);
    Optional<Position> findByOrganizationIdAndTitle(UUID organizationId, String title);
    boolean existsByOrganizationIdAndTitle(UUID organizationId, String title);
    boolean existsByOrganizationIdAndTitleAndIdNot(UUID organizationId, String title, UUID id);
    long countByOrganizationIdAndActiveTrue(UUID organizationId);
}
