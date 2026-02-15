import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Search, X, Loader2, Star, Pencil, Plus, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppIcon } from "@/components/AppIcon";
import { apiRequest } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ConnectedApp } from "@shared/schema";

const WEATHER_CODES: Record<number, { label: string; emoji: string }> = {
  0: { label: "Clear", emoji: "☀️" },
  1: { label: "Partly Cloudy", emoji: "🌤️" },
  2: { label: "Partly Cloudy", emoji: "⛅" },
  3: { label: "Partly Cloudy", emoji: "☁️" },
  45: { label: "Foggy", emoji: "🌫️" },
  48: { label: "Foggy", emoji: "🌫️" },
  51: { label: "Drizzle", emoji: "🌦️" },
  53: { label: "Drizzle", emoji: "🌦️" },
  55: { label: "Drizzle", emoji: "🌧️" },
  61: { label: "Rain", emoji: "🌧️" },
  63: { label: "Rain", emoji: "🌧️" },
  65: { label: "Rain", emoji: "🌧️" },
  71: { label: "Snow", emoji: "🌨️" },
  73: { label: "Snow", emoji: "❄️" },
  75: { label: "Snow", emoji: "❄️" },
  80: { label: "Showers", emoji: "🌦️" },
  81: { label: "Showers", emoji: "🌧️" },
  82: { label: "Showers", emoji: "⛈️" },
  95: { label: "Thunderstorm", emoji: "⛈️" },
  96: { label: "Thunderstorm", emoji: "⛈️" },
  99: { label: "Thunderstorm", emoji: "⛈️" },
};

const WEATHER_STORAGE_KEY = "hub_weather_city";

interface GeoResult {
  name: string;
  admin1?: string;
  country: string;
  latitude: number;
  longitude: number;
}

interface FocusViewProps {
  apps?: ConnectedApp[];
  onLaunchApp?: (app: ConnectedApp) => void;
}

