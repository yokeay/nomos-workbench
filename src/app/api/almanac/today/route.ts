import { NextRequest, NextResponse } from 'next/server'
import { toLunar } from 'lunar'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dateStr = searchParams.get('date') || new Date().toISOString().slice(0, 10)

    const date = new Date(dateStr + 'T00:00:00')
    if (isNaN(date.getTime())) {
      return NextResponse.json({ code: 1003, message: 'Invalid date', data: null }, { status: 400 })
    }

    const result = toLunar(date)
    const lunar = result.lunar

    // Solar terms for the date (if any)
    const solarTerms: Record<string, string> = {
      '01-05': '小寒', '01-20': '大寒', '02-04': '立春', '02-19': '雨水',
      '03-05': '惊蛰', '03-20': '春分', '04-05': '清明', '04-20': '谷雨',
      '05-05': '立夏', '05-21': '小满', '06-05': '芒种', '06-21': '夏至',
      '07-07': '小暑', '07-22': '大暑', '08-07': '立秋', '08-23': '处暑',
      '09-08': '白露', '09-23': '秋分', '10-08': '寒露', '10-23': '霜降',
      '11-07': '立冬', '11-22': '小雪', '12-07': '大雪', '12-22': '冬至',
    }
    const key = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    const solarTerm = solarTerms[key] || null

    // Basic zodiac fortune
    const zodiacAnimals = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪']
    const zodiac = zodiacAnimals[(date.getFullYear() - 4) % 12]

    return NextResponse.json({
      code: 0,
      message: 'ok',
      data: {
        solarDate: dateStr,
        lunarMonth: lunar.month,
        lunarDay: lunar.day,
        isLeapMonth: lunar.isLeapMonth,
        yearZodiac: zodiac,
        solarTerm,
      },
    })
  } catch (error) {
    console.error('Almanac API error:', error)
    return NextResponse.json({ code: 5000, message: 'Failed to fetch almanac', data: null }, { status: 500 })
  }
}
