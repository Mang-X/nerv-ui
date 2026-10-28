import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { NvScreenDetailDialog, NvScreenParameter } from '../../index'
const wrappers: ReturnType<typeof mount>[] = []
afterEach(() => {
  wrappers.splice(0).forEach((w) => w.unmount())
  document.body.innerHTML = ''
  vi.restoreAllMocks()
})
it('Parameter_NearestUsesViewportRatio_EndpointsAndKeyboard', async () => {
  const w = mount(NvScreenParameter, {
    props: {
      label: '照度',
      value: 0,
      unit: 'lx',
      range: '0–100',
      samples: [0, 12.34567, 40],
      sampleLabels: ['起点', '中点', '终点'],
    },
  })
  wrappers.push(w)
  expect(w.get('[data-current]').text()).toBe('0')
  const plot = w.get('[data-plot]')
  vi.spyOn(plot.element, 'getBoundingClientRect').mockReturnValue({
    left: 100,
    width: 480,
  } as DOMRect)
  plot.element.dispatchEvent(new MouseEvent('pointermove', { clientX: 340, bubbles: true }))
  await nextTick()
  expect(w.get('[data-sample]').text()).toContain('12.346')
  expect(w.get('[data-cursor]').attributes('style')).toContain('left: 50%')
  await plot.trigger('keydown', { key: 'End' })
  expect(w.get('[data-sample]').text()).toContain('终点')
  await plot.trigger('keydown', { key: 'Home' })
  expect(w.get('[data-sample]').text()).toContain('起点')
  await plot.trigger('pointerleave')
  expect(w.find('[data-sample]').exists()).toBe(false)
  expect(w.text()).toContain('0–100')
  expect(w.findAll('header > span').map((node) => node.text())).toContain('lx')
})
it('Parameter_ReplacementSameKeyMutationAndMissing_ClearOldReadout', async () => {
  const w = mount(NvScreenParameter, { props: { label: '计数', value: null, samples: [1, 2] } })
  wrappers.push(w)
  await w.get('[data-plot]').trigger('keydown', { key: 'End' })
  expect(w.get('[data-sample]').text()).toContain('2')
  await w.setProps({ samples: [3, 4] })
  expect(w.find('[data-sample]').exists()).toBe(false)
  await w.get('[data-plot]').trigger('keydown', { key: 'Home' })
  await w.setProps({ samples: [] })
  expect(w.find('[data-sample]').exists()).toBe(false)
  expect(w.get('[data-current]').text()).toBe('—')
  expect(w.find('path').exists()).toBe(false)
  await w.setProps({ samples: [0] })
  await w.get('[data-plot]').trigger('keydown', { key: 'Home' })
  expect(w.get('[data-sample]').text()).toContain('0')
  await w.setProps({ samples: [NaN, Infinity, 2] })
  await w.get('[data-plot]').trigger('keydown', { key: 'Home' })
  expect(w.get('[data-sample]').text()).toContain('—')
  expect(w.find('path').exists()).toBe(false)
})
it('Dialog_RealPortalSlotsStatesAndControlledRefusal', async () => {
  const update = vi.fn()
  const w = mount(NvScreenDetailDialog, {
    attachTo: document.body,
    props: {
      open: true,
      title: '空间详情',
      description: '当前窗口',
      state: 'data',
      'onUpdate:open': update,
    },
    slots: { info: '位置资料', parameter: '当前参数', history: '历史记录' },
  })
  wrappers.push(w)
  await nextTick()
  expect(document.body.querySelector('[role="dialog"]')?.textContent).toContain('历史记录')
  document.body.querySelector<HTMLButtonElement>('[aria-label="关闭详情"]')!.click()
  await nextTick()
  expect(update).toHaveBeenCalledWith(false)
  expect(document.body.querySelector('[role="dialog"]')).not.toBeNull()
  await w.setProps({ state: 'pending', statusText: '正在读取' })
  expect(document.body.textContent).toContain('正在读取')
  expect(document.body.textContent).not.toContain('位置资料')
  await w.setProps({ state: 'error', statusText: '读取失败' })
  expect(document.body.querySelector('[role="alert"]')?.textContent).toBe('读取失败')
  await w.setProps({ state: 'empty', statusText: '暂无观测' })
  expect(document.body.textContent).toContain('暂无观测')
  await w.setProps({ open: false })
  await flushPromises()
  expect(document.body.querySelector('[role="dialog"]')).toBeNull()
})
it('Dialog_TriggerFocusEscapeReturnAndMask_CloseAccepted', async () => {
  const { defineComponent, h, ref } = await import('vue')
  const Host = defineComponent({
    setup() {
      const open = ref(false)
      return () =>
        h(
          NvScreenDetailDialog,
          {
            open: open.value,
            'onUpdate:open': (v: boolean) => (open.value = v),
            title: '焦点详情',
            description: '独立窗口',
            state: 'data',
          },
          {
            trigger: () => h('button', { id: 'detail-trigger' }, '打开'),
            info: () => h('button', { id: 'inside' }, '内部操作'),
          },
        )
    },
  })
  const w = mount(Host, { attachTo: document.body })
  wrappers.push(w)
  const trigger = document.querySelector<HTMLButtonElement>('#detail-trigger')!
  trigger.focus()
  trigger.click()
  await flushPromises()
  expect(document.querySelector('[role="dialog"]')?.contains(document.activeElement)).toBe(true)
  document.activeElement!.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
  )
  await flushPromises()
  expect(document.querySelector('[role="dialog"]')).toBeNull()
  expect(document.activeElement).toBe(trigger)
  trigger.click()
  await flushPromises()
  await new Promise((resolve) => setTimeout(resolve, 0))
  const mask = document.querySelector('[data-slot="nv-screen-detail-mask"]')!
  mask.dispatchEvent(new MouseEvent('pointerdown', { button: 0, bubbles: true }))
  await flushPromises()
  expect(document.querySelector('[role="dialog"]')).toBeNull()
  w.unmount()
  wrappers.splice(wrappers.indexOf(w), 1)
  expect(document.querySelector('[role="dialog"]')).toBeNull()
})
it('Parameter_InPlaceMutationAndIndependentInstances', async () => {
  const { reactive } = await import('vue')
  const samples = reactive([1, 2])
  const a = mount(NvScreenParameter, { props: { label: '甲', value: 2, samples } })
  const b = mount(NvScreenParameter, { props: { label: '乙', value: 9, samples: [9] } })
  wrappers.push(a, b)
  await a.get('[data-plot]').trigger('keydown', { key: 'End' })
  expect(a.get('[data-sample]').text()).toContain('2')
  expect(b.find('[data-sample]').exists()).toBe(false)
  samples[1] = 8
  await nextTick()
  expect(a.find('[data-sample]').exists()).toBe(false)
  await a.get('[data-plot]').trigger('keydown', { key: 'End' })
  expect(a.get('[data-sample]').text()).toContain('8')
  await a.setProps({ samples: [NaN, Infinity] })
  expect(a.find('path').exists()).toBe(false)
})

