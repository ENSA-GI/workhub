package com.workhub.notification.service;

import lombok.Getter;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Service
public class EmailTemplateService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd MMMM yyyy", new Locale("fr", "FR"));

    /**
     * Crée un email HTML pour l'approbation d'une demande de congé
     */
    public String getApprovedLeaveEmailTemplate(
            String employeeName,
            LocalDate startDate,
            LocalDate endDate,
            String leaveType,
            String approverName,
            String reviewComment) {

        return buildHtmlEmail(
                "✓ Demande de congé approuvée",
                generateApprovedContent(employeeName, startDate, endDate, leaveType, approverName, reviewComment)
        );
    }

    /**
     * Crée un email HTML pour le refus d'une demande de congé
     */
    public String getRejectedLeaveEmailTemplate(
            String employeeName,
            LocalDate startDate,
            LocalDate endDate,
            String leaveType,
            String approverName,
            String reviewComment) {

        return buildHtmlEmail(
                "✗ Demande de congé refusée",
                generateRejectedContent(employeeName, startDate, endDate, leaveType, approverName, reviewComment)
        );
    }

    private String generateApprovedContent(
            String employeeName,
            LocalDate startDate,
            LocalDate endDate,
            String leaveType,
            String approverName,
            String reviewComment) {

        String formattedStartDate = startDate.format(DATE_FORMATTER);
        String formattedEndDate = endDate.format(DATE_FORMATTER);

        StringBuilder content = new StringBuilder();
        content.append("<div style='color: #333; line-height: 1.6;'>\n");
        content.append("  <p style='font-size: 16px; margin-bottom: 20px;'>\n");
        content.append("    Bonjour <strong>").append(employeeName).append("</strong>,\n");
        content.append("  </p>\n\n");
        
        content.append("  <p style='font-size: 15px; margin-bottom: 20px;'>\n");
        content.append("    Nous avons le plaisir de vous informer que votre demande de congé a été <strong style='color: #28a745;'>✓ APPROUVÉE</strong>.\n");
        content.append("  </p>\n\n");

        // Détails de la demande
        content.append("  <div style='background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px;'>\n");
        content.append("    <h3 style='margin-top: 0; color: #333;'>Détails de votre congé :</h3>\n");
        content.append("    <table style='width: 100%; border-collapse: collapse;'>\n");
        content.append("      <tr style='border-bottom: 1px solid #ddd;'>\n");
        content.append("        <td style='padding: 10px 0; font-weight: bold; color: #666; width: 30%;'>Type de congé :</td>\n");
        content.append("        <td style='padding: 10px 0;'>").append(leaveType).append("</td>\n");
        content.append("      </tr>\n");
        content.append("      <tr style='border-bottom: 1px solid #ddd;'>\n");
        content.append("        <td style='padding: 10px 0; font-weight: bold; color: #666;'>Du :</td>\n");
        content.append("        <td style='padding: 10px 0;'>").append(formattedStartDate).append("</td>\n");
        content.append("      </tr>\n");
        content.append("      <tr style='border-bottom: 1px solid #ddd;'>\n");
        content.append("        <td style='padding: 10px 0; font-weight: bold; color: #666;'>Au :</td>\n");
        content.append("        <td style='padding: 10px 0;'>").append(formattedEndDate).append("</td>\n");
        content.append("      </tr>\n");
        content.append("      <tr>\n");
        content.append("        <td style='padding: 10px 0; font-weight: bold; color: #666;'>Approuvé par :</td>\n");
        content.append("        <td style='padding: 10px 0;'>").append(approverName).append("</td>\n");
        content.append("      </tr>\n");
        content.append("    </table>\n");
        content.append("  </div>\n\n");

        // Commentaire si présent
        if (reviewComment != null && !reviewComment.trim().isEmpty()) {
            content.append("  <div style='background-color: #e8f5e9; padding: 15px; border-left: 4px solid #28a745; margin-bottom: 20px;'>\n");
            content.append("    <p style='margin: 0; color: #1b5e20;'>\n");
            content.append("      <strong>Commentaire :</strong><br/>\n");
            content.append("      ").append(escapeHtml(reviewComment)).append("\n");
            content.append("    </p>\n");
            content.append("  </div>\n\n");
        }

        content.append("  <p style='font-size: 15px; margin-bottom: 20px; color: #666;'>\n");
        content.append("    Nous vous souhaitons d'agréables congés ! 🎉\n");
        content.append("  </p>\n");

        content.append("  <p style='font-size: 14px; color: #999; margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px;'>\n");
        content.append("    Cet email a été généré automatiquement par le système WorkHub. Ne répondez pas à ce message.\n");
        content.append("  </p>\n");
        content.append("</div>\n");

        return content.toString();
    }

    private String generateRejectedContent(
            String employeeName,
            LocalDate startDate,
            LocalDate endDate,
            String leaveType,
            String approverName,
            String reviewComment) {

        String formattedStartDate = startDate.format(DATE_FORMATTER);
        String formattedEndDate = endDate.format(DATE_FORMATTER);

        StringBuilder content = new StringBuilder();
        content.append("<div style='color: #333; line-height: 1.6;'>\n");
        content.append("  <p style='font-size: 16px; margin-bottom: 20px;'>\n");
        content.append("    Bonjour <strong>").append(employeeName).append("</strong>,\n");
        content.append("  </p>\n\n");
        
        content.append("  <p style='font-size: 15px; margin-bottom: 20px;'>\n");
        content.append("    Nous vous informons que votre demande de congé a été <strong style='color: #dc3545;'>✗ REFUSÉE</strong>.\n");
        content.append("  </p>\n\n");

        // Détails de la demande
        content.append("  <div style='background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px;'>\n");
        content.append("    <h3 style='margin-top: 0; color: #333;'>Détails de votre demande :</h3>\n");
        content.append("    <table style='width: 100%; border-collapse: collapse;'>\n");
        content.append("      <tr style='border-bottom: 1px solid #ddd;'>\n");
        content.append("        <td style='padding: 10px 0; font-weight: bold; color: #666; width: 30%;'>Type de congé :</td>\n");
        content.append("        <td style='padding: 10px 0;'>").append(leaveType).append("</td>\n");
        content.append("      </tr>\n");
        content.append("      <tr style='border-bottom: 1px solid #ddd;'>\n");
        content.append("        <td style='padding: 10px 0; font-weight: bold; color: #666;'>Du :</td>\n");
        content.append("        <td style='padding: 10px 0;'>").append(formattedStartDate).append("</td>\n");
        content.append("      </tr>\n");
        content.append("      <tr style='border-bottom: 1px solid #ddd;'>\n");
        content.append("        <td style='padding: 10px 0; font-weight: bold; color: #666;'>Au :</td>\n");
        content.append("        <td style='padding: 10px 0;'>").append(formattedEndDate).append("</td>\n");
        content.append("      </tr>\n");
        content.append("      <tr>\n");
        content.append("        <td style='padding: 10px 0; font-weight: bold; color: #666;'>Décidé par :</td>\n");
        content.append("        <td style='padding: 10px 0;'>").append(approverName).append("</td>\n");
        content.append("      </tr>\n");
        content.append("    </table>\n");
        content.append("  </div>\n\n");

        // Raison du refus
        if (reviewComment != null && !reviewComment.trim().isEmpty()) {
            content.append("  <div style='background-color: #ffebee; padding: 15px; border-left: 4px solid #dc3545; margin-bottom: 20px;'>\n");
            content.append("    <p style='margin: 0; color: #b71c1c;'>\n");
            content.append("      <strong>Raison du refus :</strong><br/>\n");
            content.append("      ").append(escapeHtml(reviewComment)).append("\n");
            content.append("    </p>\n");
            content.append("  </div>\n\n");
        }

        content.append("  <p style='font-size: 15px; margin-bottom: 20px; color: #666;'>\n");
        content.append("    Si vous avez des questions ou souhaitez discuter de cette décision, n'hésitez pas à contacter votre gestionnaire RH.\n");
        content.append("  </p>\n");

        content.append("  <p style='font-size: 14px; color: #999; margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px;'>\n");
        content.append("    Cet email a été généré automatiquement par le système WorkHub. Ne répondez pas à ce message.\n");
        content.append("  </p>\n");
        content.append("</div>\n");

        return content.toString();
    }

    private String buildHtmlEmail(String title, String content) {
        return "<!DOCTYPE html>\n" +
                "<html lang='fr'>\n" +
                "<head>\n" +
                "  <meta charset='UTF-8'/>\n" +
                "  <meta name='viewport' content='width=device-width, initial-scale=1.0'/>\n" +
                "  <title>".concat(title).concat("</title>\n") +
                "  <style>\n" +
                "    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }\n" +
                "    .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }\n" +
                "    .email-header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center; color: white; }\n" +
                "    .email-body { padding: 30px 20px; }\n" +
                "    .email-footer { background-color: #f5f5f5; padding: 20px; text-align: center; color: #666; font-size: 12px; }\n" +
                "  </style>\n" +
                "</head>\n" +
                "<body>\n" +
                "  <div class='email-container'>\n" +
                "    <div class='email-header'>\n" +
                "      <h1 style='margin: 0; font-size: 24px;'>WorkHub</h1>\n" +
                "      <p style='margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;'>Gestion des Ressources Humaines</p>\n" +
                "    </div>\n" +
                "    <div class='email-body'>\n" +
                content +
                "    </div>\n" +
                "    <div class='email-footer'>\n" +
                "      <p style='margin: 0;'>© 2026 WorkHub. Tous droits réservés.</p>\n" +
                "    </div>\n" +
                "  </div>\n" +
                "</body>\n" +
                "</html>";
    }

    private String escapeHtml(String text) {
        if (text == null) {
            return "";
        }
        return text.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }
}
