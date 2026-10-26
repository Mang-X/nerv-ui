import type {
  SnapshotActivity,
  SnapshotConflict,
  SnapshotLoad,
  SnapshotPending,
  SnapshotRisk,
  SnapshotShortage,
  SnapshotSource,
} from '@nerv-iip/scheduling'
export interface SnapshotReading {
  source: SnapshotSource
  activities: SnapshotActivity[]
  shortages: SnapshotShortage[]
  risks: SnapshotRisk[]
  conflicts: SnapshotConflict[]
  pending: SnapshotPending[]
  loads: SnapshotLoad[]
}
/** Fixed host records, deliberately not a scheduler or material calculator. */
export function snapshotReading(
  venue: 'library' | 'studio',
  revision = 0,
  current = false,
): SnapshotReading {
  const library = venue === 'library'
  const activity: SnapshotActivity = {
    id: `activity-${revision}`,
    label: revision ? (library ? '午间书谈' : '午间写生') : library ? '晨间共读' : '晨间创作',
    location: revision ? (library ? '湖畔小屋' : '湖畔画室') : library ? '晨光书房' : '陶艺工坊',
    time: revision
      ? '2026-10-26 13:00–14:00（Asia/Shanghai）'
      : '2026-10-26 09:00–10:00（Asia/Shanghai）',
    result: '等待用料确认',
  }
  const second: SnapshotActivity = {
    id: `second-${revision}`,
    label: library ? '午后交流' : '午后捏塑',
    location: library ? '林间书屋' : '林间工坊',
    time: '2026-10-26 14:00–15:00（Asia/Shanghai）',
    result: '等待空间确认',
  }
  const paper: SnapshotShortage = {
    id: 'paper',
    label: library ? '阅读卡纸' : '绘画纸',
    batch: revision ? '秋日二批' : '秋日一批',
    quantity: current ? 0 : 3,
    unit: '张',
    requiredQuantity: 5,
    availableQuantity: current ? 5 : 2,
    affected: [activity, second],
  }
  return {
    source: {
      kind: current ? 'current' : 'snapshot',
      label: current ? '现场核对记录' : '上午安排记录',
      capturedAt: current
        ? '2026-10-26 09:45（Asia/Shanghai）'
        : '2026-10-26 08:30（Asia/Shanghai）',
      status: current ? '等待现场确认' : '等待复核',
      state: 'available',
    },
    activities: [activity, second],
    shortages: [
      paper,
      {
        id: 'booklet',
        label: '活动手册',
        batch: '秋日一批',
        quantity: 20,
        unit: '本',
        affected: [],
      },
      {
        id: 'sticker',
        label: '入场贴纸',
        batch: '秋日一批',
        quantity: 100,
        unit: '枚',
        affected: [],
      },
      { id: 'pen', label: '记号笔', batch: '秋日一批', quantity: 0, unit: '支', affected: [] },
      { id: 'unknown', label: '备用用料', quantity: null, unit: '盒', affected: null },
    ],
    risks: [
      {
        id: 'risk-material',
        category: { id: 'material', label: '用料提醒' },
        group: { id: `session-${revision}`, label: revision ? '午间活动' : '上午活动' },
        label: '用料记录待复核',
        message: current
          ? '补充登记已更新，仍待现场确认。'
          : '生成记录后仍可能补充用料，请核对当前情况。',
        severity: 'warning',
        activity,
        shortages: [paper],
        actionLabel: '查看用料关联活动',
      },
      {
        id: 'risk-resource',
        category: { id: 'space', label: '空间提醒' },
        group: { id: `room-${revision}`, label: second.location! },
        label: '空间记录待确认',
        message: '尚未收到空间核对记录，无法判断可用。',
        severity: 'unknown',
        activity: second,
        shortages: null,
        actionLabel: '查看空间关联活动',
        disabledReason: '关联活动暂不可查看',
      },
    ],
    conflicts: [
      {
        id: 'conflict-warning',
        label: activity.label,
        message: '错误记录仍待复核；这是一条预警。',
        severity: 'warning',
        reason: { id: 'material', label: '用料复核' },
        activity,
        actionLabel: '查看预警关联活动',
      },
      {
        id: 'conflict-info',
        label: second.label,
        message: '请留意签到时间。',
        severity: 'info',
        reason: { id: 'arrival', label: '时间提醒' },
        activity: second,
      },
      {
        id: 'conflict-error',
        label: second.label,
        message: '现场记录要求调整空间后再确认安排。',
        severity: 'error',
        reason: { id: 'space', label: '空间冲突' },
        activity: second,
        actionLabel: '查看阻断关联活动',
      },
    ],
    pending: [
      {
        id: 'pending-one',
        label: library ? '新书分享' : '色彩分享',
        reasonLabel: '日期待定',
        message: '尚未登记安排时间。',
      },
    ],
    loads: [
      {
        id: 'load-active',
        resource: { id: `primary-${revision}`, label: activity.location! },
        start: '09:00',
        end: '10:00（Asia/Shanghai）',
        assignedMinutes: current ? 15 : 30,
        availableMinutes: 60,
        utilization: current ? 0.25 : 0.8,
      },
      {
        id: 'load-idle',
        resource: { id: `primary-${revision}`, label: activity.location! },
        start: '10:00',
        end: '11:00（Asia/Shanghai）',
        assignedMinutes: 0,
        availableMinutes: 60,
        utilization: 0,
      },
      {
        id: 'load-unknown',
        resource: { id: 'secondary', label: second.location! },
        start: '11:00',
        end: '12:00（Asia/Shanghai）',
        assignedMinutes: null,
        availableMinutes: null,
        utilization: null,
      },
      {
        id: 'load-idle-only',
        resource: { id: 'quiet', label: library ? '静思小屋' : '静思画室' },
        start: '13:00',
        end: '14:00（Asia/Shanghai）',
        assignedMinutes: 0,
        availableMinutes: null,
        utilization: null,
      },
    ],
  }
}
