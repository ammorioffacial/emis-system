-- Sample data for local development / demo purposes

insert into public.students (
  student_first_name, student_second_name, student_third_name, student_fourth_name, student_surname,
  date_of_birth,
  mother_first_name, mother_second_name, mother_third_name,
  student_id_type, student_national_id_number, student_civil_status_id_number,
  student_nationality_cert_number, student_record_number, student_page_number, student_issuing_authority,
  father_id_type, father_national_id_number, father_civil_status_id_number,
  father_nationality_cert_number, father_record_number, father_page_number, father_issuing_authority,
  birthplace, blood_type, has_special_needs, economic_level, has_social_welfare,
  previous_academic_year, previous_year_result, current_grade, section,
  neighborhood, mahalla, alley, nearest_landmark, guardian_phone
) values
(
  'أحمد', 'محمد', 'علي', 'حسين', 'الجبوري',
  '2015-03-12',
  'زينب', 'كريم', 'عبود',
  'national_id', '19850102345', '20221234',
  '5567', '112', '48', 'دائرة الأحوال المدنية - بغداد',
  'national_id', '19800112233', '20180099',
  '3321', '87', '20', 'دائرة الأحوال المدنية - بغداد',
  'بغداد', 'O+', 'no', 'middle', 'no',
  '2024/2025', 'passed', 'الرابع الابتدائي', 'أ',
  'الكرادة', 'محلة 102', 'زقاق 7', 'قرب مسجد الرحمن', '07701234567'
),
(
  'مريم', 'سالم', 'كاظم', 'جبار', 'الساعدي',
  '2016-07-22',
  'هدى', 'رياض', 'صالح',
  'nationality', null, '20191187',
  '4521', '65', '14', 'دائرة الأحوال المدنية - النجف',
  'national_id', '19750098211', '20150056',
  '2210', '40', '9', 'دائرة الأحوال المدنية - النجف',
  'النجف', 'A+', 'yes', 'poor', 'yes',
  '2024/2025', 'new_registration', 'الثالث الابتدائي', 'ب',
  'حي السلام', 'محلة 55', 'زقاق 3', 'قرب مدرسة الفراهيدي', '07809876543'
);
