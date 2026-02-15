import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Bell, BellOff } from "lucide-react";
import type { ConnectedApp } from "@shared/schema";
import { AppIcon } from "@/components/AppIcon";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface WidgetGridProps {
  apps: ConnectedApp[];
  onLaunchApp: (app: ConnectedApp) => void;
  onAddApp: () => void;
}

interface ContextMenuState {
  app: ConnectedApp;
  x: number;
  y: number;
}

export function WidgetGrid({ apps, onLaunchApp, onAddApp }: WidgetGridProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [theme, setTheme] = useState(() => localStorage.getItem("hub_theme") || "dark");
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const handler = () => setTheme(localStorage.getItem("hub_theme") || "dark");
    window.addEventListener("hub-theme-changed", handler);
    return () => window.removeEventListener("hub-theme-changed", handler);
  }, []);

  const isLight = theme === "light";

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    };
    if (contextMenu) {
      document.addEventListener("mousedown", close);
      return () => document.removeEventListener("mousedown", close);
    }
  }, [contextMenu]);

  const badgeMutation = useMutation({
    mutationFn: async ({ id, count }: { id: string; count: number }) => {
      const res = await apiRequest("PATCH", `/api/apps/${id}`, { notificationCount: count });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/apps"] });
    },
  });

  const handleContextMenu = useCallback((e: React.MouseEvent, app: ConnectedApp) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ app, x: e.clientX, y: e.clientY });
  }, []);

  const setBadge = useCallback((count: number) => {
    if (contextMenu) {
      badgeMutation.mutate({ id: contextMenu.app.id, count });
      setContextMenu(null);
    }
  }, [contextMenu, badgeMutation]);

  const filteredApps = useMemo(() => {
    if (!searchQuery.trim()) return apps;
    const q = searchQuery.toLowerCase();
    return apps.filter(
      (app) =>
        app.name.toLowerCase().includes(q) ||
        (app.category && app.category.toLowerCase().includes(q))
    );
  }, [apps, searchQuery]);

  const showApps = searchQuery.trim() ? filteredApps : apps;

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        {showApps.length > 0 ? (
          <div className="grid grid-cols-5 gap-x-10 gap-y-10 mx-auto w-fit">
            {showApps.map((app, i) => (
              <motion.button
                key={app.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.05 * Math.min(i, 10) }}
                onClick={() => onLaunchApp(app)}
                onContextMenu={(e) => handleContextMenu(e, app)}
                className="flex flex-col items-center gap-1.5 group"
                data-testid={`button-launch-app-${app.id}`}
              >
                <div className="relative">
                  <div className="transform group-hover:scale-110 group-active:scale-95 transition-transform duration-150">
                    <AppIcon name={app.name} url={app.url} color={app.color} size={56} notificationCount={app.notificationCount} className="shadow-xl shadow-black/40 rounded-2xl" />
                  </div>
                </div>
                <span className={cn("text-sm font-medium truncate w-full text-center max-w-[110px] leading-tight transition-colors duration-300", isLight ? "text-gray-600 group-hover:text-gray-900" : "text-white/70 group-hover:text-white")}>
                  {app.name}
                </span>
                <span className={cn("text-[10px] transition-colors duration-300 opacity-0 group-hover:opacity-100", isLight ? "text-gray-400" : "text-white/30")}>
                  Opens in new tab
                </span>
              </motion.button>
            ))}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.05 * Math.min(showApps.length, 10) }}
              onClick={onAddApp}
              className="flex flex-col items-center gap-2 group"
              data-testid="button-add-app-grid"
            >
              <div className="transform group-hover:scale-110 group-active:scale-95 transition-transform duration-150">
                <div className={cn("h-[56px] w-[56px] rounded-2xl border border-dashed flex items-center justify-center transition-colors group-hover:border-[#EF4444]/30 group-hover:bg-[#EF4444]/10", isLight ? "bg-black/[0.04] border-black/15 shadow-xl shadow-black/10" : "bg-white/[0.06] border-white/15 shadow-xl shadow-black/30")}>
                  <Plus className="h-6 w-6 text-white/30 group-hover:text-[#EF4444] transition-colors" />
                </div>
              </div>
              <span className={cn("text-xs font-medium transition-colors duration-300", isLight ? "text-gray-400 group-hover:text-gray-900" : "text-white/40 group-hover:text-white")}>
                Add App
              </span>
            </motion.button>
          </div>
        ) : searchQuery.trim() ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground text-sm">
              No apps match "{searchQuery}"
            </p>
            <button
              onClick={onAddApp}
              className="mt-3 text-sm text-[#EF4444] hover:underline"
              data-testid="button-add-app-search"
            >
              Add a new app
            </button>
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-muted-foreground/60 text-sm mb-4">
              No apps connected yet
            </p>
            <button
              onClick={onAddApp}
              className="px-5 py-2.5 rounded-xl bg-[#EF4444] hover:bg-[#DC2626] text-white text-sm font-medium transition-colors"
              data-testid="button-add-first-app"
            >
              Connect Your First App
            </button>
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
        className="max-w-3xl mx-auto"
      >
        <div className="relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for anything..."
            className={cn("w-full pl-14 pr-6 py-4.5 rounded-2xl text-base transition-all focus:outline-none focus:border-[#EF4444]/40", isLight ? "bg-black/5 border border-black/10 text-gray-900 placeholder:text-gray-400 focus:bg-black/[0.07]" : "bg-white/5 border border-white/10 text-white placeholder:text-muted-foreground/60 focus:bg-white/[0.07]")}
            data-testid="input-search-apps"
          />
        </div>
      </motion.div>

      <AnimatePresence>
        {contextMenu && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.12 }}
            className={cn("fixed z-[100] rounded-xl border shadow-2xl py-1.5 min-w-[180px]", isLight ? "bg-white border-gray-200 shadow-gray-300/50" : "bg-[#1a1a1a] border-white/10 shadow-black/60")}
            style={{ top: contextMenu.y, left: contextMenu.x }}
            data-testid="context-menu-notification"
          >
            <div className={cn("px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider", isLight ? "text-gray-400" : "text-white/30")}>
              {contextMenu.app.name}
            </div>
            {(contextMenu.app.notificationCount ?? 0) > 0 ? (
              <button
                onClick={() => setBadge(0)}
                className={cn("flex items-center gap-2.5 w-full px-3 py-2 text-sm transition-colors", isLight ? "text-gray-700 hover:bg-gray-100" : "text-white/80 hover:bg-white/5")}
                data-testid="button-clear-badge"
              >
                <BellOff className="w-4 h-4 text-white/40" />
                Clear notification
              </button>
            ) : (
              <>
                <button
                  onClick={() => setBadge(1)}
                  className={cn("flex items-center gap-2.5 w-full px-3 py-2 text-sm transition-colors", isLight ? "text-gray-700 hover:bg-gray-100" : "text-white/80 hover:bg-white/5")}
                  data-testid="button-set-badge-1"
                >
                  <Bell className="w-4 h-4 text-[#EF4444]" />
                  Mark as has notification
                </button>
              </>
            )}
            {[1, 3, 5, 10].map(n => (
              <button
                key={n}
                onClick={() => setBadge(n)}
                className={cn("flex items-center gap-2.5 w-full px-3 py-2 text-sm transition-colors", isLight ? "text-gray-700 hover:bg-gray-100" : "text-white/80 hover:bg-white/5")}
                data-testid={`button-set-badge-${n}`}
              >
                <span className="w-4 h-4 flex items-center justify-center rounded-full bg-[#EF4444] text-white text-[9px] font-bold">{n}</span>
                Set badge to {n}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
