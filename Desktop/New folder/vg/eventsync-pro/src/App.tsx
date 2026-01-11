import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminEvents from "./pages/admin/Events";
import AdminPortfolio from "./pages/admin/Portfolio";
import AdminReviews from "./pages/admin/Reviews";
import AdminOrganizers from "./pages/admin/Organizers";
import AdminGuests from "./pages/admin/Guests";
import AdminFinancials from "./pages/admin/Financials";

// Organizer Pages
import OrganizerDashboard from "./pages/organizer/Dashboard";
import OrganizerCheckIn from "./pages/organizer/CheckIn";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/events"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminEvents />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/portfolio"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminPortfolio />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reviews"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminReviews />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/organizers"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminOrganizers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/guests"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminGuests />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/financials"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminFinancials />
                </ProtectedRoute>
              }
            />

            {/* Organizer Routes */}
            <Route
              path="/organizer"
              element={
                <ProtectedRoute allowedRoles={['organizer']}>
                  <OrganizerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizer/check-in"
              element={
                <ProtectedRoute allowedRoles={['organizer']}>
                  <OrganizerCheckIn />
                </ProtectedRoute>
              }
            />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
