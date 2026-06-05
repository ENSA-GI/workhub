package com.workhub.document.api;

import com.workhub.document.domain.Document;
import com.workhub.document.domain.DocumentType;
import com.workhub.document.repo.DocumentRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
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

    @PostMapping("/upload")
    public Document uploadDocument(
            @RequestParam UUID organizationId,
            @RequestParam String ownerType,
            @RequestParam UUID ownerId,
            @RequestParam String type,
            @RequestParam String fileName,
            @RequestParam(required = false) String description,
            @RequestPart MultipartFile file
    ) throws IOException {
        if (file.isEmpty()) {
            throw new RuntimeException("Le fichier ne peut pas être vide");
        }
        
        if (file.getSize() > 5 * 1024 * 1024) { // 5MB limit
            throw new RuntimeException("La taille du fichier dépasse la limite de 5MB");
        }
        
        // Save file to disk
        String uploadDir = "uploads/documents";
        Files.createDirectories(Paths.get(uploadDir));
        
        String fileId = UUID.randomUUID().toString();
        String fileExtension = getFileExtension(fileName);
        String savedFileName = fileId + "." + fileExtension;
        Path filePath = Paths.get(uploadDir, savedFileName);
        
        Files.write(filePath, file.getBytes());
        
        // Create document record
        Document d = Document.builder()
                .id(UUID.randomUUID())
                .organizationId(organizationId)
                .ownerType(ownerType)
                .ownerId(ownerId)
                .type(DocumentType.valueOf(type))
                .fileName(fileName)
                .fileUrl("/documents/download/" + fileId)
                .mimeType(file.getContentType())
                .fileSize(file.getSize())
                .description(description)
                .uploadedAt(Instant.now())
                .build();
        
        return repo.save(d);
    }

    @GetMapping("/download/{fileId}")
    public ResponseEntity<byte[]> downloadDocument(@PathVariable String fileId) throws IOException {
        // Find file in uploads directory
        Path uploadPath = Paths.get("uploads/documents").toAbsolutePath();
        List<Path> files = Files.list(uploadPath)
                .filter(p -> p.getFileName().toString().startsWith(fileId))
                .toList();
        
        if (files.isEmpty()) {
            throw new RuntimeException("Fichier non trouvé");
        }
        
        Path filePath = files.get(0);
        byte[] fileContent = Files.readAllBytes(filePath);
        String fileName = filePath.getFileName().toString();
        
        // Determine content type
        String contentType = Files.probeContentType(filePath);
        if (contentType == null) {
            contentType = "application/octet-stream";
        }
        
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .body(fileContent);
    }

    private String getFileExtension(String fileName) {
        return fileName.contains(".") ? fileName.substring(fileName.lastIndexOf(".") + 1) : "bin";
    }
}