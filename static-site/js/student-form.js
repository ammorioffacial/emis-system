function populateSelectOptions() {
  const bloodSelect = document.getElementById("blood_type");
  BLOOD_TYPES.forEach((b) => {
    const opt = document.createElement("option");
    opt.value = b;
    opt.textContent = b;
    bloodSelect.appendChild(opt);
  });
}

// ---------------------------------------------------------------------
// Cascading educational-stage -> grade dropdowns (used for both the
// "previous" and "current" stage/grade pairs).
// ---------------------------------------------------------------------
function populateGradeOptions(gradeSelect, stage, selectedValue) {
  gradeSelect.innerHTML = stage ? "" : '<option value="">—</option>';
  (GRADES_BY_STAGE[stage] ?? []).forEach((g) => {
    const opt = document.createElement("option");
    opt.value = g;
    opt.textContent = g;
    if (g === selectedValue) opt.selected = true;
    gradeSelect.appendChild(opt);
  });
}

function initStageGradeCascades() {
  document.querySelectorAll(".stage-select").forEach((stageSelect) => {
    const gradeSelect = document.getElementById(stageSelect.dataset.target);
    stageSelect.addEventListener("change", () => populateGradeOptions(gradeSelect, stageSelect.value));

    if (stageSelect.name === "current_educational_stage") {
      stageSelect.addEventListener("change", updatePreparatoryBranchVisibility);
    }
  });
}

function updatePreparatoryBranchVisibility() {
  const stageSelect = document.querySelector('.stage-select[name="current_educational_stage"]');
  const field = document.getElementById("preparatory-branch-field");
  const select = field.querySelector("select");
  const shouldShow = stageSelect.value === "preparatory";
  field.classList.toggle("hidden", !shouldShow);
  select.disabled = !shouldShow;
  if (!shouldShow) select.value = "";
}

// ---------------------------------------------------------------------
// Special needs type: only relevant/visible when has_special_needs = yes
// ---------------------------------------------------------------------
function updateSpecialNeedsTypeVisibility() {
  const trigger = document.getElementById("has_special_needs");
  const field = document.getElementById("special-needs-type-field");
  const select = field.querySelector("select");
  const shouldShow = trigger.value === "yes";
  field.classList.toggle("hidden", !shouldShow);
  select.disabled = !shouldShow;
  if (!shouldShow) select.value = "";
}

function buildPayloadFromForm(form) {
  const fd = new FormData(form);
  const payload = Object.fromEntries(fd.entries());

  // Empty optional text fields -> null so they store cleanly in Postgres
  const optionalFields = [
    "student_national_id_number",
    "student_civil_status_id_number",
    "student_nationality_cert_number",
    "student_record_number",
    "student_page_number",
    "student_issuing_authority",
    "father_national_id_number",
    "father_civil_status_id_number",
    "father_nationality_cert_number",
    "father_record_number",
    "father_page_number",
    "father_issuing_authority",
    "birthplace",
    "blood_type",
    "marital_status",
    "special_needs_type",
    "previous_school",
    "previous_educational_stage",
    "previous_grade",
    "current_preparatory_branch",
    "previous_academic_year",
    "section",
    "governorate",
    "district",
    "sub_district",
    "neighborhood",
    "mahalla",
    "alley",
    "nearest_landmark",
    "notes",
    "photo_url",
  ];
  optionalFields.forEach((field) => {
    if (payload[field] === "") payload[field] = null;
  });

  return payload;
}

// ---------------------------------------------------------------------
// Conditional ID fields: showing only the fields relevant to the
// selected id type (national_id vs nationality), for both the student
// and father sections independently. Hidden fields are cleared and
// disabled so their stale values are never included in the submission.
// ---------------------------------------------------------------------
function applyIdTypeVisibility(group) {
  const select = document.querySelector(`.id-type-select[data-group="${group}"]`);
  const selected = select.value;

  document.querySelectorAll(`.id-field[data-group="${group}"]`).forEach((field) => {
    const shouldShow = field.dataset.showWhen === selected;
    const input = field.querySelector("input");

    field.classList.toggle("hidden", !shouldShow);
    if (input) {
      input.disabled = !shouldShow;
      if (!shouldShow) input.value = "";
    }
  });
}

