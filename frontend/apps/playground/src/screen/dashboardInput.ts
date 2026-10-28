export interface DashboardInput {
  key: string
  title: string
  primary: number | null
  primaryLabel: string
  secondary: string
  entries: string[]
  rows: { id: string; name: string; status: string }[]
  distribution: { label: string; value: number; color: string }[]
  ranking: { label: string; count: number; pct: number }[]
  actual: number[]
  threshold: number[]
  layers: { label: string; color: string; data: number[] }[]
  unit: string
  updatedAt: number | null
  error?: string
}
export function dashboardInput(kind: 'reading' | 'exhibition'): DashboardInput {
  const reading = kind === 'reading'
  return {
    key: kind,
    title: reading ? '阅读活动' : '展览安排',
    primary: reading ? 0 : 12,
    primaryLabel: reading ? '今日新增报名' : '本周展出作品',
    secondary: reading ? '开放席位 18 位' : '布展窗口 3 个',
    entries: reading ? ['活动日历'] : ['布展安排', '讲解预约', '作品目录'],
    rows: (reading
      ? ['共读散文', '绘本分享', '诗歌夜读', '地方志寻读', '长篇交流']
      : ['布展：纸上花园', '讲解：光与影', '撤展：城市记忆']
    ).map((name, i) => ({ id: `${kind}-${i}`, name, status: i === 0 ? '待确认' : '已安排' })),
    distribution: [
      { label: reading ? '共读' : '布展', value: 3, color: 'var(--nv-scr-cyan)' },
      { label: reading ? '自由阅读' : '讲解', value: 2, color: 'var(--nv-scr-indigo)' },
    ],
    ranking: [
      { label: reading ? '散文报名' : '纸艺作品', count: 3, pct: 60 },
      { label: reading ? '诗歌报名' : '摄影作品', count: 2, pct: 40 },
    ],
    actual: reading ? [0, 2, 3] : [4, 8, 12],
    threshold: reading ? [6, 6, 6] : [15, 15, 15],
    layers: [
      {
        label: reading ? '线上报名' : '摄影作品',
        color: 'var(--nv-scr-indigo)',
        data: reading ? [0, 1, 2] : [1, 3, 5],
      },
    ],
    unit: reading ? '人' : '件',
    updatedAt: 1000,
  }
}
