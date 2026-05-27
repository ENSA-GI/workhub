import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApi } from './useApi';

export interface Payroll {
  id: string;
  organizationId: string;
  month: number;
  year: number;
  status: 'DRAFT' | 'VALIDATED' | 'PAID' | string;
  bankFileUrl?: string | null;
  totalGrossSalary?: number | string | null;
  totalNetSalary?: number | string | null;
  totalCnss?: number | string | null;
  totalAmo?: number | string | null;
  totalIr?: number | string | null;
  generatedAt?: string;
  generatedBy?: string;
  validatedAt?: string | null;
  validatedBy?: string | null;
}

export interface PayrollItem {
  id: string;
  payroll?: {
    id: string;
    month: number;
    year: number;
    status?: string;
  } | null;
  employeeId: string;
  baseSalary?: number | string | null;
  transportBonus?: number | string | null;
  mealBonus?: number | string | null;
  performanceBonus?: number | string | null;
  grossSalary?: number | string | null;
  cnssDeduction?: number | string | null;
  amoDeduction?: number | string | null;
  taxableIncome?: number | string | null;
  irDeduction?: number | string | null;
  netSalary?: number | string | null;
  bulletinPdfUrl?: string | null;
  isRead?: boolean;
  readAt?: string | null;
  adjustments?: {
    id: string;
    type: 'OVERTIME' | 'BONUS' | 'DEDUCTION' | string;
    amount: number | string;
    description?: string | null;
    createdAt?: string;
  }[];
}

export interface PayrollParameter {
  id: string;
  organizationId: string;
  cnssEmployeeRate?: number | string | null;
  amoEmployeeRate?: number | string | null;
  irBrackets?: string | null;
  childDeduction?: number | string | null;
  maxChildrenDeduction?: number | null;
  effectiveDate?: string | null;
  active?: boolean;
}

export interface PayrollBudget {
  id: string;
  organizationId: string;
  budgetYear: number;
  totalBudget: number | string;
}

export interface PayrollAnalyticsYtd {
  totalGrossYtd: number;
  totalNetYtd: number;
  totalSocialChargesYtd: number;
  averageCostPerEmployee: number;
}

export interface PayrollTrendPoint {
  month: string;
  gross: number;
  net: number;
  socialCharges: number;
}

export interface PayrollChargesDistribution {
  totalCnss: number;
  totalAmo: number;
  totalIr: number;
}

export interface PayrollDepartmentCost {
  departmentName: string;
  totalCost: number;
  employeeCount: number;
}

export interface PayrollBudgetUtilization {
  annualBudget: number;
  spentAmount: number;
  remainingAmount: number;
  utilizationPercentage: number;
}

export interface CreatePayrollRequest {
  organizationId: string;
  month: number;
  year: number;
  generatedBy: string;
}

const payrollBase = '/payroll/payrolls';

const asNumber = (value: number | string | null | undefined) => {
  if (value === null || value === undefined) return 0;
  return typeof value === 'number' ? value : Number(value);
};

export function usePayrolls(organizationId: string) {
  const apiFetch = useApi();
  return useQuery<Payroll[]>({
    queryKey: ['payrolls', organizationId],
    queryFn: () => apiFetch(`${payrollBase}?organizationId=${organizationId}`),
    enabled: !!organizationId,
  });
}

export function usePayrollById(payrollId: string) {
  const apiFetch = useApi();
  return useQuery<Payroll>({
    queryKey: ['payroll', payrollId],
    queryFn: () => apiFetch(`${payrollBase}/${payrollId}`),
    enabled: !!payrollId,
  });
}

export function usePayrollItems(payrollId: string) {
  const apiFetch = useApi();
  return useQuery<PayrollItem[]>({
    queryKey: ['payroll-items', payrollId],
    queryFn: () => apiFetch(`${payrollBase}/${payrollId}/items`),
    enabled: !!payrollId,
  });
}

export function useEmployeePayslips(employeeId: string) {
  const apiFetch = useApi();
  return useQuery<PayrollItem[]>({
    queryKey: ['employee-payslips', employeeId],
    queryFn: () => apiFetch(`${payrollBase}/employee/${employeeId}`),
    enabled: !!employeeId,
  });
}

export function usePayrollAnalyticsYtd(orgId: string, year: number) {
  const apiFetch = useApi();
  return useQuery<PayrollAnalyticsYtd>({
    queryKey: ['payroll-analytics-ytd', orgId, year],
    queryFn: () => apiFetch(`${payrollBase}/analytics/ytd?orgId=${orgId}&year=${year}`),
    enabled: !!orgId && !!year,
  });
}

export function usePayrollTrend(orgId: string, year: number) {
  const apiFetch = useApi();
  return useQuery<PayrollTrendPoint[]>({
    queryKey: ['payroll-trend', orgId, year],
    queryFn: () => apiFetch(`${payrollBase}/analytics/trend?orgId=${orgId}&year=${year}`),
    enabled: !!orgId && !!year,
  });
}

export function usePayrollCharges(orgId: string, year: number) {
  const apiFetch = useApi();
  return useQuery<PayrollChargesDistribution>({
    queryKey: ['payroll-charges', orgId, year],
    queryFn: () => apiFetch(`${payrollBase}/analytics/charges?orgId=${orgId}&year=${year}`),
    enabled: !!orgId && !!year,
  });
}

