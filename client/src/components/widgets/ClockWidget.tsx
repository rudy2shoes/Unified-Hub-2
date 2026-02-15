import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

export function ClockWidget() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeStr = now.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  const dateStr = now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <div className="h-8 w-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
          <Clock className="h-4 w-4 text-cyan-400" />
        </div>
        <h3 className="text-sm font-medium text-white">Clock</h3>
      </div>

      <div className="text-center py-2">
        <div className="text-4xl font-bold text-white font-display tracking-tight" data-testid="text-clock-time">
          {timeStr}
        </div>
        <div className="text-sm text-muted-foreground mt-2" data-testid="text-clock-date">
          {dateStr}
        </div>
      </div>
    </div>
  );
}
