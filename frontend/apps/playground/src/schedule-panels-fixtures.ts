import { withWorkOrderFacts, type ScheduleModel, type ScheduleTask } from '@nerv-iip/scheduling'

export function panelModel(venue: 'library' | 'studio', replacement = false): ScheduleModel {
  const reading = venue === 'library'
  const names = reading
    ? ['晨间共读', '午间共读', '傍晚分享']
    : ['晨间创作', '午间创作', '傍晚分享']
  const timezone = reading ? 'Asia/Shanghai' : 'Asia/Kolkata'
  const task = (id: string, text: string, startUtc: string, endUtc: string): ScheduleTask => ({
    id,
    text,
    orderId: reading ? '周一读书会' : '周一工作坊',
    operationId: text,
    operationSequence: 1,
    type: 'operation',
    resourceId: reading ? '晨光书房' : '向阳画室',
    workCenterId: 'center-a',
    timezone,
    startUtc,
    endUtc,
    locked: false,
    hasConflict: false,
    colorKey: 'weld',
    display: {
      groupLabel: reading ? '周一读书会' : '周一工作坊',
      resourceLabel: reading ? '晨光书房' : '向阳画室',
    },
    dimensions: { team: { id: 'team-a', label: reading ? '阅读小组' : '创作小组' } },
  })
  const tasks: ScheduleTask[] = [
    {
      ...task(
        replacement ? 'new-a' : 'activity-a',
        names[0]! + (replacement ? ' · 新安排' : ''),
        '2026-11-02T01:00:00Z',
        '2026-11-02T04:00:00Z',
      ),
      plannedStartUtc: '2026-11-02T00:00:00Z',
      plannedEndUtc: '2026-11-02T03:00:00Z',
      quantity: 0,
      progress: 0,
      changeoverMin: 0,
    },
    task(
      replacement ? 'new-b' : 'activity-b',
      names[1]!,
      '2026-11-02T06:00:00Z',
      '2026-11-02T08:00:00Z',
    ),
    {
      ...task('reserved', '空间整理', '2026-11-02T04:00:00Z', '2026-11-02T05:00:00Z'),
      colorKey: undefined,
      blockKind: 'maintenance',
      display: {
        resourceLabel: reading ? '晨光书房' : '向阳画室',
        blockLabel: '空间整理',
        blockDescription: '该时段保留用于整理空间。',
      },
    },
  ]
  return withWorkOrderFacts<ScheduleModel>(
    {
      tasks,
      links: [
        { id: 'sequence', source: tasks[0]!.id, target: tasks[1]!.id, type: 'finish_to_start' },
      ],
      resources: [
        {
          id: reading ? '晨光书房' : '向阳画室',
          text: reading ? '晨光书房' : '向阳画室',
          dimensions: { workCenter: { id: 'center-a', label: reading ? '晨光书房' : '向阳画室' } },
          utilization: 0,
        },
        { id: 'space-b', text: reading ? '林间书屋' : '安静画室' },
      ],
      groupDimensions: [
        { key: 'workCenter', label: '空间' },
        { key: 'team', label: '小组' },
      ],
      groupValues: {
        workCenter: [{ id: 'center-a', label: reading ? '晨光书房' : '向阳画室' }],
        team: [{ id: 'team-a', label: reading ? '阅读小组' : '创作小组' }],
      },
      loads: [],
      conflicts: [
        {
          id: 'notice-a',
          taskId: tasks[0]!.id,
          reason: 'calendar',
          severity: 'warning',
          label: names[0],
          reasonLabel: '时间待确认',
          message: '请与参与者确认开始时间。',
        },
      ],
      unscheduled: [
        {
          orderId: 'internal-pending-group',
          operationId: 'internal-pending-op',
          reason: 'calendar',
          label: names[2],
          groupLabel: reading ? '周一读书会' : '周一工作坊',
          reasonLabel: '等待场地',
          message: '待场地确认后再安排。',
          actionLabel: '联系组织者',
        },
      ],
      changes: [
        {
          taskId: tasks[1]!.id,
          orderId: tasks[1]!.orderId,
          operationId: tasks[1]!.operationId,
          label: names[1],
          groupLabel: reading ? '周一读书会' : '周一工作坊',
          changeType: 'moved',
          message: '参与者已提出新的开始时间。',
        },
      ],
      calendars: [
        {
          calendarId: 'opening',
          resourceIds: [reading ? '晨光书房' : '向阳画室'],
          workCenterIds: ['center-a'],
          shiftWindows: [
            {
              startUtc: reading ? '2026-11-02T00:00:00Z' : '2026-11-02T04:30:00Z',
              endUtc: '2026-11-02T10:00:00Z',
              shiftCode: 'opening',
            },
          ],
        },
      ],
      horizon: { startUtc: '2026-11-01T16:00:00Z', endUtc: '2026-11-03T16:00:00Z' },
      timezones: [timezone],
      meta: { planId: venue, status: 'generated', algorithmVersion: 'host-supplied' },
    },
    tasks
      .filter((t) => !t.blockKind)
      .map((t) => ({
        taskId: t.id,
        facts: [
          { label: '参与人数', state: 'known' as const, value: 0 },
          { label: '备注', state: 'known' as const, value: '' },
          { label: '反馈', state: 'unknown' as const },
          { label: '报名', state: 'forbidden' as const },
          { label: '记录', state: 'unavailable' as const },
        ],
      })),
  )
}
