package com.workhub.org.service;

import com.workhub.org.api.exception.ResourceNotFoundException;
import com.workhub.org.domain.Organization;
import com.workhub.org.dto.CreateOrganizationRequest;
import com.workhub.org.dto.UpdateOrganizationRequest;
import com.workhub.org.repo.OrganizationRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class OrganizationService {

    private final OrganizationRepository orgRepo;

    public OrganizationService(OrganizationRepository orgRepo) {
        this.orgRepo = orgRepo;
    }

    @Transactional
    public Organization createOrganization(CreateOrganizationRequest req) {
        Organization org = Organization.builder()
                .id(UUID.randomUUID())
                .name(req.name())
                .legalName(req.legalName())
                .city(req.city())
                .active(true)
                .build();
        return orgRepo.save(org);
    }

    public Page<Organization> getAllOrganizations(Pageable pageable) {
        return orgRepo.findAll(pageable);
    }

    public Organization getOrganizationById(UUID id) {
        return orgRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found with id: " + id));
    }

    @Transactional
    public Organization updateOrganization(UUID id, UpdateOrganizationRequest req) {
        Organization org = getOrganizationById(id);
        org.setName(req.name());
        org.setLegalName(req.legalName());
        org.setCity(req.city());
        if (req.active() != null) {
            org.setActive(req.active());
        }
        return orgRepo.save(org);
    }

    @Transactional
    public void deleteOrganization(UUID id) {
        Organization org = getOrganizationById(id);
        org.setActive(false);
        orgRepo.save(org);
    }
}
