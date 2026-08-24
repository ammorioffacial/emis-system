import { createClient as createServerClient } from "@/lib/supabase/server";
import type { Student, StudentStats } from "@/types/database";

export async function getStudents(): Promise<Student[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getStudentById(id: string): Promise<Student | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data;
}

export async function getStudentStats(): Promise<StudentStats> {
  const supabase = createServerClient();
  const { data, error } = await supabase.from("student_stats").select("*").single();

  if (error || !data) {
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
