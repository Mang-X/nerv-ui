import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createAgent } from '../agent'
import { samples } from './samples'

/**
 * 代理契约：组件能不能被桥看见、能不能叫出它的动作。
 *
 * 和桌面端同一套判据：没登记 → 没走原语；没名字 → 代理找不到。断言只取结构、
 * 名称与动作，不比 DOM 形状。
 */

const agent = createAgent()

afterEach(() => {
  document.body.replaceChildren()
})

async function snapshotOf(wrapper: ReturnType<typeof mount>, kind: string) {
  for (let i = 0; i < 40; i++) {
    const own = agent.snapshot().filter((entry) => !entry.offPage && entry.component === kind)
    if (own.length) return own
    await wrapper.vm.$nextTick()
    await new Promise((resolve) => setTimeout(resolve, 20))
  }
  return []
}

describe('代理桥：每个组件都要能被找到', () => {
  for (const [name, { kind, render }] of Object.entries(samples)) {
    it(`${name} 登记进桥，并且有名字`, async () => {
      const wrapper = mount(render(), { attachTo: document.body })
      const own = await snapshotOf(wrapper, kind)

      expect(own.length, `${name} 没有登记成 ${kind}——它可能没有走 ui-sdk 原语`).toBeGreaterThan(0)
      for (const entry of own) {
        expect(entry.label, `${name} 的 ${kind} 条目 ${entry.ref} 没有可访问名称`).toBeTruthy()
      }

      wrapper.unmount()
    })
  }
})
