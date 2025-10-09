import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Users, GraduationCap, LogOut, BookHeart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getUserRole, signOut, UserRole } from "@/lib/supabase";
import { toast } from "sonner";
import { AuthGuard } from "@/components/AuthGuard";

const HomePage = () => {
  const navigate = useNavigate();
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

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate('/auth');
  };

  const canAccess = (section: UserRole) => {
    return userRole === section;
  };

  const sections = [
    {
      id: 'guidance' as UserRole,
      title: "Guidance",
      description: "Manage guidance activities and schedules",
      icon: Shield,
      route: "/guidance",
      gradient: "from-primary to-primary/80"
    },
    {
      id: 'pastoral' as UserRole,
      title: "Pastoral",
      description: "Manage pastoral activities and sacraments",
      icon: Users,
      route: "/pastoral",
      gradient: "from-secondary to-secondary/80"
    },
    {
      id: 'student_records' as UserRole,
      title: "Student Records",
      description: "Manage student information",
      icon: GraduationCap,
      route: "/student-records",
      gradient: "from-accent to-accent/80"
    }
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                <BookHeart className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Boscocare
                </h1>
                <p className="text-xs text-muted-foreground">Pastoral & Guidance System</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </header>

        <main className="container mx-auto px-4 py-12">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold">Welcome to Boscocare</h2>
              <p className="text-muted-foreground">
                Select your section to continue
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {sections.map((section) => {
                const isAccessible = canAccess(section.id);
                const Icon = section.icon;

                return (
                  <Card
                    key={section.id}
                    className={`relative overflow-hidden transition-all duration-300 ${
                      isAccessible 
                        ? 'shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] cursor-pointer' 
                        : 'opacity-50 cursor-not-allowed'
                    }`}
                    onClick={() => isAccessible && navigate(section.route)}
                  >
                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${section.gradient}`} />
                    <CardHeader className="pb-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${section.gradient} flex items-center justify-center mb-3`}>
                        <Icon className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <CardTitle className="text-xl">{section.title}</CardTitle>
                      <CardDescription>{section.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isAccessible ? (
                        <Button className="w-full" variant="outline">
                          Access {section.title}
                        </Button>
                      ) : (
                        <div className="text-sm text-muted-foreground text-center py-2">
                          Access Restricted
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
};

export default HomePage;
