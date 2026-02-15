import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { Check, Shield, Zap, Globe, ArrowRight, Monitor, Apple, Download, Chrome } from "lucide-react";
import hubLogo from "@assets/HUB_Logo_(1)_1770930042707.png";

export default function LandingPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-foreground font-sans selection:bg-primary/30 relative overflow-hidden">
      <div className="absolute inset-0 w-full h-[900px] pointer-events-none">
        <img src="/hero-bg.png" alt="" className="w-full h-full object-cover" style={{ objectPosition: "center center" }} />
        <div className="absolute inset-0 bg-[#0d0d0d]/55" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d0d0d]/20 via-[#0d0d0d]/50 to-[#0d0d0d]" />
      </div>
      <div className="absolute -top-[300px] left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-red-500/8 rounded-full blur-[150px] pointer-events-none opacity-30" />
      
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <img src={hubLogo} alt="hub." className="h-56 w-auto" />
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/40">
          <Link href="/features" className="hover:text-white transition-colors">Features</Link>
          <Link href="/security" className="hover:text-white transition-colors">Security</Link>
          <a href="#download" className="hover:text-white transition-colors">Download</a>
          <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/5">Log In</Button>
          </Link>
          <Link href="/onboarding">
            <Button className="bg-[#EF4444] hover:bg-[#DC2626] text-white font-medium px-6">Get Started</Button>
          </Link>
        </div>
      </nav>

      <main className="relative z-10 -mt-2 pb-32 px-4">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-10"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-[#EF4444]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#EF4444] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#EF4444]"></span>
              </span>
              The Future of Work is Unified
            </span>
            <h1 className="text-5xl md:text-7xl font-display font-bold text-white tracking-tight leading-[1.3] mb-0">
              One Login.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-white/40">Infinite Possibilities.</span>
            </h1>
            <p className="text-xl text-white/40 max-w-2xl mx-auto leading-relaxed pt-2">
              Connect your entire digital life into a single, powerful operating system. 
              Access GoHighLevel, QuickBooks, Banks, and all your daily tools from one sleek dashboard.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Button 
              size="lg" 
              className="h-14 px-8 text-lg bg-[#EF4444] hover:bg-[#DC2626] text-white shadow-lg shadow-red-500/20 rounded-2xl w-full sm:w-auto"
              onClick={() => setLocation("/onboarding")}
            >
              Start Your Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="h-14 px-8 text-lg border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-2xl w-full sm:w-auto backdrop-blur-sm"
            >
              Watch Demo
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            id="features"
            className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-24 text-left"
          >
            <FeatureCard 
              icon={Shield}
              title="Bank-Grade Security"
              description="Your data is encrypted with military-grade protocols. We never store your passwords."
            />
            <FeatureCard 
              icon={Zap}
              title="Instant Access"
              description="Log in once, be everywhere. No more password fatigue or 2FA hurdles."
            />
            <FeatureCard 
              icon={Globe}
              title="Universal Compatibility"
              description="Works seamlessly with any web app, CRM, or financial institution."
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="pt-24"
            id="download"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
                Get HUB for Your Device
              </h2>
              <p className="text-lg text-white/40 max-w-2xl mx-auto">
                Download the desktop app for the ultimate experience — every app loads fully inside HUB with persistent logins, including banking.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <DownloadCard
                icon={Apple}
                platform="Mac"
                format=".dmg"
                description="macOS 11 or later"
                available
                downloadUrl="https://github.com/rudy2shoes/Unified-Hub-2/releases/latest"
              />
              <DownloadCard
                icon={Monitor}
                platform="Windows"
                format=".exe"
                description="Windows 10 or later"
                available
                downloadUrl="https://github.com/rudy2shoes/Unified-Hub-2/releases/latest"
              />
              <DownloadCard
                icon={Download}
                platform="Linux"
                format=".AppImage"
                description="Ubuntu, Fedora, Debian"
                available
                downloadUrl="https://github.com/rudy2shoes/Unified-Hub-2/releases/latest"
              />
              <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-sm flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-2xl bg-[#EF4444]/10 flex items-center justify-center mb-4 text-[#EF4444]">
                  <Chrome className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-display font-semibold text-white mb-1">Chromebook</h3>
                <p className="text-sm text-white/30 mb-4 leading-relaxed">
                  No download needed — HUB runs directly in your Chrome browser with full functionality.
                </p>
                <Button
                  size="sm"
                  className="bg-[#EF4444] hover:bg-[#DC2626] text-white font-medium w-full rounded-xl"
                  onClick={() => setLocation("/onboarding")}
                  data-testid="button-chromebook-start"
                >
                  Use Web Version
                </Button>
              </div>
            </div>

            <div className="mt-8 p-5 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
              <p className="text-sm text-white/40 leading-relaxed max-w-3xl mx-auto">
                <span className="text-white/60 font-medium">Why download the desktop app?</span>{" "}
                The desktop version embeds every app directly inside HUB — including banks, QuickBooks, and other secure sites — with fully persistent logins.
                Your sessions stay saved even after closing HUB. Chromebook and web users get the same great dashboard with apps opening in connected browser windows.
              </p>
            </div>
          </motion.div>
        </div>
      </main>

      <footer className="relative z-10 border-t border-white/5 py-12 px-4">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-6">
          <img src={hubLogo} alt="hub." className="h-20 w-auto" />
          <div className="flex items-center gap-6 text-sm text-white/30">
            <Link href="/features" className="hover:text-white/60 transition-colors" data-testid="link-footer-features">Features</Link>
            <Link href="/security" className="hover:text-white/60 transition-colors" data-testid="link-footer-security">Security</Link>
            <Link href="/pricing" className="hover:text-white/60 transition-colors" data-testid="link-footer-pricing">Pricing</Link>
            <Link href="/whitepaper" className="hover:text-white/60 transition-colors" data-testid="link-footer-whitepaper">Whitepaper</Link>
          </div>
          <a
            href="https://www.facebook.com/profile.php?id=61588016796545"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-white/30 hover:text-white/60 transition-colors"
            data-testid="link-facebook"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            <span className="text-sm">Follow us on Facebook</span>
          </a>
          <p className="text-sm text-white/30">2026 HUB. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function DownloadCard({ icon: Icon, platform, format, description, available, downloadUrl }: { icon: any, platform: string, format: string, description: string, available: boolean, downloadUrl?: string }) {
  return (
    <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-sm hover:bg-white/[0.06] transition-colors group flex flex-col items-center text-center">
      <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-4 text-white/60 group-hover:scale-110 transition-transform duration-300 group-hover:bg-[#EF4444]/10 group-hover:text-[#EF4444]">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="text-lg font-display font-semibold text-white mb-1">{platform}</h3>
      <p className="text-xs text-white/30 mb-1">{description}</p>
      <span className="text-xs text-white/20 mb-4">{format}</span>
      <a
        href={downloadUrl || "#"}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button
          size="sm"
          variant="outline"
          className="border-white/10 bg-white/5 hover:bg-white/10 text-white font-medium w-full rounded-xl"
          data-testid={`button-download-${platform.toLowerCase()}`}
        >
          <Download className="h-3.5 w-3.5 mr-2" />
          Download for {platform}
        </Button>
      </a>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/5 backdrop-blur-sm hover:bg-white/[0.06] transition-colors group">
      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-4 text-white/60 group-hover:scale-110 transition-transform duration-300 group-hover:bg-[#EF4444]/10 group-hover:text-[#EF4444]">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-xl font-display font-semibold text-white mb-2">{title}</h3>
      <p className="text-white/40 leading-relaxed">{description}</p>
    </div>
  );
}
