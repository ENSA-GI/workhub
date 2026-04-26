package com.workhub.gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Configure la sécurité de l'API Gateway.
 * C'est le "gardien" principal de toute l'application.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    /**
     * Définit la chaîne de filtres de sécurité.
     * Cette méthode est le cœur de la configuration de sécurité.
     * @param http L'objet HttpSecurity pour configurer la sécurité web.
     * @return La chaîne de filtres de sécurité configurée.
     * @throws Exception Si une erreur de configuration se produit.
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // 1. Désactivation du CSRF : Standard pour les API REST/stateless car elles n'utilisent pas de sessions basées sur les cookies.
                .csrf(AbstractHttpConfigurer::disable)

                // 2. Configuration des règles d'autorisation pour chaque requête HTTP.
                .authorizeHttpRequests(authorize -> authorize

                        // 2a. Règle spécifique pour le webhook de Clerk :
                        // La route '/identity/api/users' (utilisée par le webhook pour synchroniser les utilisateurs)
                        // est accessible publiquement, SANS token. C'est nécessaire pour que Clerk puisse nous appeler.
                        // En production, cette route devrait être sécurisée par une vérification de signature de webhook.
                        .requestMatchers("/identity/api/users").permitAll()

                        // 2b. Règle générale :
                        // TOUTES les autres requêtes ('anyRequest') doivent être authentifiées.
                        // Spring Security vérifiera la présence et la validité d'un token JWT.
                        .anyRequest().authenticated()
                )

                // 3. Activation de la validation des tokens JWT :
                // Ceci configure Spring Security comme un "Resource Server" OAuth2.
                // Il va automatiquement utiliser la configuration 'jwk-set-uri' de votre fichier application.yml
                // pour valider les tokens JWT reçus dans l'en-tête "Authorization: Bearer <token>".
                .oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()));

        // Construit et retourne l'objet SecurityFilterChain final.
        return http.build();
    }
}