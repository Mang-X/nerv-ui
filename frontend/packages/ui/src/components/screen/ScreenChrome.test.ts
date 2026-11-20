import { mount } from '@vue/test-utils'
import { afterEach, expect, it, vi } from 'vitest'
import { h } from 'vue'
import { NvScreenPanel, NvBorderPanel, NvTechFrame, NvTitleBar, NvScreenHeader } from '@nerv-ui/ui'

const wrappers: ReturnType<typeof mount>[] = []
afterEach(() => {
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount())
})

it('preserves public panel extra, title-extra and body slot actions', async () => {
  const actions = [vi.fn(), vi.fn(), vi.fn()]
  const wrapper = mount(NvScreenPanel, {
    props: { title: '街角书房', accent: 'cyan' },
    slots: {
      'title-extra': () => h('button', { onClick: actions[0] }, '阅读说明'),
      extra: () => h('button', { onClick: actions[1] }, '切换展厅'),
      default: () => h('button', { onClick: actions[2] }, '开始阅读'),
    },
  })
  wrappers.push(wrapper)
  expect(wrapper.text()).toContain('街角书房')
  for (const button of wrapper.findAll('button')) await button.trigger('click')
  actions.forEach((action) => expect(action).toHaveBeenCalledTimes(1))
})

it('preserves border title fallback and title/default slot actions plus tech-frame content', async () => {
  const fallback = mount(NvBorderPanel, {
    props: { title: '今日相聚' },
    slots: { default: '欢迎来访' },
  })
  wrappers.push(fallback)
  expect(fallback.text()).toContain('今日相聚')
  expect(fallback.text()).toContain('欢迎来访')
  const titleAction = vi.fn()
  const bodyAction = vi.fn()
  const border = mount(NvBorderPanel, {
    props: { title: 'fallback heading' },
    slots: {
      title: () => h('button', { onClick: titleAction }, '查看今日安排'),
      default: () =>
        h(
          NvTechFrame,
          { accent: 'green' },
          { default: () => h('button', { onClick: bodyAction }, '点亮留言') },
        ),
    },
  })
  wrappers.push(border)
  expect(border.text()).not.toContain('fallback heading')
  await border.get('button').trigger('click')
  await border.findAll('button')[1]!.trigger('click')
  expect(titleAction).toHaveBeenCalledTimes(1)
  expect(bodyAction).toHaveBeenCalledTimes(1)
})

it('uses explicit host header and title inputs while preserving legacy defaults', async () => {
  const wrapper = mount(NvScreenHeader, {
    props: {
      title: '城市文化空间',
      time: '10:24:36',
      date: '星期日',
      line: '全城空间',
      screen: '城市客厅 01',
    },
  })
  wrappers.push(wrapper)
  for (const text of ['城市文化空间', '10:24:36', '星期日', '全城空间', '城市客厅 01'])
    expect(wrapper.text()).toContain(text)
  expect(wrapper.findAll('button, [role="button"], a')).toHaveLength(0)
  await wrapper.setProps({ time: '', date: '', line: '', screen: '' })
  expect(wrapper.text()).toBe('城市文化空间')
  const header = mount(NvScreenHeader)
  const title = mount(NvTitleBar)
  wrappers.push(header, title)
  expect(header.get('h1').text()).toBe('智能工厂 MES 运营看板')
  expect(header.text()).toContain('2024-06-12 10:24:36')
  expect(title.get('h2').text()).toBe('产线综合监控')
  await title.setProps({ title: '让日常，多一处停留', sub: '阅读 · 展览 · 交流' })
  expect(title.text()).toContain('让日常，多一处停留')
  expect(title.text()).toContain('阅读 · 展览 · 交流')
})
