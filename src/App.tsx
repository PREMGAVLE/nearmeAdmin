import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { RoleGuard, AuthRedirect } from "@/components/RoleGuard";
import DashboardLayout from "@/components/DashboardLayout";
import LoginPage from "@/pages/LoginPage";
import NotFound from "./pages/NotFound";

// Super Admin pages
import SuperAdminDashboard from "@/pages/super-admin/Dashboard";
import AllBusinessesSA from "@/pages/super-admin/AllBusinesses";
import AdminManagement from "@/pages/super-admin/AdminManagement";
import SalesmenManagement from "@/pages/super-admin/SalesmenManagement";
import UserManagement from "@/pages/super-admin/UserManagement";
import PaymentsSA from "@/pages/super-admin/Payments";
import PremiumRequests from "@/pages/super-admin/PremiumRequests";
import SettingsPage from "@/pages/super-admin/Settings";

// Admin pages
import AdminDashboard from "@/pages/admin/Dashboard";
import PendingApprovals from "@/pages/admin/PendingApprovals";

// Salesman pages
import SalesmanDashboard from "@/pages/salesman/Dashboard";
import AddBusiness from "@/pages/salesman/AddBusiness";
import MyBusinesses from "@/pages/salesman/MyBusinesses";
import SalesmanPerformance from "@/pages/salesman/Performance";

// Shared pages
import CategoriesPage from "@/pages/shared/Categories";
import ReportsPage from "@/pages/shared/Reports";
import LeadsPage from "@/pages/shared/Leads";
import BookingsPage from "@/pages/shared/Bookings";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30000,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<AuthRedirect><LoginPage /></AuthRedirect>} />

            {/* Super Admin Routes */}
            <Route element={<RoleGuard allowedRoles={['super_admin']}><DashboardLayout /></RoleGuard>}>
              <Route path="/super-admin/dashboard" element={<SuperAdminDashboard />} />
              <Route path="/super-admin/businesses" element={<AllBusinessesSA />} />
              <Route path="/super-admin/users" element={<UserManagement />} />
              <Route path="/super-admin/admins" element={<AdminManagement />} />
              <Route path="/super-admin/salesmen" element={<SalesmenManagement />} />
              <Route path="/super-admin/payments" element={<PaymentsSA />} />
              <Route path="/super-admin/premium-requests" element={<PremiumRequests />} />
              <Route path="/super-admin/categories" element={<CategoriesPage />} />
              <Route path="/super-admin/reports" element={<ReportsPage />} />
              <Route path="/super-admin/leads" element={<LeadsPage />} />
              <Route path="/super-admin/bookings" element={<BookingsPage />} />
              <Route path="/super-admin/settings" element={<SettingsPage />} />
            </Route>

            {/* Admin Routes */}
            <Route element={<RoleGuard allowedRoles={['admin']}><DashboardLayout /></RoleGuard>}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/approvals" element={<PendingApprovals />} />
              <Route path="/admin/businesses" element={<AllBusinessesSA />} />
              <Route path="/admin/payments" element={<PaymentsSA />} />
              <Route path="/admin/premium-requests" element={<PremiumRequests />} />
              <Route path="/admin/categories" element={<CategoriesPage />} />
              <Route path="/admin/reports" element={<ReportsPage />} />
              <Route path="/admin/leads" element={<LeadsPage />} />
              <Route path="/admin/bookings" element={<BookingsPage />} />
            </Route>

            {/* Salesman Routes */}
            <Route element={<RoleGuard allowedRoles={['salesman']}><DashboardLayout /></RoleGuard>}>
              <Route path="/salesman/dashboard" element={<SalesmanDashboard />} />
              <Route path="/salesman/add-business" element={<AddBusiness />} />
              <Route path="/salesman/businesses" element={<MyBusinesses />} />
              <Route path="/salesman/performance" element={<SalesmanPerformance />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
