package com.workhub.document.repo;

import com.workhub.document.domain.Document;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface DocumentRepository extends JpaRepository<Document, UUID> {
    List<Document> findByOrganizationId(UUID organizationId);
    List<Document> findByOwnerTypeAndOwnerId(String ownerType, UUID ownerId);
}