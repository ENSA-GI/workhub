package com.workhub.org.repo;

import com.workhub.org.domain.Position;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.UUID;

public interface PositionRepository extends JpaRepository<Position, UUID> {
    Page<Position> findByOrganizationId(UUID organizationId, Pageable pageable);
}