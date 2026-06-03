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
        return applicationService.getAllPublicOffers();
    }

    @PostMapping("/job-offers")
    @ResponseStatus(HttpStatus.CREATED)
    public JobOffer createJobOffer(@RequestBody JobOffer offer) {
        if (offer.getId() == null) offer.setId(java.util.UUID.randomUUID());
        if (offer.getStatus() == null) offer.setStatus(JobOfferStatus.PUBLISHED);
        offer.setCreatedAt(java.time.Instant.now());
        return offerRepo.save(offer);
    }

    @GetMapping("/job-offers/{id}")
    public JobOfferPublicResponse getOfferById(@PathVariable UUID id) {
        return applicationService.getJobOffer(id);
    }

    @PostMapping(value = "/applications/apply", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public ApplicationResponse applyToOffer(
            @RequestPart("data") String dataJson,
            @RequestPart("cv") MultipartFile cvFile) {
        ApplicationRequest req;
        try {
            req = objectMapper.readValue(dataJson, ApplicationRequest.class);
        } catch (com.fasterxml.jackson.core.JsonProcessingException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Format JSON invalide dans la partie 'data'", e);
        }
        return applicationService.apply(req, cvFile);
    }

    @GetMapping("/applications/my")
    public List<ApplicationResponse> myApplications(@RequestParam UUID candidateId) {
        return applicationService.getByCandidate(candidateId);
    }

    @GetMapping("/applications/candidate/{email}")
    public List<ApplicationResponse> getApplicationsByEmail(@PathVariable String email) {
        return applicationService.getByCandidateEmail(email);
    }

    @GetMapping("/candidates/by-email")
    public com.workhub.recruitment.domain.Candidate getCandidateByEmail(@RequestParam String email) {
        com.workhub.recruitment.domain.Candidate candidate = applicationService.getCandidateByEmail(email);
        if (candidate == null) {
            throw new org.springframework.web.server.ResponseStatusException(HttpStatus.NOT_FOUND, "Candidat non trouvé");
        }
        return candidate;
    }

    @DeleteMapping("/job-offers/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteJobOffer(@PathVariable UUID id) {
        applicationService.deleteJobOffer(id);
    }

    @PatchMapping("/applications/{id}/status")
    public ApplicationResponse updateApplicationStatus(
            @PathVariable UUID id,
            @RequestParam String status) {
        com.workhub.recruitment.domain.ApplicationStatus s =
                com.workhub.recruitment.domain.ApplicationStatus.valueOf(status);
        return applicationService.updateApplicationStatus(id, s);
    }

    @GetMapping("/applications/{id}/cv")
    public org.springframework.http.ResponseEntity<String> viewCv(@PathVariable UUID id) {
        String presignedUrl = applicationService.getPresignedCvUrl(id);
        return org.springframework.http.ResponseEntity.ok(presignedUrl);
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
                .applications(java.util.Collections.emptyList())
                .build();
    }
}