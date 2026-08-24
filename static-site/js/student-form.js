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
// Restricted "data entry" role: only the basic student-info and
// mother-name sections are editable; everything else (dashboard nav
// chrome + the other form cards) is hidden. Inputs inside hidden
// sections are disabled so FormData/buildPayloadFromForm omits them and
// their `required` attributes don't block reportValidity().
// ---------------------------------------------------------------------
function applyDataEntryRestrictions() {
  document.querySelectorAll("[data-admin-only]").forEach((el) => {
    el.classList.add("hidden");
    el.querySelectorAll("input, select, textarea").forEach((field) => {
      field.disabled = true;
    });
  });
}

// ---------------------------------------------------------------------
// Auto-save draft: mirrors every field into localStorage as the user
// types, so an accidental tab close doesn't lose their work. Scoped per
// mode (new vs. editing a specific student) so drafts never bleed
// across different records.
// ---------------------------------------------------------------------
function draftStorageKey(editId) {
  return editId ? `emis-draft-edit-${editId}` : "emis-draft-new";
}

function saveDraft(form, editId) {
  const draft = {};
  Array.from(form.elements).forEach((field) => {
    if (!field.name || field.type === "file") return;
    draft[field.name] = field.value;
  });
  localStorage.setItem(draftStorageKey(editId), JSON.stringify(draft));
}

function clearDraft(editId) {
  localStorage.removeItem(draftStorageKey(editId));
}

function initDraftAutoSave(form, editId) {
  form.addEventListener("input", () => saveDraft(form, editId));
  form.addEventListener("change", () => saveDraft(form, editId));
}

/** Offers to restore a saved draft; returns true if one was found (whether or not the user restored it). */
function offerDraftRestore(form, editId) {
  const raw = localStorage.getItem(draftStorageKey(editId));
  if (!raw) return false;

  let draft;
  try {
    draft = JSON.parse(raw);
  } catch {
    localStorage.removeItem(draftStorageKey(editId));
    return false;
  }

  if (!confirm("توجد بيانات محفوظة تلقائياً من محاولة سابقة لم تكتمل. هل تريد استعادتها؟")) {
    clearDraft(editId);
    return true;
  }

  Object.entries(draft).forEach(([name, value]) => {
    const field = form.elements.namedItem(name);
    if (!field || field instanceof RadioNodeList || field.disabled) return;
    field.value = value;
  });

  // Re-run every field's own change handling so dependent UI (id-type
  // fields, special-needs type, stage/grade cascades) matches the
  // restored values instead of staying at their initial defaults.
  applyIdTypeVisibility("student");
  applyIdTypeVisibility("father");
  updateSpecialNeedsTypeVisibility();
  const currentStageSelect = document.querySelector('.stage-select[name="current_educational_stage"]');
  if (currentStageSelect) {
    populateGradeOptions(document.getElementById("current_stage_grade"), currentStageSelect.value, draft.current_grade);
    updatePreparatoryBranchVisibility();
    if (draft.current_preparatory_branch) {
      document.querySelector('select[name="current_preparatory_branch"]').value = draft.current_preparatory_branch;
    }
  }

  return true;
}

// ---------------------------------------------------------------------
// Duplicate-student check: as the student's name and mother's name are
// filled in, warn if a record with the exact same six name parts
// already exists. Best-effort only — a data_entry user's RLS grants
// them SELECT on just their own past submissions (see supabase/schema.sql),
// so this can't see duplicates created by someone else for that role.
// ---------------------------------------------------------------------
function initDuplicateCheck(form) {
  const nameFields = [
    "student_first_name",
    "student_second_name",
    "student_third_name",
    "mother_first_name",
    "mother_second_name",
    "mother_third_name",
  ];
  const warningEl = document.getElementById("duplicate-warning");
  if (!warningEl) return;

  let debounceTimer;
  async function checkForDuplicate() {
    const values = nameFields.map((name) => form.elements.namedItem(name)?.value.trim() ?? "");
    if (values.some((v) => !v)) {
      warningEl.classList.add("hidden");
      return;
    }

    try {
      const { data, error } = await window.supabaseClient
        .from("students")
        .select("id")
        .eq("student_first_name", values[0])
        .eq("student_second_name", values[1])
        .eq("student_third_name", values[2])
        .eq("mother_first_name", values[3])
        .eq("mother_second_name", values[4])
        .eq("mother_third_name", values[5])
        .limit(1);

      if (error) return; // best-effort: RLS/network errors just skip the warning
      warningEl.classList.toggle("hidden", !(data && data.length > 0));
    } catch {
      // best-effort only
    }
  }

  nameFields.forEach((name) => {
    const field = form.elements.namedItem(name);
    if (!field) return;
    field.addEventListener("input", () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(checkForDuplicate, 500);
    });
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
  const session = await requireAuth();
  if (!session) return;
  const restricted = isDataEntryUser(session);

  document.getElementById("logout-btn").addEventListener("click", async () => {
    await signOut();
    window.location.href = "login.html";
  });
  if (restricted) applyDataEntryRestrictions();

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
  // Restricted users can only ever create new partial records — they have
  // no SELECT access to other students' rows (see supabase/schema.sql), so edit
  // mode is not reachable for them even if ?id= is present in the URL.
  const editId = restricted ? null : params.get("id");

  if (editId) {
    try {
      const existing = await fetchStudentById(editId);
      prefillForm(form, existing);
    } catch (err) {
      errorEl.textContent = "تعذر تحميل بيانات الطالب للتعديل: " + err.message;
      errorEl.classList.remove("hidden");
    }
  } else {
    offerDraftRestore(form, editId);
  }

  initDraftAutoSave(form, editId);
  initDuplicateCheck(form);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;

    errorEl.classList.add("hidden");
    submitBtn.disabled = true;
    submitBtn.textContent = editId ? "جارٍ الحفظ..." : "جارٍ الحفظ...";

    try {
      const payload = buildPayloadFromForm(form);
      const savedId = editId ? (await updateStudent(editId, payload)).id : (await insertStudent(payload)).id;
      clearDraft(editId);
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
