import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import LandingPage from "@/pages/LandingPage";
import OnboardingFlow from "@/pages/OnboardingFlow";
import LoginPage from "@/pages/LoginPage";
import FeaturesPage from "@/pages/FeaturesPage";
import SecurityPage from "@/pages/SecurityPage";
import PricingPage from "@/pages/PricingPage";
import WhitepaperPage from "@/pages/WhitepaperPage";
import AdminPortal from "@/pages/AdminPortal";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/features" component={FeaturesPage} />
      <Route path="/security" component={SecurityPage} />
      <Route path="/pricing" component={PricingPage} />
      <Route path="/whitepaper" component={WhitepaperPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/onboarding" component={OnboardingFlow} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/admin" component={AdminPortal} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
