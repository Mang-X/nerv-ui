import { shallowRef } from 'vue'

export interface SpaceReading {
  sourceId: string
  sequence: number
  text: string
}

/** Host-owned in-memory transport. Captures identity and outcome at request time. */
export function createSpaceFeed(id: string, name: string) {
  const requests = shallowRef(0)
  const held = shallowRef(false)
  const pending = shallowRef(false)
  const completions: (() => void)[] = []
  const fetcher = (fail = false): Promise<SpaceReading> => {
    const sequence = ++requests.value
    const result = { sourceId: id, sequence, text: `${name} · ${id} · ${sequence}` }
    return new Promise((resolve, reject) => {
      const finish = () => {
        if (fail) reject(new Error(`${name}暂不可用`))
        else resolve(result)
      }
      if (held.value) {
        pending.value = true
        completions.push(finish)
      } else finish()
    })
  }
  function release() {
    const batch = completions.splice(0)
    pending.value = false
    batch.forEach((finish) => finish())
  }
  return { id, name, requests, held, pending, fetcher, release }
}
export type SpaceFeed = ReturnType<typeof createSpaceFeed>

export const spaceRows = Array.from({ length: 12 }, (_, index) => ({
  id: `space-${index + 1}`,
  text: `${String(index + 1).padStart(2, '0')} · ${['街角共读', '河岸影像', '城市散步', '晚间分享'][index % 4]}`,
}))
