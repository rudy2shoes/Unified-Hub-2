import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import hubLogo from "@assets/HUB_Logo_(1)_1770930042707.png";

export default function WhitepaperPage() {
  return (
    <div className="min-h-screen bg-[#0d0d0d] text-foreground font-sans selection:bg-primary/30 relative overflow-x-hidden">
      <div className="absolute top-0 left-0 w-full h-[800px] bg-gradient-to-b from-red-500/5 via-transparent to-transparent pointer-events-none" />
      <div className="absolute -top-[300px] left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-red-500/8 rounded-full blur-[150px] pointer-events-none opacity-40" />

      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Link href="/">
            <img src={hubLogo} alt="hub." className="h-10 w-auto" data-testid="link-home-logo" />
          </Link>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/40">
          <Link href="/features" className="hover:text-white transition-colors" data-testid="link-features">Features</Link>
          <Link href="/security" className="hover:text-white transition-colors" data-testid="link-security">Security</Link>
          <Link href="/pricing" className="hover:text-white transition-colors" data-testid="link-pricing">Pricing</Link>
          <Link href="/whitepaper" className="hover:text-white transition-colors text-white" data-testid="link-whitepaper">Whitepaper</Link>
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

      <main className="relative z-10 pt-12 pb-32 px-4">
        <article className="max-w-4xl mx-auto">
          <header className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-display font-bold text-white tracking-tight leading-[1.1] mb-4">
              HUB | Unified Workspace
            </h1>
            <p className="text-2xl text-white/60 font-display font-semibold mb-2">Whitepaper</p>
            <p className="text-lg text-[#EF4444] font-medium">One login. All your apps. Always connected.</p>
          </header>

          <nav className="mb-16 p-8 rounded-2xl bg-white/[0.03] border border-white/5">
            <h2 className="text-xl font-display font-bold text-white mb-6">Table of Contents</h2>
            <ol className="space-y-3 list-decimal list-inside text-white/60">
              <li><a href="#executive-summary" className="hover:text-[#EF4444] transition-colors" data-testid="link-toc-1">Executive Summary</a></li>
              <li><a href="#the-problem" className="hover:text-[#EF4444] transition-colors" data-testid="link-toc-2">The Problem</a></li>
              <li><a href="#market-opportunity" className="hover:text-[#EF4444] transition-colors" data-testid="link-toc-3">Market Opportunity</a></li>
              <li><a href="#the-solution" className="hover:text-[#EF4444] transition-colors" data-testid="link-toc-4">The Solution — HUB</a></li>
              <li><a href="#how-it-works" className="hover:text-[#EF4444] transition-colors" data-testid="link-toc-5">How It Works (Web vs Desktop)</a></li>
              <li><a href="#key-features" className="hover:text-[#EF4444] transition-colors" data-testid="link-toc-6">Key Features</a></li>
              <li><a href="#security-privacy" className="hover:text-[#EF4444] transition-colors" data-testid="link-toc-7">Security & Privacy</a></li>
              <li><a href="#business-model" className="hover:text-[#EF4444] transition-colors" data-testid="link-toc-8">Business Model & Pricing</a></li>
              <li><a href="#competitive-analysis" className="hover:text-[#EF4444] transition-colors" data-testid="link-toc-9">Competitive Analysis</a></li>
              <li><a href="#technology-architecture" className="hover:text-[#EF4444] transition-colors" data-testid="link-toc-10">Technology Architecture</a></li>
              <li><a href="#product-roadmap" className="hover:text-[#EF4444] transition-colors" data-testid="link-toc-11">Product Roadmap</a></li>
              <li><a href="#conclusion" className="hover:text-[#EF4444] transition-colors" data-testid="link-toc-12">Conclusion / Call to Action</a></li>
            </ol>
          </nav>

          <div className="space-y-16">
            {/* Section 1: Executive Summary */}
            <section id="executive-summary">
              <h2 className="text-3xl font-display font-bold text-white mb-6 pb-3 border-b border-white/10">Executive Summary</h2>
              <div className="space-y-4 text-white/60 leading-relaxed">
                <p>The modern business professional is drowning in software. From CRM platforms and accounting tools to email clients, advertising dashboards, project management systems, and communication apps, the average knowledge worker juggles between 5 and 15 or more applications every single day. Each app requires its own login, its own tab, and its own mental context. The result is a fragmented workflow that erodes productivity, increases cognitive load, and wastes hours of valuable time every week.</p>
                <p><strong className="text-white">HUB | Unified Workspace</strong> solves this problem by providing a single, elegant dashboard where users log in once and access all of their business applications from one place. Apps stay logged in with persistent sessions, eliminating the constant cycle of re-authentication and tab switching that plagues today's professionals.</p>
                <p>HUB is available as both a web application and a premium desktop application for Mac, Windows, and Linux. The desktop experience takes things further by fully embedding each application inside HUB with isolated, persistent session partitions — meaning logins survive across restarts and every app feels like a native part of the workspace.</p>
                <p>With a subscription price of <strong className="text-white">$25 per month</strong> (including a 7-day free trial), HUB targets small business owners, marketing agencies, freelancers, and remote teams who need a smarter, faster way to work across their entire software stack.</p>
              </div>
            </section>

            {/* Section 2: The Problem */}
            <section id="the-problem">
              <h2 className="text-3xl font-display font-bold text-white mb-6 pb-3 border-b border-white/10">The Problem</h2>

              <h3 className="text-xl font-display font-semibold text-white mb-4">The SaaS Sprawl Crisis</h3>
              <div className="space-y-4 text-white/60 leading-relaxed mb-8">
                <p>Over the past decade, the explosion of cloud-based SaaS tools has transformed how businesses operate. There is now a specialized application for virtually every business function — CRM, invoicing, email marketing, social media scheduling, team communication, file storage, analytics, and more. While each tool individually delivers value, the collective burden of managing them has created a new and significant problem: <strong className="text-white">SaaS tool sprawl</strong>.</p>
                <p>Consider the daily reality for a typical small business owner or marketing professional:</p>
                <ul className="list-disc list-inside space-y-2 pl-4">
                  <li><strong className="text-white">5 to 15+ applications</strong> are used on a daily basis.</li>
                  <li>Each application has its own login credentials, interface, and notification system.</li>
                  <li>Workers switch between applications an estimated <strong className="text-white">1,100 times per day</strong>, according to research from Harvard Business Review and workplace analytics firms.</li>
                  <li>The average company now uses <strong className="text-white">over 110 SaaS applications</strong>, a number that has grown more than 10x in the past decade (Productiv, BetterCloud).</li>
                  <li>Context switching between applications costs an average of <strong className="text-white">23 minutes</strong> to regain full focus after each interruption (University of California, Irvine research).</li>
                </ul>
              </div>

              <h3 className="text-xl font-display font-semibold text-white mb-4">The Hidden Costs</h3>
              <div className="space-y-4 text-white/60 leading-relaxed">
                <p>The costs of this fragmented workflow go far beyond frustration:</p>
                <ul className="list-disc list-inside space-y-2 pl-4">
                  <li><strong className="text-white">Lost Productivity</strong>: Employees spend up to 30% of their workday simply navigating between tools, logging in, and searching for information across platforms.</li>
                  <li><strong className="text-white">Security Risks</strong>: Password fatigue leads to weak passwords, password reuse, and increased vulnerability to credential-based attacks.</li>
                  <li><strong className="text-white">Onboarding Friction</strong>: New team members must learn and configure dozens of separate tools, extending ramp-up time significantly.</li>
                  <li><strong className="text-white">Subscription Waste</strong>: Without visibility into tool usage, businesses often pay for redundant or underutilized software.</li>
                </ul>
                <p>The fundamental problem is clear: the tools designed to make us more productive have, in aggregate, made us less productive. The missing piece is not another app — it is a unified layer that brings all of these apps together.</p>
              </div>
            </section>

            {/* Section 3: Market Opportunity */}
            <section id="market-opportunity">
              <h2 className="text-3xl font-display font-bold text-white mb-6 pb-3 border-b border-white/10">Market Opportunity</h2>

              <h3 className="text-xl font-display font-semibold text-white mb-4">A Large and Growing Market</h3>
              <div className="space-y-4 text-white/60 leading-relaxed mb-8">
                <p>The global SaaS market is projected to exceed <strong className="text-white">$900 billion by 2030</strong>, with businesses of all sizes continuing to adopt specialized cloud tools at an accelerating pace. As the number of SaaS applications per organization grows, so does the demand for solutions that help manage, organize, and streamline access to these tools.</p>
                <p>Key market indicators:</p>
                <ul className="list-disc list-inside space-y-2 pl-4">
                  <li><strong className="text-white">Average SaaS apps per company</strong>: 110+ (up from fewer than 10 a decade ago).</li>
                  <li><strong className="text-white">App switching frequency</strong>: Knowledge workers toggle between apps and websites approximately <strong className="text-white">1,100 times per day</strong> (Asana Anatomy of Work Index, 2023).</li>
                  <li><strong className="text-white">Productivity loss</strong>: An estimated <strong className="text-white">$28,000 per worker per year</strong> is lost to inefficient multitasking and context switching (IDC research).</li>
                  <li><strong className="text-white">Remote work acceleration</strong>: The shift to remote and hybrid work has amplified reliance on digital tools, making unified access more critical than ever.</li>
                </ul>
              </div>

              <h3 className="text-xl font-display font-semibold text-white mb-4">Target Market</h3>
              <div className="space-y-4 text-white/60 leading-relaxed">
                <p>HUB is purpose-built for:</p>
                <ul className="list-disc list-inside space-y-2 pl-4">
                  <li><strong className="text-white">Small Business Owners</strong> who wear multiple hats and need fast access to CRM, accounting, email, and marketing tools without juggling dozens of browser tabs.</li>
                  <li><strong className="text-white">Marketing Agencies</strong> that manage client campaigns across advertising platforms, analytics dashboards, social media schedulers, and communication tools.</li>
                  <li><strong className="text-white">Freelancers and Solopreneurs</strong> who operate lean businesses and cannot afford the time lost to tool fragmentation.</li>
                  <li><strong className="text-white">Remote Teams</strong> that depend on digital tools for every aspect of their work and need a centralized command center to stay organized and connected.</li>
                </ul>
                <p>These segments share a common trait: they rely heavily on multiple SaaS applications and are acutely impacted by the inefficiency of switching between them.</p>
              </div>
            </section>

            {/* Section 4: The Solution — HUB */}
            <section id="the-solution">
              <h2 className="text-3xl font-display font-bold text-white mb-6 pb-3 border-b border-white/10">The Solution — HUB</h2>
              <div className="space-y-4 text-white/60 leading-relaxed mb-8">
                <p>HUB | Unified Workspace is a centralized platform where users log in once and gain instant access to all of their business applications from a single, beautifully designed dashboard.</p>
              </div>

              <h3 className="text-xl font-display font-semibold text-white mb-4">Core Value Proposition</h3>
              <ul className="list-disc list-inside space-y-2 pl-4 text-white/60 leading-relaxed mb-8">
                <li><strong className="text-white">One Login</strong>: Authenticate once into HUB and access every connected application without re-entering credentials.</li>
                <li><strong className="text-white">All Your Apps</strong>: Connect any web-based application — CRM, accounting, email, payments, marketing, communication, project management, and more.</li>
                <li><strong className="text-white">Always Connected</strong>: Persistent sessions keep applications logged in across sessions and restarts, eliminating the daily friction of re-authentication.</li>
              </ul>

              <h3 className="text-xl font-display font-semibold text-white mb-4">How HUB Is Different</h3>
              <div className="space-y-4 text-white/60 leading-relaxed">
                <p>Unlike browser bookmarks or simple app launchers, HUB provides:</p>
                <ol className="list-decimal list-inside space-y-2 pl-4">
                  <li><strong className="text-white">A customizable dashboard</strong> with drag-and-drop widgets that surface the information and shortcuts you use most.</li>
                  <li><strong className="text-white">Persistent login sessions</strong> so you never have to log into the same app twice.</li>
                  <li><strong className="text-white">A desktop application</strong> that fully embeds your apps inside HUB with isolated session environments, delivering a native-like experience.</li>
                  <li><strong className="text-white">Organized app management</strong> with categories, favorites, and priority placement so your most important tools are always one click away.</li>
                </ol>
                <p>HUB does not replace your existing tools. It unifies them into a single, efficient workspace.</p>
              </div>
            </section>

            {/* Section 5: How It Works */}
            <section id="how-it-works">
              <h2 className="text-3xl font-display font-bold text-white mb-6 pb-3 border-b border-white/10">How It Works (Web vs Desktop)</h2>
              <div className="space-y-4 text-white/60 leading-relaxed mb-8">
                <p>HUB offers two complementary experiences — a web application and a desktop application — each optimized for different use cases and levels of integration.</p>
              </div>

              <h3 className="text-xl font-display font-semibold text-white mb-4">HUB Web Application</h3>
              <div className="space-y-4 text-white/60 leading-relaxed mb-8">
                <p>The web version of HUB serves as the entry point and organizational hub for all users.</p>
                <ul className="list-disc list-inside space-y-2 pl-4">
                  <li><strong className="text-white">Dashboard</strong>: Upon login, users are presented with a customizable widget dashboard featuring Quick Launch shortcuts, Favorites, Recent Activity, Plan Status, a real-time clock, and weather information.</li>
                  <li><strong className="text-white">App Launcher</strong>: Users add their business applications to HUB by providing the app name, URL, and category. Apps appear in an organized grid with category filtering and favorite marking.</li>
                  <li><strong className="text-white">App Access</strong>: When a user launches an app from HUB, it opens in a dedicated popup window. This approach is deliberate — modern browsers enforce strict security restrictions (third-party cookie blocking, X-Frame-Options headers) that prevent most web applications from loading reliably inside iframes. Popup windows bypass these restrictions entirely, giving users full, unrestricted access to their applications.</li>
                  <li><strong className="text-white">Platform</strong>: Works in any modern web browser. No installation required.</li>
                </ul>
                <p>The web app is ideal for quick access, light usage, and as an onboarding experience for new users.</p>
              </div>

              <h3 className="text-xl font-display font-semibold text-white mb-4">HUB Desktop Application (Premium)</h3>
              <div className="space-y-4 text-white/60 leading-relaxed">
                <p>The desktop version of HUB is the premium experience, built with Electron and available for <strong className="text-white">Mac, Windows, and Linux</strong>.</p>
                <ul className="list-disc list-inside space-y-2 pl-4">
                  <li><strong className="text-white">Embedded Apps</strong>: Unlike the web version, the desktop app uses BrowserView technology to load each application fully embedded inside the HUB window. There are no popups — apps feel like native tabs within your workspace.</li>
                  <li><strong className="text-white">Persistent Session Partitions</strong>: Each connected application is assigned its own isolated session partition (a dedicated cookie jar). This means login credentials, cookies, and session data are stored independently per app and persist across application restarts. You log into each app once, and it stays logged in indefinitely.</li>
                  <li><strong className="text-white">Isolated Environments</strong>: Because each app runs in its own session partition, there is no cross-contamination of cookies or session data between applications. This provides both security and reliability — one app's session cannot interfere with another's.</li>
                  <li><strong className="text-white">Native Experience</strong>: The desktop app provides native window management, system tray integration, and the performance benefits of a dedicated application.</li>
                </ul>
                <p>The desktop app is designed for power users who spend their entire workday in HUB and want the most seamless, integrated experience possible.</p>
              </div>
            </section>

            {/* Section 6: Key Features */}
            <section id="key-features">
              <h2 className="text-3xl font-display font-bold text-white mb-6 pb-3 border-b border-white/10">Key Features</h2>

              <h3 className="text-xl font-display font-semibold text-white mb-4">Customizable Widget Dashboard</h3>
              <div className="space-y-4 text-white/60 leading-relaxed mb-8">
                <p>HUB's dashboard is not a static landing page — it is a fully customizable workspace. Users can add, remove, and reorder widgets using intuitive drag-and-drop controls:</p>
                <ul className="list-disc list-inside space-y-2 pl-4">
                  <li><strong className="text-white">Quick Launch</strong>: One-click access to your most frequently used applications.</li>
                  <li><strong className="text-white">Favorites</strong>: Priority placement for starred applications, always visible at the top of your workspace.</li>
                  <li><strong className="text-white">Recent Activity</strong>: A feed of your latest app interactions for quick context and resumption.</li>
                  <li><strong className="text-white">Plan Status</strong>: Real-time visibility into your subscription plan, usage, and billing cycle.</li>
                  <li><strong className="text-white">Clock</strong>: A live clock displayed prominently in the header bar for time-aware productivity.</li>
                  <li><strong className="text-white">Weather</strong>: Current weather conditions in the header, providing at-a-glance environmental context.</li>
                </ul>
                <p>Widget layouts are saved per user and persist across sessions, ensuring your workspace is always configured exactly the way you prefer.</p>
              </div>

              <h3 className="text-xl font-display font-semibold text-white mb-4">Organized App Management</h3>
              <div className="space-y-4 text-white/60 leading-relaxed mb-8">
                <p>Every connected application in HUB is organized by category for fast navigation:</p>
                <ul className="list-disc list-inside space-y-2 pl-4">
                  <li>CRM (e.g., GoHighLevel, HubSpot, Salesforce)</li>
                  <li>Finance & Accounting (e.g., QuickBooks, FreshBooks, Wave)</li>
                  <li>Email (e.g., Gmail, Outlook, Yahoo Mail)</li>
                  <li>Payments (e.g., Stripe, PayPal, Square)</li>
                  <li>Marketing (e.g., Mailchimp, Google Ads, Facebook Ads Manager)</li>
                  <li>Communication (e.g., Slack, Zoom, Microsoft Teams)</li>
                  <li>Productivity (e.g., Notion, Trello, Asana, Google Drive)</li>
                  <li>And more, with custom categories available.</li>
                </ul>
                <p>Users can mark applications as favorites for priority placement, and apps are sorted by user-defined order for a fully personalized experience.</p>
              </div>

              <h3 className="text-xl font-display font-semibold text-white mb-4">Theming and Visual Design</h3>
              <div className="space-y-4 text-white/60 leading-relaxed mb-8">
                <p>HUB ships with a refined dark theme featuring a bold red accent color, designed for extended use and visual comfort. A light theme toggle is available for users who prefer a brighter interface. The design language is modern, clean, and professional — built to feel like a premium product from the first interaction.</p>
              </div>

              <h3 className="text-xl font-display font-semibold text-white mb-4">Authentication and Session Management</h3>
              <ul className="list-disc list-inside space-y-2 pl-4 text-white/60 leading-relaxed">
                <li><strong className="text-white">Secure Login</strong>: Session-based authentication with credentials stored securely in PostgreSQL.</li>
                <li><strong className="text-white">Remember Me</strong>: Users can opt into extended 30-day sessions for convenience, or use standard 24-hour sessions for shared or sensitive environments.</li>
                <li><strong className="text-white">Persistent App Sessions</strong>: In the desktop version, each application's session persists independently, surviving restarts and updates.</li>
              </ul>
            </section>

            {/* Section 7: Security & Privacy */}
            <section id="security-privacy">
              <h2 className="text-3xl font-display font-bold text-white mb-6 pb-3 border-b border-white/10">Security & Privacy</h2>
              <div className="space-y-4 text-white/60 leading-relaxed mb-8">
                <p>Security is foundational to HUB's architecture. As a platform that serves as the gateway to a user's entire suite of business applications, HUB is built with multiple layers of protection:</p>
              </div>

              <h3 className="text-xl font-display font-semibold text-white mb-4">Authentication Security</h3>
              <ul className="list-disc list-inside space-y-2 pl-4 text-white/60 leading-relaxed mb-8">
                <li><strong className="text-white">Session-Based Authentication</strong>: User sessions are managed server-side and stored in PostgreSQL, providing full control over session lifecycle, revocation, and auditing. This approach is more secure than client-side token storage (JWT) for this use case.</li>
                <li><strong className="text-white">Scrypt Password Hashing</strong>: All user passwords are hashed using the scrypt key derivation function, which is resistant to brute-force and GPU-based attacks.</li>
                <li><strong className="text-white">Rate-Limited Auth Endpoints</strong>: Login and signup endpoints are rate-limited to 20 requests per 15-minute window per IP address, mitigating credential stuffing and brute-force attacks.</li>
              </ul>

              <h3 className="text-xl font-display font-semibold text-white mb-4">Transport and Header Security</h3>
              <ul className="list-disc list-inside space-y-2 pl-4 text-white/60 leading-relaxed mb-8">
                <li><strong className="text-white">Helmet Security Headers</strong>: HUB uses the helmet middleware to set comprehensive HTTP security headers, including Content-Security-Policy, X-Content-Type-Options, X-Frame-Options, and Strict-Transport-Security.</li>
                <li><strong className="text-white">Secure Cookies</strong>: Session cookies are configured with the <code className="text-[#EF4444] bg-white/5 px-1.5 py-0.5 rounded">httpOnly</code> flag (preventing JavaScript access), the <code className="text-[#EF4444] bg-white/5 px-1.5 py-0.5 rounded">secure</code> flag (requiring HTTPS in production), and <code className="text-[#EF4444] bg-white/5 px-1.5 py-0.5 rounded">sameSite</code> restrictions to prevent CSRF attacks.</li>
              </ul>

              <h3 className="text-xl font-display font-semibold text-white mb-4">Desktop App Isolation</h3>
              <ul className="list-disc list-inside space-y-2 pl-4 text-white/60 leading-relaxed mb-8">
                <li><strong className="text-white">Isolated Session Partitions</strong>: Each connected application in the desktop version runs in its own BrowserView with a dedicated session partition. This means that cookies, local storage, and session data are completely isolated between applications. One compromised or misconfigured app cannot access another app's session data.</li>
                <li><strong className="text-white">No Cross-Contamination</strong>: The partition-based architecture ensures that authentication tokens, cookies, and cached data are sandboxed per application, providing defense-in-depth against session hijacking and data leakage.</li>
              </ul>

              <h3 className="text-xl font-display font-semibold text-white mb-4">Data Privacy</h3>
              <ul className="list-disc list-inside space-y-2 pl-4 text-white/60 leading-relaxed">
                <li>HUB does not store, access, or transmit the credentials of connected third-party applications. Users authenticate directly with each service through standard browser-based login flows.</li>
                <li>User data (account information, connected app configurations, widget layouts) is stored in a PostgreSQL database with encrypted connections.</li>
                <li>No user data is shared with third parties beyond what is necessary for billing (Stripe).</li>
              </ul>
            </section>

            {/* Section 8: Business Model & Pricing */}
            <section id="business-model">
              <h2 className="text-3xl font-display font-bold text-white mb-6 pb-3 border-b border-white/10">Business Model & Pricing</h2>

              <h3 className="text-xl font-display font-semibold text-white mb-4">Pricing Structure</h3>
              <div className="space-y-4 text-white/60 leading-relaxed mb-8">
                <p>HUB uses a straightforward subscription model designed to be accessible for small businesses and individual professionals:</p>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-white/10 rounded-lg overflow-hidden">
                    <thead>
                      <tr className="bg-white/5">
                        <th className="border border-white/10 px-6 py-3 text-left text-white font-display font-semibold">Plan</th>
                        <th className="border border-white/10 px-6 py-3 text-left text-white font-display font-semibold">Price</th>
                        <th className="border border-white/10 px-6 py-3 text-left text-white font-display font-semibold">Includes</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-white/10 px-6 py-3"><strong className="text-white">HUB Pro</strong></td>
                        <td className="border border-white/10 px-6 py-3"><strong className="text-white">$25/month</strong></td>
                        <td className="border border-white/10 px-6 py-3">Full access to web and desktop applications, unlimited connected apps, customizable dashboard, persistent sessions, all future updates</td>
                      </tr>
                      <tr className="bg-white/[0.02]">
                        <td className="border border-white/10 px-6 py-3"><strong className="text-white">Free Trial</strong></td>
                        <td className="border border-white/10 px-6 py-3"><strong className="text-white">7 days</strong></td>
                        <td className="border border-white/10 px-6 py-3">Full-featured trial of HUB Pro with no commitment</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <h3 className="text-xl font-display font-semibold text-white mb-4">Revenue Model</h3>
              <ul className="list-disc list-inside space-y-2 pl-4 text-white/60 leading-relaxed mb-8">
                <li><strong className="text-white">Freemium Onboarding</strong>: The web application can serve as a free or freemium tier, allowing users to experience HUB's dashboard, app organization, and popup-based app launching at no cost. This lowers the barrier to entry and drives organic adoption.</li>
                <li><strong className="text-white">Premium Desktop Tier</strong>: The desktop application — with its embedded app experience, persistent session partitions, and native performance — represents the paid premium tier at $25/month. Users who rely on HUB daily will naturally upgrade to the desktop experience for its superior workflow integration.</li>
                <li><strong className="text-white">Stripe Billing</strong>: All subscriptions are processed through Stripe, providing secure payment handling, automated billing cycles, and a seamless checkout experience. The 7-day free trial allows users to experience the full product before being charged.</li>
              </ul>

              <h3 className="text-xl font-display font-semibold text-white mb-4">Unit Economics</h3>
              <div className="space-y-4 text-white/60 leading-relaxed">
                <p>The $25/month price point is strategically positioned:</p>
                <ul className="list-disc list-inside space-y-2 pl-4">
                  <li><strong className="text-white">Below enterprise workspace tools</strong> (which typically charge $15-25 per user per month, scaling rapidly for teams).</li>
                  <li><strong className="text-white">Competitive with similar app consolidation tools</strong> (Shift charges $149/year for premium, Wavebox charges $84/year).</li>
                  <li><strong className="text-white">High perceived value</strong>: Users consolidating 10+ apps into a single workspace easily justify $25/month through time savings alone. Even recouping 30 minutes per day of lost productivity represents thousands of dollars in annual value.</li>
                </ul>
              </div>
            </section>

            {/* Section 9: Competitive Analysis */}
            <section id="competitive-analysis">
              <h2 className="text-3xl font-display font-bold text-white mb-6 pb-3 border-b border-white/10">Competitive Analysis</h2>
              <div className="space-y-4 text-white/60 leading-relaxed mb-8">
                <p>Several products in the market address aspects of the SaaS tool sprawl problem. Here is how HUB compares to the most notable alternatives:</p>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-white/10 rounded-lg overflow-hidden text-sm">
                    <thead>
                      <tr className="bg-white/5">
                        <th className="border border-white/10 px-4 py-3 text-left text-white font-display font-semibold">Feature</th>
                        <th className="border border-white/10 px-4 py-3 text-left text-[#EF4444] font-display font-semibold">HUB</th>
                        <th className="border border-white/10 px-4 py-3 text-left text-white font-display font-semibold">Shift</th>
                        <th className="border border-white/10 px-4 py-3 text-left text-white font-display font-semibold">Station</th>
                        <th className="border border-white/10 px-4 py-3 text-left text-white font-display font-semibold">Rambox</th>
                        <th className="border border-white/10 px-4 py-3 text-left text-white font-display font-semibold">Wavebox</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-white/10 px-4 py-3">Unified app dashboard</td>
                        <td className="border border-white/10 px-4 py-3 text-[#EF4444]">Yes</td>
                        <td className="border border-white/10 px-4 py-3">Yes</td>
                        <td className="border border-white/10 px-4 py-3">Yes (discontinued)</td>
                        <td className="border border-white/10 px-4 py-3">Yes</td>
                        <td className="border border-white/10 px-4 py-3">Yes</td>
                      </tr>
                      <tr className="bg-white/[0.02]">
                        <td className="border border-white/10 px-4 py-3">Customizable widget grid</td>
                        <td className="border border-white/10 px-4 py-3 text-[#EF4444]">Yes</td>
                        <td className="border border-white/10 px-4 py-3">No</td>
                        <td className="border border-white/10 px-4 py-3">No</td>
                        <td className="border border-white/10 px-4 py-3">No</td>
                        <td className="border border-white/10 px-4 py-3">No</td>
                      </tr>
                      <tr>
                        <td className="border border-white/10 px-4 py-3">Persistent embedded sessions (desktop)</td>
                        <td className="border border-white/10 px-4 py-3 text-[#EF4444]">Yes</td>
                        <td className="border border-white/10 px-4 py-3">Partial</td>
                        <td className="border border-white/10 px-4 py-3">N/A</td>
                        <td className="border border-white/10 px-4 py-3">Yes</td>
                        <td className="border border-white/10 px-4 py-3">Yes</td>
                      </tr>
                      <tr className="bg-white/[0.02]">
                        <td className="border border-white/10 px-4 py-3">Modern, polished UI</td>
                        <td className="border border-white/10 px-4 py-3 text-[#EF4444]">Yes</td>
                        <td className="border border-white/10 px-4 py-3">Moderate</td>
                        <td className="border border-white/10 px-4 py-3">N/A</td>
                        <td className="border border-white/10 px-4 py-3">Basic</td>
                        <td className="border border-white/10 px-4 py-3">Moderate</td>
                      </tr>
                      <tr>
                        <td className="border border-white/10 px-4 py-3">Web app access</td>
                        <td className="border border-white/10 px-4 py-3 text-[#EF4444]">Yes</td>
                        <td className="border border-white/10 px-4 py-3">No</td>
                        <td className="border border-white/10 px-4 py-3">N/A</td>
                        <td className="border border-white/10 px-4 py-3">No</td>
                        <td className="border border-white/10 px-4 py-3">Yes</td>
                      </tr>
                      <tr className="bg-white/[0.02]">
                        <td className="border border-white/10 px-4 py-3">Drag-and-drop customization</td>
                        <td className="border border-white/10 px-4 py-3 text-[#EF4444]">Yes</td>
                        <td className="border border-white/10 px-4 py-3">No</td>
                        <td className="border border-white/10 px-4 py-3">No</td>
                        <td className="border border-white/10 px-4 py-3">No</td>
                        <td className="border border-white/10 px-4 py-3">No</td>
                      </tr>
                      <tr>
                        <td className="border border-white/10 px-4 py-3">App categorization and favorites</td>
                        <td className="border border-white/10 px-4 py-3 text-[#EF4444]">Yes</td>
                        <td className="border border-white/10 px-4 py-3">Basic</td>
                        <td className="border border-white/10 px-4 py-3">N/A</td>
                        <td className="border border-white/10 px-4 py-3">Basic</td>
                        <td className="border border-white/10 px-4 py-3">Basic</td>
                      </tr>
                      <tr className="bg-white/[0.02]">
                        <td className="border border-white/10 px-4 py-3">Price</td>
                        <td className="border border-white/10 px-4 py-3 text-[#EF4444] font-semibold">$25/mo</td>
                        <td className="border border-white/10 px-4 py-3">$149/yr+</td>
                        <td className="border border-white/10 px-4 py-3">Free (dead)</td>
                        <td className="border border-white/10 px-4 py-3">$84/yr+</td>
                        <td className="border border-white/10 px-4 py-3">$84/yr+</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <h3 className="text-xl font-display font-semibold text-white mb-4">Key Differentiators</h3>
              <ol className="list-decimal list-inside space-y-4 pl-4 text-white/60 leading-relaxed">
                <li><strong className="text-white">Modern Dashboard Experience</strong>: HUB is not just an app container — it is a workspace. The customizable widget dashboard with drag-and-drop layout, quick launch shortcuts, and contextual information (clock, weather, plan status) provides a command center experience that competitors lack.</li>
                <li><strong className="text-white">Web + Desktop Strategy</strong>: Most competitors are desktop-only applications. HUB's web application provides an accessible entry point that requires no installation, lowering the barrier to trial and adoption. Users can start on the web and upgrade to desktop when they are ready.</li>
                <li><strong className="text-white">Affordable Pricing</strong>: At $25/month, HUB is competitively priced for the value delivered. The inclusion of a 7-day free trial and potential freemium web tier further reduces adoption friction.</li>
                <li><strong className="text-white">Visual Design and User Experience</strong>: HUB's interface is designed to feel premium from the first interaction. The dark theme with red accent, smooth animations, and thoughtful layout create an experience that professionals are proud to use as their daily command center.</li>
                <li><strong className="text-white">Active Development and Modern Stack</strong>: Built on a modern technology stack (React, Express, PostgreSQL, Electron), HUB is architected for rapid iteration and feature development, ensuring the product evolves with user needs.</li>
              </ol>
            </section>

            {/* Section 10: Technology Architecture */}
            <section id="technology-architecture">
              <h2 className="text-3xl font-display font-bold text-white mb-6 pb-3 border-b border-white/10">Technology Architecture</h2>
              <div className="space-y-4 text-white/60 leading-relaxed mb-8">
                <p>HUB is built on a modern, proven technology stack designed for reliability, performance, and rapid development. The architecture is described here at a high level for a general audience.</p>
              </div>

              <h3 className="text-xl font-display font-semibold text-white mb-4">Frontend (What Users See)</h3>
              <div className="space-y-4 text-white/60 leading-relaxed mb-8">
                <p>The user interface is built with <strong className="text-white">React</strong>, one of the most widely adopted frontend frameworks in the world, powering applications at companies like Meta, Netflix, and Airbnb. The interface is styled with <strong className="text-white">Tailwind CSS</strong> and uses the <strong className="text-white">shadcn/ui</strong> component library for a consistent, accessible, and polished design system. Page transitions and micro-interactions are powered by <strong className="text-white">Framer Motion</strong> for a fluid, responsive feel.</p>
              </div>

              <h3 className="text-xl font-display font-semibold text-white mb-4">Backend (What Powers the Platform)</h3>
              <div className="space-y-4 text-white/60 leading-relaxed mb-8">
                <p>The server is built with <strong className="text-white">Express</strong>, the most popular web application framework for Node.js, handling API requests, authentication, session management, and integration with third-party services. The backend is designed to be lightweight and fast, with a focus on security and reliability.</p>
              </div>

              <h3 className="text-xl font-display font-semibold text-white mb-4">Database (Where Data Lives)</h3>
              <div className="space-y-4 text-white/60 leading-relaxed mb-8">
                <p>All user data, application configurations, widget layouts, and session information are stored in <strong className="text-white">PostgreSQL</strong>, an enterprise-grade relational database known for its reliability, data integrity, and performance. The database is managed through <strong className="text-white">Drizzle ORM</strong>, which provides type-safe database operations and schema management.</p>
              </div>

              <h3 className="text-xl font-display font-semibold text-white mb-4">Billing (How Payments Work)</h3>
              <div className="space-y-4 text-white/60 leading-relaxed mb-8">
                <p>Subscription billing is handled through <strong className="text-white">Stripe</strong>, the industry-standard payment platform used by millions of businesses worldwide. Stripe manages payment processing, subscription lifecycle, trial periods, and invoicing, ensuring a secure and seamless billing experience.</p>
              </div>

              <h3 className="text-xl font-display font-semibold text-white mb-4">Desktop Application (The Premium Experience)</h3>
              <div className="space-y-4 text-white/60 leading-relaxed mb-8">
                <p>The desktop application is built with <strong className="text-white">Electron</strong>, the same framework that powers applications like Visual Studio Code, Slack, and Discord. Electron enables HUB to run as a native desktop application on Mac, Windows, and Linux while leveraging the same web technologies that power the web app. The desktop version uses <strong className="text-white">BrowserView</strong> with persistent session partitions for its embedded app experience.</p>
              </div>

              <h3 className="text-xl font-display font-semibold text-white mb-4">Architecture Principles</h3>
              <ul className="list-disc list-inside space-y-2 pl-4 text-white/60 leading-relaxed">
                <li><strong className="text-white">Monorepo Structure</strong>: The web frontend, backend API, shared types, and desktop application all live in a single repository, ensuring consistency and simplifying development.</li>
                <li><strong className="text-white">Type Safety</strong>: TypeScript is used across the entire stack (frontend, backend, shared schemas), catching errors at development time rather than in production.</li>
                <li><strong className="text-white">Security First</strong>: Every layer of the stack incorporates security best practices, from password hashing and session management to HTTP headers and rate limiting.</li>
              </ul>
            </section>

            {/* Section 11: Product Roadmap */}
            <section id="product-roadmap">
              <h2 className="text-3xl font-display font-bold text-white mb-6 pb-3 border-b border-white/10">Product Roadmap</h2>
              <div className="space-y-4 text-white/60 leading-relaxed mb-8">
                <p>HUB is actively developed with a clear vision for growth. The following initiatives represent the next phases of product evolution:</p>
              </div>

              <h3 className="text-xl font-display font-semibold text-white mb-4">Near-Term (Next 6 Months)</h3>
              <ul className="list-disc list-inside space-y-2 pl-4 text-white/60 leading-relaxed mb-8">
                <li><strong className="text-white">App Usage Analytics</strong>: Provide users with insights into which applications they use most frequently, how much time is spent in each app, and usage trends over time. This data helps users optimize their workflows and identify underutilized subscriptions.</li>
                <li><strong className="text-white">Notification Aggregation</strong>: Consolidate notifications from connected applications into a single, unified notification center within HUB. Users will be able to see alerts from Slack, email, project management tools, and more without switching contexts.</li>
                <li><strong className="text-white">Mobile Application</strong>: Extend HUB to iOS and Android, allowing users to access their unified workspace on the go. The mobile app will feature the same dashboard, app launcher, and persistent session capabilities optimized for mobile form factors.</li>
              </ul>

              <h3 className="text-xl font-display font-semibold text-white mb-4">Mid-Term (6-12 Months)</h3>
              <ul className="list-disc list-inside space-y-2 pl-4 text-white/60 leading-relaxed mb-8">
                <li><strong className="text-white">Team and Enterprise Plans</strong>: Introduce multi-user plans with team management, shared app configurations, role-based access controls, and centralized billing. This unlocks the B2B market and enables agencies and companies to deploy HUB across their entire organization.</li>
                <li><strong className="text-white">Single Sign-On (SSO) Integration</strong>: Support SAML and OAuth-based SSO for enterprise customers, allowing organizations to enforce their existing identity and access management policies within HUB.</li>
                <li><strong className="text-white">App Marketplace</strong>: Curate a marketplace of pre-configured application integrations with optimized settings, recommended workflows, and one-click setup for popular business tools.</li>
              </ul>

              <h3 className="text-xl font-display font-semibold text-white mb-4">Long-Term (12+ Months)</h3>
              <ul className="list-disc list-inside space-y-2 pl-4 text-white/60 leading-relaxed">
                <li><strong className="text-white">Cross-App Workflows and Automation</strong>: Enable users to create automated workflows that span multiple connected applications. For example: when a new lead is added in CRM, automatically create an invoice in accounting software and send a notification in the team communication channel.</li>
                <li><strong className="text-white">AI-Powered Workspace Assistant</strong>: Integrate intelligent assistance that can search across connected applications, surface relevant information proactively, and help users navigate their workspace more efficiently.</li>
                <li><strong className="text-white">API and Developer Platform</strong>: Open HUB's platform to third-party developers, allowing custom integrations, widgets, and extensions to be built and shared within the HUB ecosystem.</li>
              </ul>
            </section>

            {/* Section 12: Conclusion / Call to Action */}
            <section id="conclusion">
              <h2 className="text-3xl font-display font-bold text-white mb-6 pb-3 border-b border-white/10">Conclusion / Call to Action</h2>
              <div className="space-y-4 text-white/60 leading-relaxed mb-8">
                <p>The SaaS tool sprawl problem is real, growing, and costly. Every business professional who spends their day switching between dozens of browser tabs, re-entering passwords, and losing focus to context switching is paying an invisible tax on their productivity.</p>
                <p><strong className="text-white">HUB | Unified Workspace</strong> eliminates this tax. By providing a single, beautifully designed dashboard where users log in once and access all of their business applications with persistent sessions, HUB transforms fragmented workflows into streamlined productivity.</p>
                <p>With a modern technology stack, a clear freemium-to-premium business model, competitive pricing at $25/month, and a roadmap that extends into team collaboration, automation, and mobile access, HUB is positioned to become the operating system for the modern business professional's digital workspace.</p>
              </div>

              <h3 className="text-xl font-display font-semibold text-white mb-4">Get Started</h3>
              <ul className="list-disc list-inside space-y-2 pl-4 text-white/60 leading-relaxed mb-8">
                <li><strong className="text-white">Try HUB Free</strong>: Start your 7-day free trial with full access to all features. No credit card required to explore the web dashboard.</li>
                <li><strong className="text-white">Download the Desktop App</strong>: Experience the premium embedded workspace on Mac, Windows, or Linux.</li>
                <li><strong className="text-white">For Investors and Partners</strong>: Contact us to learn more about HUB's growth trajectory, market opportunity, and partnership possibilities.</li>
              </ul>

              <div className="text-center p-8 rounded-2xl bg-white/[0.03] border border-white/5">
                <p className="text-2xl font-display font-bold text-white mb-2">HUB | Unified Workspace</p>
                <p className="text-lg text-white/60 mb-6">One login. All your apps. Always connected.</p>
                <Link href="/onboarding">
                  <Button className="bg-[#EF4444] hover:bg-[#DC2626] text-white font-medium px-8 h-12 text-lg rounded-2xl" data-testid="button-cta-get-started">
                    Start Your Free Trial
                  </Button>
                </Link>
                <p className="text-sm text-white/30 mt-6 italic">Copyright 2026 HUB. All rights reserved.</p>
              </div>
            </section>
          </div>
        </article>
      </main>
    </div>
  );
}