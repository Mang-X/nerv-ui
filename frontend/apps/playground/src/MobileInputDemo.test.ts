import { DOMWrapper, mount } from '@vue/test-utils'
import { afterEach, expect, it, vi } from 'vitest'
import MobileInputDemo from './MobileInputDemo.vue'

let wrapper: ReturnType<typeof mount> | undefined
afterEach(() => {
  wrapper?.unmount()
  document.body.innerHTML = ''
  localStorage.clear()
  vi.unstubAllGlobals()
})

it('submits manual and captured scans, yields to ordinary fields and resumes without losing manual drafts', async () => {
  const frames = new Map<number, FrameRequestCallback>()
  let frameId = 0
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    frames.set(++frameId, callback)
    return frameId
  })
  vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id))
  const flushFrames = () => {
    const pending = [...frames.values()]
    frames.clear()
    pending.forEach((callback) => callback(0))
  }
  wrapper = mount(MobileInputDemo, { attachTo: document.body })
  const scan = wrapper.get<HTMLInputElement>('[data-scan-region] input')
  flushFrames()
  expect(document.activeElement).toBe(scan.element)
  await scan.setValue('  NOTE-01  ')
  await scan.trigger('keydown', { key: 'Enter' })
  expect(wrapper.get('[aria-label="扫码回显"]').text()).toBe('1 次 · NOTE-01')
  expect(scan.element.value).toBe('')
  await scan.setValue('手工草稿')
  const ordinary = wrapper.get<HTMLInputElement>('#note-title')
  ordinary.element.focus()
  await wrapper.vm.$nextTick()
  flushFrames()
  expect(document.activeElement).toBe(ordinary.element)
  expect(wrapper.get('[aria-label="扫码状态"]').text()).toBe('扫码已让出焦点')
  expect(scan.element.value).toBe('手工草稿')
  await ordinary.setValue('不会被扫码吞掉')
  ordinary.element.blur()
  await wrapper.vm.$nextTick()
  flushFrames()
  expect(document.activeElement).toBe(scan.element)
  await scan.setValue('')
  for (const selector of ['button[aria-label="4 星"]', 'button[aria-label="保存记录"]']) {
    const control = wrapper.get<HTMLElement>(selector)
    control.element.focus()
    await wrapper.vm.$nextTick()
    flushFrames()
    expect(document.activeElement).toBe(control.element)
    expect(wrapper.get('[aria-label="扫码状态"]').text()).toBe('扫码已让出焦点')
    control.element.blur()
    await wrapper.vm.$nextTick()
    flushFrames()
    expect(document.activeElement).toBe(scan.element)
  }
  scan.element.blur()
  // Deterministic keyboard-wedge burst in the blur -> RAF window; no native input event.
  for (const key of ['N', '0', '2', 'Enter']) {
    const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
    document.body.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(true)
  }
  await wrapper.vm.$nextTick()
  expect(wrapper.get('[aria-label="扫码回显"]').text()).toBe('2 次 · N02')
  expect(scan.element.value).toBe('')
  await wrapper.get('[role="switch"][aria-label="持续接收扫码"]').trigger('click')
  document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Z', bubbles: true }))
  await wrapper.vm.$nextTick()
  expect(scan.element.value).toBe('')
  expect(wrapper.get('[aria-label="扫码状态"]').text()).toBe('扫码已暂停')
})

it('reflects native text and search events in the host, including clear and cancel', async () => {
  wrapper = mount(MobileInputDemo, { attachTo: document.body })
  const name = wrapper.get<HTMLInputElement>('#note-title')
  expect(name.attributes()).toMatchObject({ maxlength: '24', autocomplete: 'off', name: 'title' })
  expect(wrapper.get('[data-slot="mobile-input"]:has(#note-title)').text()).toContain('记')
  expect(wrapper.get('[data-slot="mobile-input"]:has(#note-title)').text()).toContain('字')
  await name.setValue('海边来信')
  expect(wrapper.get('[aria-label="标题回显"]').text()).toBe('海边来信 · 4 字')
  const search = wrapper.get('input[type="search"]')
  await search.setValue('湖')
  await search.trigger('keydown', { key: 'Enter' })
  expect(wrapper.get('[aria-label="搜索结果"]').text()).toBe('湖畔')
  expect(wrapper.get('[aria-label="搜索事件"]').text()).toBe('search：湖')
  await wrapper.get('[data-slot="search-bar"] button[aria-label="清除"]').trigger('click')
  expect(wrapper.get('[aria-label="搜索结果"]').text()).toBe('湖畔 · 书屋 · 花园')
  expect(wrapper.get('[aria-label="搜索事件"]').text()).toBe('search：空')
  await search.setValue('书')
  await search.trigger('keydown', { key: 'Enter' })
  await wrapper.get('[data-slot="search-bar"] button:not([aria-label])').trigger('click')
  expect(wrapper.get('[aria-label="搜索结果"]').text()).toBe('湖畔 · 书屋 · 花园')
  expect(wrapper.get('[aria-label="搜索事件"]').text()).toBe('cancel')
})

