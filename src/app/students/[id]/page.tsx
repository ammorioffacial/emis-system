import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getStudentById } from "@/lib/students";
import { PrintableStudentForm } from "@/components/PrintableStudentForm";
import { PrintButton } from "@/components/PrintButton";

export default async function StudentDetailPage({ params }: { params: { id: string } }) {
  const student = await getStudentById(params.id);
  if (!student) notFound();

  return (
    <div className="min-h-screen bg-slate-100 py-8">
      <div className="no-print mx-auto mb-6 flex max-w-4xl items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-brand-700"
        >
          <ArrowRight className="h-4 w-4" />
          العودة إلى لوحة التحكم
        </Link>
        <PrintButton />
      </div>

      <div className="rounded-2xl bg-white shadow-sm print:shadow-none">
        <PrintableStudentForm student={student} />
      </div>
    </div>
  );
}
