import { useApi } from './useApi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserProfile } from './identityApi';

// Types
export interface Employee {
    id: string;
    organizationId: string;
    userId: string;
    cin: string;
    birthDate: string;
    birthPlace?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    personalPhone?: string;
    personalEmail: string;
    maritalStatus: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED';
    childrenCount: number;
    hireDate: string;
    contractType: 'CDI' | 'CDD' | 'STAGE' | 'FREELANCE';
    contractEndDate?: string;
    departmentId: string;
    positionId: string;
    category: 'CADRE' | 'AGENT_MAITRISE' | 'EMPLOYE' | 'STAGIAIRE';
    baseSalary: number;
    transportBonus: number;
    mealBonus: number;
    cnssNumber?: string;
    amoNumber?: string;
    bankName?: string;
    bankAccount?: string;
    status: 'ACTIVE' | 'ON_LEAVE' | 'ARCHIVED';
    createdAt: string;
    updatedAt: string;
}

export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

export interface CreateEmployeeRequest {
    organizationId: string;
    userId: string;
    cin: string;
    birthDate: string;
    personalEmail: string;
    hireDate: string;
    contractType: string;
    departmentId: string;
    positionId: string;
    category: string;
    baseSalary: number;

    maritalStatus?: string;
    childrenCount?: number;
    personalPhone?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    birthPlace?: string;

    contractEndDate?: string;

    transportBonus?: number;
    mealBonus?: number;

    cnssNumber?: string;
    amoNumber?: string;

    // ✅ AJOUTER (pour corriger ton erreur)
    bankName?: string;
    bankAccount?: string;
}

export interface UpdateEmployeeRequest {
    address?: string;
    city?: string;
    postalCode?: string;
    personalPhone?: string;
    personalEmail?: string;
    maritalStatus?: string;
    childrenCount?: number;
    departmentId?: string;
    positionId?: string;
    category?: string;
    baseSalary?: number;
    transportBonus?: number;
    mealBonus?: number;
    cnssNumber?: string;
    amoNumber?: string;
    bankName?: string;
    bankAccount?: string;
    changeReason?: string;
}

export interface ArchiveEmployeeRequest {
    departureReason: 'RESIGNATION' | 'TERMINATION' | 'END_OF_CONTRACT' | 'RETIREMENT' | 'DEATH';
    departureDate: string;
    comments?: string;
    finalSettlementAmount?: number;
}

// Hooks

export const useEmployees = (organizationId: string, page = 0, size = 20, status = 'ACTIVE') => {
    const apiFetch = useApi();

    return useQuery<PageResponse<Employee>>({
        queryKey: ['employees', organizationId, page, size, status],
        queryFn: () => apiFetch(`/employee/employees?organizationId=${organizationId}&status=${status}&page=${page}&size=${size}`),
        enabled: !!organizationId,
    });
};

export const useEmployeeById = (employeeId: string, organizationId: string) => {
    const apiFetch = useApi();

    return useQuery<Employee>({
        queryKey: ['employee', employeeId],
        queryFn: () => apiFetch(`/employee/employees/${employeeId}?organizationId=${organizationId}`),
        enabled: !!employeeId && !!organizationId,
    });
};

export const useSearchEmployees = (organizationId: string, query: string, page = 0, size = 20) => {
    const apiFetch = useApi();

    return useQuery<PageResponse<Employee>>({
        queryKey: ['employees-search', organizationId, query, page, size],
        queryFn: () => apiFetch(`/employee/employees/search?organizationId=${organizationId}&query=${encodeURIComponent(query)}&page=${page}&size=${size}`),
        enabled: !!organizationId && query.length > 0,
    });
};

export const useCreateEmployee = () => {
    const apiFetch = useApi();
    const queryClient = useQueryClient();

    return useMutation<Employee, Error, CreateEmployeeRequest>({
        mutationFn: (data) => apiFetch('/employee/employees', { method: 'POST', body: JSON.stringify(data) }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employees'] });
        },
    });
};

export const useUpdateEmployee = () => {
    const apiFetch = useApi();
    const queryClient = useQueryClient();

    return useMutation<Employee, Error, { id: string; organizationId: string; data: UpdateEmployeeRequest }>({
        mutationFn: ({ id, organizationId, data }) =>
            apiFetch(`/employee/employees/${id}?organizationId=${organizationId}`, { method: 'PUT', body: JSON.stringify(data) }),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            queryClient.invalidateQueries({ queryKey: ['employee', variables.id] });
        },
    });
};

export const useArchiveEmployee = () => {
    const apiFetch = useApi();
    const queryClient = useQueryClient();

    return useMutation<void, Error, { id: string; organizationId: string; data: ArchiveEmployeeRequest }>({
        mutationFn: ({ id, organizationId, data }) =>
            apiFetch(`/employee/employees/${id}/archive?organizationId=${organizationId}`, { method: 'POST', body: JSON.stringify(data) }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employees'] });
        },
    });
};

export const useUsers = (organizationId: string) => {
    const apiFetch = useApi();

    return useQuery<UserProfile[]>({
        queryKey: ['users', organizationId],
        queryFn: () => apiFetch(`/identity/api/users?organizationId=${organizationId}`),
        enabled: !!organizationId,
    });
};