import { UserPlus, Users, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { StatCard } from "@/components/StatCard";
import { StudentsTable } from "@/components/StudentsTable";
import { ExportButton } from "@/components/ExportButton";
import { getStudents, getStudentStats } from "@/lib/students";

export default async function DashboardPage() {
  const [students, stats] = await Promise.all([getStudents(), getStudentStats()]);

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 p-6 lg:p-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">لوحة التحكم</h1>
            <p className="text-sm text-slate-500">نظرة عامة على بيانات الطلاب المسجلين</p>
          </div>
          <div className="flex items-center gap-3">
            <ExportButton students={students} stats={stats} />
            <Link
              href="/students/new"
              className="flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
            >
              <UserPlus className="h-4 w-4" />
              إضافة طالب
            </Link>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="إجمالي الطلاب" value={stats.total_students} icon={Users} accent="blue" />
          <StatCard
            label="تسجيلات هذا الشهر"
            value={stats.new_registrations_this_month}
            icon={UserPlus}
            accent="amber"
          />
          <StatCard label="نسبة النجاح" value={stats.passed_count} icon={CheckCircle2} accent="green" />
          <StatCard label="نسبة الرسوب" value={stats.failed_count} icon={XCircle} accent="red" />
        </div>

        <StudentsTable students={students} />
      </main>
    </div>
  );
}
