import { AppWindow, Plus } from "lucide-react";
import type { ConnectedApp } from "@shared/schema";

interface Props {
  apps: ConnectedApp[];
  onLaunchApp: (app: ConnectedApp) => void;
  onAddApp: () => void;
}

export function AppsOverviewWidget({ apps, onAddApp }: Props) {
  const categories = apps.reduce((acc, app) => {
    acc[app.category] = (acc[app.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
          <AppWindow className="h-4 w-4 text-blue-400" />
        </div>
        <h3 className="text-sm font-medium text-white">Apps Overview</h3>
      </div>

      <div className="flex items-end gap-2 mb-4">
        <span className="text-4xl font-bold text-white" data-testid="text-total-apps">{apps.length}</span>
        <span className="text-sm text-muted-foreground mb-1.5">connected</span>
      </div>

      {Object.keys(categories).length > 0 ? (
        <div className="space-y-2">
          {Object.entries(categories).slice(0, 4).map(([cat, count]) => (
            <div key={cat} className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{cat}</span>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-16 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500/50 rounded-full"
                    style={{ width: `${(count / apps.length) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-white/60 w-4 text-right">{count}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <button
          onClick={onAddApp}
          className="w-full py-3 rounded-xl bg-white/5 border border-dashed border-white/10 text-sm text-muted-foreground hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4" /> Connect your first app
        </button>
      )}
    </div>
  );
}
