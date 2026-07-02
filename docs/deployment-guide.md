# Deployment Guide

## Architecture

```
Internet → [Client: Vercel/Netlify] → [Server: Railway/Render/VPS] → [PostgreSQL]
```

## Environment Variables

### Server (required)
```env
DATABASE_URL=postgresql://user:password@host:5432/udemy_prod
JWT_SECRET=<random 64-char string>
CLIENT_URL=https://your-frontend-domain.com
PORT=8000
NODE_ENV=production
```

### Client (required)
```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com
```

## Pre-Deployment Checklist

- [ ] `JWT_SECRET` is a strong random string (not reused from dev)
- [ ] `DATABASE_URL` points to production database
- [ ] `CLIENT_URL` on server matches the actual frontend URL (CORS)
- [ ] Cookie `secure: true` is active (`NODE_ENV=production` in server)
- [ ] No hardcoded credentials in source code
- [ ] Prisma migrations applied: `npx prisma migrate deploy`

## Build Commands

### Server
```bash
# No build step — runs directly with ts-node
# For production, compile first:
npx tsc
node dist/server.js
```

### Client
```bash
cd client
pnpm build    # Next.js static + SSR build
pnpm start    # Start production server
```

## Deploy to Railway (Server)

1. Connect GitHub repo to Railway
2. Set root directory to `server/`
3. Set start command: `npx ts-node server.ts`
4. Add all server environment variables
5. Provision PostgreSQL plugin → copy `DATABASE_URL`
6. Run migrations: `npx prisma migrate deploy`

## Deploy to Vercel (Client)

1. Connect GitHub repo
2. Set root directory to `client/`
3. Framework preset: Next.js
4. Add `NEXT_PUBLIC_API_URL` environment variable
5. Deploy

## Database

- Production: managed PostgreSQL (Railway, Supabase, Neon, or RDS)
- Run migrations: `cd server && npx prisma migrate deploy`
- Never run `migrate dev` in production (use `migrate deploy`)
- Back up before every migration

## Monitoring

- Server logs via `morgan("dev")` — switch to `morgan("combined")` in production
- Consider adding structured logging (pino) for production observability
