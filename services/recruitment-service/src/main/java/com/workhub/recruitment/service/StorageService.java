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

import java.util.UUID;

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
        } catch (Exception e) {
            log.error("Erreur lors de l'initialisation de MinIO", e);
        }
    }

    public String upload(MultipartFile file, UUID candidateId) {
        try {
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            
            String filename = candidateId + "_" + System.currentTimeMillis() + extension;

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
}
