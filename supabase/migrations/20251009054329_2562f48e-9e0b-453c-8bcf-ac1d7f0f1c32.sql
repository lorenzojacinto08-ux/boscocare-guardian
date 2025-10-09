-- Create user roles enum
CREATE TYPE public.app_role AS ENUM ('guidance', 'pastoral', 'student_records');

-- Create user_roles table for role management
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
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

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Guidance Activity Schedule table
CREATE TABLE public.guidance_activity_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER,
  location TEXT,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.guidance_activity_schedule ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Guidance staff can manage activity schedules"
  ON public.guidance_activity_schedule
  FOR ALL
  USING (public.has_role(auth.uid(), 'guidance'));

-- Guidance Schedule History table
CREATE TABLE public.guidance_schedule_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  completed_date TIMESTAMP WITH TIME ZONE NOT NULL,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.guidance_schedule_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Guidance staff can manage schedule history"
  ON public.guidance_schedule_history
  FOR ALL
  USING (public.has_role(auth.uid(), 'guidance'));

-- Pastoral Activities table
CREATE TABLE public.pastoral_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  activity_date TIMESTAMP WITH TIME ZONE NOT NULL,
  activity_type TEXT,
  participants_count INTEGER,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.pastoral_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pastoral staff can manage activities"
  ON public.pastoral_activities
  FOR ALL
  USING (public.has_role(auth.uid(), 'pastoral'));

-- Sacrament Documents table
CREATE TABLE public.sacrament_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name TEXT NOT NULL,
  sacrament_type TEXT NOT NULL,
  document_date TIMESTAMP WITH TIME ZONE NOT NULL,
  document_number TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.sacrament_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pastoral staff can manage sacrament documents"
  ON public.sacrament_documents
  FOR ALL
  USING (public.has_role(auth.uid(), 'pastoral'));

-- Student Records table
CREATE TABLE public.student_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  address TEXT,
  year_level TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.student_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Student records staff can manage student records"
  ON public.student_records
  FOR ALL
  USING (public.has_role(auth.uid(), 'student_records'));

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for all tables
CREATE TRIGGER update_guidance_activity_schedule_updated_at
  BEFORE UPDATE ON public.guidance_activity_schedule
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_guidance_schedule_history_updated_at
  BEFORE UPDATE ON public.guidance_schedule_history
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pastoral_activities_updated_at
  BEFORE UPDATE ON public.pastoral_activities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sacrament_documents_updated_at
  BEFORE UPDATE ON public.sacrament_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_student_records_updated_at
  BEFORE UPDATE ON public.student_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();