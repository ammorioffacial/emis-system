"use client";

import { FileSpreadsheet } from "lucide-react";
import { exportStudentsToExcel } from "@/lib/exportExcel";
import type { Student, StudentStats } from "@/types/database";

export function ExportButton({ students, stats }: { students: Student[]; stats: StudentStats }) {
  return (
    <button
      onClick={() => exportStudentsToExcel(students, stats)}
      className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
    >
      <FileSpreadsheet className="h-4 w-4" />
      تصدير إلى Excel
    </button>
  );
}
