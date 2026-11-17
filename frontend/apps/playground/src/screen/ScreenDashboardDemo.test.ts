import { mount, flushPromises } from '@vue/test-utils'
import { expect, it } from 'vitest'
import Demo from './ScreenDashboardDemo.vue'
import { dashboardInput } from './dashboardInput'
it('ignores late updates after source switch and shows rejected updates without inventing data', async () => {
  let finish!: (value: ReturnType<typeof dashboardInput>) => void
  const w = mount(Demo, {
    props: {
      load: () =>
        new Promise((resolve) => {
          finish = resolve
        }),
    },
  })
  const click = async (text: string) =>
    w
      .findAll('button')
      .find((b) => b.text() === text)!
      .trigger('click')
  await click('更新安排')
  expect(w.text()).toContain('正在更新')
  await click('展览安排')
  finish({ ...dashboardInput('reading'), title: '过时结果' })
  await flushPromises()
  expect(w.text()).toContain('本周展出作品')
  expect(w.text()).not.toContain('过时结果')
  await w.setProps({
    load: async () => {
      throw new Error('unavailable')
    },
  })
  await click('更新安排')
  await flushPromises()
  expect(w.text()).toContain('更新失败')
  expect(w.text()).toContain('本周展出作品')
  await w.setProps({
    load: async () => ({ ...dashboardInput('exhibition'), rows: [], distribution: [] }),
  })
  await click('更新安排')
  await flushPromises()
  expect(w.text()).toContain('暂无安排')
  expect(w.text()).not.toContain('更新失败')
  w.unmount()
})
it('applies only the latest successful update and ignores completion after unmount', async () => {
  const replies: ((value: ReturnType<typeof dashboardInput>) => void)[] = []
  const w = mount(Demo, { props: { load: () => new Promise((resolve) => replies.push(resolve)) } })
  const update = () =>
    w
      .findAll('button')
      .find((b) => b.text() === '更新安排')!
      .trigger('click')
  await update()
  await update()
  replies[1]!({ ...dashboardInput('reading'), title: '当前安排' })
  await flushPromises()
  expect(w.text()).toContain('当前安排')
  replies[0]!({ ...dashboardInput('reading'), title: '旧安排' })
  await flushPromises()
  expect(w.text()).not.toContain('旧安排')
  await update()
  w.unmount()
  replies[2]!({ ...dashboardInput('reading'), title: '卸载后' })
  await flushPromises()
  expect(w.emitted('error')).toBeUndefined()
})
