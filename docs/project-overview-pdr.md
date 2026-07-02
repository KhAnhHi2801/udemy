# Project Overview & Product Development Requirements (PDR)

## Vision

A fullstack Udemy-like e-learning marketplace where instructors create and sell courses, and students enroll and learn.

## User Roles

| Role | Description |
|------|-------------|
| Subscriber | Default role. Can browse and enroll in courses |
| Instructor | Can create, publish, and manage courses. Requires Stripe account |
| Admin | Full platform management |

## Core Features

### Phase 1 — Authentication (Current)
- [x] User registration with name, email, password
- [x] JWT-based login via httpOnly cookie
- [x] Session persistence via `/api/me`
- [x] Logout
- [x] i18n support (English / Vietnamese)

### Phase 2 — Instructor & Course Management (Planned)
- [ ] Instructor onboarding (role upgrade)
- [ ] Stripe Connect account setup for instructors
- [ ] Course CRUD (title, description, image, price, category)
- [ ] Lesson management (video upload, text content)
- [ ] Course publish/unpublish

### Phase 3 — Student Experience (Planned)
- [ ] Course catalog & search
- [ ] Course enrollment (free & paid)
- [ ] Stripe Checkout for paid courses
- [ ] Progress tracking per lesson
- [ ] Course completion certificate

### Phase 4 — Platform (Planned)
- [ ] Admin dashboard (users, courses, revenue)
- [ ] Instructor earnings & payout via Stripe
- [ ] Course ratings & reviews
- [ ] Email notifications

## Data Model (Current)

```prisma
model User {
  id                String   @id @default(cuid())
  name              String
  email             String   @unique
  password          String
  role              Role     @default(Subscriber)
  picture           String?  @default("/avatar.png")
  stripe_account_id String?
  stripe_seller     Json?
  stripeSession     Json?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}

enum Role { Subscriber | Instructor | Admin }
```

## Non-Functional Requirements

- API response time < 500ms for all endpoints
- Passwords hashed with bcrypt (salt rounds: 12)
- JWT expiry: 7 days
- Cookie: httpOnly, secure in production, sameSite: lax
- i18n: English (default) and Vietnamese
