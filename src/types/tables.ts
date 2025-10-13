// Auto-generated types based on supabase/references/tables.md
// Notes:
// - SQL `uuid` -> string
// - `timestamp with time zone` / `date` -> string (ISO date)
// - `numeric` -> number
// - user-defined types (enums) are typed as string aliases. Replace with real unions if available.

export type UUID = string;
export type ISODateString = string;

// User-defined / enum placeholders (narrow these if you have enum definitions)
export type EnlistmentStatus = string; // e.g. 'pending' | 'approved' | 'rejected'
export type EnrollmentStatus = string; // e.g. 'pending' | 'active' | 'completed'
export type PaymentMethod = string;
export type StudentStatus = string; // e.g. 'enrolled' | 'withdrawn'
export type UserRole = string; // e.g. 'user' | 'admin'
export type Gender = string;
export type CivilStatus = string;
export type AddressType = string;

export interface Balance {
  id: UUID;
  student_profile_id: UUID;
  amount_due: number;
  due_date: ISODateString;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface Course {
  id: UUID;
  name: string;
  title: string;
  years: number;
  description?: string | null;
  department?: string | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface EnlistedSubject {
  id: UUID;
  enlistment_id: UUID;
  subject_id: UUID;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface Enlistment {
  id: UUID;
  enrollment_id: UUID;
  student_id: UUID;
  course_id: UUID;
  status: EnlistmentStatus;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface Enrollment {
  id: UUID;
  student_profile_id: UUID;
  course_id: UUID;
  year_level: string;
  semester: string;
  school_year: string;
  status: EnrollmentStatus;
  section?: string | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface GuidanceActivitySchedule {
  id: UUID;
  title: string;
  description?: string | null;
  scheduled_date: ISODateString;
  duration_minutes?: number | null;
  location?: string | null;
  created_at?: ISODateString | null;
  updated_at?: ISODateString | null;
}

export interface GuidanceScheduleHistory {
  id: UUID;
  title: string;
  description?: string | null;
  completed_date: ISODateString;
  notes?: string | null;
  created_at?: ISODateString | null;
  updated_at?: ISODateString | null;
}

export interface PastoralActivity {
  id: UUID;
  title: string;
  description?: string | null;
  activity_date: ISODateString;
  activity_type?: string | null;
  participants_count?: number | null;
  created_at?: ISODateString | null;
  updated_at?: ISODateString | null;
}

export interface Payment {
  id: UUID;
  student_profile_id: UUID;
  balance_id: UUID;
  payment_method: PaymentMethod;
  reference_number: string;
  payment_date: ISODateString;
  amount_paid: number;
  reason?: string | null;
  description?: string | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface SacramentDocument {
  id: UUID;
  student_id: UUID;
  sacrament_type: string;
  document_date: ISODateString;
  document_number?: string | null;
  notes?: string | null;
  created_at?: ISODateString | null;
  updated_at?: ISODateString | null;
}

export interface StudentProfile {
  id: UUID;
  user_id: UUID;
  course_id: UUID;
  status: StudentStatus;
  enrollment_date: ISODateString;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface StudentRecord {
  id: UUID;
  student_id: UUID;
  name: string;
  address?: string | null;
  year_level: string;
  created_at?: ISODateString | null;
  updated_at?: ISODateString | null;
}

export interface Subject {
  id: UUID;
  course_id: UUID;
  subject_code: string;
  subject_name: string;
  units: number;
  description?: string | null;
  semester?: number | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface User {
  id: UUID;
  auth_user_id?: UUID | null;
  first_name?: string | null;
  middle_name?: string | null;
  last_name?: string | null;
  email: string;
  student_number?: string | null;
  gender?: Gender | null;
  birthday?: ISODateString | null;
  citizenship?: string | null;
  civil_status?: CivilStatus | null;
  religion?: string | null;
  landline_number?: string | null;
  mobile_number?: string | null;
  country?: string | null;
  street_address?: string | null;
  address_type?: AddressType | null;
  father_last_name?: string | null;
  father_first_name?: string | null;
  father_middle_name?: string | null;
  father_residential_address?: string | null;
  father_citizenship?: string | null;
  father_religion?: string | null;
  father_email?: string | null;
  father_mobile_number?: string | null;
  father_landline_number?: string | null;
  mother_last_name?: string | null;
  mother_first_name?: string | null;
  mother_middle_name?: string | null;
  mother_residential_address?: string | null;
  mother_citizenship?: string | null;
  mother_religion?: boolean | null;
  mother_email?: string | null;
  mother_mobile_number?: string | null;
  mother_landline_number?: string | null;
  guardian_last_name?: string | null;
  guardian_first_name?: string | null;
  guardian_middle_name?: string | null;
  guardian_residential_address?: string | null;
  guardian_citizenship?: string | null;
  guardian_roman_catholic?: boolean | null;
  guardian_email?: string | null;
  guardian_mobile_number?: string | null;
  guardian_landline_number?: string | null;
  guardian_relationship?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_mobile_number?: string | null;
  role: UserRole;
  created_at: ISODateString;
  updated_at: ISODateString;
}

// Optional: grouped export
export const tableTypes = {
  Balance: {} as Balance,
  Course: {} as Course,
  EnlistedSubject: {} as EnlistedSubject,
  Enlistment: {} as Enlistment,
  Enrollment: {} as Enrollment,
  GuidanceActivitySchedule: {} as GuidanceActivitySchedule,
  GuidanceScheduleHistory: {} as GuidanceScheduleHistory,
  PastoralActivity: {} as PastoralActivity,
  Payment: {} as Payment,
  SacramentDocument: {} as SacramentDocument,
  StudentProfile: {} as StudentProfile,
  StudentRecord: {} as StudentRecord,
  Subject: {} as Subject,
  User: {} as User,
};
