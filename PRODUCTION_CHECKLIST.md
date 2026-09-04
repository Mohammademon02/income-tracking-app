# Production Deployment Checklist

## Environment Setup

Set these in your host's dashboard (Vercel project settings, or equivalent).
That is where production values belong.

There is deliberately **no `.env.production` file in this repo.** Next.js loads
one *over* `.env` whenever NODE_ENV is production, so a half-filled copy is
worse than none: a placeholder DATABASE_URL gives 500s, and a JWT_SECRET that
does not match the one tokens were signed with gives 401s on every request —
while `.env` sits there looking correct. If you add one, fill in every variable.

- [ ] Set a secure JWT_SECRET (minimum 32 characters — `openssl rand -base64 36`)
- [ ] Configure the production MongoDB connection string
- [ ] Set strong authentication credentials
- [ ] Set NEXT_PUBLIC_APP_TIMEZONE to the timezone that defines your business day
- [ ] Generate the VAPID key pair, or leave all three unset to disable push

## Security
- [ ] All console.log statements are wrapped in development checks
- [ ] No sensitive data in client-side code
- [ ] HTTPS enabled on production domain
- [ ] Secure cookies configuration (already set)
- [ ] Database connection uses SSL/TLS

## Performance
- [ ] Bundle analyzer shows no unnecessary large dependencies
- [ ] Images are optimized (WebP/AVIF formats enabled)
- [ ] PWA caching is properly configured
- [ ] Database indexes are in place (already configured in schema)

## PWA Configuration
- [ ] Manifest.json is properly configured
- [ ] Service worker is registered
- [ ] Icons are properly sized and optimized
- [ ] Push notifications work correctly

## Database
- [ ] Run `npx prisma generate` before deployment
- [ ] Database migrations are applied
- [ ] Database connection is tested
- [ ] Backup strategy is in place

## Monitoring
- [ ] Error tracking is configured
- [ ] Performance monitoring is enabled
- [ ] Analytics are working (Vercel Analytics configured)

## Final Steps
- [ ] Test all functionality in production environment
- [ ] Verify PWA installation works
- [ ] Test push notifications
- [ ] Verify authentication flow
- [ ] Check mobile responsiveness
- [ ] Test offline functionality

## Deployment Commands
```bash
# Build for production
npm run build

# Start production server
npm start

# Analyze bundle size
npm run analyze
```

## Environment Variables Required

`.env.example` carries the full annotated list.

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | yes | MongoDB connection string |
| `APP_USERNAME` | yes | the single application user |
| `APP_PASSWORD` | yes | deliberately not reused as the signing key |
| `JWT_SECRET` | yes | ≥ 32 chars; the app refuses to start without it |
| `NEXT_PUBLIC_APP_TIMEZONE` | no | defaults to `America/Chicago` |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | no | all three, or push is silently disabled |
| `VAPID_PRIVATE_KEY` | no | never expose this one |
| `VAPID_SUBJECT` | no | contact address for push services |

`NODE_ENV` is set by `next build` / `next start`; do not set it yourself.

`NEXTAUTH_URL` used to be listed here, but no code reads it — this app does not
use next-auth. Its session cookie is signed with `JWT_SECRET` directly.