'use client'

import { useState, useEffect } from 'react'
import WeatherModal from './WeatherModal'

interface WeatherData {
  current: {
    temp: number
    feels_like: number
    humidity: number
    wind_speed: number
    pressure: number
    visibility: number
    uvi?: number
    clouds: number
    weather: Array<{
      main: string
      description: string
      icon: string
    }>
  }
  hourly: Array<{
    dt: number
    temp: number
    wind_speed: number
    pop: number
    weather: Array<{
      icon: string
    }>
  }>
  daily: Array<{
    dt: number
    temp: { min: number; max: number }
    wind_speed: number
    pop: number
    weather: Array<{
      main: string
      description: string
      icon: string
    }>
  }>
  sunrise?: number
  sunset?: number
  city: string
}

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [locationName, setLocationName] = useState('Chargement...')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const API_KEY = 'b0b1197adef0957aeb4381bc06ba4c83'

  // Icônes météo selon code OpenWeather
  const getWeatherEmoji = (iconCode: string) => {
    const code = iconCode.substring(0, 2)
    const emojiMap: { [key: string]: string } = {
      '01': '☀️', // clear sky
      '02': '🌤️', // few clouds
      '03': '⛅', // scattered clouds
      '04': '☁️', // broken clouds
      '09': '🌧️', // shower rain
      '10': '🌦️', // rain
      '11': '⛈️', // thunderstorm
      '13': '❄️', // snow
      '50': '🌫️', // mist
    }
    return emojiMap[code] || '🌤️'
  }

  // Récupérer météo
  const fetchWeather = async (lat: number, lon: number) => {
    try {
      // Météo actuelle (API 2.5 - GRATUITE)
      const currentResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=fr&appid=${API_KEY}`
      )
      
      if (!currentResponse.ok) {
        throw new Error('Erreur API météo actuelle')
      }

      const currentData = await currentResponse.json()
      
      // Prévisions horaires et journalières (API 2.5 - GRATUITE)
      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&lang=fr&appid=${API_KEY}`
      )
      
      if (!forecastResponse.ok) {
        throw new Error('Erreur API prévisions')
      }

      const forecastData = await forecastResponse.json()
      
      // Formater les données horaires (8 périodes de 3h pour les 24h)
      const hourlyFormatted = forecastData.list.slice(0, 8).map((item: any) => ({
        dt: item.dt,
        temp: item.main.temp,
        wind_speed: item.wind.speed,
        pop: item.pop || 0,
        weather: item.weather
      }))
      
      // Formater les prévisions journalières (regrouper par jour)
      const dailyMap = new Map()
      forecastData.list.forEach((item: any) => {
        const date = new Date(item.dt * 1000).toDateString()
        if (!dailyMap.has(date)) {
          dailyMap.set(date, {
            dt: item.dt,
            temps: [item.main.temp],
            wind_speeds: [item.wind.speed],
            pops: [item.pop || 0],
            weather: item.weather[0]
          })
        } else {
          const day = dailyMap.get(date)
          day.temps.push(item.main.temp)
          day.wind_speeds.push(item.wind.speed)
          day.pops.push(item.pop || 0)
        }
      })
      
      const dailyFormatted = Array.from(dailyMap.values()).slice(0, 3).map((day: any) => ({
        dt: day.dt,
        temp: {
          min: Math.min(...day.temps),
          max: Math.max(...day.temps)
        },
        wind_speed: Math.max(...day.wind_speeds),
        pop: Math.max(...day.pops),
        weather: [day.weather]
      }))
      
      // Formater les données pour correspondre à notre structure
      const formattedData: WeatherData = {
        current: {
          temp: currentData.main.temp,
          feels_like: currentData.main.feels_like,
          humidity: currentData.main.humidity,
          wind_speed: currentData.wind.speed,
          pressure: currentData.main.pressure,
          visibility: currentData.visibility,
          uvi: 0, // Non disponible en gratuit
          clouds: currentData.clouds.all,
          weather: currentData.weather
        },
        hourly: hourlyFormatted,
        daily: dailyFormatted,
        sunrise: currentData.sys.sunrise,
        sunset: currentData.sys.sunset,
        city: currentData.name || 'Votre position'
      }
      
      setWeather(formattedData)
      setLocationName(currentData.name)
      
      setLoading(false)
    } catch (err) {
      console.error('Erreur météo:', err)
      setError('Impossible de récupérer la météo')
      setLoading(false)
    }
  }

  // Géolocalisation
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeather(position.coords.latitude, position.coords.longitude)
        },
        (err) => {
          console.error('Erreur géolocalisation:', err)
          setError('Géolocalisation refusée')
          setLoading(false)
        }
      )
    } else {
      setError('Géolocalisation non disponible')
      setLoading(false)
    }
  }, [])

  // Mise à jour toutes les 30 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            fetchWeather(position.coords.latitude, position.coords.longitude)
          }
        )
      }
    }, 30 * 60 * 1000) // 30 minutes

    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="text-2xl">🌤️</div>
          <h3 className="text-lg font-semibold text-gray-900">Météo locale</h3>
        </div>
        <div className="text-center py-8">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm text-gray-500">Récupération position...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="text-2xl">🌤️</div>
          <h3 className="text-lg font-semibold text-gray-900">Météo locale</h3>
        </div>
        <div className="text-center py-4">
          <p className="text-sm text-gray-500 mb-2">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  if (!weather) return null

  const currentWeather = weather.current
  const hourlyForecast = weather.hourly.slice(0, 8)
  const windKmh = Math.round(currentWeather.wind_speed * 3.6)
  
  // Alerte vent pour nacelles
  const getWindStatus = () => {
    if (windKmh >= 60) return { icon: '🚨', text: 'DANGER', color: 'text-red-600' }
    if (windKmh >= 50) return { icon: '⚠️', text: 'ATTENTION', color: 'text-orange-600' }
    return { icon: '✅', text: 'OK', color: 'text-green-600' }
  }
  
  const windStatus = getWindStatus()

  return (
    <>
      <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-500 transition-all col-span-2">
        {/* En-tête */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{getWeatherEmoji(currentWeather.weather[0].icon)}</div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Météo locale</h3>
              <p className="text-sm text-gray-500">📍 {locationName}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900">{Math.round(currentWeather.temp)}°C</div>
            <p className="text-xs text-gray-500">Ressenti {Math.round(currentWeather.feels_like)}°C</p>
          </div>
        </div>

        {/* Alerte vent nacelles */}
        <div className={`mb-4 p-3 rounded-lg ${windKmh >= 60 ? 'bg-red-50' : windKmh >= 50 ? 'bg-orange-50' : 'bg-green-50'}`}>
          <div className="flex items-center gap-2">
            <span className="text-xl">{windStatus.icon}</span>
            <div className="flex-1">
              <p className="text-xs text-gray-600">Vent (nacelles max: 60 km/h)</p>
              <p className={`text-lg font-bold ${windStatus.color}`}>{windKmh} km/h - {windStatus.text}</p>
            </div>
          </div>
        </div>

        {/* Conditions actuelles */}
        <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-gray-200">
          <div>
            <p className="text-xs text-gray-500">Conditions</p>
            <p className="text-sm font-medium text-gray-900 capitalize">
              {currentWeather.weather[0].description}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Humidité</p>
            <p className="text-sm font-medium text-gray-900">{currentWeather.humidity}%</p>
          </div>
        </div>

        {/* Prévisions horaires (aperçu 8h) */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-700 mb-2">Prévisions 8 heures</p>
          <div className="grid grid-cols-8 gap-1">
            {hourlyForecast.map((hour, index) => {
              const time = new Date(hour.dt * 1000)
              return (
                <div key={index} className="text-center">
                  <p className="text-xs text-gray-500 mb-1">
                    {time.getHours()}h
                  </p>
                  <div className="text-lg mb-1">
                    {getWeatherEmoji(hour.weather[0].icon)}
                  </div>
                  <p className="text-xs font-semibold text-gray-900">
                    {Math.round(hour.temp)}°
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Bouton détails complets */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2.5 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
        >
          <span>Voir détails complets</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Dernière mise à jour */}
        <p className="text-xs text-gray-400 mt-3 text-center">
          Mise à jour automatique toutes les 30 min
        </p>
      </div>

      {/* Modal météo détaillée */}
      <WeatherModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        data={weather}
      />
    </>
  )
}