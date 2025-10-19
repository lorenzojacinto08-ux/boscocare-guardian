-- Drop existing policies
DROP POLICY IF EXISTS "Guidance staff can manage activity schedules" ON public.guidance_activity_schedule;
DROP POLICY IF EXISTS "Guidance staff can manage schedule history" ON public.guidance_schedule_history;
DROP POLICY IF EXISTS "Pastoral staff can manage activities" ON public.pastoral_activities;
DROP POLICY IF EXISTS "Pastoral staff can manage sacrament documents" ON public.sacrament_documents;
DROP POLICY IF EXISTS "Student records staff can manage student records" ON public.student_records;

-- Drop the function that depends on the enum
DROP FUNCTION IF EXISTS public.has_role(uuid, app_role);

-- Update the enum type by recreating it
ALTER TABLE public.user_roles ALTER COLUMN role TYPE text;

-- Update existing roles: all guidance, pastoral, and student_records become admin
UPDATE public.user_roles 
SET role = 'admin' 
WHERE role IN ('guidance', 'pastoral', 'student_records');

-- Now create the new enum and apply it
DROP TYPE IF EXISTS public.app_role;
CREATE TYPE public.app_role AS ENUM ('admin', 'student');
ALTER TABLE public.user_roles ALTER COLUMN role TYPE app_role USING role::app_role;

-- Recreate the has_role function with the new enum
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS Policies for guidance_activity_schedule
CREATE POLICY "Admins can manage activity schedules"
ON public.guidance_activity_schedule
FOR ALL
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Students can view activity schedules"
ON public.guidance_activity_schedule
FOR SELECT
USING (has_role(auth.uid(), 'student'));

CREATE POLICY "Students can create activity schedules"
ON public.guidance_activity_schedule
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'student') AND auth.uid() = created_by);

-- RLS Policies for guidance_schedule_history
CREATE POLICY "Admins can manage schedule history"
ON public.guidance_schedule_history
FOR ALL
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Students can view schedule history"
ON public.guidance_schedule_history
FOR SELECT
USING (has_role(auth.uid(), 'student'));

-- RLS Policies for pastoral_activities
CREATE POLICY "Admins can manage pastoral activities"
ON public.pastoral_activities
FOR ALL
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Students can view pastoral activities"
ON public.pastoral_activities
FOR SELECT
USING (has_role(auth.uid(), 'student'));

-- RLS Policies for sacrament_documents
CREATE POLICY "Admins can manage sacrament documents"
ON public.sacrament_documents
FOR ALL
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Students can view sacrament documents"
ON public.sacrament_documents
FOR SELECT
USING (has_role(auth.uid(), 'student'));

-- RLS Policies for student_records
CREATE POLICY "Admins can manage student records"
ON public.student_records
FOR ALL
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Students can view student records"
ON public.student_records
FOR SELECT
USING (has_role(auth.uid(), 'student'));