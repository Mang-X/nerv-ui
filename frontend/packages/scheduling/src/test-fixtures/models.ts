import type { ScheduleModel, ScheduleTask } from '../model/types'
// Direct host display records. No SDK, mapper, capacity/precedence solver or fake adapter.
export const firstTask: ScheduleTask = {
  id: 'a1',
  orderId: 'WO-001',
  operationId: 'op-10',
  operationSequence: 10,
  parentId: 'order:WO-001',
  type: 'operation',
  text: '共读第一章',
  resourceId: 'WC-001',
  workCenterId: 'WC-001',
  dimensions: { workCenter: { id: 'WC-001', label: '书房' } },
  startUtc: '2026-06-10T08:00:00.000Z',
  endUtc: '2026-06-10T10:00:00.000Z',
  timezone: 'UTC',
  locked: false,
  hasConflict: false,
}
export const sampleModel: ScheduleModel = {
  tasks: [
    firstTask,
    {
      ...firstTask,
      id: 'a2',
      operationId: 'op-20',
      operationSequence: 20,
      text: '交流心得',
      resourceId: 'WC-002',
      workCenterId: 'WC-002',
      dimensions: { workCenter: { id: 'WC-002', label: '花园' } },
      startUtc: '2026-06-10T10:00:00.000Z',
      endUtc: '2026-06-10T12:00:00.000Z',
      locked: true,
      hasConflict: true,
      conflictReason: 'capacity',
    },
    {
      ...firstTask,
      id: 'order:WO-001',
      type: 'order',
      text: 'WO-001',
      parentId: undefined,
      endUtc: '2026-06-10T12:00:00.000Z',
    },
  ],
  links: [{ id: 'a1->a2', source: 'a1', target: 'a2', type: 'finish_to_start' }],
  resources: [
    { id: 'WC-001', text: '书房' },
    { id: 'WC-002', text: '花园' },
  ],
  loads: [
    {
      resourceId: 'WC-001',
      windowStartUtc: '2026-06-10T00:00:00.000Z',
      windowEndUtc: '2026-06-11T00:00:00.000Z',
      assignedMinutes: 120,
      availableMinutes: 480,
      utilization: 0.25,
    },
  ],
  conflicts: [
    {
      id: 'c1',
      reason: 'capacity',
      severity: 'warning',
      orderId: 'WO-001',
      operationId: 'op-20',
      resourceId: 'WC-002',
      message: '产能不足',
      taskId: 'a2',
    },
  ],
  unscheduled: [{ orderId: 'WO-002', operationId: 'op-10', reason: 'material', message: '待安排' }],
  changes: [
    { orderId: 'WO-001', operationId: 'op-20', changeType: 'moved', message: '后移 2 小时' },
  ],
  horizon: { startUtc: '2026-06-10T00:00:00.000Z', endUtc: '2026-06-11T00:00:00.000Z' },
  timezones: ['UTC'],
  meta: { planId: 'reading', status: 'generated', algorithmVersion: 'host-supplied' },
}
export const sampleModelWithCalendar: ScheduleModel = {
  ...sampleModel,
  tasks: [
    ...sampleModel.tasks,
    {
      ...firstTask,
      id: 'block:change',
      blockKind: 'changeover',
      startUtc: '2026-06-10T10:00:00.000Z',
      endUtc: '2026-06-10T11:00:00.000Z',
    },
    {
      ...firstTask,
      id: 'block:maint',
      dimensions: { workCenter: { id: 'WC-002', label: '花园' } },
      resourceId: 'WC-002',
      workCenterId: 'WC-002',
      blockKind: 'maintenance',
      startUtc: '2026-06-10T13:00:00.000Z',
      endUtc: '2026-06-10T15:00:00.000Z',
    },
  ],
  calendars: [
    {
      calendarId: 'CAL-MAIN',
      resourceIds: ['WC-001', 'WC-002'],
      workCenterIds: ['WC-001', 'WC-002'],
      shiftWindows: [
        {
          startUtc: '2026-06-10T00:00:00.000Z',
          endUtc: '2026-06-10T08:00:00.000Z',
          shiftCode: 'early',
        },
        {
          startUtc: '2026-06-10T08:00:00.000Z',
          endUtc: '2026-06-10T16:00:00.000Z',
          shiftCode: 'middle',
        },
        {
          startUtc: '2026-06-11T00:00:00.000Z',
          endUtc: '2026-06-11T08:00:00.000Z',
          shiftCode: 'early',
        },
      ],
    },
  ],
}
