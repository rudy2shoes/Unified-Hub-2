import { Crown, Check } from "lucide-react";

export function PlanStatusWidget() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <div className="h-8 w-8 rounded-lg bg-[#EF4444]/10 flex items-center justify-center">
          <Crown className="h-4 w-4 text-[#EF4444]" />
        </div>
        <h3 className="text-sm font-medium text-white">Your Plan</h3>
      </div>

      <div className="flex items-end gap-2 mb-3">
        <span className="text-2xl font-bold text-white">HUB Pro</span>
        <span className="text-sm text-muted-foreground mb-0.5">$25/mo</span>
      </div>

      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden mb-3">
        <div className="h-full bg-gradient-to-r from-[#EF4444] to-red-600 w-full rounded-full" />
      </div>

      <div className="space-y-1.5">
        {["Unlimited apps", "Persistent sessions", "Priority support"].map(feature => (
          <div key={feature} className="flex items-center gap-2">
            <Check className="h-3 w-3 text-green-500" />
            <span className="text-xs text-muted-foreground">{feature}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
