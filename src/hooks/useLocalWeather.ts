import { useState, useEffect } from 'react'

export type WeatherState = 'clear' | 'rain' | 'snow'

const BRIGHTON_FALLBACK = { lat: 50.8225, lon: -0.1372 }

// WMO weather interpretation codes → simplified state
function wmoToState(code: number): WeatherState {
  // Snow: 71-77 (snowfall), 85-86 (snow showers)
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snow'
  // Rain: 51-67 (drizzle/rain), 80-84 (rain showers), 95-99 (thunderstorm)
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 84) || code >= 95) return 'rain'
  return 'clear'
}

export function useLocalWeather(): { weather: WeatherState; loading: boolean } {
  const [weather, setWeather] = useState<WeatherState>('clear')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    function fetchWeather(lat: number, lon: number) {
      fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
      )
        .then((r) => r.json())
        .then((data) => {
          const code: number = data?.current_weather?.weathercode ?? 0
          setWeather(wmoToState(code))
        })
        .catch(() => setWeather('clear'))
        .finally(() => setLoading(false))
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
      ()    => fetchWeather(BRIGHTON_FALLBACK.lat, BRIGHTON_FALLBACK.lon),
      { timeout: 5000 }
    )
  }, [])

  return { weather, loading }
}
