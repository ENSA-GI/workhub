package com.workhub.recruitment.service;

import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import io.minio.GetPresignedObjectUrlArgs;
import io.minio.http.Method;

@Service
@Slf4j
public class StorageService {

    @Value("${spring.storage.minio.endpoint}")
    private String endpoint;

    @Value("${spring.storage.minio.access-key}")
    private String accessKey;

    @Value("${spring.storage.minio.secret-key}")
    private String secretKey;

    @Value("${spring.storage.minio.bucket}")
    private String bucketName;

    private MinioClient minioClient;
    private boolean minioAvailable = false;

    // Local fallback directory for dev (when MinIO is not running)
    private static final String LOCAL_UPLOAD_DIR =
            System.getProperty("java.io.tmpdir") + File.separator + "workhub-cvs";

    @PostConstruct
    public void init() {
        try {
            minioClient = MinioClient.builder()
                    .endpoint(endpoint)
                    .credentials(accessKey, secretKey)
                    .build();

            boolean exists = minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucketName).build());
            if (!exists) {
                minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucketName).build());
                log.info("Bucket MinIO '{}' créé avec succès.", bucketName);
            }
            minioAvailable = true;
            log.info("MinIO connecté avec succès à {}", endpoint);
        } catch (Exception e) {
            log.warn("MinIO indisponible ({}). Stockage local activé: {}", e.getMessage(), LOCAL_UPLOAD_DIR);
            try {
                Files.createDirectories(Paths.get(LOCAL_UPLOAD_DIR));
            } catch (IOException ex) {
                log.error("Impossible de créer le répertoire local de stockage", ex);
            }
        }
    }

    public String upload(MultipartFile file, UUID candidateId) {
        if (minioAvailable) {
            return uploadToMinio(file, candidateId);
        } else {
            return uploadToLocal(file, candidateId);
        }
    }

    private String uploadToMinio(MultipartFile file, UUID candidateId) {
        try {
            String filename = buildFilename(file, candidateId);
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucketName)
                            .object(filename)
                            .stream(file.getInputStream(), file.getSize(), -1)
                            .contentType(file.getContentType())
                            .build()
            );
            log.info("CV uploadé sur MinIO: {}/{}", bucketName, filename);
            return "minio://" + bucketName + "/" + filename;
        } catch (Exception e) {
            log.error("Erreur lors de l'upload sur MinIO", e);
            throw new RuntimeException("Erreur lors de l'upload du CV", e);
        }
    }

    private String uploadToLocal(MultipartFile file, UUID candidateId) {
        try {
            String filename = buildFilename(file, candidateId);
            Path dest = Paths.get(LOCAL_UPLOAD_DIR, filename);
            Files.copy(file.getInputStream(), dest);
            log.info("CV sauvegardé localement (mode dev): {}", dest);
            return "local://" + dest.toString();
        } catch (Exception e) {
            log.error("Erreur lors du stockage local du CV", e);
            throw new RuntimeException("Erreur lors de l'upload du CV", e);
        }
    }

    private String buildFilename(MultipartFile file, UUID candidateId) {
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        return candidateId + "_" + System.currentTimeMillis() + extension;
    }

    public String getPresignedUrl(String objectUrl) {
        if (objectUrl != null && objectUrl.startsWith("local://")) {
            // En mode dev, retourner le chemin local
            return objectUrl.replace("local://", "file://");
        }
        try {
            String filename = objectUrl.substring(objectUrl.lastIndexOf("/") + 1);
            return minioClient.getPresignedObjectUrl(
                    GetPresignedObjectUrlArgs.builder()
                            .method(Method.GET)
                            .bucket(bucketName)
                            .object(filename)
                            .expiry(1, TimeUnit.HOURS)
                            .build()
            );
        } catch (Exception e) {
            log.error("Erreur lors de la génération de l'URL signée pour {}", objectUrl, e);
            throw new RuntimeException("Erreur lors de la récupération du fichier", e);
        }
    }
}
