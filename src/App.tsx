
import React, { useEffect, useState, lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./components/ThemeToggler";
import { initializePWA } from "./utils/pwaUtils";
import EnhancedErrorBoundary from "./components/error/EnhancedErrorBoundary";
import RoleProtectedRoute from "./components/auth/RoleProtectedRoute";
import { NetworkStatusListener } from "./hooks/useNetwork";
import NetworkStatus from "./components/layout/NetworkStatus";

// Pages with no lazy loading to prevent flashing
import MainLayout from "./components/layout/MainLayout";

// Lazy load pages with better chunk naming and error handling
const Home = lazy(() => import(/* webpackChunkName: "home-page" */ "./pages/Home"));
const ExpiringPPE = lazy(() => import(/* webpackChunkName: "expiring-ppe-page" */ "./pages/ExpiringPPE"));
const UpcomingInspections = lazy(() => import(/* webpackChunkName: "upcoming-inspections-page" */ "./pages/UpcomingInspections"));
const Equipment = lazy(() => import(/* webpackChunkName: "equipment-page" */ "./pages/Equipment"));
const Analytics = lazy(() => import(/* webpackChunkName: "analytics-page" */ "./pages/Analytics"));
const Settings = lazy(() => import(/* webpackChunkName: "settings-page" */ "./pages/Settings"));
const Profile = lazy(() => import(/* webpackChunkName: "profile-page" */ "./pages/Profile"));
const Login = lazy(() => import(/* webpackChunkName: "login-page" */ "./pages/Login"));
const NotFound = lazy(() => import(/* webpackChunkName: "not-found-page" */ "./pages/NotFound"));
const RegisterPage = lazy(() => import(/* webpackChunkName: "register-page" */ "./pages/Register"));
const ForgotPasswordPage = lazy(() => import(/* webpackChunkName: "forgot-password-page" */ "./pages/ForgotPassword"));
const ResetPasswordPage = lazy(() => import(/* webpackChunkName: "reset-password-page" */ "./pages/ResetPassword"));
const EditProfile = lazy(() => import(/* webpackChunkName: "edit-profile-page" */ "./pages/EditProfile"));
const InspectionForm = lazy(() => import(/* webpackChunkName: "inspection-form-page" */ "./pages/InspectionForm"));
const ReportsPage = lazy(() => import(/* webpackChunkName: "reports-page" */ "./pages/Reports"));
const StartInspection = lazy(() => import(/* webpackChunkName: "start-inspection-page" */ "./pages/StartInspection"));
const ManualInspection = lazy(() => import(/* webpackChunkName: "manual-inspection-page" */ "./pages/ManualInspection"));
const FlaggedIssues = lazy(() => import(/* webpackChunkName: "flagged-issues-page" */ "./pages/FlaggedIssues"));
const InspectionDetails = lazy(() => import(/* webpackChunkName: "inspection-details-page" */ "./pages/InspectionDetails"));

// Loading component for Suspense with better UI
const PageLoader = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-background">
    <div className="flex flex-col items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-2"></div>
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  </div>
);

// Configure React Query with improved settings and error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  // Set up PWA features
  useEffect(() => {
    const setupPWA = async () => {
      try {
        // Use enhanced PWA initialization with timeout
        await initializePWA();
      } catch (error) {
        console.error('Error setting up PWA:', error);
      } finally {
        // Ensure loading state is cleared after max 3 seconds if initialization hangs
        const fallbackTimer = setTimeout(() => {
          if (isLoading) {
            console.warn('Forcing app to load after timeout');
            setIsLoading(false);
          }
        }, 3000);
        
        // Normal finish loading
        setIsLoading(false);
        
        // Clear the fallback timer if we loaded normally
        return () => clearTimeout(fallbackTimer);
      }
    };
    
    setupPWA();
  }, [isLoading]);

  if (isLoading) {
    return <PageLoader />;
  }

  // Handle global errors and provide detailed reporting
  const handleGlobalError = (error: Error, info: React.ErrorInfo) => {
    console.error('Global error caught:', error);
    console.error('Component stack:', info.componentStack);
    
    // Here you could add reporting to an error tracking service
    // reportToErrorService(error, info);
  };

  return (
    <EnhancedErrorBoundary onError={handleGlobalError} component="AppRoot">
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <TooltipProvider>
              <AuthProvider>
                {/* Add NetworkStatusListener to monitor online/offline status */}
                <NetworkStatusListener />
                <NetworkStatus />
                <Toaster />
                <Sonner />
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                    
                    <Route path="/" element={<MainLayout />}>
                      <Route index element={<Home />} />
                      <Route path="expiring" element={<ExpiringPPE />} />
                      <Route path="upcoming" element={<UpcomingInspections />} />
                      <Route path="equipment" element={<Equipment />} />
                      <Route path="flagged" element={<FlaggedIssues />} />
                      <Route path="settings" element={<Settings />} />
                      <Route path="profile" element={<Profile />} />
                      <Route path="edit-profile" element={<EditProfile />} />
                      <Route path="start-inspection" element={<StartInspection />} />
                      <Route path="inspect/new" element={<ManualInspection />} />
                      {/* Ensure this path exactly matches our navigation calls */}
                      <Route path="inspect/:ppeId" element={<InspectionForm />} />
                      <Route path="inspection/:id" element={<InspectionDetails />} />
                      <Route path="analytics" element={<Analytics />} />
                      
                      {/* Update reports route to be accessible by all authenticated users */}
                      <Route path="reports" element={
                        <RoleProtectedRoute requiredRole="user" fallbackPath="access-denied">
                          <ReportsPage />
                        </RoleProtectedRoute>
                      } />
                      
                      {/* Admin-only deletion routes */}
                      <Route path="admin/delete/:type/:id" element={
                        <RoleProtectedRoute requiredRole="admin" fallbackPath="access-denied">
                          <ReportsPage />
                        </RoleProtectedRoute>
                      } />
                      
                      {/* Allow all other paths - let layout handle unauthorized access */}
                      <Route path="*" element={<NotFound />} />
                    </Route>
                  </Routes>
                </Suspense>
              </AuthProvider>
            </TooltipProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </EnhancedErrorBoundary>
  );
};

export default App;
