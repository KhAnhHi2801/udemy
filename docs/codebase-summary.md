# Codebase Summary

## Repository Layout

```
udemy/
├── README.md
├── package.json              root scripts (pnpm dev runs client+server in parallel)
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
│
├── packages/
│   └── types/
│       └── src/index.ts      User interface { id, name, email, picture? }
│
├── server/
│   ├── server.ts             App entry: middleware setup + dynamic route loader
│   ├── prisma.config.ts      Prisma config
│   ├── routes/
│   │   └── auth.ts           Route definitions for auth endpoints
│   ├── controllers/
│   │   └── auth.ts           register, login, logout, getMe handlers + Zod schemas
│   ├── middleware/
│   │   └── require-auth.ts   Validates JWT cookie → attaches req.userId
│   ├── lib/
│   │   ├── prisma.ts         Prisma client singleton
│   │   ├── async-handler.ts  Wraps async handlers with error catching
│   │   ├── zod-error-map.ts  Converts Zod issues to i18n-friendly codes
│   │   └── errors/
│   │       ├── error-normalizer.ts         Entry point, chains normalizers
│   │       └── prisma-error-normalizer.ts  P2002 (unique), P2025 (not found)
│   ├── utils/
│   │   └── auth.ts           hashPassword / comparePassword (bcrypt, 12 rounds)
│   └── prisma/
│       ├── schema.prisma     Datasource + generator config
│       ├── user.prisma       User model + Role enum
│       └── migrations/       SQL migration history
│
└── client/
    ├── pages/
    │   ├── _app.tsx          Providers: Antd ConfigProvider, QueryClient, i18n
    │   ├── index.tsx         Home page
    │   ├── login.tsx         Login form with error parsing + i18n
    │   └── register.tsx      Register form
    ├── components/
    │   ├── TopNav.tsx        Horizontal menu + LocaleDropdown
    │   └── AccountDropdown/
    │       ├── index.tsx     Avatar dropdown (shows user initials or picture)
    │       └── Locales.tsx   Language switcher component
    ├── hooks/
    │   └── use-auth.ts       useRegister, useLogin, useMe (TanStack Query mutations)
    ├── stores/
    │   └── auth.ts           Zustand auth store with localStorage persistence
    ├── lib/
    │   ├── axios.ts          Axios instance (baseURL=/api, withCredentials=true)
    │   ├── query-client.ts   TanStack QueryClient singleton
    │   └── with-translations.ts  getTranslationProps SSG helper
    ├── public/
    │   ├── css/styles.css    Global custom styles
    │   └── locales/
    │       ├── en/{common,errors}.json
    │       └── vi/{common,errors}.json
    └── scripts/
        └── generate-translations.cjs  Syncs translation keys across locale files
```

## Key Files

| File | Purpose |
|------|---------|
| `server/server.ts` | Bootstrap: connects DB, loads routes, starts HTTP server |
| `server/lib/async-handler.ts` | Central error handling for all route handlers |
| `server/lib/zod-error-map.ts` | Maps Zod errors to `"CODE:param"` format for i18n |
| `client/pages/_app.tsx` | App shell: providers + `useMe()` session verification on load |
| `client/hooks/use-auth.ts` | All auth API calls via TanStack Query |
| `client/stores/auth.ts` | Global user state, persisted to localStorage |
| `packages/types/src/index.ts` | Shared `User` type between client and server |

## State Management Strategy

- **Server state** (API data): TanStack Query — `useMe`, `useLogin`, `useRegister`
- **Client state** (auth user): Zustand with `persist` middleware → `localStorage`
- **Session sync**: `useMe()` runs in `_app.tsx` `SessionVerifier` on every page load — reconciles localStorage with the actual server cookie state

## i18n Strategy

- **2 locales**: `en` (default), `vi`
- **2 namespaces**: `common` (UI labels), `errors` (error messages)
- Error codes from backend (`"FIELD_TOO_SHORT:6"`) are parsed client-side and translated via `errors` namespace
- `getTranslationProps()` is a shared SSG helper used in `getStaticProps` of each page
- `scripts/generate-translations.cjs` keeps locale files in sync
