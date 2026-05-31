import { useApi } from './useApi';
import { useQuery } from '@tanstack/react-query';

// Même pattern que RecruitmentEnhanced : service recruitment direct (CORS déjà configuré sur 8085)
const API_BASE = import.meta.env.VITE_RECRUITMENT_API_URL || 'http://localhost:8085/api';

export interface RecruitmentAnalyticsData {
    kpis: {
        activeOffers: number;
        totalApplications: number;
        avgRecruitmentDays: number;
        conversionRate: number;
        applicationsTrend: string;
        avgDaysTrend: string;
        conversionTrend: string;
    };
    avgRecruitmentTime: { id: string; mois: string; value: number }[];
    conversionRate: { id: string; mois: string; value: number }[];
    offerPerformance: {
        id: string;
        offre: string;
        candidatures: number;
        preselectiones: number;
        entretiens: number;
        embauches: number;
    }[];
    activeOffers: {
        id: string;
        titre: string;
        departement: string;
        candidatures: number;
        statut: string;
        datePublication: string;
    }[];
    funnel: {
        candidatures: number;
        preselectiones: number;
        entretiens: number;
        embauches: number;
    };
    applicationSources: {
        source: string;
        count: number;
        percentage: number;
    }[];
}

export const useRecruitmentAnalytics = (organizationId: string) => {
    const apiFetch = useApi();

    return useQuery<RecruitmentAnalyticsData>({
        queryKey: ['recruitment-analytics', organizationId],
        queryFn: () =>
            apiFetch(
                `${API_BASE}/analytics/recruitment?organizationId=${organizationId}`
            ),
        enabled: !!organizationId,
    });
};
