import type { ScheduleSnapshot, ScheduleTask } from '@nerv-iip/scheduling'
import { panelModel } from './schedule-panels-fixtures'
import { snapshotReading } from './snapshot-risk-fixtures'

/** Two independent, host-owned records. Neither is inferred from the current draft. */
export function comparisonSnapshots(venue: 'library' | 'studio'): {
  baseline: ScheduleSnapshot
  candidate: ScheduleSnapshot
} {
  const baselineModel = structuredClone(panelModel(venue))
  const reading = snapshotReading(venue)
  const first = baselineModel.tasks[0]!
  const second = baselineModel.tasks[1]!
  const changed: ScheduleTask = {
    ...structuredClone(first),
    id: 'candidate-assignment-a',
    resourceId: venue === 'library' ? '林间书屋' : '安静画室',
    display: { ...first.display, resourceLabel: venue === 'library' ? '林间书屋' : '安静画室' },
    startUtc: '2026-11-02T02:00:00Z',
    endUtc: '2026-11-02T04:00:00Z',
    segments: [
      { startUtc: '2026-11-02T02:00:00Z', endUtc: '2026-11-02T02:30:00Z' },
      { startUtc: '2026-11-02T03:00:00Z', endUtc: '2026-11-02T04:00:00Z' },
    ],
  }
  const added: ScheduleTask = {
    ...structuredClone(second),
    // The same instance ID occurs in a different semantic activity across snapshots.
    id: second.id,
    text: venue === 'library' ? '傍晚分享' : '傍晚展览',
    startUtc: '2026-11-02T09:00:00Z',
    endUtc: '2026-11-02T10:00:00Z',
  }
  const candidateModel = structuredClone(baselineModel)
  candidateModel.tasks = [changed, added]
  candidateModel.links = []
  candidateModel.changes = []
  return {
    baseline: {
      id: 'saved-baseline',
      label: venue === 'library' ? '读书会已保存安排' : '工作坊已保存安排',
      source: {
        kind: 'snapshot',
        label: '已保存安排',
        capturedAt: '2026-11-01 10:00（Asia/Shanghai）',
        status: '历史记录；现场仍待核对',
        state: 'available',
      },
      model: baselineModel,
      items: [
        {
          semanticKey: 'morning',
          label: first.text,
          groupLabel: venue === 'library' ? '周一读书会' : '周一工作坊',
          task: first,
        },
        {
          semanticKey: 'noon',
          label: second.text,
          groupLabel: venue === 'library' ? '周一读书会' : '周一工作坊',
          task: second,
        },
      ],
      metrics: [
        { id: 'delay', label: '延期分钟', format: 'number' },
        { id: 'on-time', label: '准时率', value: 0, format: 'percent' },
      ],
    },
    candidate: {
      id: 'candidate-one',
      label: venue === 'library' ? '读书会候选安排' : '工作坊候选安排',
      source: {
        kind: 'snapshot',
        label: '候选预览',
        capturedAt: '2026-11-01 10:30（Asia/Shanghai）',
        status: '尚未保存或发布',
        state: 'available',
      },
      model: candidateModel,
      items: [
        {
          semanticKey: 'morning',
          label: changed.text,
          groupLabel: venue === 'library' ? '周一读书会' : '周一工作坊',
          task: changed,
          message: '空间和时间已由候选来源调整',
        },
        { semanticKey: 'noon', label: second.text, state: 'blocked', message: '空间仍待确认' },
        {
          semanticKey: 'evening',
          label: added.text,
          task: added,
          message: '新增活动由候选来源提供',
        },
      ],
      metrics: [
        { id: 'delay', label: '延期分钟', value: 0, format: 'number' },
        { id: 'on-time', label: '准时率', format: 'percent' },
      ],
      shortages: reading.shortages,
      risks: reading.risks,
      conflicts: { conflicts: reading.conflicts, unscheduled: reading.pending },
    },
  }
}
