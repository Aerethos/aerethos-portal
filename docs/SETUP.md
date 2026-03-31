# AerEthos Portal — Complete Setup Guide

This guide walks you through everything needed to take the portal from 
local prototype to fully live production system integrated with aerethos.com.

---

## Overview of the stack

| Service       | What it does                                      | Cost     |
|---------------|---------------------------------------------------|----------|
| Supabase      | Database, auth, file storage                      | Free tier |
| Vercel        | Hosting (same as aerethos.com)                    | Already have |
| Spotify API   | Track search + album artwork                      | Free     |
| Resend        | Student confirmation emails + admin notifications | Free tier |

---

## PART 1 — Supabase Setup

### Step 1 — Create your Supabase project

1. Go to https://supabase.com and sign up (free)
2. Click **New Project**
3. Name it `aerethos-portal`
4. Choose a database password — save it somewhere safe
5. Region: **EU West (Ireland)** — important for GDPR
6. Click **Create new project** — takes about 2 minutes

### Step 2 — Create the database tables

Go to your Supabase project → **SQL Editor** → **New query**
Paste and run the following SQL:

```sql
-- ── SCHOOLS ──────────────────────────────────────────────────────────────────
create table schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  year text not null,
  deadline date not null,
  active boolean default true,
  created_at timestamptz default now()
);

-- ── STUDENTS ─────────────────────────────────────────────────────────────────
-- Note: students.id MUST match the Supabase Auth user id
create table students (
  id uuid primary key references auth.users(id) on delete cascade,
  school_id uuid references schools(id) on delete cascade not null,
  email text not null unique,
  full_name text not null,
  student_id text not null,
  class_label text not null default 'Class of 2026',
  created_at timestamptz default now(),
  last_login timestamptz
);

-- ── SUBMISSIONS ───────────────────────────────────────────────────────────────
create table submissions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references students(id) on delete cascade unique not null,
  school_id uuid references schools(id) on delete cascade not null,
  status text not null default 'not_started'
    check (status in ('not_started','in_progress','submitted','approved','changes_requested')),

  -- Photos
  profile_photo_url text,
  backdrop_color_hex text,
  backdrop_color_name text,
  memory_photo_urls text[] default '{}',

  -- Content
  quote_text text,
  quote_attribution text,
  story_achievement text,
  story_best_memory text,
  story_this_year text,
  story_next text,

  -- Tracks
  track_1_title text,
  track_1_artist text,
  track_1_album_art_url text,
  track_1_spotify_id text,
  track_2_title text,
  track_2_artist text,
  track_2_album_art_url text,
  track_2_spotify_id text,

  -- Meta
  completed_steps text[] default '{}',
  submitted_at timestamptz,
  admin_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── ROW LEVEL SECURITY ────────────────────────────────────────────────────────
-- Students can only see their own data
alter table students enable row level security;
alter table submissions enable row level security;
alter table schools enable row level security;

-- Students can read their own record
create policy "Students read own record" on students
  for select using (auth.uid() = id);

-- Students can read their school
create policy "Students read own school" on schools
  for select using (
    id in (select school_id from students where id = auth.uid())
  );

-- Students can read and write their own submission
create policy "Students manage own submission" on submissions
  for all using (student_id = auth.uid());

-- ── UPDATED_AT TRIGGER ────────────────────────────────────────────────────────
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger submissions_updated_at
  before update on submissions
  for each row execute function update_updated_at();
```

### Step 3 — Create storage buckets

Go to **Storage** in your Supabase dashboard → **New bucket**

Create these two buckets:

| Bucket name      | Public? |
|------------------|---------|
| `profile-photos` | Yes     |
| `memory-photos`  | Yes     |

For each bucket, go to **Policies** → **Add policy** → 
"Allow authenticated users to upload" → select **INSERT** → save.

### Step 4 — Add your first school

In SQL Editor, run:

```sql
insert into schools (name, slug, year, deadline)
values ('Waterpark College', 'waterpark-college', '2026', '2026-05-15');
```

### Step 5 — Get your Supabase keys

Go to **Settings → API** in your Supabase project:
- Copy **Project URL** → this is `NEXT_PUBLIC_SUPABASE_URL`
- Copy **anon public** key → this is `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Copy **service_role secret** key → this is `SUPABASE_SERVICE_ROLE_KEY`

---

## PART 2 — Spotify API Setup

### Step 1 — Create a Spotify app

1. Go to https://developer.spotify.com/dashboard
2. Log in with your Spotify account (or create a free one)
3. Click **Create app**
4. Fill in:
   - App name: `AerEthos Portal`
   - App description: `Student yearbook submission portal`
   - Redirect URI: `http://localhost:3000` (required but not used)
   - Check "Web API"
5. Click **Save**

### Step 2 — Get your credentials

In your new app → **Settings**:
- Copy **Client ID** → this is `SPOTIFY_CLIENT_ID`
- Click **View client secret** → copy → this is `SPOTIFY_CLIENT_SECRET`