function initIdTypeToggles() {
  document.querySelectorAll(".id-type-select").forEach((select) => {
    applyIdTypeVisibility(select.dataset.group);
    select.addEventListener("change", () => applyIdTypeVisibility(select.dataset.group));
  });
}

// ---------------------------------------------------------------------
// Edit mode: prefill every field from an existing student record.
// ---------------------------------------------------------------------
function prefillForm(form, s) {
  Object.entries(s).forEach(([key, value]) => {
    const field = form.elements.namedItem(key);
    if (!field || value == null) return;
    if (field instanceof RadioNodeList || field.type === "file") return;
    field.value = key === "date_of_birth" ? String(value).slice(0, 10) : value;
  });

  applyIdTypeVisibility("student");
  applyIdTypeVisibility("father");
  updateSpecialNeedsTypeVisibility();

  if (s.previous_educational_stage) {
    populateGradeOptions(document.getElementById("previous_stage_grade"), s.previous_educational_stage, s.previous_grade);
  }
  populateGradeOptions(document.getElementById("current_stage_grade"), s.current_educational_stage || "primary", s.current_grade);
  updatePreparatoryBranchVisibility();
  if (s.current_preparatory_branch) {
    document.querySelector('select[name="current_preparatory_branch"]').value = s.current_preparatory_branch;
  }

  if (s.photo_url) {
    const preview = document.getElementById("photo-preview");
    const placeholder = document.getElementById("photo-placeholder-icon");
    preview.src = s.photo_url;
    preview.classList.remove("hidden");
    placeholder.classList.add("hidden");
    document.getElementById("photo_url_hidden").value = s.photo_url;
  }

  if (s.statistical_number) {
    const badge = document.getElementById("statistical-number-badge");
    badge.textContent = `الرقم الإحصائي: ${s.statistical_number}`;
    badge.classList.remove("hidden");
  }

  document.getElementById("page-title").textContent = "تعديل بيانات طالب";
  document.title = "تعديل بيانات طالب - نظام EMIS";
  document.getElementById("submit-btn").textContent = "حفظ التعديلات";
}

async function init() {
  await requireAuth();
  populateSelectOptions();
  initIdTypeToggles();
  initStageGradeCascades();
  initPhotoUpload();

  populateGradeOptions(document.getElementById("current_stage_grade"), "primary");
  updatePreparatoryBranchVisibility();

  document.getElementById("has_special_needs").addEventListener("change", updateSpecialNeedsTypeVisibility);
  updateSpecialNeedsTypeVisibility();

  const form = document.getElementById("student-form");
  const errorEl = document.getElementById("form-error");
  const submitBtn = document.getElementById("submit-btn");

  const params = new URLSearchParams(window.location.search);
  const editId = params.get("id");

  if (editId) {
    try {
      const existing = await fetchStudentById(editId);
      prefillForm(form, existing);
    } catch (err) {
      errorEl.textContent = "تعذر تحميل بيانات الطالب للتعديل: " + err.message;
      errorEl.classList.remove("hidden");
    }
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;

    errorEl.classList.add("hidden");
    submitBtn.disabled = true;
    submitBtn.textContent = editId ? "جارٍ الحفظ..." : "جارٍ الحفظ...";

    try {
      const payload = buildPayloadFromForm(form);
      const savedId = editId ? (await updateStudent(editId, payload)).id : (await insertStudent(payload)).id;
      window.location.href = `student.html?id=${savedId}`;
    } catch (err) {
      errorEl.textContent = err.message || "حدث خطأ أثناء الحفظ";
      errorEl.classList.remove("hidden");
      submitBtn.disabled = false;
      submitBtn.textContent = editId ? "حفظ التعديلات" : "حفظ بيانات الطالب";
    }
  });
}

init();
