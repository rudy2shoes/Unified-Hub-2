import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, RefreshCw, ExternalLink, X, Loader2, Maximize2, MonitorSmartphone, Globe, AlertTriangle } from "lucide-react";
import type { ConnectedApp } from "@shared/schema";
import { AppIcon } from "@/components/AppIcon";

interface AppBrowserProps {
  app: ConnectedApp;
  onClose: () => void;
}

type LoadState = "loading" | "loaded" | "blocked" | "error";

export function AppBrowser({ app, onClose }: AppBrowserProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [popupWindow, setPopupWindow] = useState<Window | null>(null);
  const [currentUrl, setCurrentUrl] = useState(app.url || "");
  const loadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLoadState("loading");

    loadTimerRef.current = setTimeout(() => {
      if (loadState === "loading") {
        setLoadState("loaded");
      }
    }, 5000);

    return () => {
      if (loadTimerRef.current) clearTimeout(loadTimerRef.current);
    };
  }, [currentUrl]);

  const handleIframeLoad = useCallback(() => {
    if (loadTimerRef.current) clearTimeout(loadTimerRef.current);
    setLoadState("loaded");
  }, []);

  const handleIframeError = useCallback(() => {
    if (loadTimerRef.current) clearTimeout(loadTimerRef.current);
    setLoadState("blocked");
  }, []);

  useEffect(() => {
    if (!iframeRef.current || loadState !== "loading") return;

    const checkBlocked = setTimeout(() => {
      try {
        const iframe = iframeRef.current;
        if (iframe) {
          setLoadState("loaded");
        }
      } catch {
        setLoadState("loaded");
      }
    }, 8000);

    return () => clearTimeout(checkBlocked);
  }, [loadState]);

  useEffect(() => {
    if (!popupWindow) return;
    const checkInterval = setInterval(() => {
      if (popupWindow.closed) {
        setPopupWindow(null);
      }
    }, 1000);
    return () => clearInterval(checkInterval);
  }, [popupWindow]);

  const handleRefresh = () => {
    if (iframeRef.current) {
      setLoadState("loading");
      iframeRef.current.src = currentUrl;
    }
  };

  const handleOpenPopup = () => {
    if (popupWindow && !popupWindow.closed) {
      popupWindow.focus();
      return;
    }
    const w = window.open(
      app.url,
      `hub-app-${app.id}`,
      "width=1200,height=800,menubar=no,toolbar=yes,location=yes,status=yes,scrollbars=yes,resizable=yes"
    );
    if (w) {
      setPopupWindow(w);
      w.focus();
    }
  };

  const handleExternalOpen = () => {
    if (app.url) window.open(app.url, "_blank");
  };

  const handleClose = () => {
    if (popupWindow && !popupWindow.closed) {
      popupWindow.close();
    }
    onClose();
  };

  const isPopupOpen = popupWindow && !popupWindow.closed;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col h-full overflow-hidden"
    >
      <div className="h-12 flex items-center justify-between px-3 bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/5 z-30 flex-shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={handleClose}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
            data-testid="button-back-dashboard"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium hidden sm:inline">Back</span>
          </button>

          <div className="h-4 w-[1px] bg-white/10" />

          <div className="flex items-center gap-2">
            <AppIcon name={app.name} url={app.url} color={app.color} size={24} />
            <span className="text-sm font-medium text-white">{app.name}</span>
            {loadState === "loading" && (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-[#EF4444]" />
            )}
            {loadState === "loaded" && (
              <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
            )}
            {loadState === "blocked" && (
              <AlertTriangle className="h-3.5 w-3.5 text-yellow-500" />
            )}
          </div>
        </div>

        <div className="flex items-center">
          <div className="hidden md:flex items-center bg-white/5 rounded-lg px-3 py-1 mr-2 max-w-[300px]">
            <Globe className="h-3 w-3 text-muted-foreground mr-2 flex-shrink-0" />
            <span className="text-xs text-muted-foreground truncate">{currentUrl}</span>
          </div>

          <div className="flex items-center gap-0.5 bg-white/5 rounded-lg p-0.5">
            <button
              onClick={handleRefresh}
              className="p-1.5 rounded-md hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
              data-testid="button-refresh-app"
              title="Refresh"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleOpenPopup}
              className="p-1.5 rounded-md hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
              data-testid="button-popup-app"
              title="Open in separate window"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleExternalOpen}
              className="p-1.5 rounded-md hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
              data-testid="button-external-app"
              title="Open in new tab"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleClose}
              className="p-1.5 rounded-md hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
              data-testid="button-close-app"
              title="Close"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 relative bg-[#0a0a0a]">
        {loadState === "blocked" ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
            <AppIcon name={app.name} url={app.url} color={app.color} size={64} className="shadow-2xl mb-5" />
            <h3 className="text-lg font-semibold text-white mb-2">{app.name} requires a separate window</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md mb-6 leading-relaxed">
              This app's security settings prevent it from loading directly inside HUB.
              You can open it in a connected window — your login will still persist.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleOpenPopup}
                className="px-5 py-2.5 rounded-xl bg-[#EF4444] hover:bg-[#DC2626] text-white text-sm font-medium transition-colors flex items-center gap-2 shadow-lg shadow-[#EF4444]/20"
                data-testid="button-open-popup-fallback"
              >
                <Maximize2 className="h-4 w-4" /> Open {app.name}
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-muted-foreground text-sm font-medium transition-colors border border-white/5"
              >
                Back to Dashboard
              </button>
            </div>
            {isPopupOpen && (
              <div className="mt-6 flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs text-green-400 font-medium">{app.name} is running in a connected window</span>
                <button
                  onClick={() => popupWindow?.focus()}
                  className="ml-2 text-xs text-green-300 underline hover:text-green-200"
                >
                  Switch to it
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            {loadState === "loading" && (
              <div className="absolute inset-0 flex items-center justify-center z-10 bg-[#0a0a0a]">
                <div className="flex flex-col items-center gap-3">
                  <div className="relative">
                    <AppIcon name={app.name} url={app.url} color={app.color} size={56} className="shadow-xl" />
                    <Loader2 className="absolute -bottom-1 -right-1 h-5 w-5 animate-spin text-[#EF4444]" />
                  </div>
                  <span className="text-sm text-muted-foreground">Loading {app.name}...</span>
                </div>
              </div>
            )}
            <iframe
              ref={iframeRef}
              src={currentUrl}
              className="w-full h-full border-0"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation allow-popups-to-escape-sandbox allow-storage-access-by-user-activation"
              allow="camera; microphone; geolocation; clipboard-read; clipboard-write; storage-access"
              data-testid="iframe-app-browser"
            />
          </>
        )}

        {isPopupOpen && loadState !== "blocked" && (
          <div className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-[#0a0a0a]/90 border border-green-500/20 backdrop-blur-sm z-20">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-green-400">{app.name} also open in window</span>
            <button
              onClick={() => popupWindow?.focus()}
              className="text-xs text-green-300 underline hover:text-green-200 ml-1"
            >
              Focus
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
