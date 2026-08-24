// Hand-written types mirroring supabase/schema.sql.
// Regenerate with `supabase gen types typescript` once the project is linked.

export type IdType = "national_id" | "nationality";
export type EconomicLevel = "below_poverty" | "poor" | "middle" | "high";
export type PreviousYearResult = "new_registration" | "passed" | "failed";
export type YesNo = "yes" | "no";
export type BloodType = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";

export interface Student {
  id: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;

  student_first_name: string;
  student_second_name: string;
  student_third_name: string;
  student_fourth_name: string;
  student_surname: string;

  date_of_birth: string;

  mother_first_name: string;
  mother_second_name: string;
  mother_third_name: string;

  student_id_type: IdType;
  student_national_id_number: string | null;
  student_civil_status_id_number: string | null;
  student_nationality_cert_number: string | null;
  student_record_number: string | null;
  student_page_number: string | null;
  student_issuing_authority: string | null;

  father_id_type: IdType;
  father_national_id_number: string | null;
  father_civil_status_id_number: string | null;
  father_nationality_cert_number: string | null;
  father_record_number: string | null;
  father_page_number: string | null;
  father_issuing_authority: string | null;

  birthplace: string | null;
  blood_type: BloodType | null;
  has_special_needs: YesNo;
  economic_level: EconomicLevel;
  has_social_welfare: YesNo;

  previous_academic_year: string | null;
  previous_year_result: PreviousYearResult;
  current_grade: string;
  section: string | null;

  neighborhood: string | null;
  mahalla: string | null;
  alley: string | null;
  nearest_landmark: string | null;

  guardian_phone: string;
}

export type StudentInsert = Omit<Student, "id" | "created_at" | "updated_at" | "created_by">;
export type StudentUpdate = Partial<StudentInsert>;

export interface StudentStats {
  total_students: number;
  new_registrations_this_month: number;
  passed_count: number;
  failed_count: number;
  special_needs_count: number;
  social_welfare_count: number;
}

export interface Database {
  public: {
    Tables: {
      students: {
        Row: Student;
        Insert: StudentInsert;
        Update: StudentUpdate;
      };
    };
    Views: {
      student_stats: {
        Row: StudentStats;
      };
    };
  };
}
