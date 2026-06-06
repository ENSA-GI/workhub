package com.workhub.recruitment.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
@Builder
public class RecruitmentAnalyticsResponse {

    private KpiSection kpis;
    private List<MonthlyMetric> avgRecruitmentTime;
    private List<MonthlyMetric> conversionRate;
    private List<OfferPerformance> offerPerformance;
    private List<ActiveOffer> activeOffers;
    private Funnel funnel;
    private List<SourceStat> applicationSources;

    @Data
    @Builder
    public static class KpiSection {
        private int activeOffers;
        private int totalApplications;
        private double avgRecruitmentDays;
        private double conversionRate;
        private String applicationsTrend;
        private String avgDaysTrend;
        private String conversionTrend;
    }

    @Data
    @Builder
    public static class MonthlyMetric {
        private String id;
        private String mois;
        private double value;
    }

    @Data
    @Builder
    public static class OfferPerformance {
        private String id;
        private String offre;
        private int candidatures;
        private int preselectiones;
        private int entretiens;
        private int embauches;
    }

    @Data
    @Builder
    public static class ActiveOffer {
        private UUID id;
        private String titre;
        private String departement;
        private int candidatures;
        private String statut;
        private String datePublication;
    }

    @Data
    @Builder
    public static class Funnel {
        private int candidatures;
        private int preselectiones;
        private int entretiens;
        private int embauches;
    }

    @Data
    @Builder
    public static class SourceStat {
        private String source;
        private int count;
        private int percentage;
    }
}
