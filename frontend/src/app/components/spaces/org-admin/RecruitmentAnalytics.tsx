import { Briefcase, TrendingUp, Users, BarChart3, RefreshCw } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useUser } from '@clerk/clerk-react';
import { useRecruitmentAnalytics } from '@/lib/useRecruitmentAnalytics';

const DEFAULT_ORG_ID = '550e8400-e29b-41d4-a716-446655440000';

function funnelPercent(value: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
}

export default function RecruitmentAnalytics() {
    const { user } = useUser();
    const organizationId =
        (user?.publicMetadata?.organizationId as string) || DEFAULT_ORG_ID;

    const { data, isLoading, isError, refetch } = useRecruitmentAnalytics(organizationId);

    if (!organizationId) {
        return (
            <div className="p-6 bg-[#F5F7FA]">
                <p className="text-gray-600">Organisation non configurée pour cet utilisateur.</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="p-6 bg-[#F5F7FA] flex items-center justify-center min-h-[400px]">
                <RefreshCw className="w-6 h-6 text-[#0A6ED1] animate-spin" />
                <span className="ml-3 text-gray-600">Chargement des analytics recrutement...</span>
            </div>
        );
    }

    if (isError || !data) {
        return (
            <div className="p-6 bg-[#F5F7FA]">
                <div className="bg-red-50 border border-red-200 p-4 rounded">
                    <p className="text-red-800 text-sm">
                        Impossible de charger les données de recrutement. Vérifiez que le service recruitment est démarré.
                    </p>
                    <button
                        onClick={() => refetch()}
                        className="mt-3 text-sm text-[#0A6ED1] hover:underline"
                    >
                        Réessayer
                    </button>
                </div>
            </div>
        );
    }

    const { kpis, avgRecruitmentTime, conversionRate, offerPerformance, activeOffers, funnel, applicationSources } = data;

    const kpiCards = [
        {
            label: 'Offres Actives',
            value: String(kpis.activeOffers),
            trend: 'stable' as const,
            change: '',
            color: 'text-gray-600',
        },
        {
            label: 'Candidatures Reçues',
            value: String(kpis.totalApplications),
            trend: kpis.applicationsTrend.startsWith('+') ? 'up' as const : kpis.applicationsTrend.startsWith('-') ? 'down' as const : 'stable' as const,
            change: kpis.applicationsTrend,
            color: kpis.applicationsTrend.startsWith('+') ? 'text-green-600' : 'text-gray-600',
        },
        {
            label: 'Temps Moyen Recrutement',
            value: kpis.avgRecruitmentDays > 0 ? `${Math.round(kpis.avgRecruitmentDays)} jours` : '—',
            trend: kpis.avgDaysTrend.startsWith('-') ? 'down' as const : kpis.avgDaysTrend.startsWith('+') ? 'up' as const : 'stable' as const,
            change: kpis.avgDaysTrend,
            color: kpis.avgDaysTrend.startsWith('-') ? 'text-green-600' : 'text-gray-600',
        },
        {
            label: 'Taux de Conversion',
            value: `${Math.round(kpis.conversionRate)}%`,
            trend: kpis.conversionTrend.startsWith('+') ? 'up' as const : kpis.conversionTrend.startsWith('-') ? 'down' as const : 'stable' as const,
            change: kpis.conversionTrend,
            color: kpis.conversionTrend.startsWith('+') ? 'text-green-600' : 'text-gray-600',
        },
    ];

    const tempsRecrutement = avgRecruitmentTime.map((m) => ({ id: m.id, mois: m.mois, temps: m.value }));
    const tauxConversion = conversionRate.map((m) => ({ id: m.id, mois: m.mois, taux: m.value }));
    const totalFunnel = funnel.candidatures;

    return (
        <div className="p-6 bg-[#F5F7FA]">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Analytics Recrutement</h1>
                    <p className="text-sm text-gray-600 mt-1">Suivi de la performance du recrutement</p>
                </div>
                <button
                    onClick={() => refetch()}
                    className="flex items-center gap-2 text-sm text-[#0A6ED1] hover:underline"
                >
                    <RefreshCw className="w-4 h-4" />
                    Actualiser
                </button>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {kpiCards.map((kpi, index) => (
                    <div key={index} className="bg-white border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xs font-medium text-gray-500 uppercase">{kpi.label}</h3>
                            {kpi.trend === 'up' ? (
                                <TrendingUp className={`w-4 h-4 ${kpi.color}`} />
                            ) : kpi.trend === 'down' ? (
                                <TrendingUp className={`w-4 h-4 ${kpi.color} transform rotate-180`} />
                            ) : null}
                        </div>
                        <p className="text-3xl font-semibold text-gray-900 mb-1">{kpi.value}</p>
                        {kpi.change && <p className={`text-xs ${kpi.color}`}>{kpi.change}</p>}
                    </div>
                ))}
            </div>

            {/* Graphiques */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-white border border-gray-200">
                    <div className="p-4 border-b border-gray-200">
                        <h3 className="text-base font-semibold text-gray-900">Temps Moyen de Recrutement (jours)</h3>
                    </div>
                    <div className="p-6">
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={tempsRecrutement}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                <XAxis dataKey="mois" stroke="#6B7280" />
                                <YAxis stroke="#6B7280" />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="temps" stroke="#0A6ED1" strokeWidth={2} name="Jours" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white border border-gray-200">
                    <div className="p-4 border-b border-gray-200">
                        <h3 className="text-base font-semibold text-gray-900">Taux de Conversion (%)</h3>
                    </div>
                    <div className="p-6">
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={tauxConversion}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                <XAxis dataKey="mois" stroke="#6B7280" />
                                <YAxis stroke="#6B7280" />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="taux" stroke="#10B981" strokeWidth={2} name="Taux (%)" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Performance des Offres */}
            {offerPerformance.length > 0 && (
                <div className="bg-white border border-gray-200 mb-6">
                    <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center">
                            <BarChart3 className="w-5 h-5 text-[#0A6ED1] mr-2" />
                            <h3 className="text-base font-semibold text-gray-900">Performance par Offre</h3>
                        </div>
                    </div>
                    <div className="p-6">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={offerPerformance}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                <XAxis dataKey="offre" stroke="#6B7280" angle={-45} textAnchor="end" height={100} />
                                <YAxis stroke="#6B7280" />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="candidatures" fill="#0A6ED1" name="Candidatures" />
                                <Bar dataKey="preselectiones" fill="#F59E0B" name="Présélections" />
                                <Bar dataKey="entretiens" fill="#10B981" name="Entretiens" />
                                <Bar dataKey="embauches" fill="#8B5CF6" name="Embauches" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Liste des Offres Actives */}
            <div className="bg-white border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h3 className="text-base font-semibold text-gray-900">Offres Actives</h3>
                        <span className="inline-flex px-3 py-1 text-xs bg-green-100 text-green-800">
                            {activeOffers.length} offre{activeOffers.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                </div>
                {activeOffers.length === 0 ? (
                    <div className="p-8 text-center text-sm text-gray-500">Aucune offre active pour le moment.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Offre</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Département</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Candidatures</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Publiée le</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {activeOffers.map((offre) => (
                                    <tr key={offre.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <Briefcase className="w-4 h-4 text-[#0A6ED1] mr-2" />
                                                <span className="text-sm font-medium text-gray-900">{offre.titre}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{offre.departement}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <Users className="w-4 h-4 text-gray-400 mr-2" />
                                                <span className="text-sm font-medium text-gray-900">{offre.candidatures}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex px-2 py-1 text-xs bg-green-100 text-green-800">
                                                {offre.statut}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {offre.datePublication
                                                ? new Date(offre.datePublication).toLocaleDateString('fr-FR')
                                                : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Statistiques Détaillées */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 p-6">
                    <h4 className="text-xs font-medium text-gray-500 uppercase mb-3">Funnel de Conversion</h4>
                    <div className="space-y-3">
                        {[
                            { label: 'Candidatures', value: funnel.candidatures, color: '#0A6ED1' },
                            { label: 'Présélections', value: funnel.preselectiones, color: '#F59E0B' },
                            { label: 'Entretiens', value: funnel.entretiens, color: '#10B981' },
                            { label: 'Embauches', value: funnel.embauches, color: '#8B5CF6' },
                        ].map((step) => (
                            <div key={step.label}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-600">{step.label}</span>
                                    <span className="font-medium text-gray-900">
                                        {step.value} ({funnelPercent(step.value, totalFunnel)}%)
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 h-2">
                                    <div
                                        className="h-2"
                                        style={{
                                            width: `${funnelPercent(step.value, totalFunnel)}%`,
                                            backgroundColor: step.color,
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white border border-gray-200 p-6">
                    <h4 className="text-xs font-medium text-gray-500 uppercase mb-3">Sources Candidatures</h4>
                    {applicationSources.length === 0 ? (
                        <p className="text-sm text-gray-500">Aucune candidature enregistrée.</p>
                    ) : (
                        <div className="space-y-3">
                            {applicationSources.map((source, index) => (
                                <div
                                    key={source.source}
                                    className={`flex justify-between pb-2 ${index < applicationSources.length - 1 ? 'border-b border-gray-100' : ''}`}
                                >
                                    <span className="text-sm text-gray-600">{source.source}</span>
                                    <span className="text-sm font-medium text-gray-900">
                                        {source.count} ({source.percentage}%)
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Info Box */}
            <div className="mt-6 bg-blue-50 border border-blue-200 p-4">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">Mode Suivi Performance Uniquement</h4>
                <p className="text-sm text-blue-800">
                    En tant qu'Administrateur d'Organisation, vous avez accès aux KPIs et statistiques de recrutement.
                    La gestion des candidatures et le processus de recrutement sont effectués par l'équipe RH.
                </p>
            </div>
        </div>
    );
}
