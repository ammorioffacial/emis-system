"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import type { Student } from "@/types/database";
import { PREVIOUS_RESULT_LABELS } from "@/lib/constants";

const resultBadge: Record<string, string> = {
  passed: "bg-emerald-50 text-emerald-700",
  failed: "bg-rose-50 text-rose-700",
  new_registration: "bg-blue-50 text-blue-700",
};

export function StudentsTable({ students }: { students: Student[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return students;
    const q = query.trim().toLowerCase();
    return students.filter((s) =>
      `${s.student_first_name} ${s.student_second_name} ${s.student_third_name} ${s.student_fourth_name} ${s.student_surname}`
        .toLowerCase()
        .includes(q)
    );
  }, [students, query]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 p-5">
        <h2 className="text-lg font-bold text-slate-900">سجل الطلاب</h2>
        <div className="relative w-72">
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="بحث باسم الطالب..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pe-9 ps-3 text-sm outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-slate-500">
              <th className="px-5 py-3 text-start font-semibold">اسم الطالب</th>
              <th className="px-5 py-3 text-start font-semibold">الصف الحالي</th>
              <th className="px-5 py-3 text-start font-semibold">الشعبة</th>
              <th className="px-5 py-3 text-start font-semibold">نتيجة العام السابق</th>
              <th className="px-5 py-3 text-start font-semibold">هاتف ولي الأمر</th>
              <th className="px-5 py-3 text-start font-semibold">تاريخ التسجيل</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id} className="border-b border-slate-50 transition hover:bg-slate-50">
                <td className="px-5 py-3">
                  <Link
                    href={`/students/${s.id}`}
                    className="font-semibold text-brand-700 hover:underline"
                  >
                    {s.student_first_name} {s.student_second_name} {s.student_surname}
                  </Link>
                </td>
                <td className="px-5 py-3 text-slate-600">{s.current_grade}</td>
                <td className="px-5 py-3 text-slate-600">{s.section ?? "—"}</td>
                <td className="px-5 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${resultBadge[s.previous_year_result]}`}
                  >
                    {PREVIOUS_RESULT_LABELS[s.previous_year_result]}
                  </span>
                </td>
                <td className="px-5 py-3 text-slate-600" dir="ltr">
                  {s.guardian_phone}
                </td>
                <td className="px-5 py-3 text-slate-500">
                  {new Date(s.created_at).toLocaleDateString("ar-EG")}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-slate-400">
                  لا توجد نتائج مطابقة
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
