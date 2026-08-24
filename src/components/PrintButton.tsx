"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="no-print flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
    >
      <Printer className="h-4 w-4" />
      طباعة الاستمارة
    </button>
  );
}
