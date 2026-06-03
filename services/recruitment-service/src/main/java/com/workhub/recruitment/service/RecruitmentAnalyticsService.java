package com.workhub.recruitment.service;

import com.workhub.recruitment.domain.*;
import com.workhub.recruitment.dto.RecruitmentAnalyticsResponse;
import com.workhub.recruitment.repo.ApplicationRepository;
import com.workhub.recruitment.repo.CandidateRepository;
import com.workhub.recruitment.repo.InterviewRepository;
import com.workhub.recruitment.repo.JobOfferRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RecruitmentAnalyticsService {

    private static final String[] MONTH_LABELS = {
            "Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc"
    };

    private static final Set<ApplicationStatus> PRESELECTED_STATUSES = EnumSet.of(
            ApplicationStatus.PRESELECTED,
            ApplicationStatus.INTERVIEW_SCHEDULED,
            ApplicationStatus.HIRED
    );

    private static final Set<ApplicationStatus> INTERVIEW_STATUSES = EnumSet.of(
            ApplicationStatus.INTERVIEW_SCHEDULED,
            ApplicationStatus.HIRED
    );

    private final JobOfferRepository jobOfferRepo;
    private final ApplicationRepository applicationRepo;
    private final InterviewRepository interviewRepo;
    private final CandidateRepository candidateRepo;

    public RecruitmentAnalyticsResponse getAnalytics(UUID organizationId) {
        List<JobOffer> orgOffers = jobOfferRepo.findByOrganizationId(organizationId);
        List<UUID> offerIds = orgOffers.stream().map(JobOffer::getId).toList();

        List<Application> applications = offerIds.isEmpty()
                ? List.of()
                : applicationRepo.findByJobOfferIdIn(offerIds);

        Set<UUID> applicationIdsWithInterview = interviewRepo.findAll().stream()
                .map(Interview::getApplicationId)
                .collect(Collectors.toSet());

        int activeOffersCount = (int) orgOffers.stream()
                .filter(o -> o.getStatus() == JobOfferStatus.PUBLISHED)
                .count();

        int totalApplications = applications.size();
        int hiredCount = countByStatus(applications, ApplicationStatus.HIRED);
        double conversionRate = totalApplications > 0
                ? round1((double) hiredCount / totalApplications * 100)
                : 0;

        double avgRecruitmentDays = applications.stream()
                .filter(a -> a.getStatus() == ApplicationStatus.HIRED)
                .filter(a -> a.getAppliedAt() != null)
                .mapToLong(a -> daysBetween(a.getAppliedAt(), a.getUpdatedAt()))
                .average()
                .orElse(0);

        ZoneId zone = ZoneId.systemDefault();
        Instant now = Instant.now();

        RecruitmentAnalyticsResponse.KpiSection kpis = RecruitmentAnalyticsResponse.KpiSection.builder()
                .activeOffers(activeOffersCount)
                .totalApplications(totalApplications)
                .avgRecruitmentDays(round1(avgRecruitmentDays))
                .conversionRate(conversionRate)
                .applicationsTrend(trendApplications(applications, zone, now))
                .avgDaysTrend(trendAvgDays(applications, zone, now))
                .conversionTrend(trendConversion(applications, zone, now))
                .build();

        List<RecruitmentAnalyticsResponse.MonthlyMetric> avgRecruitmentTime = buildMonthlyAvgDays(applications, zone, now);
        List<RecruitmentAnalyticsResponse.MonthlyMetric> conversionRateMonthly = buildMonthlyConversion(applications, zone, now);

        List<RecruitmentAnalyticsResponse.OfferPerformance> offerPerformance = orgOffers.stream()
                .map(offer -> buildOfferPerformance(offer, applications, applicationIdsWithInterview))
                .sorted(Comparator.comparingInt(RecruitmentAnalyticsResponse.OfferPerformance::getCandidatures).reversed())
                .limit(10)
                .toList();

        List<RecruitmentAnalyticsResponse.ActiveOffer> activeOffers = orgOffers.stream()
                .filter(o -> o.getStatus() == JobOfferStatus.PUBLISHED)
                .map(offer -> buildActiveOffer(offer, applications))
                .sorted(Comparator.comparing(RecruitmentAnalyticsResponse.ActiveOffer::getCandidatures).reversed())
                .toList();

        RecruitmentAnalyticsResponse.Funnel funnel = RecruitmentAnalyticsResponse.Funnel.builder()
                .candidatures(totalApplications)
                .preselectiones(countPreselected(applications))
                .entretiens(countInterviews(applications, applicationIdsWithInterview))
                .embauches(hiredCount)
                .build();

        List<RecruitmentAnalyticsResponse.SourceStat> sources = buildApplicationSources(applications);

        return RecruitmentAnalyticsResponse.builder()
                .kpis(kpis)
                .avgRecruitmentTime(avgRecruitmentTime)
                .conversionRate(conversionRateMonthly)
                .offerPerformance(offerPerformance)
                .activeOffers(activeOffers)
                .funnel(funnel)
                .applicationSources(sources)
                .build();
    }

    private RecruitmentAnalyticsResponse.OfferPerformance buildOfferPerformance(
            JobOffer offer,
            List<Application> applications,
            Set<UUID> applicationIdsWithInterview
    ) {
        List<Application> offerApps = applications.stream()
                .filter(a -> a.getJobOfferId().equals(offer.getId()))
                .toList();

        return RecruitmentAnalyticsResponse.OfferPerformance.builder()
                .id(offer.getId().toString())
                .offre(truncate(offer.getTitle(), 25))
                .candidatures(offerApps.size())
                .preselectiones((int) offerApps.stream().filter(a -> PRESELECTED_STATUSES.contains(a.getStatus())).count())
                .entretiens(countInterviews(offerApps, applicationIdsWithInterview))
                .embauches(countByStatus(offerApps, ApplicationStatus.HIRED))
                .build();
    }

    private RecruitmentAnalyticsResponse.ActiveOffer buildActiveOffer(JobOffer offer, List<Application> applications) {
        int candidatures = (int) applications.stream()
                .filter(a -> a.getJobOfferId().equals(offer.getId()))
                .count();

        String datePublication = offer.getPublishedAt() != null
                ? offer.getPublishedAt().atZone(ZoneId.systemDefault()).toLocalDate().toString()
                : "";

        return RecruitmentAnalyticsResponse.ActiveOffer.builder()
                .id(offer.getId())
                .titre(offer.getTitle())
                .departement(offer.getLocation() != null ? offer.getLocation() : "N/A")
                .candidatures(candidatures)
                .statut("Ouverte")
                .datePublication(datePublication)
                .build();
    }

    private List<RecruitmentAnalyticsResponse.SourceStat> buildApplicationSources(List<Application> applications) {
        if (applications.isEmpty()) {
            return List.of();
        }

        int linkedIn = 0;
        int siteCarrieres = 0;

        for (Application app : applications) {
            Candidate candidate = candidateRepo.findById(app.getCandidateId()).orElse(null);
            if (candidate != null && candidate.getLinkedinUrl() != null && !candidate.getLinkedinUrl().isBlank()) {
                linkedIn++;
            } else {
                siteCarrieres++;
            }
        }

        int total = applications.size();
        List<RecruitmentAnalyticsResponse.SourceStat> stats = new ArrayList<>();
        if (linkedIn > 0) {
            stats.add(RecruitmentAnalyticsResponse.SourceStat.builder()
                    .source("LinkedIn")
                    .count(linkedIn)
                    .percentage(Math.round((float) linkedIn / total * 100))
                    .build());
        }
        if (siteCarrieres > 0) {
            stats.add(RecruitmentAnalyticsResponse.SourceStat.builder()
                    .source("Site Carrières")
                    .count(siteCarrieres)
                    .percentage(Math.round((float) siteCarrieres / total * 100))
                    .build());
        }
        return stats;
    }

    private List<RecruitmentAnalyticsResponse.MonthlyMetric> buildMonthlyAvgDays(
            List<Application> applications,
            ZoneId zone,
            Instant now
    ) {
        List<RecruitmentAnalyticsResponse.MonthlyMetric> metrics = new ArrayList<>();
        for (int i = 3; i >= 0; i--) {
            var monthStart = now.atZone(zone).toLocalDate().withDayOfMonth(1).minusMonths(i);
            int month = monthStart.getMonthValue();
            int year = monthStart.getYear();

            double avg = applications.stream()
                    .filter(a -> a.getStatus() == ApplicationStatus.HIRED)
                    .filter(a -> a.getUpdatedAt() != null)
                    .filter(a -> {
                        var d = a.getUpdatedAt().atZone(zone).toLocalDate();
                        return d.getMonthValue() == month && d.getYear() == year;
                    })
                    .mapToLong(a -> daysBetween(a.getAppliedAt(), a.getUpdatedAt()))
                    .average()
                    .orElse(0);

            metrics.add(RecruitmentAnalyticsResponse.MonthlyMetric.builder()
                    .id("tr-" + monthStart.getMonth().name().toLowerCase())
                    .mois(MONTH_LABELS[month - 1])
                    .value(round1(avg))
                    .build());
        }
        return metrics;
    }

    private List<RecruitmentAnalyticsResponse.MonthlyMetric> buildMonthlyConversion(
            List<Application> applications,
            ZoneId zone,
            Instant now
    ) {
        List<RecruitmentAnalyticsResponse.MonthlyMetric> metrics = new ArrayList<>();
        for (int i = 3; i >= 0; i--) {
            var monthStart = now.atZone(zone).toLocalDate().withDayOfMonth(1).minusMonths(i);
            int month = monthStart.getMonthValue();
            int year = monthStart.getYear();

            List<Application> monthApps = applications.stream()
                    .filter(a -> a.getAppliedAt() != null)
                    .filter(a -> {
                        var d = a.getAppliedAt().atZone(zone).toLocalDate();
                        return d.getMonthValue() == month && d.getYear() == year;
                    })
                    .toList();

            int hiredInMonth = (int) monthApps.stream()
                    .filter(a -> a.getStatus() == ApplicationStatus.HIRED)
                    .count();

            double rate = monthApps.isEmpty()
                    ? 0
                    : round1((double) hiredInMonth / monthApps.size() * 100);

            metrics.add(RecruitmentAnalyticsResponse.MonthlyMetric.builder()
                    .id("tc-" + monthStart.getMonth().name().toLowerCase())
                    .mois(MONTH_LABELS[month - 1])
                    .value(rate)
                    .build());
        }
        return metrics;
    }

    private String trendApplications(List<Application> applications, ZoneId zone, Instant now) {
        int current = countApplicationsInMonth(applications, zone, now, 0);
        int previous = countApplicationsInMonth(applications, zone, now, 1);
        if (previous == 0) {
            return current > 0 ? "+100%" : "";
        }
        double change = ((double) (current - previous) / previous) * 100;
        return formatTrend(change, "%");
    }

    private String trendAvgDays(List<Application> applications, ZoneId zone, Instant now) {
        double current = avgDaysInMonth(applications, zone, now, 0);
        double previous = avgDaysInMonth(applications, zone, now, 1);
        if (previous == 0) {
            return current > 0 ? "-" + Math.round(current) + "j" : "";
        }
        double diff = current - previous;
        return formatTrendDays(diff);
    }

    private String trendConversion(List<Application> applications, ZoneId zone, Instant now) {
        double current = conversionInMonth(applications, zone, now, 0);
        double previous = conversionInMonth(applications, zone, now, 1);
        return formatTrend(current - previous, "%");
    }

    private int countApplicationsInMonth(List<Application> applications, ZoneId zone, Instant now, int monthsAgo) {
        var ref = now.atZone(zone).toLocalDate().withDayOfMonth(1).minusMonths(monthsAgo);
        return (int) applications.stream()
                .filter(a -> a.getAppliedAt() != null)
                .filter(a -> {
                    var d = a.getAppliedAt().atZone(zone).toLocalDate();
                    return d.getMonthValue() == ref.getMonthValue() && d.getYear() == ref.getYear();
                })
                .count();
    }

    private double avgDaysInMonth(List<Application> applications, ZoneId zone, Instant now, int monthsAgo) {
        var ref = now.atZone(zone).toLocalDate().withDayOfMonth(1).minusMonths(monthsAgo);
        return applications.stream()
                .filter(a -> a.getStatus() == ApplicationStatus.HIRED)
                .filter(a -> a.getUpdatedAt() != null)
                .filter(a -> {
                    var d = a.getUpdatedAt().atZone(zone).toLocalDate();
                    return d.getMonthValue() == ref.getMonthValue() && d.getYear() == ref.getYear();
                })
                .mapToLong(a -> daysBetween(a.getAppliedAt(), a.getUpdatedAt()))
                .average()
                .orElse(0);
    }

    private double conversionInMonth(List<Application> applications, ZoneId zone, Instant now, int monthsAgo) {
        var ref = now.atZone(zone).toLocalDate().withDayOfMonth(1).minusMonths(monthsAgo);
        List<Application> monthApps = applications.stream()
                .filter(a -> a.getAppliedAt() != null)
                .filter(a -> {
                    var d = a.getAppliedAt().atZone(zone).toLocalDate();
                    return d.getMonthValue() == ref.getMonthValue() && d.getYear() == ref.getYear();
                })
                .toList();
        if (monthApps.isEmpty()) return 0;
        long hired = monthApps.stream().filter(a -> a.getStatus() == ApplicationStatus.HIRED).count();
        return (double) hired / monthApps.size() * 100;
    }

    private int countByStatus(List<Application> applications, ApplicationStatus status) {
        return (int) applications.stream().filter(a -> a.getStatus() == status).count();
    }

    private int countPreselected(List<Application> applications) {
        return (int) applications.stream().filter(a -> PRESELECTED_STATUSES.contains(a.getStatus())).count();
    }

    private int countInterviews(List<Application> applications, Set<UUID> applicationIdsWithInterview) {
        return (int) applications.stream()
                .filter(a -> INTERVIEW_STATUSES.contains(a.getStatus())
                        || applicationIdsWithInterview.contains(a.getId()))
                .count();
    }

    private long daysBetween(Instant start, Instant end) {
        if (start == null) return 0;
        Instant effectiveEnd = end != null ? end : Instant.now();
        return ChronoUnit.DAYS.between(start, effectiveEnd);
    }

    private double round1(double value) {
        return Math.round(value * 10.0) / 10.0;
    }

    private String formatTrend(double change, String suffix) {
        if (Math.abs(change) < 0.05) return "";
        return (change >= 0 ? "+" : "") + Math.round(change) + suffix;
    }

    private String formatTrendDays(double diff) {
        if (Math.abs(diff) < 0.5) return "";
        long rounded = Math.round(Math.abs(diff));
        return (diff <= 0 ? "-" : "+") + rounded + "j";
    }

    private String truncate(String text, int maxLen) {
        if (text == null) return "";
        return text.length() <= maxLen ? text : text.substring(0, maxLen - 1) + "…";
    }
}
