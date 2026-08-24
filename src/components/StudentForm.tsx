"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { BLOOD_TYPES, GRADES } from "@/lib/constants";
import type { StudentInsert } from "@/types/database";

const emptyForm: StudentInsert = {
  student_first_name: "",
  student_second_name: "",
  student_third_name: "",
  student_fourth_name: "",
  student_surname: "",
  date_of_birth: "",
  mother_first_name: "",
  mother_second_name: "",
  mother_third_name: "",
  student_id_type: "national_id",
  student_national_id_number: "",
  student_civil_status_id_number: "",
  student_nationality_cert_number: "",
  student_record_number: "",
  student_page_number: "",
  student_issuing_authority: "",
  father_id_type: "national_id",
  father_national_id_number: "",
  father_civil_status_id_number: "",
  father_nationality_cert_number: "",
  father_record_number: "",
  father_page_number: "",
  father_issuing_authority: "",
  birthplace: "",
  blood_type: null,
  has_special_needs: "no",
  economic_level: "middle",
  has_social_welfare: "no",
  previous_academic_year: "",
  previous_year_result: "new_registration",
  current_grade: GRADES[0],
  section: "",
  neighborhood: "",
  mahalla: "",
  alley: "",
  nearest_landmark: "",
  guardian_phone: "",
};

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100";
const labelClass = "mb-1 block text-sm font-semibold text-slate-700";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {children}
    </div>
  );
}

