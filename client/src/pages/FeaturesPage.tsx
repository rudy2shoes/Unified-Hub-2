import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, Globe, KeyRound, Landmark, Monitor, Chrome, GripVertical, ShieldCheck, ArrowRight } from "lucide-react";
import hubLogo from "@assets/HUB_Logo_(1)_1770930042707.png";

const features = [
  { icon: LayoutDashboard, title: "Unified Dashboard", description: "Customizable drag-and-drop widgets, quick launch, favorites — everything in one view." },
  { icon: Globe, title: "Embedded App Browser", description: "Apps load directly inside HUB. No tab switching, no context lost." },
  { icon: KeyRound, title: "Persistent Logins", description: "Log in once, stay logged in across sessions. No more password fatigue." },
  { icon: Landmark, title: "Banking Integration", description: "Access banks securely with the desktop app's persistent sessions." },
  { icon: Monitor, title: "Desktop App", description: "Full embedded experience on Mac, Windows, and Linux." },
  { icon: Chrome, title: "Chromebook Ready", description: "Works perfectly in Chrome browser — no download needed." },
  { icon: GripVertical, title: "Drag & Drop Widgets", description: "Customize your dashboard layout to fit your workflow." },
  { icon: ShieldCheck, title: "Military-Grade Security", description: "Encrypted sessions, secure cookies, and rate limiting built in." },
];

export default function FeaturesPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-foreground font-sans selection:bg-primary/30 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[800px] bg-gradient-to-b from-red-500/5 via-transparent to-transparent pointer-events-none" />
      <div className="absolute -top-[300px] left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-red-500/8 rounded-full blur-[150px] pointer-events-none opacity-40" />

      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Link href="/">
            <img src={hubLogo} alt="hub." className="h-56 w-auto" />
          </Link>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/40">
          <Link href="/features" className="hover:text-white transition-colors text-white">Features</Link>
          <Link href="/security" className="hover:text-white transition-colors">Security</Link>
          <a href="/#download" className="hover:text-white transition-colors">Download</a>
          <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/5" data-testid="button-login">Log In</Button>
          </Link>
          <Link href="/onboarding">
            <Button className="bg-[#EF4444] hover:bg-[#DC2626] text-white font-medium px-6" data-testid="button-get-started">Get Started</Button>
          </Link>
        </div>
      </nav>

      <main className="relative z-10 pt-20 pb-32 px-4">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-display font-bold text-white tracking-tight leading-[1.1] mb-6">
              Everything You Need<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-white/40">in One Place.</span>
            </h1>
            <p className="text-xl text-white/40 max-w-2xl mx-auto leading-relaxed">
              HUB brings all your apps, tools, and workflows into a single unified workspace.
              No more tab chaos — just one powerful dashboard.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-16 text-left"
          >
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
                className="p-6 rounded-3xl bg-white/[0.03] border border-white/5 backdrop-blur-sm hover:bg-white/[0.06] transition-colors group"
                data-testid={`card-feature-${i}`}
              >
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-4 text-white/60 group-hover:scale-110 transition-transform duration-300 group-hover:bg-[#EF4444]/10 group-hover:text-[#EF4444]">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-display font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-white/40 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="pt-24 text-center"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
              Ready to Simplify Your Workflow?
            </h2>
            <p className="text-lg text-white/40 max-w-xl mx-auto mb-8">
              Start your free trial today — no credit card required.
            </p>
            <Button
              size="lg"
              className="h-14 px-8 text-lg bg-[#EF4444] hover:bg-[#DC2626] text-white shadow-lg shadow-red-500/20 rounded-2xl"
              onClick={() => setLocation("/onboarding")}
              data-testid="button-start-trial"
            >
              Start Your Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
