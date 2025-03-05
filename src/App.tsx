
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState, lazy, Suspense } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./components/ThemeToggler";
import MainLayout from "./components/layout/MainLayout";
import { setupPWAMetaTags, registerServiceWorker } from "./utils/pwaUtils";

// Lazy load pages to improve initial load performance
const Home = lazy(() => import("./pages/Home"));
const ExpiringPPE = lazy(() => import("./pages/ExpiringPPE"));
const UpcomingInspections = lazy(() => import("./pages/UpcomingInspections"));
const Equipment = lazy(() => import("./pages/Equipment"));
const Settings = lazy(() => import("./pages/Settings"));
const Profile = lazy(() => import("./pages/Profile"));
const Login = lazy(() => import("./pages/Login"));
const NotFound = lazy(() => import("./pages/NotFound"));
const RegisterPage = lazy(() => import("./pages/Register"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPassword"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPassword"));
const EditProfile = lazy(() => import("./pages/EditProfile"));
const InspectionForm = lazy(() => import("./pages/InspectionForm"));
const ReportsPage = lazy(() => import("./pages/Reports"));
const StartInspection = lazy(() => import("./pages/StartInspection"));
const ManualInspection = lazy(() => import("./pages/ManualInspection"));
const FlaggedIssues = lazy(() => import("./pages/FlaggedIssues"));
const InspectionDetails = lazy(() => import("./pages/InspectionDetails"));

// Configure React Query with improved settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes - renamed from cacheTime
    },
  },
});

// Loading component for Suspense
const PageLoader = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-background">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <PageLoader />;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

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
                  
                  <Route path="/" element={
                    <ProtectedRoute>
                      <MainLayout />
                    </ProtectedRoute>
                  }>
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
  );
};

export default App;