export function StudentForm() {
  const router = useRouter();
  const [form, setForm] = useState<StudentInsert>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof StudentInsert>(key: K, value: StudentInsert[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const supabase = createClient();
    const { data, error: insertError } = await supabase
      .from("students")
      .insert([form])
      .select("id")
      .single();

    setSubmitting(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }
    router.push(`/students/${data.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-base font-bold text-slate-900">بيانات الطالب الأساسية</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="الاسم الأول">
            <input required className={inputClass} value={form.student_first_name} onChange={(e) => update("student_first_name", e.target.value)} />
          </Field>
          <Field label="الاسم الثاني">
            <input required className={inputClass} value={form.student_second_name} onChange={(e) => update("student_second_name", e.target.value)} />
          </Field>
          <Field label="الاسم الثالث">
            <input required className={inputClass} value={form.student_third_name} onChange={(e) => update("student_third_name", e.target.value)} />
          </Field>
          <Field label="الاسم الرابع">
            <input required className={inputClass} value={form.student_fourth_name} onChange={(e) => update("student_fourth_name", e.target.value)} />
          </Field>
          <Field label="اللقب">
            <input required className={inputClass} value={form.student_surname} onChange={(e) => update("student_surname", e.target.value)} />
          </Field>
          <Field label="تاريخ الميلاد">
            <input required type="date" className={inputClass} value={form.date_of_birth} onChange={(e) => update("date_of_birth", e.target.value)} />
          </Field>
          <Field label="فئة الدم">
            <select className={inputClass} value={form.blood_type ?? ""} onChange={(e) => update("blood_type", (e.target.value || null) as StudentInsert["blood_type"])}>
              <option value="">—</option>
              {BLOOD_TYPES.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </Field>
          <Field label="مسقط الرأس">
            <input className={inputClass} value={form.birthplace ?? ""} onChange={(e) => update("birthplace", e.target.value)} />
          </Field>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-base font-bold text-slate-900">اسم الأم</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="الاسم الأول"><input required className={inputClass} value={form.mother_first_name} onChange={(e) => update("mother_first_name", e.target.value)} /></Field>
          <Field label="الاسم الثاني"><input required className={inputClass} value={form.mother_second_name} onChange={(e) => update("mother_second_name", e.target.value)} /></Field>
          <Field label="الاسم الثالث"><input required className={inputClass} value={form.mother_third_name} onChange={(e) => update("mother_third_name", e.target.value)} /></Field>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-base font-bold text-slate-900">هوية الطالب</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="نوع الهوية">
            <select className={inputClass} value={form.student_id_type} onChange={(e) => update("student_id_type", e.target.value as StudentInsert["student_id_type"])}>
              <option value="national_id">بطاقة وطنية</option>
              <option value="nationality">جنسية</option>
            </select>
          </Field>
          <Field label="رقم البطاقة الوطنية"><input className={inputClass} value={form.student_national_id_number ?? ""} onChange={(e) => update("student_national_id_number", e.target.value)} /></Field>
          <Field label="رقم هوية الأحوال المدنية"><input className={inputClass} value={form.student_civil_status_id_number ?? ""} onChange={(e) => update("student_civil_status_id_number", e.target.value)} /></Field>
          <Field label="رقم شهادة الجنسية"><input className={inputClass} value={form.student_nationality_cert_number ?? ""} onChange={(e) => update("student_nationality_cert_number", e.target.value)} /></Field>
          <Field label="رقم السجل"><input className={inputClass} value={form.student_record_number ?? ""} onChange={(e) => update("student_record_number", e.target.value)} /></Field>
          <Field label="رقم الصحيفة"><input className={inputClass} value={form.student_page_number ?? ""} onChange={(e) => update("student_page_number", e.target.value)} /></Field>
          <Field label="جهة الإصدار"><input className={inputClass} value={form.student_issuing_authority ?? ""} onChange={(e) => update("student_issuing_authority", e.target.value)} /></Field>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-base font-bold text-slate-900">هوية الأب</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="نوع الهوية">
            <select className={inputClass} value={form.father_id_type} onChange={(e) => update("father_id_type", e.target.value as StudentInsert["father_id_type"])}>
              <option value="national_id">بطاقة وطنية</option>
              <option value="nationality">جنسية</option>
            </select>
          </Field>
          <Field label="رقم البطاقة الوطنية"><input className={inputClass} value={form.father_national_id_number ?? ""} onChange={(e) => update("father_national_id_number", e.target.value)} /></Field>
          <Field label="رقم هوية الأحوال"><input className={inputClass} value={form.father_civil_status_id_number ?? ""} onChange={(e) => update("father_civil_status_id_number", e.target.value)} /></Field>
          <Field label="رقم شهادة الجنسية"><input className={inputClass} value={form.father_nationality_cert_number ?? ""} onChange={(e) => update("father_nationality_cert_number", e.target.value)} /></Field>
          <Field label="رقم السجل"><input className={inputClass} value={form.father_record_number ?? ""} onChange={(e) => update("father_record_number", e.target.value)} /></Field>
          <Field label="رقم الصحيفة"><input className={inputClass} value={form.father_page_number ?? ""} onChange={(e) => update("father_page_number", e.target.value)} /></Field>
          <Field label="جهة الإصدار"><input className={inputClass} value={form.father_issuing_authority ?? ""} onChange={(e) => update("father_issuing_authority", e.target.value)} /></Field>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-base font-bold text-slate-900">الحالة الاجتماعية والاقتصادية</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="ذوي الاحتياجات الخاصة">
            <select className={inputClass} value={form.has_special_needs} onChange={(e) => update("has_special_needs", e.target.value as StudentInsert["has_special_needs"])}>
              <option value="no">كلا</option>
              <option value="yes">نعم</option>
            </select>
          </Field>
          <Field label="المستوى الاقتصادي">
            <select className={inputClass} value={form.economic_level} onChange={(e) => update("economic_level", e.target.value as StudentInsert["economic_level"])}>
              <option value="below_poverty">تحت خط الفقر</option>
              <option value="poor">فقيرة</option>
              <option value="middle">وسطى</option>
              <option value="high">عليا</option>
            </select>
          </Field>
          <Field label="مشمول بالرعاية الاجتماعية">
            <select className={inputClass} value={form.has_social_welfare} onChange={(e) => update("has_social_welfare", e.target.value as StudentInsert["has_social_welfare"])}>
              <option value="no">كلا</option>
              <option value="yes">نعم</option>
            </select>
          </Field>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-base font-bold text-slate-900">البيانات الدراسية</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="العام الدراسي السابق"><input className={inputClass} placeholder="2024/2025" value={form.previous_academic_year ?? ""} onChange={(e) => update("previous_academic_year", e.target.value)} /></Field>
          <Field label="نتيجة العام السابق">
            <select className={inputClass} value={form.previous_year_result} onChange={(e) => update("previous_year_result", e.target.value as StudentInsert["previous_year_result"])}>
              <option value="new_registration">تسجيل جديد</option>
              <option value="passed">ناجح</option>
              <option value="failed">راسب</option>
            </select>
          </Field>
          <Field label="الصف الدراسي الحالي">
            <select required className={inputClass} value={form.current_grade} onChange={(e) => update("current_grade", e.target.value)}>
              {GRADES.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </Field>
          <Field label="الشعبة"><input className={inputClass} value={form.section ?? ""} onChange={(e) => update("section", e.target.value)} /></Field>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-base font-bold text-slate-900">بيانات العنوان والتواصل</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="الحي"><input className={inputClass} value={form.neighborhood ?? ""} onChange={(e) => update("neighborhood", e.target.value)} /></Field>
          <Field label="المحلة"><input className={inputClass} value={form.mahalla ?? ""} onChange={(e) => update("mahalla", e.target.value)} /></Field>
          <Field label="الزقاق"><input className={inputClass} value={form.alley ?? ""} onChange={(e) => update("alley", e.target.value)} /></Field>
          <Field label="اقرب نقطة دالة"><input className={inputClass} value={form.nearest_landmark ?? ""} onChange={(e) => update("nearest_landmark", e.target.value)} /></Field>
          <Field label="رقم هاتف ولي الأمر"><input required dir="ltr" className={inputClass} value={form.guardian_phone} onChange={(e) => update("guardian_phone", e.target.value)} /></Field>
        </div>
      </section>

      <div className="flex justify-end gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-50"
        >
          {submitting ? "جارٍ الحفظ..." : "حفظ بيانات الطالب"}
        </button>
      </div>
    </form>
  );
}
