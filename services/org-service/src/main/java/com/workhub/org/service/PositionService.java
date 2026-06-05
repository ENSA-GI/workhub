package com.workhub.org.service;

import com.workhub.org.api.exception.DuplicateResourceException;
import com.workhub.org.api.exception.ResourceNotFoundException;
import com.workhub.org.domain.Position;
import com.workhub.org.domain.ProfessionalCategory;
import com.workhub.org.dto.CreatePositionRequest;
import com.workhub.org.dto.PositionResponse;
import com.workhub.org.dto.UpdatePositionRequest;
import com.workhub.org.event.PositionEvent;
import com.workhub.org.mapper.PositionMapper;
import com.workhub.org.messaging.KafkaEventPublisher;
import com.workhub.org.repo.PositionRepository;
import com.workhub.org.repo.specification.PositionSpecifications;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class PositionService {

    private final PositionRepository posRepo;
    private final OrganizationService orgService;
    private final PositionMapper mapper;
    private final KafkaEventPublisher eventPublisher;

    public PositionService(PositionRepository posRepo,
                           OrganizationService orgService,
                           PositionMapper mapper,
                           KafkaEventPublisher eventPublisher) {
        this.posRepo = posRepo;
        this.orgService = orgService;
        this.mapper = mapper;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public PositionResponse createPosition(CreatePositionRequest req) {
        orgService.getOrganizationById(req.organizationId());
        Position existing = posRepo.findByOrganizationIdAndTitle(req.organizationId(), req.title()).orElse(null);
        if (existing != null && Boolean.TRUE.equals(existing.getActive())) {
            throw new DuplicateResourceException(
                    "Un poste '" + req.title() + "' existe deja dans cette organisation");
        }
        if (existing != null) {
            existing.setDescription(req.description());
            existing.setCategory(req.category());
            existing.setActive(true);
            Position saved = posRepo.save(existing);
            eventPublisher.publishPositionEvent(new PositionEvent(
                    saved.getId(), saved.getOrganizationId(), saved.getTitle(), "UPDATED"));
            return mapper.toResponse(saved);
        }

        Position p = Position.builder()
                .id(UUID.randomUUID())
                .organizationId(req.organizationId())
                .title(req.title())
                .description(req.description())
                .category(req.category())
                .active(true)
                .build();
        Position saved = posRepo.save(p);
        eventPublisher.publishPositionEvent(new PositionEvent(
                saved.getId(), saved.getOrganizationId(), saved.getTitle(), "CREATED"));
        return mapper.toResponse(saved);
    }

    public Page<PositionResponse> getPositionsByOrganizationId(UUID orgId,
                                                               String title,
                                                               ProfessionalCategory category,
                                                               Boolean active,
                                                               Pageable pageable) {
        Specification<Position> spec = Specification.where(PositionSpecifications.hasOrganizationId(orgId))
                .and(PositionSpecifications.hasTitle(title))
                .and(PositionSpecifications.hasCategory(category))
                .and(PositionSpecifications.isActive(active));
        return posRepo.findAll(spec, pageable).map(mapper::toResponse);
    }

    public PositionResponse getPositionById(UUID id) {
        return mapper.toResponse(getPositionEntityById(id));
    }

    public Position getPositionEntityById(UUID id) {
        return posRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Position not found with id: " + id));
    }

    @Transactional
    public PositionResponse updatePosition(UUID id, UpdatePositionRequest req) {
        Position pos = getPositionEntityById(id);
        if (posRepo.existsByOrganizationIdAndTitleAndIdNot(pos.getOrganizationId(), req.title(), id)) {
            throw new DuplicateResourceException(
                    "Un poste '" + req.title() + "' existe deja dans cette organisation");
        }
        pos.setTitle(req.title());
        pos.setDescription(req.description());
        pos.setCategory(req.category());
        if (req.active() != null) {
            pos.setActive(req.active());
        }
        Position saved = posRepo.save(pos);
        eventPublisher.publishPositionEvent(new PositionEvent(
                saved.getId(), saved.getOrganizationId(), saved.getTitle(), "UPDATED"));
        return mapper.toResponse(saved);
    }

    @Transactional
    public void deletePosition(UUID id) {
        Position pos = getPositionEntityById(id);
        pos.setActive(false);
        Position saved = posRepo.save(pos);
        eventPublisher.publishPositionEvent(new PositionEvent(
                saved.getId(), saved.getOrganizationId(), saved.getTitle(), "DELETED"));
    }
}
