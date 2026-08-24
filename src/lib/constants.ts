import type { BloodType, EconomicLevel, IdType, PreviousYearResult, YesNo } from "@/types/database";

export const ID_TYPE_LABELS: Record<IdType, string> = {
  national_id: "بطاقة وطنية",
  nationality: "جنسية",
};

export const ECONOMIC_LEVEL_LABELS: Record<EconomicLevel, string> = {
  below_poverty: "تحت خط الفقر",
  poor: "فقيرة",
  middle: "وسطى",
  high: "عليا",
};

export const PREVIOUS_RESULT_LABELS: Record<PreviousYearResult, string> = {
  new_registration: "تسجيل جديد",
  passed: "ناجح",
  failed: "راسب",
};

export const YES_NO_LABELS: Record<YesNo, string> = {
  yes: "نعم",
  no: "كلا",
};

export const BLOOD_TYPES: BloodType[] = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export const GRADES = [
  "الأول الابتدائي",
  "الثاني الابتدائي",
  "الثالث الابتدائي",
  "الرابع الابتدائي",
  "الخامس الابتدائي",
  "السادس الابتدائي",
  "الأول المتوسط",
  "الثاني المتوسط",
  "الثالث المتوسط",
  "الرابع الإعدادي",
  "الخامس الإعدادي",
  "السادس الإعدادي",
];
