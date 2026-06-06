package com.workhub.recruitment.service;

import com.workhub.recruitment.api.exception.DuplicateApplicationException;
import com.workhub.recruitment.api.exception.OfferNotFoundException;
import com.workhub.recruitment.domain.*;
import com.workhub.recruitment.dto.ApplicationRequest;
import com.workhub.recruitment.dto.ApplicationResponse;
import com.workhub.recruitment.dto.CvAnalysisRequest;
import com.workhub.recruitment.dto.JobOfferPublicResponse;
import com.workhub.recruitment.repo.ApplicationRepository;
import com.workhub.recruitment.repo.CandidateRepository;
import com.workhub.recruitment.repo.JobOfferRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class ApplicationService {

    private final ApplicationRepository applicationRepo;
    private final JobOfferRepository jobOfferRepo;
    private final CandidateRepository candidateRepo;
    private final KafkaProducerService kafkaProducer;
    private final StorageService storageService;

    public ApplicationResponse apply(ApplicationRequest req, MultipartFile cvFile) {
        JobOffer offer = jobOfferRepo.findById(req.getJobOfferId())
                .filter(o -> o.getStatus() == JobOfferStatus.PUBLISHED)
                .orElseThrow(() -> new OfferNotFoundException(req.getJobOfferId()));

        Candidate candidate = candidateRepo.findByEmail(req.getEmail())
                .map(c -> {
                    if (req.getUserId() != null && !req.getUserId().equals(c.getUserId())) {
                        c.setUserId(req.getUserId());
                        return candidateRepo.save(c);
                    }
                    return c;
                })
                .orElseGet(() -> {
                    Candidate newCandidate = Candidate.builder()
                            .id(UUID.randomUUID())
                            .userId(req.getUserId() != null ? req.getUserId() : UUID.randomUUID())
                            .firstName(req.getFirstName())
                            .lastName(req.getLastName())
                            .email(req.getEmail())
                            .phone(req.getPhone())
                            .linkedinUrl(req.getLinkedinUrl())
                            .build();
                    return candidateRepo.save(newCandidate);
                });

        if (applicationRepo.existsByJobOfferIdAndCandidateId(offer.getId(), candidate.getId())) {
            throw new DuplicateApplicationException();
        }

        String cvUrl = storageService.upload(cvFile, candidate.getId());

        Application app = Application.builder()
                .id(UUID.randomUUID())
                .jobOfferId(offer.getId())
                .candidateId(candidate.getId())
                .cvUrl(cvUrl)
                .coverLetterUrl(req.getCoverLetter())
                .status(ApplicationStatus.NEW)
                .appliedAt(Instant.now())
                .build();
        app = applicationRepo.save(app);

        kafkaProducer.sendCvAnalysisRequest(CvAnalysisRequest.builder()
                .applicationId(app.getId())
                .jobTitle(offer.getTitle())
                .jobDescription(offer.getDescription())
                .jobRequirements(offer.getRequiredSkills())
                .cvUrl(cvUrl)
                .organizationId(offer.getOrganizationId())
                .build());

        log.info("Nouvelle candidature {} créée pour l'offre {}", app.getId(), offer.getId());

        return mapToResponse(app, offer, candidate);
    }

    public List<ApplicationResponse> getByCandidate(UUID candidateId) {
        return applicationRepo.findByCandidateId(candidateId).stream()
                .map(app -> {
                    JobOffer offer = jobOfferRepo.findById(app.getJobOfferId()).orElse(null);
                    return mapToResponse(app, offer, null);
                })
                .collect(Collectors.toList());
    }

    public List<ApplicationResponse> getByCandidateEmail(String email) {
        return candidateRepo.findByEmail(email)
                .map(candidate -> applicationRepo.findByCandidateId(candidate.getId()).stream()
                        .map(app -> {
                            JobOffer offer = jobOfferRepo.findById(app.getJobOfferId()).orElse(null);
                            return mapToResponse(app, offer, candidate);
                        })
                        .collect(Collectors.toList()))
                .orElse(java.util.Collections.emptyList());
    }

    public JobOfferPublicResponse getJobOffer(UUID id) {
        JobOffer offer = jobOfferRepo.findById(id)
                .orElseThrow(() -> new OfferNotFoundException(id));
        
        return JobOfferPublicResponse.builder()
                .id(offer.getId())
                .title(offer.getTitle())
                .description(offer.getDescription())
                .contractType(offer.getContractType())
                .salaryRange(offer.getSalaryRange())
                .location(offer.getLocation())
                .minExperience(offer.getMinExperience())
                .publishedAt(offer.getPublishedAt())
                .deadline(offer.getDeadline())
                .status(offer.getStatus())
                .applications(applicationRepo.findByJobOfferId(id).stream().map(app -> {
                        Candidate c = candidateRepo.findById(app.getCandidateId()).orElse(null);
                        return mapToResponse(app, offer, c);
                    }).toList())
                .build();
    }

    public List<JobOfferPublicResponse> getAllPublicOffers() {
        return jobOfferRepo.findByStatus(JobOfferStatus.PUBLISHED).stream()
                .map(offer -> getJobOffer(offer.getId()))
                .collect(Collectors.toList());
    }

    public void deleteJobOffer(UUID id) {
        List<Application> apps = applicationRepo.findByJobOfferId(id);
        applicationRepo.deleteAll(apps);
        jobOfferRepo.deleteById(id);
    }

    public ApplicationResponse updateApplicationStatus(UUID id, ApplicationStatus status) {
        Application app = applicationRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Application non trouvée"));
        app.setStatus(status);
        app.setUpdatedAt(Instant.now());
        app = applicationRepo.save(app);

        JobOffer offer = jobOfferRepo.findById(app.getJobOfferId()).orElse(null);
        Candidate candidate = candidateRepo.findById(app.getCandidateId()).orElse(null);

        if (candidate != null && (status == ApplicationStatus.HIRED || status == ApplicationStatus.REJECTED)) {
            com.workhub.recruitment.dto.RecruitmentNotificationEvent event = com.workhub.recruitment.dto.RecruitmentNotificationEvent.builder()
                    .candidateId(candidate.getId())
                    .userId(candidate.getUserId())
                    .candidateEmail(candidate.getEmail())
                    .candidateName(candidate.getFirstName() + " " + candidate.getLastName())
                    .eventType(status.name())
                    .jobTitle(offer != null ? offer.getTitle() : "Poste")
                    .build();
            kafkaProducer.sendRecruitmentNotification(event);
        }

        return mapToResponse(app, offer, candidate);
    }

    public void syncCandidateUserId(String email, UUID userId) {
        candidateRepo.findByEmail(email).ifPresent(candidate -> {
            if (!userId.equals(candidate.getUserId())) {
                candidate.setUserId(userId);
                candidateRepo.save(candidate);
                log.info("Synchronized userId {} for candidate email {}", userId, email);
            }
        });
    }

    public String getPresignedCvUrl(UUID applicationId) {
        Application app = applicationRepo.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application non trouvée"));
        if (app.getCvUrl() != null && app.getCvUrl().startsWith("minio://")) {
            return storageService.getPresignedUrl(app.getCvUrl());
        }
        return app.getCvUrl();
    }

    public Candidate getCandidateByEmail(String email) {
        return candidateRepo.findByEmail(email).orElse(null);
    }

    private ApplicationResponse mapToResponse(Application app, JobOffer offer, Candidate candidate) {
        return ApplicationResponse.builder()
                .id(app.getId())
                .jobOfferId(app.getJobOfferId())
                .jobTitle(offer != null ? offer.getTitle() : "Offre inconnue")
                .candidateId(app.getCandidateId())
                .candidateFullName(candidate != null ? candidate.getFirstName() + " " + candidate.getLastName() : "Candidat inconnu")
                .cvUrl(app.getCvUrl())
                .coverLetterUrl(app.getCoverLetterUrl())
                .status(app.getStatus())
                .aiScore(app.getAiScore())
                .appliedAt(app.getAppliedAt())
                .build();
    }
}
