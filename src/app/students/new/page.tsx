import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { StudentForm } from "@/components/StudentForm";

export default function NewStudentPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 lg:p-8">
        <div className="mx-auto max-w-5xl">
          <Link href="/" className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-brand-700">
            <ArrowRight className="h-4 w-4" />
            العودة إلى لوحة التحكم
          </Link>
          <h1 className="mb-6 text-2xl font-extrabold text-slate-900">إضافة طالب جديد</h1>
          <StudentForm />
        </div>
      </main>
    </div>
  );
}
