
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState, lazy, Suspense } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./components/ThemeToggler";
import { setupPWAMetaTags, registerServiceWorker } from "./utils/pwaUtils";
import ErrorBoundaryWithFallback from "./components/ErrorBoundaryWithFallback";
import RoleProtectedRoute from "./components/auth/RoleProtectedRoute";

// Pages with no lazy loading to prevent flashing
import MainLayout from "./components/layout/MainLayout";

// Loading component for Suspense with better UI
const PageLoader = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-background">
    <div className="flex flex-col items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-2"></div>
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  </div>
);

// Improved error handler for lazy loading
const lazyLoad = (importFunc) => {
  const Component = lazy(importFunc);
  return (props) => (
    <ErrorBoundaryWithFallback>
      <Suspense fallback={<PageLoader />}>
        <Component {...props} />
      </Suspense>
    </ErrorBoundaryWithFallback>
  );
};

// Lazy load pages with better error handling
const Home = lazyLoad(() => import("./pages/Home"));
const ExpiringPPE = lazyLoad(() => import("./pages/ExpiringPPE"));
const UpcomingInspections = lazyLoad(() => import("./pages/UpcomingInspections"));
const Equipment = lazyLoad(() => import("./pages/Equipment"));
const Settings = lazyLoad(() => import("./pages/Settings"));
const Profile = lazyLoad(() => import("./pages/Profile"));
const Login = lazyLoad(() => import("./pages/Login"));
const NotFound = lazyLoad(() => import("./pages/NotFound"));
const RegisterPage = lazyLoad(() => import("./pages/Register"));
const ForgotPasswordPage = lazyLoad(() => import("./pages/ForgotPassword"));
const ResetPasswordPage = lazyLoad(() => import("./pages/ResetPassword"));
const EditProfile = lazyLoad(() => import("./pages/EditProfile"));
const InspectionForm = lazyLoad(() => import("./pages/InspectionForm"));
const ReportsPage = lazyLoad(() => import("./pages/Reports"));
const StartInspection = lazyLoad(() => import("./pages/StartInspection"));
const ManualInspection = lazyLoad(() => import("./pages/ManualInspection"));
const FlaggedIssues = lazyLoad(() => import("./pages/FlaggedIssues"));
const InspectionDetails = lazyLoad(() => import("./pages/InspectionDetails"));

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
        // Set up meta tags
        setupPWAMetaTags();
        
        // Register service worker for offline capabilities
        await registerServiceWorker();
      } catch (error) {
        console.error('Error setting up PWA:', error);
      } finally {
        // Finish loading after setup or if there's an error
        setIsLoading(false);
      }
    };
    
    setupPWA();
  }, []);

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <ErrorBoundaryWithFallback>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <TooltipProvider>
              <AuthProvider>
                <Toaster />
                <Sonner />
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
                    <Route path="inspect/:ppeId" element={<InspectionForm />} />
                    <Route path="inspection/:id" element={<InspectionDetails />} />
                    
                    {/* Admin-only routes */}
                    <Route path="reports" element={
                      <RoleProtectedRoute requiredRole="admin" fallbackPath="access-denied">
                        <ReportsPage />
                      </RoleProtectedRoute>
                    } />
                    
                    {/* Allow all other paths - let layout handle unauthorized access */}
                    <Route path="*" element={<NotFound />} />
                  </Route>
                </Routes>
              </AuthProvider>
            </TooltipProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </ErrorBoundaryWithFallback>
  );
};

export default App;
