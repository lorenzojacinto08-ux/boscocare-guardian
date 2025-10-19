import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getUserRole, UserRole } from "@/lib/supabase";

export const useUserRole = () => {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const role = await getUserRole(user.id);
        setUserRole(role);
      }
      setLoading(false);
    };

    fetchUserRole();
  }, []);

  const isAdmin = userRole === 'admin';
  const isStudent = userRole === 'student';

  return { userRole, loading, isAdmin, isStudent };
};
