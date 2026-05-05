export const TTL = 30 * 60 * 1000

export const Interval = 10 * 60 * 1000

export const Time = {
  Realtime: 2 * 60 * 1000,
  Fast: 5 * 60 * 1000,
  Default: Interval,
  Common: 30 * 60 * 1000,
  Slow: 60 * 60 * 1000,
} as const
