// Neutral, local host data. IDs identify source/range/point; no service or domain adapter.
export function arrivalData(source: string, range: string) {
  const weekly = range === 'weeks'
  const gallery = source === 'gallery'
  const actual = weekly
    ? gallery
      ? [911, 1703, 1207]
      : [701, 1307, 997]
    : gallery
      ? [13, 89, 47, 173, 109]
      : [0, 37, 113, 61, 157]
  const plan = weekly ? (gallery ? [1001, 1801, 1409] : [809, 1409, 1103]) : [19, 71, 127, 83, 181]
  const extra = weekly ? [307, 509, 401] : [7, 23, 41, 29, 67]
  return {
    actual,
    plan,
    extra,
    points: actual.map((_, i) => `${source}/${range}/p${i + 1}`),
    yLabels: weekly
      ? ['2,000', '1,600', '1,200', '800', '400', '0']
      : ['200', '160', '120', '80', '40', '0'],
  }
}
export const chartRanges = [
  { label: '今日五段', value: 'day' },
  { label: '近三周', value: 'weeks' },
]
export const distributions = {
  multi: {
    total: 100,
    segments: [
      { label: '阅读', value: 53, color: 'var(--nv-scr-cyan)' },
      { label: '影像', value: 27, color: 'var(--nv-scr-indigo)' },
      { label: '声音', value: 20, color: 'var(--nv-scr-amber)' },
    ],
    items: [
      { label: '阅读', sub: '内容 A', count: 53, pct: 53 },
      { label: '影像', sub: '内容 B', count: 27, pct: 27 },
    ],
  },
  single: {
    total: 23,
    segments: [{ label: '手作', value: 23, color: 'var(--nv-scr-cyan)' }],
    items: [{ label: '手作', sub: '内容 C', count: 23, pct: 100 }],
  },
  zero: {
    total: 0,
    segments: [{ label: '阅读', value: 0, color: 'var(--nv-scr-cyan)' }],
    items: [{ label: '阅读', sub: '零值来源', count: 0, pct: 0 }],
  },
  replaced: {
    total: 200,
    segments: [
      { label: '声音档案', value: 41, color: 'var(--nv-scr-amber)' },
      { label: '城市长卷：沿河街巷与日常生活的共同记忆', value: 99, color: 'var(--nv-scr-indigo)' },
      { label: '手作', value: 60, color: 'var(--nv-scr-cyan)' },
    ],
    items: [
      { label: '声音档案', sub: '保持输入顺序', count: 41, pct: 20.5 },
      { label: '城市长卷：沿河街巷与日常生活的共同记忆', sub: '内容 D', count: 99, pct: 49.5 },
    ],
  },
}
