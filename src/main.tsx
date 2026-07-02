
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Apply theme before rendering
const savedTheme = localStorage.getItem('ui-theme') as 'dark' | 'light' | null;
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
  document.documentElement.classList.add('dark');
} else {
  document.documentElement.classList.remove('dark');
}

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
