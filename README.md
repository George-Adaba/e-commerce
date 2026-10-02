# Shop Assignment

A Next.js foundation for a shop that will use Supabase, Google authentication, and Mailgun. Shop features have intentionally not been implemented yet.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS

## Local setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local`.
3. Add credentials from Supabase, Google Cloud Console, and Mailgun to `.env.local`.
4. Start the development server with `npm run dev`.

Open [http://localhost:3000](http://localhost:3000) after the server starts.

## Environment variables

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: browser-safe Supabase key.
- `SUPABASE_SERVICE_ROLE_KEY`: server-only key; never expose it to the browser.
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`: Google OAuth web credentials. Configure the same credentials in Supabase Auth.
- `MAILGUN_API_KEY`, `MAILGUN_DOMAIN`, and `MAILGUN_FROM_EMAIL`: server-side Mailgun email settings.
- `NEXT_PUBLIC_APP_URL`: application base URL used for OAuth redirects.

Never commit `.env.local` or paste real credentials into `.env.example`.

## Project structure

- `src/app`: routes, layouts, and global styles.
- `src/components`: reusable UI components.
- `src/lib`: server and browser utility modules, including future service clients.
- `src/types`: shared TypeScript types.

## Checks

```bash
npm run lint
npm run typecheck
npm run build
```
