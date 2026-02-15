import { useState, useEffect, useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Upload, Image, Check, Trash2, LayoutGrid, Clock, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BG_KEYS = {
  apps: "hub_apps_bg",
  focus: "hub_focus_bg",
  agency: "hub_agency_bg",
} as const;

const BG_EVENTS = {
  apps: "apps-bg-changed",
  focus: "focus-bg-changed",
  agency: "agency-bg-changed",
} as const;

type ViewTab = "apps" | "focus" | "agency";

const PRESET_BACKGROUNDS = [
  { id: "mountains", label: "Mountains", url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80" },
  { id: "ocean", label: "Ocean", url: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=1920&q=80" },
  { id: "forest", label: "Forest", url: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&q=80" },
  { id: "night-sky", label: "Night Sky", url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920&q=80" },
  { id: "aurora", label: "Aurora", url: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1920&q=80" },
  { id: "city", label: "City", url: "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1920&q=80" },
  { id: "desert", label: "Desert", url: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=1920&q=80" },
  { id: "space", label: "Space", url: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1920&q=80" },
  { id: "abstract", label: "Abstract", url: "https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1920&q=80" },
];

const VIEW_TABS: { id: ViewTab; label: string; icon: typeof LayoutGrid }[] = [
  { id: "apps", label: "Apps", icon: LayoutGrid },
  { id: "focus", label: "Focus", icon: Clock },
  { id: "agency", label: "Agency", icon: Building2 },
];

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const [activeTab, setActiveTab] = useState<ViewTab>("apps");
  const [previews, setPreviews] = useState<Record<ViewTab, string | null>>({ apps: null, focus: null, agency: null });
  const [selectedPresets, setSelectedPresets] = useState<Record<ViewTab, string | null>>({ apps: null, focus: null, agency: null });
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      const newPreviews: Record<ViewTab, string | null> = { apps: null, focus: null, agency: null };
      const newPresets: Record<ViewTab, string | null> = { apps: null, focus: null, agency: null };
      for (const tab of ["apps", "focus", "agency"] as ViewTab[]) {
        const saved = localStorage.getItem(BG_KEYS[tab]);
        newPreviews[tab] = saved;
        const matched = PRESET_BACKGROUNDS.find((p) => p.url === saved);
        newPresets[tab] = matched ? matched.id : null;
      }
      setPreviews(newPreviews);
      setSelectedPresets(newPresets);
    }
  }, [open]);

  const handleFile = useCallback((file: File) => {
    if (!file.type.match(/^image\/(jpeg|png|webp)$/)) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      localStorage.setItem(BG_KEYS[activeTab], result);
      setPreviews((p) => ({ ...p, [activeTab]: result }));
      setSelectedPresets((p) => ({ ...p, [activeTab]: null }));
      window.dispatchEvent(new Event(BG_EVENTS[activeTab]));
    };
    reader.readAsDataURL(file);
  }, [activeTab]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handlePresetSelect = (preset: typeof PRESET_BACKGROUNDS[0]) => {
    localStorage.setItem(BG_KEYS[activeTab], preset.url);
    setPreviews((p) => ({ ...p, [activeTab]: preset.url }));
    setSelectedPresets((p) => ({ ...p, [activeTab]: preset.id }));
    window.dispatchEvent(new Event(BG_EVENTS[activeTab]));
  };

  const handleRemove = () => {
    localStorage.removeItem(BG_KEYS[activeTab]);
    setPreviews((p) => ({ ...p, [activeTab]: null }));
    setSelectedPresets((p) => ({ ...p, [activeTab]: null }));
    window.dispatchEvent(new Event(BG_EVENTS[activeTab]));
  };

  const currentPreview = previews[activeTab];
  const currentPreset = selectedPresets[activeTab];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 bg-[#0f0f0f] border-white/10 overflow-hidden gap-0 [&>button]:hidden rounded-2xl">
        <VisuallyHidden><DialogTitle>Settings</DialogTitle></VisuallyHidden>
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/5">
          <h2 className="text-lg font-display font-semibold text-white">Settings</h2>
          <button
            onClick={() => onOpenChange(false)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
            data-testid="button-settings-close"
          >
            <span className="sr-only">Close</span>
            ✕
          </button>
        </div>

        <div className="px-6 pt-4 pb-2">
          <div className="flex items-center gap-2 mb-4">
            <Image className="w-4 h-4 text-white/50" />
            <h3 className="text-sm font-medium text-white">Background Images</h3>
          </div>
          <div className="inline-flex items-center rounded-full p-1 gap-0.5 border border-white/10 bg-white/[0.05]" data-testid="settings-view-tabs">
            {VIEW_TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200",
                  activeTab === id
                    ? "bg-white/15 text-white shadow-sm"
                    : "text-white/40 hover:text-white/70"
                )}
                data-testid={`settings-tab-${id}`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 pt-3 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="space-y-2">
            <p className="text-xs text-white/40">Presets</p>
            <div className="grid grid-cols-3 gap-2">
              {PRESET_BACKGROUNDS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handlePresetSelect(preset)}
                  className={`relative rounded-xl overflow-hidden h-20 border transition-all ${
                    currentPreset === preset.id
                      ? "border-[#EF4444]"
                      : "border-white/10 hover:border-white/20"
                  }`}
                  data-testid={`preset-bg-${preset.id}`}
                >
                  <img
                    src={preset.url + "&w=400&q=60"}
                    alt={preset.label}
                    className="w-full h-full object-cover"
                  />
                  {currentPreset === preset.id && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <span className="absolute bottom-1 left-0 right-0 text-[10px] text-white/80 text-center drop-shadow">
                    {preset.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-white/40">Custom Upload</p>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                dragOver
                  ? "border-[#EF4444]/50 bg-[#EF4444]/5"
                  : "border-white/10 hover:border-white/20 hover:bg-white/[0.02]"
              }`}
              data-testid={`dropzone-${activeTab}-bg`}
            >
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                <Upload className="w-4 h-4 text-white/40" />
              </div>
              <div className="text-center">
                <p className="text-sm text-white/60">Click to browse or drag & drop</p>
                <p className="text-xs text-white/30 mt-1">JPG, PNG, or WebP</p>
              </div>
            </div>
          </div>

          {currentPreview && !currentPreset && (
            <div className="relative rounded-xl overflow-hidden border border-white/10">
              <img
                src={currentPreview}
                alt="Background preview"
                className="w-full h-32 object-cover"
                data-testid={`img-${activeTab}-bg-preview`}
              />
            </div>
          )}

          <p className="text-xs text-white/25">Max 5MB recommended</p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = "";
            }}
            data-testid={`input-${activeTab}-bg-file`}
          />

          {currentPreview && (
            <button
              onClick={handleRemove}
              className="w-full flex items-center justify-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl py-2.5 text-sm hover:bg-red-500/20 transition-colors"
              data-testid={`button-remove-${activeTab}-bg`}
            >
              <Trash2 className="w-4 h-4" />
              Remove Background
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
