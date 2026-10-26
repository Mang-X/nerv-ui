import type {
  SchedulingAsyncJob,
  SchedulingCandidateSet,
  SchedulingDowntimeItem,
  SchedulingHistoryPlan,
} from '@nerv-iip/scheduling'

const job: SchedulingAsyncJob = {
  id: 'job',
  contextKey: 'reading',
  requestKey: 'request',
  status: 'created',
  input: { baselineId: 'saved', targetKey: 'morning', targetLabel: '晨间共读' },
}
const candidates: SchedulingCandidateSet = {
  contextKey: 'reading',
  baselineId: 'saved',
  jobId: job.id,
  requestKey: job.requestKey,
  candidates: [
    {
      id: 'right',
      label: '原位置顺延',
      metrics: [{ id: 'ctp', label: '承诺比例', format: 'percent', before: null, after: 0 }],
      movements: [],
    },
  ],
}
const plans: readonly SchedulingHistoryPlan[] = [
  { id: 'saved', label: '上午安排', status: '已保存', assignmentCount: 0 },
]
const impacts: readonly SchedulingDowntimeItem[] = [
  {
    id: 'room',
    resourceLabel: '晨光书房',
    startedAt: '09:00（Asia/Shanghai）',
    duration: '30 分钟',
    phase: 'no-etr',
    alternativesCount: null,
  },
]
// @ts-expect-error readonly candidate list cannot be mutated by a consumer
candidates.candidates.push({ id: 'wrong', label: 'wrong' })
const wrongPhase: SchedulingDowntimeItem = {
  id: 'bad',
  resourceLabel: 'room',
  startedAt: '09:00',
  duration: '30 分钟',
  // @ts-expect-error phase must be an explicit host state, not inferred from text
  phase: 'late',
}
// @ts-expect-error a completed result must carry the request identity
const wrongResult: SchedulingAsyncJob = { ...job, result: { promise: { state: 'unknown' } } }
void [plans, impacts, wrongPhase, wrongResult]
