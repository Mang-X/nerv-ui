/** Strict actual-instant parser shared by native geometry and host input helpers. */
export function scheduleInstant(value: string) {
  // Check the written calendar before Date.parse can roll an absent day into next month.
  // Offset conversion must not be round-tripped through UTC calendar fields.
  const parts =
    /^(\d{4}|[+-]\d{6})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d+))?)?(Z|[+-](\d{2}):?(\d{2}))$/i.exec(
      value,
    )
  if (!parts) return NaN
  const [
    ,
    yearText,
    monthText,
    dayText,
    hourText,
    minuteText,
    secondText,
    fraction,
    ,
    offsetHour,
    offsetMinute,
  ] = parts
  const year = Number(yearText),
    month = Number(monthText),
    day = Number(dayText)
  const hour = Number(hourText),
    minute = Number(minuteText),
    second = Number(secondText ?? 0)
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  if (month < 1 || month > 12 || day < 1 || day > days[month - 1]!) return NaN
  if (hour > 24 || minute > 59 || second > 59) return NaN
  // ISO end-of-day 24:00 is valid only with zero minutes, seconds and fraction.
  if (hour === 24 && (minute !== 0 || second !== 0 || /[1-9]/.test(fraction ?? ''))) return NaN
  if (Number(offsetHour ?? 0) > 23 || Number(offsetMinute ?? 0) > 59) return NaN
  return Date.parse(value)
}

export type * from '../components/pc/schedule-timeline/types'
