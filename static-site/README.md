# EMIS — Static Web App (Vanilla JS + Tailwind CDN + Supabase)

Zero-build, pure static Student Management System. No Node.js, no bundler,
no server-side rendering — deploy the folder as-is to Vercel or Render.

Authentication is enabled: `login.html` gates every page via `requireAuth()`,
and Supabase RLS policies restrict all reads/writes to signed-in
(`authenticated`) users. Create at least one Supabase Auth user
(Authentication → Users → Add user) before using the app.

## Folder structure

```
static-site/
├── index.html              # Dashboard: stats, analytics panel, filters, student table
├── add-student.html         # Standard form — add AND edit (add-student.html?id=<uuid>)
├── student.html               # Student detail/print view (?id=<uuid>)
├── editable-form.html           # Blank, contenteditable form for offline fill/print/PDF export
├── pdf-form.html                  # Links to the standard form + view/download the original PDF
├── login.html                       # Supabase Auth email/password login
├── image1.pdf                         # Official EMIS AcroForm template (used by pdf-export.js)
├── css/
│   └── styles.css                # Tajawal font-family, print-color-adjust, @media print rules
├── js/
│   ├── config.js                   # Supabase URL + anon key — EDIT before deploying
│   ├── tailwind-config.js           # Tailwind CDN theme (Tajawal font, form-green, brand colors)
│   ├── supabase-client.js            # Client init, auth helpers, students CRUD, photo upload
│   ├── constants.js                   # Shared Arabic enum labels + grade/stage lookup tables
│   ├── dashboard.js                    # index.html logic (fetch, filters, analytics, delete)
│   ├── student-form.js                  # add-student.html logic (insert + edit/update)
│   ├── student-print.js                  # student.html logic (fetch, render, photo, print)
│   ├── photo-upload.js                    # Shared avatar-upload UI wiring (add/editable forms)
│   ├── export-excel.js                     # SheetJS .xlsx export (data sheet + stats sheet)
│   ├── pdf-export.js                        # pdf-lib export onto image1.pdf (Arabic-shaped)
│   └── mobile-nav.js                         # Mobile drawer toggle (index.html, add-student.html)
├── supabase/
│   ├── schema.sql                    # Full schema for a NEW project (tables, RLS, views, storage)
│   ├── add-photo-migration.sql        # Adds photo_url + storage bucket to an existing DB
│   ├── add-v2-fields-migration.sql     # Adds statistical number, special-needs type, academic
│   │                                       stage/branch, structured address, notes to an existing DB
│   └── restore-auth-migration.sql        # Reverts RLS from anon back to authenticated, if ever needed
├── vercel.json               # Security headers for Vercel deploys
├── render.yaml               # Render.com static site blueprint
└── README.md
```

Every page pulls its dependencies from CDNs directly in `<head>`/before `</body>`:
Tailwind Play CDN, Google Fonts (Tajawal), Supabase JS UMD build, SheetJS,
pdf-lib + fontkit + arabic-reshaper (PDF export only) — no `npm install` step required.

## Setup

1. **Create a Supabase project.** In the SQL editor, run `supabase/schema.sql`
   for a new project. For an already-provisioned database, instead run
   `add-photo-migration.sql` and `add-v2-fields-migration.sql` (both idempotent).

2. **Create at least one Supabase Auth user** (Authentication → Users → Add user) —
   `login.html` signs in against Supabase Auth, not a custom table.

3. **Edit `js/config.js`** with your project's URL and anon key:
   ```js
   window.EMIS_CONFIG = {
     SUPABASE_URL: "https://xxxx.supabase.co",
     SUPABASE_ANON_KEY: "eyJ...",
   };
   ```

4. **Run locally** with any static file server, e.g.:
   ```bash
   npx serve static-site
   # or
   python -m http.server 8000 --directory static-site
   ```

5. **Deploy:**
   - **Vercel:** `vercel --cwd static-site` or connect the GitHub repo and set
     the project root to `static-site/` (no build command needed — static output).
     No deploy access exists from this environment — pushing to your repo
     or running the Vercel CLI yourself is required for changes to go live.
   - **Render:** New → Static Site → point at this repo/folder, publish
     directory `static-site` (or use the included `render.yaml` blueprint).

## Flow

1. `login.html` → sign in. `index.html` shows stats, the analytics panel
   (grade/section counts, special-needs breakdown, previous-school counts),
   and the filterable student table.
2. Click a student's name, or a row's 🖨 طباعة, to open `student.html?id=...`
   — the read-only/print view. ✏️ تعديل opens `add-student.html?id=...` to edit.
3. `add-student.html` inserts (or updates, in edit mode) via `insertStudent()`/
   `updateStudent()`, then redirects to `student.html`.
4. "تصدير إلى Excel" on the dashboard calls `exportStudentsToExcel()`.
5. 🗑 حذف on any row deletes that student after a confirmation prompt.
6. `editable-form.html`'s "📄 تصدير PDF الرسمي" fills the official `image1.pdf`
   template via `pdf-export.js` and downloads it — a standalone offline-fill
   utility, separate from the main add/edit/print flow above.
