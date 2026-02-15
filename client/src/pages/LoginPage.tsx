import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Link, useLocation } from "wouter";
import { Loader2, ArrowRight } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import hubLogo from "@assets/HUB_Logo_(1)_1770930042707.png";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const login = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/auth/login", { email, password, rememberMe });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      setLocation("/dashboard");
    },
    onError: (err: Error) => setError(err.message),
  });

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-foreground flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute -top-[200px] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-red-500/8 rounded-full blur-[150px] pointer-events-none" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md p-8"
      >
        <div className="flex items-center gap-2 justify-center mb-12">
          <img src={hubLogo} alt="hub." className="h-60 w-auto" />
        </div>

        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-display font-bold text-white">Welcome back</h2>
            <p className="text-white/40">Sign in to your unified workspace.</p>
          </div>

          {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-white/60">Email Address</Label>
              <Input 
                placeholder="alex@company.com" 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                className="bg-white/5 border-white/10 h-12 focus:border-[#EF4444]/50 focus:ring-[#EF4444]/20" 
                data-testid="input-login-email"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white/60">Password</Label>
              <Input 
                placeholder="••••••••" 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                className="bg-white/5 border-white/10 h-12 focus:border-[#EF4444]/50 focus:ring-[#EF4444]/20" 
                data-testid="input-login-password"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="remember-me"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked === true)}
              className="border-white/20 data-[state=checked]:bg-[#EF4444] data-[state=checked]:border-[#EF4444]"
              data-testid="checkbox-remember-me"
            />
            <Label htmlFor="remember-me" className="text-white/50 text-sm cursor-pointer select-none">
              Remember me
            </Label>
          </div>

          <Button 
            onClick={() => login.mutate()} 
            disabled={login.isPending} 
            className="w-full h-12 text-lg bg-[#EF4444] hover:bg-[#DC2626] text-white"
            data-testid="button-login"
          >
            {login.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Sign In <ArrowRight className="ml-2 h-4 w-4" /></>}
          </Button>

          <p className="text-center text-sm text-white/40">
            Don't have an account?{" "}
            <Link href="/onboarding" className="text-[#EF4444] hover:text-[#EF4444]/80 font-medium transition-colors">
              Get Started
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
