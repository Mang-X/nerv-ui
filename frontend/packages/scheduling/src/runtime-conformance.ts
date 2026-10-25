import type { SchedulingEngine } from './engine/engine'

/** @deprecated Test registration moved to @nerv-iip/scheduling/test-support. */
export function runEngineConformance(_makeEngine: () => SchedulingEngine): never {
  throw new Error(
    'runEngineConformance is test-only; import from @nerv-iip/scheduling/test-support',
  )
}
