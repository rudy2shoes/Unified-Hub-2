import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { Check, ArrowRight, ChevronDown } from "lucide-react";
import { useState } from "react";
import hubLogo from "@assets/HUB_Logo_(1)_1770930042707.png";

const planFeatures = [
  "Unlimited connected apps",
  "Customizable dashboard widgets",
  "Persistent login sessions",
  "Desktop app for Mac, Windows & Linux",
  "Chromebook web access",
  "Bank-grade security",
  "Priority support",
  "All future updates included",
];

const faqs = [
  {
    question: "What happens after my free trial?",
    answer: "After your 7-day free trial ends, you'll be charged $25/month to continue using HUB Pro. You'll receive a reminder before your trial expires, and you can cancel anytime before being charged.",
  },
  {
    question: "Can I cancel anytime?",
    answer: "Absolutely. There are no contracts or commitments. You can cancel your subscription at any time from your account settings, and you'll retain access until the end of your billing period.",
  },
  {
    question: "Do you store my app passwords?",
    answer: "No. HUB never stores your third-party passwords. We use secure session-based authentication with encrypted cookies. Your credentials are handled directly by each app's own login system.",
  },
  {
    question: "What apps can I connect?",
    answer: "HUB works with virtually any web application — from CRMs like GoHighLevel to accounting tools like QuickBooks, banking portals, email clients, project management tools, and more.",
  },
  {
    question: "Is there a desktop app?",
    answer: "Yes! HUB is available as a desktop app for Mac, Windows, and Linux. The desktop version provides the full embedded experience with persistent logins, including for banking sites. Chromebook users can use the full-featured web version.",
  },
];

function FAQItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
      className="border border-white/5 rounded-2xl bg-white/[0.03] backdrop-blur-sm overflow-hidden"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-6 text-left"
        data-testid={`faq-toggle-${index}`}
      >
        <span className="text-lg font-display font-semibold text-white">{question}</span>
        <ChevronDown className={`h-5 w-5 text-white/40 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-6 pb-6">
          <p className="text-white/40 leading-relaxed">{answer}</p>
        </div>
      )}
    </motion.div>
  );
}

export default function PricingPage() {
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
          <Link href="/features" className="hover:text-white transition-colors">Features</Link>
          <Link href="/security" className="hover:text-white transition-colors">Security</Link>
          <a href="/#download" className="hover:text-white transition-colors">Download</a>
          <Link href="/pricing" className="hover:text-white transition-colors text-white">Pricing</Link>
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
              Simple, Transparent<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-white/40">Pricing.</span>
            </h1>
            <p className="text-xl text-white/40 max-w-2xl mx-auto leading-relaxed">
              One plan. Everything included.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex justify-center pt-12"
          >
            <div className="w-full max-w-lg p-8 rounded-3xl bg-white/[0.03] border-2 border-[#EF4444]/40 backdrop-blur-sm relative shadow-[0_0_60px_-15px_rgba(239,68,68,0.3)]" data-testid="card-pricing">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EF4444]/10 border border-[#EF4444]/20 text-xs font-medium text-[#EF4444] mb-6">
                Start with a 7-day free trial
              </span>

              <h2 className="text-2xl font-display font-bold text-white mb-2">HUB Pro</h2>

              <div className="flex items-baseline justify-center gap-1 mb-8">
                <span className="text-6xl font-display font-bold text-white">$25</span>
                <span className="text-lg text-white/40">/month</span>
              </div>

              <ul className="space-y-4 text-left mb-8">
                {planFeatures.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3" data-testid={`pricing-feature-${i}`}>
                    <div className="w-5 h-5 rounded-full bg-[#EF4444]/10 flex items-center justify-center flex-shrink-0">
                      <Check className="h-3 w-3 text-[#EF4444]" />
                    </div>
                    <span className="text-white/70">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                size="lg"
                className="w-full h-14 text-lg bg-[#EF4444] hover:bg-[#DC2626] text-white shadow-lg shadow-red-500/20 rounded-2xl font-medium"
                onClick={() => setLocation("/onboarding")}
                data-testid="button-start-trial"
              >
                Start Your 7-Day Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              <p className="text-sm text-white/30 mt-4">
                No credit card required to start. Cancel anytime.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="pt-24 text-left max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-8 text-center">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <FAQItem key={i} question={faq.question} answer={faq.answer} index={i} />
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
