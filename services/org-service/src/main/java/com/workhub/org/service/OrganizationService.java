package com.workhub.org.service;

import com.workhub.org.api.exception.DuplicateResourceException;
import com.workhub.org.api.exception.ResourceNotFoundException;
import com.workhub.org.domain.Organization;
import com.workhub.org.dto.CreateOrganizationRequest;
import com.workhub.org.dto.OrganizationResponse;
import com.workhub.org.dto.UpdateOrganizationRequest;
import com.workhub.org.mapper.OrganizationMapper;
import com.workhub.org.repo.OrganizationRepository;
import com.workhub.org.event.OrganizationEvent;
import com.workhub.org.messaging.KafkaEventPublisher;
import com.workhub.org.repo.specification.OrganizationSpecifications;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class OrganizationService {

    private final OrganizationRepository orgRepo;
    private final OrganizationMapper mapper;
    private final KafkaEventPublisher eventPublisher;

    public OrganizationService(OrganizationRepository orgRepo, OrganizationMapper mapper, KafkaEventPublisher eventPublisher) {
        this.orgRepo = orgRepo;
        this.mapper = mapper;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public OrganizationResponse createOrganization(CreateOrganizationRequest req) {
        if (orgRepo.existsByName(req.name())) {
            throw new DuplicateResourceException("Une organisation avec le nom '" + req.name() + "' existe déjà");
        }
        Organization org = Organization.builder()
                .id(UUID.randomUUID())
                .name(req.name())
                .legalName(req.legalName())
                .city(req.city())
                .active(true)
                .build();
        Organization saved = orgRepo.save(org);
        eventPublisher.publishOrganizationEvent(new OrganizationEvent(saved.getId(), saved.getName(), "CREATED"));
        return mapper.toResponse(saved);
    }

    public Page<OrganizationResponse> getAllOrganizations(String name, String city, Boolean active, Pageable pageable) {
        Specification<Organization> spec = Specification.where(OrganizationSpecifications.hasName(name))
                .and(OrganizationSpecifications.hasCity(city))
                .and(OrganizationSpecifications.isActive(active));
        return orgRepo.findAll(spec, pageable).map(mapper::toResponse);
    }

    public OrganizationResponse getOrganizationById(UUID id) {
        return mapper.toResponse(getOrganizationEntityById(id));
    }

    public Organization getOrganizationEntityById(UUID id) {
        return orgRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found with id: " + id));
    }

    @Transactional
    public OrganizationResponse updateOrganization(UUID id, UpdateOrganizationRequest req) {
        if (orgRepo.existsByNameAndIdNot(req.name(), id)) {
            throw new DuplicateResourceException("Une organisation avec le nom '" + req.name() + "' existe déjà");
        }
        Organization org = getOrganizationEntityById(id);
        org.setName(req.name());
        org.setLegalName(req.legalName());
        org.setCity(req.city());
        if (req.active() != null) {
            org.setActive(req.active());
        }
        Organization saved = orgRepo.save(org);
        eventPublisher.publishOrganizationEvent(new OrganizationEvent(saved.getId(), saved.getName(), "UPDATED"));
        return mapper.toResponse(saved);
    }

    @Transactional
    public void deleteOrganization(UUID id) {
        Organization org = getOrganizationEntityById(id);
        org.setActive(false);
        Organization saved = orgRepo.save(org);
        eventPublisher.publishOrganizationEvent(new OrganizationEvent(saved.getId(), saved.getName(), "DELETED"));
    }
}
