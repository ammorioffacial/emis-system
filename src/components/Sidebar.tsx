import Link from "next/link";
import { GraduationCap, LayoutDashboard, UserPlus, Users } from "lucide-react";

export function Sidebar() {
  return (
    <aside className="no-print hidden w-64 shrink-0 border-l border-slate-200 bg-white lg:flex lg:flex-col">
      <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white">
          <GraduationCap className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm font-bold leading-tight">نظام EMIS</p>
          <p className="text-xs text-slate-500">إدارة الطلاب</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-brand-50 hover:text-brand-700"
        >
          <LayoutDashboard className="h-5 w-5" />
          لوحة التحكم
        </Link>
        <Link
          href="/students/new"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-brand-50 hover:text-brand-700"
        >
          <UserPlus className="h-5 w-5" />
          إضافة طالب جديد
        </Link>
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-brand-50 hover:text-brand-700"
        >
          <Users className="h-5 w-5" />
          سجل الطلاب
        </Link>
      </nav>

      <div className="border-t border-slate-100 px-6 py-4 text-xs text-slate-400">
        Epic EMIS &copy; {new Date().getFullYear()}
      </div>
    </aside>
  );
}
