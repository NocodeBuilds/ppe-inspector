import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router';
import { z } from 'zod';

import RootLayout from '@/components/layout/RootLayout';
import AuthLayout from '@/components/layout/AuthLayout';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

// Lazy-loaded pages for better performance
import { lazy } from 'react';

const Home = lazy(() => import('@/pages/Home'));
const Login = lazy(() => import('@/pages/auth/Login'));
const Register = lazy(() => import('@/pages/auth/Register'));
const ForgotPassword = lazy(() => import('@/pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('@/pages/auth/ResetPassword'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Equipment = lazy(() => import('@/pages/Equipment'));
const ExpiringPPE = lazy(() => import('@/pages/ExpiringPPE'));
const UpcomingInspections = lazy(() => import('@/pages/UpcomingInspections'));
const FlaggedIssues = lazy(() => import('@/pages/FlaggedIssues'));
const StartInspection = lazy(() => import('@/pages/StartInspection'));
const InspectionForm = lazy(() => import('@/pages/InspectionForm'));
const InspectionDetails = lazy(() => import('@/pages/InspectionDetails'));
const ManualInspection = lazy(() => import('@/pages/ManualInspection'));
const Reports = lazy(() => import('@/pages/Reports'));
const Analytics = lazy(() => import('@/pages/Analytics'));
const Profile = lazy(() => import('@/pages/Profile'));
const EditProfile = lazy(() => import('@/pages/EditProfile'));
const Settings = lazy(() => import('@/pages/Settings'));
const NotFound = lazy(() => import('@/pages/NotFound'));

// Wrap all providers inside TanStack Router's root component
// This ensures the Router context is established before any hooks are called
const rootRoute = createRootRoute({
  component: () => {
    return (
      <div className="app-container">
        <RootLayout />
      </div>
    );
  },
});

// Public routes
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Home,
});

// Auth routes
const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'auth',
  component: AuthLayout,
});

const loginRoute = createRoute({
  getParentRoute: () => authRoute,
  path: 'login',
  component: Login,
});

const registerRoute = createRoute({
  getParentRoute: () => authRoute,
  path: 'register',
  component: Register,
});

const forgotPasswordRoute = createRoute({
  getParentRoute: () => authRoute,
  path: 'forgot-password',
  component: ForgotPassword,
});

const resetPasswordRoute = createRoute({
  getParentRoute: () => authRoute,
  path: 'reset-password',
  component: ResetPassword,
  validateSearch: z.object({
    token: z.string(),
  }),
});

// Protected routes
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'dashboard',
  component: () => (
    <ProtectedRoute>
      <DashboardLayout />
    </ProtectedRoute>
  ),
});

const homeRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: '/',
  component: Dashboard,
});

const equipmentRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: 'equipment',
  component: Equipment,
});

const expiringPPERoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: 'expiring',
  component: ExpiringPPE,
});

const upcomingInspectionsRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: 'upcoming',
  component: UpcomingInspections,
});

const flaggedIssuesRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: 'flagged',
  component: FlaggedIssues,
});

const startInspectionRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: 'start-inspection',
  component: StartInspection,
});

const manualInspectionRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: 'inspect/new',
  component: ManualInspection,
});

const inspectionFormRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: 'inspect/$ppeId',
  component: InspectionForm,
});

const inspectionDetailsRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: 'inspection/$id',
  component: InspectionDetails,
});

const reportsRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: 'reports',
  component: Reports,
});

const analyticsRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: 'analytics',
  component: Analytics,
});

const profileRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: 'profile',
  component: Profile,
});

const editProfileRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: 'edit-profile',
  component: EditProfile,
});

const settingsRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: 'settings',
  component: Settings,
});

// 404 route
const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '*',
  component: NotFound,
});

// Register all routes
export const routeTree = rootRoute.addChildren([
  indexRoute,
  authRoute.addChildren([
    loginRoute,
    registerRoute,
    forgotPasswordRoute,
    resetPasswordRoute,
  ]),
  dashboardRoute.addChildren([
    homeRoute,
    equipmentRoute,
    expiringPPERoute,
    upcomingInspectionsRoute,
    flaggedIssuesRoute,
    startInspectionRoute,
    manualInspectionRoute,
    inspectionFormRoute,
    inspectionDetailsRoute,
    reportsRoute,
    analyticsRoute,
    profileRoute,
    editProfileRoute,
    settingsRoute,
  ]),
  notFoundRoute,
]);
