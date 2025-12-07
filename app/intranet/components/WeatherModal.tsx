'use client'

import { useEffect } from 'react'

interface DetailedWeatherData {
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

interface WeatherModalProps {
  isOpen: boolean
  onClose: () => void
  data: DetailedWeatherData | null
}

export default function WeatherModal({ isOpen, onClose, data }: WeatherModalProps) {
  const getWeatherEmoji = (iconCode: string) => {
    const code = iconCode.substring(0, 2)
    const emojiMap: { [key: string]: string } = {
      '01': '☀️',
      '02': '🌤️',
      '03': '⛅',
      '04': '☁️',
      '09': '🌧️',
      '10': '🌦️',
      '11': '⛈️',
      '13': '❄️',
      '50': '🌫️',
    }
    return emojiMap[code] || '🌤️'
  }

  const getWindAlert = (windSpeed: number) => {
    const windKmh = Math.round(windSpeed * 3.6)
    if (windKmh >= 60) {
      return {
        level: 'danger',
        message: '🚨 ALERTE SÉCURITÉ NACELLES',
        detail: 'Vent trop fort - Interdiction d\'utiliser les nacelles',
        color: 'bg-red-100 border-red-500 text-red-900'
      }
    } else if (windKmh >= 50) {
      return {
        level: 'warning',
        message: '⚠️ ATTENTION VENT FORT',
        detail: 'Limite nacelles proche (max 60 km/h)',
        color: 'bg-orange-100 border-orange-500 text-orange-900'
      }
    } else {
      return {
        level: 'safe',
        message: '✅ CONDITIONS VENT OK',
        detail: 'Utilisation nacelles autorisée',
        color: 'bg-green-100 border-green-500 text-green-900'
      }
    }
  }

  const getDayName = (timestamp: number) => {
    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
    const date = new Date(timestamp * 1000)
    return days[date.getDay()]
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000)
    return `${date.getDate()} ${['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'][date.getMonth()]}`
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000)
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  }

  // Fermer avec Échap
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEsc)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen || !data) return null

  const windAlert = getWindAlert(data.current.wind_speed)
  const windKmh = Math.round(data.current.wind_speed * 3.6)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-3">
              🌤️ Météo Détaillée
            </h2>
            <p className="text-blue-100 mt-1">📍 {data.city}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-2 transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
          {/* Conditions actuelles */}
          <div className="grid grid-cols-3 gap-6 mb-6">
            {/* Température principale */}
            <div className="col-span-1 bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
              <div className="text-center">
                <div className="text-6xl mb-2">{getWeatherEmoji(data.current.weather[0].icon)}</div>
                <div className="text-5xl font-bold text-gray-900 mb-2">{Math.round(data.current.temp)}°C</div>
                <p className="text-sm text-gray-600 capitalize">{data.current.weather[0].description}</p>
                <p className="text-xs text-gray-500 mt-1">Ressenti {Math.round(data.current.feels_like)}°C</p>
              </div>
            </div>

            {/* Alerte vent nacelles */}
            <div className={`col-span-2 p-6 rounded-xl border-2 ${windAlert.color}`}>
              <div className="flex items-start gap-4">
                <div className="text-4xl">{windAlert.level === 'danger' ? '🚨' : windAlert.level === 'warning' ? '⚠️' : '✅'}</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-1">{windAlert.message}</h3>
                  <p className="text-lg font-semibold mb-2">Vent actuel : {windKmh} km/h</p>
                  <p className="text-sm">{windAlert.detail}</p>
                  {windAlert.level !== 'danger' && (
                    <p className="text-xs mt-2 opacity-75">Limite sécurité : 60 km/h maximum</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Détails météo */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">💧</span>
                <span className="text-xs text-gray-500">Humidité</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{data.current.humidity}%</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">👁️</span>
                <span className="text-xs text-gray-500">Visibilité</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{(data.current.visibility / 1000).toFixed(1)} km</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🔆</span>
                <span className="text-xs text-gray-500">Indice UV</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{data.current.uvi || 'N/A'}</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">☁️</span>
                <span className="text-xs text-gray-500">Nuages</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{data.current.clouds}%</p>
            </div>
          </div>

          {/* Lever/Coucher soleil */}
          {data.sunrise && data.sunset && (
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-4 rounded-xl border border-orange-200 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🌅</span>
                  <div>
                    <p className="text-xs text-gray-600">Lever du soleil</p>
                    <p className="text-xl font-bold text-gray-900">{formatTime(data.sunrise)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🌇</span>
                  <div>
                    <p className="text-xs text-gray-600">Coucher du soleil</p>
                    <p className="text-xl font-bold text-gray-900">{formatTime(data.sunset)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Prévisions horaires (24h) */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              📊 Prévisions 24 heures
            </h3>
            <div className="bg-white p-4 rounded-xl border border-gray-200 overflow-x-auto">
              <div className="flex gap-4 min-w-max">
                {data.hourly.slice(0, 24).map((hour, index) => {
                  const hourWindKmh = Math.round(hour.wind_speed * 3.6)
                  const isDanger = hourWindKmh >= 60
                  const isWarning = hourWindKmh >= 50 && hourWindKmh < 60
                  
                  return (
                    <div 
                      key={index} 
                      className={`text-center p-3 rounded-lg ${isDanger ? 'bg-red-50 border border-red-300' : isWarning ? 'bg-orange-50 border border-orange-300' : 'bg-gray-50'}`}
                    >
                      <p className="text-xs text-gray-500 mb-1 font-semibold">
                        {new Date(hour.dt * 1000).getHours()}h
                      </p>
                      <div className="text-2xl mb-1">{getWeatherEmoji(hour.weather[0].icon)}</div>
                      <p className="text-sm font-bold text-gray-900 mb-1">{Math.round(hour.temp)}°</p>
                      <p className="text-xs text-gray-600 mb-1">💨 {hourWindKmh}km/h</p>
                      {hour.pop > 0 && (
                        <p className="text-xs text-blue-600">☔ {Math.round(hour.pop * 100)}%</p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              🔴 Rouge : Vent dangereux (≥60 km/h) | 🟠 Orange : Attention (50-59 km/h)
            </p>
          </div>

          {/* Prévisions 3 jours */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              📅 Prévisions 3 jours
            </h3>
            <div className="space-y-3">
              {data.daily.slice(0, 3).map((day, index) => {
                const dayWindKmh = Math.round(day.wind_speed * 3.6)
                const isDanger = dayWindKmh >= 60
                const isWarning = dayWindKmh >= 50 && dayWindKmh < 60
                
                return (
                  <div 
                    key={index} 
                    className={`p-4 rounded-xl border-2 ${isDanger ? 'bg-red-50 border-red-300' : isWarning ? 'bg-orange-50 border-orange-300' : 'bg-white border-gray-200'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="text-center w-20">
                          <p className="text-sm font-bold text-gray-900">{getDayName(day.dt)}</p>
                          <p className="text-xs text-gray-500">{formatDate(day.dt)}</p>
                        </div>
                        
                        <div className="text-4xl">{getWeatherEmoji(day.weather[0].icon)}</div>
                        
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 capitalize">{day.weather[0].description}</p>
                          <p className="text-xs text-gray-600 mt-1">
                            Min {Math.round(day.temp.min)}° / Max {Math.round(day.temp.max)}°
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <p className="text-xs text-gray-500">Vent</p>
                          <p className={`text-lg font-bold ${isDanger ? 'text-red-700' : isWarning ? 'text-orange-700' : 'text-gray-900'}`}>
                            {dayWindKmh} km/h
                          </p>
                          {isDanger && <p className="text-xs text-red-700 font-semibold">⛔ Danger</p>}
                          {isWarning && <p className="text-xs text-orange-700 font-semibold">⚠️ Attention</p>}
                        </div>

                        {day.pop > 0 && (
                          <div className="text-center">
                            <p className="text-xs text-gray-500">Pluie</p>
                            <p className="text-lg font-bold text-blue-600">{Math.round(day.pop * 100)}%</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
