package com.workhub.recruitment.api;

import com.workhub.recruitment.domain.*;
import com.workhub.recruitment.repo.ApplicationRepository;
import com.workhub.recruitment.repo.JobOfferRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class RecruitmentController {

    private final JobOfferRepository offerRepo;
    private final ApplicationRepository appRepo;

    public RecruitmentController(JobOfferRepository offerRepo, ApplicationRepository appRepo) {
        this.offerRepo = offerRepo;
        this.appRepo = appRepo;
    }

    public record CreateOfferRequest(
            @NotNull UUID organizationId,
            @NotBlank String title,
            @NotBlank String description,
            @NotNull ContractType contractType,
            @NotNull UUID createdBy
    ) {}

    public record CreateApplicationRequest(
            @NotNull UUID jobOfferId,
            @NotNull UUID candidateId,
            @NotBlank String cvUrl
    ) {}

    @GetMapping("/job-offers")
    public List<JobOffer> listOffers(@RequestParam UUID organizationId) {
        return offerRepo.findByOrganizationId(organizationId);
    }

    @PostMapping("/job-offers")
    public JobOffer createOffer(@RequestBody @Valid CreateOfferRequest req) {
        JobOffer o = JobOffer.builder()
                .id(UUID.randomUUID())
                .organizationId(req.organizationId())
                .title(req.title())
                .description(req.description())
                .contractType(req.contractType())
                .status(JobOfferStatus.DRAFT)
                .createdBy(req.createdBy())
                .build();
        return offerRepo.save(o);
    }

    @GetMapping("/applications")
    public List<Application> listApplications(@RequestParam UUID jobOfferId) {
        return appRepo.findByJobOfferId(jobOfferId);
    }

    @PostMapping("/applications")
    public Application apply(@RequestBody @Valid CreateApplicationRequest req) {
        Application a = Application.builder()
                .id(UUID.randomUUID())
                .jobOfferId(req.jobOfferId())
                .candidateId(req.candidateId())
                .cvUrl(req.cvUrl())
                .status(ApplicationStatus.NEW)
                .appliedAt(Instant.now())
                .build();
        return appRepo.save(a);
    }
}