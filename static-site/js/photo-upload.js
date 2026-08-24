// Wires the circular avatar upload control used on add-student.html and
// editable-form.html: shows an immediate local preview, uploads to the
// `student-photos` Supabase Storage bucket in the background, and stores
// the resulting public URL in a hidden `photo_url` form field.
function initPhotoUpload() {
  const input = document.getElementById("photo-input");
  const preview = document.getElementById("photo-preview");
  const placeholder = document.getElementById("photo-placeholder-icon");
  const hiddenField = document.getElementById("photo_url_hidden");
  const statusEl = document.getElementById("photo-upload-status");
  if (!input) return;

  input.addEventListener("change", async () => {
    const file = input.files[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    preview.src = localUrl;
    preview.classList.remove("hidden");
    placeholder.classList.add("hidden");

    if (statusEl) statusEl.textContent = "جارٍ رفع الصورة...";

    try {
      const url = await uploadStudentPhoto(file);
      hiddenField.value = url;
      if (statusEl) statusEl.textContent = "تم رفع الصورة بنجاح";
    } catch (err) {
      if (statusEl) statusEl.textContent = "";
      alert("تعذر رفع الصورة: " + err.message);
    }
  });
}
