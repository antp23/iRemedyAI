# CLAUDE.md - iRemedy AI

## Project Overview

iRemedy AI is a React 18 + TypeScript + Vite single-page application for AI-powered health services. It provides symptom checking, appointment scheduling, and health profile management.

## Tech Stack

- **Framework**: React 18
- **Language**: TypeScript 5.5+
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS 3 with custom Patriotic Premium theme
- **Routing**: React Router DOM v6
- **Testing**: Vitest + React Testing Library
- **Linting**: ESLint

## Commands

- `npm run dev` — Start dev server on localhost:5173
- `npm run build` — TypeScript check + production build
- `npm run preview` — Preview production build
- `npm test` — Run tests once
- `npm run test:watch` — Run tests in watch mode
- `npm run lint` — Run ESLint

## Project Structure

```
src/
├── assets/          # Static assets (images, fonts)
├── components/      # Reusable UI components
│   ├── common/      # ErrorBoundary, ProtectedRoute
│   ├── forms/       # Input, Select
│   ├── layout/      # Header, Footer, Sidebar, MainLayout
│   └── ui/          # Button, Card, LoadingSpinner
├── context/         # React context providers (AuthContext)
├── hooks/           # Custom React hooks
├── pages/           # Route page components
│   ├── Appointments/
│   ├── Auth/        # Login, Register
│   ├── Dashboard/
│   ├── Home/
│   ├── NotFound/
│   ├── Profile/
│   └── SymptomChecker/
├── services/        # API client and service modules
├── styles/          # Global CSS (Tailwind entry)
├── test/            # Test setup
├── types/           # Shared TypeScript type definitions
└── utils/           # Constants, formatters, helpers
```

## Path Aliases

`@/` maps to `src/` — use `@/components`, `@/types`, etc.

## Theme Colors

- **Navy**: `#0A1628` — Primary dark / text color
- **Gold**: `#C9A227` — Accent / CTA color
- **Off-White**: `#F8F9FA` — Background color

Use via Tailwind classes: `text-navy`, `bg-gold`, `bg-offWhite`

## Key Conventions

- All pages export from `index.ts` barrel files
- Components are organized by concern: layout, ui, forms, common
- Types are centralized in `src/types/` with a barrel export
- API calls go through the `apiClient` singleton in `src/services/api.ts`
- Auth state is managed via React Context (`useAuth` hook)
