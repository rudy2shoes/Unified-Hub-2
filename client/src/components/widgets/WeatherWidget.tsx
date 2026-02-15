import { useState, useEffect, useCallback } from "react";
import { CloudSun, MapPin, Search, X, Loader2, Droplets, Wind, Thermometer, Eye } from "lucide-react";

interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  isDay: boolean;
}

interface GeoResult {
  name: string;
  admin1?: string;
  country: string;
  latitude: number;
  longitude: number;
}

const WEATHER_DESCRIPTIONS: Record<number, { label: string; emoji: string }> = {
  0: { label: "Clear sky", emoji: "☀️" },
  1: { label: "Mainly clear", emoji: "🌤️" },
  2: { label: "Partly cloudy", emoji: "⛅" },
  3: { label: "Overcast", emoji: "☁️" },
  45: { label: "Foggy", emoji: "🌫️" },
  48: { label: "Icy fog", emoji: "🌫️" },
  51: { label: "Light drizzle", emoji: "🌦️" },
  53: { label: "Drizzle", emoji: "🌦️" },
  55: { label: "Heavy drizzle", emoji: "🌧️" },
  61: { label: "Light rain", emoji: "🌧️" },
  63: { label: "Rain", emoji: "🌧️" },
  65: { label: "Heavy rain", emoji: "🌧️" },
  71: { label: "Light snow", emoji: "🌨️" },
  73: { label: "Snow", emoji: "❄️" },
  75: { label: "Heavy snow", emoji: "❄️" },
  80: { label: "Rain showers", emoji: "🌦️" },
  81: { label: "Moderate showers", emoji: "🌧️" },
  82: { label: "Heavy showers", emoji: "⛈️" },
  95: { label: "Thunderstorm", emoji: "⛈️" },
  96: { label: "Thunderstorm + hail", emoji: "⛈️" },
  99: { label: "Severe thunderstorm", emoji: "⛈️" },
};

function getWeatherInfo(code: number) {
  return WEATHER_DESCRIPTIONS[code] || { label: "Unknown", emoji: "🌤️" };
}

const STORAGE_KEY = "hub_weather_city";

function loadSavedCity(): { name: string; lat: number; lon: number } | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return null;
}

export function WeatherWidget() {
  const [city, setCity] = useState(() => {
    const saved = loadSavedCity();
    return saved ? saved.name : "New York";
  });
  const [coords, setCoords] = useState(() => {
    const saved = loadSavedCity();
    return saved ? { lat: saved.lat, lon: saved.lon } : { lat: 40.7128, lon: -74.006 };
  });
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GeoResult[]>([]);
  const [searching, setSearching] = useState(false);

  const fetchWeather = useCallback(async (lat: number, lon: number) => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,is_day&temperature_unit=fahrenheit&wind_speed_unit=mph`
      );
      const data = await res.json();
      if (data.current) {
        setWeather({
          temperature: Math.round(data.current.temperature_2m),
          feelsLike: Math.round(data.current.apparent_temperature),
          humidity: data.current.relative_humidity_2m,
          windSpeed: Math.round(data.current.wind_speed_10m),
          weatherCode: data.current.weather_code,
          isDay: data.current.is_day === 1,
        });
      }
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchWeather(coords.lat, coords.lon);
    const interval = setInterval(() => fetchWeather(coords.lat, coords.lon), 600000);
    return () => clearInterval(interval);
  }, [coords, fetchWeather]);

  const searchCities = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`
      );
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch {
      setSearchResults([]);
    }
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
    setCity(displayName);
    setCoords({ lat: result.latitude, lon: result.longitude });
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ name: displayName, lat: result.latitude, lon: result.longitude }));
    setEditing(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  const weatherInfo = weather ? getWeatherInfo(weather.weatherCode) : null;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-sky-500/10 flex items-center justify-center">
            <CloudSun className="h-4 w-4 text-sky-400" />
          </div>
          <h3 className="text-sm font-medium text-white">Weather</h3>
        </div>
        <button
          onClick={() => { setEditing(!editing); setSearchQuery(""); setSearchResults([]); }}
          className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
          data-testid="button-weather-edit"
        >
          {editing ? <X className="h-3.5 w-3.5" /> : <MapPin className="h-3.5 w-3.5" />}
        </button>
      </div>

      {editing ? (
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search for a city..."
              autoFocus
              className="w-full pl-8 pr-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-[#EF4444]/50"
              data-testid="input-weather-city"
            />
            {searching && <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 animate-spin text-muted-foreground" />}
          </div>
          {searchResults.length > 0 && (
            <div className="space-y-0.5 max-h-[160px] overflow-y-auto">
              {searchResults.map((r, i) => (
                <button
                  key={`${r.name}-${r.latitude}-${i}`}
                  onClick={() => selectCity(r)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 text-left transition-colors"
                  data-testid={`button-city-${i}`}
                >
                  <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm text-white truncate">
                    {r.name}{r.admin1 ? `, ${r.admin1}` : ""}, {r.country}
                  </span>
                </button>
              ))}
            </div>
          )}
          {searchQuery.length >= 2 && !searching && searchResults.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-2">No cities found</p>
          )}
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-sky-400" />
        </div>
      ) : weather && weatherInfo ? (
        <div>
          <div className="flex items-center gap-1 mb-3">
            <MapPin className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground truncate" data-testid="text-weather-city">{city}</span>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl" data-testid="text-weather-emoji">{weatherInfo.emoji}</span>
              <div>
                <div className="text-3xl font-bold text-white font-display" data-testid="text-weather-temp">{weather.temperature}°F</div>
                <div className="text-xs text-muted-foreground" data-testid="text-weather-desc">{weatherInfo.label}</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-white/[0.03]">
              <Thermometer className="h-3.5 w-3.5 text-orange-400" />
              <span className="text-[11px] text-muted-foreground">Feels like</span>
              <span className="text-xs font-medium text-white">{weather.feelsLike}°F</span>
            </div>
            <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-white/[0.03]">
              <Droplets className="h-3.5 w-3.5 text-blue-400" />
              <span className="text-[11px] text-muted-foreground">Humidity</span>
              <span className="text-xs font-medium text-white">{weather.humidity}%</span>
            </div>
            <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-white/[0.03]">
              <Wind className="h-3.5 w-3.5 text-teal-400" />
              <span className="text-[11px] text-muted-foreground">Wind</span>
              <span className="text-xs font-medium text-white">{weather.windSpeed} mph</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-6 text-center">
          <CloudSun className="h-8 w-8 text-muted-foreground/20 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">Unable to load weather</p>
          <button
            onClick={() => fetchWeather(coords.lat, coords.lon)}
            className="text-xs text-[#EF4444] mt-2 hover:underline"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
}
