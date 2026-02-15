import { Home, Briefcase, User, Settings, Grid, Plus, LogOut, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function Sidebar() {
  return (
    <div className="h-screen w-64 bg-sidebar/50 border-r border-white/5 backdrop-blur-xl flex flex-col p-4">
      <div className="flex items-center gap-3 px-2 mb-8">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/20">
          <Grid className="h-5 w-5 text-white" />
        </div>
        <span className="font-display font-bold text-xl tracking-tight text-white">HUB</span>
      </div>

      <div className="space-y-1">
        <h3 className="px-2 text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Main</h3>
        <NavButton icon={LayoutDashboard} label="Dashboard" active />
        <NavButton icon={Grid} label="All Apps" />
      </div>

      <div className="mt-8 space-y-1">
        <h3 className="px-2 text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Workspaces</h3>
        <NavButton icon={Briefcase} label="Business" />
        <NavButton icon={User} label="Personal" />
        <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-white hover:bg-white/5 gap-3 h-9 px-2">
          <Plus className="h-4 w-4" />
          <span className="text-sm">Add Workspace</span>
        </Button>
      </div>

      <div className="mt-auto">
        <Separator className="bg-white/10 mb-4" />
        <NavButton icon={Settings} label="Settings" />
        <NavButton icon={LogOut} label="Sign Out" />
      </div>
    </div>
  );
}

function NavButton({ icon: Icon, label, active }: { icon: any, label: string, active?: boolean }) {
  return (
    <Button 
      variant="ghost" 
      className={cn(
        "w-full justify-start gap-3 h-10 px-2 transition-all duration-200",
        active 
          ? "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary border border-primary/20 shadow-[0_0_15px_-5px_hsl(var(--primary))]" 
          : "text-muted-foreground hover:text-white hover:bg-white/5"
      )}
    >
      <Icon className={cn("h-4 w-4", active && "text-primary")} />
      <span className="font-medium">{label}</span>
    </Button>
  );
}