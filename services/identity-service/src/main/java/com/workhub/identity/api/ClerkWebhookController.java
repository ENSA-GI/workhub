package com.workhub.identity.api;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.workhub.identity.domain.Role;
import com.workhub.identity.domain.User;
import com.workhub.identity.repo.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/webhooks")
@Slf4j
public class ClerkWebhookController {

    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;
    
    @Value("${clerk.webhook.secret}")
    private String webhookSecret;

    public ClerkWebhookController(UserRepository userRepository, ObjectMapper objectMapper) {
        this.userRepository = userRepository;
        this.objectMapper = objectMapper;
    }

    @jakarta.annotation.PostConstruct
    public void init() {
        if (webhookSecret == null || webhookSecret.equals("whsec_placeholder")) {
            log.warn("ATTENTION : CLERK_WEBHOOK_SECRET n'est pas chargée correctement (valeur par défaut utilisée)");
        } else {
            log.info("CLERK_WEBHOOK_SECRET chargée avec succès (commence par : {}...)", 
                webhookSecret.substring(0, Math.min(webhookSecret.length(), 10)));
        }
    }

    @PostMapping("/clerk")
    public ResponseEntity<String> handleClerkWebhook(
            @RequestBody String payload,
            @RequestHeader("svix-id") String svixId,
            @RequestHeader("svix-timestamp") String svixTimestamp,
            @RequestHeader("svix-signature") String svixSignature) {

        // 1. Vérification de la signature
        try {
            if (!verifySignature(payload, svixId, svixTimestamp, svixSignature)) {
                log.warn("Signature invalide pour le webhook Clerk");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid signature");
            }
        } catch (Exception e) {
            log.error("Erreur lors de la vérification de la signature", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Verification error");
        }

        // 2. Traitement de l'événement
        try {
            JsonNode node = objectMapper.readTree(payload);
            String type = node.get("type").asText();
            JsonNode data = node.get("data");

            log.info("Traitement du webhook Clerk type: {}", type);

            switch (type) {
                case "user.created":
                case "user.updated":
                    processUserUpsert(data);
                    break;
                case "user.deleted":
                    processUserDeletion(data);
                    break;
                default:
                    log.info("Type d'événement ignoré: {}", type);
            }

            return ResponseEntity.ok("Success");
        } catch (Exception e) {
            log.error("Erreur lors du traitement du webhook", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error processing webhook");
        }
    }

    private void processUserUpsert(JsonNode data) {
        try {
            String clerkId = data.get("id").asText();
            log.info("Traitement de l'utilisateur Clerk ID: {}", clerkId);

            String email = data.get("email_addresses").get(0).get("email_address").asText();
            String firstName = data.has("first_name") && !data.get("first_name").isNull() ? data.get("first_name").asText() : "";
            String lastName = data.has("last_name") && !data.get("last_name").isNull() ? data.get("last_name").asText() : "";
            String avatarUrl = data.has("image_url") && !data.get("image_url").isNull() ? data.get("image_url").asText() : "";

            userRepository.findByClerkId(clerkId)
                    .map(existing -> {
                        log.info("Mise à jour de l'utilisateur existant: {}", clerkId);
                        existing.setEmail(email);
                        existing.setFirstName(firstName);
                        existing.setLastName(lastName);
                        existing.setAvatarUrl(avatarUrl);
                        return userRepository.save(existing);
                    })
                    .orElseGet(() -> {
                        log.info("Création d'un nouvel utilisateur local pour Clerk ID: {}", clerkId);
                        User newUser = User.builder()
                                .id(UUID.randomUUID())
                                .clerkId(clerkId)
                                .email(email)
                                .firstName(firstName)
                                .lastName(lastName)
                                .avatarUrl(avatarUrl)
                                .role(Role.EMPLOYEE)
                                .active(true)
                                .emailVerified(true)
                                .build();
                        return userRepository.save(newUser);
                    });
        } catch (Exception e) {
            log.error("Détail de l'erreur dans processUserUpsert: ", e);
            throw e;
        }
    }

    private void processUserDeletion(JsonNode data) {
        String clerkId = data.get("id").asText();
        userRepository.findByClerkId(clerkId).ifPresent(user -> {
            user.setActive(false); // On désactive au lieu de supprimer pour l'audit
            userRepository.save(user);
            log.info("Utilisateur désactivé: {}", clerkId);
        });
    }

    private boolean verifySignature(String payload, String id, String timestamp, String signature) throws Exception {
        if (webhookSecret == null || webhookSecret.trim().isEmpty() || webhookSecret.equals("whsec_placeholder")) {
            log.error("ERREUR : CLERK_WEBHOOK_SECRET n'est pas configuré. Signature impossible à vérifier.");
            throw new IllegalArgumentException("Webhook secret is not configured");
        }

        // Le secret Clerk est préfixé par "whsec_", on l'enlève pour le décodage Base64
        String secret = webhookSecret.replace("whsec_", "");
        if (secret.isEmpty()) {
            log.error("ERREUR : Le secret Webhook est vide après suppression du préfixe.");
            throw new IllegalArgumentException("Empty webhook secret");
        }

        byte[] secretBytes;
        try {
            secretBytes = java.util.Base64.getDecoder().decode(secret);
        } catch (IllegalArgumentException e) {
            log.error("ERREUR : Le secret Webhook '{}' n'est pas une chaîne Base64 valide.", secret);
            throw e;
        }

        String toSign = id + "." + timestamp + "." + payload;
        
        javax.crypto.spec.SecretKeySpec signingKey = new javax.crypto.spec.SecretKeySpec(secretBytes, "HmacSHA256");
        javax.crypto.Mac mac = javax.crypto.Mac.getInstance("HmacSHA256");
        mac.init(signingKey);
        
        byte[] rawHmac = mac.doFinal(toSign.getBytes(java.nio.charset.StandardCharsets.UTF_8));
        
        // Clerk peut envoyer plusieurs signatures séparées par des espaces (v1,signature1 v1,signature2)
        String[] signatures = signature.split(" ");
        for (String sig : signatures) {
            String[] parts = sig.split(",");
            if (parts.length == 2 && parts[0].equals("v1")) {
                byte[] expected = java.util.Base64.getDecoder().decode(parts[1]);
                if (java.security.MessageDigest.isEqual(rawHmac, expected)) {
                    return true;
                }
            }
        }
        return false;
    }
}
