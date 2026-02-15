import { AppSidebar } from "@/components/layout/AppSidebar";
import { TopBar } from "@/components/layout/TopBar";
import { AddAppWizard } from "@/components/AddAppWizard";
import { WidgetGrid } from "@/components/widgets/WidgetGrid";
import { AppIcon } from "@/components/AppIcon";
import { Loader2, LayoutGrid, Clock, Monitor, X, Building2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FocusView } from "@/components/FocusView";
import { AgencyView } from "@/components/AgencyView";
import { cn } from "@/lib/utils";
import type { ConnectedApp, User } from "@shared/schema";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [addAppOpen, setAddAppOpen] = useState(false);
  const [isFirstAppFlow, setIsFirstAppFlow] = useState(false);
  const [viewMode, setViewMode] = useState<"apps" | "focus" | "agency">("apps");
  const [theme, setTheme] = useState(() => localStorage.getItem("hub_theme") || "dark");
  const [showDownloadBanner, setShowDownloadBanner] = useState(() => !localStorage.getItem("hub_dismiss_download"));
  const [launchToast, setLaunchToast] = useState<{ name: string; color: string } | null>(null);
  const [appsBg, setAppsBg] = useState<string | null>(() => localStorage.getItem("hub_apps_bg"));
  const [agencyBg, setAgencyBg] = useState<string | null>(() => localStorage.getItem("hub_agency_bg"));

  useEffect(() => {
    const handler = () => setTheme(localStorage.getItem("hub_theme") || "dark");
    window.addEventListener("hub-theme-changed", handler);
    return () => window.removeEventListener("hub-theme-changed", handler);
  }, []);

  useEffect(() => {
    const appsHandler = () => setAppsBg(localStorage.getItem("hub_apps_bg"));
    const agencyHandler = () => setAgencyBg(localStorage.getItem("hub_agency_bg"));
    window.addEventListener("apps-bg-changed", appsHandler);
    window.addEventListener("agency-bg-changed", agencyHandler);
    return () => {
      window.removeEventListener("apps-bg-changed", appsHandler);
      window.removeEventListener("agency-bg-changed", agencyHandler);
    };
  }, []);

  const isLight = theme === "light";

  const handleLaunchApp = (app: ConnectedApp) => {
    if (app.url) {
      window.open(app.url, '_blank', 'noopener,noreferrer');
      setLaunchToast({ name: app.name, color: app.color || '#6366F1' });
      setTimeout(() => setLaunchToast(null), 4000);
    }
  };

  const { data: user, isLoading: userLoading } = useQuery<User | null>({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (!res.ok) return null;
      return res.json();
    },
    retry: false,
  });

  const { data: apps = [], isLoading: appsLoading } = useQuery<ConnectedApp[]>({
    queryKey: ["/api/apps"],
    queryFn: async () => {
      const res = await fetch("/api/apps", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (!userLoading && !user) {
      setLocation("/");
    }
  }, [user, userLoading, setLocation]);

  useEffect(() => {
    if (!appsLoading && apps.length === 0 && user) {
      const timer = setTimeout(() => {
        setIsFirstAppFlow(true);
        setAddAppOpen(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [appsLoading, apps.length, user]);

  if (userLoading) {
    return (
      <div className="flex h-screen w-full bg-[#050505] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className={cn("flex h-screen w-full overflow-hidden text-foreground selection:bg-[#EF4444]/30 transition-colors duration-300", isLight ? "bg-[#f5f5f5]" : "bg-[#0d0d0d]")}>
      <AppSidebar
        apps={apps}
        activeAppId={null}
        onAddApp={() => setAddAppOpen(true)}
        onLaunchApp={handleLaunchApp}
        onDashboard={() => {}}
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {(viewMode === "apps" && appsBg) && (
          <div className="absolute inset-0 z-0 pointer-events-none">
            <img src={appsBg} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50" />
          </div>
        )}
        {(viewMode === "agency" && agencyBg) && (
          <div className="absolute inset-0 z-0 pointer-events-none">
            <img src={agencyBg} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50" />
          </div>
        )}
        {!isLight && !appsBg && viewMode === "apps" && (
          <>
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-red-500/3 via-transparent to-transparent pointer-events-none" />
            <div className="absolute -top-[200px] -right-[200px] w-[600px] h-[600px] bg-red-500/5 rounded-full blur-[150px] pointer-events-none" />
          </>
        )}
        {!isLight && !agencyBg && viewMode === "agency" && (
          <>
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-red-500/3 via-transparent to-transparent pointer-events-none" />
            <div className="absolute -top-[200px] -right-[200px] w-[600px] h-[600px] bg-red-500/5 rounded-full blur-[150px] pointer-events-none" />
          </>
        )}
        {!isLight && viewMode === "focus" && (
          <>
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-red-500/3 via-transparent to-transparent pointer-events-none" />
            <div className="absolute -top-[200px] -right-[200px] w-[600px] h-[600px] bg-red-500/5 rounded-full blur-[150px] pointer-events-none" />
          </>
        )}

        <TopBar user={user} theme={theme} compact={viewMode !== "apps"} transparent={viewMode === "focus" || (viewMode === "apps" && !!appsBg) || (viewMode === "agency" && !!agencyBg)} />

        {isFirstAppFlow && addAppOpen ? (
          <div className="flex-1 overflow-y-auto scrollbar-none z-10">
            <AddAppWizard open={addAppOpen} onOpenChange={(open) => { setAddAppOpen(open); if (!open) setIsFirstAppFlow(false); }} isFirstApp={true} />
          </div>
        ) : (
          <main className={cn("flex-1 scrollbar-none z-10 flex flex-col", viewMode === "focus" ? "relative overflow-hidden" : "overflow-y-auto")}>
            {viewMode === "focus" && (
              <div className="absolute inset-0 z-0 flex">
                <FocusView apps={apps} onLaunchApp={handleLaunchApp} />
              </div>
            )}

            <div className={cn("relative z-10", viewMode === "focus" && "pointer-events-auto")}>
              <AnimatePresence>
                {showDownloadBanner && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mx-6 md:mx-8 mt-2 mb-1"
                  >
                    <div className={cn("relative flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-colors duration-300", (viewMode === "focus" || (viewMode === "apps" && appsBg) || (viewMode === "agency" && agencyBg)) ? "bg-black/40 backdrop-blur-md border-white/10" : isLight ? "bg-gradient-to-r from-red-50 to-orange-50 border-red-200/50" : "bg-gradient-to-r from-[#EF4444]/[0.08] to-[#EF4444]/[0.03] border-[#EF4444]/20")}>
                      <div className={cn("flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center", isLight ? "bg-[#EF4444]/10" : "bg-[#EF4444]/15")}>
                        <Monitor className="w-4.5 h-4.5 text-[#EF4444]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm font-medium", isLight ? "text-gray-800" : "text-white/90")}>Get the full experience with the HUB desktop app</p>
                        <p className={cn("text-xs mt-0.5", isLight ? "text-gray-500" : "text-white/40")}>Apps stay logged in and load directly inside HUB — no popups needed</p>
                      </div>
                      <a
                        href="https://github.com/rudy2shoes/Unified-Hub-2/releases/latest"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 px-4 py-2 rounded-lg bg-[#EF4444] hover:bg-[#DC2626] text-white text-sm font-medium transition-colors"
                        data-testid="button-download-app"
                      >
                        Download
                      </a>
                      <button
                        onClick={() => { setShowDownloadBanner(false); localStorage.setItem("hub_dismiss_download", "1"); }}
                        className={cn("flex-shrink-0 p-1 rounded-md transition-colors", isLight ? "text-gray-400 hover:text-gray-600 hover:bg-black/5" : "text-white/30 hover:text-white/60 hover:bg-white/5")}
                        data-testid="button-dismiss-download"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className={cn("flex justify-center px-6 md:px-8", viewMode !== "apps" ? "pt-1 pb-1" : "pt-2 pb-1.5")}>
                <div className={cn("inline-flex items-center rounded-full p-1 gap-0.5 border transition-colors duration-300", (viewMode === "focus" || (viewMode === "apps" && appsBg) || (viewMode === "agency" && agencyBg)) ? "bg-black/30 backdrop-blur-md border-white/10" : isLight ? "bg-black/[0.05] border-black/10" : "bg-white/[0.05] border-white/10")} data-testid="toggle-view-mode">
                  {([
                    { id: "apps" as const, label: "Apps", icon: LayoutGrid },
                    { id: "focus" as const, label: "Focus", icon: Clock },
                    { id: "agency" as const, label: "Agency", icon: Building2 },
                  ] as const).map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => setViewMode(id)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200",
                        viewMode === id
                          ? (isLight && viewMode !== "focus" && !(viewMode === "apps" && appsBg) && !(viewMode === "agency" && agencyBg)) ? "bg-black/10 text-black shadow-sm" : "bg-white/15 text-white shadow-sm"
                          : (isLight && viewMode !== "focus" && !(viewMode === "apps" && appsBg) && !(viewMode === "agency" && agencyBg)) ? "text-black/40 hover:text-black/70" : "text-white/40 hover:text-white/70"
                      )}
                      data-testid={`button-view-${id}`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <AnimatePresence mode="wait">
              {viewMode === "focus" ? (
                <div key="focus" className="flex-1" />
              ) : viewMode === "agency" ? (
                <motion.div
                  key="agency"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex-1 flex"
                >
                  <AgencyView apps={apps} onLaunchApp={handleLaunchApp} />
                </motion.div>
              ) : (
                <motion.div
                  key="grid"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="w-full px-6 md:px-8 pt-12 pb-8 flex flex-col items-center"
                >
                  <WidgetGrid
                    apps={apps}
                    onLaunchApp={handleLaunchApp}
                    onAddApp={() => setAddAppOpen(true)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        )}
      </div>

      {!(isFirstAppFlow && addAppOpen) && (
        <AddAppWizard open={addAppOpen} onOpenChange={setAddAppOpen} isFirstApp={false} />
      )}

      <AnimatePresence>
        {launchToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
          >
            <div className={cn("flex items-center gap-3 px-5 py-3 rounded-xl border shadow-2xl backdrop-blur-xl", isLight ? "bg-white border-black/10 shadow-black/10" : "bg-[#1a1a1a] border-white/10 shadow-black/40")}>
              <AppIcon name={launchToast.name} url="" color={launchToast.color} size={24} className="rounded-md" />
              <div>
                <p className={cn("text-sm font-medium", isLight ? "text-gray-800" : "text-white")}>{launchToast.name} opened in new tab</p>
                <p className={cn("text-xs mt-0.5", isLight ? "text-gray-400" : "text-white/40")}>Download the desktop app for embedded experience</p>
              </div>
              <button onClick={() => setLaunchToast(null)} className={cn("p-1 rounded-md transition-colors", isLight ? "text-gray-400 hover:bg-black/5" : "text-white/30 hover:bg-white/5")}>
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
