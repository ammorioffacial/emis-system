// Requires the Supabase UMD bundle to be loaded before this file:
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>
// and js/config.js loaded before this file.

const { SUPABASE_URL, SUPABASE_ANON_KEY } = window.EMIS_CONFIG;

window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ---------------------------------------------------------------------
// Auth helpers
// ---------------------------------------------------------------------

async function getSession() {
  const { data } = await window.supabaseClient.auth.getSession();
  return data.session;
}

async function signInWithPassword(email, password) {
  return window.supabaseClient.auth.signInWithPassword({ email, password });
}

async function signOut() {
  return window.supabaseClient.auth.signOut();
}

/** Redirects to login.html if there is no active session. Call at the top of every protected page. */
async function requireAuth() {
  const session = await getSession();
  if (!session) {
    window.location.href = "login.html";
    return null;
  }
  return session;
}

/**
 * Reads the user's role from Supabase Auth app_metadata (settable only via
 * the Supabase dashboard or Admin API — never client-side, which is what
 * makes it safe to trust for access control). No role set = "admin", for
 * backward compatibility with users created before roles existed.
 */
function getUserRole(session) {
  return session?.user?.app_metadata?.role || "admin";
}

function isDataEntryUser(session) {
  return getUserRole(session) === "data_entry";
}

// ---------------------------------------------------------------------
// Students data access
// ---------------------------------------------------------------------

async function fetchStudents() {
  const { data, error } = await window.supabaseClient
    .from("students")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

async function fetchStudentById(id) {
  const { data, error } = await window.supabaseClient
    .from("students")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

async function fetchStudentStats() {
  const { data, error } = await window.supabaseClient
    .from("student_stats")
    .select("*")
    .single();
  if (error) {
    return {
      total_students: 0,
      new_registrations_this_month: 0,
      passed_count: 0,
      failed_count: 0,
      special_needs_count: 0,
      social_welfare_count: 0,
    };
  }
  return data;
}

async function insertStudent(payload) {
  const { data, error } = await window.supabaseClient
    .from("students")
    .insert(payload)
    .select("id")
    .single();
  if (error) throw error;
  return data;
}

/** Full-row update used by the edit-student flow (add-student.html?id=...). */
async function updateStudent(id, payload) {
  const { data, error } = await window.supabaseClient
    .from("students")
    .update(payload)
    .eq("id", id)
    .select("id")
    .single();
  if (error) throw error;
  return data;
}

async function fetchStatsByGradeSection() {
  const { data, error } = await window.supabaseClient.from("student_stats_by_grade_section").select("*");
  if (error) throw error;
  return data ?? [];
}

async function fetchStatsBySpecialNeedsType() {
  const { data, error } = await window.supabaseClient.from("student_stats_by_special_needs_type").select("*");
  if (error) throw error;
  return data ?? [];
}

async function fetchStatsByPreviousSchool() {
  const { data, error } = await window.supabaseClient.from("student_stats_by_previous_school").select("*");
  if (error) throw error;
  return data ?? [];
}

async function deleteStudent(id) {
  const { error } = await window.supabaseClient.from("students").delete().eq("id", id);
  if (error) throw error;
}

/** Uploads a student photo to the `student-photos` storage bucket and returns its public URL. */
async function uploadStudentPhoto(file) {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error } = await window.supabaseClient.storage.from("student-photos").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;

  const { data } = window.supabaseClient.storage.from("student-photos").getPublicUrl(path);
  return data.publicUrl;
}

/** Updates only the photo_url column for an existing student (used by the replace-photo flow). */
async function updateStudentPhotoUrl(id, photoUrl) {
  const { error } = await window.supabaseClient.from("students").update({ photo_url: photoUrl }).eq("id", id);
  if (error) throw error;
}
