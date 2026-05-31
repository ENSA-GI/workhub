package com.workhub.recruitment.api;

import com.workhub.recruitment.domain.*;
import com.workhub.recruitment.dto.ScheduleInterviewRequest;
import com.workhub.recruitment.dto.RecruitmentNotificationEvent;
import com.workhub.recruitment.repo.*;
import com.workhub.recruitment.service.KafkaProducerService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/interviews")
public class InterviewController {
    private final InterviewRepository interviewRepo;
    private final ApplicationRepository applicationRepo;
    private final CandidateRepository candidateRepo;
    private final JobOfferRepository jobOfferRepo;
    private final KafkaProducerService kafkaProducer;

    public InterviewController(InterviewRepository interviewRepo,
                               ApplicationRepository applicationRepo,
                               CandidateRepository candidateRepo,
                               JobOfferRepository jobOfferRepo,
                               KafkaProducerService kafkaProducer) {
        this.interviewRepo = interviewRepo;
        this.applicationRepo = applicationRepo;
        this.candidateRepo = candidateRepo;
        this.jobOfferRepo = jobOfferRepo;
        this.kafkaProducer = kafkaProducer;
    }

    @GetMapping("/application/{applicationId}")
    public List<Interview> getByApplication(@PathVariable UUID applicationId) {
        return interviewRepo.findByApplicationId(applicationId);
    }

    @PostMapping("/schedule")
    @ResponseStatus(HttpStatus.CREATED)
    public Interview schedule(@RequestBody ScheduleInterviewRequest req) {
        Application app = applicationRepo.findById(req.getApplicationId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application non trouvée"));

        // Update application status
        app.setStatus(ApplicationStatus.INTERVIEW_SCHEDULED);
        app.setUpdatedAt(Instant.now());
        applicationRepo.save(app);

        // Create and save Interview
        Interview interview = Interview.builder()
                .id(UUID.randomUUID())
                .applicationId(req.getApplicationId())
                .scheduledAt(req.getScheduledAt())
                .timeSlot(req.getTimeSlot())
                .status(InterviewStatus.SCHEDULED)
                .build();
        interview = interviewRepo.save(interview);

        // Fetch details for notification
        Candidate candidate = candidateRepo.findById(app.getCandidateId()).orElse(null);
        JobOffer offer = jobOfferRepo.findById(app.getJobOfferId()).orElse(null);

        if (candidate != null) {
            String dateStr = req.getScheduledAt() != null ? 
                             java.time.LocalDate.ofInstant(req.getScheduledAt(), java.time.ZoneId.of("UTC")).toString() : "";
            RecruitmentNotificationEvent event = RecruitmentNotificationEvent.builder()
                    .candidateId(candidate.getId())
                    .candidateEmail(candidate.getEmail())
                    .candidateName(candidate.getFirstName() + " " + candidate.getLastName())
                    .eventType("INTERVIEW_SCHEDULED")
                    .jobTitle(offer != null ? offer.getTitle() : "Poste")
                    .date(dateStr)
                    .timeSlot(req.getTimeSlot())
                    .build();
            kafkaProducer.sendRecruitmentNotification(event);
        }

        return interview;
    }
}
