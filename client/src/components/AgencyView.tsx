import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Plus, Pencil, Trash2, X, Check, ChevronLeft, ExternalLink, Search, Settings, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppIcon } from "@/components/AppIcon";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import type { ConnectedApp, ClientWorkspace } from "@shared/schema";
import { APP_CATALOG, BUILTIN_CATEGORIES } from "@/components/AddAppWizard";
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
  rectSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const WORKSPACE_COLORS = [
  "#6366F1", "#EF4444", "#F59E0B", "#10B981", "#3B82F6",
  "#8B5CF6", "#EC4899", "#14B8A6", "#F97316", "#06B6D4",
];

interface AgencyViewProps {
  apps: ConnectedApp[];
  onLaunchApp: (app: ConnectedApp) => void;
}

export function AgencyView({ apps, onLaunchApp }: AgencyViewProps) {
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(WORKSPACE_COLORS[0]);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");
  const [theme, setTheme] = useState(() => localStorage.getItem("hub_theme") || "dark");
  const queryClient = useQueryClient();
  const isLight = theme === "light";

  useEffect(() => {
    const handler = () => setTheme(localStorage.getItem("hub_theme") || "dark");
    window.addEventListener("hub-theme-changed", handler);
    return () => window.removeEventListener("hub-theme-changed", handler);
  }, []);

  const { data: workspaces = [] } = useQuery<ClientWorkspace[]>({
    queryKey: ["/api/workspaces"],
    queryFn: async () => {
      const res = await fetch("/api/workspaces", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: { name: string; color: string }) => {
      const res = await apiRequest("POST", "/api/workspaces", data);
      return res.json();
    },
    onSuccess: (newWs: ClientWorkspace) => {
      queryClient.invalidateQueries({ queryKey: ["/api/workspaces"] });
      setCreating(false);
      setNewName("");
      setNewColor(WORKSPACE_COLORS[0]);
      setSelectedWorkspaceId(newWs.id);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { name?: string; color?: string } }) => {
      const res = await apiRequest("PATCH", `/api/workspaces/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workspaces"] });
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/workspaces/${id}`);
    },
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ["/api/workspaces"] });
      if (selectedWorkspaceId === deletedId) setSelectedWorkspaceId(null);
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async (orderedIds: string[]) => {
      await apiRequest("PUT", "/api/workspaces/reorder", { orderedIds });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workspaces"] });
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = workspaces.findIndex(w => w.id === active.id);
    const newIndex = workspaces.findIndex(w => w.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = arrayMove(workspaces, oldIndex, newIndex);
    queryClient.setQueryData(["/api/workspaces"], reordered);
    reorderMutation.mutate(reordered.map(w => w.id));
  };

  const selectedWorkspace = workspaces.find(w => w.id === selectedWorkspaceId);

  if (selectedWorkspace) {
    return (
      <WorkspaceDashboard
        workspace={selectedWorkspace}
        allApps={apps}
        isLight={isLight}
        onBack={() => setSelectedWorkspaceId(null)}
        onLaunchApp={onLaunchApp}
        onEdit={() => { setEditingId(selectedWorkspace.id); setEditName(selectedWorkspace.name); setEditColor(selectedWorkspace.color || WORKSPACE_COLORS[0]); }}
        onDelete={() => deleteMutation.mutate(selectedWorkspace.id)}
      />
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 md:px-8 py-6 scrollbar-none" data-testid="agency-view">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className={cn("text-xl font-semibold", isLight ? "text-gray-900" : "text-white")}>
              Client Workspaces
            </h2>
            <p className={cn("text-sm mt-1", isLight ? "text-gray-500" : "text-white/40")}>
              Manage separate app environments for each client
            </p>
          </div>
          <button
            onClick={() => setCreating(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#EF4444] hover:bg-[#DC2626] text-white text-sm font-medium transition-colors"
            data-testid="button-create-workspace"
          >
            <Plus className="w-4 h-4" />
            New Workspace
          </button>
        </div>

        <AnimatePresence>
          {creating && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              <div className={cn("p-5 rounded-xl border", isLight ? "bg-white border-black/10" : "bg-white/[0.03] border-white/10")}>
                <h3 className={cn("text-sm font-medium mb-4", isLight ? "text-gray-700" : "text-white/70")}>Create Workspace</h3>
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="Client or workspace name..."
                  autoFocus
                  onKeyDown={e => e.key === "Enter" && newName.trim() && createMutation.mutate({ name: newName.trim(), color: newColor })}
                  className={cn("w-full px-4 py-2.5 rounded-lg border text-sm mb-4 focus:outline-none focus:border-[#EF4444]/50", isLight ? "bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400" : "bg-white/5 border-white/10 text-white placeholder:text-white/30")}
                  data-testid="input-workspace-name"
                />
                <div className="mb-4">
                  <p className={cn("text-xs mb-2", isLight ? "text-gray-500" : "text-white/40")}>Color</p>
                  <div className="flex gap-2 flex-wrap">
                    {WORKSPACE_COLORS.map(c => (
                      <button
                        key={c}
                        onClick={() => setNewColor(c)}
                        className={cn("w-7 h-7 rounded-full transition-all", newColor === c ? "ring-2 ring-offset-2 scale-110" : "hover:scale-110")}
                        style={{ backgroundColor: c, ...(newColor === c ? { boxShadow: `0 0 0 2px ${isLight ? '#fff' : '#0d0d0d'}, 0 0 0 4px ${c}` } : {}) }}
                        data-testid={`button-color-${c}`}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => newName.trim() && createMutation.mutate({ name: newName.trim(), color: newColor })}
                    disabled={!newName.trim() || createMutation.isPending}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#EF4444] hover:bg-[#DC2626] text-white text-sm font-medium transition-colors disabled:opacity-50"
                    data-testid="button-confirm-create"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Create
                  </button>
                  <button
                    onClick={() => { setCreating(false); setNewName(""); }}
                    className={cn("px-4 py-2 rounded-lg text-sm transition-colors", isLight ? "bg-gray-100 text-gray-600 hover:bg-gray-200" : "bg-white/5 text-white/60 hover:bg-white/10")}
                    data-testid="button-cancel-create"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {workspaces.length === 0 && !creating ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn("flex flex-col items-center justify-center py-20 rounded-2xl border border-dashed", isLight ? "border-gray-200" : "border-white/10")}
          >
            <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mb-4", isLight ? "bg-gray-100" : "bg-white/5")}>
              <Building2 className={cn("w-8 h-8", isLight ? "text-gray-400" : "text-white/30")} />
            </div>
            <h3 className={cn("text-lg font-medium mb-2", isLight ? "text-gray-700" : "text-white/70")}>No workspaces yet</h3>
            <p className={cn("text-sm mb-6 max-w-sm text-center", isLight ? "text-gray-500" : "text-white/40")}>
              Create a workspace for each client to manage their apps independently with isolated sessions
            </p>
            <button
              onClick={() => setCreating(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#EF4444] hover:bg-[#DC2626] text-white text-sm font-medium transition-colors"
              data-testid="button-create-first-workspace"
            >
              <Plus className="w-4 h-4" />
              Create First Workspace
            </button>
          </motion.div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={workspaces.map(w => w.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {workspaces.map((ws, i) => (
                  <SortableWorkspaceCard
                    key={ws.id}
                    workspace={ws}
                    apps={apps}
                    isLight={isLight}
                    isEditing={editingId === ws.id}
                    editName={editName}
                    editColor={editColor}
                    index={i}
                    onOpen={() => setSelectedWorkspaceId(ws.id)}
                    onStartEdit={() => { setEditingId(ws.id); setEditName(ws.name); setEditColor(ws.color || WORKSPACE_COLORS[0]); }}
                    onCancelEdit={() => setEditingId(null)}
                    onSaveEdit={() => updateMutation.mutate({ id: ws.id, data: { name: editName.trim(), color: editColor } })}
                    onDelete={() => deleteMutation.mutate(ws.id)}
                    onSetEditName={setEditName}
                    onSetEditColor={setEditColor}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}

interface WorkspaceListCardProps {
  workspace: ClientWorkspace;
  apps: ConnectedApp[];
  isLight: boolean;
  isEditing: boolean;
  editName: string;
  editColor: string;
  index: number;
  onOpen: () => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onDelete: () => void;
  onSetEditName: (v: string) => void;
  onSetEditColor: (v: string) => void;
}

function SortableWorkspaceCard(props: WorkspaceListCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.workspace.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <WorkspaceListCardInner {...props} dragHandleProps={{ ...attributes, ...listeners }} isDragging={isDragging} />
    </div>
  );
}

function WorkspaceListCardInner({
  workspace, apps, isLight, isEditing, editName, editColor, index,
  onOpen, onStartEdit, onCancelEdit, onSaveEdit, onDelete, onSetEditName, onSetEditColor,
  dragHandleProps, isDragging,
}: WorkspaceListCardProps & { dragHandleProps: Record<string, any>; isDragging: boolean }) {
  const { data: workspaceApps = [] } = useQuery<{ id: string; workspaceId: string; appId: string }[]>({
    queryKey: [`/api/workspaces/${workspace.id}/apps`],
    queryFn: async () => {
      const res = await fetch(`/api/workspaces/${workspace.id}/apps`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const assignedAppIds = new Set(workspaceApps.map(wa => wa.appId));
  const assignedApps = apps.filter(a => assignedAppIds.has(a.id));
  const previewApps = assignedApps.slice(0, 6);
  const wsColor = workspace.color || "#6366F1";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.05 * index }}
      className={cn(
        "rounded-xl border overflow-hidden transition-all cursor-pointer group",
        isDragging ? "shadow-2xl" : "hover:scale-[1.02]",
        isLight ? "bg-white border-gray-200 hover:border-gray-300 hover:shadow-lg" : "bg-white/[0.02] border-white/[0.08] hover:border-white/[0.15] hover:bg-white/[0.04]"
      )}
      onClick={() => !isEditing && onOpen()}
      data-testid={`card-workspace-${workspace.id}`}
    >
      <div className="h-2 w-full" style={{ backgroundColor: wsColor }} />

      <div className="p-4">
        {isEditing ? (
          <div className="space-y-3" onClick={e => e.stopPropagation()}>
            <input
              type="text"
              value={editName}
              onChange={e => onSetEditName(e.target.value)}
              autoFocus
              onKeyDown={e => e.key === "Enter" && onSaveEdit()}
              className={cn("w-full px-3 py-1.5 rounded-lg border text-sm focus:outline-none focus:border-[#EF4444]/50", isLight ? "bg-gray-50 border-gray-200 text-gray-900" : "bg-white/5 border-white/10 text-white")}
              data-testid="input-edit-workspace-name"
            />
            <div className="flex gap-1.5">
              {WORKSPACE_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => onSetEditColor(c)}
                  className={cn("w-5 h-5 rounded-full transition-all", editColor === c && "scale-125")}
                  style={{ backgroundColor: c, ...(editColor === c ? { boxShadow: `0 0 0 2px ${isLight ? '#fff' : '#0d0d0d'}, 0 0 0 3px ${c}` } : {}) }}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={onSaveEdit} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EF4444] text-white text-xs font-medium" data-testid="button-save-edit">
                <Check className="w-3 h-3" /> Save
              </button>
              <button onClick={onCancelEdit} className={cn("px-3 py-1.5 rounded-lg text-xs", isLight ? "bg-gray-100 text-gray-500" : "bg-white/5 text-white/40")} data-testid="button-cancel-edit">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: wsColor + "20" }}
                >
                  <Building2 className="w-5 h-5" style={{ color: wsColor }} />
                </div>
                <div className="min-w-0">
                  <h3 className={cn("text-sm font-semibold truncate", isLight ? "text-gray-900" : "text-white")}>{workspace.name}</h3>
                  <p className={cn("text-xs mt-0.5", isLight ? "text-gray-400" : "text-white/35")}>
                    {assignedApps.length} app{assignedApps.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                <div
                  {...dragHandleProps}
                  className={cn("p-1.5 rounded-lg transition-colors cursor-grab active:cursor-grabbing", isLight ? "text-gray-300 hover:text-gray-500 hover:bg-gray-100" : "text-white/20 hover:text-white/50 hover:bg-white/5")}
                  data-testid={`drag-handle-workspace-${workspace.id}`}
                >
                  <GripVertical className="w-3.5 h-3.5" />
                </div>
                <button
                  onClick={onStartEdit}
                  className={cn("p-1.5 rounded-lg transition-colors", isLight ? "text-gray-400 hover:text-gray-600 hover:bg-gray-100" : "text-white/30 hover:text-white/60 hover:bg-white/5")}
                  data-testid={`button-edit-workspace-${workspace.id}`}
                >
                  <Pencil className="w-3 h-3" />
                </button>
                <button
                  onClick={onDelete}
                  className={cn("p-1.5 rounded-lg transition-colors", isLight ? "text-gray-400 hover:text-red-500 hover:bg-red-50" : "text-white/30 hover:text-red-400 hover:bg-red-500/10")}
                  data-testid={`button-delete-workspace-${workspace.id}`}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>

            {previewApps.length > 0 ? (
              <div className="flex items-center gap-1.5">
                {previewApps.map(app => (
                  <div key={app.id} className="flex-shrink-0">
                    <AppIcon name={app.name} url={app.url} color={app.color || undefined} size={28} className="rounded-lg" />
                  </div>
                ))}
                {assignedApps.length > 6 && (
                  <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-medium", isLight ? "bg-gray-100 text-gray-500" : "bg-white/5 text-white/40")}>
                    +{assignedApps.length - 6}
                  </div>
                )}
              </div>
            ) : (
              <p className={cn("text-xs", isLight ? "text-gray-400" : "text-white/25")}>
                No apps assigned yet
              </p>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}

interface WorkspaceDashboardProps {
  workspace: ClientWorkspace;
  allApps: ConnectedApp[];
  isLight: boolean;
  onBack: () => void;
  onLaunchApp: (app: ConnectedApp) => void;
  onEdit: () => void;
  onDelete: () => void;
}

function WorkspaceDashboard({ workspace, allApps, isLight, onBack, onLaunchApp, onEdit, onDelete }: WorkspaceDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [managing, setManaging] = useState(false);
  const queryClient = useQueryClient();
  const wsColor = workspace.color || "#6366F1";

  const { data: workspaceApps = [] } = useQuery<{ id: string; workspaceId: string; appId: string }[]>({
    queryKey: [`/api/workspaces/${workspace.id}/apps`],
    queryFn: async () => {
      const res = await fetch(`/api/workspaces/${workspace.id}/apps`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const assignMutation = useMutation({
    mutationFn: async (data: { appIds: string[]; catalogApps?: { name: string; category: string; color: string; url: string }[] }) => {
      const res = await apiRequest("PUT", `/api/workspaces/${workspace.id}/apps`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/workspaces/${workspace.id}/apps`] });
      queryClient.invalidateQueries({ queryKey: ["/api/apps"] });
    },
  });

  const [manageSearch, setManageSearch] = useState("");
  const [manageCategory, setManageCategory] = useState("All");

  const assignedAppIds = new Set(workspaceApps.map(wa => wa.appId));
  const assignedApps = allApps.filter(a => assignedAppIds.has(a.id));

  const assignedAppNames = new Set(allApps.filter(a => assignedAppIds.has(a.id)).map(a => a.name));
  const connectedAppNames = new Set(allApps.map(a => a.name));

  const filteredApps = useMemo(() => {
    if (!searchQuery.trim()) return assignedApps;
    const q = searchQuery.toLowerCase();
    return assignedApps.filter(app =>
      app.name.toLowerCase().includes(q) ||
      (app.category && app.category.toLowerCase().includes(q))
    );
  }, [assignedApps, searchQuery]);

  const filteredCatalogApps = useMemo(() => {
    return APP_CATALOG.filter(app => {
      const matchesSearch = !manageSearch.trim() ||
        app.name.toLowerCase().includes(manageSearch.toLowerCase()) ||
        app.category.toLowerCase().includes(manageSearch.toLowerCase());
      const matchesCategory = manageCategory === "All" || app.category === manageCategory;
      return matchesSearch && matchesCategory;
    });
  }, [manageSearch, manageCategory]);

  const groupedCatalogApps = useMemo(() => {
    if (manageCategory !== "All") return [[manageCategory, filteredCatalogApps]] as [string, typeof APP_CATALOG][];
    const groups: Record<string, typeof APP_CATALOG> = {};
    for (const app of filteredCatalogApps) {
      if (!groups[app.category]) groups[app.category] = [];
      groups[app.category].push(app);
    }
    return Object.entries(groups);
  }, [filteredCatalogApps, manageCategory]);

  const isCatalogAppAssigned = (catAppName: string) => assignedAppNames.has(catAppName);

  const toggleCatalogApp = (catApp: typeof APP_CATALOG[0]) => {
    const existingApp = allApps.find(a => a.name === catApp.name);
    const currentIds = Array.from(assignedAppIds);

    if (existingApp && assignedAppIds.has(existingApp.id)) {
      assignMutation.mutate({
        appIds: currentIds.filter(id => id !== existingApp.id),
      });
    } else if (existingApp) {
      assignMutation.mutate({
        appIds: [...currentIds, existingApp.id],
      });
    } else {
      assignMutation.mutate({
        appIds: currentIds,
        catalogApps: [{ name: catApp.name, category: catApp.category, color: catApp.color, url: catApp.url }],
      });
    }
  };

  return (
    <div className="flex-1 overflow-y-auto scrollbar-none" data-testid={`workspace-dashboard-${workspace.id}`}>
      <div className="px-6 md:px-8 pt-4 pb-3">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={onBack}
            className={cn("p-2 rounded-xl transition-colors", isLight ? "hover:bg-gray-100 text-gray-500" : "hover:bg-white/5 text-white/40")}
            data-testid="button-back-workspaces"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: wsColor + "20" }}
            >
              <Building2 className="w-5 h-5" style={{ color: wsColor }} />
            </div>
            <div className="min-w-0">
              <h2 className={cn("text-lg font-semibold truncate", isLight ? "text-gray-900" : "text-white")} data-testid="text-workspace-name">
                {workspace.name}
              </h2>
              <p className={cn("text-xs", isLight ? "text-gray-400" : "text-white/35")}>
                {assignedApps.length} app{assignedApps.length !== 1 ? "s" : ""} connected
              </p>
            </div>
          </div>
          <button
            onClick={() => setManaging(!managing)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors",
              managing
                ? "bg-[#EF4444] text-white"
                : isLight
                  ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  : "bg-white/5 text-white/50 hover:bg-white/10"
            )}
            data-testid="button-manage-workspace-apps"
          >
            {managing ? <Check className="w-3.5 h-3.5" /> : <Settings className="w-3.5 h-3.5" />}
            {managing ? "Done" : "Manage Apps"}
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {managing ? (
          <motion.div
            key="manage"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="px-6 md:px-8 pb-8"
          >
            <div className="mb-5">
              <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={manageSearch}
                  onChange={(e) => setManageSearch(e.target.value)}
                  placeholder="Search 267 apps..."
                  className={cn("w-full pl-11 pr-4 py-3 rounded-xl text-sm transition-all focus:outline-none focus:border-[#EF4444]/40", isLight ? "bg-black/5 border border-black/10 text-gray-900 placeholder:text-gray-400" : "bg-white/5 border border-white/10 text-white placeholder:text-muted-foreground/60")}
                  data-testid="input-manage-search-apps"
                />
              </div>
              <p className={cn("text-xs mt-3", isLight ? "text-gray-400" : "text-white/35")}>
                {assignedAppIds.size} app{assignedAppIds.size !== 1 ? "s" : ""} selected — tap to toggle
              </p>
            </div>

            <div className="flex gap-2 flex-wrap mb-6">
              {["All", ...BUILTIN_CATEGORIES].map(cat => (
                <button
                  key={cat}
                  onClick={() => setManageCategory(cat)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                    manageCategory === cat
                      ? "bg-[#EF4444] text-white"
                      : isLight
                        ? "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60"
                  )}
                  data-testid={`button-manage-category-${cat}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {groupedCatalogApps.length > 0 ? groupedCatalogApps.map(([category, catApps]) => (
              <div key={category} className="mb-6">
                <h4 className={cn("text-xs font-semibold uppercase tracking-wider mb-3", isLight ? "text-gray-400" : "text-white/30")}>
                  {category}
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {catApps.map(catApp => {
                    const isAssigned = isCatalogAppAssigned(catApp.name);
                    return (
                      <button
                        key={catApp.name}
                        onClick={() => toggleCatalogApp(catApp)}
                        disabled={assignMutation.isPending}
                        className={cn(
                          "flex items-center gap-3 px-3.5 py-3 rounded-xl border text-left transition-all hover:scale-[1.02] disabled:opacity-50",
                          isAssigned
                            ? "border-[#EF4444]/30 bg-[#EF4444]/5"
                            : isLight
                              ? "border-gray-200 bg-gray-50 hover:bg-gray-100 opacity-60 hover:opacity-100"
                              : "border-white/5 bg-white/[0.02] hover:bg-white/5 opacity-50 hover:opacity-100"
                        )}
                        data-testid={`button-toggle-catalog-${workspace.id}-${catApp.name.replace(/\s+/g, '-').toLowerCase()}`}
                      >
                        <AppIcon name={catApp.name} url={catApp.url} color={catApp.color} size={24} className="rounded-lg flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <span className={cn("text-xs font-medium truncate block", isLight ? "text-gray-700" : "text-white/70")}>{catApp.name}</span>
                          <span className={cn("text-[10px] truncate block", isLight ? "text-gray-400" : "text-white/30")}>{catApp.description}</span>
                        </div>
                        {isAssigned && (
                          <Check className="w-3.5 h-3.5 text-[#EF4444] flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )) : (
              <div className="text-center py-8">
                <p className={cn("text-sm", isLight ? "text-gray-400" : "text-white/40")}>
                  No apps match "{manageSearch}"
                </p>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="px-6 md:px-8 pb-8 flex flex-col items-center"
          >
            {assignedApps.length > 0 ? (
              <div className="space-y-8 w-full flex flex-col items-center">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <div className="grid grid-cols-5 gap-x-10 gap-y-10 mx-auto w-fit">
                    {filteredApps.map((app, i) => (
                      <motion.button
                        key={app.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.05 * Math.min(i, 10) }}
                        onClick={() => onLaunchApp(app)}
                        className="flex flex-col items-center gap-1.5 group"
                        data-testid={`button-launch-ws-app-${workspace.id}-${app.id}`}
                      >
                        <div className="relative">
                          <div className="transform group-hover:scale-110 group-active:scale-95 transition-transform duration-150">
                            <AppIcon name={app.name} url={app.url} color={app.color} size={56} notificationCount={app.notificationCount} className="shadow-xl shadow-black/40 rounded-2xl" />
                          </div>
                        </div>
                        <span className={cn("text-sm font-medium truncate w-full text-center max-w-[110px] leading-tight transition-colors duration-300", isLight ? "text-gray-600 group-hover:text-gray-900" : "text-white/70 group-hover:text-white")}>
                          {app.name}
                        </span>
                        <span className={cn("text-[10px] transition-colors duration-300 opacity-0 group-hover:opacity-100", isLight ? "text-gray-400" : "text-white/30")}>
                          Opens in new tab
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.25 }}
                  className="max-w-3xl w-full"
                >
                  <div className="relative">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search workspace apps..."
                      className={cn("w-full pl-14 pr-6 py-4.5 rounded-2xl text-base transition-all focus:outline-none focus:border-[#EF4444]/40", isLight ? "bg-black/5 border border-black/10 text-gray-900 placeholder:text-gray-400 focus:bg-black/[0.07]" : "bg-white/5 border border-white/10 text-white placeholder:text-muted-foreground/60 focus:bg-white/[0.07]")}
                      data-testid="input-search-workspace-apps"
                    />
                  </div>
                </motion.div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn("flex flex-col items-center justify-center py-16 rounded-2xl border border-dashed w-full max-w-lg", isLight ? "border-gray-200" : "border-white/10")}
              >
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-4", isLight ? "bg-gray-100" : "bg-white/5")}>
                  <Plus className={cn("w-6 h-6", isLight ? "text-gray-400" : "text-white/30")} />
                </div>
                <h3 className={cn("text-base font-medium mb-2", isLight ? "text-gray-700" : "text-white/70")}>No apps in this workspace</h3>
                <p className={cn("text-sm mb-5 max-w-xs text-center", isLight ? "text-gray-400" : "text-white/40")}>
                  Add apps to this workspace to create a dedicated environment for your client
                </p>
                <button
                  onClick={() => setManaging(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#EF4444] hover:bg-[#DC2626] text-white text-sm font-medium transition-colors"
                  data-testid="button-add-first-workspace-app"
                >
                  <Plus className="w-4 h-4" />
                  Add Apps
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
