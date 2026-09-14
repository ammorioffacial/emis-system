// Wires the circular avatar upload control used on add-student.html,
// editable-form.html, and teacher-register.html: shows an immediate
// local preview, uploads to a Supabase Storage bucket in the
// background, and stores the resulting public URL in a hidden
// `photo_url` form field. Defaults to the student-photos bucket;
// pass uploadTeacherPhoto for the teacher registration form.
function initPhotoUpload(uploadFn = uploadStudentPhoto) {
  const input = document.getElementById("photo-input");
  const preview = document.getElementById("photo-preview");
  const placeholder = document.getElementById("photo-placeholder-icon");
  const hiddenField = document.getElementById("photo_url_hidden");
  const statusEl = document.getElementById("photo-upload-status");
  if (!input) return;

  const MAX_PHOTO_BYTES = 10 * 1024 * 1024; // 10MB

  input.addEventListener("change", async () => {
    const file = input.files[0];
    if (!file) return;

    if (file.size > MAX_PHOTO_BYTES) {
      alert("حجم الصورة أكبر من الحد المسموح (10 ميجابايت). الرجاء اختيار صورة أصغر.");
      input.value = "";
      return;
    }

    const localUrl = URL.createObjectURL(file);
    preview.src = localUrl;
    preview.classList.remove("hidden");
    placeholder.classList.add("hidden");

    if (statusEl) statusEl.textContent = "جارٍ رفع الصورة...";

    try {
      const url = await uploadFn(file);
      hiddenField.value = url;
      if (statusEl) statusEl.textContent = "تم رفع الصورة بنجاح";
    } catch (err) {
      if (statusEl) statusEl.textContent = "";
      alert("تعذر رفع الصورة: " + err.message);
    }
  });
}
