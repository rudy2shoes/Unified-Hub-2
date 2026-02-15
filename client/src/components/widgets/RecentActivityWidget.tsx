import { Clock, ExternalLink } from "lucide-react";
import type { ConnectedApp } from "@shared/schema";
import { AppIcon } from "@/components/AppIcon";

interface Props {
  apps: ConnectedApp[];
  onLaunchApp: (app: ConnectedApp) => void;
}

export function RecentActivityWidget({ apps, onLaunchApp }: Props) {
  const recentApps = apps.slice(0, 5);

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center">
          <Clock className="h-4 w-4 text-green-400" />
        </div>
        <h3 className="text-sm font-medium text-white">Recent Activity</h3>
      </div>

      {recentApps.length > 0 ? (
        <div className="space-y-2">
          {recentApps.map((app, i) => (
            <button
              key={app.id}
              onClick={() => onLaunchApp(app)}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors group"
              data-testid={`button-recent-${app.id}`}
            >
              <AppIcon name={app.name} url={app.url} color={app.color} size={32} className="flex-shrink-0" />
              <div className="flex-1 text-left min-w-0">
                <span className="text-sm text-white/80 group-hover:text-white block truncate">{app.name}</span>
                <span className="text-[10px] text-muted-foreground">{app.category}</span>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                <span className="text-[10px] text-green-500">Connected</span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="py-6 text-center">
          <Clock className="h-8 w-8 text-muted-foreground/20 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">No activity yet</p>
          <p className="text-[10px] text-muted-foreground/60 mt-1">Connect apps to see activity here</p>
        </div>
      )}
    </div>
  );
}
