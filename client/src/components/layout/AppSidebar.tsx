import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { useState, useCallback } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { ConnectedApp } from "@shared/schema";
import hubLogo from "@assets/HUB_Logo_(1)_1770930042707.png";
import { AppIcon } from "@/components/AppIcon";
import { apiRequest } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function getWheelStyle(index: number, hoveredIndex: number | null) {
  if (hoveredIndex === null) return { scale: 1, x: 0, y: 0 };
  if (index === hoveredIndex) return { scale: 1.35, x: 18, y: -8 };
  return { scale: 1, x: 0, y: 0 };
}

interface SortableAppDockItemProps {
  app: ConnectedApp;
  active: boolean;
  expanded: boolean;
  onClick: () => void;
  index: number;
  hoveredIndex: number | null;
  onHover: (index: number | null) => void;
}

function SortableAppDockItem({ app, active, expanded, onClick, index, hoveredIndex, onHover }: SortableAppDockItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: app.id });

  const wheelStyle = getWheelStyle(index, hoveredIndex);

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      data-testid={`draggable-app-${app.id}`}
    >
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <motion.button
            animate={{ scale: wheelStyle.scale, x: wheelStyle.x, y: wheelStyle.y }}
            transition={{ type: "tween", duration: 0.15, ease: "easeOut" }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            onMouseEnter={() => onHover(index)}
            onMouseLeave={() => onHover(null)}
            className={cn(
              "relative group flex items-center w-full p-2 rounded-xl transition-all duration-300",
              active ? "bg-white/10 shadow-[0_0_20px_-5px_rgba(255,255,255,0.1)]" : "hover:bg-white/5"
            )}
          >
            <div className="relative flex-shrink-0">
              <AppIcon name={app.name} url={app.url} color={app.color || undefined} size={32} notificationCount={app.notificationCount} className="rounded-xl shadow-lg border border-white/10" />
            </div>

            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2, delay: 0.05 }}
                  className="ml-3 flex-1 text-left whitespace-nowrap overflow-hidden"
                >
                  <span className="text-sm font-medium text-white/90 group-hover:text-white transition-colors">{app.name}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {active && (
              <motion.div
                layoutId="activeStrip"
                className="absolute left-0 w-1 h-8 bg-[#EF4444] rounded-r-full shadow-[0_0_10px_rgba(239,68,68,0.5)]"
              />
            )}
          </motion.button>
        </TooltipTrigger>
      </Tooltip>
    </div>
  );
}

interface SortableGroupProps {
  items: ConnectedApp[];
  activeAppId?: string | null;
  expanded: boolean;
  onLaunchApp?: (app: ConnectedApp) => void;
  groupId: string;
}

