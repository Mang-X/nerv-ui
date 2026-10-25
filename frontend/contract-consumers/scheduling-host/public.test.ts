import { describe, it, expect } from 'vitest'
import {
  toModel,
  toLockedAssignments,
  evaluateDraft,
  materialReadyLabel,
} from '@nerv-iip/scheduling/host'
import { readingPlan } from './models'
describe('public host adapters', () => {
  it('passes exact source and draft values to host projections and validator', () => {
    const source = { activity: 'reading', revision: 3 }
    const model = readingPlan()
    expect(
      toModel(source, (value) => {
        expect(value).toBe(source)
        return model
      }),
    ).toEqual(model)
    expect(
      toLockedAssignments(model, (value) => {
        expect(value).toBe(model)
        return ['host-lock']
      }),
    ).toEqual(['host-lock'])
    const feedback = {
      tasks: { read: { issues: [{ kind: 'unknown' as const, message: 'host decision' }] } },
    }
    expect(
      evaluateDraft(model, (value) => {
        expect(value).toBe(model)
        return feedback
      }),
    ).toEqual(feedback)
    expect(
      materialReadyLabel(model.tasks[0], (value) => {
        expect(value).toBe(model.tasks[0])
        return 'host label'
      }),
    ).toBe('host label')
  })
})

import { effectScope, ref, shallowRef } from 'vue'
import { useSchedulingPlan } from '@nerv-iip/scheduling/host'
function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (cause: unknown) => void
  const promise = new Promise<T>((yes, no) => {
    resolve = yes
    reject = no
  })
  return { promise, resolve, reject }
}
it('loader receives exact captured context and late A success cannot replace B', async () => {
  const a = deferred<ReturnType<typeof readingPlan>>(),
    b = deferred<ReturnType<typeof readingPlan>>()
  const requests: unknown[] = []
  const scope = effectScope(),
    id = ref<string | undefined>('A'),
    context = ref({ club: 'north' })
  const plan = scope.run(() =>
    useSchedulingPlan(id, context, {
      load: (request, { signal }) => {
        requests.push({ request, signal })
        return request.planId === 'A' ? a.promise : b.promise
      },
      adapt: (source) => source,
    }),
  )!
  id.value = 'B'
  context.value = { club: 'south' }
  b.resolve(readingPlan('B'))
  await b.promise
  await Promise.resolve()
  a.resolve(readingPlan('A'))
  await a.promise
  await Promise.resolve()
  expect(plan.model.value?.meta.planId).toBe('B')
  expect(plan.loading.value).toBe(false)
  expect(requests[0]).toMatchObject({
    request: { planId: 'A', context: { club: 'north' } },
    signal: { aborted: true },
  })
  expect(requests.at(-1)).toMatchObject({ request: { planId: 'B', context: { club: 'south' } } })
  scope.stop()
})

import { useSchedulingEdits } from '@nerv-iip/scheduling/host'
it('preview preserves draft after failure, retries with snapshot, and suppresses duplicate release', async () => {
  const scope = effectScope(),
    model = shallowRef(readingPlan()),
    gate = deferred<ReturnType<typeof readingPlan>>()
  let attempts = 0,
    releases = 0
  const edits = scope.run(() =>
    useSchedulingEdits(model, {
      context: { club: 'north' },
      preview: async (snapshot, control) => {
        expect(snapshot.tasks[0]!.locked).toBe(true)
        expect(control.context).toEqual({ club: 'north' })
        expect(control.signal.aborted).toBe(false)
        if (++attempts === 1) throw new Error('offline')
        return gate.promise
      },
      release: async () => {
        releases++
      },
    }),
  )!
  edits.setLocked('read', true)
  const before = JSON.stringify(model.value)
  await expect(edits.repreview()).rejects.toThrow('offline')
  expect(JSON.stringify(model.value)).toBe(before)
  expect(edits.dirty.value).toBe(true)
  const retry = edits.repreview()
  expect(await edits.release()).toBe(false)
  expect(releases).toBe(0)
  gate.resolve(readingPlan('accepted'))
  expect(await retry).toBe(true)
  expect(model.value.meta.planId).toBe('accepted')
  expect(edits.dirty.value).toBe(false)
  scope.stop()
})