it('keeps selection identity through option reordering and external value changes', async () => {
  wrapper = mount(MobileInputDemo, { attachTo: document.body })
  await wrapper.get('[role="radio"][value="desk"]').trigger('click')
  expect(wrapper.get('[aria-label="偏好回显"]').text()).toBe('书桌 · 提醒关 · 锁定关')
  await wrapper.get('button[aria-label="调整选项顺序"]').trigger('click')
  expect(wrapper.findAll('[role="radio"]').map((radio) => radio.attributes('value'))).toEqual([
    'travel',
    'desk',
    'pocket',
  ])
  expect(wrapper.get('[role="radio"][aria-checked="true"]').attributes('value')).toBe('desk')
  wrapper.get<HTMLElement>('[role="radio"][value="desk"]').element.focus()
  await wrapper.get('[role="radio"][value="desk"]').trigger('keydown', { key: 'ArrowDown' })
  // Reka defers roving-focus navigation to the next task.
  await new Promise((resolve) => setTimeout(resolve, 0))
  expect(document.activeElement).toBe(wrapper.get('[role="radio"][value="pocket"]').element)
  expect(wrapper.get('[role="radio"][aria-checked="true"]').attributes('value')).toBe('pocket')
  await wrapper.get('[role="switch"][aria-label="灵感提醒"]').trigger('click')
  await wrapper.get('[role="checkbox"][aria-label="锁定评分与进度"]').trigger('click')
  expect(wrapper.get('[aria-label="偏好回显"]').text()).toBe('随身 · 提醒开 · 锁定开')
  await wrapper.get('button[aria-label="恢复偏好"]').trigger('click')
  expect(wrapper.get('[aria-label="偏好回显"]').text()).toBe('书桌 · 提醒关 · 锁定关')
  expect(wrapper.get('[role="radio"][aria-checked="true"]').attributes('value')).toBe('desk')
  expect(
    wrapper.get('[role="checkbox"][aria-label="锁定评分与进度"]').attributes('aria-checked'),
  ).toBe('false')
})

it('edits steps, half ratings and slider values, locks them and receives button actions', async () => {
  wrapper = mount(MobileInputDemo, { attachTo: document.body })
  const stepper = wrapper.get('[data-slot="stepper"]')
  await stepper.get('button[aria-label="增加"]').trigger('click')
  expect(wrapper.get('[aria-label="份数回显"]').text()).toBe('3 份')
  await stepper.get('input').setValue('12')
  expect(wrapper.get('[aria-label="份数回显"]').text()).toBe('12 份')
  await stepper.get('input').trigger('blur')
  expect(wrapper.get('[aria-label="份数回显"]').text()).toBe('5 份')
  expect(stepper.get<HTMLButtonElement>('button[aria-label="增加"]').element.disabled).toBe(true)
  await stepper.get('input').setValue('0')
  await stepper.get('input').trigger('blur')
  expect(wrapper.get('[aria-label="份数回显"]').text()).toBe('1 份')
  const star = wrapper.get('button[aria-label="4 星"]')
  const rect = { left: 100, width: 44 } as DOMRect
  const originalRect = star.element.getBoundingClientRect
  star.element.getBoundingClientRect = () => rect
  await star.trigger('click', { clientX: 110 })
  expect(wrapper.get('[aria-label="评分回显"]').text()).toBe('3.5 星')
  await star.trigger('click', { clientX: 110 })
  expect(wrapper.get('[aria-label="评分回显"]').text()).toBe('0 星')
  star.element.getBoundingClientRect = originalRect
  const slider = wrapper.get('[data-slot="slider"] [role="slider"]')
  await slider.trigger('keydown', { key: 'ArrowRight' })
  expect(wrapper.get('[aria-label="进度回显"]').text()).toBe('30%')
  await wrapper.get('[role="checkbox"][aria-label="锁定评分与进度"]').trigger('click')
  expect(star.element).toHaveProperty('disabled', true)
  await slider.trigger('keydown', { key: 'ArrowRight' })
  expect(wrapper.get('[aria-label="进度回显"]').text()).toBe('30%')
  await wrapper.get('button[aria-label="保存记录"]').trigger('click')
  expect(wrapper.get('[aria-label="操作回显"]').text()).toBe('已保存第 1 次 · 1 份 · 0 星 · 30%')
  await wrapper.get('button[aria-label="暂不可用"]').trigger('click')
  expect(wrapper.get('[aria-label="操作回显"]').text()).toBe('已保存第 1 次 · 1 份 · 0 星 · 30%')
})

