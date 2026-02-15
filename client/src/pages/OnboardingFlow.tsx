import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, CreditCard, Loader2, Lock, ArrowRight } from "lucide-react";
import { AppIcon } from "@/components/AppIcon";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import hubLogo from "@assets/HUB_Logo_(1)_1770930042707.png";

const STEPS = ["Account", "Payment", "Connect", "Complete"];

export default function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState(0);
  const [, setLocation] = useLocation();

  const searchParams = new URLSearchParams(window.location.search);
  const stepParam = searchParams.get("step");
  if (stepParam === "connect" && currentStep < 2) {
    setTimeout(() => setCurrentStep(2), 0);
  }

  const nextStep = () => setCurrentStep((p) => Math.min(p + 1, STEPS.length - 1));
  const prevStep = () => setCurrentStep((p) => Math.max(p - 1, 0));

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-foreground flex flex-col md:flex-row">
      <div className="w-full md:w-1/3 bg-[#080808] border-r border-white/5 p-8 flex flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[500px] bg-red-500/5 blur-[100px] pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-12">
            <img src={hubLogo} alt="hub." className="h-52 w-auto" />
          </div>

          <div className="space-y-8">
            {STEPS.map((step, index) => (
              <div key={step} className="flex items-center gap-4">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border transition-all duration-300",
                  index < currentStep 
                    ? "bg-[#EF4444] border-[#EF4444] text-white" 
                    : index === currentStep
                    ? "bg-white/10 border-[#EF4444] text-white shadow-[0_0_15px_-3px_rgba(239,68,68,0.5)]"
                    : "bg-transparent border-white/10 text-white/30"
                )}>
                  {index < currentStep ? <Check className="w-4 h-4" /> : index + 1}
                </div>
                <div className="flex flex-col">
                  <span className={cn(
                    "text-sm font-medium transition-colors",
                    index <= currentStep ? "text-white" : "text-white/30"
                  )}>
                    {step}
                  </span>
                  {index === currentStep && (
                    <motion.span 
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-white/40"
                    >
                      {getStepDescription(index)}
                    </motion.span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 mt-auto">
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 backdrop-blur-sm">
            <div className="flex gap-1 mb-2">
              {[1,2,3,4,5].map(i => <div key={i} className="w-4 h-4 text-[#EF4444] fill-[#EF4444]">★</div>)}
            </div>
            <p className="text-sm text-white/70 italic">"HUB has completely transformed how I run my agency. I save 2 hours every day not switching between tabs."</p>
            <div className="mt-3 flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-white/10" />
              <span className="text-xs text-white/30 font-medium">Sarah M., Agency Owner</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-[#0d0d0d] relative flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentStep === 0 && <AccountStep onNext={nextStep} />}
              {currentStep === 1 && <PaymentStep onNext={nextStep} onBack={prevStep} />}
              {currentStep === 2 && <ConnectStep onNext={nextStep} onBack={prevStep} />}
              {currentStep === 3 && <CompleteStep onFinish={() => setLocation("/dashboard")} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function getStepDescription(step: number) {
  switch(step) {
    case 0: return "Create your secure ID";
    case 1: return "Secure checkout";
    case 2: return "Link your digital life";
    case 3: return "You're all set";
    default: return "";
  }
}

function AccountStep({ onNext }: { onNext: () => void }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const queryClient = useQueryClient();

  const signup = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/auth/signup", { firstName, lastName, email, password });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      onNext();
    },
    onError: (err: Error) => setError(err.message),
  });

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-display font-bold text-white">Create your account</h2>
        <p className="text-white/40">Start your journey with HUB.</p>
      </div>

      {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-white/60">First Name</Label>
            <Input placeholder="Alex" value={firstName} onChange={e => setFirstName(e.target.value)} className="bg-white/5 border-white/10 h-12 focus:border-[#EF4444]/50" data-testid="input-first-name" />
          </div>
          <div className="space-y-2">
            <Label className="text-white/60">Last Name</Label>
            <Input placeholder="Morgan" value={lastName} onChange={e => setLastName(e.target.value)} className="bg-white/5 border-white/10 h-12 focus:border-[#EF4444]/50" data-testid="input-last-name" />
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-white/60">Email Address</Label>
          <Input placeholder="alex@company.com" type="email" value={email} onChange={e => setEmail(e.target.value)} className="bg-white/5 border-white/10 h-12 focus:border-[#EF4444]/50" data-testid="input-email" />
        </div>
        <div className="space-y-2">
          <Label className="text-white/60">Password</Label>
          <Input placeholder="••••••••" type="password" value={password} onChange={e => setPassword(e.target.value)} className="bg-white/5 border-white/10 h-12 focus:border-[#EF4444]/50" data-testid="input-password" />
        </div>
      </div>

      <Button onClick={() => signup.mutate()} disabled={signup.isPending} className="w-full h-12 text-lg bg-[#EF4444] hover:bg-[#DC2626] text-white" data-testid="button-signup">
        {signup.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Continue <ArrowRight className="ml-2 h-4 w-4" /></>}
      </Button>
    </div>
  );
}

function PaymentStep({ onNext, onBack }: { onNext: () => void, onBack: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const handleCheckout = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiRequest("POST", "/api/checkout", { priceId: "price_1T03RWEK2cBzBt3EHweTe3Et" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      setError(err.message);
      toast({ title: "Payment Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-display font-bold text-white">Start your free trial</h2>
        <p className="text-white/40">Try HUB Pro free for 7 days. Cancel anytime.</p>
      </div>

      <div className="p-6 rounded-2xl bg-gradient-to-br from-[#EF4444]/10 to-red-900/5 border border-[#EF4444]/20 relative overflow-hidden">
        <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-semibold tracking-wide">
          7-DAY FREE TRIAL
        </div>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-white">HUB Pro Plan</h3>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-white">$0</span>
              <span className="text-sm text-white/40">for 7 days</span>
            </div>
            <p className="text-xs text-white/40 mt-1">Then $25.00/month after trial ends</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-[#EF4444]/20 flex items-center justify-center text-[#EF4444]">
            <Check className="h-5 w-5" />
          </div>
        </div>

        <div className="space-y-3 text-sm text-white/70">
          <div className="flex items-center gap-2"><Check className="h-4 w-4 text-[#EF4444]" /> Unlimited app connections</div>
          <div className="flex items-center gap-2"><Check className="h-4 w-4 text-[#EF4444]" /> Bank-grade security encryption</div>
          <div className="flex items-center gap-2"><Check className="h-4 w-4 text-[#EF4444]" /> Priority 24/7 support</div>
          <div className="flex items-center gap-2"><Check className="h-4 w-4 text-[#EF4444]" /> Works on any device or OS</div>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-full bg-[#EF4444]/10 flex items-center justify-center text-[#EF4444] flex-shrink-0 mt-0.5">
            <CreditCard className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">No charge today</p>
            <p className="text-xs text-white/40 mt-0.5">We'll ask for your card to start the trial. You won't be billed until the 7-day trial is over.</p>
          </div>
        </div>
      </div>

      {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}

      <div className="flex items-center gap-2 text-xs text-white/30 justify-center">
        <Lock className="h-3 w-3" />
        Powered by Stripe. Cancel anytime during your trial.
      </div>

      <div className="flex gap-4">
        <Button variant="outline" onClick={onBack} className="h-12 w-full border-white/10 hover:bg-white/5 text-white/70" data-testid="button-back">Back</Button>
        <Button onClick={handleCheckout} disabled={loading} className="h-12 w-full bg-[#EF4444] hover:bg-[#DC2626] text-white" data-testid="button-pay">
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Start Free Trial <ArrowRight className="ml-2 h-4 w-4" /></>}
        </Button>
      </div>
    </div>
  );
}

function ConnectStep({ onNext, onBack }: { onNext: () => void, onBack: () => void }) {
  const [connecting, setConnecting] = useState<string | null>(null);
  const [connected, setConnected] = useState<string[]>([]);
  const queryClient = useQueryClient();

  const addApp = useMutation({
    mutationFn: async (app: { name: string; category: string; color: string }) => {
      const res = await apiRequest("POST", "/api/apps", { ...app, isFavorite: true });
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/apps"] }),
  });

  const toggleConnect = (app: { name: string; category: string; color: string }) => {
    if (connected.includes(app.name)) {
      setConnected(connected.filter(c => c !== app.name));
    } else {
      setConnecting(app.name);
      addApp.mutate(app, {
        onSuccess: () => {
          setConnecting(null);
          setConnected([...connected, app.name]);
        },
        onError: () => setConnecting(null),
      });
    }
  };

  const apps = [
    { name: "GoHighLevel", category: "CRM", color: "#3B82F6", url: "https://app.gohighlevel.com" },
    { name: "QuickBooks", category: "Finance", color: "#22C55E", url: "https://app.qbo.intuit.com" },
    { name: "Gmail", category: "Email", color: "#EF4444", url: "https://mail.google.com" },
    { name: "Stripe", category: "Payments", color: "#6366F1", url: "https://dashboard.stripe.com" },
    { name: "Facebook Ads", category: "Marketing", color: "#1877F2", url: "https://business.facebook.com" },
    { name: "Slack", category: "Communication", color: "#EAB308", url: "https://app.slack.com" },
    { name: "WordPress", category: "CMS", color: "#21759B", url: "https://wordpress.com" },
    { name: "Notion", category: "Productivity", color: "#000000", url: "https://www.notion.so" },
    { name: "Google Ads", category: "Marketing", color: "#4285F4", url: "https://ads.google.com" },
    { name: "Chase Bank", category: "Banking", color: "#117ACA", url: "https://secure.chase.com" },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-display font-bold text-white">Connect your apps</h2>
        <p className="text-white/40">Select the services you use daily. You can add more later.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
        {apps.map((app) => (
          <div 
            key={app.name}
            onClick={() => toggleConnect(app)}
            className={cn(
              "p-4 rounded-xl border cursor-pointer transition-all flex items-center gap-3",
              connected.includes(app.name) 
                ? "bg-[#EF4444]/10 border-[#EF4444]/50" 
                : "bg-white/[0.03] border-white/10 hover:bg-white/[0.06] hover:border-white/20"
            )}
            data-testid={`card-app-${app.name.toLowerCase().replace(/\s/g, '-')}`}
          >
            <AppIcon name={app.name} url={app.url} color={app.color} size={40} className="shadow-lg" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-white text-sm truncate">{app.name}</p>
              <p className="text-xs text-white/30">{app.category}</p>
            </div>
            {connecting === app.name ? (
              <Loader2 className="h-4 w-4 animate-spin text-[#EF4444] flex-shrink-0" />
            ) : connected.includes(app.name) && (
              <Check className="h-4 w-4 text-[#EF4444] flex-shrink-0" />
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-4 mt-8">
        <Button variant="outline" onClick={onBack} className="h-12 w-full border-white/10 hover:bg-white/5 text-white/70">Back</Button>
        <Button onClick={onNext} className="h-12 w-full bg-[#EF4444] hover:bg-[#DC2626] text-white" data-testid="button-finish">
          Finish Setup ({connected.length})
        </Button>
      </div>
    </div>
  );
}

function CompleteStep({ onFinish }: { onFinish: () => void }) {
  return (
    <div className="text-center space-y-8 py-8">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.5 }}
        className="w-24 h-24 rounded-full bg-[#EF4444]/20 text-[#EF4444] flex items-center justify-center mx-auto mb-6 ring-4 ring-[#EF4444]/10"
      >
        <Check className="h-12 w-12" />
      </motion.div>
      
      <div className="space-y-2">
        <h2 className="text-4xl font-display font-bold text-white">You're all set!</h2>
        <p className="text-lg text-white/40 max-w-sm mx-auto">
          Your HUB dashboard has been personalized and your apps are ready to use.
        </p>
      </div>

      <div className="pt-8">
        <Button onClick={onFinish} size="lg" className="h-14 px-12 text-lg bg-white text-black hover:bg-white/90 rounded-full shadow-[0_0_30px_-5px_rgba(255,255,255,0.3)]" data-testid="button-enter-dashboard">
          Enter Dashboard
        </Button>
      </div>
    </div>
  );
}
