
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState, lazy, Suspense } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./components/ThemeToggler";
import MainLayout from "./components/layout/MainLayout";

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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
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

  useEffect(() => {
    // Add PWA-specific meta tags and service worker dynamically
    const setupPWA = async () => {
      try {
        // Set meta tags
        const themeColorMeta = document.querySelector('meta[name="theme-color"]');
        if (!themeColorMeta) {
          const meta = document.createElement('meta');
          meta.name = 'theme-color';
          meta.content = '#111111';
          document.head.appendChild(meta);
        }
        
        // Add apple-touch-icon for iOS
        const appleIcon = document.querySelector('link[rel="apple-touch-icon"]');
        if (!appleIcon) {
          const link = document.createElement('link');
          link.rel = 'apple-touch-icon';
          link.href = '/favicon.ico';
          document.head.appendChild(link);
        }
        
        // Add meta description
        const descriptionMeta = document.querySelector('meta[name="description"]');
        if (descriptionMeta) {
          descriptionMeta.setAttribute('content', 'PPE Inspector Pro - Track and manage PPE inventory and inspections');
        } else {
          const meta = document.createElement('meta');
          meta.name = 'description';
          meta.content = 'PPE Inspector Pro - Track and manage PPE inventory and inspections';
          document.head.appendChild(meta);
        }
        
        // Add Web App Manifest for better PWA support
        const manifestLink = document.querySelector('link[rel="manifest"]');
        if (!manifestLink) {
          const link = document.createElement('link');
          link.rel = 'manifest';
          link.href = '/manifest.json';
          document.head.appendChild(link);
        }
        
        // Add viewport meta tag for mobile responsiveness if not present
        const viewportMeta = document.querySelector('meta[name="viewport"]');
        if (!viewportMeta) {
          const meta = document.createElement('meta');
          meta.name = 'viewport';
          meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
          document.head.appendChild(meta);
        }
        
        // Register service worker for offline capabilities
        if ('serviceWorker' in navigator) {
          try {
            const registration = await navigator.serviceWorker.register('/service-worker.js');
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
          } catch (error) {
            console.log('ServiceWorker registration failed: ', error);
          }
        }
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
                    <Route path="settings" element={<Settings />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="edit-profile" element={<EditProfile />} />
                    <Route path="inspect/:ppeId" element={<InspectionForm />} />
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
