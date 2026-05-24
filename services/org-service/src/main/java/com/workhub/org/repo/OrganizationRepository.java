package com.workhub.org.repo;

import com.workhub.org.domain.Organization;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.UUID;

public interface OrganizationRepository extends JpaRepository<Organization, UUID>, JpaSpecificationExecutor<Organization> {
    boolean existsByName(String name);
    boolean existsByNameAndIdNot(String name, UUID id);
    Page<Organization> findByNameContainingIgnoreCase(String name, Pageable pageable);
    Page<Organization> findByCityContainingIgnoreCase(String city, Pageable pageable);
}