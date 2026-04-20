package com.workhub.recruitment.repo;

import com.workhub.recruitment.domain.JobOffer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface JobOfferRepository extends JpaRepository<JobOffer, UUID> {
    List<JobOffer> findByOrganizationId(UUID organizationId);
}