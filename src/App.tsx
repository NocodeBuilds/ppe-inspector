
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import MainLayout from "./components/layout/MainLayout";
import Home from "./pages/Home";
import ExpiringPPE from "./pages/ExpiringPPE";
import UpcomingInspections from "./pages/UpcomingInspections";
import Equipment from "./pages/Equipment";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real app, we would check if the user is authenticated
    const checkAuth = () => {
      const isAuth = localStorage.getItem('isAuthenticated') === 'true';
      setIsAuthenticated(isAuth);
      setIsLoading(false);
    };
    
    checkAuth();
    
    // Add PWA-specific meta tags dynamically
    const setMetaTags = () => {
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
        link.href = '/favicon.ico'; // Replace with actual icon
        document.head.appendChild(link);
      }
      
      // Add description
      const descriptionMeta = document.querySelector('meta[name="description"]');
      if (descriptionMeta) {
        descriptionMeta.setAttribute('content', 'PPE Inspector Pro - Track and manage PPE inventory and inspections');
      }
    };
    
    setMetaTags();
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
            
            <Route path="/" element={isAuthenticated ? <MainLayout /> : <Navigate to="/login" />}>
              <Route index element={<Home />} />
              <Route path="expiring" element={<ExpiringPPE />} />
              <Route path="upcoming" element={<UpcomingInspections />} />
              <Route path="equipment" element={<Equipment />} />
              <Route path="settings" element={<Settings />} />
              <Route path="profile" element={<Profile />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
