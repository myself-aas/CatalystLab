import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SubscriptionProvider } from './context/SubscriptionContext';
import { RoleSecurityProvider } from './context/RoleSecurityContext';
import { ThemeProvider } from './context/ThemeContext';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';
import { logger, installGlobalErrorReporting } from './lib/logger';

// Register Service Worker for offline asset and telemetry doc caching
if (typeof window !== 'undefined' && 'serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error: unknown) => {
      logger.warn('[SW] Registration failed:', error);
    });
  });
}

installGlobalErrorReporting();

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ErrorBoundary variant="root">
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <SubscriptionProvider>
            <RoleSecurityProvider>
              <App />
            </RoleSecurityProvider>
          </SubscriptionProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </ErrorBoundary>
  </React.StrictMode>
);
