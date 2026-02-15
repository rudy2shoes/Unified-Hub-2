import { Bell, Settings, LogOut, MapPin, Search, X, Loader2, LayoutGrid, Clock, Sun, Moon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useState, useEffect, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import type { User } from "@shared/schema";
import { SettingsDialog } from "@/components/SettingsDialog";

const WEATHER_EMOJIS: Record<number, string> = {
  0: "☀️", 1: "🌤️", 2: "⛅", 3: "☁️", 45: "🌫️", 48: "🌫️",
  51: "🌦️", 53: "🌦️", 55: "🌧️", 61: "🌧️", 63: "🌧️", 65: "🌧️",
  71: "🌨️", 73: "❄️", 75: "❄️", 80: "🌦️", 81: "🌧️", 82: "⛈️",
  95: "⛈️", 96: "⛈️", 99: "⛈️",
};

const WEATHER_STORAGE_KEY = "hub_weather_city";

interface GeoResult {
  name: string;
  admin1?: string;
  country: string;
  latitude: number;
  longitude: number;
}

interface TopBarProps {
  user: User;
  theme?: string;
  compact?: boolean;
  transparent?: boolean;
}

export function TopBar({ user, theme = "dark", compact = false, transparent = false }: TopBarProps) {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [now, setNow] = useState(new Date());
  const [weatherTemp, setWeatherTemp] = useState<number | null>(null);
  const [weatherCode, setWeatherCode] = useState<number>(0);
  const [weatherCity, setWeatherCity] = useState("New York");
  const [editing, setEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GeoResult[]>([]);
  const [searching, setSearching] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(() => localStorage.getItem("hub_theme") || "dark");

  const toggleTheme = () => {
    const next = currentTheme === "dark" ? "light" : "dark";
    setCurrentTheme(next);
    localStorage.setItem("hub_theme", next);
    window.dispatchEvent(new Event("hub-theme-changed"));
  };

  const isLight = theme === "light";

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
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
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&temperature_unit=fahrenheit`
      );
      const data = await res.json();
      if (data.current) {
        setWeatherTemp(Math.round(data.current.temperature_2m));
        setWeatherCode(data.current.weather_code);
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

  const timeStr = now.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  const seconds = now.getSeconds();
  const weatherEmoji = WEATHER_EMOJIS[weatherCode] || "🌤️";

  const handleLogout = async () => {
    await apiRequest("POST", "/api/auth/logout");
    queryClient.clear();
    setLocation("/");
  };

  const initials = `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase();

  return (
    <div className={cn("flex items-center justify-between px-8 z-40 transition-all duration-300", compact ? "h-10 pt-1.5 pb-0.5" : "h-16 pt-3 pb-1.5", isLight && "text-black")}>
      {!compact && (
        <div className="flex flex-col justify-center">
          <h2 className={cn("text-xl font-display font-semibold tracking-tight transition-colors duration-300", isLight ? "text-gray-900" : "text-white")}>
            Good {getGreeting()}, {user.firstName}
          </h2>
          <div className={cn("flex items-center gap-2 text-xs font-medium transition-colors duration-300", isLight ? "text-gray-400" : "text-white/30")}>
            <span>Here's what's happening in your workspace today.</span>
          </div>
        </div>
      )}


      <div className={cn("flex items-center gap-5", compact && "ml-auto")}>
        <div className="flex items-center gap-4 mr-2 relative" ref={dropdownRef}>
          <motion.div
            className={cn("flex items-center gap-1.5 font-display transition-colors duration-300", isLight ? "text-gray-900" : "text-white")}
            data-testid="text-topbar-time"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <span className="text-sm font-semibold tracking-wide">{timeStr}</span>
            <motion.span
              className={cn("text-[10px] font-mono", isLight ? "text-gray-400" : "text-white/30")}
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              :{seconds.toString().padStart(2, "0")}
            </motion.span>
          </motion.div>

          {weatherTemp !== null && (
            <>
              <span className={cn("text-sm", isLight ? "text-gray-300" : "text-white/15")}>·</span>
              <motion.button
                onClick={() => { setEditing(!editing); setSearchQuery(""); setSearchResults([]); }}
                className={cn("flex items-center gap-1.5 hover:text-[#EF4444] transition-colors cursor-pointer group", isLight ? "text-gray-900" : "text-white")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                data-testid="button-weather-edit"
              >
                <span className="text-sm">{weatherEmoji}</span>
                <span className="text-sm font-semibold font-display">{weatherTemp}°</span>
                <span className={cn("text-[10px] hidden md:inline", isLight ? "text-gray-400 group-hover:text-gray-600" : "text-white/40 group-hover:text-white/60")}>{weatherCity.split(",")[0]}</span>
              </motion.button>
            </>
          )}

          <AnimatePresence>
            {editing && (
              <motion.div
                initial={{ opacity: 0, y: -5, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -5, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className={cn("absolute top-full right-0 mt-2 w-64 rounded-xl shadow-2xl overflow-hidden z-50", isLight ? "bg-white border border-black/10 shadow-black/10" : "bg-[#1a1a1a] border border-white/10 shadow-black/60")}
              >
                <div className="p-3">
                  <div className="relative">
                    <Search className={cn("absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5", isLight ? "text-black/30" : "text-white/30")} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Search city..."
                      autoFocus
                      className={cn("w-full pl-8 pr-8 py-2 rounded-lg text-sm focus:outline-none focus:border-[#EF4444]/50", isLight ? "bg-black/5 border border-black/10 text-black placeholder:text-black/30" : "bg-white/5 border border-white/10 text-white placeholder:text-white/30")}
                      data-testid="input-topbar-city"
                    />
                    {searching && <Loader2 className={cn("absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 animate-spin", isLight ? "text-black/30" : "text-white/30")} />}
                    {!searching && searchQuery && (
                      <button onClick={() => { setSearchQuery(""); setSearchResults([]); }} className="absolute right-2.5 top-1/2 -translate-y-1/2">
                        <X className={cn("h-3.5 w-3.5", isLight ? "text-black/30 hover:text-black" : "text-white/30 hover:text-white")} />
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
                        className={cn("w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors", isLight ? "hover:bg-black/5" : "hover:bg-white/10")}
                        data-testid={`button-topbar-city-${i}`}
                      >
                        <MapPin className="h-3 w-3 text-[#EF4444] flex-shrink-0" />
                        <span className={cn("text-sm truncate", isLight ? "text-black" : "text-white")}>
                          {r.name}{r.admin1 ? `, ${r.admin1}` : ""}, {r.country}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                {searchQuery.length >= 2 && !searching && searchResults.length === 0 && (
                  <p className={cn("text-xs text-center pb-3", isLight ? "text-black/30" : "text-white/30")}>No cities found</p>
                )}
                {searchQuery.length < 2 && (
                  <div className={cn("px-3 pb-3 flex items-center gap-2", isLight ? "text-black/30" : "text-white/30")}>
                    <MapPin className="h-3 w-3" />
                    <span className="text-xs">{weatherCity}</span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className={cn("flex items-center gap-2 backdrop-blur-md p-1.5 rounded-full border transition-colors duration-300", transparent ? "bg-black/30 border-white/10" : isLight ? "bg-black/[0.04] border-black/10" : "bg-[#111111]/50 border-white/5")}>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn("w-9 h-9 rounded-full flex items-center justify-center transition-colors", isLight ? "text-gray-400 hover:text-gray-900 hover:bg-black/5" : "text-white/30 hover:text-white hover:bg-white/5")}
          >
            <Bell className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className={cn("w-9 h-9 rounded-full flex items-center justify-center transition-colors", isLight ? "text-amber-400 hover:text-amber-500 hover:bg-black/5" : "text-white/30 hover:text-white hover:bg-white/5")}
            data-testid="button-theme-toggle"
          >
            {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSettingsOpen(true)}
            className={cn("w-9 h-9 rounded-full flex items-center justify-center transition-colors", isLight ? "text-gray-400 hover:text-gray-900 hover:bg-black/5" : "text-white/30 hover:text-white hover:bg-white/5")}
            data-testid="button-settings"
          >
            <Settings className="w-4 h-4" />
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className={cn("w-9 h-9 rounded-full flex items-center justify-center transition-colors", isLight ? "text-gray-400 hover:text-red-400 hover:bg-black/5" : "text-white/30 hover:text-red-400 hover:bg-white/5")}
            data-testid="button-logout"
          >
            <LogOut className="w-4 h-4" />
          </motion.button>
        </div>

        <div className="flex items-center gap-3 pl-2">
          <div className="text-right hidden md:block">
            <p className={cn("text-sm font-medium leading-none mb-1 transition-colors duration-300", isLight ? "text-gray-900" : "text-white")}>{user.firstName} {user.lastName}</p>
            <p className="text-[10px] font-medium text-[#EF4444] uppercase tracking-wider">Pro Member</p>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} className="cursor-pointer relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#EF4444] to-red-600 rounded-full blur opacity-40" />
            <Avatar className="h-10 w-10 border-2 border-[#111111] relative">
              <AvatarFallback className="bg-[#EF4444]/20 text-[#EF4444] font-bold">{initials}</AvatarFallback>
            </Avatar>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#111111] rounded-full" />
          </motion.div>
        </div>
      </div>
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Morning";
  if (hour < 17) return "Afternoon";
  return "Evening";
}
