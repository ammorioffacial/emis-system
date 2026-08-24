let allStudents = [];
let filteredStudents = [];
let currentStats = null;
let charts = {};

/** Formats a date with plain ASCII digits (avoids Arabic-Indic numerals from ar-EG locale). */
function formatDateEn(dateStr) {
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${d.getFullYear()}/${month}/${day}`;
}

const resultBadgeClass = {
  passed: "bg-emerald-50 text-emerald-700",
  failed: "bg-rose-50 text-rose-700",
  new_registration: "bg-blue-50 text-blue-700",
};

function renderStats(stats) {
  document.getElementById("stat-total").textContent = stats.total_students;
  document.getElementById("stat-new").textContent = stats.new_registrations_this_month;
  document.getElementById("stat-passed").textContent = stats.passed_count;
  document.getElementById("stat-failed").textContent = stats.failed_count;
}

function renderStudents(students) {
  const tbody = document.getElementById("students-tbody");

  if (students.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="px-5 py-10 text-center text-slate-400">لا توجد نتائج مطابقة</td></tr>`;
    return;
  }

  tbody.innerHTML = students
    .map((s) => {
      // Triple name: first (self) + second (father) + third (grandfather) —
      // not the surname, per the requested display convention.
      const fullName = `${s.student_first_name} ${s.student_second_name} ${s.student_third_name}`;
      const date = formatDateEn(s.created_at);
      return `
        <tr class="border-b border-slate-50 transition hover:bg-slate-50">
          <td class="px-5 py-3">
            <a href="student.html?id=${s.id}" class="font-semibold text-brand-700 hover:underline">${fullName}</a>
          </td>
          <td class="px-5 py-3 text-slate-600">${s.current_grade ?? "—"}</td>
          <td class="px-5 py-3 text-slate-600">${s.section ?? "—"}</td>
          <td class="px-5 py-3">
            <span class="rounded-full px-2.5 py-1 text-xs font-semibold ${resultBadgeClass[s.previous_year_result]}">
              ${PREVIOUS_RESULT_LABELS[s.previous_year_result]}
            </span>
          </td>
          <td class="px-5 py-3 text-slate-600" dir="ltr">${s.guardian_phone ?? "—"}</td>
          <td class="px-5 py-3 text-slate-500">${date}</td>
          <td class="px-5 py-3">
            <div class="flex items-center gap-2">
              <a href="student.html?id=${s.id}" class="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700" title="طباعة الاستمارة">
                🖨 طباعة
              </a>
              <a href="add-student.html?id=${s.id}" class="flex items-center gap-1.5 rounded-lg border border-amber-200 px-2.5 py-1.5 text-xs font-semibold text-amber-700 transition hover:border-amber-400 hover:bg-amber-50" title="تعديل بيانات الطالب">
                ✏️ تعديل
              </a>
              <button class="delete-row-btn flex items-center gap-1.5 rounded-lg border border-rose-200 px-2.5 py-1.5 text-xs font-semibold text-rose-600 transition hover:border-rose-400 hover:bg-rose-50" data-student-id="${s.id}" title="حذف الطالب">
                🗑 حذف
              </button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
}

// ---------------------------------------------------------------------
// Search + advanced filters, combined into one pass over allStudents.
// ---------------------------------------------------------------------
function applySearch() {
  const q = document.getElementById("search-input").value.trim().toLowerCase();
  const dateFrom = document.getElementById("filter-date-from").value;
  const dateTo = document.getElementById("filter-date-to").value;
  const academicStatus = document.getElementById("filter-academic-status").value;
  const birthYear = document.getElementById("filter-birth-year").value.trim();
  const socialCareOnly = document.getElementById("filter-social-care").checked;
  const gradeSection = document.getElementById("filter-grade-section").value;
  const previousSchool = document.getElementById("filter-previous-school").value;
  const socialWelfareStatus = document.getElementById("filter-social-welfare-status").value;

  const filtered = allStudents.filter((s) => {
    if (q) {
      const fullName = `${s.student_first_name} ${s.student_second_name} ${s.student_third_name} ${s.student_fourth_name} ${s.student_surname}`.toLowerCase();
      if (!fullName.includes(q)) return false;
    }

    if (dateFrom) {
      const registeredDate = s.created_at.slice(0, 10);
      if (registeredDate < dateFrom) return false;
    }
    if (dateTo) {
      const registeredDate = s.created_at.slice(0, 10);
      if (registeredDate > dateTo) return false;
    }

    if (academicStatus && s.previous_year_result !== academicStatus) return false;

    if (birthYear) {
      const dobYear = s.date_of_birth ? String(new Date(s.date_of_birth).getFullYear()) : "";
      if (dobYear !== birthYear) return false;
    }

    if (socialCareOnly) {
      const isSocialCare = s.has_social_welfare === "yes" || s.economic_level === "below_poverty";
      if (!isSocialCare) return false;
    }

    if (gradeSection) {
      const key = `${s.current_grade}||${s.section ?? ""}`;
      if (key !== gradeSection) return false;
    }

    if (previousSchool && s.previous_school !== previousSchool) return false;

    if (socialWelfareStatus && s.has_social_welfare !== socialWelfareStatus) return false;

    return true;
  });

  filteredStudents = filtered;
  renderStudents(filtered);
}

function clearFilters() {
  document.getElementById("search-input").value = "";
  document.getElementById("filter-date-from").value = "";
  document.getElementById("filter-date-to").value = "";
  document.getElementById("filter-academic-status").value = "";
  document.getElementById("filter-birth-year").value = "";
  document.getElementById("filter-social-care").checked = false;
  document.getElementById("filter-grade-section").value = "";
  document.getElementById("filter-previous-school").value = "";
  document.getElementById("filter-social-welfare-status").value = "";
  filteredStudents = allStudents;
  renderStudents(allStudents);
}

// ---------------------------------------------------------------------
// Populate the grade+section and previous-school filter dropdowns from
// the data actually present (rather than a fixed list), since these are
// free-form/derived combinations.
// ---------------------------------------------------------------------
function populateDerivedFilters(students) {
  const gradeSectionSelect = document.getElementById("filter-grade-section");
  const seenGradeSections = new Set();
  students.forEach((s) => {
    const key = `${s.current_grade}||${s.section ?? ""}`;
    if (seenGradeSections.has(key)) return;
    seenGradeSections.add(key);
    const opt = document.createElement("option");
    opt.value = key;
    opt.textContent = s.section ? `${s.current_grade} - شعبة ${s.section}` : s.current_grade;
    gradeSectionSelect.appendChild(opt);
  });

  const schoolSelect = document.getElementById("filter-previous-school");
  const seenSchools = new Set();
  students.forEach((s) => {
    if (!s.previous_school || seenSchools.has(s.previous_school)) return;
    seenSchools.add(s.previous_school);
    const opt = document.createElement("option");
    opt.value = s.previous_school;
    opt.textContent = s.previous_school;
    schoolSelect.appendChild(opt);
  });
}

// ---------------------------------------------------------------------
// Analytics panel (الإحصائيات الشاملة) — Chart.js visualizations
// ---------------------------------------------------------------------
const CHART_PALETTE = ["#2563eb", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899", "#84cc16"];

function destroyChart(key) {
  if (charts[key]) {
    charts[key].destroy();
    delete charts[key];
  }
}

function renderNoDataMessage(canvasId) {
  const canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#94a3b8";
  ctx.font = "13px Tajawal, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("لا توجد بيانات", canvas.width / 2, canvas.height / 2);
}

async function renderAnalyticsPanel() {
  try {
    const [byGradeSection, bySpecialNeeds, byPreviousSchool] = await Promise.all([
      fetchStatsByGradeSection(),
      fetchStatsBySpecialNeedsType(),
      fetchStatsByPreviousSchool(),
    ]);

    destroyChart("gradeSection");
    if (byGradeSection.length === 0) {
      renderNoDataMessage("chart-grade-section");
    } else {
      charts.gradeSection = new Chart(document.getElementById("chart-grade-section"), {
        type: "bar",
        data: {
          labels: byGradeSection.map((r) => `${r.current_grade}${r.section ? " - " + r.section : ""}`),
          datasets: [{ label: "عدد الطلاب", data: byGradeSection.map((r) => r.student_count), backgroundColor: "#2563eb", borderRadius: 6 }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          indexAxis: "y",
          plugins: { legend: { display: false } },
          scales: { x: { beginAtZero: true, ticks: { precision: 0 } } },
        },
      });
    }

    destroyChart("specialNeeds");
    if (bySpecialNeeds.length === 0) {
      renderNoDataMessage("chart-special-needs");
    } else {
      charts.specialNeeds = new Chart(document.getElementById("chart-special-needs"), {
        type: "doughnut",
        data: {
          labels: bySpecialNeeds.map((r) => SPECIAL_NEEDS_TYPE_LABELS[r.special_needs_type] ?? r.special_needs_type),
          datasets: [{ data: bySpecialNeeds.map((r) => r.student_count), backgroundColor: CHART_PALETTE }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: "bottom", labels: { boxWidth: 10, font: { size: 11 } } } },
        },
      });
    }

    destroyChart("previousSchool");
    if (byPreviousSchool.length === 0) {
      renderNoDataMessage("chart-previous-school");
    } else {
      charts.previousSchool = new Chart(document.getElementById("chart-previous-school"), {
        type: "bar",
        data: {
          labels: byPreviousSchool.map((r) => r.previous_school),
          datasets: [{ label: "عدد الطلاب", data: byPreviousSchool.map((r) => r.student_count), backgroundColor: "#10b981", borderRadius: 6 }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
        },
      });
    }
  } catch (err) {
    const panel = document.getElementById("analytics-panel");
    panel.innerHTML = `<p class="text-sm text-rose-500 lg:col-span-3">تعذر تحميل الإحصائيات: ${err.message}</p>`;
  }
}

async function handleDeleteStudent(id) {
  const student = allStudents.find((s) => s.id === id);
  const name = student ? `${student.student_first_name} ${student.student_second_name} ${student.student_third_name}` : "هذا الطالب";
  if (!confirm(`هل أنت متأكد من حذف بيانات ${name}؟ لا يمكن التراجع عن هذا الإجراء.`)) return;

  try {
    await deleteStudent(id);
    allStudents = allStudents.filter((s) => s.id !== id);
    filteredStudents = filteredStudents.filter((s) => s.id !== id);
    renderStudents(filteredStudents);
    currentStats = await fetchStudentStats();
    renderStats(currentStats);
  } catch (err) {
    alert("تعذر حذف الطالب: " + err.message);
  }
}

async function init() {
  const session = await requireAuth();
  if (!session) return;

  // Restricted "data entry" users never see the dashboard or its stats/
  // table/charts — bounce them out before any of it renders or becomes
  // visible (#app-root stays display:none the whole time for this role).
  if (getUserRole(session) !== "admin") {
    window.location.href = "student.html";
    return;
  }

  document.getElementById("auth-loading").remove();
  document.getElementById("app-root").style.display = "";

  async function handleLogout() {
    await signOut();
    window.location.href = "login.html";
  }
  document.getElementById("logout-btn")?.addEventListener("click", handleLogout);
  document.getElementById("logout-btn-mobile")?.addEventListener("click", handleLogout);

  document.getElementById("search-input").addEventListener("input", applySearch);
  document.getElementById("filter-date-from").addEventListener("change", applySearch);
  document.getElementById("filter-date-to").addEventListener("change", applySearch);
  document.getElementById("filter-academic-status").addEventListener("change", applySearch);
  document.getElementById("filter-birth-year").addEventListener("input", applySearch);
  document.getElementById("filter-social-care").addEventListener("change", applySearch);
  document.getElementById("filter-grade-section").addEventListener("change", applySearch);
  document.getElementById("filter-previous-school").addEventListener("change", applySearch);
  document.getElementById("filter-social-welfare-status").addEventListener("change", applySearch);
  document.getElementById("filter-clear-btn").addEventListener("click", clearFilters);

  document.getElementById("students-tbody").addEventListener("click", (e) => {
    const deleteBtn = e.target.closest(".delete-row-btn");
    if (deleteBtn) {
      handleDeleteStudent(deleteBtn.dataset.studentId);
    }
  });

  document.getElementById("export-btn").addEventListener("click", () => {
    if (!currentStats) return;
    // Exports only the currently filtered/displayed set, not every record.
    exportStudentsToExcel(filteredStudents, currentStats);
  });

  try {
    const [students, stats] = await Promise.all([fetchStudents(), fetchStudentStats()]);
    allStudents = students;
    filteredStudents = students;
    currentStats = stats;
    renderStats(stats);
    renderStudents(students);
    populateDerivedFilters(students);
    renderAnalyticsPanel();
  } catch (err) {
    document.getElementById("students-tbody").innerHTML =
      `<tr><td colspan="7" class="px-5 py-10 text-center text-rose-500">تعذر تحميل البيانات: ${err.message}</td></tr>`;
  }
}

init();
