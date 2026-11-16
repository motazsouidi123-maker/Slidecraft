# SlideCraft — flat layout (all files in the repository root, no folders)

Files to have in your GitHub repo root (exactly these 11):
`package.json`, `vite.config.js`, `index.html`, `main.jsx`, `App.jsx`, `Admin.jsx`, `ui.jsx`, `supabase.js`, `index.css`, `supabase.sql`, `.env.example`

DELETE from the repo if present: the whole `src` folder, `index_1.css`, any `ui__1_.pdf`, and any duplicate files.

Environment variables (set in Vercel → Settings → Environment Variables, then Redeploy):
`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_WHATSAPP`, `VITE_EMAIL`

Database: if your `orders` table and `order-files` bucket already exist, do NOT run supabase.sql again.
Admin: `your-link/#/admin`.
