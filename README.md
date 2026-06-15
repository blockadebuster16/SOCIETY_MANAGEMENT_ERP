# Suyash Pride Housing Society Ltd Portal

Welcome to the production-grade housing society management portal for **Suyash Pride Housing Society Ltd**. This portal is designed using a clean, layered architecture separating concerns across a Monorepo workspace.

## Tech Stack Overview

- **Frontend**: React 19, Vite, React Router DOM, Tailwind CSS, Framer Motion, Axios, React Hook Form, React Query
- **Backend**: Node.js, Express.js, JWT Authentication, Multer
- **Database & Storage**: Supabase PostgreSQL & Supabase Storage
- **Maps**: Leaflet & OpenStreetMap
- **Payments**: Razorpay (scaffolded integration)
- **AI Chatbot**: Scaffolding for local model or API fine-tuning

## Project Monorepo Structure

```text
suyash-pride-portal/
├── client/              # React 19 Frontend (Vite)
├── server/              # Node/Express Backend API
├── shared/              # Common schemas, types, and constants
└── docs/                # Core architecture & database design documentation
```

## Portal Documentation

Detailed technical and architectural guides are located in the `docs/` folder:
- **[ProjectOverview.md](file:///c:/Users/parth/OneDrive/Desktop/SP_ULWE_SITE/suyash-pride-portal/docs/ProjectOverview.md)**: Introduction, core objectives, and target audience roles.
- **[Architecture.md](file:///c:/Users/parth/OneDrive/Desktop/SP_ULWE_SITE/suyash-pride-portal/docs/Architecture.md)**: System design and folder organization guide.
- **[DatabaseSchema.md](file:///c:/Users/parth/OneDrive/Desktop/SP_ULWE_SITE/suyash-pride-portal/docs/DatabaseSchema.md)**: Database ERD, RLS, and scaling strategy.
- **[Routing.md](file:///c:/Users/parth/OneDrive/Desktop/SP_ULWE_SITE/suyash-pride-portal/docs/Routing.md)**: Client-side and server-side routes mapping specification.
- **[APIReference.md](file:///c:/Users/parth/OneDrive/Desktop/SP_ULWE_SITE/suyash-pride-portal/docs/APIReference.md)**: REST endpoints definitions.
- **[DevelopmentRoadmap.md](file:///c:/Users/parth/OneDrive/Desktop/SP_ULWE_SITE/suyash-pride-portal/docs/DevelopmentRoadmap.md)**: 11 backend development milestones.
- **[FrontendRoadmap.md](file:///c:/Users/parth/OneDrive/Desktop/SP_ULWE_SITE/suyash-pride-portal/docs/FrontendRoadmap.md)**: 12 frontend page-by-page development milestones.
- **[DesignSystem.md](file:///c:/Users/parth/OneDrive/Desktop/SP_ULWE_SITE/suyash-pride-portal/docs/DesignSystem.md)**: Theme colors, typography, layout structures, and accessibility guides.
- **[DeploymentGuide.md](file:///c:/Users/parth/OneDrive/Desktop/SP_ULWE_SITE/suyash-pride-portal/docs/DeploymentGuide.md)**: Instructions for hosting and database initialization.
- **[DeploymentArchitecture.md](file:///c:/Users/parth/OneDrive/Desktop/SP_ULWE_SITE/suyash-pride-portal/docs/DeploymentArchitecture.md)**: Production deployment architecture, security setups, backups, monitoring, and pipelines.

## Getting Started

### 1. Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### 2. Environment Setup
Copy the environment template from the root folder:
```bash
cp .env.example .env
```
And populate the credentials for Supabase, JWT, and Razorpay.

### 3. Installation
Install dependencies inside the individual folders:
```bash
# Frontend
cd client
npm install

# Backend
cd server
npm install
```

### 4. Running the Applications
- **Client (Frontend)**: Run `npm run dev` inside `client` directory.
- **Server (Backend)**: Run `npm run dev` or `npm start` inside `server` directory.
