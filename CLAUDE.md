# Eclipse Tunisia

Website for a travel agency selling tours to the total solar eclipse of 2 August 2027 (Sfax, Tunisia).
Public site in 8 languages, admin dashboard, Konnect online payment.

## Commands

- `npm install` then `npm run setup`: creates the SQLite database (`prisma/dev.db`) and adds 3 example tours
- `npm run dev`: http://localhost:3000 (site), http://localhost:3000/admin (admin, password = `ADMIN_PASSWORD` in `.env`)
- `npm run lint`: TypeScript check (`tsc --noEmit`). Run it after every change.
- `npm run build`: production build
- `npx prisma db push`: apply changes made to `prisma/schema.prisma`
- `npx prisma studio`: browse the database

`.env` is not committed. Copy `.env.example` to `.env` first.

## Stack and layout

Next.js 15 App Router, React 19, TypeScript strict, Prisma 6 (SQLite locally, Postgres in production), plain CSS.

- `src/app/[locale]/`: public pages; `src/app/admin/`: admin (own root layout, `(panel)` group requires login)
- `src/i18n/dictionaries/*.ts`: interface text; every language file is typed against `en.ts`, so add new keys to all 8
- `src/lib/tours.ts`: queries, language fallback, places left (`holdsPlaces()`)
- `src/lib/konnect.ts`: Konnect payment API; `src/app/api/konnect/webhook/route.ts`: webhook
- `src/lib/auth.ts`: admin cookie session; every admin server action must call `requireAdmin()`
- `src/app/site.css` (public) and `src/app/admin/admin.css` (admin): design tokens at the top

## Conventions

- Server components query Prisma directly; mutations are server actions, not API routes.
- Tour and question content lives in translation rows (`TourTranslation`, `TourQuestionTranslation`), one per language; English is the fallback.
- Never trust Konnect redirects or webhooks on their own: always confirm with `syncPayment()`.
- Design guidance for UI work: `.claude/skills/frontend-design/SKILL.md`. Browser testing: `.claude/skills/webapp-testing/`.
