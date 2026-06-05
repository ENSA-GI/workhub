import { useApi } from './useApi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface OrganizationSettings {
    leavePolicyDaysPerYear?: number;
    leavePolicyMaxCarryOver?: number;
    payrollCnssRate?: number;
    payrollAmoRate?: number;
    payrollIrProgressiveScale?: boolean;
    payrollTemplateLogoUrl?: string;
    payrollTemplateLegalMentions?: string;
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

export const useOrganizationSettings = (orgId: string) => {
    const apiFetch = useApi();
    return useQuery<OrganizationSettings>({
        queryKey: ['organization-settings', orgId],
        queryFn: () => apiFetch(`/org/orgs/${orgId}/settings`),
        enabled: !!orgId,
    });
};

export const useUpdateOrganizationSettings = () => {
    const apiFetch = useApi();
    const queryClient = useQueryClient();
    return useMutation<OrganizationSettings, Error, { id: string; data: Partial<OrganizationSettings> }>({
        mutationFn: ({ id, data }) => apiFetch(`/org/orgs/${id}/settings`, { method: 'PUT', body: JSON.stringify(data) }),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['organization-settings', variables.id] });
            queryClient.invalidateQueries({ queryKey: ['organization', variables.id] });
        },
    });
};

// Department Hooks
export const useDepartments = (orgId: string, page = 0, size = 50, active?: boolean) => {
    const apiFetch = useApi();
    const activeQuery = active === undefined ? '' : `&active=${active}`;
    return useQuery<PageResponse<Department>>({
        queryKey: ['departments', orgId, page, size, active],
        queryFn: () => apiFetch(`/org/orgs/${orgId}/departments?page=${page}&size=${size}${activeQuery}`),
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
            queryClient.invalidateQueries({ queryKey: ['departments'] });
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
            queryClient.invalidateQueries({ queryKey: ['departments'] });
        },
    });
};

// Position Hooks
export const usePositions = (orgId: string, page = 0, size = 50, active?: boolean) => {
    const apiFetch = useApi();
    const activeQuery = active === undefined ? '' : `&active=${active}`;
    return useQuery<PageResponse<Position>>({
        queryKey: ['positions', orgId, page, size, active],
        queryFn: () => apiFetch(`/org/orgs/${orgId}/positions?page=${page}&size=${size}${activeQuery}`),
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
            queryClient.invalidateQueries({ queryKey: ['positions'] });
        },
    });
};

export const useDeletePosition = () => {
    const apiFetch = useApi();
    const queryClient = useQueryClient();
    return useMutation<void, Error, { id: string; organizationId: string }>({
        mutationFn: ({ id }) => apiFetch(`/org/positions/${id}`, { method: 'DELETE' }),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['positions', variables.organizationId] });
            queryClient.invalidateQueries({ queryKey: ['positions'] });
        },
    });
};

// ==================================================
// Public registration (organization + admin)
// ==================================================

export interface RegisterOrganizationRequest {
    name: string;
    legalName: string;
    city?: string;
    industry?: string;
    country?: string;
    adminEmail: string;
    adminPassword: string;
    adminFirstName?: string;
    adminLastName?: string;
    adminPhone?: string;
}

export interface RegisterOrganizationResponse {
    organizationId: string;
    userId: string;
    message: string;
}

export const useRegisterOrganization = () => {
    const apiFetch = useApi();

    return useMutation<RegisterOrganizationResponse, Error, RegisterOrganizationRequest>({
        mutationFn: (data) => apiFetch('/org/orgs/register', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
    });
};
