# Udemy Clone

A fullstack e-learning platform monorepo with authentication, course management, and Stripe payment integration (planned).

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 16 (Pages Router), React 19, Ant Design 6, Bootstrap 5 |
| State | Zustand 5 (persist), TanStack Query 5 |
| Backend | Express 5, TypeScript, ts-node |
| Database | PostgreSQL via Prisma 7 |
| Auth | JWT (httpOnly cookie), bcrypt |
| i18n | next-i18next, i18next (en/vi) |
| Monorepo | pnpm workspaces |

## Project Structure

```
udemy/
├── client/          # Next.js frontend
├── server/          # Express API
├── packages/
│   └── types/       # Shared TypeScript types (@udemy/types)
├── docs/            # Project documentation
└── plans/           # Implementation plans
```

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL

### Setup

```bash
# Install dependencies
pnpm install

# Configure environment
cp server/.env.example server/.env
cp client/.env.example client/.env
# Edit both .env files with your values

# Run database migrations
cd server && npx prisma migrate dev

# Start development servers (client + server in parallel)
pnpm dev
```

### Environment Variables

**server/.env**
```
DATABASE_URL=postgresql://user:password@localhost:5432/udemy
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:3000
PORT=8000
```

**client/.env**
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/register | No | Register new user |
| POST | /api/login | No | Login, sets JWT cookie |
| POST | /api/logout | No | Clear JWT cookie |
| GET | /api/me | Yes | Get current user |

## Scripts

```bash
pnpm dev                        # Start all services
cd client && pnpm trans         # Auto-generate translation keys
cd server && npx prisma studio  # Open Prisma DB GUI
```

## Documentation

- [Project Overview & Requirements](docs/project-overview-pdr.md)
- [System Architecture](docs/system-architecture.md)
- [Codebase Summary](docs/codebase-summary.md)
- [Code Standards](docs/code-standards.md)
- [Design Guidelines](docs/design-guidelines.md)
- [Deployment Guide](docs/deployment-guide.md)
- [Project Roadmap](docs/project-roadmap.md)
