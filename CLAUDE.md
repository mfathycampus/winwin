# WinWin — Codebase Guide

## Project Overview
Performance-based social media marketing platform for Saudi Arabia.
- Users share brand content → earn credits (SAR)
- Brands pay only after real posts verified
- Platform earns 5% commission on credits, 15% on Prime Sessions

## Monorepo Structure
```
packages/
  db/          Prisma schema + migrations (PostgreSQL)
  shared/      Shared types, constants, credit calculation engine
  api/         Express backend (Node.js + TypeScript)
apps/
  web/         Brand dashboard (Next.js 14, RTL Arabic)
  mobile/      User app (React Native + Expo, RTL Arabic)
  admin/       Admin panel (Next.js 14) — not yet built
```

## Key Business Logic
- Credit formula: `calculateCredit()` in `packages/shared/src/credit.ts`
- Platform multipliers: Snap×2.0, TikTok×1.8, Instagram×1.5, X×1.0
- Time multipliers: Evening×2.5, Lunch×1.8, Morning×1.3, Ramadan×3.0
- Commission: 5% of credit value, 15% of session budget
- Verification: 30-min window (credits release if post not deleted within window)
- Credit expiry: 90 days

## Dev Setup
```bash
# 1. Start DB + Redis
docker-compose up -d

# 2. Install deps
npm install

# 3. Generate Prisma client + run migrations
cd packages/db && npx prisma migrate dev && npx prisma db seed

# 4. Start API (in packages/api)
npm run dev

# 5. Start web dashboard (in apps/web)
npm run dev

# 6. Start mobile (in apps/mobile)
npx expo start
```

## API Endpoints
- POST /api/auth/otp/send — Send OTP to Saudi phone
- POST /api/auth/otp/verify — Verify OTP, get tokens
- GET  /api/campaigns/feed — Home feed for user
- POST /api/posts — Submit a post (triggers verification)
- GET  /api/users/me/wallet — User wallet balance

## OTP in Dev Mode
Fixed code `123456` works for any phone number in development.

## Currency
All amounts in SAR (Saudi Riyal). VAT 15% applied to subscriptions.

## Language
Arabic (RTL) is primary. Font: Cairo (Google Fonts).
All UI strings: Arabic first, English toggle planned for v2.
