import * as XLSX from "xlsx";
import type { Student, StudentStats } from "@/types/database";
import {
  ECONOMIC_LEVEL_LABELS,
  ID_TYPE_LABELS,
  PREVIOUS_RESULT_LABELS,
  YES_NO_LABELS,
} from "@/lib/constants";

export function exportStudentsToExcel(students: Student[], stats: StudentStats) {
  const rows = students.map((s) => ({
    "اسم الطالب الرباعي": [
      s.student_first_name,
      s.student_second_name,
      s.student_third_name,
      s.student_fourth_name,
    ].join(" "),
    اللقب: s.student_surname,
    "تاريخ الميلاد": s.date_of_birth,
    "اسم الام الثلاثي": [s.mother_first_name, s.mother_second_name, s.mother_third_name].join(" "),
    "نوع هوية الطالب": ID_TYPE_LABELS[s.student_id_type],
    "رقم البطاقة الوطنية للطالب": s.student_national_id_number ?? "",
    "رقم هوية الأحوال المدنية": s.student_civil_status_id_number ?? "",
    "رقم شهادة الجنسية": s.student_nationality_cert_number ?? "",
    "رقم السجل": s.student_record_number ?? "",
    "رقم الصحيفة": s.student_page_number ?? "",
    "جهة الإصدار": s.student_issuing_authority ?? "",
    "نوع هوية الأب": ID_TYPE_LABELS[s.father_id_type],
    "رقم البطاقة الوطنية للأب": s.father_national_id_number ?? "",
    "رقم هوية الأحوال للأب": s.father_civil_status_id_number ?? "",
    "رقم شهادة الجنسية للأب": s.father_nationality_cert_number ?? "",
    "مسقط الرأس": s.birthplace ?? "",
    "فئة الدم": s.blood_type ?? "",
    "ذوي الاحتياجات الخاصة": YES_NO_LABELS[s.has_special_needs],
    "المستوى الاقتصادي": ECONOMIC_LEVEL_LABELS[s.economic_level],
    "الرعاية الاجتماعية": YES_NO_LABELS[s.has_social_welfare],
    "العام الدراسي السابق": s.previous_academic_year ?? "",
    "نتيجة العام السابق": PREVIOUS_RESULT_LABELS[s.previous_year_result],
    "الصف الحالي": s.current_grade,
    الشعبة: s.section ?? "",
    الحي: s.neighborhood ?? "",
    المحلة: s.mahalla ?? "",
    الزقاق: s.alley ?? "",
    "أقرب نقطة دالة": s.nearest_landmark ?? "",
    "هاتف ولي الأمر": s.guardian_phone,
  }));

  const statsRows = [
    { المؤشر: "إجمالي عدد الطلاب", القيمة: stats.total_students },
    { المؤشر: "تسجيلات هذا الشهر", القيمة: stats.new_registrations_this_month },
    { المؤشر: "عدد الناجحين", القيمة: stats.passed_count },
    { المؤشر: "عدد الراسبين", القيمة: stats.failed_count },
    { المؤشر: "ذوو الاحتياجات الخاصة", القيمة: stats.special_needs_count },
    { المؤشر: "المشمولون بالرعاية الاجتماعية", القيمة: stats.social_welfare_count },
  ];

  const wb = XLSX.utils.book_new();
  const wsStudents = XLSX.utils.json_to_sheet(rows);
  const wsStats = XLSX.utils.json_to_sheet(statsRows);

  wsStudents["!cols"] = Object.keys(rows[0] ?? {}).map(() => ({ wch: 22 }));
  wsStats["!cols"] = [{ wch: 30 }, { wch: 15 }];

  XLSX.utils.book_append_sheet(wb, wsStudents, "بيانات الطلاب");
  XLSX.utils.book_append_sheet(wb, wsStats, "الإحصائيات");

  const dateStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `EMIS-Students-${dateStr}.xlsx`);
}
