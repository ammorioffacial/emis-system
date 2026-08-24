# EMIS — نظام إدارة معلومات الطلاب

Student Management System built with Next.js (App Router), Tailwind CSS, and Supabase, replicating the paper "استمارة إضافة التلاميذ لنظام EMIS" registration form.

## Folder structure

```
supabase/
  schema.sql          # Tables, enums, RLS policies, stats view
  seed.sql            # Sample demo data
src/
  app/
    layout.tsx         # Root layout — Tajawal font, RTL html
    globals.css         # Tailwind + print rules
    page.tsx            # Dashboard (stat cards + students table)
    students/
      new/page.tsx       # Add-student form page
      [id]/page.tsx       # Printable student form page
  components/
    Sidebar.tsx
    StatCard.tsx
    StudentsTable.tsx
    ExportButton.tsx      # Excel export trigger
    StudentForm.tsx        # Editable registration form (Supabase insert)
    PrintableStudentForm.tsx # Pixel-perfect replica of the paper form
    PrintButton.tsx
  lib/
    supabase/client.ts    # Browser Supabase client
    supabase/server.ts    # Server Supabase client
    students.ts             # Data access (getStudents, getStudentById, getStudentStats)
    exportExcel.ts           # xlsx export (2 sheets: data + stats)
    constants.ts               # Shared Arabic labels for enums
  types/
    database.ts               # Hand-written DB types
```

## Setup

1. **Install Node.js 18+** (this environment did not have Node installed, so dependencies were not installed automatically — run these steps on your machine).

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a Supabase project, then copy `.env.local.example` to `.env.local` and fill in your project URL and anon key:
   ```bash
   cp .env.local.example .env.local
   ```

4. Run the schema against your Supabase project (SQL editor or CLI):
   ```bash
   supabase db execute -f supabase/schema.sql
   # optional demo data
   supabase db execute -f supabase/seed.sql
   ```

5. Start the dev server:
   ```bash
   npm run dev
   ```

6. Open http://localhost:3000 — the dashboard lists students; click a student's name to open the pixel-perfect printable form and use the "طباعة الاستمارة" button to print via `window.print()`. Use "تصدير إلى Excel" on the dashboard to download an `.xlsx` with a data sheet and a stats sheet.

## Notes

- Authentication is not included — `students` table RLS policies require an `authenticated` Supabase user. Add Supabase Auth (e.g. email/password or magic link) before deploying, or relax the policies for a trusted internal tool.
- The printable form (`PrintableStudentForm.tsx`) mirrors the reference form's grid, green label cells, and checkbox groups field-for-field, with `print-color-adjust: exact` set globally so colors survive printing, and `.no-print` hiding all dashboard chrome.
