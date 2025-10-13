import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import React, { createContext, useContext, useEffect, useState } from "react";
// No UI toasts from context: callers should show notifications to avoid duplicates

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userProfile: any | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    userData?: any
  ) => Promise<{ error: any; message?: string }>;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error: any; message?: string }>;
  signOut: () => Promise<{ error?: any; message?: string }>;
  refreshProfile: () => Promise<any | null>;
  getUserRole: (userId?: string) => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*, student_profile(*)")
        .eq("auth_user_id", userId)
        .single();
      if (error) {
        console.error("Error fetching user profile:", error);
        return null;
      }
      // If a dev role override is set, apply it on top of the fetched data.
      try {
        const override =
          typeof window !== "undefined"
            ? sessionStorage.getItem("devRoleOverride")
            : null;
        if (override) {
          return { ...data, role: override };
        }
      } catch (err) {
        // ignore sessionStorage errors
      }
      return data;
    } catch (error) {
      console.error("Error in fetchUserProfile:", error);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const profile = await fetchUserProfile(user.id);
      setUserProfile(profile);
      return profile;
    }
    return null;
  };

  /**
   * Return the user's role string, or null if not found.
   * Behavior:
   * - If a devOverride is present in sessionStorage (`devRoleOverride`), it is returned immediately.
   * - First attempts to read from `user_roles` table by `user_id`.
   * - Falls back to `users` table (matching `auth_user_id`) and returns the `role` column if present.
   */
  const getUserRole = async (userIdParam?: string): Promise<string | null> => {
    try {
      const id = userIdParam ?? user?.id;
      if (!id) return null;

      // Dev override (useful for local testing)
      try {
        const override =
          typeof window !== "undefined"
            ? sessionStorage.getItem("devRoleOverride")
            : null;
        if (override) return override;
      } catch (err) {
        console.error("getUserRole sessionStorage error:", err);
      }

      const { data: userRow, error: userError } = await supabase
        .from("users")
        .select("role")
        .eq("auth_user_id", id)
        .single();
      if (userError && userError.code !== "PGRST116") {
        console.error("Error querying users for role:", userError);
      }
      if (userRow && (userRow as any).role) {
        return (userRow as any).role as string;
      }

      return null;
    } catch (err) {
      console.error("getUserRole error:", err);
      return null;
    }
  };

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setTimeout(async () => {
          const profile = await fetchUserProfile(session.user.id);
          setUserProfile(profile);
        }, 0);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id).then((profile) => {
          setUserProfile(profile);
        });
      }
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, userData?: any) => {
    try {
      console.log("[AuthContext] signUp called with:", {
        email,
        password,
        userData,
      });

      const redirectUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}/login`
          : undefined;
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          // No userData (name) sent
        },
      });
      if (error) {
        return { error, message: error.message || "Registration failed." };
      } else {
        // Check if a user profile with this email already exists
        const { data: existingUser, error: selectError } = await supabase
          .from("users")
          .select("id")
          .eq("email", email)
          .single();
        if (selectError && selectError.code !== "PGRST116") {
          // ignore no rows found
          return {
            error: selectError,
            message: selectError.message || "Error checking existing profile.",
          };
        }
        // success: let the caller notify
        return {
          error: null,
          message:
            "Registration successful. Please check your email to verify your account.",
        };
      }
    } catch (error: any) {
      return { error, message: error.message || "Registration error." };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        return { error, message: error.message || "Login failed." };
      }

      // At this point credentials are valid (session created).
      // Fetch the user's id from the session / data returned by Supabase.
      const sessionUserId =
        data?.user?.id ?? data?.user?.id ?? user?.id ?? null;

      // If we don't have an id from the response, try to read from auth.getUser()
      let resolvedUserId = sessionUserId;
      if (!resolvedUserId) {
        try {
          const { data: meData } = await supabase.auth.getUser();
          resolvedUserId = meData?.user?.id ?? null;
        } catch (e) {
          // ignore, will handle below
        }
      }

      // If still no id, return success (can't check role)
      if (!resolvedUserId) return { error: null, message: "Logged in" };

      const role = await getUserRole(resolvedUserId);
      const allowed = [
        "student",
        "guidance",
        "pastoral",
        "admin",
        "superadmin",
      ];
      if (!role || !allowed.includes(role)) {
        // unauthorized role: clear session and return error
        try {
          await supabase.auth.signOut();
        } catch (e) {
          // ignore signOut errors
        }
        return {
          error: new Error("unauthorized_role"),
          message:
            "Your account role is not authorized to sign in to this application.",
        };
      }

      return { error: null, message: "Logged in" };
    } catch (error: any) {
      return { error, message: error.message || "Login error." };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      return { message: "Signed out" };
    } catch (error: any) {
      return { error, message: error.message || "Logout error." };
    }
  };

  const value = {
    user,
    session,
    userProfile,
    loading,
    signUp,
    signIn,
    signOut,
    refreshProfile,
    getUserRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
