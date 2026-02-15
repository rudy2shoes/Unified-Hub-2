import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface AppCardProps {
  name: string;
  category: string;
  iconUrl?: string;
  color?: string;
  notifications?: number;
}

export function AppCard({ name, category, iconUrl, color, notifications }: AppCardProps) {
  return (
    <motion.div 
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="group relative flex flex-col items-center gap-3 p-4 rounded-2xl glass-card cursor-pointer border border-white/5 bg-white/5 hover:bg-white/10 transition-all duration-300"
    >
      {notifications && notifications > 0 && (
        <div className="absolute top-3 right-3 h-5 min-w-[20px] px-1.5 flex items-center justify-center bg-destructive text-white text-[10px] font-bold rounded-full shadow-lg z-10 border border-white/10">
          {notifications}
        </div>
      )}
      
      <div className={cn(
        "h-16 w-16 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300",
        !iconUrl && "bg-gradient-to-br from-gray-700 to-gray-900"
      )}
      style={{ 
        background: color ? `linear-gradient(135deg, ${color}, ${adjustColor(color, -20)})` : undefined 
      }}
      >
        {iconUrl ? (
          <img src={iconUrl} alt={name} className="h-10 w-10 object-contain drop-shadow-md" />
        ) : (
          <span className="text-2xl font-bold text-white/90">{name.charAt(0)}</span>
        )}
      </div>
      
      <div className="text-center">
        <h3 className="text-sm font-medium text-white group-hover:text-white/90">{name}</h3>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{category}</p>
      </div>
    </motion.div>
  );
}

// Simple color adjuster helper
function adjustColor(color: string, amount: number) {
  return color; // Placeholder for actual color manipulation if needed, but simple gradients work for now
}