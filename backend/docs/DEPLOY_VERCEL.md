# Deploying the Backend to Vercel (step-by-step)

This file walks through deploying this Next.js backend to Vercel and connecting it to a Supabase database. It contains a ready-to-paste environment variable block for Vercel.

1) Push your backend to GitHub

- Create a repository on GitHub and push the current code. Example:

```bash
git remote add origin git@github.com:your-org/necta-backend.git
git push -u origin main
```

2) Create or use an existing Supabase project

- Create a Supabase project and copy the following from the Supabase dashboard (Settings → API):
  - Project URL (e.g. `https://xyz.supabase.co`) → `NEXT_PUBLIC_SUPABASE_URL`
  - anon public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - service role key → `SUPABASE_SERVICE_ROLE_KEY` (server-only)

3) Configure environment variables in Vercel

- Go to your Vercel dashboard → select the backend project → Settings → Environment Variables.
- Add the environment variables listed below. For secrets (service role, database URL, payment keys), choose the "Environment Variable" type and mark them as protected (server-only) in Vercel.

Ready-to-paste env var names (values left blank for you to fill):

```
DATABASE_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_API_URL=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
PAYSTACK_SECRET_KEY=
SENTRY_DSN=
NODE_ENV=production
```

Notes:
- `DATABASE_URL` is the Postgres connection string (Supabase provides it). If you will run the schema/seed scripts on a runner, set this secret in both GitHub and Vercel as needed.
- `SUPABASE_SERVICE_ROLE_KEY` must never be exposed to clients — keep it server-side only.
- `NEXT_PUBLIC_*` variables are safe to expose to the browser; non-`NEXT_PUBLIC` names will remain server-only.

4) Deploy on Vercel

- Import repository in Vercel (New Project → Import from GitHub) and follow prompts. Vercel detects Next.js automatically.
- Ensure the environment variables are set in Vercel before the first production deploy so the build or server code can access them.

5) Seed the database

Option A — run locally against the production DB (quick):

```bash
# set env vars locally (example for macOS/Linux)
export DATABASE_URL="postgres://user:pass@host:5432/dbname"
export NEXT_PUBLIC_SUPABASE_URL="https://<proj>.supabase.co"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="<anon_key>"
export SUPABASE_SERVICE_ROLE_KEY="<service_role_key>"

node scripts/apply-schema.mjs   # optional
node scripts/seed.mjs
```

Option B — run as a GitHub Action (safer for automation): configure repo secrets and see `.github/workflows/seed.yml` in this repository.

6) Update your frontend

- In your frontend Vercel project, set `NEXT_PUBLIC_API_URL` to the deployed backend URL (e.g. `https://necta-backend.vercel.app`). Re-deploy the frontend.
- Add your frontend URL to Supabase Auth → Settings → Redirect URLs and Allowed Origins.

7) Smoke test

- Visit your frontend site, attempt login, add items to wishlist/cart, and confirm API calls succeed (Network tab). Check Vercel logs and Supabase table contents if errors occur.

If you want me to push these repository changes and open a PR that wires up GitHub Actions and a README, say "Please add deploy docs & GH Action" and I will commit them.
