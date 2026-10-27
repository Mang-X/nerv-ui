import { SchedulingDaySchedule, type SchedulingDayEntry } from '@nerv-iip/scheduling'

const entries: readonly SchedulingDayEntry[] = [
  {
    semanticKey: 'reading',
    assignmentId: 'instance-2',
    label: '晨间共读',
    groupId: 'room',
    groupLabel: '阅读室',
    startUtc: '2026-11-02T01:00:00Z',
    endUtc: '2026-11-02T03:00:00Z',
    quantity: null,
    segments: [{ startUtc: '2026-11-02T01:00:00Z', endUtc: '2026-11-02T03:00:00Z' }],
  },
]
// @ts-expect-error the public list stays read-only
entries.push(entries[0]!)
// @ts-expect-error identity is not rewritten by the view
entries[0]!.assignmentId = 'other'
// @ts-expect-error the semantic key cannot be replaced by an assignment ID
const missingSemantic: SchedulingDayEntry = {
  assignmentId: 'only',
  label: '无关联',
  groupId: 'a',
  groupLabel: 'A',
  startUtc: '2026-11-02T01:00:00Z',
  endUtc: '2026-11-02T02:00:00Z',
}
void [entries, missingSemantic]

type DayProps = InstanceType<typeof SchedulingDaySchedule>['$props']
const printInputs: Pick<
  DayProps,
  | 'entries'
  | 'date'
  | 'groupId'
  | 'timezone'
  | 'title'
  | 'planLabel'
  | 'statusLabel'
  | 'readOnly'
  | 'readOnlyReason'
> = {
  entries,
  date: '2026-11-02',
  groupId: 'all',
  timezone: 'Asia/Shanghai',
  title: '日安排',
  planLabel: '本页安排',
  statusLabel: '未保存',
  readOnly: true,
  readOnlyReason: '仅供查看',
}
// @ts-expect-error readonly is a boolean host input
const invalidReadOnly: DayProps['readOnly'] = 'true'
void [printInputs, invalidReadOnly]
