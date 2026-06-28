---
phase: 2
title: "Frontend i18n Setup"
status: pending
priority: P1
effort: "1h"
dependencies: [1]
---

# Phase 2: Frontend i18n Setup

## Overview
Install and configure `next-i18next` with Next.js built-in i18n URL routing. Supports `/register` (EN default) and `/vi/register` (VI). Language preference persisted via cookie.

## Requirements
- Functional: URL-based locale routing (`/vi/*` for Vietnamese)
- Functional: Language persists across page navigations via cookie
- Functional: Browser language auto-detection on first visit
- Non-functional: Works with Next.js Pages Router (not App Router)

## Architecture
```
next.config.js (i18n routing)
    └─ locales: ["en", "vi"], defaultLocale: "en"
    └─ Next.js handles /vi/* routing automatically

next-i18next.config.js
    └─ localePath: public/locales
    └─ reloadOnPrerender: false (prod)

_app.tsx
    └─ wrapped with appWithTranslation(MyApp, nextI18NextConfig)

Each page
    └─ getStaticProps: serverSideTranslations(locale, ["common", "errors"])
    └─ useTranslation(["common", "errors"]) in component
```

## Related Code Files
- Create: `client/next.config.js`
- Create: `client/next-i18next.config.js`
- Modify: `client/pages/_app.tsx`

## Implementation Steps

1. **Install `next-i18next`**
   ```bash
   cd client && npm install next-i18next react-i18next i18next
   ```

2. **Create `client/next.config.js`**
   ```js
   /** @type {import('next').NextConfig} */
   const { i18n } = require('./next-i18next.config')

   const nextConfig = {
       i18n,
   }

   module.exports = nextConfig
   ```

3. **Create `client/next-i18next.config.js`**
   ```js
   /** @type {import('next-i18next').UserConfig} */
   module.exports = {
       i18n: {
           locales: ["en", "vi"],
           defaultLocale: "en",
           localeDetection: true,
       },
       localePath: "./public/locales",
       reloadOnPrerender: process.env.NODE_ENV === "development",
   }
   ```

4. **Modify `client/pages/_app.tsx`**
   - Import `appWithTranslation` and config
   - Wrap `MyApp` export

   ```tsx
   import { appWithTranslation } from 'next-i18next'
   import nextI18NextConfig from '../next-i18next.config'
   // ... existing imports

   function MyApp({ Component, pageProps }) {
       return (
           <QueryClientProvider client={queryClient}>
               <TopNav />
               <Component {...pageProps} />
           </QueryClientProvider>
       )
   }

   export default appWithTranslation(MyApp, nextI18NextConfig)
   ```

5. **Compile check**
   ```bash
   cd client && npx tsc --noEmit
   ```

## Success Criteria
- [ ] `next-i18next` installed without peer dependency conflicts
- [ ] `next.config.js` and `next-i18next.config.js` created
- [ ] `_app.tsx` exports `appWithTranslation(MyApp, ...)`
- [ ] Dev server starts without errors (`npm run dev`)
- [ ] Navigating to `/vi` returns 200 (locale routing active)
- [ ] No TypeScript compile errors

## Risk Assessment
- `next-i18next` may have peer dep conflicts with React 19 / Next.js 16 — check install output carefully
- `next.config.js` must use CJS (`require`) not ESM (`import`) for Pages Router compatibility
