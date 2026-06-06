package com.workhub.payroll.service;

import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.workhub.payroll.domain.PayrollAdjustment;
import com.workhub.payroll.domain.PayrollItem;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.NumberFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Component
public class PdfGenerator {

    private static final DeviceRgb BLACK = new DeviceRgb(17, 17, 17);
    private static final DeviceRgb DARK_GRAY = new DeviceRgb(70, 70, 70);
    private static final DeviceRgb LIGHT_GRAY = new DeviceRgb(245, 245, 245);
    private static final DeviceRgb BORDER = new DeviceRgb(190, 190, 190);
    private static final DateTimeFormatter DATE_TIME_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    public record PayrollReportSummary(
            UUID organizationId,
            String periodLabel,
            int payrollCount,
            int payslipCount,
            int financialPayrollCount,
            int draftCount,
            int validatedCount,
            int paidCount,
            BigDecimal totalGross,
            BigDecimal totalNet,
            BigDecimal totalCnss,
            BigDecimal totalAmo,
            BigDecimal totalIr,
            BigDecimal totalCharges,
            BigDecimal averageNet,
            String topPeriod,
            BigDecimal topGross,
            LocalDateTime generatedAt
    ) {}

    public record PayrollReportRow(
            String period,
            String status,
            int payslipCount,
            BigDecimal gross,
            BigDecimal net,
            BigDecimal cnss,
            BigDecimal amo,
            BigDecimal ir,
            BigDecimal charges,
            LocalDateTime generatedAt
    ) {}

    public byte[] generatePayslipPdf(PayrollItem item, String employeeName, String month, int year) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        try (
                PdfWriter writer = new PdfWriter(baos);
                PdfDocument pdfDocument = new PdfDocument(writer);
                Document document = new Document(pdfDocument, PageSize.A4)
        ) {
            document.setMargins(36, 36, 30, 36);

            addDocumentHeader(document, "WORKHUB", "Bulletin de paie", "Periode : " + month + " " + year);
            addEmployeeBlock(document, employeeName, item);
            addPayslipDetails(document, item);
            addNetPayBlock(document, item);
            addFooter(document);
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la generation du PDF : " + e.getMessage(), e);
        }

