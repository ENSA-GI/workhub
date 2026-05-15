package com.workhub.recruitment.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.workhub.recruitment.domain.JobOffer;
import com.workhub.recruitment.domain.JobOfferStatus;
import com.workhub.recruitment.dto.*;
import com.workhub.recruitment.repo.JobOfferRepository;
import com.workhub.recruitment.service.ApplicationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class RecruitmentController {

    private final JobOfferRepository offerRepo;
    private final ApplicationService applicationService;
    private final ObjectMapper objectMapper;

    public RecruitmentController(JobOfferRepository offerRepo, ApplicationService applicationService, ObjectMapper objectMapper) {
        this.offerRepo = offerRepo;
        this.applicationService = applicationService;
        this.objectMapper = objectMapper;
    }

    @GetMapping("/job-offers/public")
    public List<JobOfferPublicResponse> listPublicOffers() {
        return offerRepo.findByStatus(JobOfferStatus.PUBLISHED).stream()
                .map(this::mapToPublicDto)
                .collect(Collectors.toList());
    }

    @GetMapping("/job-offers/{id}")
    public JobOfferPublicResponse getOfferById(@PathVariable UUID id) {
        return offerRepo.findById(id)
                .map(this::mapToPublicDto)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Offre introuvable"));
    }

    @PostMapping(value = "/applications/apply", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public ApplicationResponse applyToOffer(
            @RequestPart("data") @Valid ApplicationRequest req,
            @RequestPart("cv") MultipartFile cvFile) {
        return applicationService.apply(req, cvFile);
    }

    @GetMapping("/applications/my")
    public List<ApplicationResponse> myApplications(@RequestParam UUID candidateId) {
        return applicationService.getByCandidate(candidateId);
    }

    private JobOfferPublicResponse mapToPublicDto(JobOffer o) {
        return JobOfferPublicResponse.builder()
                .id(o.getId())
                .title(o.getTitle())
                .description(o.getDescription())
                .contractType(o.getContractType())
                .salaryRange(o.getSalaryRange())
                .location(o.getLocation())
                .minExperience(o.getMinExperience())
                .publishedAt(o.getPublishedAt())
                .deadline(o.getDeadline())
                .status(o.getStatus())
                .build();
    }
}