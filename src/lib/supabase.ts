import { supabase } from "@/integrations/supabase/client";

export type UserRole = 'admin' | 'student';

export const getUserRole = async (userId: string): Promise<UserRole | null> => {
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .single();

  if (error || !data) return null;
  return data.role as UserRole;
};

export const signUp = async (email: string, password: string, role: UserRole) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/`,
    }
  });

  if (error || !data.user) return { error };

  // Insert role for the new user
  const { error: roleError } = await supabase
    .from('user_roles')
    .insert({ user_id: data.user.id, role });

  return { error: roleError || error };
};

export const signIn = async (email: string, password: string) => {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return { error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};
