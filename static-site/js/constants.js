// Shared Arabic labels for enum fields — single source of truth for
// dashboard, form, printable view, and Excel export.

const ID_TYPE_LABELS = {
  national_id: "بطاقة وطنية",
  nationality: "جنسية",
};

const ECONOMIC_LEVEL_LABELS = {
  below_poverty: "تحت خط الفقر",
  poor: "فقيرة",
  middle: "وسطى",
  high: "عليا",
};

const PREVIOUS_RESULT_LABELS = {
  new_registration: "تسجيل جديد",
  passed: "ناجح",
  failed: "راسب",
};

const YES_NO_LABELS = {
  yes: "نعم",
  no: "كلا",
};

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const GRADES = [
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

const SPECIAL_NEEDS_TYPE_LABELS = {
  physical: "العوق الفيزيائي",
  visual: "العوق البصري",
  hearing: "العوق السمعي",
  intellectual: "العوق الذهني",
  psychological: "العوق النفسي",
  autism: "التوحد",
  slow_learner: "بطيء التعلم",
};

const EDUCATIONAL_STAGE_LABELS = {
  primary: "ابتدائية",
  intermediate: "متوسطة",
  preparatory: "اعدادية",
};

const PREPARATORY_BRANCH_LABELS = {
  scientific: "علمي",
  literary: "ادبي",
};

// Grade options grouped by educational stage, for the current/previous
// stage -> grade cascading dropdowns. Full names (matching the existing
// GRADES array) so current_grade/previous_grade stay consistent with
// values already used across the dashboard, filters, print, and export.
const GRADES_BY_STAGE = {
  primary: ["الأول الابتدائي", "الثاني الابتدائي", "الثالث الابتدائي", "الرابع الابتدائي", "الخامس الابتدائي", "السادس الابتدائي"],
  intermediate: ["الأول المتوسط", "الثاني المتوسط", "الثالث المتوسط"],
  preparatory: ["الرابع الإعدادي", "الخامس الإعدادي", "السادس الإعدادي"],
};
