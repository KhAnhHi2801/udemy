# Code Standards

## General

- **Language**: TypeScript everywhere (strict mode)
- **File naming**: kebab-case, descriptive (`prisma-error-normalizer.ts` not `errHelper.ts`)
- **File size**: Keep under 200 lines — split into focused modules if exceeded
- **Principles**: YAGNI, KISS, DRY

## Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Files | kebab-case | `async-handler.ts` |
| Variables / functions | camelCase | `hashPassword`, `useAuthStore` |
| React components | PascalCase | `TopNav`, `AccountDropdown` |
| Types / Interfaces | PascalCase | `User`, `AuthState`, `AuthRequest` |
| Enums | PascalCase values | `Role.Subscriber` |
| Constants | UPPER_SNAKE or camelCase | `DEFAULT_LOCALE`, `DEFAULT_NAMESPACES` |

## Server Standards

### Route Structure
- Route files in `server/routes/` — auto-loaded, named by domain (`auth.ts`, `courses.ts`)
- Controllers in `server/controllers/` — one file per domain
- Each handler uses `asyncHandler` wrapper — never write raw try/catch in controllers

### Validation
- Validate all incoming data with Zod at the controller level before any business logic
- Use `safeParse` (not `parse`) so validation errors can be returned as 400 responses
- Define schemas at module scope, not inside handlers

### Error Handling
- All errors flow through `asyncHandler` → `normalizeError` pipeline
- Add new error types by creating a normalizer in `server/lib/errors/` and registering in `error-normalizer.ts`
- Never expose raw error messages or stack traces to clients

### Auth
- Protect routes with `requireAuth` middleware (not inside controllers)
- Use `AuthRequest` type for handlers that expect `req.userId`

### Prisma
- Use the singleton from `server/lib/prisma.ts` — never instantiate `PrismaClient` directly
- Never return `password` field to clients — always destructure it out

## Client Standards

### Component Structure
- One component per file
- Co-locate component-specific sub-components in a folder (`AccountDropdown/index.tsx`)
- Pages in `client/pages/` — only page-level concerns (routing, `getStaticProps`)
- Reusable UI in `client/components/`

### Data Fetching
- All API calls via the typed axios instance in `client/lib/axios.ts`
- Server state managed exclusively through TanStack Query hooks in `client/hooks/`
- No direct axios calls inside components — always go through hooks

### State
- Zustand store in `client/stores/` — one file per domain
- Export individual selector hooks (`useUser`, `useSetUser`) not the whole store
- Avoid persisting sensitive data beyond what's needed for UX (user info OK, tokens never)

### i18n
- Always use translation keys, never hardcode English strings in JSX
- Error codes from API must be parsed through `parseError()` before display
- Use `getTranslationProps()` helper in every page's `getStaticProps`

### Forms
- Use controlled inputs with `useState`
- Disable submit button while `isPending` or required fields are empty
- Show API errors in an `alert alert-danger` div above the form

## Comments

- Write comments only when the WHY is non-obvious
- No JSDoc on trivial functions that read themselves
- No TODO comments in committed code — use plans or issues

## Commit Messages

Follow Conventional Commits:
```
feat: add course creation endpoint
fix: user enumeration in login response
refactor: extract parseError into shared util
chore: update prisma to v7.8
```

No AI references. No plan/phase references in commit messages.
