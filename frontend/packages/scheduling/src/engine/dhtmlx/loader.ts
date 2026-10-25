// Fixed 9.1.4 Professional Evaluation. The module/CSS failure is cached for this
// page lifetime; there is no provide/inject selection or automatic retry API.
export interface GanttEnterprise {
  getGanttInstance: (settings?: unknown) => unknown
}
export interface GanttModule {
  gantt?: unknown
  Gantt?: GanttEnterprise
}
let cachedModule: GanttModule | null | undefined
let pending: Promise<GanttModule | null> | undefined
const leased = new WeakSet<object>()
async function resolveModule(): Promise<GanttModule | null> {
  if (cachedModule !== undefined) return cachedModule
  return (pending ??= (async () => {
    try {
      const [module] = await Promise.all([
        import('@nerv-iip/scheduling/vendor'),
        import('@nerv-iip/scheduling/vendor.css'),
      ])
      return (cachedModule = module as GanttModule)
    } catch {
      return (cachedModule = null)
    }
  })())
}
function moduleHasGantt(m: GanttModule | null | undefined): boolean {
  return !!(m && (typeof m.Gantt?.getGanttInstance === 'function' || m.gantt))
}
export async function preloadGantt(): Promise<void> {
  await resolveModule()
}
export async function isDhtmlxAvailable(): Promise<boolean> {
  return moduleHasGantt(await resolveModule())
}
/** Factory instances are independent. A legacy singleton may have one owner only. */
export function createGanttInstanceSync(): unknown | null {
  if (!moduleHasGantt(cachedModule)) return null
  const m = cachedModule!
  const instance =
    typeof m.Gantt?.getGanttInstance === 'function' ? m.Gantt.getGanttInstance() : m.gantt
  if (!instance || typeof instance !== 'object' || leased.has(instance)) return null
  leased.add(instance)
  return instance
}
export function releaseGanttInstance(instance: object): void {
  leased.delete(instance)
}
/** Test-only cache injection; not a runtime recovery or engine-selection API. */
export function __setGanttModuleForTest(m: GanttModule | null): void {
  cachedModule = m
  pending = undefined
}
