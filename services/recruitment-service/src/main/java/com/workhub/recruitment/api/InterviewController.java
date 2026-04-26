package com.workhub.recruitment.api;

import com.workhub.recruitment.domain.Interview;
import com.workhub.recruitment.repo.InterviewRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/interviews")
public class InterviewController {
    private final InterviewRepository interviewRepo;

    public InterviewController(InterviewRepository interviewRepo) {
        this.interviewRepo = interviewRepo;
    }

    @GetMapping("/application/{applicationId}")
    public List<Interview> getByApplication(@PathVariable UUID applicationId) {
        return interviewRepo.findByApplicationId(applicationId);
    }
}
