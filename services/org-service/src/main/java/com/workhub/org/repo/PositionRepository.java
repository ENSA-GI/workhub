package com.workhub.org.repo;

import com.workhub.org.domain.Position;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PositionRepository extends JpaRepository<Position, UUID> {
    List<Position> findByOrganizationId(UUID organizationId);
}