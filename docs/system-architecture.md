# System Architecture

## Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser                                  │
│  Next.js 16 (Pages Router)                                       │
│  ┌──────────┐  ┌───────────────┐  ┌──────────────────────────┐  │
│  │  Pages   │  │  Components   │  │  State                   │  │
│  │ /login   │  │  TopNav       │  │  Zustand (localStorage)  │  │
│  │ /register│  │  AccountDrop  │  │  TanStack Query (server) │  │
│  │ /        │  └───────────────┘  └──────────────────────────┘  │
│  └──────────┘                                                    │
│       │ axios (withCredentials, baseURL=/api)                    │
└───────┼─────────────────────────────────────────────────────────┘
        │ HTTP + httpOnly cookie (JWT)
┌───────┼─────────────────────────────────────────────────────────┐
│       ▼                                                          │
│  Express 5 Server (port 8000)                                    │
│  ┌─────────────┐                                                 │
│  │  Middleware │  cors, json, cookieParser, morgan               │
│  └──────┬──────┘                                                 │
│         │                                                        │
│  ┌──────▼──────────────────────────────────────┐                │
│  │  Routes (auto-loaded from ./routes/)         │                │
│  │  /api/register  /api/login  /api/logout      │                │
│  │  /api/me  ← requireAuth middleware           │                │
│  └──────┬──────────────────────────────────────┘                │
│         │                                                        │
│  ┌──────▼──────────────────────────────────────┐                │
│  │  Controllers                                 │                │
│  │  asyncHandler → Zod validate → business      │                │
│  │  logic → Prisma → response                   │                │
│  └──────┬──────────────────────────────────────┘                │
│         │                                                        │
│  ┌──────▼──────────────────────────────────────┐                │
│  │  Error Pipeline                              │                │
│  │  asyncHandler catches → normalizeError       │                │
│  │  → PrismaErrorNormalizer → HTTP response     │                │
│  └──────┬──────────────────────────────────────┘                │
│         │                                                        │
│  ┌──────▼──────┐                                                 │
│  │  Prisma 7   │  PostgreSQL adapter                             │
│  └──────┬──────┘                                                 │
└─────────┼───────────────────────────────────────────────────────┘
          │
┌─────────▼──────┐
│  PostgreSQL DB │
└────────────────┘
```

## Auth Flow

```
Login Request
     │
     ▼
POST /api/login
     │
     ├─ Zod validate (email, password)
     │
     ├─ prisma.user.findUnique({ email })
     │
     ├─ bcrypt.compare(password, user.password)
     │
     ├─ jwt.sign({ _id: user.id }, JWT_SECRET, { expiresIn: "7d" })
     │
     └─ res.cookie("token", token, { httpOnly: true })
          │
          ▼
     Browser stores cookie (auto-sent on every request)
          │
          ▼
     GET /api/me ← requireAuth reads cookie → attaches req.userId
          │
          ▼
     Zustand store updated via useMe() on app load
```

## Key Design Decisions

### Dynamic Route Loading
`server.ts` auto-imports all files in `./routes/` — adding a new route file is enough, no registration needed.

### Error Normalization Pipeline
All controller errors flow through `asyncHandler` → `normalizeError` → chain of normalizers. New error types (e.g., Stripe errors) only need a new normalizer added to the chain.

### Shared Types via `@udemy/types`
`User` interface lives in `packages/types` and is imported by both client and server — single source of truth.

### Zod Custom Error Map
Validation errors are serialized as `"FIELD_TOO_SHORT:6"` codes instead of English strings, letting the frontend translate them via i18n.

## Packages / Workspace

```
pnpm-workspace.yaml
  workspaces:
    - client      (Next.js)
    - server      (Express)
    - packages/*  (@udemy/types)
```
