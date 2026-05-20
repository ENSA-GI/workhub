package com.workhub.org.service;

import com.workhub.org.api.exception.ResourceNotFoundException;
import com.workhub.org.domain.Position;
import com.workhub.org.dto.CreatePositionRequest;
import com.workhub.org.dto.UpdatePositionRequest;
import com.workhub.org.repo.PositionRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class PositionService {

    private final PositionRepository posRepo;
    private final OrganizationService orgService;

    public PositionService(PositionRepository posRepo, OrganizationService orgService) {
        this.posRepo = posRepo;
        this.orgService = orgService;
    }

    @Transactional
    public Position createPosition(CreatePositionRequest req) {
        // Validate organization exists
        orgService.getOrganizationById(req.organizationId());

        Position p = Position.builder()
                .id(UUID.randomUUID())
                .organizationId(req.organizationId())
                .title(req.title())
                .description(req.description())
                .category(req.category())
                .active(true)
                .build();
        return posRepo.save(p);
    }

    public Page<Position> getPositionsByOrganizationId(UUID orgId, Pageable pageable) {
        return posRepo.findByOrganizationId(orgId, pageable);
    }

    public Position getPositionById(UUID id) {
        return posRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Position not found with id: " + id));
    }

    @Transactional
    public Position updatePosition(UUID id, UpdatePositionRequest req) {
        Position pos = getPositionById(id);
        pos.setTitle(req.title());
        pos.setDescription(req.description());
        pos.setCategory(req.category());
        if (req.active() != null) {
            pos.setActive(req.active());
        }
        return posRepo.save(pos);
    }

    @Transactional
    public void deletePosition(UUID id) {
        Position pos = getPositionById(id);
        pos.setActive(false);
        posRepo.save(pos);
    }
}
