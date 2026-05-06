import { NextRequest, NextResponse } from "next/server"

const WEATHER_API = "https://api.msn.cn/weatherfalcon/weather/overview"
const API_KEY = "j5i4gDqHL6nGYwx5wi5kRhXjtf2c5qgFX9fzfk0TOo"
const USER_ID = "m-17520DA586CB6D4239CA1F8582CB6C5A"
const ACTIVITY_ID = "B4437AEA-75EC-4737-B74F-C5A7D7302A48"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get("lat")
  const lon = searchParams.get("lon")

  if (!lat || !lon) {
    return NextResponse.json({ code: 4001, message: "lat and lon required" }, { status: 400 })
  }

  try {
    const url = new URL(WEATHER_API)
    url.searchParams.set("apikey", API_KEY)
    url.searchParams.set("activityId", ACTIVITY_ID)
    url.searchParams.set("ocid", "msftweather")
    url.searchParams.set("cm", "zh-cn")
    url.searchParams.set("user", USER_ID)
    url.searchParams.set("units", "C")
    url.searchParams.set("appId", "9e21380c-ff19-4c78-b4ea-19558e93a5d3")
    url.searchParams.set("wrapodata", "false")
    url.searchParams.set("includemapsmetadata", "true")
    url.searchParams.set("nowcastingv2", "true")
    url.searchParams.set("usemscloudcover", "true")
    url.searchParams.set("cuthour", "true")
    url.searchParams.set("getCmaAlert", "true")
    url.searchParams.set("regioncategories", "alert,content")
    url.searchParams.set("feature", "lifeday")
    url.searchParams.set("includenowcasting", "true")
    url.searchParams.set("nowcastingapi", "2")
    url.searchParams.set("lifeDays", "2")
    url.searchParams.set("lifeModes", "50")
    url.searchParams.set("distanceinkm", "0")
    url.searchParams.set("regionDataCount", "20")
    url.searchParams.set("orderby", "distance")
    url.searchParams.set("days", "10")
    url.searchParams.set("pageOcid", "prime-weather::weathertoday-peregrine")
    url.searchParams.set("source", "weather_csr")
    url.searchParams.set("region", "cn")
    url.searchParams.set("market", "zh-cn")
    url.searchParams.set("locale", "zh-cn")
    url.searchParams.set("lat", lat)
    url.searchParams.set("lon", lon)

    const res = await fetch(url.toString(), {
      headers: { "Accept-Encoding": "gzip" },
      next: { revalidate: 600 }, // cache 10 min
    })

    if (!res.ok) {
      return NextResponse.json({ code: 5000, message: "Weather API failed" }, { status: 502 })
    }

    const data = await res.json()
    return NextResponse.json({ code: 0, data })
  } catch (error) {
    console.error("Weather API error:", error)
    return NextResponse.json({ code: 5000, message: "Weather API error" }, { status: 500 })
  }
}
