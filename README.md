<h1>CatalystLab: AI-powered research brainstorming and parallel literature discovery platform</h1>

<p><strong>Think at the edge of knowledge</strong></p>

<p>AI-powered research brainstorming and literature discovery for serious researchers.<br />
20 instruments · 9 academic sources · Free forever plan</p>

<br />

[![Live App](https://img.shields.io/badge/Live%20App-catalystlab.tech-5b5bf6?style=for-the-badge&logo=vercel&logoColor=white)](https://catalystlab.tech)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![Firebase](https://img.shields.io/badge/Firebase-10-orange?style=for-the-badge&logo=firebase&logoColor=white)](https://firebase.google.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06b6d4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-34d399?style=for-the-badge)](LICENSE)

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Live Demo](#-live-demo)
- [Features](#-features)
- [20 Research Instruments](#-20-research-instruments)
- [9 Literature Sources](#-9-literature-sources)
- [Pricing](#-pricing)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Firebase Setup](#-firebase-setup)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🔭 Overview

CatalystLab is an AI-powered research SaaS platform built for graduate students, PhD researchers, and academics who need to think deeper, faster, and more creatively about their research.

It does two things simultaneously:

**THINK** — 20 structured AI brainstorming instruments that help researchers pressure-test ideas, find contradictions, explore assumptions, generate hypotheses, and discover research gaps — all powered by Gemini 2.5 Flash.

**DISCOVER** — Every time you run an instrument, CatalystLab automatically extracts your research concepts and searches 9 free academic databases in parallel, surfacing relevant literature without any extra effort from you. The science finds you.

> *"Nothing like this exists in any research tool I've used."*

---

## 🌐 Live Demo

| Environment | URL |
|---|---|
| **Production** | [catalystlab.tech](https://catalystlab.tech) |
| **Preview** | [catalyst-lab.vercel.app](https://catalyst-lab.vercel.app) |

---

## ✨ Features

### Core
- 🧠 **20 AI research instruments** across 3 thinking zones
- 📚 **Automatic literature discovery** from 9 free academic sources
- ⚡ **Parallel API fan-out** — all 9 sources searched simultaneously
- 🔍 **AI keyword extraction** — Gemini reads your input and builds optimal search queries
- 💾 **Session saving** — all instrument runs saved to Firebase Firestore
- 📤 **14 citation export formats** — BibTeX, APA, MLA, IEEE, RIS, and more

### Platform
- 🔐 **Firebase Authentication** — Google OAuth + magic link email
- 🌑 **Dark mode only** — calm, focused research environment
- 📱 **Fully responsive** — mobile, tablet, and desktop
- ⌨️ **Command palette** — ⌘K to navigate anywhere instantly
- 🎯 **Free trial system** — 5 runs/day on free plan, unlimited on paid

### Design
- Zero generic AI aesthetics — no purple gradients, no glass morphism everywhere
- Typography-first hierarchy — Inter + JetBrains Mono
- Smooth micro-interactions — intentional, not decorative
- 3-panel instrument layout — input · output · literature side by side

---

## ⚗️ 20 Research Instruments

### 💡 Zone A — Ideas
| Instrument | What it does |
|---|---|
| **Thought Collider** | Crash two ideas. Find the breakthrough at the intersection. |
| **Research Multiverse** | Flip assumptions. Explore parallel hypothesis universes. |
| **Concept Alchemy** | Combine research concepts. Discover unexpected reactions. |
| **The Oracle** | The 10 most important unanswered questions in your field. |
| **Socratic Engine** | The AI that only asks questions. You find the answer. |
| **Constraints Game** | Creativity loves constraints. Solve within radical limits. |
| **Dream Board** | Pin fragments. AI finds the emerging pattern. |
| **Thought Experiment** | Build a hypothetical. See where it leads. |

### 🔬 Zone B — Analysis
| Instrument | What it does |
|---|---|
| **Pressure Chamber** | How strong is your idea under adversarial stress? |
| **Contradiction Finder** | Papers that disagree. Gaps that need filling. |
| **Assumption Archaeology** | Excavate the hidden assumptions beneath your research. |
| **Hypothesis Tournament** | 5 hypotheses enter. One survives. |
| **Signal vs Noise** | Is this trend real or hype? Find out before you commit. |
| **Persona Swap** | See your research through radically different eyes. |

### 🔭 Zone C — Discovery
| Instrument | What it does |
|---|---|
| **Temporal Telescope** | See past, present, and three possible futures of your field. |
| **Mind Mesh** | Your subconscious knowledge network, made visible. |
| **Analogical Lab** | Your problem is already solved — in a different field. |
| **Frontier Map** | Satellite view of the edge of your field's knowledge. |
| **Living Review** | A literature review that updates itself automatically. |
| **Emergence Engine** | Submit one observation. Watch a breakthrough emerge. |

---

## 📡 9 Literature Sources

CatalystLab queries all of these simultaneously on every instrument run:

| Source | Coverage | API Key |
|---|---|---|
| **Semantic Scholar** | 200M+ papers, all disciplines | Not required |
| **OpenAlex** | 250M+ works, fully open | Not required |
| **arXiv** | 2.3M+ preprints (CS, Physics, Bio, Math...) | Not required |
| **PubMed** | 36M+ biomedical citations | Not required |
| **CORE** | World's largest open access collection | Free key optional |
| **Crossref** | 150M+ works, strong on DOIs | Not required |
| **Europe PMC** | 42M+ abstracts, 9M+ full text | Not required |
| **DOAJ** | 9M+ fully open access articles | Not required |
| **Unpaywall** | PDF enrichment pass on DOIs | Not required |

---

## 💰 Pricing

| Plan | Price | Runs/day | Sources |
|---|---|---|---|
| **Free** | $0 forever | 5 | 3 sources |
| **Researcher** | $9/month | Unlimited | All 9 sources |
| **Lab Pro** | $19/month | Unlimited | All 9 + BYO API key |
| **Institution** | $49/month | Unlimited | All 9 + team features |

All paid plans include a 7-day free trial. No credit card required for the free plan.

---

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| **Framework** | Next.js 14 (App Router, TypeScript) |
| **Styling** | Tailwind CSS |
| **Authentication** | Firebase Authentication |
| **Database** | Firebase Firestore |
| **Hosting** | Firebase App Hosting |
| **AI** | Google Gemini 2.5 Flash |
| **Icons** | Lucide React |
| **Fonts** | Inter + JetBrains Mono |
| **State** | React Context + Zustand |

---

## 📁 Project Structure

```
CatalystLab/
├── app/
│   ├── (main)/              # Authenticated app shell
│   │   ├── layout.tsx       # Sidebar + TopBar + BottomNav
│   │   ├── dashboard/       # Home dashboard
│   │   ├── instruments/     # Instrument list + [slug] detail
│   │   ├── reports/         # Saved sessions
│   │   ├── search/          # Standalone literature search
│   │   ├── reviews/         # Living literature reviews
│   │   └── settings/        # User settings + API keys
│   ├── auth/callback/       # Firebase auth callback handler
│   ├── login/               # Sign in page
│   ├── pricing/             # Pricing page
│   ├── privacy/             # Privacy policy
│   ├── terms/               # Terms of service
│   ├── not-found.tsx        # 404 page
│   ├── layout.tsx           # Root layout
│   ├── globals.css          # Global styles + design tokens
│   └── page.tsx             # Landing page
├── components/
│   ├── Sidebar.tsx          # Desktop navigation sidebar
│   ├── TopBar.tsx           # Top bar with search + user
│   ├── BottomNav.tsx        # Mobile bottom navigation
│   ├── CommandPalette.tsx   # ⌘K command palette
│   └── AuthProvider.tsx     # Firebase auth context
├── lib/
│   ├── firebase.ts          # Firebase app initialization
│   ├── gemini.ts            # Gemini 2.5 Flash client
│   ├── trialSystem.ts       # Free tier rate limiting
│   ├── export.ts            # 14 citation export formats
│   └── apis/                # 9 academic API clients
│       ├── index.ts         # Fan-out + dedup + ranking
│       ├── semanticScholar.ts
│       ├── openAlex.ts
│       ├── arxiv.ts
│       ├── pubmed.ts
│       ├── core.ts
│       ├── crossref.ts
│       ├── europePmc.ts
│       ├── doaj.ts
│       └── unpaywall.ts
├── hooks/                   # Custom React hooks
├── stores/                  # Zustand state stores
├── middleware.ts            # Auth route protection
├── firebase.json            # Firebase configuration
├── firestore.rules          # Firestore security rules
├── firestore.indexes.json   # Firestore composite indexes
└── next.config.ts           # Next.js configuration
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- A Google account (for Firebase)
- A Gemini API key (free at [aistudio.google.com](https://aistudio.google.com))

### 1. Clone the repository

```bash
git clone https://github.com/myself-aas/CatalystLab.git
cd CatalystLab
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in your values in `.env.local` (see [Environment Variables](#-environment-variables) below).

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Environment Variables

Create a `.env.local` file in the project root:

```env
# Firebase Configuration
# Get these from: Firebase Console → Project Settings → Your apps → Web app
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=catalystlab.tech
NEXT_PUBLIC_FIREBASE_PROJECT_ID=catalystlab
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=catalystlab.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=CatalystLab
```

> **Note:** The Gemini API key is entered by each user through the Settings page and stored securely in their Firestore account — it is never stored in environment variables or exposed server-side.

---

## 🔥 Firebase Setup

### 1. Create a Firebase project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add project** → name it `catalystlab`
3. Link to your existing Google Cloud project if you have OAuth set up

### 2. Enable Authentication

1. Firebase Console → **Authentication** → **Get started**
2. Enable **Google** provider
3. Enable **Email/Password** (for magic links)
4. Go to **Settings** → **Authorized domains** → add `catalystlab.tech`

### 3. Create Firestore database

1. Firebase Console → **Firestore Database** → **Create database**
2. Start in **test mode** (rules are in `firestore.rules`)
3. Select region: `asia-southeast1` (Singapore)

### 4. Deploy Firestore rules

```bash
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:rules
```

### 5. Get your Firebase config

Firebase Console → **Project Settings** → **Your apps** → **Web app** → copy the config object into your `.env.local`.

---

## 📦 Deployment

### Deploy to Firebase App Hosting (recommended)

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Deploy
firebase deploy --only hosting
```

Your app will be live at `https://your-project.web.app`

### Connect custom domain (catalystlab.tech)

1. Firebase Console → **Hosting** → **Add custom domain**
2. Enter `catalystlab.tech` → follow verification steps
3. Add the DNS records Firebase provides to your domain registrar
4. Wait for SSL certificate (up to 1 hour after DNS propagates)

### Automated deployment via GitHub Actions

Every push to `main` automatically deploys to Firebase:

1. Go to your repo → **Settings** → **Secrets** → **Actions**
2. Add `FIREBASE_SERVICE_ACCOUNT` (get from Firebase Console → Project Settings → Service Accounts → Generate new private key)
3. Push to `main` → GitHub Action builds and deploys automatically

---

## 🤝 Contributing

Contributions are welcome. Please open an issue first to discuss what you would like to change.

```bash
# Create a feature branch
git checkout -b feature/your-feature-name

# Make your changes
# ...

# Commit
git commit -m "feat: add your feature description"

# Push and open a pull request
git push origin feature/your-feature-name
```

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 🙋 Support

| Channel | Link |
|---|---|
| **Website** | [catalystlab.tech](https://catalystlab.tech) |
| **Email** | [support@catalystlab.tech](mailto:support@catalystlab.tech) |
| **Issues** | [GitHub Issues](https://github.com/myself-aas/CatalystLab/issues) |
| **Privacy Policy** | [catalystlab.tech/privacy](https://catalystlab.tech/privacy) |
| **Terms of Service** | [catalystlab.tech/terms](https://catalystlab.tech/terms) |

---

## 👨‍💻 Author

<div align="center">

### Ashif Ahmed Shuvo
**Machine Learning Enthusiast · AI & Food Engineering Researcher**

*AI & ML expert with a B.Sc. in Food Engineering, specializing in precision and sustainable agriculture and agricultural automation. Experienced in computer vision for object detection & recognition, IoT-based smart farming solutions, and data-driven decision-making for monitoring and optimization. Passionate about integrating AI, remote sensing, and sensor-based technologies to enhance sustainable agriculture and horticulture research.*

---

[![GitHub](https://img.shields.io/badge/GitHub-myself--aas-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/myself-aas/)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-me--aas-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/me-aas/)
[![Email](https://img.shields.io/badge/Email-shuvo.1807016@bau.edu.bd-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:shuvo.1807016@bau.edu.bd)
[![Phone](https://img.shields.io/badge/Phone-+8801985531180-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](tel:+8801985531180)

</div>

---

## 🎓 Citation

If you use **CatalystLab** in your research, brainstorming process, or literature discovery, please cite the software as follows:

### **APA 7**
> Shuvo, Ashif A. (2026). CatalystLab: AI-Powered Research Brainstorming and Parallel Literature Discovery Platform (v1.3.7). Zenodo. https://doi.org/10.5281/zenodo.19362937

### **BibTeX**
```bibtex
@software{shuvo_catalystlab_2026,
  author = {Shuvo, Ashif Ahmed},
  title = {CatalystLab: AI-powered research brainstorming and parallel literature discovery platform},
  version = {1.3.7},
  year = {2026},
  month = {4},
  publisher = {Zenodo},
  doi = {10.5281/zenodo.19362937},
  url = {https://github.com/myself-aas/CatalystLab},
  note = {Academic SaaS for Research Ideation}
}
```
---

Built for researchers, by researchers · Bangladesh 🇧🇩

<br />

⭐ Star this repo if CatalystLab helps your research

</div>
