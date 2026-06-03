package com.workhub.payroll.service;

import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.workhub.payroll.domain.PayrollItem;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;

@Component
public class PdfGenerator {

    /**
     * Génère le bulletin de paie au format PDF et retourne les octets du fichier.
     * Utilise iText 7 pour la génération PDF.
     */
    public byte[] generatePayslipPdf(PayrollItem item, String employeeName, String month, int year) {
        return generatePayslipPdf(item, employeeName, month, year, "WORKHUB", null);
    }

    public byte[] generatePayslipPdf(PayrollItem item, String employeeName, String month, int year,
                                     String companyName, String legalMentions) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        try (
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdfDocument = new PdfDocument(writer);
            Document document = new Document(pdfDocument)
        ) {
            // Titre
            String header = (companyName != null && !companyName.isBlank()) ? companyName : "WORKHUB";
            Paragraph title = new Paragraph(header + " - BULLETIN DE PAIE")
                    .setFontSize(18)
                    .setBold()
                    .setTextAlignment(TextAlignment.CENTER);
            document.add(title);

            // Période
            Paragraph period = new Paragraph("Période : " + month + " " + year)
                    .setFontSize(10)
                    .setTextAlignment(TextAlignment.CENTER);
            document.add(period);

            document.add(new Paragraph("\n"));

            // Informations employé
            document.add(new Paragraph("INFORMATIONS EMPLOYÉ").setBold().setFontSize(12));
            document.add(new Paragraph("Nom : " + employeeName).setFontSize(10));
            document.add(new Paragraph("ID : " + item.getEmployeeId().toString()).setFontSize(10));

            document.add(new Paragraph("\n"));

            // Détail du calcul
            document.add(new Paragraph("DÉTAIL DU CALCUL").setBold().setFontSize(12));

            // Table pour les détails
            Table table = new Table(2);
            table.addCell("Description");
            table.addCell("Montant (MAD)");

            table.addCell("Salaire de base");
            table.addCell(formatCurrency(item.getBaseSalary()));

            table.addCell("Salaire Brut");
            table.addCell(formatCurrency(item.getGrossSalary()));

            table.addCell("Cotisation CNSS (4.48%)");
            table.addCell("-" + formatCurrency(item.getCnssDeduction()));

            table.addCell("Cotisation AMO (2.26%)");
            table.addCell("-" + formatCurrency(item.getAmoDeduction()));

            table.addCell("Impôt sur le Revenu (IR)");
            table.addCell("-" + formatCurrency(item.getIrDeduction()));

            document.add(table);

            document.add(new Paragraph("\n"));

            // Net à payer
            Paragraph netPay = new Paragraph("NET À PAYER : " + formatCurrency(item.getNetSalary()))
                    .setFontSize(12)
                    .setBold()
                    .setTextAlignment(TextAlignment.CENTER);
            document.add(netPay);

            if (legalMentions != null && !legalMentions.isBlank()) {
                document.add(new Paragraph("\n"));
                document.add(new Paragraph(legalMentions).setFontSize(8).setTextAlignment(TextAlignment.CENTER));
            }

        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la génération du PDF : " + e.getMessage(), e);
        }

        return baos.toByteArray();
    }

    /**
     * Formate un montant en devise MAD avec 2 décimales.
     * Utilise RoundingMode.HALF_UP au lieu de la constante dépréciée.
     */
    private String formatCurrency(BigDecimal amount) {
        if (amount == null) {
            return "0.00 MAD";
        }
        //  Utilise RoundingMode (modern) au lieu de BigDecimal.ROUND_HALF_UP (dépréciée)
        return amount.setScale(2, RoundingMode.HALF_UP) + " MAD";
    }
}