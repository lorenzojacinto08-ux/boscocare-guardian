import { AuthGuard } from "@/components/AuthGuard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar, History } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Guidance = () => {
  const navigate = useNavigate();

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <header className="border-b bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <Button variant="ghost" onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </header>

        <main className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Guidance Management
              </h1>
              <p className="text-muted-foreground">
                Manage guidance activities and schedules
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card 
                className="shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all cursor-pointer"
                onClick={() => navigate('/guidance/activity-schedule')}
              >
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mb-3">
                    <Calendar className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <CardTitle>Activity Schedule</CardTitle>
                  <CardDescription>
                    Create and manage upcoming guidance activities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">
                    Manage Schedules
                  </Button>
                </CardContent>
              </Card>

              <Card 
                className="shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all cursor-pointer"
                onClick={() => navigate('/guidance/schedule-history')}
              >
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary to-secondary/80 flex items-center justify-center mb-3">
                    <History className="w-6 h-6 text-secondary-foreground" />
                  </div>
                  <CardTitle>Schedule History</CardTitle>
                  <CardDescription>
                    View and manage completed activities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="secondary">
                    View History
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
};

export default Guidance;
