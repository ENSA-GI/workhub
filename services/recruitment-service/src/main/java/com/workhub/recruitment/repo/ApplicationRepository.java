package com.workhub.recruitment.repo;

import com.workhub.recruitment.domain.Application;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

public interface ApplicationRepository extends JpaRepository<Application, UUID> {
    List<Application> findByJobOfferId(UUID jobOfferId);
    List<Application> findByJobOfferIdIn(Collection<UUID> jobOfferIds);
    List<Application> findByCandidateId(UUID candidateId);
    boolean existsByJobOfferIdAndCandidateId(UUID jobOfferId, UUID candidateId);
}