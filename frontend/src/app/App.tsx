import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";

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

//  RH Manager Employees (nouvelle page)
import EmployeesListRH from "./components/spaces/rh-manager/EmployeesListRH";
import PayrollDetailAdjustments from "./components/spaces/rh-manager/PayrollDetailAdjustments";

const STORAGE_KEY = "workhub.selectedRole";

export default function App() {
    // PERSISTENCE : récupère le rôle depuis localStorage au refresh / redirect Clerk
    const [selectedRole, setSelectedRole] = useState<string | null>(() => {
        return localStorage.getItem(STORAGE_KEY);
    });

    const [token, setToken] = useState<string | null>(() => {
        return localStorage.getItem("workhub.token");
    });

    // PERSISTENCE : sauvegarde/supprime dans localStorage
    useEffect(() => {
        if (selectedRole) localStorage.setItem(STORAGE_KEY, selectedRole);
        else localStorage.removeItem(STORAGE_KEY);
        
        if (token) localStorage.setItem("workhub.token", token);
        else localStorage.removeItem("workhub.token");
    }, [selectedRole, token]);

    const handleSelectRole = (role: string) => setSelectedRole(role);

    const handleBackToHome = () => {
        setSelectedRole(null);
        setToken(null);
    };

    const handleLoginSuccess = (newToken: string, user: any) => {
        setToken(newToken);
        // Note: we can read role from user.role or JWT. 
        // Here we just keep selectedRole as what they chose on LandingPage.
    };

    // landing publique
    if (!selectedRole) {
        return <LandingPage onSelectRole={handleSelectRole} />;
    }

    return (
        <>
            {!token ? (
                <Login onLoginSuccess={handleLoginSuccess} />
            ) : (
                <>
                    {/* Candidate */}
                    {selectedRole === "candidate" && (
                        <Layout userRole={selectedRole} onBackToHome={handleBackToHome}>
                        <Routes>
                            <Route path="/" element={<OffresPubliques />} />
                            <Route path="/candidatures" element={<MesCandidatures />} />
                            <Route path="/profil" element={<MonProfilCandidat />} />
                            <Route path="/documents" element={<MesDocumentsCandidat />} />
                            <Route path="/notifications" element={<NotificationsCandidat />} />
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </Layout>
                )}

                {/* Employee */}
                {selectedRole === "employee" && (
                    <Layout userRole={selectedRole} onBackToHome={handleBackToHome}>
                        <Routes>
                            <Route path="/" element={<DashboardEmployee />} />
                            <Route path="/profil" element={<MonProfilEmployee />} />
                            <Route path="/bulletins" element={<MesBulletins />} />
                            <Route path="/conges" element={<MesCongesEmployee />} />
                            <Route path="/documents" element={<MesDocuments />} />
                            <Route path="/notifications" element={<NotificationsEmployee />} />
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </Layout>
                )}

                {/* Manager */}
                {selectedRole === "manager" && (
                    <Layout userRole={selectedRole} onBackToHome={handleBackToHome}>
                        <Routes>
                            <Route path="/" element={<ManagerSpace />} />
                            <Route path="/leave" element={<LeaveManagementEnhanced />} />
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </Layout>
                )}

                {/* Recruiter */}
                {selectedRole === "recruiter" && (
                    <Layout userRole={selectedRole} onBackToHome={handleBackToHome} isSimpleLayout>
                        <Routes>
                            <Route path="/" element={<RecruiterSpace />} />
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </Layout>
                )}

                {/* Org admin */}
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
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </Layout>
                )}

                {/* RH manager */}
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
                             <Route path="*" element={<Navigate to="/" replace />} />
                         </Routes>
                    </Layout>
                )}

                {/* Super admin */}
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
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </Layout>
                )}

                {/* fallback */}
                {!["candidate", "employee", "manager", "recruiter", "org-admin", "rh-manager", "super-admin"].includes(selectedRole) && (
                    <Layout userRole={selectedRole} onBackToHome={handleBackToHome}>
                        <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/employees" element={<EmployeesEnhanced />} />
                            <Route path="/payroll" element={<PayrollEnhanced />} />
                            <Route path="/leave" element={<LeaveManagementEnhanced />} />
                            <Route path="/recruitment" element={<RecruitmentEnhanced />} />
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </Layout>
                )}
                </>
            )}
        </>
    );
}