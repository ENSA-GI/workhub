import { useEffect, useState, useCallback } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Login from "./components/auth/Login";
import MfaVerify from "./components/auth/MfaVerify";
import ForgotPassword from "./components/auth/ForgotPassword";
import ResetPassword from "./components/auth/ResetPassword";
import ActivateAccount from "./components/auth/ActivateAccount";
import ProfilePage from "./components/auth/ProfilePage";

import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import EmployeesEnhanced from "./components/EmployeesEnhanced";
import PayrollEnhanced from "./components/PayrollEnhanced";
import LeaveManagementEnhanced from "./components/LeaveManagementEnhanced";
import RecruitmentEnhanced from "./components/RecruitmentEnhanced";
import LandingPage from "./components/LandingPage";
import ManagerSpace from "./components/spaces/ManagerSpace";
import RecruiterSpace from "./components/spaces/RecruiterSpace";
import DashboardSuperAdmin from "./components/spaces/super-admin/DashboardSuperAdmin";
import OrganizationsView from "./components/spaces/super-admin/OrganizationsView";
import SystemMonitoringDashboard from "./components/spaces/super-admin/SystemMonitoringDashboard";
import SystemLogs from "./components/spaces/super-admin/SystemLogs";
import Subscriptions from "./components/spaces/super-admin/Subscriptions";
import SupportIncidents from "./components/spaces/super-admin/SupportIncidents";
import PlatformConfig from "./components/spaces/super-admin/PlatformConfig";
import DashboardOrgAdmin from "./components/spaces/org-admin/DashboardOrgAdmin";
import AnalyticsOrgAdmin from "./components/spaces/org-admin/AnalyticsOrgAdmin";
import RHUsersManagement from "./components/spaces/org-admin/RHUsersManagement";
import ConfigurationOrg from "./components/spaces/org-admin/ConfigurationOrg";
import AuditHistory from "./components/spaces/org-admin/AuditHistory";
import ExportData from "./components/spaces/org-admin/ExportData";
import PayrollAnalytics from "./components/spaces/org-admin/PayrollAnalytics";
import CongesAnalytics from "./components/spaces/org-admin/CongesAnalytics";
import RecruitmentAnalytics from "./components/spaces/org-admin/RecruitmentAnalytics";
import EmployeesView from "./components/spaces/org-admin/EmployeesView";
import DashboardRHManager from "./components/spaces/rh-manager/DashboardRHManager";
import AnalyticsRHManager from "./components/spaces/rh-manager/AnalyticsRHManager";
import PayrollGeneration from "./components/spaces/rh-manager/PayrollGeneration";
import PayslipsManagement from "./components/spaces/rh-manager/PayslipsManagement";
import PayrollHistory from "./components/spaces/rh-manager/PayrollHistory";
import PayrollSettings from "./components/spaces/org-admin/PayrollSettings";
import DashboardEmployee from "./components/spaces/employee/DashboardEmployee";
import MonProfilEmployee from "./components/spaces/employee/MonProfilEmployee";
import MesBulletins from "./components/spaces/employee/MesBulletins";
import MesCongesEmployee from "./components/spaces/employee/MesCongesEmployee";
import MesDocuments from "./components/spaces/employee/MesDocuments";
import NotificationsEmployee from "./components/spaces/employee/NotificationsEmployee";
import OffresPubliques from "./components/spaces/candidate/OffresPubliques";
import MesCandidatures from "./components/spaces/candidate/MesCandidatures";
import MonProfilCandidat from "./components/spaces/candidate/MonProfilCandidat";
import MesDocumentsCandidat from "./components/spaces/candidate/MesDocumentsCandidat";
import NotificationsCandidat from "./components/spaces/candidate/NotificationsCandidat";
import EmployeesListRH from "./components/spaces/rh-manager/EmployeesListRH";
import PayrollDetailAdjustments from "./components/spaces/rh-manager/PayrollDetailAdjustments";

import { clearAuthSession, touchActivity } from "@/lib/identityApi";
import { useSessionTimeout } from "@/lib/useSessionTimeout";

