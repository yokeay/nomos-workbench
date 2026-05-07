import { NextRequest, NextResponse } from 'next/server'
import { Solar } from 'lunar-typescript'
import { db, almanac } from '@/lib/db'
import { eq } from 'drizzle-orm'

const LUNAR_MONTHS = ['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '冬月', '腊月']

const LUNAR_DAYS = [
  '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
  '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
  '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十',
]

function computeAlmanac(dateStr: string) {
  const date = new Date(dateStr + 'T00:00:00')
  const solar = Solar.fromDate(date)
  const lunar = solar.getLunar()

  const baZi = lunar.getBaZi()
  const baZiWuXing = lunar.getBaZiWuXing()
  const baZiNaYin = lunar.getBaZiNaYin()

  const lunarMonth = lunar.getMonth()
  const lunarDay = lunar.getDay()
  const monthStr = LUNAR_MONTHS[lunarMonth - 1] || `${lunarMonth}月`
  const dayStr = LUNAR_DAYS[lunarDay - 1] || `${lunarDay}`

  return {
    solarDate: dateStr,
    lunarMonth,
    lunarDay,
    isLeapMonth: lunar.getMonth() < 0,
    lunarMonthName: (lunar.getMonth() < 0 ? '闰' : '') + monthStr,
    lunarDayName: dayStr,
    yearZodiac: lunar.getYearShengXiao(),
    dayZodiac: lunar.getDayShengXiao(),
    solarTerm: lunar.getJieQi() || null,

    baZi: { year: baZi[0], month: baZi[1], day: baZi[2], hour: baZi[3] },
    baZiWuXing: { year: baZiWuXing[0], month: baZiWuXing[1], day: baZiWuXing[2], hour: baZiWuXing[3] },
    baZiNaYin: { year: baZiNaYin[0], month: baZiNaYin[1], day: baZiNaYin[2], hour: baZiNaYin[3] },

    yi: lunar.getDayYi(),
    ji: lunar.getDayJi(),

    chong: lunar.getDayChongDesc(),
    sha: lunar.getDaySha(),

    jiShen: lunar.getDayJiShen(),
    xiongSha: lunar.getDayXiongSha(),

    taiShen: lunar.getDayPositionTai(),

    pengZuGan: lunar.getPengZuGan(),
    pengZuZhi: lunar.getPengZuZhi(),

    xiu: lunar.getXiu(),
    xiuSong: lunar.getXiuSong(),
    xiuLuck: lunar.getXiuLuck(),
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dateStr = searchParams.get('date') || new Date().toISOString().slice(0, 10)

    // Validate date
    const date = new Date(dateStr + 'T00:00:00')
    if (isNaN(date.getTime())) {
      return NextResponse.json({ code: 1003, message: 'Invalid date', data: null }, { status: 400 })
    }

    // Check cache first
    const rows = db.select().from(almanac).where(eq(almanac.date, dateStr)).limit(1).all()
    const cached = rows[0]

    if (cached) {
      return NextResponse.json({
        code: 0,
        message: 'ok',
        data: JSON.parse(cached.data),
      })
    }

    // Compute and store
    const data = computeAlmanac(dateStr)

    await db.insert(almanac).values({
      id: dateStr,
      date: dateStr,
      data: JSON.stringify(data),
      createdAt: Date.now(),
    })

    return NextResponse.json({ code: 0, message: 'ok', data })
  } catch (error) {
    console.error('Almanac API error:', error)
    return NextResponse.json({ code: 5000, message: 'Failed to fetch almanac', data: null }, { status: 500 })
  }
}
