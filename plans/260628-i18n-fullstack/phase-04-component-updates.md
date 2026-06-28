---
phase: 4
title: "Component Updates"
status: pending
priority: P1
effort: "1.5h"
dependencies: [2, 3]
---

# Phase 4: Component Updates

## Overview
Update all pages and components to use `useTranslation` hooks. Add language switcher to TopNav. Handle Zod validation error param parsing in error display. Add `getStaticProps` to each page for SSR locale loading.

## Requirements
- Functional: Register page displays text in selected language
- Functional: API error from backend uses `code` to lookup translation, falls back to `message`
- Functional: Zod validation errors parse param from `FIELD_TOO_SHORT:3` pattern
- Functional: Language switcher in TopNav changes locale and persists via URL + cookie

## Architecture
```
TopNav
  └─ useRouter() → router.push(path, asPath, { locale })
  └─ shows current locale, toggle button EN ↔ VI

register.tsx
  └─ useTranslation(["common", "errors"])
  └─ t("common:register.title") for UI text
  └─ parseApiError(code, message) → t(`errors:${code}`, message)
  └─ parseZodError(message) → split "FIELD_TOO_SHORT:3" → t("errors:FIELD_TOO_SHORT", { min: "3" })
  └─ getStaticProps → serverSideTranslations(locale, ["common", "errors"])
```

## Related Code Files
- Modify: `client/components/TopNav.tsx`
- Modify: `client/pages/register.tsx`
- Modify: `client/pages/login.tsx`

## Implementation Steps

1. **Create error parsing helpers (inline in register or extract to `lib/i18n-error.ts`)**

   ```ts
   // Parse API error: { code, message } → translated string
   const parseApiError = (t: TFunction, code?: string, fallback?: string): string => {
       if (!code) return fallback ?? t("errors:SOMETHING_WENT_WRONG")
       return t(`errors:${code}`, fallback ?? code)
   }

   // Parse Zod error message key: "FIELD_TOO_SHORT:3" → translated with param
   const parseZodError = (t: TFunction, message: string): string => {
       const [key, param] = message.split(":")
       if (param) {
           // Determine if param is min or max based on key
           const params = key === "FIELD_TOO_LONG" ? { max: param } : { min: param }
           return t(`errors:${key}`, params)
       }
       return t(`errors:${key}`, message) // fallback to raw message if no translation
   }
   ```

2. **Modify `client/components/TopNav.tsx`**
   - **Bug fix required**: existing file uses `"use client"` + `usePathname` from `next/navigation` — both are App Router APIs and broken in Pages Router
   - Remove `"use client"` directive
   - Replace `usePathname` from `next/navigation` → `useRouter().pathname` from `next/router`
   - Add language switcher using `useRouter`
   - Preserve existing Ant Design `<Menu>` + nav items

   ```tsx
   // Remove "use client" — Pages Router doesn't use this directive
   import { useRouter } from "next/router"
   import { useTranslation } from "next-i18next"
   import { Menu } from "antd"
   import Link from "next/link"
   import { AppstoreOutlined, UserAddOutlined, LoginOutlined } from "@ant-design/icons"
   import type { MenuProps } from "antd"

   const items: MenuProps["items"] = [
       { key: "/", icon: <AppstoreOutlined />, label: <Link href="/">App</Link> },
       { key: "/login", icon: <LoginOutlined />, label: <Link href="/login">Login</Link> },
       { key: "/register", icon: <UserAddOutlined />, label: <Link href="/register">Register</Link> },
   ]

   const TopNav = () => {
       const router = useRouter()
       const { t } = useTranslation("common")

       const toggleLocale = () => {
           const nextLocale = router.locale === "en" ? "vi" : "en"
           router.push(router.pathname, router.asPath, { locale: nextLocale })
       }

       return (
           <div style={{ display: "flex", alignItems: "center" }}>
               <Menu mode="horizontal" items={items} selectedKeys={[router.pathname]} style={{ flex: 1 }} />
               <button onClick={toggleLocale} style={{ marginLeft: 16 }}>
                   {router.locale === "en" ? "VI" : "EN"}
               </button>
           </div>
       )
   }

   export default TopNav
   ```

