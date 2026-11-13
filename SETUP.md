# SlideCraft — setup from your Android phone (free)

## Step 1 — Supabase (database + admin login)
1. Go to supabase.com → Sign up → **New project** (save the database password).
2. Left menu → **SQL Editor** → New query → paste everything from `supabase.sql` → **Run**.
3. **Authentication → Users → Add user → Create new user**: type YOUR email + a strong password, tick "Auto confirm". This is your admin login.
4. **Authentication → Sign In / Providers** → turn OFF "Allow new users to sign up" (so only you can ever log in).
5. **Project Settings → API**: copy the **Project URL** and the **anon public** key.

## Step 2 — GitHub (stores your code)
1. github.com → Sign up → **New repository** → name `slidecraft` → Public → Create.
2. Tap **Add file → Create new file**. In the name box type `package.json`, paste the code, tap **Commit changes**.
3. Repeat for every file. For files in a folder, type the folder in the name, e.g. `src/App.jsx` (typing `/` makes the folder).
   Files: `package.json`, `vite.config.js`, `index.html`, `supabase.sql`, `src/index.css`, `src/main.jsx`, `src/supabase.js`, `src/App.jsx`, `src/Admin.jsx`.
   (Do NOT upload your real keys to GitHub — they go in Vercel in Step 3.)

## Step 3 — Vercel (puts it online, free)
1. vercel.com → **Sign up with GitHub** → **Add New → Project** → Import `slidecraft`.
2. Open **Environment Variables** and add these 4 (name → value):
   - `VITE_SUPABASE_URL` → your Project URL
   - `VITE_SUPABASE_ANON_KEY` → your anon key
   - `VITE_WHATSAPP` → your number, digits only with country code (e.g. `212600000000`)
   - `VITE_EMAIL` → your contact email
3. Tap **Deploy**. In ~1 minute you get a link like `slidecraft.vercel.app`.

## Using it
- Customers: your link → **Order**.
- You: `your-link/#/admin` → log in → manage orders. Bookmark it!
- To change something later: edit the file on GitHub → Vercel redeploys automatically.
