import type { NvScreenStatusCard, NvTaktGantt } from '@nerv-iip/ui'
// Host vocabulary only. No domain model or calculation enters the UI package.
type Status = InstanceType<typeof NvScreenStatusCard>['$props']
type Timeline = InstanceType<typeof NvTaktGantt>['$props']
export interface SummarySource {
  name: string
  visits: string
  cost: string
  spark: number[]
  costSpark: number[]
  target: string
  progress: string
  duration: string
  space: string
  state: string
  label: string
  labels: NonNullable<Status['labels']>
  toneLabels: NonNullable<Timeline['toneLabels']>
  rows: NonNullable<Timeline['rows']>
  axis: string[]
}
export const summarySources: SummarySource[] = [
  {
    name: '文化空间',
    visits: '12,840',
    cost: '2,460',
    spark: [62, 58, 70, 78, 92],
    costSpark: [90, 82, 86, 72, 64],
    target: '15,000',
    progress: '85.6%',
    duration: '8 小时',
    space: '街角书房',
    state: '开放',
    label: '欢迎停留',
    labels: {
      state: '空间状态',
      plan: '目标到访',
      actual: '当前到访',
      rate: '当前进度',
      downtime: '开放时长',
    },
    toneLabels: { run: '占用', idle: '开放', stop: '闭馆', alarm: '异常' },
    rows: [
      {
        name: '街角书房',
        segs: [
          ['run', 35],
          ['idle', 25],
          ['stop', 30],
          ['alarm', 10],
        ],
      },
      {
        name: '河畔展厅',
        segs: [
          ['idle', 20],
          ['run', 50],
          ['alarm', 10],
          ['stop', 20],
        ],
      },
    ],
    axis: ['09:00', '12:00', '15:00', '18:00'],
  },
  {
    name: '共享办公',
    visits: '386',
    cost: '980',
    spark: [10, 18, 16, 28, 38],
    costSpark: [40, 38, 29, 31, 25],
    target: '500',
    progress: '77.2%',
    duration: '6 小时',
    space: '协作厅',
    state: '可入驻',
    label: '自由协作',
    labels: {
      state: '服务状态',
      plan: '预订目标',
      actual: '当前签到',
      rate: '预订进度',
      downtime: '服务时长',
    },
    toneLabels: { run: '使用中', idle: '可预约', stop: '不开放', alarm: '维护' },
    rows: [
      {
        name: '协作厅',
        segs: [
          ['run', 45],
          ['idle', 15],
          ['stop', 30],
          ['alarm', 10],
        ],
      },
      {
        name: '会议室',
        segs: [
          ['idle', 30],
          ['run', 30],
          ['alarm', 20],
          ['stop', 20],
        ],
      },
    ],
    axis: ['08:00', '12:00', '16:00', '20:00'],
  },
]
/** Explicit adapter to the existing string API: target→plan, visits→actual,
 * progress→rate, duration→downtime. It does not infer missing facts or ratios. */
export function statusFromSource(source: SummarySource, unknown: boolean, long: boolean): Status {
  return {
    name: long ? `${source.space} · 城市公共文化空间联合服务中心` : source.space,
    state: source.state,
    label: long ? '欢迎每一位在城市中寻找安静停留与交流空间的来访者' : source.label,
    tone: 'run',
    plan: unknown ? '—' : source.target,
    actual: unknown ? '—' : source.visits,
    rate: unknown ? '—' : source.progress,
    downtime: unknown ? '—' : source.duration,
    labels: source.labels,
    unit: '人次',
  }
}
