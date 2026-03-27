import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Cloud, Droplets, Wind, Eye, Thermometer, Sun, AlertTriangle, MapPin, RefreshCw } from 'lucide-react';

const WEATHER_ICONS = {
  0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️',
  45: '🌫️', 48: '🌫️',
  51: '🌦️', 53: '🌦️', 55: '🌧️',
  61: '🌧️', 63: '🌧️', 65: '⛈️',
  71: '🌨️', 73: '❄️', 75: '❄️',
  80: '🌦️', 81: '🌧️', 82: '⛈️',
  95: '⛈️', 96: '⛈️', 99: '🌪️',
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

function formatTime(isoStr) {
  if (!isoStr) return '--';
  const d = new Date(isoStr);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

const ALERT_COLORS = {
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
  success: 'bg-forest-50 border-forest-200 text-forest-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
  danger: 'bg-red-50 border-red-200 text-red-800',
};

export default function WeatherPage() {
  const { user } = useAuth();
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [locating, setLocating] = useState(false);
  const [coords, setCoords] = useState(null);

  useEffect(() => { fetchWeather(); }, [coords]);

  const fetchWeather = async () => {
    setLoading(true); setError(null);
    try {
      const params = coords ? { lat: coords.lat, lon: coords.lon } : {};
      const { data } = await axios.get('/weather', { params });
      setWeather(data);
    } catch {
      setError('Failed to fetch weather. Please try again.');
    } finally { setLoading(false); }
  };

  const detectLocation = () => {
    setLocating(true);
    if (!navigator.geolocation) { setLocating(false); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => { setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }); setLocating(false); },
      () => { setLocating(false); }
    );
  };

  if (loading) return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4 animate-bounce">🌤️</div>
        <p className="text-stone-500 font-devanagari">मौसम जानकारी लोड हो रही है...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="h-full flex items-center justify-center p-4">
      <div className="text-center">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <p className="text-stone-600 mb-4">{error}</p>
        <button onClick={fetchWeather} className="btn-primary">Try Again</button>
      </div>
    </div>
  );

  if (!weather) return null;

  const { current, forecast, farmingAdvice, location } = weather;

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-b from-sky-50 to-stone-50">
      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-display font-bold text-forest-900">Weather Forecast</h1>
            <p className="text-xs text-stone-500 font-devanagari mt-0.5">मौसम पूर्वानुमान</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={detectLocation}
              disabled={locating}
              className="flex items-center gap-1.5 text-xs text-forest-600 hover:text-forest-700 font-medium bg-forest-50 hover:bg-forest-100 px-3 py-2 rounded-xl transition-all border border-forest-200"
            >
              <MapPin size={14} /> {locating ? 'Locating...' : 'My Location'}
            </button>
            <button onClick={fetchWeather} className="p-2 text-stone-500 hover:text-forest-600 hover:bg-forest-50 rounded-xl transition-all border border-stone-200">
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        {/* Current Weather Hero */}
        <div className="bg-gradient-to-br from-sky-500 via-sky-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <MapPin size={14} className="opacity-80" />
                <span className="text-sm opacity-90">{location}</span>
              </div>
              <div className="flex items-end gap-3">
                <span className="text-7xl font-light leading-none">{Math.round(current.temperature)}°</span>
                <div className="pb-2">
                  <p className="text-sm opacity-90">{current.weatherDescription}</p>
                  <p className="text-xs opacity-70">Feels like {Math.round(current.feelsLike)}°C</p>
                </div>
              </div>
            </div>
            <div className="text-7xl">{WEATHER_ICONS[current.weatherCode] || '🌤️'}</div>
          </div>

          <div className="grid grid-cols-4 gap-3 mt-5 pt-4 border-t border-white/20">
            {[
              { icon: <Droplets size={14}/>, label: 'Humidity', value: `${current.humidity}%` },
              { icon: <Wind size={14}/>, label: 'Wind', value: `${current.windSpeed} km/h` },
              { icon: <Sun size={14}/>, label: 'UV Index', value: current.uvIndex },
              { icon: <Thermometer size={14}/>, label: 'Rainfall', value: `${current.precipitation}mm` },
            ].map(({ icon, label, value }) => (
              <div key={label} className="text-center">
                <div className="flex items-center justify-center gap-1 opacity-75 mb-1">{icon}<span className="text-xs">{label}</span></div>
                <p className="font-bold text-sm">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Farming Advice */}
        <div>
          <h2 className="text-base font-semibold text-forest-800 mb-3 flex items-center gap-2">
            🌾 Farming Advice Today
          </h2>
          <div className="grid md:grid-cols-2 gap-3">
            {farmingAdvice.map((advice, i) => (
              <div key={i} className={`flex items-start gap-3 p-4 rounded-xl border ${ALERT_COLORS[advice.type] || ALERT_COLORS.info}`}>
                <span className="text-xl flex-shrink-0">{advice.icon}</span>
                <p className="text-sm font-medium leading-relaxed">{advice.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 7-day Forecast */}
        <div>
          <h2 className="text-base font-semibold text-forest-800 mb-3">7-Day Forecast • 7 दिन का पूर्वानुमान</h2>
          <div className="grid grid-cols-7 gap-2">
            {forecast.map((day, i) => (
              <div key={i} className={`flex flex-col items-center p-2.5 rounded-xl border transition-all ${
                i === 0 ? 'bg-forest-600 border-forest-700 text-white shadow-md' : 'bg-white border-stone-200 text-stone-700 hover:border-forest-300 hover:bg-forest-50'
              }`}>
                <p className={`text-xs font-semibold mb-1 ${i === 0 ? 'text-forest-100' : 'text-stone-500'}`}>
                  {i === 0 ? 'Today' : DAYS[new Date(day.date).getDay()]}
                </p>
                <span className="text-2xl mb-1">{WEATHER_ICONS[day.weatherCode] || '🌤️'}</span>
                <p className="font-bold text-sm">{Math.round(day.maxTemp)}°</p>
                <p className={`text-xs ${i === 0 ? 'text-forest-200' : 'text-stone-400'}`}>{Math.round(day.minTemp)}°</p>
                {day.precipitationProb > 30 && (
                  <div className={`flex items-center gap-0.5 mt-1 text-xs ${i === 0 ? 'text-blue-200' : 'text-blue-500'}`}>
                    <Droplets size={10}/> {day.precipitationProb}%
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Detailed daily forecast */}
        <div>
          <h2 className="text-base font-semibold text-forest-800 mb-3">Detailed Forecast</h2>
          <div className="space-y-2">
            {forecast.slice(1, 7).map((day, i) => (
              <div key={i} className="bg-white border border-stone-200 rounded-xl p-4 flex items-center gap-4">
                <div className="w-20 flex-shrink-0">
                  <p className="text-sm font-semibold text-stone-700">{formatDate(day.date)}</p>
                </div>
                <span className="text-3xl flex-shrink-0">{WEATHER_ICONS[day.weatherCode] || '🌤️'}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-stone-700">{day.description}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-stone-500">
                    <span>💧 {day.precipitationProb}% rain</span>
                    <span>💨 {Math.round(day.windSpeed)} km/h</span>
                    <span>☀️ UV {day.uvIndex}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-stone-800">{Math.round(day.maxTemp)}°C</p>
                  <p className="text-xs text-stone-400">{Math.round(day.minTemp)}°C</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center text-xs text-stone-400 pb-4">
          Weather data from Open-Meteo • Updated hourly • Free & accurate
        </div>
      </div>
    </div>
  );
}
