# CatalystLab - Vercel Deployment Guide

CatalystLab is fully configured for zero-configuration, production deployment on [Vercel](https://vercel.com).

---

## 🚀 1-Click / Git Deployment

1. **Push your repository to GitHub / GitLab / Bitbucket**.
2. **Import the repository into Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new).
   - Select your CatalystLab repository.
3. **Build & Output Settings** (Auto-detected from `vercel.json`):
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
4. **Environment Variables** (Optional):
   - If using the default built-in Firebase backend, **no variables are needed**.
   - If connecting a custom Firebase project, configure:
     - `VITE_FIREBASE_API_KEY`
     - `VITE_FIREBASE_AUTH_DOMAIN`
     - `VITE_FIREBASE_PROJECT_ID`
     - `VITE_FIREBASE_APP_ID`
     - `VITE_FIREBASE_FIRESTORE_DATABASE_ID`
5. Click **Deploy**.

---

## ⚡ Architecture on Vercel

* **Frontend SPA**: Vite builds static assets into `/dist`, and `vercel.json` handles client-side SPA routing (`/admin`, `/blogs`, `/dashboard`, `/compare`, `/health`, etc.).
* **Serverless Diagnostic APIs**:
  - `POST /api/run-engine`: High-speed diagnostic telemetry suite (Website Health, AI Readiness, Repo Scanner, Edge Latency, Eco-Carbon, Compliance, Platform Migration, and LLMO).
  - `POST /api/monitor/probe`: Real-time endpoint health, HTTP status, TTFB latency, and SSL certificate validation.
  - `GET /api/monitor/system-health`: Live telemetry & runtime status.
  - `GET /api/health`: Health status endpoint.
* **Database & Auth**: Connects directly to Firebase Firestore and Google Auth popup authentication with full security rule enforcement.
