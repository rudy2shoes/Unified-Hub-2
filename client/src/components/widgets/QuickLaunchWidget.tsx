import { Zap, Plus, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import type { ConnectedApp } from "@shared/schema";
import { AppIcon } from "@/components/AppIcon";

interface Props {
  apps: ConnectedApp[];
  onLaunchApp: (app: ConnectedApp) => void;
  onAddApp: () => void;
}

export function QuickLaunchWidget({ apps, onLaunchApp, onAddApp }: Props) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
            <Zap className="h-4 w-4 text-purple-400" />
          </div>
          <h3 className="text-sm font-medium text-white">Quick Launch</h3>
        </div>
        <button
          onClick={onAddApp}
          className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
          data-testid="button-quick-add"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {apps.length > 0 ? (
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
          {apps.slice(0, 12).map(app => (
            <motion.button
              key={app.id}
              whileHover={{ scale: 1.08, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onLaunchApp(app)}
              className="flex flex-col items-center gap-2 p-2 rounded-xl hover:bg-white/5 transition-colors group"
              data-testid={`button-quick-${app.id}`}
            >
              <AppIcon name={app.name} url={app.url} color={app.color} size={44} className="shadow-lg group-hover:shadow-xl transition-shadow" />
              <span className="text-[11px] text-muted-foreground group-hover:text-white transition-colors truncate max-w-full">
                {app.name}
              </span>
            </motion.button>
          ))}

          <motion.button
            whileHover={{ scale: 1.08, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={onAddApp}
            className="flex flex-col items-center gap-2 p-2 rounded-xl hover:bg-white/5 transition-colors group"
            data-testid="button-quick-add-app"
          >
            <div className="h-11 w-11 rounded-xl border border-dashed border-white/15 flex items-center justify-center text-muted-foreground group-hover:text-white group-hover:border-white/30 transition-all">
              <Plus className="h-5 w-5" />
            </div>
            <span className="text-[11px] text-muted-foreground group-hover:text-white transition-colors">Add</span>
          </motion.button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-6">
          <p className="text-xs text-muted-foreground mb-3">No apps connected yet</p>
          <button
            onClick={onAddApp}
            className="px-4 py-2 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-sm font-medium hover:bg-[#EF4444]/20 transition-all"
          >
            Connect Your First App
          </button>
        </div>
      )}
    </div>
  );
}
