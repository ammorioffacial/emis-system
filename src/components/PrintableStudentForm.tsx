import type { Student } from "@/types/database";
import {
  ECONOMIC_LEVEL_LABELS,
  ID_TYPE_LABELS,
  PREVIOUS_RESULT_LABELS,
} from "@/lib/constants";

/**
 * Pixel-perfect replica of the paper "استمارة إضافة التلاميذ لنظام EMIS" form.
 * Grid layout: label cell (green) + value cell(s) (white), two mirrored
 * columns (right = student/father identity block, left = DOB/birth-cert/
 * address block), matching the reference image row-for-row.
 */

const CELL = "border border-slate-800 px-2 py-1.5 flex items-center min-h-[34px]";
const LABEL = `${CELL} bg-form-green font-bold text-[13px] justify-end text-slate-900 print:bg-form-green`;
const VALUE = `${CELL} bg-white text-[13px] justify-center text-slate-900`;

function Checkbox({ checked }: { checked: boolean }) {
  return (
    <span className="flex h-4 w-4 items-center justify-center border-2 border-slate-800 bg-white text-[10px] font-bold leading-none">
      {checked ? "✓" : ""}
    </span>
  );
}

export function PrintableStudentForm({ student }: { student: Student }) {
  const s = student;
  const dob = new Date(s.date_of_birth);
  const dobDay = String(dob.getDate()).padStart(2, "0");
  const dobMonth = String(dob.getMonth() + 1).padStart(2, "0");
  const dobYear = dob.getFullYear();

  return (
    <div className="print-area mx-auto max-w-4xl bg-white p-4 text-slate-900">
      {/* Header */}
      <div className="mb-4 flex items-center justify-center gap-3 border-b-2 border-slate-800 pb-3">
        <h1 className="rounded bg-amber-300 px-4 py-1.5 text-lg font-extrabold text-slate-900 print:bg-amber-300">
          استمارة إضافة التلاميذ لنظام EMIS
        </h1>
      </div>

      {/* Main grid: 2 mirrored halves, 4 columns each (label | value | value | value) */}
      <div className="grid grid-cols-2 border-2 border-slate-800 text-right" dir="rtl">
        {/* ================= LEFT half (in reading order, appears second visually but matches image's left column) ================= */}
        {/* ================= RIGHT half — appears first (right side of page) ================= */}

        {/* Row 1: Student full name */}
        <div className="col-start-2 grid grid-cols-5">
          <div className={`${LABEL} col-span-1`}>اسم الطالب الرباعي واللقب</div>
          <div className={`${VALUE} col-span-4 justify-start`}>
            {s.student_first_name} {s.student_second_name} {s.student_third_name}{" "}
            {s.student_fourth_name} {s.student_surname}
          </div>
        </div>
        {/* Row 1 left: DOB */}
        <div className="col-start-1 row-start-1 grid grid-cols-3">
          <div className={`${LABEL} col-span-1`}>تاريخ تولد الطالب (يوم/شهر/سنة)</div>
          <div className={`${VALUE} col-span-2 justify-start`} dir="ltr">
            {dobDay}/{dobMonth}/{dobYear}
          </div>
        </div>

        {/* Row 2 right: mother's 3-part name */}
        <div className="grid grid-cols-5">
          <div className={`${LABEL} col-span-1`}>إسم الام الثلاثي</div>
          <div className={`${VALUE} col-span-4 justify-start`}>
            {s.mother_first_name} {s.mother_second_name} {s.mother_third_name}
          </div>
        </div>
        {/* Row 2 left: nationality checkbox */}
        <div className="grid grid-cols-3">
          <div className={`${LABEL} col-span-1`}>جنسية</div>
          <div className={`${VALUE} col-span-2`}>
            <Checkbox checked={s.student_id_type === "nationality"} />
          </div>
        </div>

        {/* Row 3 right: student ID type */}
        <div className="grid grid-cols-5 items-stretch">
          <div className={`${LABEL} col-span-1`}>نوع الهوية الطالب</div>
          <div className={`${VALUE} col-span-4 justify-start gap-6`}>
            <span className="flex items-center gap-1.5">
              <Checkbox checked={s.student_id_type === "national_id"} /> بطاقة وطنية
            </span>
          </div>
        </div>
        {/* Row 3 left: nationality checkbox (mirrors father block header) */}
        <div className="grid grid-cols-3">
          <div className={VALUE}></div>
          <div className={`${VALUE} col-span-2 justify-start gap-1.5`}>
            <Checkbox checked={s.student_id_type === "nationality"} />
          </div>
        </div>

        {/* Row 4 right: national ID number */}
        <div className="grid grid-cols-5">
          <div className={`${LABEL} col-span-1`}>رقم البطاقة الوطنية</div>
          <div className={`${VALUE} col-span-4 justify-start`} dir="ltr">
            {s.student_national_id_number ?? ""}
          </div>
        </div>
        {/* Row 4 left: civil status ID number */}
        <div className="grid grid-cols-3">
          <div className={`${LABEL} col-span-1`}>رقم هوية الأحوال المدنية</div>
          <div className={`${VALUE} col-span-2 justify-start`} dir="ltr">
            {s.student_civil_status_id_number ?? ""}
          </div>
        </div>

        {/* Row 5 left only: nationality cert number (right cell blank/merged) */}
        <div className={VALUE}></div>
        <div className="grid grid-cols-3">
          <div className={`${LABEL} col-span-1`}>رقم شهادة الجنسية</div>
          <div className={`${VALUE} col-span-2 justify-start`} dir="ltr">
            {s.student_nationality_cert_number ?? ""}
          </div>
        </div>

        {/* Row 6 left: record number */}
        <div className={VALUE}></div>
        <div className="grid grid-cols-3">
          <div className={`${LABEL} col-span-1`}>رقم السجل</div>
          <div className={`${VALUE} col-span-2 justify-start`} dir="ltr">
            {s.student_record_number ?? ""}
          </div>
        </div>

        {/* Row 7 left: page number */}
        <div className={VALUE}></div>
        <div className="grid grid-cols-3">
          <div className={`${LABEL} col-span-1`}>رقم الصحيفة</div>
          <div className={`${VALUE} col-span-2 justify-start`} dir="ltr">
            {s.student_page_number ?? ""}
          </div>
        </div>

        {/* Row 8 left: issuing authority */}
        <div className={VALUE}></div>
        <div className="grid grid-cols-3">
          <div className={`${LABEL} col-span-1`}>جهة الإصدار</div>
          <div className={`${VALUE} col-span-2 justify-start`}>{s.student_issuing_authority ?? ""}</div>
        </div>

        {/* Row 9 right: father ID type */}
        <div className="grid grid-cols-5">
          <div className={`${LABEL} col-span-1`}>نوع هوية الاب</div>
          <div className={`${VALUE} col-span-4 justify-start gap-6`}>
            <span className="flex items-center gap-1.5">
              <Checkbox checked={s.father_id_type === "nationality"} /> جنسية
            </span>
          </div>
        </div>
        {/* Row 9 left: father national ID checkbox */}
        <div className="grid grid-cols-3">
          <div className={VALUE}></div>
          <div className={`${VALUE} col-span-2 justify-start gap-1.5`}>
            <Checkbox checked={s.father_id_type === "national_id"} /> بطاقة وطنية
          </div>
        </div>

        {/* Row 10 right: father civil status ID */}
        <div className="grid grid-cols-5">
          <div className={`${LABEL} col-span-1`}>رقم هوية الأحوال للاب</div>
          <div className={`${VALUE} col-span-4 justify-start`} dir="ltr">
            {s.father_civil_status_id_number ?? ""}
          </div>
        </div>
        {/* Row 10 left: father national ID number */}
        <div className="grid grid-cols-3">
          <div className={`${LABEL} col-span-1`}>رقم البطاقة الوطنية</div>
          <div className={`${VALUE} col-span-2 justify-start`} dir="ltr">
            {s.father_national_id_number ?? ""}
          </div>
        </div>

        {/* Row 11 right: father nationality cert number */}
        <div className="grid grid-cols-5">
          <div className={`${LABEL} col-span-1`}>رقم شهادة الجنسية للاب</div>
          <div className={`${VALUE} col-span-4 justify-start`} dir="ltr">
            {s.father_nationality_cert_number ?? ""}
          </div>
        </div>
        {/* Row 11 left: large blank merged cell start */}
        <div className={`${VALUE} row-span-5`}></div>

        {/* Row 12 right: father record number */}
        <div className="grid grid-cols-5">
          <div className={`${LABEL} col-span-1`}>رقم السجل</div>
          <div className={`${VALUE} col-span-4 justify-start`} dir="ltr">
            {s.father_record_number ?? ""}
          </div>
        </div>

        {/* Row 13 right: father page number */}
        <div className="grid grid-cols-5">
          <div className={`${LABEL} col-span-1`}>رقم الصحيفة</div>
          <div className={`${VALUE} col-span-4 justify-start`} dir="ltr">
            {s.father_page_number ?? ""}
          </div>
        </div>

        {/* Row 14 right: father issuing authority */}
        <div className="grid grid-cols-5">
          <div className={`${LABEL} col-span-1`}>جهة الاصدار</div>
          <div className={`${VALUE} col-span-4 justify-start`}>{s.father_issuing_authority ?? ""}</div>
        </div>

        {/* Row 15 right: birthplace */}
        <div className="grid grid-cols-5">
          <div className={`${LABEL} col-span-1`}>مسقط الرأس للطالب</div>
          <div className={`${VALUE} col-span-4 justify-start`}>{s.birthplace ?? ""}</div>
        </div>
        {/* Row 15 left: blood type */}
        <div className="grid grid-cols-3">
          <div className={`${LABEL} col-span-1`}>فئة دم الطالب</div>
          <div className={`${VALUE} col-span-2`}>{s.blood_type ?? ""}</div>
        </div>

        {/* Row 16 right: special needs yes/no */}
        <div className="grid grid-cols-5">
          <div className={`${LABEL} col-span-1`}>هل الطالب من ذوي الاحتياجات الخاصة</div>
          <div className={`${VALUE} col-span-4 justify-start gap-6`} dir="rtl">
            <span className="flex items-center gap-1.5">
              نعم <Checkbox checked={s.has_special_needs === "yes"} />
            </span>
            <span className="flex items-center gap-1.5">
              كلا <Checkbox checked={s.has_special_needs === "no"} />
            </span>
          </div>
        </div>
        <div className={VALUE}></div>

        {/* Row 17 right: economic level */}
        <div className="grid grid-cols-5">
          <div className={`${LABEL} col-span-1`}>المستوى الاقتصادي للطالب</div>
          <div className={`${VALUE} col-span-4 justify-start gap-4 flex-wrap`}>
            {(["below_poverty", "poor", "middle", "high"] as const).map((level) => (
              <span key={level} className="flex items-center gap-1.5">
                {ECONOMIC_LEVEL_LABELS[level]} <Checkbox checked={s.economic_level === level} />
              </span>
            ))}
          </div>
        </div>
        <div className={VALUE}></div>

        {/* Row 18 right: social welfare yes/no */}
        <div className="grid grid-cols-5">
          <div className={`${LABEL} col-span-1`}>هل مشمول بمنحة الرعاية الاجتماعية</div>
          <div className={`${VALUE} col-span-4 justify-start gap-6`}>
            <span className="flex items-center gap-1.5">
              نعم <Checkbox checked={s.has_social_welfare === "yes"} />
            </span>
            <span className="flex items-center gap-1.5">
              كلا <Checkbox checked={s.has_social_welfare === "no"} />
            </span>
          </div>
        </div>
        {/* Row 18 left: previous academic year */}
        <div className="grid grid-cols-3">
          <div className={`${LABEL} col-span-1`}>العام الدراسي السابق</div>
          <div className={`${VALUE} col-span-2 justify-start`}>{s.previous_academic_year ?? ""}</div>
        </div>

        {/* Row 19 right: previous year result */}
        <div className="grid grid-cols-5">
          <div className={`${LABEL} col-span-1`}>نتيجة العام الدراسي السابق</div>
          <div className={`${VALUE} col-span-4 justify-start gap-4 flex-wrap`}>
            {(["new_registration", "passed", "failed"] as const).map((r) => (
              <span key={r} className="flex items-center gap-1.5">
                {PREVIOUS_RESULT_LABELS[r]} <Checkbox checked={s.previous_year_result === r} />
              </span>
            ))}
          </div>
        </div>
        {/* Row 19 left: current grade */}
        <div className="grid grid-cols-3">
          <div className={`${LABEL} col-span-1`}>الصف الدراسي الحالي</div>
          <div className={`${VALUE} col-span-2 justify-start`}>{s.current_grade}</div>
        </div>

        {/* Row 20 right: section */}
        <div className="grid grid-cols-5">
          <div className={`${LABEL} col-span-1`}>الشعبة</div>
          <div className={`${VALUE} col-span-4 justify-start`}>{s.section ?? ""}</div>
        </div>
        {/* Row 20 left: neighborhood */}
        <div className="grid grid-cols-3">
          <div className={`${LABEL} col-span-1`}>الحي</div>
          <div className={`${VALUE} col-span-2 justify-start`}>{s.neighborhood ?? ""}</div>
        </div>

        {/* Row 21 right: mahalla */}
        <div className="grid grid-cols-5">
          <div className={`${LABEL} col-span-1`}>المحلة</div>
          <div className={`${VALUE} col-span-4 justify-start`}>{s.mahalla ?? ""}</div>
        </div>
        {/* Row 21 left: alley */}
        <div className="grid grid-cols-3">
          <div className={`${LABEL} col-span-1`}>الزقاق</div>
          <div className={`${VALUE} col-span-2 justify-start`}>{s.alley ?? ""}</div>
        </div>

        {/* Row 22 right: nearest landmark */}
        <div className="grid grid-cols-5">
          <div className={`${LABEL} col-span-1`}>اقرب نقطة دالة</div>
          <div className={`${VALUE} col-span-4 justify-start`}>{s.nearest_landmark ?? ""}</div>
        </div>
        {/* Row 22 left: guardian phone */}
        <div className="grid grid-cols-3">
          <div className={`${LABEL} col-span-1`}>رقم هاتف ولي الامر</div>
          <div className={`${VALUE} col-span-2 justify-start`} dir="ltr">
            {s.guardian_phone}
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-center">
        <p className="text-lg font-extrabold text-slate-400">Epic EMIS</p>
      </div>
    </div>
  );
}