it('edits keypad strings with decimal, sign, limit, delete and alternate extra keys then confirms', async () => {
  wrapper = mount(MobileInputDemo, { attachTo: document.body })
  const body = new DOMWrapper(document.body)
  const field = wrapper.get<HTMLInputElement>('#note-number')
  expect(field.attributes()).toMatchObject({ readonly: '', inputmode: 'none', autocomplete: 'off' })
  await field.trigger('click')
  expect(wrapper.get('[aria-label="扫码状态"]').text()).toBe('扫码已让出焦点')
  const press = async (text: string) => {
    const key = body
      .get('[data-slot="number-keyboard"]')
      .findAll('button')
      .find((button) => button.text() === text)
    expect(key, `visible key ${text}`).toBeTruthy()
    await key!.trigger('click')
  }
  for (const key of ['0', '1', '.', '.', '2', '±', '3', '4']) await press(key)
  expect(field.element.value).toBe('-01.23')
  expect(wrapper.get('[aria-label="键盘按键"]').text()).toBe('press：4')
  await body.get('[data-slot="number-keyboard"] button[aria-label="删除"]').trigger('click')
  expect(field.element.value).toBe('-01.2')
  await press('收下数值')
  expect(body.find('[data-slot="number-keyboard"]').exists()).toBe(false)
  expect(wrapper.get('[aria-label="键盘确认"]').text()).toBe('confirm：-01.2')
  await wrapper.get('button[aria-label="清空数值"]').trigger('click')
  await wrapper.get('select[aria-label="数字键盘模式"]').setValue('code')
  await field.trigger('keydown', { key: 'Enter' })
  expect(body.get('[data-slot="number-keyboard"]').text()).toContain('X')
  expect(body.find('button[aria-label="正负号"]').exists()).toBe(false)
  for (const key of ['0', 'X', '2']) await press(key)
  expect(field.element.value).toBe('0X2')
  await press('收下数值')
  expect(wrapper.get('[aria-label="键盘确认"]').text()).toBe('confirm：0X2')
  await wrapper.get('select[aria-label="数字键盘模式"]').setValue('digits')
  await field.trigger('click')
  expect(
    body
      .get('[data-slot="number-keyboard"]')
      .findAll('button')
      .map((key) => key.text()),
  ).not.toContain('X')
  expect(
    body
      .get('[data-slot="number-keyboard"]')
      .findAll('button')
      .map((key) => key.text()),
  ).not.toContain('.')
  await body.get('[data-mobile-overlay-layer="input-backdrop"]').trigger('click')
  expect(body.find('[data-slot="number-keyboard"]').exists()).toBe(false)
  expect(wrapper.get('[aria-label="键盘确认"]').text()).toBe('confirm：0X2')
})

it('yields scan focus to sheets and dialogs, keeps keypad confirmation inside the sheet and closes nested input with its host', async () => {
  wrapper = mount(MobileInputDemo, { attachTo: document.body })
  const body = new DOMWrapper(document.body)
  const scan = wrapper.get<HTMLInputElement>('[data-scan-region] input')
  await wrapper.get('button[aria-label="打开数值抽屉"]').trigger('click')
  await vi.waitFor(() =>
    expect(body.find('[data-slot="mobile-sheet-content"]').exists()).toBe(true),
  )
  expect(wrapper.get('[aria-label="扫码状态"]').text()).toBe('扫码已让出焦点')
  const note = body.get<HTMLInputElement>('#sheet-note')
  note.element.focus()
  await note.setValue('留在抽屉里的字')
  await new Promise((resolve) => requestAnimationFrame(resolve))
  expect(document.activeElement).toBe(note.element)
  await body.get('#sheet-number').trigger('click')
  await body
    .get('[data-slot="number-keyboard"]')
    .findAll('button')
    .find((key) => key.text() === '7')!
    .trigger('click')
  await body
    .get('[data-slot="number-keyboard"]')
    .findAll('button')
    .find((key) => key.text() === '收下数值')!
    .trigger('click')
  expect(body.find('[data-slot="mobile-sheet-content"]').exists()).toBe(true)
  expect(body.get<HTMLInputElement>('#sheet-number').element.value).toBe('7')
  expect(note.element.value).toBe('留在抽屉里的字')
  expect(wrapper.get('[aria-label="键盘确认"]').text()).toBe('confirm：7')
  await body.get('button[aria-label="关闭数值抽屉"]').trigger('click')
  await vi.waitFor(() => expect(document.activeElement).toBe(scan.element))
  expect(wrapper.get('[aria-label="扫码状态"]').text()).toBe('扫码接收中')
  await wrapper.get('button[aria-label="打开数值抽屉"]').trigger('click')
  await body.get('#sheet-number').trigger('click')
  await body.trigger('keydown', { key: 'Escape' })
  await vi.waitFor(() =>
    expect(body.find('[data-slot="mobile-sheet-content"]').exists()).toBe(false),
  )
  expect(body.find('[data-slot="number-keyboard"]').exists()).toBe(false)
  await wrapper.get('button[aria-label="打开记录提示"]').trigger('click')
  const dialogNote = body.get<HTMLInputElement>('#dialog-note')
  dialogNote.element.focus()
  await dialogNote.setValue('稍后再写')
  await new Promise((resolve) => requestAnimationFrame(resolve))
  expect(document.activeElement).toBe(dialogNote.element)
  expect(wrapper.get('[aria-label="扫码状态"]').text()).toBe('扫码已让出焦点')
  await body
    .get('[data-slot="mobile-dialog-content"]')
    .findAll('button')
    .find((button) => button.text() === '返回记录')!
    .trigger('click')
  await vi.waitFor(() => expect(document.activeElement).toBe(scan.element))
  expect(wrapper.get('[aria-label="提示回显"]').text()).toBe('稍后再写')
})
