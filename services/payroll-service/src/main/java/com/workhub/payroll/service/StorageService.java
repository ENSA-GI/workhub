package com.workhub.payroll.service;

import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;

@Service
@Slf4j
@RequiredArgsConstructor
public class StorageService {

    private final MinioClient minioClient;

    @Value("${minio.bucket-name}")
    private String bucketName;

    /**
     * Envoie un fichier (tableau d'octets) vers MinIO et retourne son nom.
     */
    public String uploadPdf(String filename, byte[] content) {
        try {
            // Créer le bucket s'il n'existe pas
            boolean found = minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucketName).build());
            if (!found) {
                minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucketName).build());
                log.info("Bucket '{}' créé avec succès.", bucketName);
            }

            // Envoyer le fichier
            ByteArrayInputStream bais = new ByteArrayInputStream(content);
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucketName)
                            .object(filename)
                            .stream(bais, content.length, -1)
                            .contentType("application/pdf")
                            .build()
            );

            log.info("Fichier '{}' stocké dans MinIO.", filename);
            return bucketName + "/" + filename;

        } catch (Exception e) {
            log.error("Erreur lors du stockage du fichier dans MinIO : {}", e.getMessage());
            throw new RuntimeException("Échec du stockage du bulletin PDF.");
        }
    }

    public byte[] downloadPdf(String objectKey) {
        try {
            // objectKey ressemble à "payslips/bulletin_xxxx.pdf"
            // On sépare le bucket du nom de l'objet si nécessaire
            String cleanKey = objectKey.contains("/") ? objectKey.substring(objectKey.indexOf("/") + 1) : objectKey;

            return minioClient.getObject(
                    io.minio.GetObjectArgs.builder()
                            .bucket(bucketName)
                            .object(cleanKey)
                            .build()
            ).readAllBytes();
        } catch (Exception e) {
            log.error("Erreur lors du téléchargement du fichier depuis MinIO : {}", e.getMessage());
            throw new RuntimeException("Impossible de récupérer le fichier PDF.");
        }
    }
}