package com.workhub.notification.service;

import io.minio.GetObjectArgs;
import io.minio.MinioClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class PayslipStorageService {

    private final MinioClient minioClient;

    @Value("${minio.bucket-name}")
    private String bucketName;

    public byte[] download(String objectKey) {
        if (objectKey == null || objectKey.isBlank()) {
            return new byte[0];
        }

        try {
            String cleanKey = objectKey.contains("/")
                    ? objectKey.substring(objectKey.indexOf("/") + 1)
                    : objectKey;

            return minioClient.getObject(
                    GetObjectArgs.builder()
                            .bucket(bucketName)
                            .object(cleanKey)
                            .build()
            ).readAllBytes();
        } catch (Exception e) {
            log.warn("Unable to download payslip attachment from MinIO key {}: {}", objectKey, e.getMessage());
            return new byte[0];
        }
    }
}
