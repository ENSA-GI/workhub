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
                .orElseGet(() -> {
                    Candidate newCandidate = Candidate.builder()
                            .id(UUID.randomUUID())
                            .userId(UUID.randomUUID())
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
