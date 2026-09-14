function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value ?? "—";
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

function renderTeacherPhoto(t) {
  const img = document.getElementById("teacher-photo");
  const placeholder = document.getElementById("teacher-photo-placeholder");
  if (t.photo_url) {
    img.src = t.photo_url;
    img.alt = `${t.teacher_first_name} ${t.teacher_surname}`;
    img.classList.remove("hidden");
    placeholder.classList.add("hidden");
  } else {
    img.classList.add("hidden");
    placeholder.classList.remove("hidden");
  }
}

function renderTeacher(t) {
  renderTeacherPhoto(t);

  const fullName = `${t.teacher_first_name} ${t.teacher_second_name} ${t.teacher_third_name} ${t.teacher_fourth_name} ${t.teacher_surname}`.replace(/\s+/g, " ").trim();
  setText("teacher-full-name", fullName);

  setText("f-dob", formatDob(t.date_of_birth));
  setText("f-place-of-birth", t.place_of_birth);
  setText("f-marital-status", t.marital_status);
  setText("f-blood-type", t.blood_type);
  setText("f-mother-full-name", `${t.mother_first_name} ${t.mother_second_name} ${t.mother_third_name}`);

  setText("f-id-type", t.id_type);
  setText("f-issuing-country", t.issuing_country);
  setText("f-national-card", t.national_card_number);
  setText("f-employee-number", t.employee_number);
  setText("f-family-number", t.family_number);
  setText("f-birthplace", t.birthplace);

  setText("f-employment-type", TEACHER_EMPLOYMENT_TYPE_LABELS[t.employment_type]);
  setText("f-employee-type", TEACHER_EMPLOYEE_TYPE_LABELS[t.employee_type]);
  setText("f-job-title", TEACHER_JOB_TITLE_LABELS[t.job_title]);
  setText("f-job-address", t.job_address);
  setText("f-current-position", t.current_position);
  setText("f-first-appointment", t.first_appointment_date ? formatDob(t.first_appointment_date) : "—");

  setText("f-college", t.college_name);
  setText("f-graduation-year", t.graduation_year);
  setText("f-specialization", t.specialization);

  setText("f-city", t.city_village);
  setText("f-neighborhood", t.neighborhood);
  setText("f-mahalla", t.mahalla);
  setText("f-alley", t.alley);
  setText("f-address-line", t.address_line);
  setText("f-landmark", t.nearest_landmark);
  setText("f-email", t.email);
  setText("f-phone", t.phone);
  setText("f-emergency-name", t.emergency_contact_name);
  setText("f-emergency-relation", t.emergency_contact_relation);
  setText("f-emergency-phone", t.emergency_contact_phone);

  document.getElementById("header-date").textContent = `📅 ${formatDateEn(new Date())}`;
  document.getElementById("header-job-title").textContent = `🎓 ${TEACHER_JOB_TITLE_LABELS[t.job_title] ?? "—"}`;

  // Drives the filename Chrome/Edge suggest in the print dialog's "Save
  // as PDF" flow — matches the request to auto-name the saved file
  // after the person's full name instead of a generic title.
  document.title = fullName;
}

async function init() {
  const session = await requireAuth();
  if (!session) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const loadingEl = document.getElementById("loading-state");
  const printArea = document.getElementById("print-area");

  if (!id) {
    loadingEl.textContent = "لم يتم تحديد الأستاذ";
    return;
  }

  try {
    const teacher = await fetchTeacherById(id);
    renderTeacher(teacher);
    loadingEl.classList.add("hidden");
    printArea.classList.remove("hidden");

    document.getElementById("teacher-actions").innerHTML = `
      <button id="print-btn" class="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 sm:flex-initial">
        🖨 طباعة الاستمارة
      </button>
    `;
    document.getElementById("print-btn").addEventListener("click", () => window.print());
  } catch (err) {
    loadingEl.textContent = `تعذر تحميل بيانات الأستاذ: ${err.message}`;
  }
}

init();