The portal uses the **Client Credentials** flow — no user login to Spotify 
is ever required. It just searches the public catalogue and pulls artwork.

---

## PART 3 — Environment Variables

### For local development

Create a file called `.env.local` in the root of the portal project:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret

RESEND_API_KEY=re_xxxxxxxxxxxx
ADMIN_SECRET_KEY=choose_a_strong_random_string_here

NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### For Vercel production

Go to Vercel → your portal project → **Settings → Environment Variables**
Add each of the above, but change:
```
NEXT_PUBLIC_SITE_URL=https://portal.aerethos.com
```

---

## PART 4 — Adding Students (Bulk Invite)

Students log in via Supabase Auth. You create their accounts by:

### Option A — Manual (for now)

In Supabase → **Authentication → Users → Invite user**:
1. Enter the student's email
2. They receive a magic link to set a password
3. After they click it, run this SQL to create their student record:

```sql
insert into students (id, school_id, email, full_name, student_id, class_label)
select 
  au.id,
  (select id from schools where slug = 'waterpark-college'),
  'student@email.com',
  'Student Full Name',
  'WPC-2026-001',
  'Class of 2026'
from auth.users au
where au.email = 'student@email.com';
```

### Option B — Bulk CSV import (recommended for 87+ students)

1. Prepare a CSV with columns: `email, full_name, student_id`
2. Use Supabase's **Table Editor → Import data** to upload it
3. Then run a SQL script to create auth accounts for each row

Ask Nathan or refer to the Supabase docs for the bulk invite script — 
this will be built into the AerEthos admin dashboard in a future update.

---

## PART 5 — Deploying the Portal

### Option A — Subdomain on aerethos.com (recommended)

Deploy the portal as a separate Vercel project at `portal.aerethos.com`:

1. Push the portal code to a **new GitHub repo** called `aerethos-portal`
2. In Vercel → **Add New Project** → import the new repo
3. Add all environment variables (Part 3)
4. Deploy
5. In Vercel project settings → **Domains** → add `portal.aerethos.com`
6. In your DNS settings (wherever aerethos.com DNS is managed):
   - Add a CNAME record: `portal` → `cname.vercel-dns.com`

Students visit: `https://portal.aerethos.com`

### Option B — Subfolder on aerethos.com

Add the portal as an `/app` route on the existing site. 
This requires merging the portal code into the main aerethos repo 
and moving all files under `app/portal/` and `app/admin/`.

---

## PART 6 — Linking from aerethos.com

Once the portal is live at `portal.aerethos.com`, add a button to 
the relevant pages on aerethos.com that links to it.

### On the Waterpark 2026 order page (`/waterpark-2026`)

After a student pays via Stripe, the success page should show:

```tsx
<a href="https://portal.aerethos.com">
  Access Your Submission Portal →
</a>
```

### On the students page (`/students`)

Add a clear CTA:

```tsx
<a href="https://portal.aerethos.com">
  Log in to your portal →
</a>
```

---

## PART 7 — Admin Access

The admin dashboard lives at:
`https://portal.aerethos.com/admin/dashboard`

It's protected by the `ADMIN_SECRET_KEY` environment variable.
Only you have this key. When you visit the page, you enter the key 
and it shows you all submissions across all schools.

From the admin dashboard you can:
- See every student's submission status and completion percentage
- View their profile photo, colours, quotes, tracks
- Mark submissions as Approved or Request Changes
- Email students directly

---

## PART 8 — Testing locally before going live

```bash
# 1. Install dependencies
cd aerethos-portal
npm install

# 2. Add your .env.local file (see Part 3)

# 3. Run the dev server
npm run dev

# 4. Visit http://localhost:3000
# You'll be redirected to the login page

# 5. To test without real auth:
# Comment out the auth check in dashboard/page.tsx temporarily
# and hardcode a student object
```

---

## Checklist before going live

- [ ] Supabase project created, tables created with SQL above
- [ ] Storage buckets created (profile-photos, memory-photos)
- [ ] First school record inserted into schools table
- [ ] Spotify app created, credentials saved
- [ ] All environment variables added to Vercel
- [ ] Portal deployed to portal.aerethos.com
- [ ] DNS CNAME record added for portal subdomain
- [ ] Students invited via Supabase auth
- [ ] Student records inserted into students table
- [ ] Tested full flow locally (login → all 6 steps → submit)
- [ ] Admin dashboard tested with your admin key
- [ ] Link from aerethos.com students page added
- [ ] Link from waterpark-2026 success page added

---

## Questions?

Everything in this portal was built to integrate cleanly with the 
existing AerEthos Next.js site. The API routes, types, and CSS 
design system are all consistent with aerethos.com.

If anything breaks or needs adjusting, the cleanest approach is to 
bring the error message to Claude with the relevant file — every 
component is self-contained and easy to debug.