export function usePayrollDepartments(orgId: string, month: number, year: number) {
  const apiFetch = useApi();
  return useQuery<PayrollDepartmentCost[]>({
    queryKey: ['payroll-departments', orgId, month, year],
    queryFn: () => apiFetch(`${payrollBase}/analytics/by-department?orgId=${orgId}&month=${month}&year=${year}`),
    enabled: !!orgId && !!month && !!year,
  });
}

export function usePayrollBudgetUtilization(orgId: string, year: number) {
  const apiFetch = useApi();
  return useQuery<PayrollBudgetUtilization>({
    queryKey: ['payroll-budget-utilization', orgId, year],
    queryFn: () => apiFetch(`${payrollBase}/budget/utilization?orgId=${orgId}&year=${year}`),
    enabled: !!orgId && !!year,
  });
}

export function usePayrollConfig(orgId: string) {
  const apiFetch = useApi();
  return useQuery<PayrollParameter>({
    queryKey: ['payroll-config', orgId],
    queryFn: () => apiFetch(`${payrollBase}/config?orgId=${orgId}`),
    enabled: !!orgId,
  });
}

export function usePayrollBudget(orgId: string, year: number) {
  const apiFetch = useApi();
  return useQuery<PayrollBudget>({
    queryKey: ['payroll-budget', orgId, year],
    queryFn: () => apiFetch(`${payrollBase}/budget?orgId=${orgId}&year=${year}`),
    enabled: !!orgId && !!year,
  });
}

export function useGeneratePayroll() {
  const apiFetch = useApi();
  const queryClient = useQueryClient();

  return useMutation<Payroll, Error, CreatePayrollRequest>({
    mutationFn: (data) => apiFetch(payrollBase, { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['payrolls', variables.organizationId] });
      queryClient.invalidateQueries({ queryKey: ['payroll-analytics-ytd', variables.organizationId, variables.year] });
      queryClient.invalidateQueries({ queryKey: ['payroll-trend', variables.organizationId, variables.year] });
      queryClient.invalidateQueries({ queryKey: ['payroll-charges', variables.organizationId, variables.year] });
      queryClient.invalidateQueries({ queryKey: ['payroll-budget-utilization', variables.organizationId, variables.year] });
    },
  });
}

export function useUpdatePayrollStatus() {
  const apiFetch = useApi();
  const queryClient = useQueryClient();

  return useMutation<Payroll, Error, { payrollId: string; status: string; updatedBy: string }>({
    mutationFn: ({ payrollId, status, updatedBy }) =>
      apiFetch(`${payrollBase}/${payrollId}/status?status=${encodeURIComponent(status)}`, {
        method: 'PUT',
        headers: { 'X-User-Id': updatedBy },
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['payroll', variables.payrollId] });
      queryClient.invalidateQueries({ queryKey: ['payrolls'] });
    },
  });
}

export function usePayPayroll() {
  const apiFetch = useApi();
  const queryClient = useQueryClient();

  return useMutation<Payroll, Error, { payrollId: string; updatedBy: string }>({
    mutationFn: ({ payrollId, updatedBy }) =>
      apiFetch(`${payrollBase}/${payrollId}/pay`, {
        method: 'POST',
        headers: { 'X-User-Id': updatedBy },
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['payroll', variables.payrollId] });
      queryClient.invalidateQueries({ queryKey: ['payrolls'] });
    },
  });
}

export function useMarkPayslipAsRead() {
  const apiFetch = useApi();
  const queryClient = useQueryClient();

  return useMutation<void, Error, { itemId: string }>({
    mutationFn: ({ itemId }) => apiFetch(`${payrollBase}/items/${itemId}/read`, { method: 'PUT' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-payslips'] });
      queryClient.invalidateQueries({ queryKey: ['payroll-items'] });
    },
  });
}

export function useUpdatePayrollConfig() {
  const apiFetch = useApi();
  const queryClient = useQueryClient();

  return useMutation<PayrollParameter, Error, { orgId: string; data: PayrollParameter }>({
    mutationFn: ({ orgId, data }) => apiFetch(`${payrollBase}/config?orgId=${orgId}`, { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['payroll-config', variables.orgId] });
    },
  });
}

export function useSavePayrollBudget() {
  const apiFetch = useApi();
  const queryClient = useQueryClient();

  return useMutation<PayrollBudget, Error, { orgId: string; year: number; totalBudget: number }>({
    mutationFn: ({ orgId, year, totalBudget }) =>
      apiFetch(`${payrollBase}/budget?orgId=${orgId}&year=${year}&totalBudget=${totalBudget}`, { method: 'POST' }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['payroll-budget', variables.orgId, variables.year] });
      queryClient.invalidateQueries({ queryKey: ['payroll-budget-utilization', variables.orgId, variables.year] });
    },
  });
}

export function useAddPayrollAdjustment() {
  const apiFetch = useApi();
  const queryClient = useQueryClient();

  return useMutation<any, Error, { payrollItemId: string; type: string; amount: number; description?: string }>({
    mutationFn: ({ payrollItemId, type, amount, description }) =>
      apiFetch(`${payrollBase}/items/${payrollItemId}/adjustments`, {
        method: 'POST',
        body: JSON.stringify({ type, amount, description }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll-items'] });
      queryClient.invalidateQueries({ queryKey: ['payrolls'] });
    },
  });
}

export function useDeletePayrollAdjustment() {
  const apiFetch = useApi();
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (adjustmentId) =>
      apiFetch(`${payrollBase}/adjustments/${adjustmentId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll-items'] });
      queryClient.invalidateQueries({ queryKey: ['payrolls'] });
    },
  });
}

export function payrollValue(value: number | string | null | undefined) {
  return asNumber(value);
}

