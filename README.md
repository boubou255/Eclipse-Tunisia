# Eclipse Tunisia

Website for selling tours to the total solar eclipse of **2 August 2027**, seen from Sfax and the Kerkennah Islands. It has a public site in 8 languages and an admin dashboard for tours, per-tour questions and booking requests.

Built with Next.js 15 (App Router, TypeScript), Prisma and SQLite. Switch to Postgres for production.

## Run it locally

```bash
npm install
cp .env.example .env      # then set ADMIN_PASSWORD and ADMIN_SECRET
npm run setup             # creates the database and adds 3 example tours
npm run dev
```

- Website: http://localhost:3000. It redirects to the visitor's language.
- Admin: http://localhost:3000/admin. Sign in with `ADMIN_PASSWORD`.

## What the admin can do

- **Tours**: create, edit, publish/unpublish and delete. Each tour has a title, summary, description, day-by-day itinerary and "included" list for each language. If a language has no translation, the English text is shown.
- **Questions per tour**: there are two kinds.
  - *FAQ*: a question and answer shown on the tour page.
  - *Booking form*: asked when someone books. The format can be short text, long text, a list of choices or yes/no, and it can be required. Answers are saved with the booking.
- **Bookings**: see every request, filter by status or tour, and confirm or cancel. Cancelled requests free their places. Places left are shown live on the website.
- **Payments**: each booking shows its plan, what was paid and what is still owed, every Konnect payment with its status, a button to re-check the status with Konnect, and a button to create a payment link for the balance.

## Online payment with Konnect

Travellers can pay a **30% deposit** or **100%** when they book, by bank card, e-DINAR or Konnect wallet.

1. Open `.env` and fill in the Konnect section (copied from `.env.example`):
   `KONNECT_API_KEY`, `KONNECT_WALLET_ID`, `KONNECT_MODE`, `KONNECT_CURRENCY`, `EUR_TO_TND_RATE`, `DEPOSIT_PERCENT`, `SITE_URL`.
2. Restart the site. The booking form now shows the payment choice. With either key empty, the form stays a free booking request.
3. Test with `KONNECT_MODE="sandbox"` first, then switch to `"production"`.

How it works:

- The booking is saved, a Konnect checkout is created (`POST /payments/init-payment`) and the traveller is sent to Konnect.
- Konnect sends them back to `/{lang}/tours/{tour}/payment` and calls `SITE_URL/api/konnect/webhook`. In both cases the site asks Konnect for the real status (`GET /payments/{ref}`) instead of trusting the request.
- A completed payment marks the booking as confirmed and records the amount paid.
- Unpaid online bookings hold their places for 35 minutes; after that the places go back on sale. The traveller can retry from the payment page.
- For deposit bookings, open the booking in the admin and click **Create link for the balance** to get a Konnect link for the remaining 70%.

Prices stay in euros on the site. With `KONNECT_CURRENCY="TND"` the amount is converted with `EUR_TO_TND_RATE` and sent in millimes; with EUR or USD it is sent in cents. Check with Konnect which currencies your wallet accepts.

## Languages

English, Français, Deutsch, Italiano, Español, العربية (right-to-left), 日本語, 中文.
Interface text lives in `src/i18n/dictionaries/`. To add a language, add a file there and add its code to `src/i18n/config.ts`.

## Things to edit before going live

- `src/lib/site.ts`: agency email, phone and city shown in the footer.
- The example tours: prices, dates and itineraries are placeholders. Edit them in /admin.
- The eclipse facts (about 10:10 local time, about 5 min 40 s in Sfax, Sun about 56° high) come from published eclipse guides. Check them against an official source before printing anything.

## Deploying

Vercel, Railway, Render or a VPS all work.

1. Create a Postgres database (for example Neon or Supabase).
2. In `prisma/schema.prisma`, change `provider = "sqlite"` to `provider = "postgresql"`.
3. Set `DATABASE_URL`, `ADMIN_PASSWORD` and `ADMIN_SECRET` in the host's environment settings.
4. Run `npx prisma db push` once, and optionally `npm run db:seed`, then `npm run build`.

## Design notes

The home page hero is a scroll-driven eclipse. As you scroll, the Moon moves over the Sun, the sky darkens, the corona and stars appear, and the key facts are revealed. Visitors who prefer reduced motion see totality as a still image.

Colours come from the place itself: indigo for the sky at totality, olive for Sfax's olive groves, and a pale salt-flat ground. Type is Bodoni Moda with Schibsted Grotesk. Arabic uses Noto Kufi Arabic with IBM Plex Sans Arabic.

The `.claude/skills/` folder holds Anthropic's `frontend-design` and `webapp-testing` skills, used to build and check the site.