it('missing validator reports unknown for each operation and formatter never invents a material date', () => {
  const model = readingPlan()
  expect(evaluateDraft(model).tasks.read!.issues).toEqual([
    { kind: 'unknown', message: '宿主未提供校验依据。' },
  ])
  expect(materialReadyLabel({ materialReadyUtc: '2026-10-25T00:00:00Z' })).toBeUndefined()
  expect(evaluateDraft({ ...model, tasks: [] }).tasks).toEqual({})
})
it('host projection failures propagate without replacing input records', () => {
  const model = readingPlan(),
    before = JSON.stringify(model)
  expect(() =>
    toModel({ record: 'x' }, () => {
      throw Error('adapter')
    }),
  ).toThrow('adapter')
  expect(() =>
    toLockedAssignments(model, () => {
      throw Error('locks')
    }),
  ).toThrow('locks')
  expect(() =>
    evaluateDraft(model, () => {
      throw Error('validator')
    }),
  ).toThrow('validator')
  expect(JSON.stringify(model)).toBe(before)
})
for (const terminal of ['success', 'failure'] as const) {
  it(`late A ${terminal} cannot change B loading error or result`, async () => {
    const scope = effectScope(),
      a = deferred<ReturnType<typeof readingPlan>>(),
      b = deferred<ReturnType<typeof readingPlan>>()
    const id = ref<string | undefined>('A'),
      ctx = ref({ key: 'x' })
    const state = scope.run(() =>
      useSchedulingPlan(id, ctx, {
        load: (r) => (r.planId === 'A' ? a.promise : b.promise),
        adapt: (x) => x,
      }),
    )!
    id.value = 'B'
    if (terminal === 'success') a.resolve(readingPlan('A'))
    else a.reject(Error('stale'))
    await a.promise.catch(() => {})
    await Promise.resolve()
    expect(state.loading.value).toBe(true)
    expect(state.error.value).toBeUndefined()
    expect(state.model.value).toBeUndefined()
    b.resolve(readingPlan('B'))
    await b.promise
    await Promise.resolve()
    expect(state.model.value?.meta.planId).toBe('B')
    expect(state.error.value).toBeUndefined()
    scope.stop()
  })
  it(`loader disposal ignores late ${terminal}`, async () => {
    const scope = effectScope(),
      gate = deferred<ReturnType<typeof readingPlan>>()
    let signal!: AbortSignal
    const state = scope.run(() =>
      useSchedulingPlan(ref('A'), ref({ key: 'x' }), {
        load: (_r, c) => {
          signal = c.signal
          return gate.promise
        },
        adapt: (x) => x,
      }),
    )!
    scope.stop()
    expect(signal.aborted).toBe(true)
    const before = {
      model: state.model.value,
      error: state.error.value,
      status: state.status.value,
      loading: state.loading.value,
    }
    if (terminal === 'success') gate.resolve(readingPlan('late'))
    else gate.reject(Error('late'))
    await gate.promise.catch(() => {})
    await Promise.resolve()
    expect({
      model: state.model.value,
      error: state.error.value,
      status: state.status.value,
      loading: state.loading.value,
    }).toEqual(before)
    expect(await state.reload()).toBe(false)
  })
}
it('loader failure retries, cancel isolates result, absent callbacks and absent source remain unknown', async () => {
  const scope = effectScope(),
    id = ref<string | undefined>('A'),
    ctx = ref({ key: 'x' }),
    gate = deferred<ReturnType<typeof readingPlan>>()
  let attempts = 0
  const state = scope.run(() =>
    useSchedulingPlan(id, ctx, {
      load: async () => {
        if (++attempts === 1) throw Error('offline')
        if (attempts === 2) return gate.promise
        return undefined
      },
      adapt: (x) => x,
    }),
  )!
  await Promise.resolve()
  await Promise.resolve()
  expect(state.status.value).toBe('error')
  const retry = state.reload()
  state.cancel()
  gate.resolve(readingPlan('cancelled'))
  expect(await retry).toBe(false)
  expect(state.model.value).toBeUndefined()
  expect(await state.reload()).toBe(false)
  expect(state.status.value).toBe('unknown')
  id.value = undefined
  expect(state.status.value).toBe('idle')
  expect(state.loading.value).toBe(false)
  scope.stop()
  const missingScope = effectScope()
  const missing = missingScope.run(() => useSchedulingPlan(ref('A'), ref({ key: 'x' })))!
  expect(missing.status.value).toBe('unknown')
  expect(missing.model.value).toBeUndefined()
  missingScope.stop()
})
for (const kind of ['preview', 'release'] as const) {
  for (const boundary of ['cancel', 'context', 'model', 'dispose'] as const) {
    for (const terminal of ['success', 'failure'] as const) {
      it(`${kind} ${boundary} isolates late ${terminal} from current draft`, async () => {
        const scope = effectScope(),
          model = shallowRef(readingPlan()),
          context = ref({ key: 'A' }),
          gate = deferred<ReturnType<typeof readingPlan>>()
        let signal!: AbortSignal
        const edits = scope.run(() =>
          useSchedulingEdits(model, () => ({
            context: context.value,
            preview: (_snapshot, c) => {
              signal = c.signal
              return gate.promise
            },
            release: async (_id, c) => {
              signal = c.signal
              await gate.promise
            },
          })),
        )!
        edits.setLocked('read', true)
        const pending = kind === 'preview' ? edits.repreview() : edits.release()
        if (boundary === 'cancel') edits.cancel()
        if (boundary === 'context') context.value = { key: 'B' }
        if (boundary === 'model') model.value = readingPlan('B')
        if (boundary === 'dispose') scope.stop()
        expect(signal.aborted).toBe(true)
        const before = {
          model: JSON.stringify(model.value),
          status: edits.status.value,
          error: edits.error.value,
          dirty: edits.dirty.value,
        }
        if (terminal === 'success') gate.resolve(readingPlan('late'))
        else gate.reject(Error('late'))
        expect(await pending).toBe(false)
        expect({
          model: JSON.stringify(model.value),
          status: edits.status.value,
          error: edits.error.value,
          dirty: edits.dirty.value,
        }).toEqual(before)
        scope.stop()
      })
    }
  }
}
it('release failure keeps dirty model and retry sends exact plan and captured context', async () => {
  const scope = effectScope(),
    original = readingPlan(),
    model = shallowRef(original),
    context = ref({ key: 'A' })
  let attempts = 0
  const edits = scope.run(() =>
    useSchedulingEdits(model, () => ({
      context: context.value,
      release: async (id, c) => {
        expect(id).toBe('reading')
        expect(c.context).toEqual({ key: 'A' })
        if (++attempts === 1) throw Error('denied')
      },
    })),
  )!
  edits.setLocked('read', true)
  const before = JSON.stringify(model.value)
  await expect(edits.release()).rejects.toThrow('denied')
  expect(JSON.stringify(model.value)).toBe(before)
  expect(edits.dirty.value).toBe(true)
  expect(await edits.release()).toBe(true)
  expect(edits.dirty.value).toBe(false)
  expect(original.tasks[0]!.locked).toBe(false)
  scope.stop()
})
it('missing edit callbacks never succeed and local history does not mutate controlled input', async () => {
  const scope = effectScope(),
    original = readingPlan(),
    model = shallowRef(original)
  const edits = scope.run(() => useSchedulingEdits(model))!
  edits.setLocked('read', true)
  expect(original.tasks[0]!.locked).toBe(false)
  edits.undo()
  expect(model.value.tasks[0]!.locked).toBe(false)
  edits.redo()
  expect(model.value.tasks[0]!.locked).toBe(true)
  expect(await edits.repreview()).toBe(false)
  expect(edits.status.value).toBe('unknown')
  expect(await edits.release()).toBe(false)
  expect(edits.dirty.value).toBe(true)
  model.value = readingPlan('replacement')
  expect(edits.canUndo.value).toBe(false)
  scope.stop()
})
it('host preview can mutate its snapshot without touching the draft and release pending prevents repeats', async () => {
  const scope = effectScope(),
    model = shallowRef(readingPlan()),
    gate = deferred<void>()
  let calls = 0
  const edits = scope.run(() =>
    useSchedulingEdits(model, {
      preview: async (snapshot) => {
        snapshot.tasks[0]!.text = 'host-mutated'
        throw Error('no')
      },
      release: async () => {
        calls++
        await gate.promise
      },
    }),
  )!
  await expect(edits.repreview()).rejects.toThrow('no')
  expect(model.value.tasks[0]!.text).toBe('共读')
  const pending = edits.release()
  expect(await edits.release()).toBe(false)
  expect(await edits.repreview()).toBe(false)
  edits.setLocked('read', true)
  expect(model.value.tasks[0]!.locked).toBe(false)
  expect(calls).toBe(1)
  gate.resolve()
  expect(await pending).toBe(true)
  scope.stop()
})

for (const terminal of ['success', 'failure'] as const) {
  it(`new context preview stays pending after old preview ${terminal}`, async () => {
    const scope = effectScope(),
      model = shallowRef(readingPlan()),
      context = ref({ key: 'A' })
    const a = deferred<ReturnType<typeof readingPlan>>(),
      b = deferred<ReturnType<typeof readingPlan>>()
    const edits = scope.run(() =>
      useSchedulingEdits(model, () => ({
        context: context.value,
        preview: (_m, c) => (c.context?.key === 'A' ? a.promise : b.promise),
      })),
    )!
    const old = edits.repreview()
    context.value = { key: 'B' }
    model.value = readingPlan('B')
    const current = edits.repreview()
    if (terminal === 'success') a.resolve(readingPlan('A'))
    else a.reject(Error('late A'))
    expect(await old).toBe(false)
    expect(edits.busy.value).toBe(true)
    expect(edits.error.value).toBeUndefined()
    expect(model.value.meta.planId).toBe('B')
    b.resolve(readingPlan('accepted B'))
    expect(await current).toBe(true)
    expect(model.value.meta.planId).toBe('accepted B')
    scope.stop()
  })
}
