# Project Roadmap

## Phase 1 — Authentication ✅ Complete

Core auth flow with JWT cookie session.

| Feature | Status |
|---------|--------|
| User registration (name, email, password) | ✅ Done |
| Login with JWT cookie | ✅ Done |
| Logout | ✅ Done |
| Session verification (`/api/me`) | ✅ Done |
| Protected route middleware (`requireAuth`) | ✅ Done |
| i18n setup (en/vi, common + errors namespaces) | ✅ Done |
| Error normalization pipeline (Zod + Prisma) | ✅ Done |
| Zustand auth store with persistence | ✅ Done |

**Known issues to fix before Phase 2:**
- [ ] User enumeration in login response (`"No user found"` vs `"Invalid password"`)
- [ ] Missing Zod validation on login endpoint
- [ ] Cookie missing `secure` and `sameSite` flags
- [ ] `handleLogout` in TopNav not connected to API or store
- [ ] Hardcoded test credentials in login/register forms
- [ ] `console.log` debug statements in production code

---

## Phase 2 — Instructor & Course Management 🔲 Planned

| Feature | Status |
|---------|--------|
| Instructor role upgrade flow | 🔲 Planned |
| Stripe Connect onboarding for instructors | 🔲 Planned |
| Course model (title, description, image, price, category) | 🔲 Planned |
| Course CRUD API | 🔲 Planned |
| Lesson management (video, text) | 🔲 Planned |
| Course publish / unpublish | 🔲 Planned |
| Image upload (course cover, lesson thumbnails) | 🔲 Planned |
| Instructor dashboard UI | 🔲 Planned |

---

## Phase 3 — Student Experience 🔲 Planned

| Feature | Status |
|---------|--------|
| Course catalog page | 🔲 Planned |
| Course detail page | 🔲 Planned |
| Enrollment (free courses) | 🔲 Planned |
| Stripe Checkout (paid courses) | 🔲 Planned |
| Video player + lesson progress tracking | 🔲 Planned |
| Course completion state | 🔲 Planned |

---

## Phase 4 — Platform Features 🔲 Planned

| Feature | Status |
|---------|--------|
| Course search & filtering | 🔲 Planned |
| Course ratings & reviews | 🔲 Planned |
| Instructor earnings dashboard | 🔲 Planned |
| Stripe payouts to instructors | 🔲 Planned |
| Admin dashboard (users, courses, revenue) | 🔲 Planned |
| Email notifications (welcome, enrollment, payout) | 🔲 Planned |

---

## Technical Debt

| Item | Priority |
|------|----------|
| Add unit tests (server controllers, hooks) | High |
| Add integration tests (auth flow E2E) | High |
| Switch server to compiled JS for production | Medium |
| Add structured logging (pino) | Medium |
| ESLint config for client | Low |
