package com.workhub.org.service;

import com.workhub.org.api.exception.DuplicateResourceException;
import com.workhub.org.api.exception.ResourceNotFoundException;
import com.workhub.org.domain.Organization;
import com.workhub.org.dto.CreateOrganizationRequest;
import com.workhub.org.domain.OrganizationSettings;
import com.workhub.org.dto.*;
import com.workhub.org.mapper.OrganizationMapper;
import com.workhub.org.repo.OrganizationRepository;
import com.workhub.org.repo.OrganizationSettingsRepository;
import com.workhub.org.repo.DepartmentRepository;
import com.workhub.org.repo.PositionRepository;
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
    private final OrganizationSettingsRepository settingsRepo;
    private final DepartmentRepository deptRepo;
    private final PositionRepository posRepo;
    private final OrganizationMapper mapper;
    private final KafkaEventPublisher eventPublisher;
    private final com.workhub.org.client.IdentityServiceClient identityServiceClient;

    public OrganizationService(OrganizationRepository orgRepo, 
                               OrganizationSettingsRepository settingsRepo,
                               DepartmentRepository deptRepo,
                               PositionRepository posRepo,
                               OrganizationMapper mapper, 
                               KafkaEventPublisher eventPublisher,
                               com.workhub.org.client.IdentityServiceClient identityServiceClient) {
        this.orgRepo = orgRepo;
        this.settingsRepo = settingsRepo;
        this.deptRepo = deptRepo;
        this.posRepo = posRepo;
        this.mapper = mapper;
        this.eventPublisher = eventPublisher;
        this.identityServiceClient = identityServiceClient;
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
                .industry(req.industry())
                .country(req.country() != null ? req.country() : "Maroc")
                .email(req.email())
                .phone(req.phone())
                .taxId(req.taxId())
                .plan(req.plan() != null ? req.plan() : "FREE")
                .maxEmployees(req.maxEmployees() != null ? req.maxEmployees() : 10)
                .active(true)
                .build();
        
        OrganizationSettings defaultSettings = OrganizationSettings.builder()
                .organization(org)
                .build();
        org.setSettings(defaultSettings);

        Organization saved = orgRepo.save(org);
        eventPublisher.publishOrganizationEvent(new OrganizationEvent(saved.getId(), saved.getName(), "CREATED"));
        return mapper.toResponse(saved);
    }

    @Transactional
    public RegisterOrganizationResponse registerOrganization(RegisterOrganizationRequest req) {
        // Create the organization
        if (orgRepo.existsByName(req.name())) {
            throw new DuplicateResourceException("Une organisation avec le nom '" + req.name() + "' existe déjà");
        }
        Organization org = Organization.builder()
                .id(UUID.randomUUID())
                .name(req.name())
                .legalName(req.legalName())
                .city(req.city())
                .industry(req.industry())
                .country(req.country() != null ? req.country() : "Maroc")
                .active(true)
                .build();
        
        OrganizationSettings defaultSettings = OrganizationSettings.builder()
                .organization(org)
                .build();
        org.setSettings(defaultSettings);

        Organization savedOrg = orgRepo.save(org);
        eventPublisher.publishOrganizationEvent(new OrganizationEvent(savedOrg.getId(), savedOrg.getName(), "CREATED"));

        // Create the admin user
        UUID adminUserId = identityServiceClient.createAdminUser(
                savedOrg.getId(),
                req.adminEmail(),
                req.adminPassword(),
                req.adminFirstName(),
                req.adminLastName(),
                req.adminPhone()
        );

        return new RegisterOrganizationResponse(
                savedOrg.getId(),
                savedOrg.getName(),
                adminUserId,
                req.adminEmail()
        );
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
        if (req.industry() != null) org.setIndustry(req.industry());
        if (req.country() != null) org.setCountry(req.country());
        if (req.email() != null) org.setEmail(req.email());
        if (req.phone() != null) org.setPhone(req.phone());
        if (req.taxId() != null) org.setTaxId(req.taxId());
        if (req.plan() != null) org.setPlan(req.plan());
        if (req.maxEmployees() != null) org.setMaxEmployees(req.maxEmployees());
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

    @Transactional
    public OrganizationSettingsResponse getOrganizationSettings(UUID orgId) {
        Organization org = getOrganizationEntityById(orgId);
        OrganizationSettings settings = settingsRepo.findById(orgId)
                .orElseGet(() -> {
                    OrganizationSettings created = OrganizationSettings.builder().organization(org).build();
                    org.setSettings(created);
                    return settingsRepo.save(created);
                });
        return new OrganizationSettingsResponse(
                orgId,
                settings.getLeavePolicyDaysPerYear(),
                settings.getLeavePolicyMaxCarryOver(),
                settings.getPayrollCnssRate(),
                settings.getPayrollAmoRate(),
                settings.getPayrollIrProgressiveScale(),
                settings.getPayrollTemplateLogoUrl(),
                settings.getPayrollTemplateLegalMentions()
        );
    }

    @Transactional
    public OrganizationSettingsResponse updateOrganizationSettings(UUID orgId, UpdateOrganizationSettingsRequest req) {
        Organization org = getOrganizationEntityById(orgId);
        OrganizationSettings settings = settingsRepo.findById(orgId)
                .orElseGet(() -> {
                    OrganizationSettings created = OrganizationSettings.builder().organization(org).build();
                    org.setSettings(created);
                    return created;
                });
        if (req.leavePolicyDaysPerYear() != null) settings.setLeavePolicyDaysPerYear(req.leavePolicyDaysPerYear());
        if (req.leavePolicyMaxCarryOver() != null) settings.setLeavePolicyMaxCarryOver(req.leavePolicyMaxCarryOver());
        if (req.payrollCnssRate() != null) settings.setPayrollCnssRate(req.payrollCnssRate());
        if (req.payrollAmoRate() != null) settings.setPayrollAmoRate(req.payrollAmoRate());
        if (req.payrollIrProgressiveScale() != null) settings.setPayrollIrProgressiveScale(req.payrollIrProgressiveScale());
        if (req.payrollTemplateLogoUrl() != null) settings.setPayrollTemplateLogoUrl(req.payrollTemplateLogoUrl());
        if (req.payrollTemplateLegalMentions() != null) settings.setPayrollTemplateLegalMentions(req.payrollTemplateLegalMentions());

        settingsRepo.save(settings);
        return getOrganizationSettings(orgId);
    }

    public OrgDashboardResponse getOrganizationDashboard(UUID orgId) {
        // verify org exists
        getOrganizationEntityById(orgId);
        long activeDepts = deptRepo.countByOrganizationIdAndActiveTrue(orgId);
        long activePos = posRepo.countByOrganizationIdAndActiveTrue(orgId);
        return new OrgDashboardResponse(activeDepts, activePos);
    }
}
