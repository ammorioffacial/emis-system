// Requires the SheetJS CDN bundle loaded before this file:
// <script src="https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js"></script>

function exportStudentsToExcel(students, stats) {
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

  if (rows.length > 0) {
    wsStudents["!cols"] = Object.keys(rows[0]).map(() => ({ wch: 22 }));
  }
  wsStats["!cols"] = [{ wch: 30 }, { wch: 15 }];

  XLSX.utils.book_append_sheet(wb, wsStudents, "بيانات الطلاب");
  XLSX.utils.book_append_sheet(wb, wsStats, "الإحصائيات");

  const dateStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `EMIS-Students-${dateStr}.xlsx`);
}

function exportTeachersToExcel(teachers, stats) {
  const rows = teachers.map((t) => ({
    "اسم الأستاذ الرباعي": [
      t.teacher_first_name,
      t.teacher_second_name,
      t.teacher_third_name,
      t.teacher_fourth_name,
    ].join(" "),
    اللقب: t.teacher_surname,
    "اسم الأم الثلاثي": [t.mother_first_name, t.mother_second_name, t.mother_third_name].join(" "),
    "تاريخ التولد": t.date_of_birth,
    "محل الولادة": t.place_of_birth ?? "",
    "نوع الهوية": t.id_type ?? "",
    "بلد الإصدار": t.issuing_country ?? "",
    "رقم البطاقة الوطنية": t.national_card_number,
    "الرقم الوظيفي": t.employee_number ?? "",
    "الرقم العائلي": t.family_number ?? "",
    "مسقط الرأس": t.birthplace ?? "",
    "الحالة الاجتماعية": t.marital_status ?? "",
    "فئة الدم": t.blood_type ?? "",
    "نوع التوظيف": TEACHER_EMPLOYMENT_TYPE_LABELS[t.employment_type] ?? "",
    "نوع الموظف": TEACHER_EMPLOYEE_TYPE_LABELS[t.employee_type] ?? "",
    "المسمى الوظيفي": TEACHER_JOB_TITLE_LABELS[t.job_title] ?? "",
    "العنوان الوظيفي": t.job_address ?? "",
    "المنصب الحالي": t.current_position ?? "",
    "تاريخ اول تعيين": t.first_appointment_date ?? "",
    "اسم الكلية أو المعهد": t.college_name ?? "",
    "سنة التخرج": t.graduation_year ?? "",
    الاختصاص: t.specialization ?? "",
    "جهة الاتصال الطارئة": t.emergency_contact_name ?? "",
    "صلة القرابة": t.emergency_contact_relation ?? "",
    "هاتف جهة الاتصال": t.emergency_contact_phone ?? "",
    "المدينة / قرية": t.city_village ?? "",
    الحي: t.neighborhood ?? "",
    المحلة: t.mahalla ?? "",
    الزقاق: t.alley ?? "",
    العنوان: t.address_line ?? "",
    "أقرب نقطة دالة": t.nearest_landmark ?? "",
    "البريد الإلكتروني": t.email,
    الهاتف: t.phone,
    "تاريخ التسجيل": t.created_at.slice(0, 10),
  }));

  const statsRows = [
    { المؤشر: "إجمالي عدد الأساتذة", القيمة: stats.total_teachers },
    { المؤشر: "تسجيلات هذا الشهر", القيمة: stats.new_registrations_this_month },
    { المؤشر: "تدريسيون", القيمة: stats.teaching_count },
    { المؤشر: "ملاك دائم", القيمة: stats.permanent_count },
  ];

  const wb = XLSX.utils.book_new();
  const wsTeachers = XLSX.utils.json_to_sheet(rows);
  const wsStats = XLSX.utils.json_to_sheet(statsRows);

  if (rows.length > 0) {
    wsTeachers["!cols"] = Object.keys(rows[0]).map(() => ({ wch: 22 }));
  }
  wsStats["!cols"] = [{ wch: 30 }, { wch: 15 }];

  XLSX.utils.book_append_sheet(wb, wsTeachers, "بيانات الأساتذة");
  XLSX.utils.book_append_sheet(wb, wsStats, "الإحصائيات");

  const dateStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `EMIS-Teachers-${dateStr}.xlsx`);
}
