import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AuthProvider } from "@/components/AuthProvider";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import TasteOnboarding from "./pages/TasteOnboarding";
import DiscomfortDashboard from "./pages/DiscomfortDashboard";
import CulturalCurriculum from "./pages/CulturalCurriculum";
import GrowthDashboard from "./pages/GrowthDashboard";
import ChallengeZone from "./pages/ChallengeZone";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <div className="dark min-h-screen">
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/onboarding" element={<TasteOnboarding />} />
                <Route path="/dashboard" element={<DiscomfortDashboard />} />
                <Route path="/curriculum" element={<CulturalCurriculum />} />
                <Route path="/growth" element={<GrowthDashboard />} />
                <Route path="/challenges" element={<ChallengeZone />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AnimatePresence>
          </BrowserRouter>
        </div>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
