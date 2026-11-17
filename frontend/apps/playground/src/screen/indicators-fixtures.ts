/** Host-owned memory examples. Null means unknown; it is never sent as a numeric zero. */
export interface IndicatorSource {
  id: string
  space: string
  visits: number | string
  booking: number | null
  reading: number | null
  capsules: { label: string; value: number; tone?: 'cyan' | 'indigo' | 'green' | 'amber' | 'red' }[]
  readingTrend: number[]
  bookingTrend: number[]
  color: string
  note: string
}
export const indicatorSources: IndicatorSource[] = [
  {
    id: 'morning',
    space: '街角书房',
    visits: 1284,
    booking: 72.5,
    reading: 45.7,
    capsules: [
      { label: '阅读座席', value: 72.5, tone: 'cyan' },
      { label: '展览空间', value: 48, tone: 'indigo' },
      { label: '共享客厅', value: 32, tone: 'green' },
    ],
    readingTrend: [8, 11, 9, 14, 12, 17],
    bookingTrend: [10, 9, 14, 12, 16, 13],
    color: 'var(--nv-scr-cyan)',
    note: '今日开放，欢迎来坐坐。',
  },
  {
    id: 'evening',
    space: '河岸展厅',
    visits: 2400.5,
    booking: 93.2,
    reading: 61.2,
    capsules: [
      { label: '河岸展览', value: 93.2, tone: 'amber' },
      { label: '街角阅读', value: 61.2, tone: 'green' },
    ],
    readingTrend: [10, 6, 9],
    bookingTrend: [2, 4, 6, 8, 10],
    color: 'var(--nv-scr-indigo)',
    note: '傍晚延长开放，预订接近满额。',
  },
  {
    id: 'zero',
    space: '开馆之前',
    visits: 0,
    booking: 0,
    reading: 0,
    capsules: [{ label: '阅读预订', value: 0, tone: 'cyan' }],
    readingTrend: [0, 0, 0],
    bookingTrend: [0],
    color: 'var(--nv-scr-green)',
    note: '有效读数为零，尚无预订。',
  },
  {
    id: 'unknown',
    space: '待确认空间',
    visits: '尚未统计',
    booking: null,
    reading: null,
    capsules: [],
    readingTrend: [],
    bookingTrend: [],
    color: 'var(--nv-scr-amber)',
    note: '数据缺失，比例未知；请等待确认。',
  },
  {
    id: 'boundary',
    space: '边界与长文字',
    visits: '12 345.67 · 待核对',
    booking: 125.25,
    reading: -12.3,
    capsules: [
      { label: '全年累计阅读空间预约比例说明', value: 125.25, tone: 'red' },
      { label: '低于比较基线', value: -12.3, tone: 'amber' },
      { label: '高精度小数', value: 3.14159, tone: 'indigo' },
    ],
    readingTrend: [5, 5],
    bookingTrend: [10, 0, 10],
    color: 'var(--nv-scr-red)',
    note: '本期阅读、到访与预订记录涵盖街角书房、河岸展厅和共享客厅。完整文字由空间维护者提供，请向右滚动查看全部说明；尚未确认的记录会另外标记，原始读数保持可见。',
  },
]
export const statusTones = ['run', 'idle', 'alarm', 'cyan', 'green', 'amber', 'red'] as const