3. **Modify `client/pages/register.tsx`**
   - Add `useTranslation(["common", "errors"])`
   - Replace hardcoded strings with `t()` calls
   - Add error state + display with translation
   - Add `getStaticProps` for locale loading
   - **Hook fix**: `useRegister()` takes no params — pass `onError` to `mutate` call (TanStack Query v5 pattern)

   ```tsx
   import { useTranslation } from "next-i18next"
   import { serverSideTranslations } from "next-i18next/serverSideTranslations"
   import type { GetStaticProps } from "next"

   const Register = () => {
       const { t } = useTranslation(["common", "errors"])
       const [apiError, setApiError] = useState<{ code?: string; message?: string } | null>(null)

       // useRegister() takes no params — onError goes in mutate() call, not hook call
       const { mutate: registerUser } = useRegister()

       const handleSubmit = (e: React.FormEvent) => {
           e.preventDefault()
           registerUser(
               { name, email, password },
               {
                   onError: (err: any) => {
                       const data = err.response?.data
                       setApiError({ code: data?.code, message: data?.message })
                   }
               }
           )
       }

       return (
           <>
               <h1 className="jumbotron bg-primary text-center square">{t("common:register.title")}</h1>
               {apiError && (
                   <div className="alert alert-danger">
                       {parseApiError(t, apiError.code, apiError.message)}
                   </div>
               )}
               <div className="container col-md-4 offset-md-4 pb-5">
                   <form onSubmit={handleSubmit}>
                       <input placeholder={t("common:register.name_placeholder")} ... />
                       <input placeholder={t("common:register.email_placeholder")} ... />
                       <input placeholder={t("common:register.password_placeholder")} ... />
                       <button type="submit">{t("common:register.submit")}</button>
                   </form>
               </div>
           </>
       )
   }

   export const getStaticProps: GetStaticProps = async ({ locale }) => ({
       props: { ...(await serverSideTranslations(locale ?? "en", ["common", "errors"])) }
   })

   export default Register
   ```

4. **Modify `client/pages/login.tsx`**
   - Add `useTranslation("common")`
   - Replace hardcoded strings
   - Add `getStaticProps`

   ```tsx
   import { useTranslation } from "next-i18next"
   import { serverSideTranslations } from "next-i18next/serverSideTranslations"
   import type { GetStaticProps } from "next"

   const Login = () => {
       const { t } = useTranslation("common")
       return (
           <>
               <h1>{t("login.title")}</h1>
               <p>{t("login.subtitle")}</p>
           </>
       )
   }

   export const getStaticProps: GetStaticProps = async ({ locale }) => ({
       props: { ...(await serverSideTranslations(locale ?? "en", ["common"])) }
   })

   export default Login
   ```

5. **Check `hooks/use-auth.ts`** — verify `useRegister` hook exposes `onError` or check how errors propagate, adjust error handling accordingly.

6. **Compile check**
   ```bash
   cd client && npx tsc --noEmit
   ```

7. **Manual test**
   - Open `/register` → should show English
   - Click VI → URL changes to `/vi/register`, text changes to Vietnamese
   - Submit duplicate email → shows "Email already registered" / "Email đã được đăng ký"
   - Submit short name → shows "Must be at least 3 characters" / "Phải có ít nhất 3 ký tự"

## Success Criteria
- [ ] `TopNav.tsx` shows EN/VI toggle, clicking it changes URL locale
- [ ] `register.tsx` all text uses `t()` — no hardcoded English strings in JSX
- [ ] `login.tsx` all text uses `t()`
- [ ] Duplicate email error → correct message in both EN and VI
- [ ] Zod validation error → correct message with interpolated param in both languages
- [ ] `getStaticProps` present on both pages
- [ ] No TypeScript compile errors
- [ ] Dev server runs without console errors

## Risk Assessment
- **TopNav App Router bug**: existing `usePathname` from `next/navigation` + `"use client"` must be fixed — this is a pre-existing bug, not introduced by i18n
- `next-i18next` requires `getStaticProps`/`getServerSideProps` on every page — easy to forget for new pages
- Zod error param parsing (`split(":")`) is fragile if message format changes in Phase 1
- `err.response?.data` assumes axios error shape — verify axios interceptor in `lib/axios.ts` doesn't transform errors
