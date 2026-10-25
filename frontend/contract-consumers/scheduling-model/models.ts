import type { ScheduleVisualModel } from '@nerv-iip/scheduling/model'
export const reading: ScheduleVisualModel = {
  horizon: { start: '2026-01-15T00:00:00Z', end: '2026-01-16T00:00:00Z' },
  groups: [{ id: 'space', label: '阅读空间' }],
  timezones: ['UTC'],
  links: [],
  tasks: [
    {
      id: 'read',
      label: '读一本书',
      groupId: 'space',
      start: '2026-01-15T08:00:00.125+02:00',
      end: '2026-01-15T12:00:00Z',
      timezone: 'UTC',
      statusLabels: ['借阅已确认'],
    },
  ],
}
export const travel: ScheduleVisualModel = {
  horizon: { start: '2026-01-15T00:00:00Z', end: '2026-01-16T00:00:00Z' },
  groups: [{ id: 'space', label: '出行安排' }],
  timezones: [],
  links: [],
  tasks: [
    {
      id: 'read',
      label: '沿河走走',
      groupId: 'space',
      start: '2026-01-15T16:00:00Z',
      end: '2026-01-15T18:00:00Z',
      timezone: '',
      statusLabels: ['天气尚未确认'],
    },
  ],
}