it('Dialog_TwoInstancesOnlyTopLayerEscapesAndUnmountCleans', async () => {
  const { defineComponent, h, ref } = await import('vue')
  const Host = defineComponent({
    setup() {
      const a = ref(true),
        b = ref(true)
      return () =>
        h('div', [
          h(NvScreenDetailDialog, {
            open: a.value,
            'onUpdate:open': (v: boolean) => (a.value = v),
            title: '甲窗口',
            description: '甲',
            state: 'data',
          }),
          h(NvScreenDetailDialog, {
            open: b.value,
            'onUpdate:open': (v: boolean) => (b.value = v),
            title: '乙窗口',
            description: '乙',
            state: 'data',
          }),
        ])
    },
  })
  const w = mount(Host, { attachTo: document.body })
  wrappers.push(w)
  await flushPromises()
  expect(document.querySelectorAll('[role="dialog"]')).toHaveLength(2)
  document.activeElement!.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
  )
  await flushPromises()
  expect(document.querySelectorAll('[role="dialog"]')).toHaveLength(1)
  expect(document.querySelector('[role="dialog"]')?.textContent).toContain('甲窗口')
  w.unmount()
  wrappers.splice(wrappers.indexOf(w), 1)
  await flushPromises()
  expect(document.querySelectorAll('[role="dialog"]')).toHaveLength(0)
  expect(document.body.style.pointerEvents).toBe('')
})
it('Parameter_ClampsViewportEndpointsAndRejectsZeroWidth', async () => {
  const w = mount(NvScreenParameter, { props: { label: '数值', value: 1, samples: [-5, 0, 5] } })
  wrappers.push(w)
  const plot = w.get('[data-plot]')
  const rect = vi.spyOn(plot.element, 'getBoundingClientRect')
  for (const width of [120, 480]) {
    rect.mockReturnValue({ left: 100, width } as DOMRect)
    for (const [clientX, expected] of [
      [0, '0%'],
      [100 + width / 2, '50%'],
      [100 + width + 20, '100%'],
    ] as const) {
      plot.element.dispatchEvent(new MouseEvent('pointermove', { clientX, bubbles: true }))
      await nextTick()
      expect(w.get('[data-cursor]').attributes('style')).toContain(`left: ${expected}`)
    }
  }
  rect.mockReturnValue({ left: 100, width: 0 } as DOMRect)
  plot.element.dispatchEvent(new MouseEvent('pointermove', { clientX: 120, bubbles: true }))
  await nextTick()
  expect(w.find('[data-sample]').exists()).toBe(false)
})