        return baos.toByteArray();
    }

    public byte[] generatePayrollHistoryReport(PayrollReportSummary summary, List<PayrollReportRow> rows) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        try (
                PdfWriter writer = new PdfWriter(baos);
                PdfDocument pdfDocument = new PdfDocument(writer);
                Document document = new Document(pdfDocument, PageSize.A4)
        ) {
            document.setMargins(36, 30, 30, 30);

            addDocumentHeader(document, "WORKHUB", "Rapport annuel de paie", summary.periodLabel());
            document.add(new Paragraph("Organisation : " + summary.organizationId())
                    .setFontSize(8)
                    .setFontColor(DARK_GRAY)
                    .setMarginBottom(10));
            addReportKpis(document, summary);
            addReportStatusBlock(document, summary);
            addMonthlyReportTable(document, rows);
            addReportObservations(document, summary, rows);
            addFooter(document);
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la generation du rapport PDF : " + e.getMessage(), e);
        }

        return baos.toByteArray();
    }

    private void addDocumentHeader(Document document, String company, String title, String subtitle) {
        Table table = new Table(UnitValue.createPercentArray(new float[]{1.6f, 1f})).useAllAvailableWidth();
        table.setMarginBottom(14);

        Cell left = new Cell()
                .add(new Paragraph(company).setBold().setFontSize(14).setFontColor(BLACK).setMargin(0))
                .add(new Paragraph(title).setFontSize(10).setFontColor(DARK_GRAY).setMarginTop(2).setMarginBottom(0))
                .setBorder(Border.NO_BORDER)
                .setBorderBottom(new SolidBorder(BLACK, 1))
                .setPaddingBottom(8);

        Cell right = new Cell()
                .add(new Paragraph(subtitle).setFontSize(9).setFontColor(BLACK).setTextAlignment(TextAlignment.RIGHT).setMargin(0))
                .add(new Paragraph("Genere le " + formatDateTime(LocalDateTime.now()))
                        .setFontSize(7)
                        .setFontColor(DARK_GRAY)
                        .setTextAlignment(TextAlignment.RIGHT)
                        .setMarginTop(3)
                        .setMarginBottom(0))
                .setBorder(Border.NO_BORDER)
                .setBorderBottom(new SolidBorder(BLACK, 1))
                .setPaddingBottom(8);

        table.addCell(left);
        table.addCell(right);
        document.add(table);
    }

    private void addEmployeeBlock(Document document, String employeeName, PayrollItem item) {
        document.add(sectionTitle("Informations employe"));

        Table table = new Table(UnitValue.createPercentArray(new float[]{1.2f, 2.4f})).useAllAvailableWidth();
        table.setMarginBottom(12);
        table.addCell(labelCell("Nom complet"));
        table.addCell(valueCell(employeeName));
        table.addCell(labelCell("ID employe"));
        table.addCell(valueCell(item.getEmployeeId() != null ? item.getEmployeeId().toString() : "-"));
        table.addCell(labelCell("Reference bulletin"));
        table.addCell(valueCell(item.getId() != null ? item.getId().toString() : "En generation"));
        document.add(table);
    }

    private void addPayslipDetails(Document document, PayrollItem item) {
        document.add(sectionTitle("Elements de paie"));

        Table table = new Table(UnitValue.createPercentArray(new float[]{2.5f, 1f, 1.2f})).useAllAvailableWidth();
        table.setMarginBottom(10);
        table.addHeaderCell(headerCell("Description"));
        table.addHeaderCell(headerCell("Nature"));
        table.addHeaderCell(headerCell("Montant"));

        addPayslipRow(table, "Salaire de base", "Gain", item.getBaseSalary(), false);
        addOptionalPayslipRow(table, "Indemnite de transport", "Gain", item.getTransportBonus(), false);
        addOptionalPayslipRow(table, "Indemnite de repas", "Gain", item.getMealBonus(), false);
        addOptionalPayslipRow(table, "Prime de rendement", "Gain", item.getPerformanceBonus(), false);

        if (item.getAdjustments() != null && !item.getAdjustments().isEmpty()) {
            for (PayrollAdjustment adjustment : item.getAdjustments()) {
                String label = adjustment.getType().getLabel();
                if (adjustment.getDescription() != null && !adjustment.getDescription().isBlank()) {
                    label += " - " + adjustment.getDescription();
                }
                boolean deduction = adjustment.getType() == PayrollAdjustment.AdjustmentType.DEDUCTION;
                addPayslipRow(table, label, deduction ? "Retenue" : "Gain", adjustment.getAmount(), deduction);
            }
        }

        addSubtotalRow(table, "Salaire brut", item.getGrossSalary());
        addPayslipRow(table, "Cotisation CNSS", "Retenue", item.getCnssDeduction(), true);
        addPayslipRow(table, "Cotisation AMO", "Retenue", item.getAmoDeduction(), true);
        addPayslipRow(table, "Impot sur le revenu (IR)", "Retenue", item.getIrDeduction(), true);
        document.add(table);
    }

    private void addNetPayBlock(Document document, PayrollItem item) {
        Table table = new Table(UnitValue.createPercentArray(new float[]{1f, 1f})).useAllAvailableWidth();
        table.setMarginTop(6);
        table.setMarginBottom(14);
        table.addCell(new Cell()
                .add(new Paragraph("Net a payer").setBold().setFontSize(10).setFontColor(BLACK).setMargin(0))
                .setBackgroundColor(LIGHT_GRAY)
                .setPadding(8)
                .setBorder(new SolidBorder(BLACK, 1)));
        table.addCell(new Cell()
                .add(new Paragraph(formatCurrency(item.getNetSalary())).setBold().setFontSize(11).setTextAlignment(TextAlignment.RIGHT).setMargin(0))
                .setBackgroundColor(LIGHT_GRAY)
                .setPadding(8)
                .setBorder(new SolidBorder(BLACK, 1)));
        document.add(table);
    }

    private void addReportKpis(Document document, PayrollReportSummary summary) {
        document.add(sectionTitle("Synthese"));

        Table table = new Table(UnitValue.createPercentArray(new float[]{1f, 1f, 1f, 1f})).useAllAvailableWidth();
        table.setMarginBottom(10);
        table.addCell(metricCell("Paies traitees", String.valueOf(summary.payrollCount())));
        table.addCell(metricCell("Bulletins", String.valueOf(summary.payslipCount())));
        table.addCell(metricCell("Masse brute", formatCurrency(summary.totalGross())));
        table.addCell(metricCell("Net confirme", formatCurrency(summary.totalNet())));
        document.add(table);

        Table charges = new Table(UnitValue.createPercentArray(new float[]{1f, 1f, 1f, 1f})).useAllAvailableWidth();
        charges.setMarginBottom(12);
        charges.addCell(metricCell("Charges totales", formatCurrency(summary.totalCharges())));
        charges.addCell(metricCell("CNSS", formatCurrency(summary.totalCnss())));
        charges.addCell(metricCell("AMO", formatCurrency(summary.totalAmo())));
        charges.addCell(metricCell("IR", formatCurrency(summary.totalIr())));
        document.add(charges);
    }

    private void addReportStatusBlock(Document document, PayrollReportSummary summary) {
        document.add(sectionTitle("Etat des sessions"));

        Table table = new Table(UnitValue.createPercentArray(new float[]{1f, 1f, 1f, 1f})).useAllAvailableWidth();
        table.setMarginBottom(12);
        table.addHeaderCell(headerCell("Brouillon"));
        table.addHeaderCell(headerCell("Validee"));
        table.addHeaderCell(headerCell("Payee"));
        table.addHeaderCell(headerCell("Confirmees"));
        table.addCell(centerCell(String.valueOf(summary.draftCount())));
        table.addCell(centerCell(String.valueOf(summary.validatedCount())));
        table.addCell(centerCell(String.valueOf(summary.paidCount())));
        table.addCell(centerCell(String.valueOf(summary.financialPayrollCount())));
        document.add(table);
    }

    private void addMonthlyReportTable(Document document, List<PayrollReportRow> rows) {
        document.add(sectionTitle("Detail mensuel"));

        Table table = new Table(UnitValue.createPercentArray(new float[]{1.25f, 1f, .75f, 1.2f, 1.2f, 1.2f, 1.15f})).useAllAvailableWidth();
        table.addHeaderCell(headerCell("Periode"));
        table.addHeaderCell(headerCell("Statut"));
        table.addHeaderCell(headerCell("Bulletins"));
        table.addHeaderCell(headerCell("Brut"));
        table.addHeaderCell(headerCell("Net"));
        table.addHeaderCell(headerCell("Charges"));
        table.addHeaderCell(headerCell("Generee le"));

        if (rows.isEmpty()) {
            table.addCell(new Cell(1, 7)
                    .add(new Paragraph("Aucune paie trouvee pour cette periode.").setFontSize(8))
                    .setPadding(6)
                    .setBorder(new SolidBorder(BORDER, 0.5f)));
        } else {
            for (PayrollReportRow row : rows) {
                table.addCell(bodyCell(row.period()));
                table.addCell(bodyCell(statusLabel(row.status())));
                table.addCell(countCell(row.payslipCount()));
                table.addCell(amountCell(row.gross()));
                table.addCell(amountCell(row.net()));
                table.addCell(amountCell(row.charges()));
                table.addCell(bodyCell(formatDateTime(row.generatedAt())));
            }
        }
        document.add(table);
    }

    private void addReportObservations(Document document, PayrollReportSummary summary, List<PayrollReportRow> rows) {
        document.add(sectionTitle("Observation"));

        String activity = rows.isEmpty()
                ? "Aucune activite de paie n'a ete detectee sur la periode selectionnee."
                : "Ce rapport resume les sessions de paie generees, validees et payees sur la periode selectionnee.";
        String scope = "Les montants consolides excluent les paies en brouillon afin de separer les simulations des paies confirmees.";

        document.add(new Paragraph(activity).setFontSize(8).setFontColor(BLACK).setMarginBottom(3));
        document.add(new Paragraph(scope).setFontSize(8).setFontColor(BLACK).setMarginBottom(3));
        document.add(new Paragraph("Salaire net moyen par bulletin confirme : " + formatCurrency(summary.averageNet())
                + ". Plus forte masse brute : " + summary.topPeriod() + " (" + formatCurrency(summary.topGross()) + ").")
                .setFontSize(8)
                .setFontColor(BLACK)
                .setMarginBottom(8));
    }

    private void addOptionalPayslipRow(Table table, String description, String type, BigDecimal amount, boolean negative) {
        if (amount != null && amount.compareTo(BigDecimal.ZERO) > 0) {
            addPayslipRow(table, description, type, amount, negative);
        }
    }

    private void addPayslipRow(Table table, String description, String type, BigDecimal amount, boolean negative) {
        table.addCell(bodyCell(description));
        table.addCell(bodyCell(type));
        table.addCell(amountCell(negative ? nvl(amount).negate() : amount));
    }

    private void addSubtotalRow(Table table, String label, BigDecimal amount) {
        table.addCell(bodyCell(label).setBold().setBackgroundColor(LIGHT_GRAY));
        table.addCell(bodyCell("Total").setBold().setBackgroundColor(LIGHT_GRAY));
        table.addCell(amountCell(amount).setBold().setBackgroundColor(LIGHT_GRAY));
    }

    private Paragraph sectionTitle(String title) {
        return new Paragraph(title)
                .setBold()
                .setFontSize(9)
                .setFontColor(BLACK)
                .setMarginTop(8)
                .setMarginBottom(5);
    }

    private Cell headerCell(String text) {
        return new Cell()
                .add(new Paragraph(text).setBold().setFontSize(7).setFontColor(BLACK))
                .setBackgroundColor(LIGHT_GRAY)
                .setPadding(5)
                .setBorder(new SolidBorder(BORDER, 0.5f));
    }

    private Cell labelCell(String text) {
        return new Cell()
                .add(new Paragraph(text).setFontSize(7).setFontColor(DARK_GRAY))
                .setBackgroundColor(LIGHT_GRAY)
                .setPadding(5)
                .setBorder(new SolidBorder(BORDER, 0.5f));
    }

    private Cell valueCell(String text) {
        return new Cell()
                .add(new Paragraph(text == null ? "-" : text).setFontSize(7).setFontColor(BLACK))
                .setPadding(5)
                .setBorder(new SolidBorder(BORDER, 0.5f));
    }

    private Cell bodyCell(String text) {
        return new Cell()
                .add(new Paragraph(text == null ? "-" : text).setFontSize(7).setFontColor(BLACK))
                .setPadding(5)
                .setBorder(new SolidBorder(BORDER, 0.5f));
    }

    private Cell amountCell(BigDecimal amount) {
        return new Cell()
                .add(new Paragraph(formatCurrency(amount)).setFontSize(7).setFontColor(BLACK))
                .setTextAlignment(TextAlignment.RIGHT)
                .setPadding(5)
                .setBorder(new SolidBorder(BORDER, 0.5f));
    }

    private Cell countCell(int count) {
        return new Cell()
                .add(new Paragraph(String.valueOf(count)).setFontSize(7).setFontColor(BLACK))
                .setTextAlignment(TextAlignment.RIGHT)
                .setPadding(5)
                .setBorder(new SolidBorder(BORDER, 0.5f));
    }

    private Cell centerCell(String text) {
        return new Cell()
                .add(new Paragraph(text).setFontSize(8).setFontColor(BLACK))
                .setTextAlignment(TextAlignment.CENTER)
                .setPadding(6)
                .setBorder(new SolidBorder(BORDER, 0.5f));
    }

    private Cell metricCell(String label, String value) {
        return new Cell()
                .add(new Paragraph(label).setFontSize(7).setFontColor(DARK_GRAY).setMarginBottom(2))
                .add(new Paragraph(value).setBold().setFontSize(8).setFontColor(BLACK).setMargin(0))
                .setPadding(6)
                .setBorder(new SolidBorder(BORDER, 0.5f));
    }

    private void addFooter(Document document) {
        document.add(new Paragraph("Document genere automatiquement par WorkHub. Montants exprimes en dirhams marocains (MAD).")
                .setFontSize(6)
                .setFontColor(DARK_GRAY)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginTop(12));
    }

    private String statusLabel(String status) {
        if (status == null) {
            return "-";
        }
        return switch (status) {
            case "DRAFT" -> "Brouillon";
            case "VALIDATED" -> "Validee";
            case "PAID" -> "Payee";
            default -> status;
        };
    }

    private String formatDateTime(LocalDateTime value) {
        return value == null ? "-" : value.format(DATE_TIME_FORMAT);
    }

    private String formatCurrency(BigDecimal amount) {
        NumberFormat format = NumberFormat.getNumberInstance(Locale.FRANCE);
        format.setMinimumFractionDigits(2);
        format.setMaximumFractionDigits(2);
        return format.format(nvl(amount).setScale(2, RoundingMode.HALF_UP)) + " MAD";
    }

    private BigDecimal nvl(BigDecimal amount) {
        return amount == null ? BigDecimal.ZERO : amount;
    }
}
