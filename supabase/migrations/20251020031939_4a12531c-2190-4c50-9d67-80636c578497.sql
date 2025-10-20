-- Drop existing foreign key constraints and recreate with CASCADE
-- This allows user deletion to automatically remove all their created records

-- pastoral_activities
ALTER TABLE public.pastoral_activities
DROP CONSTRAINT IF EXISTS pastoral_activities_created_by_fkey;

ALTER TABLE public.pastoral_activities
ADD CONSTRAINT pastoral_activities_created_by_fkey
FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE CASCADE;

-- guidance_activity_schedule
ALTER TABLE public.guidance_activity_schedule
DROP CONSTRAINT IF EXISTS guidance_activity_schedule_created_by_fkey;

ALTER TABLE public.guidance_activity_schedule
ADD CONSTRAINT guidance_activity_schedule_created_by_fkey
FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE CASCADE;

-- guidance_schedule_history
ALTER TABLE public.guidance_schedule_history
DROP CONSTRAINT IF EXISTS guidance_schedule_history_created_by_fkey;

ALTER TABLE public.guidance_schedule_history
ADD CONSTRAINT guidance_schedule_history_created_by_fkey
FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE CASCADE;

-- sacrament_documents
ALTER TABLE public.sacrament_documents
DROP CONSTRAINT IF EXISTS sacrament_documents_created_by_fkey;

ALTER TABLE public.sacrament_documents
ADD CONSTRAINT sacrament_documents_created_by_fkey
FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE CASCADE;

-- student_records
ALTER TABLE public.student_records
DROP CONSTRAINT IF EXISTS student_records_created_by_fkey;

ALTER TABLE public.student_records
ADD CONSTRAINT student_records_created_by_fkey
FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE CASCADE;