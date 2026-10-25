import type { ScheduleFact, ScheduleFactInput, ScheduleTaskFacts, ScheduleFactRow } from './types'

type FactModel = { tasks: readonly ({ id: string } & ScheduleTaskFacts)[] }
type ProjectedFactTask<M extends FactModel> = Omit<M['tasks'][number], 'facts'> & {
  facts: readonly ScheduleFactRow[]
}

function displayFact(fact: ScheduleFact): [string, string] {
  if (fact.state === 'known') return [fact.label, String(fact.value)]
  return [
    fact.label,
    fact.text ?? { unknown: '未知', forbidden: '无权读取', unavailable: '暂不可读取' }[fact.state],
  ]
}

/** Historical name retained. Host projects domain facts and authority by task identity. */
export function withWorkOrderFacts<M extends FactModel>(
  model: M,
  inputs: readonly ScheduleFactInput[],
): Omit<M, 'tasks'> & { tasks: ProjectedFactTask<M>[] } {
  const byId = new Map(inputs.map((input) => [input.taskId, input.facts]))
  return {
    ...model,
    tasks: model.tasks.map(
      (task: M['tasks'][number]): ProjectedFactTask<M> => ({
        ...task,
        facts: (byId.get(task.id) ?? [{ label: '事实', state: 'unknown' } as const]).map((fact) => {
          const [label, value] = displayFact(fact)
          return { label, value }
        }),
      }),
    ),
  }
}

/** One display source for cards, tooltips and detail rows; never derives domain risk/status. */
export function taskFactRows(task: ScheduleTaskFacts): Array<[string, string]> {
  return task.facts?.map(({ label, value }) => [label, value]) ?? [['事实', '未知']]
}
