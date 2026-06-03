import { useApi } from './useApi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface OrganizationSettings {
    annual_leave_days: number;
    work_days_per_week: number;
    currency: string;
    timezone: string;
    language: string;
    fiscal_year_start: string;
}

export interface Organization {
    id: string;
    name: string;
    legalName: string;
    logo?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    country: string;
    phone?: string;
    email?: string;
    website?: string;
    taxId?: string;
    cnssAffiliation?: string;
    settings: OrganizationSettings;
    plan: string;
    maxEmployees: number;
    subscriptionStartDate?: string;
    subscriptionEndDate?: string;
    active: boolean;
}

export interface Department {
    id: string;
    organizationId: string;
    name: string;
    description?: string;
    managerEmployeeId?: string;
    active: boolean;
}

export interface Position {
    id: string;
    organizationId: string;
    title: string;
    description?: string;
    category: 'CADRE' | 'AGENT_MAITRISE' | 'EMPLOYE' | 'STAGIAIRE';
    active: boolean;
}

export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

// Organization Hooks
export const useOrganizations = (page = 0, size = 20, active?: boolean) => {
    const apiFetch = useApi();
    const query = active !== undefined ? `&active=${active}` : '';
    return useQuery<PageResponse<Organization>>({
        queryKey: ['organizations', page, size, active],
        queryFn: () => apiFetch(`/org/orgs?page=${page}&size=${size}${query}`),
    });
};

export const useOrganization = (orgId: string) => {
    const apiFetch = useApi();
    return useQuery<Organization>({
        queryKey: ['organization', orgId],
        queryFn: () => apiFetch(`/org/orgs/${orgId}`),
        enabled: !!orgId,
    });
};

export const useCreateOrganization = () => {
    const apiFetch = useApi();
    const queryClient = useQueryClient();
    return useMutation<Organization, Error, Partial<Organization>>({
        mutationFn: (data) => apiFetch('/org/orgs', { method: 'POST', body: JSON.stringify(data) }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['organizations'] });
        },
    });
};

export const useUpdateOrganization = () => {
    const apiFetch = useApi();
    const queryClient = useQueryClient();
    return useMutation<Organization, Error, { id: string; data: Partial<Organization> }>({
        mutationFn: ({ id, data }) => apiFetch(`/org/orgs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['organizations'] });
            queryClient.invalidateQueries({ queryKey: ['organization', variables.id] });
        },
    });
};

// Department Hooks
export const useDepartments = (orgId: string, page = 0, size = 50) => {
    const apiFetch = useApi();
    return useQuery<PageResponse<Department>>({
        queryKey: ['departments', orgId, page, size],
        queryFn: () => apiFetch(`/org/orgs/${orgId}/departments?page=${page}&size=${size}`),
        enabled: !!orgId,
    });
};

export const useCreateDepartment = () => {
    const apiFetch = useApi();
    const queryClient = useQueryClient();
    return useMutation<Department, Error, { organizationId: string; name: string; description?: string }>({
        mutationFn: (data) => apiFetch('/org/departments', { method: 'POST', body: JSON.stringify(data) }),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['departments', variables.organizationId] });
        },
    });
};

export const useDeleteDepartment = () => {
    const apiFetch = useApi();
    const queryClient = useQueryClient();
    return useMutation<void, Error, { id: string; organizationId: string }>({
        mutationFn: ({ id }) => apiFetch(`/org/departments/${id}`, { method: 'DELETE' }),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['departments', variables.organizationId] });
        },
    });
};

// Position Hooks
export const usePositions = (orgId: string, page = 0, size = 50) => {
    const apiFetch = useApi();
    return useQuery<PageResponse<Position>>({
        queryKey: ['positions', orgId, page, size],
        queryFn: () => apiFetch(`/org/orgs/${orgId}/positions?page=${page}&size=${size}`),
        enabled: !!orgId,
    });
};

export const useCreatePosition = () => {
    const apiFetch = useApi();
    const queryClient = useQueryClient();
    return useMutation<Position, Error, { organizationId: string; title: string; category: string; description?: string }>({
        mutationFn: (data) => apiFetch('/org/positions', { method: 'POST', body: JSON.stringify(data) }),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['positions', variables.organizationId] });
        },
    });
};

export interface OrganizationSettingsDto {
    organizationId: string;
    leavePolicyDaysPerYear: number;
    leavePolicyMaxCarryOver: number;
    payrollCnssRate?: number;
    payrollAmoRate?: number;
    payrollIrProgressiveScale?: string;
    payrollTemplateLogoUrl?: string;
    payrollTemplateLegalMentions?: string;
}

export const useOrganizationSettings = (orgId: string) => {
    const apiFetch = useApi();
    return useQuery<OrganizationSettingsDto>({
        queryKey: ['organization-settings', orgId],
        queryFn: () => apiFetch(`/org/orgs/${orgId}/settings`),
        enabled: !!orgId,
    });
};

export const useUpdateOrganizationSettings = () => {
    const apiFetch = useApi();
    const queryClient = useQueryClient();
    return useMutation<OrganizationSettingsDto, Error, { orgId: string; data: Partial<OrganizationSettingsDto> }>({
        mutationFn: ({ orgId, data }) =>
            apiFetch(`/org/orgs/${orgId}/settings`, { method: 'PUT', body: JSON.stringify(data) }),
        onSuccess: (_, v) => {
            queryClient.invalidateQueries({ queryKey: ['organization-settings', v.orgId] });
        },
    });
};

export interface OrgDashboardDto {
    activeDepartmentsCount: number;
    activePositionsCount: number;
    employeeCount: number;
    rhManagerCount: number;
}

export const useOrgDashboard = (orgId: string) => {
    const apiFetch = useApi();
    return useQuery<OrgDashboardDto>({
        queryKey: ['org-dashboard', orgId],
        queryFn: () => apiFetch(`/org/orgs/${orgId}/dashboard`),
        enabled: !!orgId,
    });
};

export const useDeletePosition = () => {
    const apiFetch = useApi();
    const queryClient = useQueryClient();
    return useMutation<void, Error, { id: string; organizationId: string }>({
        mutationFn: ({ id }) => apiFetch(`/org/positions/${id}`, { method: 'DELETE' }),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['positions', variables.organizationId] });
        },
    });
};
