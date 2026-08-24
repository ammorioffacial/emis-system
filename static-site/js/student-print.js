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

/** YYYY/MM/DD using plain ASCII digits (avoids Arabic-Indic numerals from ar-EG locale formatting). */
function formatDateEn(date) {
  const d = date instanceof Date ? date : new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${d.getFullYear()}/${month}/${day}`;
}

function renderStudentPhoto(s) {
  const img = document.getElementById("student-photo");
  const placeholder = document.getElementById("student-photo-placeholder");
  if (s.photo_url) {
    img.src = s.photo_url;
    img.alt = `${s.student_first_name} ${s.student_surname}`;
    img.classList.remove("hidden");
    placeholder.classList.add("hidden");
  } else {
    img.classList.add("hidden");
    placeholder.classList.remove("hidden");
  }
}

function renderStudent(s) {
  renderStudentPhoto(s);
  setText(
    "student-full-name",
    `${s.student_first_name} ${s.student_second_name} ${s.student_third_name} ${s.student_fourth_name ?? ""} ${s.student_surname}`.replace(/\s+/g, " ").trim()
  );
  setText("f-dob", formatDob(s.date_of_birth));
  setText("f-mother-full-name", `${s.mother_first_name} ${s.mother_second_name} ${s.mother_third_name}`);
  setText("f-blood-type", s.blood_type);
  setText("f-birthplace", s.birthplace);
  setText("f-marital-status", s.marital_status);
  setText("f-special-needs", YES_NO_LABELS[s.has_special_needs]);
  setText("f-special-needs-type", s.has_special_needs === "yes" ? SPECIAL_NEEDS_TYPE_LABELS[s.special_needs_type] : "—");

  setText("f-student-id-type", ID_TYPE_LABELS[s.student_id_type]);
  setText("f-student-national-id", s.student_national_id_number);
  setText("f-student-civil-id", s.student_civil_status_id_number);
  setText("f-student-nat-cert", s.student_nationality_cert_number);
  setText("f-student-record", s.student_record_number);
  setText("f-student-page", s.student_page_number);
  setText("f-student-authority", s.student_issuing_authority);

  setText("f-father-id-type", ID_TYPE_LABELS[s.father_id_type]);
  setText("f-father-national-id", s.father_national_id_number);
  setText("f-father-civil-id", s.father_civil_status_id_number);
  setText("f-father-nat-cert", s.father_nationality_cert_number);
  setText("f-father-record", s.father_record_number);
  setText("f-father-page", s.father_page_number);
  setText("f-father-authority", s.father_issuing_authority);

  setText("f-economic-level", ECONOMIC_LEVEL_LABELS[s.economic_level]);
  setText("f-social-welfare", YES_NO_LABELS[s.has_social_welfare]);

  setText("f-previous-school", s.previous_school);
  setText("f-prev-year", s.previous_academic_year);
  setText("f-prev-result", s.previous_year_result ? PREVIOUS_RESULT_LABELS[s.previous_year_result] : "—");
  setText(
    "f-previous-stage-grade",
    s.previous_educational_stage ? `${EDUCATIONAL_STAGE_LABELS[s.previous_educational_stage]}${s.previous_grade ? " - " + s.previous_grade : ""}` : "—"
  );
  setText(
    "f-current-stage-grade",
    s.current_educational_stage ? `${EDUCATIONAL_STAGE_LABELS[s.current_educational_stage]} - ${s.current_grade}` : s.current_grade
  );
  setText("f-preparatory-branch", s.current_preparatory_branch ? PREPARATORY_BRANCH_LABELS[s.current_preparatory_branch] : "—");
  setText("f-section", s.section);

  setText("f-governorate", s.governorate);
  setText("f-district", s.district);
  setText("f-sub-district", s.sub_district);
  setText("f-neighborhood", s.neighborhood);
  setText("f-mahalla", s.mahalla);
  setText("f-alley", s.alley);
  setText("f-landmark", s.nearest_landmark);
  setText("f-guardian-phone", s.guardian_phone);
  setText("f-notes", s.notes);

  document.getElementById("header-date").textContent = `📅 ${formatDateEn(new Date())}`;
  document.getElementById("header-grade").textContent = `🎓 ${s.current_grade ?? "—"}${s.section ? " - شعبة " + s.section : ""}`;
  document.getElementById("header-statistical-number").textContent = s.statistical_number ? `🔢 الرقم الإحصائي: ${s.statistical_number}` : "";

  document.title = `${s.student_first_name} ${s.student_surname} - نظام EMIS`;
}

// ---------------------------------------------------------------------
// Lightbox (click-to-enlarge)
// ---------------------------------------------------------------------
function initLightbox() {
  const img = document.getElementById("student-photo");
  const backdrop = document.getElementById("lightbox-backdrop");
  const lightboxImg = document.getElementById("lightbox-img");
  const closeBtn = document.getElementById("lightbox-close");

  function open() {
    if (!img.src || img.classList.contains("hidden")) return;
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    backdrop.style.display = "flex";
  }
  function close() {
    backdrop.style.display = "none";
  }

  img.addEventListener("click", open);
  closeBtn.addEventListener("click", close);
  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) close();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
}

// ---------------------------------------------------------------------
// Replace photo for an existing student: upload the new file to the
// student-photos bucket, update the row's photo_url, refresh the view.
// ---------------------------------------------------------------------
function initPhotoReplace(getStudent) {
  const input = document.getElementById("photo-replace-input");
  const statusEl = document.getElementById("photo-upload-status");

  input.addEventListener("change", async () => {
    const student = getStudent();
    const file = input.files[0];
    if (!file || !student) return;

    statusEl.textContent = "جارٍ رفع الصورة...";
    try {
      const url = await uploadStudentPhoto(file);
      await updateStudentPhotoUrl(student.id, url);
      student.photo_url = url;
      renderStudentPhoto(student);
      statusEl.textContent = "تم تحديث الصورة بنجاح";
      setTimeout(() => (statusEl.textContent = ""), 3000);
    } catch (err) {
      statusEl.textContent = "";
      alert("تعذر تحديث الصورة: " + err.message);
    }
  });
}

// ---------------------------------------------------------------------
// Restricted "data entry" role: the standard multi-signature block is
// replaced with a single fixed label — this role never signs off on a
// record, that's the admin's job once they complete/review it.
// ---------------------------------------------------------------------
function applyDataEntrySignatureOverride() {
  const block = document.getElementById("signature-block");
  block.innerHTML = `
    <div class="pt-6 text-center">
      <p class="text-sm font-bold text-slate-800">مسؤول معلومات EMIS</p>
    </div>
  `;
}

async function init() {
  const session = await requireAuth();
  if (!session) return;
  const restricted = isDataEntryUser(session);

  // Never briefly flash the "back to dashboard" link for a restricted
  // user — it stays display:none in the HTML until we know the role.
  if (!restricted) document.getElementById("back-to-dashboard-link").style.display = "";

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const loadingEl = document.getElementById("loading-state");
  const printArea = document.getElementById("print-area");

  if (!id) {
    // A restricted user always lands here with no ?id= (this is the
    // dashboard redirect target for their role) — send them on to the
    // one page they actually have something to do on.
    if (restricted) {
      window.location.href = "add-student.html";
      return;
    }
    loadingEl.textContent = "لم يتم تحديد الطالب";
    return;
  }

  let student = null;
  try {
    student = await fetchStudentById(id);
    renderStudent(student);
    if (restricted) applyDataEntrySignatureOverride();
    loadingEl.classList.add("hidden");
    printArea.classList.remove("hidden");

    if (restricted) {
      document.getElementById("student-actions").innerHTML = `
        <button id="print-btn" class="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 sm:flex-initial">
          🖨 طباعة الاستمارة
        </button>
      `;
      document.getElementById("print-btn").addEventListener("click", () => window.print());
      // Save & Print is a single uninterrupted action for this role — fire
      // the print dialog automatically once the record is rendered.
      setTimeout(() => window.print(), 300);
    } else {
      document.getElementById("student-actions").innerHTML = `
        <a href="add-student.html?id=${student.id}" class="flex flex-1 items-center justify-center gap-2 rounded-xl border border-amber-500 px-4 py-2.5 text-sm font-semibold text-amber-700 shadow-sm transition hover:bg-amber-50 sm:flex-initial">
          ✏️ تعديل بيانات الطالب
        </a>
        <button id="print-btn" class="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 sm:flex-initial">
          🖨 طباعة الاستمارة
        </button>
      `;
      document.getElementById("print-btn").addEventListener("click", () => window.print());
    }
  } catch (err) {
    loadingEl.textContent = `تعذر تحميل بيانات الطالب: ${err.message}`;
  }

  initLightbox();
  initPhotoReplace(() => student);
}

init();
