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

/** 桥按帧收集组件；挂载后等它把这一份登记完再读。 */
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

      // `label` 是代理定位控件的唯一手段：没名字就是找不到。
      for (const entry of own) {
        expect(entry.label, `${name} 的 ${kind} 条目 ${entry.ref} 没有可访问名称`).toBeTruthy()
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

describe('代理桥：聚焦与导航由原语承担', () => {
  it('timeline 只有一个 Tab 停点，落在进行中的那个事件上', async () => {
    const wrapper = mount(samples.timeline.render(), { attachTo: document.body })
    const [entry] = await snapshotOf(wrapper, 'timeline')
    expect(entry, 'timeline 没进桥').toBeDefined()
    // 纯展示：事件文本进得去，但没有可叫的动作。
    expect(entry.text).toEqual(['记录创建', '开始处理'])
    expect(entry.actions).toEqual([])

    const items = wrapper.findAll('[role="listitem"]')
    const current = items.find((item) => item.attributes('aria-current') === 'step')
    expect(current?.attributes('tabindex')).toBe('0')
    expect(items[0].attributes('tabindex')).toBe('-1')

    wrapper.unmount()
  })
})

describe('代理桥：动作能真的改变组件', () => {
  it('carousel 的 play 走组件 API', async () => {
    const wrapper = mount(samples.carousel.render(), { attachTo: document.body })
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
    const wrapper = mount(samples.input.render(), { attachTo: document.body })
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

  it('tabs 的 setValue 切换面板', async () => {
    const wrapper = mount(samples.tabs.render(), { attachTo: document.body })
    const [entry] = await snapshotOf(wrapper, 'tabs')
    expect(entry, 'tabs 没进桥').toBeDefined()
    expect(entry.actions).toEqual(expect.arrayContaining(['setValue']))

    const result = await agent.act({
      steps: [{ ref: entry.ref, action: 'setValue', args: ['logs'] }],
    })
    expect(result.ok).toBe(true)
    await wrapper.vm.$nextTick()
    const selected = wrapper
      .findAll('[role="tab"]')
      .find((tab) => tab.attributes('aria-selected') === 'true')
    expect(selected?.text()).toBe('日志')

    wrapper.unmount()
  })

  it('dialog 的 setOpen 打开后能读出标题', async () => {
    const wrapper = mount(samples.dialog.render(), { attachTo: document.body })
    const [entry] = await snapshotOf(wrapper, 'dialog')
    expect(entry, 'dialog 没进桥').toBeDefined()
    expect(entry.actions).toEqual(expect.arrayContaining(['setOpen']))

    const result = await agent.act({
      steps: [{ ref: entry.ref, action: 'setOpen', args: [false] }],
    })
    expect(result.ok).toBe(true)

    wrapper.unmount()
  })

  it('sidebar 的 setCollapsed 收起后窄轨条目仍然有名字', async () => {
    const wrapper = mount(samples.sidebar.render(), { attachTo: document.body })
    const [entry] = await snapshotOf(wrapper, 'sidebar')
    expect(entry, 'sidebar 没进桥').toBeDefined()
    expect(entry.actions).toEqual(expect.arrayContaining(['setCollapsed']))

    const result = await agent.act({
      steps: [{ ref: entry.ref, action: 'setCollapsed', args: [true] }],
    })
    expect(result.ok).toBe(true)
    await wrapper.vm.$nextTick()

    const nav = wrapper.find('nav[aria-label="主导航"]')
    expect(nav.attributes('data-collapsed')).toBe('')
    // 收起后文字节点被移除，名字得靠 aria-label 兜住——否则读屏与代理都找不到。
    const item = wrapper.find('[data-slot="button"]')
    expect(item.text()).toBe('')
    expect(item.attributes('aria-label')).toBe('项目看板')

    wrapper.unmount()
  })
})
