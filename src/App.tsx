import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Auth from "./pages/Auth";
import HomePage from "./pages/HomePage";
import Guidance from "./pages/Guidance";
import Pastoral from "./pages/Pastoral";
import StudentRecords from "./pages/StudentRecords";
import GuidanceActivitySchedule from "./pages/GuidanceActivitySchedule";
import GuidanceScheduleHistory from "./pages/GuidanceScheduleHistory";
import PastoralActivities from "./pages/PastoralActivities";
import SacramentDocuments from "./pages/SacramentDocuments";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./contexts/AuthContext";

const queryClient = new QueryClient();

const App = () => (
  <AuthProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/guidance" element={<Guidance />} />
            <Route
              path="/guidance/activity-schedule"
              element={<GuidanceActivitySchedule />}
            />
            <Route
              path="/guidance/schedule-history"
              element={<GuidanceScheduleHistory />}
            />
            <Route path="/pastoral" element={<Pastoral />} />
            <Route
              path="/pastoral/activities"
              element={<PastoralActivities />}
            />
            <Route
              path="/pastoral/sacraments"
              element={<SacramentDocuments />}
            />
            <Route path="/student-records" element={<StudentRecords />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </AuthProvider>
);

export default App;
