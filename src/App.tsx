
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { NotificationsProvider } from '@/contexts/NotificationsContext';
import NetworkStatus from '@/components/layout/NetworkStatus';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MainLayout from '@/components/layout/MainLayout';
import NotFound from '@/pages/NotFound';

// Create a QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Lazy load pages
const Index = lazy(() => import('@/pages/Index'));
const LoginPage = lazy(() => import('@/pages/Login'));
const RegisterPage = lazy(() => import('@/pages/Register'));
const ProfilePage = lazy(() => import('@/pages/Profile'));
const AdminPage = lazy(() => import('@/pages/Settings')); 
const ReportsPage = lazy(() => import('@/pages/Reports'));
const StartInspection = lazy(() => import('@/pages/StartInspection'));
const InspectionForm = lazy(() => import('@/pages/InspectionForm'));
const InspectionDetails = lazy(() => import('@/pages/InspectionDetails'));
const FlaggedItems = lazy(() => import('@/pages/FlaggedIssues'));
const EquipmentPage = lazy(() => import('@/pages/Equipment'));
const EquipmentInspectionHistory = lazy(() => import('@/pages/EquipmentInspectionHistory'));
const InspectionHistoryView = lazy(() => import('@/components/inspections/InspectionHistoryView'));

// Loading screen component
function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background z-50">
      <LoadingSpinner size="lg" />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationsProvider>
          <Router>
            <NetworkStatus />
            <Suspense fallback={<LoadingScreen />}>
              <Routes>
                {/* Auth routes (no layout) */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                
                {/* Protected routes with layout */}
                <Route element={<MainLayout />}>
                  {/* Home page */}
                  <Route index element={<Index />} />
                  
                  {/* User routes */}
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/admin" element={<AdminPage />} />
                  <Route path="/settings" element={<AdminPage />} />
                  
                  {/* Inspection routes */}
                  <Route path="/reports" element={<ReportsPage />} />
                  <Route path="/reports/inspections" element={<InspectionHistoryView />} />
                  <Route path="/start-inspection" element={<StartInspection />} />
                  <Route path="/inspect/:ppeId" element={<InspectionForm />} />
                  <Route path="/inspection/:id" element={<InspectionDetails />} />
                  <Route path="/flagged" element={<FlaggedItems />} />
                  
                  {/* Equipment routes */}
                  <Route path="/equipment" element={<EquipmentPage />} />
                  <Route path="/equipment/:id" element={<EquipmentPage />} />
                  <Route path="/equipment/history/:ppeId" element={<EquipmentInspectionHistory />} />
                </Route>
                
                {/* Handle old home route redirect */}
                <Route path="/" element={<Navigate to="/" replace />} />
                
                {/* 404 route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </Router>
        </NotificationsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
