package com.workhub.identity.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import jakarta.servlet.http.HttpServletRequest;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    private static final HttpClient DEBUG_HTTP = HttpClient.newHttpClient();


    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(
            "http://localhost:3000",
            "http://localhost:5173",
            "http://localhost:80",
            "http://frontend:80",
            "http://localhost:8080",
            "http://api-gateway:8080"
        ));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        // #region debug-point A:cors-request
        return request -> {
            if (request != null) {
                reportDebug(request, configuration);
            }
            return configuration;
        };
        // #endregion
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, CorsConfigurationSource corsConfigurationSource) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/actuator/**").permitAll()
                        .requestMatchers("/internal/**").permitAll()
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults())); 

        return http.build();
    }

    // #region debug-point A:cors-report
    private static void reportDebug(HttpServletRequest request, CorsConfiguration configuration) {
        try {
            String origin = request.getHeader("Origin");
            boolean isAuthPath = request.getRequestURI() != null && request.getRequestURI().startsWith("/api/auth/");
            boolean isCorsRelevant = origin != null || "OPTIONS".equalsIgnoreCase(request.getMethod());
            if (!isAuthPath || !isCorsRelevant) {
                return;
            }

            boolean originAllowed = origin != null
                    && configuration.getAllowedOrigins() != null
                    && configuration.getAllowedOrigins().contains(origin);
            String body = String.format(
                    "{\"sessionId\":\"login-empty-response\",\"runId\":\"post-fix\",\"hypothesisId\":\"A\",\"location\":\"SecurityConfig.java\",\"msg\":\"[DEBUG] CORS request observed\",\"data\":{\"method\":\"%s\",\"path\":\"%s\",\"origin\":%s,\"originAllowed\":%s}}",
                    escape(request.getMethod()),
                    escape(request.getRequestURI()),
                    origin == null ? "null" : "\"" + escape(origin) + "\"",
                    originAllowed);

            HttpRequest debugRequest = HttpRequest.newBuilder(URI.create("http://host.docker.internal:7777/event"))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(body, StandardCharsets.UTF_8))
                    .build();
            DEBUG_HTTP.sendAsync(debugRequest, HttpResponse.BodyHandlers.discarding());
        } catch (Exception ignored) {
        }
    }

    private static String escape(String value) {
        return value == null ? "" : value.replace("\\", "\\\\").replace("\"", "\\\"");
    }
    // #endregion
}
