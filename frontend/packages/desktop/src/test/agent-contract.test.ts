import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import NvButton from '../components/button/NvButton.vue'
import { createAgent } from '../agent'
import { samples } from './samples'

/**
 * 代理契约：ui-sdk 的桥能不能看见这个组件、能不能叫出它的动作。
 *
 * 这一条和「行为必须来自 ui-sdk 原语」是同一件事的两面：一个组件如果绕开原语
 * 自己写交互，它就不会出现在 `snapshot()` 里——测试会红，而这正是我们要的。
 *
 * 断言只取结构、名称与动作，不去比 DOM 形状：形状会随样式调整变，契约不会。
 */

const agent = createAgent()

afterEach(() => {
  document.body.replaceChildren()
})

/** 桥每秒最多折一次；组件挂载后等它登记完再读。 */
async function snapshotOf(wrapper: ReturnType<typeof mount>, component: string) {
  for (let i = 0; i < 40; i++) {
    const entries = agent.snapshot().filter((entry) => !entry.offPage)
    const own = entries.filter((entry) => entry.component === component)
    if (own.length) return own
    await wrapper.vm.$nextTick()
    await new Promise((resolve) => setTimeout(resolve, 20))
  }
  return []
}

describe('代理桥：每个组件都要能被找到', () => {
  const cases = Object.keys(samples) as Array<keyof typeof samples>

  for (const name of cases) {
    it(`${name} 登记进桥，并且有名字`, async () => {
      const wrapper = mount(samples[name](), { attachTo: document.body })
      const own = await snapshotOf(wrapper, name)

      expect(own.length, `${name} 没有登记进代理桥——它可能没有走 ui-sdk 原语`).toBeGreaterThan(0)

      // `label` 是代理定位控件的唯一手段：没名字就是找不到。
      for (const entry of own) {
        expect(entry.label, `${name} 的条目 ${entry.ref} 没有可访问名称`).toBeTruthy()
      }

      wrapper.unmount()
    })
  }

  it('同页的多个控件各带各的名字', async () => {
    // 代理按名字定位：两个按钮同名时只能命中第一个，所以名字必须能区分它们。
    const wrapper = mount(
      {
        render: () => [
          h(NvButton, { 'aria-label': '保存' }),
          h(NvButton, { 'aria-label': '取消' }),
        ],
      },
      { attachTo: document.body },
    )
    await new Promise((resolve) => setTimeout(resolve, 80))
    const buttons = agent
      .snapshot()
      .filter((entry) => !entry.offPage && entry.component === 'button')
      .slice(-2)
    expect(buttons.map((entry) => entry.label).sort()).toEqual(['保存', '取消'])
    wrapper.unmount()
  })
})

describe('代理桥：动作能真的改变组件', () => {
  it('carousel 的 play 走组件 API', async () => {
    const wrapper = mount(samples.carousel(), { attachTo: document.body })
    const [entry] = await snapshotOf(wrapper, 'carousel')
    expect(entry, 'carousel 没进桥').toBeDefined()

    // jsdom 没有布局，页数是量的结果——这里只断言与布局无关的那条：
    // 播放状态要真的落到组件根上（`data-playing` 是 ui-sdk 自己写的）。
    expect(entry.actions).toEqual(
      expect.arrayContaining(['setPage', 'next', 'previous', 'setPlaying', 'play', 'pause']),
    )
    const result = await agent.act({ steps: [{ ref: entry.ref, action: 'play' }] })
    expect(result.ok).toBe(true)
    await wrapper.vm.$nextTick()
    expect(wrapper.find('[aria-roledescription="carousel"]').attributes('data-playing')).toBe('')

    wrapper.unmount()
  })

  it('input 的 setValue 走组件 API，而不是直接改 DOM', async () => {
    const wrapper = mount(samples.input(), { attachTo: document.body })
    const [entry] = await snapshotOf(wrapper, 'input')
    expect(entry, 'input 没进桥').toBeDefined()
    expect(entry.actions).toEqual(expect.arrayContaining(['setValue', 'clear']))

    const result = await agent.act({
      steps: [{ ref: entry.ref, action: 'setValue', args: ['A-01'] }],
    })
    expect(result.ok).toBe(true)
    expect(wrapper.find('input').element.value).toBe('A-01')

    wrapper.unmount()
  })
})
