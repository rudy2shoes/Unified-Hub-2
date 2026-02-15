import { Star, ExternalLink } from "lucide-react";
import type { ConnectedApp } from "@shared/schema";
import { AppIcon } from "@/components/AppIcon";

interface Props {
  apps: ConnectedApp[];
  onLaunchApp: (app: ConnectedApp) => void;
  onAddApp: () => void;
}

export function FavoritesWidget({ apps, onLaunchApp }: Props) {
  const favorites = apps.filter(a => a.isFavorite);

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <div className="h-8 w-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
          <Star className="h-4 w-4 text-yellow-400" />
        </div>
        <h3 className="text-sm font-medium text-white">Favorites</h3>
      </div>

      {favorites.length > 0 ? (
        <div className="space-y-2">
          {favorites.slice(0, 5).map(app => (
            <button
              key={app.id}
              onClick={() => onLaunchApp(app)}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors group"
              data-testid={`button-fav-launch-${app.id}`}
            >
              <AppIcon name={app.name} url={app.url} color={app.color} size={32} className="flex-shrink-0" />
              <span className="text-sm text-white/80 group-hover:text-white truncate flex-1 text-left">{app.name}</span>
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            </button>
          ))}
        </div>
      ) : (
        <div className="py-6 text-center">
          <Star className="h-8 w-8 text-muted-foreground/20 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">No favorites yet</p>
          <p className="text-[10px] text-muted-foreground/60 mt-1">Star your most-used apps for quick access</p>
        </div>
      )}
    </div>
  );
}
