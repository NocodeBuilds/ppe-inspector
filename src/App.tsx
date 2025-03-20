
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { NotificationsProvider } from '@/contexts/NotificationsContext';
import { AuthProvider } from '@/contexts/AuthContext';
import NetworkStatus from '@/components/layout/NetworkStatus';
import { Loading } from '@/components/common/LoadingSpinner';
import InspectionHistoryView from '@/components/inspections/InspectionHistoryView';

const LandingPage = lazy(() => import('@/pages/Home'));
const LoginPage = lazy(() => import('@/pages/Login'));
const RegisterPage = lazy(() => import('@/pages/Register'));
const ProfilePage = lazy(() => import('@/pages/Profile'));
const AdminPage = lazy(() => import('@/pages/Admin'));
const ReportsPage = lazy(() => import('@/pages/Reports'));
const StartInspection = lazy(() => import('@/pages/StartInspection'));
const InspectionForm = lazy(() => import('@/pages/InspectionForm'));
const InspectionDetails = lazy(() => import('@/pages/InspectionDetails'));
const FlaggedItems = lazy(() => import('@/pages/FlaggedIssues'));
const EquipmentPage = lazy(() => import('@/pages/Equipment'));
const EquipmentDetails = lazy(() => import('@/pages/EquipmentDetails'));
const EquipmentInspectionHistory = lazy(() => import('@/pages/EquipmentInspectionHistory'));

function LoadingScreen() {
  const isLoading = false; // We'll implement this properly later

  if (!isLoading) {
    return null;
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background z-50">
      <Loading />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <NotificationsProvider>
        <Router>
          <NetworkStatus />
          <main className="container pt-20 pb-12">
            <Suspense fallback={<LoadingScreen />}>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/start-inspection" element={<StartInspection />} />
                <Route path="/inspect/:ppeId" element={<InspectionForm />} />
                <Route path="/inspection/:id" element={<InspectionDetails />} />
                <Route path="/flagged" element={<FlaggedItems />} />
                <Route path="/equipment" element={<EquipmentPage />} />
                <Route path="/equipment/:id" element={<EquipmentDetails />} />
                <Route path="/reports/inspections" element={<React.Suspense fallback={<LoadingScreen />}>
                  <InspectionHistoryView />
                </React.Suspense>} />

                <Route path="/equipment/history/:ppeId" element={<React.Suspense fallback={<LoadingScreen />}>
                  <EquipmentInspectionHistory />
                </React.Suspense>} />
              </Routes>
            </Suspense>
          </main>
          <LoadingScreen />
        </Router>
      </NotificationsProvider>
    </AuthProvider>
  );
}

export default App;
