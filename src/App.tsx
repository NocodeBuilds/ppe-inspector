import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState, lazy, Suspense } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./components/ThemeToggler";
import { setupPWAMetaTags, registerServiceWorker } from "./utils/pwaUtils";
import ErrorBoundary from "./components/ErrorBoundary";

// Lazy loading with better naming for code splitting chunks
const MainLayout = lazy(() => import(/* webpackChunkName: "main-layout" */ "./components/layout/MainLayout"));

// Lazy load pages with chunk naming for better debugging
const Home = lazy(() => import(/* webpackChunkName: "home-page" */ "./pages/Home"));
const ExpiringPPE = lazy(() => import(/* webpackChunkName: "expiring-ppe-page" */ "./pages/ExpiringPPE"));
const UpcomingInspections = lazy(() => import(/* webpackChunkName: "upcoming-inspections-page" */ "./pages/UpcomingInspections"));
const Equipment = lazy(() => import(/* webpackChunkName: "equipment-page" */ "./pages/Equipment"));
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
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
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
                      <Route path="inspect/:ppeId" element={<InspectionForm />} />
                      <Route path="inspection/:id" element={<InspectionDetails />} />
                      <Route path="reports" element={<ReportsPage />} />
                    </Route>
                    
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </BrowserRouter>
            </TooltipProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
