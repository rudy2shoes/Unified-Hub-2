import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { Check, ArrowRight, ChevronDown, Sparkles, Bot, Cpu } from "lucide-react";
import { useState } from "react";
import hubLogo from "@assets/HUB_Logo_(1)_1770930042707.png";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "/forever",
    badge: null,
    description: "Get started with the basics",
    cta: "Get Started Free",
    ctaVariant: "outline" as const,
    highlight: false,
    icon: Sparkles,
    features: [
      "Up to 10 connected apps",
      "Basic dashboard widgets",
      "Web app access",
      "Community support",
    ],
  },
  {
    name: "HUB Pro",
    price: "$25",
    period: "/month",
    badge: "7-day free trial",
    description: "For professionals who need more",
    cta: "Start Free Trial",
    ctaVariant: "default" as const,
    highlight: true,
    icon: Bot,
    features: [
      "Unlimited connected apps",
      "AI chat assistant (bring your own key)",
      "Customizable dashboard widgets",
      "Desktop app (Mac, Windows, Linux)",
      "Agency Mode for client workspaces",
      "Focus Mode with custom backgrounds",
      "Priority support",
      "All future updates included",
    ],
  },
  {
    name: "HUB Agent",
    price: "$99",
    period: "/month",
    badge: "Coming Soon",
    description: "Your 24/7 AI-powered workforce",
    cta: "Join Waitlist",
    ctaVariant: "outline" as const,
    highlight: false,
    icon: Cpu,
    features: [
      "Everything in Pro",
      "Dedicated AI agent (runs 24/7)",
      "Autonomous task execution",
      "App data integrations (QuickBooks, etc.)",
      "Auto-generate reports & insights",
      "Email & calendar management",
      "Workflow automation across apps",
      "Custom agent training",
    ],
  },
];

const faqs = [
  {
    question: "What happens after my free trial?",
    answer: "After your 7-day free trial of HUB Pro ends, you'll be charged $25/month to continue. You'll receive a reminder before your trial expires, and you can cancel anytime before being charged. You can also downgrade to the Free plan.",
  },
  {
    question: "Can I cancel anytime?",
    answer: "Absolutely. There are no contracts or commitments. You can cancel your subscription at any time from your account settings, and you'll retain access until the end of your billing period.",
  },
  {
    question: "What's the difference between the AI chat and the AI agent?",
    answer: "The AI chat assistant (Pro plan) is a conversational helper — you ask it questions and it responds. The AI agent (Agent plan) is a fully autonomous system that runs 24/7, can control your apps, automate workflows, pull data from QuickBooks, manage emails, and execute tasks without you asking.",
  },
  {
    question: "Do you store my app passwords?",
    answer: "No. HUB never stores your third-party passwords. We use secure session-based authentication with encrypted cookies. Your credentials are handled directly by each app's own login system.",
  },
  {
    question: "What apps can I connect?",
    answer: "HUB works with virtually any web application — from CRMs like GoHighLevel to accounting tools like QuickBooks, banking portals, email clients, project management tools, and more. Over 267 apps are pre-loaded in our catalog.",
  },
  {
    question: "Is there a desktop app?",
    answer: "Yes! HUB is available as a desktop app for Mac, Windows, and Linux (Pro and Agent plans). The desktop version provides the full embedded experience with persistent logins, including for banking sites.",
  },
  {
    question: "When will HUB Agent be available?",
    answer: "HUB Agent is currently in development. Join the waitlist to be notified when it launches and get early access pricing.",
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
        <ChevronDown className={`h-5 w-5 text-white/40 transition-transform duration-300 flex-shrink-0 ml-4 ${open ? "rotate-180" : ""}`} />
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
        <div className="max-w-6xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-display font-bold text-white tracking-tight leading-[1.1] mb-6">
              Choose Your<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-white/40">Power Level.</span>
            </h1>
            <p className="text-xl text-white/40 max-w-2xl mx-auto leading-relaxed">
              From free forever to a full AI-powered workforce. Scale as you grow.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 + i * 0.15 }}
                className={`relative p-8 rounded-3xl border backdrop-blur-sm flex flex-col ${
                  plan.highlight
                    ? "bg-white/[0.05] border-[#EF4444]/40 shadow-[0_0_60px_-15px_rgba(239,68,68,0.3)]"
                    : "bg-white/[0.03] border-white/5 hover:bg-white/[0.05] transition-colors"
                }`}
                data-testid={`card-pricing-${plan.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1 rounded-full bg-[#EF4444] text-white text-xs font-semibold shadow-lg shadow-red-500/30">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${
                  plan.highlight ? "bg-[#EF4444]/15 text-[#EF4444]" : "bg-white/5 text-white/60"
                }`}>
                  <plan.icon className="h-6 w-6" />
                </div>

                <h2 className="text-2xl font-display font-bold text-white mb-1">{plan.name}</h2>
                <p className="text-sm text-white/40 mb-4">{plan.description}</p>

                {plan.badge && (
                  <span className={`inline-flex self-start items-center px-3 py-1 rounded-full text-xs font-medium mb-4 ${
                    plan.badge === "Coming Soon"
                      ? "bg-white/5 border border-white/10 text-white/50"
                      : "bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444]"
                  }`}>
                    {plan.badge}
                  </span>
                )}

                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-5xl font-display font-bold text-white">{plan.price}</span>
                  <span className="text-lg text-white/40">{plan.period}</span>
                </div>

                <ul className="space-y-3 text-left mb-8 flex-1">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-3" data-testid={`pricing-feature-${plan.name.toLowerCase()}-${j}`}>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        plan.highlight ? "bg-[#EF4444]/10" : "bg-white/5"
                      }`}>
                        <Check className={`h-3 w-3 ${plan.highlight ? "text-[#EF4444]" : "text-white/50"}`} />
                      </div>
                      <span className="text-white/70 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  size="lg"
                  className={`w-full h-13 text-base rounded-2xl font-medium ${
                    plan.highlight
                      ? "bg-[#EF4444] hover:bg-[#DC2626] text-white shadow-lg shadow-red-500/20"
                      : plan.badge === "Coming Soon"
                        ? "border-white/10 bg-white/5 hover:bg-white/10 text-white"
                        : "border-white/10 bg-white/5 hover:bg-white/10 text-white"
                  }`}
                  variant={plan.ctaVariant}
                  onClick={() => {
                    if (plan.badge === "Coming Soon") return;
                    setLocation("/onboarding");
                  }}
                  data-testid={`button-plan-${plan.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {plan.cta}
                  {plan.badge !== "Coming Soon" && <ArrowRight className="ml-2 h-5 w-5" />}
                </Button>

                {plan.name === "Free" && (
                  <p className="text-xs text-white/30 mt-3">No credit card required</p>
                )}
                {plan.highlight && (
                  <p className="text-xs text-white/30 mt-3">Cancel anytime. No commitment.</p>
                )}
              </motion.div>
            ))}
          </div>

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

      <footer className="relative z-10 border-t border-white/5 py-12 px-4">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-6">
          <img src={hubLogo} alt="hub." className="h-20 w-auto" />
          <div className="flex items-center gap-6 text-sm text-white/30">
            <Link href="/features" className="hover:text-white/60 transition-colors">Features</Link>
            <Link href="/security" className="hover:text-white/60 transition-colors">Security</Link>
            <Link href="/pricing" className="hover:text-white/60 transition-colors">Pricing</Link>
          </div>
          <p className="text-sm text-white/30">2026 HUB. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
