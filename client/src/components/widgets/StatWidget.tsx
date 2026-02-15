import { ArrowUpRight, ArrowDownRight, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatWidgetProps {
  title: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  icon?: any;
  color?: "primary" | "blue" | "green" | "orange";
}

export function StatWidget({ title, value, trend, trendUp, icon: Icon, color = "primary" }: StatWidgetProps) {
  const colors = {
    primary: "from-primary/20 to-primary/5 border-primary/20 text-primary",
    blue: "from-blue-500/20 to-blue-500/5 border-blue-500/20 text-blue-400",
    green: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/20 text-emerald-400",
    orange: "from-orange-500/20 to-orange-500/5 border-orange-500/20 text-orange-400",
  };

  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl p-5 border backdrop-blur-md bg-gradient-to-br transition-all hover:scale-[1.01]",
      colors[color]
    )}>
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 rounded-lg bg-white/5 border border-white/5">
          {Icon && <Icon className="h-5 w-5 opacity-90" />}
        </div>
        {trend && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full border border-white/5",
            trendUp ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
          )}>
            {trendUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {trend}
          </div>
        )}
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-1">{title}</h3>
        <p className="text-2xl font-display font-semibold text-white tracking-tight">{value}</p>
      </div>

      <div className="absolute -right-6 -bottom-6 opacity-[0.03] pointer-events-none">
        {Icon && <Icon className="h-32 w-32" />}
      </div>
    </div>
  );
}