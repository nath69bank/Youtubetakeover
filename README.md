# YouTube Takeover

A private studio for running the **Wirral AI** YouTube channel: an AI-powered,
lead-generating channel about AI, websites and SEO for UK business owners.

It turns the [playbook](playbook/README.md) (the 10-prompt growth framework, run
and filled in for Wirral AI) into a working app: plan, script, publish, track and
improve every video, and see which videos bring in clients.

## What's inside

| Area | What it does |
|---|---|
| **Dashboard** | Day X of 90, KPIs against the day-30/60/90 milestones, this week's videos, pipeline, pillar mix |
| **Videos** | Board from idea → published. Each video has a workspace: brief, titles & hook, script, Shorts, publish kit + UTM links, 24-point pre-publish checklist, stats, repurposing, AI history |
| **Calendar** | The 13-week plan with weekly tasks, scheduling for unscheduled videos, overdue flags |
| **Ideas bank** | 100 ranked ideas (growth × lead potential), filters, one-click "Produce →" into a video |
| **AI Studio** | All 10 playbook prompts plus production tools, each a form that streams Claude's answer. Copy the prompt to use elsewhere if you prefer |
| **Analytics** | Latest stats per video coloured against benchmarks (CTR, % viewed, 30-s retention, subs/1k, click rate), plus a one-click AI review of your numbers |
| **Leads** | A small CRM: every enquiry, its source video and lead magnet, status, value, conversion |
| **Funnel** | Lead magnets, on-camera CTA lines, tracked-link builder, description & pinned-comment templates |
| **Reviews** | Weekly and monthly reviews (fix one thing, repeat one thing) |
| **Playbook** | The full strategy docs, readable in the app |
| **Settings** | Channel context sent to the AI with every request, plan start date, goal |

New accounts get a **starter kit** on first sign-in: 100 ideas, 20 video concepts
with titles/thumbnails/hooks, the 13-week calendar, 30 Shorts, the first full
script and 5 lead magnets.

**Stack:** Next.js 15 (App Router) · Supabase (Postgres + Auth, row-level security) ·
Claude API (`claude-opus-5-5`, streaming) · deploys to Vercel.

---

## Set up (about 15 minutes)

### 1. Supabase (database + login)
1. Create a free project at [supabase.com](https://supabase.com).
2. **SQL Editor** → paste the contents of [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) → **Run**.
3. **Authentication → Sign In / Providers → Email**: keep email enabled. Turning off
   "Confirm email" lets you sign in straight after creating your account.
4. **Project Settings → API**: copy the **Project URL** and the **anon / publishable** key.

### 2. Anthropic (the AI)
Create an API key at [console.anthropic.com](https://console.anthropic.com) → API keys.
Usage is pay-as-you-go; a full script is typically a few pence.

### 3. Vercel (hosting)
1. [vercel.com/new](https://vercel.com/new) → import **nath69bank/Youtubetakeover**.
   Framework preset: **Next.js** (auto-detected).
2. Add these **Environment Variables** before deploying:

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon / publishable key |
   | `ANTHROPIC_API_KEY` | Your Anthropic API key |
   | `ALLOWED_EMAILS` | The email(s) allowed to use the studio, comma-separated |

3. **Deploy**, open the site, choose **Create your account** with an allowed email,
   then **Load the starter kit**.
4. Back in Supabase → **Authentication → URL Configuration**, set the **Site URL**
   to your Vercel URL (used in confirmation emails).

> **Keep it private:** anyone not in `ALLOWED_EMAILS` is signed out immediately.
> For belt and braces, turn off new sign-ups in Supabase (Authentication → Sign In / Providers)
> once your account exists.

---

## Run locally

```bash
npm install
cp .env.example .env.local   # fill in the values
npm run dev                   # http://localhost:3000
```

For a fully local database, the [Supabase CLI](https://supabase.com/docs/guides/local-development)
works with this repo: `npx supabase start` applies the migration and prints a local URL and anon key.

## How the AI works

- Every tool is defined in [`lib/tools.ts`](lib/tools.ts): a small form plus the prompt it builds.
  Add a tool there and it appears in the AI Studio.
- [`app/api/generate/route.ts`](app/api/generate/route.ts) streams the answer from
  `claude-opus-5-5` (effort `medium`), with your **Settings → Channel context** as the
  system prompt. If the model declines a request, Anthropic's server-side fallback
  re-runs it on a recommended fallback model.
- Every answer is saved to AI history (per video where relevant) and can be saved
  straight into a video's title options, script or description.
- AI drafts are a starting point. The originality rule (real person, real experience,
  real screen, rewritten in your own words) is built into the checklist.

## Data & privacy

- Each table has row-level security: a user can only read and write their own rows,
  so the app can host more accounts later without code changes.
- Leads hold personal data: only store what you need, and follow UK GDPR/PECR
  (consent before newsletters or WhatsApp broadcasts).
- The starter kit is generated from the playbook by `node scripts/build-seed.mjs`.
