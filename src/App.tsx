import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { DemoProvider } from "@/contexts/DemoContext";
import { PropertyProvider } from "@/contexts/PropertyContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { HashScroll } from "@/components/SiteHeader";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { HomePage } from "@/pages/marketing/HomePage";
import { PrivacyPage, TermsPage } from "@/pages/legal/LegalPages";
import {
  AfterLoginPage,
  ForgotPasswordPage,
  LoginPage,
  PendingApprovalPage,
  ResetPasswordPage,
  SuperAdminLoginPage,
  VerifyOtpPage,
} from "@/pages/auth/AuthPages";
import { PropertyPage } from "@/pages/public/PropertyPage";
import { GuestGuidePage } from "@/pages/public/GuestGuidePage";
import { DashboardPage } from "@/pages/admin/DashboardPage";
import { CmsPage } from "@/pages/admin/CmsPage";
import { MessagesPage } from "@/pages/admin/MessagesPage";
import { GalleryPage } from "@/pages/admin/GalleryPage";
import { CalendarPage } from "@/pages/admin/CalendarPage";
import { ExpensesPage, IncomePage } from "@/pages/admin/LedgerPages";
import { TemplatesPage } from "@/pages/admin/TemplatesPage";
import { SettingsPage } from "@/pages/admin/SettingsPage";
import { SupportPage, UpgradePage } from "@/pages/admin/SupportUpgradePages";
import { OnboardingPage } from "@/pages/admin/OnboardingPage";
import { SuperAdminDashboard } from "@/pages/super-admin/SuperAdminPages";
import { DemoGuidePage, DemoLandingPage, DemoPropertyPage } from "@/pages/demo/DemoPages";

function AdminTree() {
  return (
    <PropertyProvider>
      <Routes>
        <Route element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="cms" element={<CmsPage />} />
          <Route path="messages" element={<MessagesPage />} />
          <Route path="gallery" element={<GalleryPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="income" element={<IncomePage />} />
          <Route path="expenses" element={<ExpensesPage />} />
          <Route path="templates" element={<TemplatesPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="support" element={<SupportPage />} />
          <Route path="upgrade" element={<UpgradePage />} />
        </Route>
      </Routes>
    </PropertyProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster richColors position="top-center" />
        <HashScroll />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<Navigate to="/#signup" replace />} />
          <Route path="/verify" element={<VerifyOtpPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/pending-approval" element={<PendingApprovalPage />} />
          <Route path="/after-login" element={<AfterLoginPage />} />
          <Route path="/upgrade" element={<Navigate to="/admin/upgrade" replace />} />
          <Route
            path="/admin/onboarding"
            element={
              <ProtectedRoute>
                <OnboardingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute>
                <DemoProvider>
                  <AdminTree />
                </DemoProvider>
              </ProtectedRoute>
            }
          />
          <Route path="/super-admin/login" element={<SuperAdminLoginPage />} />
          <Route
            path="/super-admin"
            element={
              <ProtectedRoute superAdmin>
                <SuperAdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/demo" element={<DemoLandingPage />} />
          <Route path="/demo/property" element={<DemoPropertyPage />} />
          <Route path="/demo/guide" element={<DemoGuidePage />} />
          <Route
            path="/demo/admin/*"
            element={
              <DemoProvider isDemo>
                <AdminTree />
              </DemoProvider>
            }
          />
          <Route path="/guide/:token" element={<GuestGuidePage />} />
          <Route path="/:slug" element={<PropertyPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
