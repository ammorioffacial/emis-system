# EMIS — Static Web App (Vanilla JS + Tailwind CDN + Supabase)

Zero-build, pure static Student & Teacher Management System. No Node.js, no
bundler, no server-side rendering — deploy the folder as-is to Vercel or
Render.

`index.html` is a **public** gateway page (no login) offering two paths:
- **معلومات الطلاب** → `login.html` → the authenticated admin dashboard
  (`dashboard.html`) for managing student records.
- **تسجيل الأساتذة** → `teacher-register.html`, a public no-login
  registration form for teachers.

Everything under the dashboard (students CRUD, teacher roster viewing) is
gated by Supabase Auth + RLS (`authenticated` role, admin app_metadata).
Teacher registration itself is the one deliberately public write path — see
`supabase/schema.sql`'s teachers section for the RLS policy that scopes it.

## Folder structure

```
static-site/
├── index.html               # Public gateway page — no login required
├── login.html                 # Supabase Auth email/password login
├── dashboard.html                # Admin dashboard: students + teachers tabs, stats, analytics
├── add-student.html                # Student form — add AND edit (?id=<uuid>)
├── student.html                       # Student detail/print view (?id=<uuid>)
├── teacher-register.html                 # Public teacher registration form — no login
├── teacher.html                             # Teacher detail/print view, admin-only (?id=<uuid>)
├── editable-form.html                          # Blank, contenteditable form for offline fill/print
├── pdf-form.html                                  # Links to the standard form + the original PDF
├── css/
│   └── styles.css                # Shared styles: fonts, print rules, glass/analytics/tab CSS
├── js/
│   ├── config.js                   # Supabase URL + anon key — EDIT before deploying
│   ├── tailwind-config.js           # Tailwind CDN theme (Tajawal font, form-green, brand colors)
│   ├── supabase-client.js            # Client init, auth helpers, students + teachers CRUD, photo upload
│   ├── constants.js                   # Shared Arabic enum labels + grade/stage/teacher lookup tables
│   ├── dashboard.js                    # dashboard.html logic (students/teachers tabs, filters, analytics)
│   ├── student-form.js                  # add-student.html logic (insert + edit/update, role restrictions)
│   ├── student-print.js                  # student.html logic (fetch, render, photo, print)
│   ├── teacher-form.js                    # teacher-register.html logic (public insert, no auth)
│   ├── teacher-print.js                    # teacher.html logic (fetch, render, print), admin-only
│   ├── photo-upload.js                      # Shared avatar-upload UI wiring (students + teachers)
│   ├── export-excel.js                       # SheetJS .xlsx export (data sheet + stats sheet)
│   ├── kpi-tilt.js                            # 3D tilt/glow hover effect on dashboard KPI cards
│   ├── clock-widget.js                         # Live clock + Hijri/Gregorian date pill
│   └── mobile-nav.js                            # Mobile drawer toggle
├── supabase/
│   ├── schema.sql                    # Full consolidated schema for a FRESH project (students + teachers)
│   └── add-teachers-migration.sql      # Additive-only migration to add teachers to an already-live DB
├── vercel.json               # Security headers for Vercel deploys
├── render.yaml               # Render.com static site blueprint
└── README.md
```

Every page pulls its dependencies from CDNs directly in `<head>`/before `</body>`:
Tailwind Play CDN, Google Fonts (Tajawal), Supabase JS UMD build, SheetJS,
Chart.js — no `npm install` step required.

## Setup

1. **Create a Supabase project.** In the SQL editor, run `supabase/schema.sql`
   for a brand-new project. It is NOT safe to re-run against a database that
   already has real data (see the warning at the top of the file — `drop
   type ... cascade` would drop dependent columns and their data). If you
   already have a live EMIS database and only need to add teacher
   registration to it, run `supabase/add-teachers-migration.sql` instead —
   it's purely additive and safe to re-run.

2. **Create at least one Supabase Auth user** (Authentication → Users → Add user) —
   `login.html` signs in against Supabase Auth, not a custom table. To make a
   user a restricted data-entry role instead of admin, set their Raw App
   Meta Data to `{ "role": "data_entry" }` from the dashboard.

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
   - **Vercel:** connect the GitHub repo and set the project's Root
     Directory to `static-site/`, Framework Preset to **Other**, with no
     build/install command (static output, nothing to build).
   - **Render:** New → Static Site → point at this repo/folder, publish
     directory `static-site` (or use the included `render.yaml` blueprint).

## Flow

**Students (admin):**
1. `index.html` → "معلومات الطلاب" → `login.html` → sign in → `dashboard.html`
   (الطلاب tab): stats, the analytics panel (grade/section counts,
   special-needs breakdown, previous-school counts), and the filterable
   student table.
2. Click a student's name, or a row's 🖨 طباعة, to open `student.html?id=...`
   — the read-only/print view. ✏️ تعديل opens `add-student.html?id=...` to edit.
3. `add-student.html` inserts (or updates, in edit mode) via `insertStudent()`/
   `updateStudent()`, then redirects to `student.html`.
4. "تصدير إلى Excel" on the dashboard calls `exportStudentsToExcel()`.
5. 🗑 حذف on any row deletes that record after a confirmation prompt.

**Teachers (public registration, admin-only viewing):**
1. `index.html` → "تسجيل الأساتذة" → `teacher-register.html` — anyone can
   fill this out and submit with no login (RLS grants `insert` to the
   `anon` role on the `teachers` table only).
2. Submitted records appear in `dashboard.html`'s الأساتذة tab (admin-only —
   RLS restricts `select` on `teachers` to authenticated admins). From
   there, 🖨 طباعة opens `teacher.html?id=...` to view/print, 🗑 حذف removes
   a submission.

**Restricted "data entry" role:** signs in via `login.html` like an admin,
but `dashboard.js` immediately redirects them to `student.html` (with no
`?id=`, which forwards them on to `add-student.html`) — see the RLS
policies and `data-admin-only` markup in `add-student.html`/`student-form.js`
for exactly what this role can and can't do.
