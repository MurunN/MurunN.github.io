# SteppeQuest Next — Full-stack MVP

SteppeQuest-ийн 2-р шатны бүрэн код:

- Next.js App Router + TypeScript
- Google OAuth login (NextAuth)
- Prisma + SQLite local database
- Admin timeline CMS
- Монгол/Англи dynamic content
- Canvas нум харвааны mini game
- Motion animations
- XP, badge, profile, game history
- Guest play + login хийсний дараа database progress save

## 1. Шаардлага

- Node.js 20.9+ (Node 22 санал болгоно)
- Google Cloud account

## 2. Install

```bash
npm install
```

`.env.example`-ийг `.env` болгон хуулна:

```bash
cp .env.example .env
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

## 3. Google login тохируулах

Google Cloud Console дээр:

1. Project үүсгэнэ.
2. OAuth consent screen тохируулна.
3. Credentials → Create Credentials → OAuth client ID.
4. Application type: **Web application**.
5. Authorized JavaScript origin:

```text
http://localhost:3000
```

6. Authorized redirect URI:

```text
http://localhost:3000/api/auth/callback/google
```

7. Client ID, Client Secret-ийг `.env` файлд оруулна.

```env
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="a-long-random-secret"
ADMIN_EMAILS="your-google-email@gmail.com"
```

`NEXTAUTH_SECRET` үүсгэх жишээ:

```bash
openssl rand -base64 32
```

## 4. Database үүсгэх

```bash
npx prisma migrate dev --name init
npm run db:seed
```

Database харах:

```bash
npm run db:studio
```

## 5. Ажиллуулах

```bash
npm run dev
```

Browser:

```text
http://localhost:3000
```

## Үндсэн route

- `/` — animated landing + dynamic timeline
- `/game/archery` — нум харвааны game
- `/login` — Google login
- `/profile` — XP, badge, game history
- `/admin` — timeline CMS, зөвхөн `ADMIN_EMAILS` хэрэглэгч

## Badge дүрэм

- `WELCOME_TRAVELER` — анхны Google login
- `FIRST_SHOT` — эхний тоглолт
- `BULLSEYE` — байны гол оносон
- `MASTER_ARCHER` — нэг тоглолтоор 350+ оноо
- `STEPPE_HISTORIAN` — нийт 100 XP

## Production database

Одоогийн schema local development-д SQLite ашиглана. Vercel зэрэг serverless production орчинд PostgreSQL/Neon/Supabase ашиглаж, `prisma/schema.prisma` datasource provider-ийг `postgresql` болгоод production `DATABASE_URL` тохируулна.

## Project structure

```text
prisma/
  schema.prisma
  seed.ts
src/
  app/
    api/auth/[...nextauth]/route.ts
    api/game/score/route.ts
    api/admin/timeline/...
    game/archery/page.tsx
    profile/page.tsx
    admin/page.tsx
    login/page.tsx
  components/
    HomeExperience.tsx
    ArcheryGame.tsx
    ProfileDashboard.tsx
    AdminTimeline.tsx
  lib/
    auth.ts
    prisma.ts
    badges.ts
```
