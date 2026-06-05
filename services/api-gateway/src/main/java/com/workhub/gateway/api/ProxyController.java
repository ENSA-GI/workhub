package com.workhub.gateway.api;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StreamUtils;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClient;

import java.io.IOException;
import java.util.Enumeration;

/**
 * Contrôleur qui agit comme un proxy inverse simple.
 * Il capture toutes les requêtes et les transfère au microservice approprié.
 * C'est le "routier" qui guide le trafic une fois que le "gardien" (SecurityConfig) a validé l'accès.
 */
@RestController
public class ProxyController {

    private final RestClient restClient = RestClient.create();

    // Injection des URLs des services depuis application.yml
    @Value("${workhub.gateway.org}") private String orgBase;
    @Value("${workhub.gateway.employee}") private String employeeBase;
    @Value("${workhub.gateway.identity}") private String identityBase;
    @Value("${workhub.gateway.leave}") private String leaveBase;
    @Value("${workhub.gateway.notifications}") private String notifBase;
    @Value("${workhub.gateway.payroll}") private String payrollBase;
    @Value("${workhub.gateway.recruitment}") private String recruitmentBase;
    @Value("${workhub.gateway.documents}") private String documentsBase;
    @Value("${workhub.gateway.audit}") private String auditBase;

    // --- Mappages des routes vers les méthodes de forwarding ---
    @RequestMapping("/org/**")
    public ResponseEntity<byte[]> org(HttpServletRequest req) throws IOException {
        return forward(orgBase, "/org", req, true); // Ajoute le préfixe /api
    }

    @RequestMapping("/employee/**")
    public ResponseEntity<byte[]> employee(HttpServletRequest req) throws IOException {
        return forward(employeeBase, "/employee", req, true); // Ajoute le préfixe /api
    }

    /**
     * Règle spéciale pour 'identity-service'.
     * Le UserController de ce service a déjà '/api' dans son RequestMapping,
     * donc nous ne devons PAS l'ajouter ici pour éviter les doublons.
     */
    @RequestMapping("/identity/**")
    public ResponseEntity<byte[]> identity(HttpServletRequest req) throws IOException {
        return forward(identityBase, "/identity", req, false); // N'ajoute PAS le préfixe /api
    }

    @RequestMapping("/leave/**")
    public ResponseEntity<byte[]> leave(HttpServletRequest req) throws IOException {
        return forward(leaveBase, "/leave", req, true, true); // Ajoute le préfixe /api
    }

    @RequestMapping("/notifications/**")
    public ResponseEntity<byte[]> notifications(HttpServletRequest req) throws IOException {
        return forward(notifBase, "/notifications", req, true, true); // Ajoute le préfixe /api
    }

    @RequestMapping("/payroll/**")
    public ResponseEntity<byte[]> payroll(HttpServletRequest req) throws IOException {
        return forward(payrollBase, "/payroll", req, true); // Ajoute le préfixe /api
    }

    @RequestMapping("/recruitment/**")
    public ResponseEntity<byte[]> recruitment(HttpServletRequest req) throws IOException {
        return forward(recruitmentBase, "/recruitment", req, true); // Ajoute le préfixe /api
    }

    @RequestMapping("/documents/**")
    public ResponseEntity<byte[]> documents(HttpServletRequest req) throws IOException {
        return forward(documentsBase, "/documents", req, true); // Ajoute le préfixe /api
    }

    @RequestMapping("/audit/**")
    public ResponseEntity<byte[]> audit(HttpServletRequest req) throws IOException {
        return forward(auditBase, "/audit", req, true); // Ajoute le préfixe /api
    }

    /**
     * Méthode centrale qui effectue le transfert de la requête.
     *
     * @param baseUrl L'URL de base du microservice cible (ex: http://localhost:8081).
     * @param prefixToRemove Le préfixe de la route à supprimer de l'URI (ex: /org).
     * @param req La requête HTTP entrante.
     * @param addApiPrefix Si true, le préfixe '/api' sera ajouté au chemin de la cible.
     * @return La réponse du microservice cible.
     * @throws IOException Si une erreur de lecture de la requête se produit.
     */
    private ResponseEntity<byte[]> forward(String baseUrl, String prefixToRemove, HttpServletRequest req, boolean addApiPrefix) throws IOException {
        return forward(baseUrl, prefixToRemove, req, addApiPrefix, false);
    }

    private ResponseEntity<byte[]> forward(String baseUrl, String prefixToRemove, HttpServletRequest req, boolean addApiPrefix, boolean stripAuthorization) throws IOException {
        // 1. Construit l'URL cible
        String incomingUri = req.getRequestURI();
        String subPath = incomingUri.substring(prefixToRemove.length());
        if (subPath.isEmpty()) subPath = "/";

        String apiPrefix = addApiPrefix ? "/api" : "";
        String query = req.getQueryString();
        String targetUrl = baseUrl + apiPrefix + subPath + (query != null ? "?" + query : "");

        // 2. Copie les en-têtes de la requête entrante
        HttpHeaders headers = new HttpHeaders();
        Enumeration<String> headerNames = req.getHeaderNames();
        while (headerNames.hasMoreElements()) {
            String headerName = headerNames.nextElement();
            // L'en-tête Host doit être celui de la cible, pas de la gateway, donc on l'ignore.
            if (shouldForwardHeader(headerName)
                    && !(stripAuthorization && headerName.equalsIgnoreCase("authorization"))) {
                headers.add(headerName, req.getHeader(headerName));
            }
        }

        // 3. Copie le corps de la requête entrante
        byte[] body = StreamUtils.copyToByteArray(req.getInputStream());
        HttpMethod method = HttpMethod.valueOf(req.getMethod());

        // 4. Exécute la requête vers le microservice cible avec RestClient
        RestClient.RequestBodySpec spec = restClient.method(method)
                .uri(targetUrl)
                .headers(h -> h.addAll(headers));

        // 5. Retourne aussi les réponses 4xx/5xx du microservice au front, sans les transformer.
        RestClient.RequestHeadersSpec<?> requestSpec = body.length > 0 ? spec.body(body) : spec;
        return requestSpec.exchange((request, response) -> {
            MediaType contentType = response.getHeaders().getContentType();
            ResponseEntity.BodyBuilder builder = ResponseEntity.status(response.getStatusCode());
            if (contentType != null) {
                builder.contentType(contentType);
            }
            return builder.body(StreamUtils.copyToByteArray(response.getBody()));
        });
    }

    private boolean shouldForwardHeader(String headerName) {
        return !headerName.equalsIgnoreCase("host")
                && !headerName.equalsIgnoreCase("origin")
                && !headerName.equalsIgnoreCase("access-control-request-method")
                && !headerName.equalsIgnoreCase("access-control-request-headers");
    }
}
