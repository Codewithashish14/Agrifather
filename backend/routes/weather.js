const express = require('express');
const axios = require('axios');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

const STATE_COORDS = {
  'Bihar': { lat: 25.5941, lon: 85.1376 }, 'Uttar Pradesh': { lat: 26.8467, lon: 80.9462 },
  'Punjab': { lat: 30.9010, lon: 75.8573 }, 'Haryana': { lat: 30.7333, lon: 76.7794 },
  'Rajasthan': { lat: 26.9124, lon: 75.7873 }, 'Maharashtra': { lat: 19.0760, lon: 72.8777 },
  'Madhya Pradesh': { lat: 23.2599, lon: 77.4126 }, 'Gujarat': { lat: 23.0225, lon: 72.5714 },
  'Karnataka': { lat: 12.9716, lon: 77.5946 }, 'Tamil Nadu': { lat: 13.0827, lon: 80.2707 },
  'Andhra Pradesh': { lat: 15.9129, lon: 79.7400 }, 'West Bengal': { lat: 22.5726, lon: 88.3639 },
  'Odisha': { lat: 20.9517, lon: 85.0985 }, 'Telangana': { lat: 17.3850, lon: 78.4867 },
  'Jharkhand': { lat: 23.3441, lon: 85.3096 }, 'Chhattisgarh': { lat: 21.2514, lon: 81.6296 },
  'Assam': { lat: 26.2006, lon: 92.9376 }, 'Kerala': { lat: 8.5241, lon: 76.9366 },
  'Delhi': { lat: 28.6139, lon: 77.2090 }, 'Uttarakhand': { lat: 30.0668, lon: 79.0193 },
};

const WX_DESC = { 0:'Clear sky',1:'Mainly clear',2:'Partly cloudy',3:'Overcast',45:'Foggy',51:'Light drizzle',53:'Drizzle',55:'Heavy drizzle',61:'Light rain',63:'Moderate rain',65:'Heavy rain',80:'Showers',81:'Heavy showers',95:'Thunderstorm',99:'Severe thunderstorm' };

router.get('/', authenticate, async (req, res) => {
  try {
    let { lat, lon } = req.query;
    if (!lat || !lon) {
      const coords = STATE_COORDS[req.user.state] || STATE_COORDS['Uttar Pradesh'];
      lat = coords.lat; lon = coords.lon;
    }
    const { data } = await axios.get('https://api.open-meteo.com/v1/forecast', { params: {
      latitude: lat, longitude: lon, timezone: 'Asia/Kolkata', forecast_days: 7,
      current: 'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,uv_index',
      daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,sunrise,sunset,uv_index_max'
    }});

    const c = data.current;
    const advice = [];
    if (c.precipitation > 5) advice.push({ icon:'🌧️', type:'warning', text:'Heavy rain — avoid spraying. Check field drainage.' });
    if (c.temperature_2m > 38) advice.push({ icon:'☀️', type:'warning', text:'Very high temperature! Water crops in early morning or evening. Protect livestock.' });
    if (c.temperature_2m < 10) advice.push({ icon:'🥶', type:'warning', text:'Cold temperature alert! Protect sensitive crops from frost. Use mulching.' });
    if (c.wind_speed_10m > 30) advice.push({ icon:'💨', type:'warning', text:'Strong winds! Avoid spraying. Support tall crops like sugarcane and maize.' });
    if (c.relative_humidity_2m > 85) advice.push({ icon:'💧', type:'warning', text:'High humidity — watch for fungal diseases. Ensure good air circulation.' });
    if (!advice.length) advice.push({ icon:'🌾', type:'success', text:'Good weather for farming today! Normal field activities can proceed.' });

    res.json({
      location: `${req.user.district || ''} ${req.user.state || 'India'}`.trim(),
      current: { temperature: c.temperature_2m, feelsLike: c.apparent_temperature, humidity: c.relative_humidity_2m, precipitation: c.precipitation, windSpeed: c.wind_speed_10m, uvIndex: c.uv_index, weatherCode: c.weather_code, weatherDescription: WX_DESC[c.weather_code] || 'Unknown' },
      forecast: data.daily.time.map((date,i) => ({ date, weatherCode: data.daily.weather_code[i], description: WX_DESC[data.daily.weather_code[i]] || 'Unknown', maxTemp: data.daily.temperature_2m_max[i], minTemp: data.daily.temperature_2m_min[i], precipitation: data.daily.precipitation_sum[i], precipitationProb: data.daily.precipitation_probability_max[i], windSpeed: data.daily.wind_speed_10m_max[i], sunrise: data.daily.sunrise[i], sunset: data.daily.sunset[i], uvIndex: data.daily.uv_index_max[i] })),
      farmingAdvice: advice
    });
  } catch (err) { console.error('Weather error:', err.message); res.status(500).json({ error: 'Failed to fetch weather.' }); }
});

module.exports = router;
