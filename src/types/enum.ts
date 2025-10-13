/**
 * Auto-generated enum types based on `supabase/references/enums.md`.
 * If you update the DB enum values, update these types accordingly.
 * Source: supabase/references/enums.md
 */

export const USER_ROLES = [
  "user",
  "accounting",
  "registrar",
  "admin",
  "superadmin",
  "student",
  "pastoral",
  "guidance",
] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const PAYMENT_STATUS = [
  "pending",
  "completed",
  "failed",
  "refunded",
] as const;
export type PaymentStatus = (typeof PAYMENT_STATUS)[number];

export const ADDRESS_TYPE = [
  "home",
  "permanent",
  "birthplace",
  "city",
  "no selection",
] as const;
export type AddressType = (typeof ADDRESS_TYPE)[number];

export const CIVIL_STATUS = [
  "single",
  "married",
  "divorced",
  "widowed",
  "separated",
] as const;
export type CivilStatus = (typeof CIVIL_STATUS)[number];

export const GENDER = ["male", "female", "other"] as const;
export type Gender = (typeof GENDER)[number];

export const STUDENT_STATUS = [
  "enrolled",
  "active",
  "inactive",
  "on_leave",
  "graduated",
  "dropped",
  "transferred",
] as const;
export type StudentStatus = (typeof STUDENT_STATUS)[number];

export const BALANCE_STATUS = [
  "pending",
  "paid",
  "overdue",
  "cancelled",
  "partial",
] as const;
export type BalanceStatus = (typeof BALANCE_STATUS)[number];

export const PAYMENT_METHOD = [
  "cash",
  "credit_card",
  "debit_card",
  "bank_transfer",
  "online",
  "check",
  "scholarship",
] as const;
export type PaymentMethod = (typeof PAYMENT_METHOD)[number];

export const ENROLLMENT_STATUS = [
  "pending",
  "enrolled",
  "dropped",
  "completed",
  "failed",
  "withdrawn",
] as const;
export type EnrollmentStatus = (typeof ENROLLMENT_STATUS)[number];

export const ENLISTMENT_STATUS = ["pending", "approved", "denied"] as const;
export type EnlistmentStatus = (typeof ENLISTMENT_STATUS)[number];

// Convenience: map of exported const arrays for runtime checks if needed
export const ENUMS = {
  USER_ROLES,
  PAYMENT_STATUS,
  ADDRESS_TYPE,
  CIVIL_STATUS,
  GENDER,
  STUDENT_STATUS,
  BALANCE_STATUS,
  PAYMENT_METHOD,
  ENROLLMENT_STATUS,
  ENLISTMENT_STATUS,
} as const;

export type EnumName = keyof typeof ENUMS;
