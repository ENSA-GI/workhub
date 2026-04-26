package com.workhub.recruitment.repo;

import com.workhub.recruitment.domain.Interview;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
import java.util.List;

public interface InterviewRepository extends JpaRepository<Interview, UUID> {
    List<Interview> findByApplicationId(UUID applicationId);
}