export function FocusView({ apps = [], onLaunchApp }: FocusViewProps) {
  const [now, setNow] = useState(new Date());
  const [weather, setWeather] = useState<{ temp: number; code: number } | null>(null);
  const [weatherCity, setWeatherCity] = useState("New York");
  const [editing, setEditing] = useState(false);
  const [editingFavs, setEditingFavs] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GeoResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [bgImage, setBgImage] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState(() => localStorage.getItem("hub_theme") || "dark");
  const queryClient = useQueryClient();

  const toggleFavorite = useMutation({
    mutationFn: async ({ id, isFavorite }: { id: string; isFavorite: boolean }) => {
      const res = await apiRequest("PATCH", `/api/apps/${id}`, { isFavorite });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/apps"] });
    },
  });

  useEffect(() => {
    const handler = () => setTheme(localStorage.getItem("hub_theme") || "dark");
    window.addEventListener("hub-theme-changed", handler);
    return () => window.removeEventListener("hub-theme-changed", handler);
  }, []);

  const isLight = theme === "light" && !bgImage;
  const favoriteApps = apps.filter(app => app.isFavorite);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setBgImage(localStorage.getItem("hub_focus_bg"));
    const handler = () => setBgImage(localStorage.getItem("hub_focus_bg"));
    window.addEventListener("focus-bg-changed", handler);
    return () => window.removeEventListener("focus-bg-changed", handler);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setEditing(false);
        setSearchQuery("");
        setSearchResults([]);
      }
    }
    if (editing) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [editing]);

  const fetchWeather = useCallback(async (lat: number, lon: number) => {
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&temperature_unit=fahrenheit&timezone=auto`
      );
      const data = await res.json();
      if (data.current) {
        setWeather({
          temp: Math.round(data.current.temperature_2m),
          code: data.current.weather_code,
        });
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(WEATHER_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setWeatherCity(parsed.name);
        fetchWeather(parsed.lat, parsed.lon);
      } else {
        fetchWeather(40.7128, -74.006);
      }
    } catch {
      fetchWeather(40.7128, -74.006);
    }
  }, [fetchWeather]);

  const searchCities = useCallback(async (query: string) => {
    if (query.length < 2) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`
      );
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch { setSearchResults([]); }
    setSearching(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => searchCities(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery, searchCities]);

  const selectCity = (result: GeoResult) => {
    const displayName = result.admin1
      ? `${result.name}, ${result.admin1}`
      : `${result.name}, ${result.country}`;
    setWeatherCity(displayName);
    fetchWeather(result.latitude, result.longitude);
    localStorage.setItem(WEATHER_STORAGE_KEY, JSON.stringify({ name: displayName, lat: result.latitude, lon: result.longitude }));
    setEditing(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  const hours = now.getHours();
  const ampm = hours >= 12 ? "PM" : "AM";
  const h12 = hours % 12 || 12;
  const timeStr = `${h12}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const weatherInfo = weather ? WEATHER_CODES[weather.code] || { label: "Clear", emoji: "☀️" } : null;

  return (
    <div
      className="flex-1 w-full h-full flex flex-col items-center justify-center gap-10 px-6 relative min-h-0"
      style={bgImage ? { backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
      data-testid="focus-view"
    >
      {bgImage && <div className="absolute inset-0 bg-black/60" />}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center gap-3 relative z-10"
      >
        <div className="flex items-baseline gap-3" data-testid="text-focus-clock">
          <span className={cn("text-7xl md:text-8xl font-light tracking-tight font-display transition-colors duration-300", isLight ? "text-gray-900" : "text-white")}>
            {timeStr}
          </span>
          <span className={cn("text-2xl md:text-3xl font-light transition-colors duration-300", isLight ? "text-gray-400" : "text-white/40")}>
            {ampm}
          </span>
        </div>
        <p className={cn("text-lg font-light tracking-wide transition-colors duration-300", isLight ? "text-gray-400" : "text-white/40")} data-testid="text-focus-date">
          {dateStr}
        </p>
      </motion.div>

      {weather && weatherInfo && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="relative z-10"
          ref={dropdownRef}
        >
          <motion.button
            onClick={() => { setEditing(!editing); setSearchQuery(""); setSearchResults([]); }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className={cn("flex items-center gap-4 px-6 py-3 rounded-2xl transition-all cursor-pointer", isLight ? "bg-black/[0.04] border border-black/[0.06] hover:border-black/10 hover:bg-black/[0.06]" : "bg-white/[0.04] border border-white/[0.06] hover:border-white/10 hover:bg-white/[0.06]")}
            data-testid="button-focus-weather"
          >
            <span className="text-3xl">{weatherInfo.emoji}</span>
            <div className="flex items-center gap-3">
              <span className={cn("text-2xl font-light transition-colors duration-300", isLight ? "text-gray-900" : "text-white")}>{weather.temp}°F</span>
              <span className={cn("text-sm transition-colors duration-300", isLight ? "text-gray-400" : "text-white/40")}>{weatherInfo.label}</span>
            </div>
            <div className={cn("flex items-center gap-1.5 ml-2 transition-colors duration-300", isLight ? "text-gray-300" : "text-white/25")}>
              <MapPin className="w-3 h-3" />
              <span className="text-xs">{weatherCity.split(",")[0]}</span>
            </div>
          </motion.button>

          <AnimatePresence>
            {editing && (
              <motion.div
                initial={{ opacity: 0, y: -5, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -5, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-72 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl shadow-black/60 overflow-hidden z-50"
              >
                <div className="p-3">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Search city..."
                      autoFocus
                      className="w-full pl-8 pr-8 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#EF4444]/50"
                      data-testid="input-focus-city"
                    />
                    {searching && <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 animate-spin text-white/30" />}
                    {!searching && searchQuery && (
                      <button onClick={() => { setSearchQuery(""); setSearchResults([]); }} className="absolute right-2.5 top-1/2 -translate-y-1/2">
                        <X className="h-3.5 w-3.5 text-white/30 hover:text-white" />
                      </button>
                    )}
                  </div>
                </div>
                {searchResults.length > 0 && (
                  <div className="px-2 pb-2 max-h-[200px] overflow-y-auto">
                    {searchResults.map((r, i) => (
                      <button
                        key={`${r.name}-${r.latitude}-${i}`}
                        onClick={() => selectCity(r)}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 text-left transition-colors"
                        data-testid={`button-focus-city-${i}`}
                      >
                        <MapPin className="h-3 w-3 text-[#EF4444] flex-shrink-0" />
                        <span className="text-sm text-white truncate">
                          {r.name}{r.admin1 ? `, ${r.admin1}` : ""}, {r.country}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                {searchQuery.length >= 2 && !searching && searchResults.length === 0 && (
                  <p className="text-xs text-white/30 text-center pb-3">No cities found</p>
                )}
                {searchQuery.length < 2 && (
                  <div className="px-3 pb-3 flex items-center gap-2 text-white/30">
                    <MapPin className="h-3 w-3" />
                    <span className="text-xs">{weatherCity}</span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {apps.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col items-center gap-4 mt-4 relative z-10"
        >
          <div className="flex items-center gap-2">
            <Star className={cn("w-3 h-3 transition-colors duration-300", isLight ? "text-gray-400" : "text-white/25")} />
            <h3 className={cn("text-xs uppercase tracking-[0.2em] font-medium transition-colors duration-300", isLight ? "text-gray-400" : "text-white/25")}>Favorite Apps</h3>
            <button
              onClick={() => setEditingFavs(!editingFavs)}
              className={cn("ml-2 p-1 rounded-md transition-colors", editingFavs ? "bg-[#EF4444]/20 text-[#EF4444]" : isLight ? "text-gray-400 hover:text-gray-600 hover:bg-black/5" : "text-white/25 hover:text-white/50 hover:bg-white/5")}
              data-testid="button-edit-favorites"
            >
              {editingFavs ? <Check className="w-3 h-3" /> : <Pencil className="w-3 h-3" />}
            </button>
          </div>

          <AnimatePresence mode="wait">
            {editingFavs ? (
              <motion.div
                key="edit-mode"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex flex-wrap justify-center gap-3"
              >
                {apps.map((app) => (
                  <motion.button
                    key={app.id}
                    onClick={() => toggleFavorite.mutate({ id: app.id, isFavorite: !app.isFavorite })}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all cursor-pointer relative",
                      app.isFavorite
                        ? "bg-[#EF4444]/10 border border-[#EF4444]/30"
                        : isLight
                          ? "bg-black/[0.04] border border-black/[0.06] opacity-50 hover:opacity-80"
                          : "bg-white/[0.02] border border-white/[0.04] opacity-50 hover:opacity-80"
                    )}
                    data-testid={`button-toggle-fav-${app.id}`}
                  >
                    <AppIcon name={app.name} url={app.url} color={app.color || undefined} size={24} className="rounded-md" />
                    <span className={cn("text-sm font-medium transition-colors duration-300", isLight ? "text-gray-600" : "text-white/60")}>{app.name}</span>
                    {app.isFavorite ? (
                      <X className="w-3.5 h-3.5 text-[#EF4444]/60" />
                    ) : (
                      <Plus className="w-3.5 h-3.5 text-white/30" />
                    )}
                  </motion.button>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="view-mode"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex flex-wrap justify-center gap-3"
              >
                {favoriteApps.length > 0 ? favoriteApps.map((app) => (
                  <motion.button
                    key={app.id}
                    onClick={() => onLaunchApp?.(app)}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn("flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors cursor-pointer", isLight ? "bg-black/[0.04] border border-black/[0.06] hover:border-black/10 hover:bg-black/[0.06]" : "bg-white/[0.04] border border-white/[0.06] hover:border-white/10 hover:bg-white/[0.06]")}
                    data-testid={`button-focus-fav-${app.id}`}
                  >
                    <AppIcon name={app.name} url={app.url} color={app.color || undefined} size={24} notificationCount={app.notificationCount} className="rounded-md" />
                    <span className={cn("text-sm font-medium transition-colors duration-300", isLight ? "text-gray-600" : "text-white/60")}>{app.name}</span>
                  </motion.button>
                )) : (
                  <p className={cn("text-sm", isLight ? "text-gray-400" : "text-white/30")}>
                    Tap the pencil to add favorite apps
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
