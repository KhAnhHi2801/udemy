---
phase: 1
title: "Backend Error Codes"
status: pending
priority: P1
effort: "1h"
dependencies: []
---

# Phase 1: Backend Error Codes

## Overview
Refactor backend error handling to return semantic `{ code, message, status }` instead of hardcoded English strings. Frontend will use `code` for i18n lookup, `message` as English fallback.

## Requirements
- Functional: All Prisma errors return `{ code, message }` in response body with correct HTTP status
- Functional: Zod validation errors use i18n-friendly keys
- Non-functional: No breaking change to existing `/api/auth/register` contract beyond field name change (`error` → `code`)

## Architecture
```
Request error
  └─ asyncHandler catches
      └─ handlePrismaError(error) → { code, message, status }
          └─ res.status(status).json({ code, message })

Zod error
  └─ customErrorMap registered globally in server.ts
      └─ returns { message: "FIELD_TOO_SHORT:3" } style keys
      └─ controller returns { errors: zodIssues }
```

## Related Code Files
- Modify: `server/lib/prisma-error-handler.ts`
- Modify: `server/lib/async-handler.ts`
- Create: `server/lib/zod-error-map.ts`
- Modify: `server/server.ts`

## Implementation Steps

1. **Modify `server/lib/prisma-error-handler.ts`**
   - Add explicit `UNIQUE_FIELD_CODES` map (field name → error code)
   - Change return type to `{ code: string; message: string; status: number }`
   - P2002 → read `error.meta?.target[0]`, lookup `UNIQUE_FIELD_CODES`, fallback to `DATA_ALREADY_EXISTS`
   - P2025 → `{ code: "RECORD_NOT_FOUND", message: "Record not found", status: 404 }`
   - Default → `{ code: "DATABASE_ERROR", message: "Database error", status: 400 }`
   - Unknown error → `{ code: "SOMETHING_WENT_WRONG", message: "Something went wrong", status: 500 }`

   ```ts
   const UNIQUE_FIELD_CODES: Record<string, string> = {
       email: "EMAIL_ALREADY_EXISTS",
       name:  "NAME_ALREADY_EXISTS",
   }

   export const handlePrismaError = (error: unknown): { code: string; message: string; status: number } => {
       if (error instanceof Prisma.PrismaClientKnownRequestError) {
           switch (error.code) {
               case "P2002": {
                   const field = (error.meta?.target as string[])?.[0]
                   const code = field ? (UNIQUE_FIELD_CODES[field] ?? "DATA_ALREADY_EXISTS") : "DATA_ALREADY_EXISTS"
                   return { code, message: "Data already exists", status: 409 }
               }
               case "P2025":
                   return { code: "RECORD_NOT_FOUND", message: "Record not found", status: 404 }
               default:
                   return { code: "DATABASE_ERROR", message: "Database error", status: 400 }
           }
       }
       return { code: "SOMETHING_WENT_WRONG", message: "Something went wrong", status: 500 }
   }
   ```

2. **Modify `server/lib/async-handler.ts`**
   - Destructure `{ code, message, status }` from `handlePrismaError`
   - Return `res.status(status).json({ code, message })`

   ```ts
   const defaultErrorHandler: ErrorHandler = (error, _req, res) => {
       console.error(error)
       const { code, message, status } = handlePrismaError(error)
       res.status(status).json({ code, message })
   }
   ```

3. **Create `server/lib/zod-error-map.ts`**
   - Custom Zod error function for v4 API — returns structured keys for i18n
   - Pattern: `"FIELD_TOO_SHORT:3"` — frontend splits on `:` to extract params
   - **Zod v4 note**: error function receives `(issue)` only, no `ctx` param; use `issue.input` if needed

   ```ts
   import { z } from "zod"

   const zodErrorFn: z.ZodErrorMap = (issue) => {
       switch (issue.code) {
           case "too_small":
               if (issue.type === "string")
                   return `FIELD_TOO_SHORT:${issue.minimum}`
               break
           case "too_big":
               if (issue.type === "string")
                   return `FIELD_TOO_LONG:${issue.maximum}`
               break
           case "invalid_string":
               if (issue.validation === "email") return "INVALID_EMAIL"
               break
       }
       return undefined // fall back to Zod default
   }

   export default zodErrorFn
   ```
   > **Verify**: Check Zod v4 changelog for exact `ZodErrorMap` signature before implementing — v4 is recent and docs may differ from v3 snippets online.

4. **Modify `server/server.ts`**
   - Register error function using Zod v4 API before routes load
   ```ts
   import { z } from "zod"
   import zodErrorFn from "./lib/zod-error-map.ts"
   // Zod v4: use z.config() not z.setErrorMap()
   z.config({ error: zodErrorFn })
   ```

5. **Compile check**
   ```bash
   cd server && npx tsc --noEmit
   ```

## Success Criteria
- [ ] `POST /api/register` with duplicate email → `409 { code: "EMAIL_ALREADY_EXISTS", message: "Data already exists" }`
- [ ] `POST /api/register` with short name → `400 { errors: [{ message: "FIELD_TOO_SHORT:3", ... }] }`
- [ ] `POST /api/register` with invalid email → `400 { errors: [{ message: "INVALID_EMAIL", ... }] }`
- [ ] No TypeScript compile errors

## Risk Assessment
- **Zod v4 API**: `z.config({ error })` replaces `z.setErrorMap()` — verify exact signature in Zod v4 docs before implementing
- Zod error fn changes ALL zod schemas globally — test all validation paths after
- `FIELD_TOO_SHORT:3` pattern is non-standard; frontend must split on `:` to extract minimum value