function SortableGroup({ items, activeAppId, expanded, onLaunchApp, groupId }: SortableGroupProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex(a => a.id === active.id);
    const newIndex = items.findIndex(a => a.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(items, oldIndex, newIndex);

    queryClient.setQueryData<ConnectedApp[]>(["/api/apps"], (old) => {
      if (!old) return old;
      const otherApps = old.filter(a => !items.some(i => i.id === a.id));
      const updated = reordered.map((app, idx) => ({ ...app, sortOrder: idx }));
      return [...otherApps, ...updated].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    });

    const promises = reordered.map((app, idx) =>
      apiRequest("PATCH", `/api/apps/${app.id}`, { sortOrder: idx })
    );
    await Promise.all(promises);
  }, [items]);

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map(a => a.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-1" data-testid={`sortable-group-${groupId}`}>
          {items.map((app, index) => (
            <SortableAppDockItem
              key={app.id}
              app={app}
              active={activeAppId === app.id}
              expanded={expanded}
              onClick={() => onLaunchApp?.(app)}
              index={index}
              hoveredIndex={hoveredIndex}
              onHover={setHoveredIndex}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

interface AppSidebarProps {
  apps?: ConnectedApp[];
  activeAppId?: string | null;
  onAddApp?: () => void;
  onLaunchApp?: (app: ConnectedApp) => void;
  onDashboard?: () => void;
}

export function AppSidebar({ apps = [], activeAppId, onAddApp, onLaunchApp, onDashboard }: AppSidebarProps) {
  const [isHovered, setIsHovered] = useState(false);

  const favorites = apps.filter(a => a.isFavorite);
  const others = apps.filter(a => !a.isFavorite);

  return (
    <motion.div
      className={cn(
        "h-screen flex flex-col pt-2 pb-4 bg-[#080808]/90 backdrop-blur-2xl border-r border-white/5 z-50 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
        isHovered ? "w-64 px-4 shadow-2xl shadow-black/50" : "w-24 items-center px-3"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={cn("mb-3 flex items-center", isHovered ? "w-full px-2" : "justify-center")}>
        <motion.div
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.3 }}
          className="cursor-pointer flex-shrink-0"
          onClick={onDashboard}
        >
          <img src={hubLogo} alt="hub." className={cn("w-auto transition-all duration-300", isHovered ? "h-28" : "h-24")} />
        </motion.div>
      </div>

      <div className="flex-1 flex flex-col gap-2 w-full overflow-y-auto scrollbar-none overflow-x-hidden">
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <motion.button
              layout
              whileHover={{ scale: 1.05, x: 5 }}
              whileTap={{ scale: 0.95 }}
              onClick={onDashboard}
              className={cn(
                "relative group flex items-center w-full p-2 rounded-xl transition-all duration-300",
                !activeAppId ? "bg-white/10 shadow-[0_0_20px_-5px_rgba(255,255,255,0.1)]" : "hover:bg-white/5"
              )}
            >
              <div className="relative flex-shrink-0">
                <AppIcon name="Dashboard" color="#333333" size={40} className="rounded-xl shadow-lg border border-white/10" />
              </div>
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2, delay: 0.05 }}
                    className="ml-3 flex-1 text-left whitespace-nowrap overflow-hidden"
                  >
                    <span className="text-sm font-medium text-white/90 group-hover:text-white transition-colors">Dashboard</span>
                  </motion.div>
                )}
              </AnimatePresence>
              {!activeAppId && (
                <motion.div
                  layoutId="activeStrip"
                  className="absolute left-0 w-1 h-8 bg-[#EF4444] rounded-r-full shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                />
              )}
            </motion.button>
          </TooltipTrigger>
          {!isHovered && (
            <TooltipContent side="right" className="bg-[#1a1a1a] border-white/10 backdrop-blur-md text-white font-medium ml-2">
              Dashboard
            </TooltipContent>
          )}
        </Tooltip>

        <div className={cn("h-[1px] bg-white/5 my-2 transition-all duration-300", isHovered ? "w-full" : "w-8 mx-auto")} />

        {favorites.length > 0 && (
          <div>
            {isHovered && <p className="px-2 text-xs font-medium text-white/20 uppercase tracking-wider mb-2 animate-in fade-in slide-in-from-left-2">Favorites</p>}
            <SortableGroup
              items={favorites}
              activeAppId={activeAppId}
              expanded={isHovered}
              onLaunchApp={onLaunchApp}
              groupId="favorites"
            />
          </div>
        )}

        {others.length > 0 && (
          <>
            <div className={cn("h-[1px] bg-white/5 my-2 transition-all duration-300", isHovered ? "w-full" : "w-8 mx-auto")} />
            <div>
              {isHovered && <p className="px-2 text-xs font-medium text-white/20 uppercase tracking-wider mb-2 animate-in fade-in slide-in-from-left-2">Apps</p>}
              <SortableGroup
                items={others}
                activeAppId={activeAppId}
                expanded={isHovered}
                onLaunchApp={onLaunchApp}
                groupId="others"
              />
            </div>
          </>
        )}

        {apps.length === 0 && (
          <div className="space-y-1">
            {isHovered && <p className="px-2 text-xs font-medium text-white/20 uppercase tracking-wider mb-2">No apps yet</p>}
          </div>
        )}
      </div>

      <div className="mt-auto pt-4 border-t border-white/5 w-full">
        <motion.button
          whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" }}
          whileTap={{ scale: 0.98 }}
          onClick={onAddApp}
          className={cn(
            "flex items-center gap-3 w-full p-2 rounded-xl text-white/30 hover:text-white transition-all",
            !isHovered && "justify-center"
          )}
          data-testid="button-add-app"
        >
          <div className="w-10 h-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center flex-shrink-0">
            <Plus className="w-5 h-5" />
          </div>

          <AnimatePresence>
            {isHovered && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-sm font-medium whitespace-nowrap"
              >
                Add Application
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.div>
  );
}
