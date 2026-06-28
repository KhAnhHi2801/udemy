# i18n Full-Stack — Brainstorm Report
Date: 2026-06-28

## Problem Statement
Hardcoded English strings scattered across backend (error messages, validation messages, response messages) and frontend (JSX text). Need EN + VI support without coupling backend to UI language concerns.

## Requirements
- Languages: EN (default) + VI
- Frontend owns all translation logic
- Backend sends semantic codes, not translated strings
- Language persists via URL routing + cookie
- Zod validation errors also i18n'd

## Approach Evaluated

| Approach | Verdict |
|---|---|
| Backend translates (Accept-Language) | Rejected — couples backend to UI concerns |
| Frontend translates via error codes | Selected — clean separation |
| Hybrid code + fallback message | Adopted as enhancement to selected approach |

## Final Design

### Backend (Express + Prisma)

**`prisma-error-handler.ts`** — explicit code map, return `{ code, message, status }`:
```ts
const UNIQUE_FIELD_CODES: Record<string, string> = {
    email: "EMAIL_ALREADY_EXISTS",
    name:  "NAME_ALREADY_EXISTS",
}

case "P2002": {
    const field = (error.meta?.target as string[])?.[0]
    const code = field ? (UNIQUE_FIELD_CODES[field] ?? "DATA_ALREADY_EXISTS") : "DATA_ALREADY_EXISTS"
    return { code, message: "Data already exists", status: 409 }
}
case "P2025": return { code: "RECORD_NOT_FOUND", message: "Record not found", status: 404 }
```

**`async-handler.ts`** — use status from error handler, return `{ code, message }`:
```ts
res.status(status).json({ code, message })
```

**Zod validation** — use Zod custom error map to return i18n keys instead of hardcoded strings:
```ts
// lib/zod-error-map.ts
const customErrorMap: z.ZodErrorMap = (issue, ctx) => {
    if (issue.code === z.ZodIssueCode.too_small)
        return { message: `FIELD_TOO_SHORT:${issue.minimum}` }
    // etc.
    return { message: ctx.defaultError }
}
z.setErrorMap(customErrorMap)
```

### Frontend (Next.js Pages Router)

**Package**: `next-i18next`

**Translation file structure**:
```
client/public/locales/
├── en/
│   ├── common.json    ← UI text (labels, placeholders, nav)
│   └── errors.json    ← error codes → messages
└── vi/
    ├── common.json
    └── errors.json
```

**URL routing** (built-in Next.js i18n):
```js
// next.config.js
i18n: {
    locales: ["en", "vi"],
    defaultLocale: "en",
    localeDetection: true,  // reads Accept-Language + cookie
}
```
Routes: `/register` (EN default), `/vi/register` (VI)

**Usage in components**:
```tsx
const { t } = useTranslation(["common", "errors"])
<h1>{t("common:register.title")}</h1>
// API error with fallback
<p>{t(`errors:${apiError.code}`, apiError.message)}</p>
```

**Language switcher** in `TopNav.tsx`:
```tsx
const router = useRouter()
router.push(router.pathname, router.asPath, { locale: "vi" })
```

## Files to Modify/Create

### Backend
- `server/lib/prisma-error-handler.ts` — explicit codes + `{ code, message, status }`
- `server/lib/async-handler.ts` — response format `{ code, message }`
- `server/lib/zod-error-map.ts` — NEW, Zod custom error map
- `server/server.ts` — register Zod error map on startup

### Frontend
- `client/next.config.js` — NEW, i18n routing config
- `client/next-i18next.config.js` — NEW, i18n library config
- `client/pages/_app.tsx` — wrap with `appWithTranslation`
- `client/pages/register.tsx` — `useTranslation` + `getStaticProps`
- `client/components/TopNav.tsx` — language switcher
- `client/public/locales/en/common.json` — NEW
- `client/public/locales/en/errors.json` — NEW
- `client/public/locales/vi/common.json` — NEW
- `client/public/locales/vi/errors.json` — NEW

## Key Decisions
- Backend is locale-agnostic — never reads Accept-Language
- Error response always has both `code` (for i18n lookup) and `message` (English fallback)
- URL is source of truth for locale (`/vi/*`), cookie remembers preference for redirect
- Zod validation uses code pattern `FIELD_TOO_SHORT:3` — frontend splits and formats

## Risk
- Zod error map pattern (`FIELD_TOO_SHORT:3`) is non-standard — may need refinement
- `next-i18next` requires `getStaticProps`/`getServerSideProps` on every page — boilerplate per page
