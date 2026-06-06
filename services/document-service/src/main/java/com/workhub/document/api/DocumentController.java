package com.workhub.document.api;

import com.workhub.document.domain.Document;
import com.workhub.document.domain.DocumentType;
import com.workhub.document.repo.DocumentRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    private final DocumentRepository repo;

    public DocumentController(DocumentRepository repo) {
        this.repo = repo;
    }

    public record CreateDocumentRequest(
            @NotNull UUID organizationId,
            @NotBlank String ownerType,
            @NotNull UUID ownerId,
            @NotNull DocumentType type,
            @NotBlank String fileName,
            @NotBlank String fileUrl,
            String mimeType,
            Long fileSize,
            String description,
            UUID uploadedBy
    ) {}

    @GetMapping
    public List<Document> list(
            @RequestParam(required = false) UUID organizationId,
            @RequestParam(required = false) String ownerType,
            @RequestParam(required = false) UUID ownerId
    ) {
        if (ownerType != null && ownerId != null) {
            return repo.findByOwnerTypeAndOwnerId(ownerType, ownerId);
        }
        if (organizationId != null) {
            return repo.findByOrganizationId(organizationId);
        }
        return repo.findAll();
    }

    @PostMapping
    public Document create(@RequestBody @Valid CreateDocumentRequest req) {
        Document d = Document.builder()
                .id(UUID.randomUUID())
                .organizationId(req.organizationId())
                .ownerType(req.ownerType())
                .ownerId(req.ownerId())
                .type(req.type())
                .fileName(req.fileName())
                .fileUrl(req.fileUrl())
                .mimeType(req.mimeType())
                .fileSize(req.fileSize())
                .description(req.description())
                .uploadedBy(req.uploadedBy())
                .uploadedAt(Instant.now())
                .build();
        return repo.save(d);
    }
}