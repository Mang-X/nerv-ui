import { useColorMode, useTheme } from '@nerv-iip/ui'
import { onBeforeUnmount, shallowRef, watch, type Ref } from 'vue'
import type {
  EngineCommand,
  EngineEvents,
  SchedulingEngine,
  SchedulingEngineOptions,
  TimeScale,
} from '../engine/engine'
import { DhtmlxEngine } from '../engine/dhtmlx/DhtmlxEngine'
import { isDhtmlxAvailable, preloadGantt } from '../engine/dhtmlx/loader'
import type { LaneOrder, ScheduleModel } from '../model/types'
export type EngineKind = 'auto' | 'dhtmlx'
const TOKEN_NAMES = [
  '--nv-brand',
  '--destructive',
  '--nv-warning',
  '--nv-success',
  '--muted',
  '--muted-foreground',
  '--border',
  '--foreground',
  '--card',
]
function readTokens(): Record<string, string> {
  if (typeof document === 'undefined') return {}
  const style = getComputedStyle(document.documentElement)
  return Object.fromEntries(
    TOKEN_NAMES.map((n) => [n, style.getPropertyValue(n).trim()]).filter(([, v]) => v),
  )
}
export interface UseEngineOptions {
  container: Ref<HTMLElement | undefined>
  model: Ref<ScheduleModel | undefined>
  view: 'order' | 'resource'
  scale: Ref<TimeScale>
  readOnly: Ref<boolean>
  groupBy?: Ref<string | undefined>
  laneOrder?: Ref<LaneOrder | undefined>
  engineKind?: EngineKind
  on?: Partial<{ [E in keyof EngineEvents]: (p: EngineEvents[E]) => void }>
}
export function useEngine(opts: UseEngineOptions) {
  const engine = shallowRef<SchedulingEngine>()
  const engineName = shallowRef<'loading' | 'dhtmlx' | 'unavailable' | 'error'>('loading')
  const error = shallowRef<string>()
  const { isDark } = useColorMode()
  const { theme } = useTheme()
  let generation = 0
  let disposed = false
  let mounting: SchedulingEngine | undefined
  const pendingCommands: EngineCommand[] = []
  function command(value: EngineCommand) {
    if (engine.value) engine.value.applyCommand(value)
    else if (!disposed && engineName.value === 'loading') pendingCommands.push(value)
  }
  function teardown() {
    generation++
    const current = engine.value ?? mounting
    engine.value = undefined
    mounting = undefined
    current?.destroy()
  }
  async function init(container: HTMLElement) {
    teardown()
    const ticket = generation
    error.value = undefined
    engineName.value = 'loading'
    const current = () => !disposed && generation === ticket && opts.container.value === container
    let candidate: SchedulingEngine | undefined
    try {
      await preloadGantt()
      if (!current()) return
      if (!(await isDhtmlxAvailable())) {
        if (current()) {
          engineName.value = 'unavailable'
          pendingCommands.length = 0
        }
        return
      }
      if (!current()) return
      candidate = new DhtmlxEngine()
      mounting = candidate
      for (const [name, cb] of Object.entries(opts.on ?? {}))
        candidate.on(name as keyof EngineEvents, cb as never)
      const options: SchedulingEngineOptions = {
        view: opts.view,
        readOnly: opts.readOnly.value,
        scale: opts.scale.value,
        groupBy: opts.groupBy?.value,
        laneOrder: opts.laneOrder?.value,
        locale: 'zh',
        theme: { isDark: isDark.value, tokens: readTokens() },
      }
      await candidate.mount(container, options)
      if (!current()) {
        candidate.destroy()
        return
      }
      // Inputs may have changed while asynchronous initialization was pending.
      candidate.applyCommand({ kind: 'setReadOnly', readOnly: opts.readOnly.value })
      candidate.applyCommand({ kind: 'scaleTo', scale: opts.scale.value })
      candidate.applyCommand({
        kind: 'setTheme',
        theme: { isDark: isDark.value, tokens: readTokens() },
      })
      if (opts.groupBy)
        candidate.applyCommand({ kind: 'setGroupBy', groupBy: opts.groupBy.value ?? 'workCenter' })
      if (opts.laneOrder)
        candidate.applyCommand({
          kind: 'setLaneOrder',
          laneOrder: opts.laneOrder.value ?? 'busiest',
        })
      if (opts.model.value) candidate.setData(opts.model.value)
      mounting = undefined
      engine.value = candidate
      engineName.value = 'dhtmlx'
      pendingCommands.splice(0).forEach(command)
    } catch (cause) {
      candidate?.destroy()
      if (!current()) return
      mounting = undefined
      engineName.value = 'error'
      error.value = cause instanceof Error ? cause.message : String(cause)
      pendingCommands.length = 0
    }
  }
  watch(
    opts.container,
    (el) => {
      if (el) void init(el)
      else teardown()
    },
    { immediate: true, flush: 'post' },
  )
  watch(
    opts.model,
    (m) => {
      if (m) engine.value?.setData(m)
      else if (engine.value && opts.container.value) void init(opts.container.value)
    },
    { deep: true },
  )
  watch(opts.scale, (scale) => engine.value?.applyCommand({ kind: 'scaleTo', scale }))
  watch(opts.readOnly, (readOnly) => engine.value?.applyCommand({ kind: 'setReadOnly', readOnly }))
  if (opts.groupBy)
    watch(opts.groupBy, (g) =>
      engine.value?.applyCommand({ kind: 'setGroupBy', groupBy: g ?? 'workCenter' }),
    )
  if (opts.laneOrder)
    watch(opts.laneOrder, (o) =>
      engine.value?.applyCommand({ kind: 'setLaneOrder', laneOrder: o ?? 'busiest' }),
    )
  watch(
    [isDark, theme],
    ([d]) =>
      engine.value?.applyCommand({ kind: 'setTheme', theme: { isDark: d, tokens: readTokens() } }),
    { flush: 'post' },
  )
  onBeforeUnmount(() => {
    disposed = true
    pendingCommands.length = 0
    teardown()
  })
  return { engine, engineName, error, command }
}
