# CONVENTIONS.md - iRemedy AI

## Code Style

### TypeScript

- Strict mode enabled — no `any` types unless absolutely necessary
- Use `interface` for object shapes, `type` for unions and intersections
- Export types using `export type` when re-exporting from barrels
- Prefer `const` assertions for literal objects (`as const`)

### React Components

- Use function components exclusively (no class components except ErrorBoundary)
- Name files with PascalCase matching the component name: `Button.tsx`
- Each component folder contains: `ComponentName.tsx` + `index.ts`
- Keep components focused — one primary responsibility per file
- Use `forwardRef` for form input components

### File & Folder Naming

- Components and pages: `PascalCase` (`Dashboard.tsx`, `Button.tsx`)
- Hooks: `camelCase` starting with `use` (`useLocalStorage.ts`)
- Utilities: `camelCase` (`formatters.ts`, `constants.ts`)
- Type files: `camelCase` (`user.ts`, `appointment.ts`)
- Each feature folder has an `index.ts` barrel export

### Imports

- Use the `@/` path alias for all internal imports
- Group imports: React/external libs first, then `@/` imports
- Prefer named exports from barrel files

### Styling

- Use Tailwind CSS utility classes exclusively
- Custom theme colors defined in `tailwind.config.ts`:
  - `navy` (#0A1628) — primary dark color
  - `gold` (#C9A227) — accent color
  - `offWhite` (#F8F9FA) — background color
- Avoid inline styles; use Tailwind's `className` approach
- Responsive design: mobile-first with `sm:`, `md:`, `lg:` breakpoints

### State Management

- Local state: `useState` / `useReducer`
- Shared auth state: `AuthContext` via `useAuth()` hook
- Persistent state: `useLocalStorage` hook
- Server state: will use dedicated data-fetching solution as needed

### Testing

- Test files colocated with source or in `__tests__/` directories
- Use `*.test.tsx` / `*.test.ts` naming
- Testing library: Vitest + React Testing Library
- Test setup in `src/test/setup.ts`

### API & Services

- All HTTP calls through `apiClient` (`src/services/api.ts`)
- API base URL from `VITE_API_BASE_URL` env variable
- Typed responses using `ApiResponse<T>` generic
- Auth token stored in localStorage and attached via `Authorization` header

### Git Conventions

- Commit messages: imperative mood, concise summary
- Branch naming: `feature/`, `fix/`, `chore/` prefixes
- Keep commits atomic — one logical change per commit