const STORAGE_KEY = "workhub.selectedRole";

function getRoleFromToken(tokenStr: string | null) {
    if (!tokenStr) return null;
    try {
        const payload = JSON.parse(atob(tokenStr.split(".")[1]));
        const role = payload.role;
        if (role === "SUPER_ADMIN") return "super-admin";
        if (role === "ORG_ADMIN") return "org-admin";
        if (role === "RH_MANAGER") return "rh-manager";
        if (role === "EMPLOYEE") return "employee";
        if (role === "CANDIDATE") return "candidate";
        return null;
    } catch {
        return null;
    }
}

const PUBLIC_PATHS = ["/forgot-password", "/reset-password", "/activate"];

function AppRoutes() {
    const location = useLocation();
    const isPublicAuthRoute = PUBLIC_PATHS.some((p) => location.pathname.startsWith(p));

    const [rawSelectedRole, setSelectedRole] = useState<string | null>(() =>
        localStorage.getItem(STORAGE_KEY)
    );
    const [token, setToken] = useState<string | null>(() =>
        localStorage.getItem("workhub.token")
    );
    const [mfaSessionToken, setMfaSessionToken] = useState<string | null>(null);

    useEffect(() => {
        if (rawSelectedRole) localStorage.setItem(STORAGE_KEY, rawSelectedRole);
        else localStorage.removeItem(STORAGE_KEY);

        if (token) {
            localStorage.setItem("workhub.token", token);
            touchActivity();
        } else {
            localStorage.removeItem("workhub.token");
        }
    }, [rawSelectedRole, token]);

    const handleLogout = useCallback(() => {
        clearAuthSession();
        setToken(null);
        setMfaSessionToken(null);
    }, []);

    useSessionTimeout(handleLogout);

    const handleSelectRole = (role: string) => setSelectedRole(role);

    const handleBackToHome = () => {
        clearAuthSession();
        setSelectedRole(null);
        setToken(null);
        setMfaSessionToken(null);
    };

    const handleLoginSuccess = (newToken: string) => {
        setToken(newToken);
        const role = getRoleFromToken(newToken);
        if (role) setSelectedRole(role);
    };

    const activeRole = token ? (getRoleFromToken(token) || rawSelectedRole) : null;
    const selectedRole = activeRole;

    if (isPublicAuthRoute) {
        return (
            <Routes>
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/activate" element={<ActivateAccount />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        );
    }

    if (!selectedRole) {
        return <LandingPage onSelectRole={handleSelectRole} />;
    }

    if (mfaSessionToken) {
        return (
            <MfaVerify
                mfaSessionToken={mfaSessionToken}
                onSuccess={handleLoginSuccess}
                onCancel={() => setMfaSessionToken(null)}
            />
        );
    }

    if (!token) {
        return (
            <Login
                onLoginSuccess={(newToken) => handleLoginSuccess(newToken)}
                onMfaRequired={setMfaSessionToken}
            />
        );
    }

    const profileRoute = (
        <Route path="/profile" element={<ProfilePage onLogout={handleBackToHome} />} />
    );

    return (
        <>
            {selectedRole === "candidate" && (
                <Layout userRole={selectedRole} onBackToHome={handleBackToHome}>
                    <Routes>
                        <Route path="/" element={<OffresPubliques />} />
                        <Route path="/candidatures" element={<MesCandidatures />} />
                        <Route path="/profil" element={<MonProfilCandidat />} />
                        <Route path="/documents" element={<MesDocumentsCandidat />} />
                        <Route path="/notifications" element={<NotificationsCandidat />} />
                        {profileRoute}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Layout>
            )}

            {selectedRole === "employee" && (
                <Layout userRole={selectedRole} onBackToHome={handleBackToHome}>
                    <Routes>
                        <Route path="/" element={<DashboardEmployee />} />
                        <Route path="/profil" element={<MonProfilEmployee />} />
                        <Route path="/bulletins" element={<MesBulletins />} />
                        <Route path="/conges" element={<MesCongesEmployee />} />
                        <Route path="/documents" element={<MesDocuments />} />
                        <Route path="/notifications" element={<NotificationsEmployee />} />
                        {profileRoute}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Layout>
            )}

            {selectedRole === "manager" && (
                <Layout userRole={selectedRole} onBackToHome={handleBackToHome}>
                    <Routes>
                        <Route path="/" element={<ManagerSpace />} />
                        <Route path="/leave" element={<LeaveManagementEnhanced />} />
                        {profileRoute}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Layout>
            )}

            {selectedRole === "recruiter" && (
                <Layout userRole={selectedRole} onBackToHome={handleBackToHome} isSimpleLayout>
                    <Routes>
                        <Route path="/" element={<RecruiterSpace />} />
                        {profileRoute}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Layout>
            )}

            {selectedRole === "org-admin" && (
                <Layout userRole={selectedRole} onBackToHome={handleBackToHome}>
                    <Routes>
                        <Route path="/" element={<DashboardOrgAdmin />} />
                        <Route path="/employees" element={<EmployeesView />} />
                        <Route path="/payroll" element={<PayrollAnalytics />} />
                        <Route path="/payroll-settings" element={<PayrollSettings />} />
                        <Route path="/leave" element={<CongesAnalytics />} />
                        <Route path="/recruitment" element={<RecruitmentAnalytics />} />
                        <Route path="/analytics" element={<AnalyticsOrgAdmin />} />
                        <Route path="/rh-users" element={<RHUsersManagement />} />
                        <Route path="/config" element={<ConfigurationOrg />} />
                        <Route path="/audit" element={<AuditHistory />} />
                        <Route path="/export" element={<ExportData />} />
                        {profileRoute}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Layout>
            )}

            {selectedRole === "rh-manager" && (
                <Layout userRole={selectedRole} onBackToHome={handleBackToHome}>
                    <Routes>
                        <Route path="/" element={<DashboardRHManager />} />
                        <Route path="/employees" element={<EmployeesListRH />} />
                        <Route path="/payroll" element={<PayrollEnhanced />} />
                        <Route path="/payroll-generation" element={<PayrollGeneration />} />
                        <Route path="/payroll-bulletins" element={<PayslipsManagement />} />
                        <Route path="/payroll-details" element={<PayrollDetailAdjustments />} />
                        <Route path="/payroll-history" element={<PayrollHistory />} />
                        <Route path="/leave" element={<LeaveManagementEnhanced userRole="rh-manager" />} />
                        <Route path="/recruitment" element={<RecruitmentEnhanced />} />
                        <Route path="/analytics" element={<AnalyticsRHManager />} />
                        {profileRoute}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Layout>
            )}

            {selectedRole === "super-admin" && (
                <Layout userRole={selectedRole} onBackToHome={handleBackToHome}>
                    <Routes>
                        <Route path="/" element={<DashboardSuperAdmin />} />
                        <Route path="/organizations" element={<OrganizationsView />} />
                        <Route path="/subscriptions" element={<Subscriptions />} />
                        <Route path="/monitoring" element={<SystemMonitoringDashboard />} />
                        <Route path="/logs" element={<SystemLogs />} />
                        <Route path="/support" element={<SupportIncidents />} />
                        <Route path="/config" element={<PlatformConfig />} />
                        {profileRoute}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Layout>
            )}

            {!["candidate", "employee", "manager", "recruiter", "org-admin", "rh-manager", "super-admin"].includes(selectedRole) && (
                <Layout userRole={selectedRole} onBackToHome={handleBackToHome}>
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/employees" element={<EmployeesEnhanced />} />
                        <Route path="/payroll" element={<PayrollEnhanced />} />
                        <Route path="/leave" element={<LeaveManagementEnhanced />} />
                        <Route path="/recruitment" element={<RecruitmentEnhanced />} />
                        {profileRoute}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Layout>
            )}
        </>
    );
}

export default function App() {
    return <AppRoutes />;
}
