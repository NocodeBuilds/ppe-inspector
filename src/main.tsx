import React from 'react';
import ReactDOM from 'react-dom/client';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { routeTree } from './routeTree';
import './index.css';

// Create router instance
const router = createRouter({ routeTree });

// Register router with React Query for better data fetching
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

// For TanStack Router, the RouterProvider must be the only top-level component
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
