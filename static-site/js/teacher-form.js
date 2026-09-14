// Public teacher registration form (teacher-register.html) — no login
// required, mirrors the structure of student-form.js but simpler: no
// role checks, no edit mode, just a one-shot public submission.

function populateTeacherSelectOptions() {
  const bloodSelect = document.getElementById("blood_type");
  BLOOD_TYPES.forEach((b) => {
    const opt = document.createElement("option");
    opt.value = b;
    opt.textContent = b;
    bloodSelect.appendChild(opt);
  });

  const fillSelect = (id, labelsMap) => {
    const select = document.getElementById(id);
    Object.entries(labelsMap).forEach(([value, label]) => {
      const opt = document.createElement("option");
      opt.value = value;
      opt.textContent = label;
      select.appendChild(opt);
    });
  };
  fillSelect("employment_type", TEACHER_EMPLOYMENT_TYPE_LABELS);
  fillSelect("employee_type", TEACHER_EMPLOYEE_TYPE_LABELS);
  fillSelect("job_title", TEACHER_JOB_TITLE_LABELS);
}

function buildTeacherPayloadFromForm(form) {
  const fd = new FormData(form);
  const payload = Object.fromEntries(fd.entries());

  const optionalFields = [
    "place_of_birth",
    "issuing_country",
    "employee_number",
    "family_number",
    "birthplace",
    "marital_status",
    "blood_type",
    "job_address",
    "current_position",
    "first_appointment_date",
    "college_name",
    "graduation_year",
    "specialization",
    "emergency_contact_name",
    "emergency_contact_relation",
    "emergency_contact_phone",
    "city_village",
    "neighborhood",
    "mahalla",
    "alley",
    "address_line",
    "nearest_landmark",
    "photo_url",
  ];
  optionalFields.forEach((field) => {
    if (payload[field] === "") payload[field] = null;
  });

  return payload;
}

function init() {
  populateTeacherSelectOptions();
  initPhotoUpload(uploadTeacherPhoto);

  const form = document.getElementById("teacher-form");
  const errorEl = document.getElementById("form-error");
  const submitBtn = document.getElementById("submit-btn");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;

    // The file input is visually hidden (styled via the avatar label
    // instead), which exempts it from native `required` validation —
    // per the WHATWG spec, an element with a hidden ancestor is barred
    // from constraint validation. Enforce it manually instead.
    if (!document.getElementById("photo_url_hidden").value) {
      errorEl.textContent = "الصورة الشخصية مطلوبة";
      errorEl.classList.remove("hidden");
      errorEl.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    errorEl.classList.add("hidden");
    submitBtn.disabled = true;
    submitBtn.textContent = "جارٍ الإرسال...";

    try {
      const payload = buildTeacherPayloadFromForm(form);
      await insertTeacher(payload);
      const modal = document.getElementById("success-modal");
      const countdownEl = document.getElementById("redirect-countdown");
      modal.classList.remove("hidden");
      modal.classList.add("flex");

      let secondsLeft = 15;
      const countdownTimer = setInterval(() => {
        secondsLeft -= 1;
        countdownEl.textContent = secondsLeft;
        if (secondsLeft <= 0) clearInterval(countdownTimer);
      }, 1000);

      setTimeout(() => {
        window.location.href = "index.html";
      }, 15000);
      return;
    } catch (err) {
      errorEl.textContent = err.message || "حدث خطأ أثناء الإرسال";
      errorEl.classList.remove("hidden");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "إرسال طلب التسجيل";
    }
  });
}

init();
