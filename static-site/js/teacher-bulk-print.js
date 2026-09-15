// Bulk print: one page per teacher, in a single browser print job so
// "Save as PDF" produces one multi-page PDF file. Teacher data comes
// from a public, unauthenticated registration form, so every value is
// escaped before being placed in HTML — never trust it directly.
function escapeHtml(value) {
  if (value == null) return "—";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatDob(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${d.getFullYear()}`;
}

function formatDateEn(date) {
  const d = date instanceof Date ? date : new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${d.getFullYear()}/${month}/${day}`;
}

function field(label, value, dir) {
  return `
    <div class="field-unit">
      <p class="field-label">${escapeHtml(label)}</p>
      <p class="field-value"${dir ? ` dir="${dir}"` : ""}>${escapeHtml(value)}</p>
    </div>
  `;
}

function buildTeacherPage(t) {
  const fullName = escapeHtml(
    `${t.teacher_first_name} ${t.teacher_second_name} ${t.teacher_third_name} ${t.teacher_fourth_name} ${t.teacher_surname}`
      .replace(/\s+/g, " ")
      .trim()
  );
  const motherName = `${t.mother_first_name} ${t.mother_second_name} ${t.mother_third_name}`;
  const photoHtml = t.photo_url
    ? `<img src="${escapeHtml(t.photo_url)}" alt="" class="h-full w-full object-cover" />`
    : `<div class="flex h-full w-full items-center justify-center text-slate-300">${icon("user", { size: 30 })}</div>`;

  return `
    <div class="teacher-print-page">
      <div class="print-card flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center">
        <div class="photo-frame">${photoHtml}</div>
        <div class="text-center sm:text-right">
          <h1 class="text-xl font-extrabold text-slate-900">${fullName}</h1>
          <p class="mt-1 text-sm text-slate-500">استمارة تسجيل الأساتذة لنظام EMIS</p>
        </div>
        <div class="mt-2 flex flex-wrap justify-center gap-2 text-xs font-semibold text-slate-500 sm:mr-auto sm:mt-0 sm:justify-end">
          <span class="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1">${icon("calendar", { size: 13 })} ${formatDateEn(new Date())}</span>
          <span class="inline-flex items-center gap-1 rounded-full bg-slate-800 px-3 py-1 text-white">${icon("graduationCap", { size: 13 })} ${escapeHtml(TEACHER_JOB_TITLE_LABELS[t.job_title])}</span>
        </div>
      </div>

      <div class="print-card rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="mb-4 text-base font-bold text-slate-900">المعلومات الشخصية</h2>
        <div class="field-grid grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          ${field("تاريخ التولد", formatDob(t.date_of_birth))}
          ${field("محل الولادة", t.place_of_birth)}
          ${field("الحالة الاجتماعية", t.marital_status)}
          ${field("فئة الدم", t.blood_type)}
          ${field("اسم الأم الثلاثي", motherName)}
        </div>
      </div>

      <div class="print-card rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="mb-4 text-base font-bold text-slate-900">وثيقة التعريف</h2>
        <div class="field-grid grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          ${field("نوع الهوية", t.id_type)}
          ${field("بلد الإصدار", t.issuing_country)}
          ${field("رقم البطاقة الوطنية", t.national_card_number, "ltr")}
          ${field("الرقم الوظيفي", t.employee_number, "ltr")}
          ${field("الرقم العائلي", t.family_number, "ltr")}
          ${field("مسقط الرأس", t.birthplace)}
        </div>
      </div>

      <div class="print-card rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="mb-4 text-base font-bold text-slate-900">بيانات الوظيفة</h2>
        <div class="field-grid grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          ${field("نوع التوظيف", TEACHER_EMPLOYMENT_TYPE_LABELS[t.employment_type])}
          ${field("نوع الموظف", TEACHER_EMPLOYEE_TYPE_LABELS[t.employee_type])}
          ${field("المسمى الوظيفي", TEACHER_JOB_TITLE_LABELS[t.job_title])}
          ${field("العنوان الوظيفي", t.job_address)}
          ${field("المنصب الحالي", t.current_position)}
          ${field("تاريخ اول تعيين", t.first_appointment_date ? formatDob(t.first_appointment_date) : "—")}
        </div>
      </div>

      <div class="print-card rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="mb-4 text-base font-bold text-slate-900">التحصيل الدراسي</h2>
        <div class="field-grid grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          ${field("اسم الكلية أو المعهد", t.college_name)}
          ${field("سنة التخرج", t.graduation_year, "ltr")}
          ${field("الاختصاص", t.specialization)}
        </div>
      </div>

      <div class="print-card rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="mb-4 text-base font-bold text-slate-900">العنوان وجهة الاتصال</h2>
        <div class="field-grid grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          ${field("المدينة / قرية", t.city_village)}
          ${field("الحي", t.neighborhood)}
          ${field("المحلة", t.mahalla)}
          ${field("الزقاق", t.alley)}
          ${field("العنوان", t.address_line)}
          ${field("اقرب نقطة دالة", t.nearest_landmark)}
          ${field("البريد الإلكتروني", t.email, "ltr")}
          ${field("رقم الهاتف", t.phone, "ltr")}
          ${field("جهة الاتصال في حالة الطارئة", t.emergency_contact_name)}
          ${field("صلة القرابة", t.emergency_contact_relation)}
          ${field("هاتف جهة الاتصال", t.emergency_contact_phone, "ltr")}
        </div>
      </div>

      <div class="print-card print-signatures rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div class="grid grid-cols-1 gap-8 pt-6 text-center sm:grid-cols-2">
          <div>
            <p class="text-sm font-bold text-slate-800">مسؤول وحدة EMIS: أ.علي محمد علي</p>
            <div class="mx-auto mt-8 w-40 border-t border-slate-400"></div>
            <p class="mt-1 text-xs text-slate-400">التوقيع</p>
          </div>
          <div>
            <p class="text-sm font-bold text-slate-800">توقيع مدير المدرسة</p>
            <div class="mx-auto mt-8 w-40 border-t border-slate-400"></div>
            <p class="mt-1 text-xs text-slate-400">التوقيع</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

/** Resolves once every <img> in the container has either loaded or failed, so print doesn't fire on blank photo boxes. */
function waitForImages(container) {
  const imgs = Array.from(container.querySelectorAll("img"));
  return Promise.all(
    imgs.map((img) =>
      img.complete
        ? Promise.resolve()
        : new Promise((resolve) => {
            img.addEventListener("load", resolve, { once: true });
            img.addEventListener("error", resolve, { once: true });
          })
    )
  );
}

async function init() {
  const session = await requireAuth();
  if (!session) return;

  const loadingEl = document.getElementById("loading-state");
  const listEl = document.getElementById("print-list");

  try {
    const teachers = await fetchTeachers();
    if (teachers.length === 0) {
      loadingEl.textContent = "لا توجد استمارات أساتذة لطباعتها";
      return;
    }

    listEl.innerHTML = teachers.map(buildTeacherPage).join("");
    loadingEl.classList.add("hidden");
    listEl.classList.remove("hidden");

    document.getElementById("page-actions").innerHTML = `
      <button id="print-btn" class="flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700">
        ${icon("printer", { size: 16 })} طباعة / حفظ الكل PDF
      </button>
      <span class="text-xs text-slate-400">${teachers.length} استمارة</span>
    `;
    document.getElementById("print-btn").addEventListener("click", () => window.print());

    await waitForImages(listEl);
    window.print();
  } catch (err) {
    loadingEl.textContent = `تعذر تحميل الاستمارات: ${err.message}`;
  }
}

init();
