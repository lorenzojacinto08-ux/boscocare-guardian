-- Add new fields to student_records table
ALTER TABLE public.student_records
ADD COLUMN IF NOT EXISTS gender text,
ADD COLUMN IF NOT EXISTS date_of_birth date,
ADD COLUMN IF NOT EXISTS section_program text,
ADD COLUMN IF NOT EXISTS phone_number text,
ADD COLUMN IF NOT EXISTS email_address text,
ADD COLUMN IF NOT EXISTS parent_guardian_name text,
ADD COLUMN IF NOT EXISTS parent_contact_number text,
ADD COLUMN IF NOT EXISTS parent_relationship text,
ADD COLUMN IF NOT EXISTS current_status text DEFAULT 'Active',
ADD COLUMN IF NOT EXISTS subjects_courses text,
ADD COLUMN IF NOT EXISTS average_grade numeric(5,2),
ADD COLUMN IF NOT EXISTS education_level text NOT NULL DEFAULT 'Elementary';

-- Add check constraint for current_status
ALTER TABLE public.student_records
ADD CONSTRAINT check_current_status 
CHECK (current_status IN ('Active', 'Transferred', 'Graduated'));

-- Add check constraint for education_level
ALTER TABLE public.student_records
ADD CONSTRAINT check_education_level 
CHECK (education_level IN ('Elementary', 'High School', 'Senior High', 'College'));