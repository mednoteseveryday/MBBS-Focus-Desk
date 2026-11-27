MBBS FOCUS DESK — CLOUD VERSION
================================

This version syncs sessions and tasks between your tablet and phone using Supabase.
It uses email magic-link sign-in. You sign in once per device; data is stored in your cloud database.

IMPORTANT SECURITY
- The browser config uses only the Supabase anon/public key.
- NEVER put a service_role key or database password in config.js.
- Row Level Security is enabled in schema.sql so each account can access only its own rows.

SETUP (one-time)
1. Create a free project at https://supabase.com/.
2. In the project, open SQL Editor, create a new query, paste all of schema.sql, and run it.
3. Open Project Settings > API (or Connect). Copy the Project URL and anon/public key.
4. Edit config.js and replace the two PASTE_... values. Do not use a secret/service_role key.
5. Create a free GitHub account at https://github.com/ if you do not already have one.
6. Create a new PUBLIC repository named mbbs-focus-desk.
7. Upload all files in this folder to the repository root (index.html, app.js, config.js, schema.sql, manifest.webmanifest, sw.js, icon.svg).
8. In GitHub repository Settings > Pages, choose Deploy from a branch, select main and /(root), then Save.
9. Wait for GitHub Pages to publish. Your site URL will look like:
   https://YOUR-GITHUB-USERNAME.github.io/mbbs-focus-desk/
10. In Supabase Authentication > URL Configuration, add that exact site URL to Site URL and Redirect URLs.
11. Open the published site on your tablet, enter your email and tap Send sign-in link. Open the email link on the same device.
12. Repeat on your iQOO phone using the same email account. Your sessions and tasks will sync.

INSTALL AS AN APP
- On Chrome, open the published URL.
- Open the three-dot menu and choose "Add to Home screen" or "Install app" if offered.

NOTES
- This is a starter app; it requires the one-time hosting and Supabase setup above.
- The daily goal is currently a per-device display preference; study sessions and tasks are cloud-synced.
- Export CSV regularly as an additional backup.
