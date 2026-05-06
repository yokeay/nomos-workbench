"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { MapPin, Cloud, Loader2 } from "lucide-react"


interface LocationData {
  city: string
  state: string
  country: string
  lat: number
  lon: number
}

interface DayForecast {
  date: string
  dayName: string
  cap: string
  iconUrl: string
  tempHi: number
  tempLo: number
  precip: number
}

interface WeatherData {
  current: {
    temp: number
    cap: string
    iconUrl: string
    feels: number
    windSpd: number
    rh: number
    aqi: number
    aqiSeverity: string
  }
  forecast: DayForecast[]
  locationName: string
}

const LOCATION_API =
  "https://assets.msn.cn/service/v1/news/users/me/locations?apikey=0QfOX3Vn51YCzitbLaRkTTBadtWpgTN8NZLW0C1SEM&activityId=B4437AEA-75EC-4737-B74F-C5A7D7302A48&ocid=pdp-peregrine&cm=zh-cn&user=m-17520DA586CB6D4239CA1F8582CB6C5A&autodetect=true"

export function WeatherWidget() {
  const [location, setLocation] = useState<LocationData | null>(null)
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

  // Fetch location and weather
  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        // 1. Get location from browser IP
        const locRes = await fetch(LOCATION_API)
        if (!locRes.ok) throw new Error("Location API failed")
        const locData = await locRes.json()
        if (!locData?.[0]) throw new Error("No location data")

        const loc: LocationData = {
          city: locData[0].city || locData[0].state || "未知",
          state: locData[0].state || "",
          country: locData[0].country || "",
          lat: locData[0].latitude,
          lon: locData[0].longitude,
        }
        if (cancelled) return
        setLocation(loc)

        // 2. Get weather
        const wRes = await fetch(`/api/weather?lat=${loc.lat}&lon=${loc.lon}`)
        if (!wRes.ok) throw new Error("Weather API failed")
        const wJson = await wRes.json()
        if (wJson.code !== 0) throw new Error(wJson.message)

        const w = wJson.data.responses[0].weather[0]
        const days = w.forecast?.days ?? []

        const forecast: DayForecast[] = days.slice(0, 7).map((d: any) => {
          const daily = d.daily
          const valid = new Date(daily.valid)
          const dayNames = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"]
          return {
            date: `${valid.getMonth() + 1}/${valid.getDate()}`,
            dayName: dayNames[valid.getDay()],
            cap: daily.pvdrCap || daily.day?.pvdrCap || "?",
            iconUrl: daily.iconUrl || daily.day?.urlIcon || "",
            tempHi: Math.round(daily.tempHi ?? 0),
            tempLo: Math.round(daily.tempLo ?? 0),
            precip: daily.precip ?? 0,
          }
        })

        if (cancelled) return
        setWeather({
          current: {
            temp: Math.round(w.current?.temp ?? 0),
            cap: w.current?.cap || w.current?.pvdrCap || "",
            iconUrl: w.current?.urlIcon || "",
            feels: Math.round(w.current?.feels ?? 0),
            windSpd: w.current?.windSpd ?? 0,
            rh: w.current?.rh ?? 0,
            aqi: w.current?.aqi ?? 0,
            aqiSeverity: w.current?.aqiSeverity || "",
          },
          forecast,
          locationName: loc.city || loc.state,
        })
      } catch (err) {
        console.error("Weather load error:", err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  // Close popover on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  if (loading) {
    return (
      <div className="flex items-center gap-1.5 text-muted-foreground/50 text-xs">
        <Loader2 className="w-3 h-3 animate-spin" />
      </div>
    )
  }

  if (!weather) return null

  return (
    <div className="relative flex items-center gap-1.5">
      {/* Location */}
      {location && (
        <span className="text-muted-foreground/60 text-[11px] font-medium flex items-center gap-0.5 select-none">
          <MapPin className="w-2.5 h-2.5" />
          {location.city}
        </span>
      )}

      {/* Weather trigger */}
      <button
        ref={triggerRef}
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-muted-foreground/70 hover:text-foreground transition-colors duration-fast cursor-pointer select-none"
      >
        {weather.current.iconUrl && (
          <img
            src={weather.current.iconUrl.startsWith("http:") ? "https:" + weather.current.iconUrl.substring(5) : weather.current.iconUrl}
            alt={weather.current.cap}
            className="w-5 h-5"
          />
        )}
        <span className="text-xs font-medium">{weather.current.temp}°</span>
      </button>

      {/* Popover */}
      {open && (
          <div
            ref={popoverRef}
            className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-72 bg-popover border border-border/50 shadow-lg-soft rounded-2xl p-4 z-50 animate-scale-in"
          >
          {/* Current weather header */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-sm font-semibold text-foreground">
                {weather.locationName}
              </div>
              <div className="text-[11px] text-muted-foreground/60">
                {weather.current.cap} · 体感 {weather.current.feels}°
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-foreground tabular-nums">
                {weather.current.temp}°
              </div>
            </div>
          </div>

          {/* AQI + details */}
          <div className="flex items-center gap-3 mb-3 text-[11px] text-muted-foreground/60">
            <span>{weather.current.aqiSeverity} {weather.current.aqi}</span>
            <span>湿度 {weather.current.rh}%</span>
            <span>风 {weather.current.windSpd}km/h</span>
          </div>

          {/* Divider */}
          <div className="border-t border-border/40 my-2" />

          {/* 7-day forecast */}
          <div className="space-y-1.5">
            {weather.forecast.map((day, i) => (
              <div
                key={day.date}
                className="flex items-center justify-between py-1 px-1 rounded-lg hover:bg-accent/40 transition-colors duration-fast"
              >
                <span className="text-xs text-muted-foreground w-10">
                  {i === 0 ? "今天" : day.dayName}
                </span>
                <span className="text-[11px] text-muted-foreground/50 w-12 text-right">
                  {day.date}
                </span>
                {day.iconUrl && (
                  <img
                    src={day.iconUrl.startsWith("http:") ? "https:" + day.iconUrl.substring(5) : day.iconUrl}
                    alt={day.cap}
                    className="w-5 h-5"
                  />
                )}
                <span className="text-[11px] text-muted-foreground/70 w-14 text-center">
                  {day.cap}
                </span>
                <div className="flex items-center gap-0.5 text-xs w-14 text-right tabular-nums">
                  <span className="text-foreground font-medium">{day.tempHi}°</span>
                  <span className="text-muted-foreground/40">/</span>
                  <span className="text-muted-foreground/50">{day.tempLo}°</span>
                </div>
                {day.precip > 0 && (
                  <span className="text-[10px] text-blue-400/70 w-8 text-right">
                    {day.precip}%
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
