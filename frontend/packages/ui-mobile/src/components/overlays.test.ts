import { DOMWrapper, flushPromises, mount } from '@vue/test-utils'
import { defineComponent, ref } from 'vue'
import { afterEach, expect, it } from 'vitest'
import { MOBILE_OVERLAY_TARGET, NvBottomSheet, NvMobileDialog } from '../index'
let wrapper: ReturnType<typeof mount>
const body = () => new DOMWrapper(document.body)
const settle = async () => {
  await flushPromises()
  await new Promise((r) => setTimeout(r, 0))
}
afterEach(() => {
  wrapper?.unmount()
  document.body.innerHTML = ''
})
it.each([
  { name: 'sheet', component: NvBottomSheet },
  { name: 'dialog', component: NvMobileDialog },
])(
  '$name restores focus to the actual opener after Escape and leaves no modal',
  async ({ component }) => {
    wrapper = mount(
      defineComponent({
        components: { Overlay: component },
        setup() {
          return { open: ref(false) }
        },
        template:
          '<button @click="open=true">打开</button><Overlay v-model:open="open" title="安排"><input aria-label="备注" /></Overlay>',
      }),
      { attachTo: document.body },
    )
    const opener = wrapper.get<HTMLButtonElement>('button')
    opener.element.focus()
    await opener.trigger('click')
    await settle()
    expect(body().get('[role="dialog"]').element.contains(document.activeElement)).toBe(true)
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await settle()
    expect(body().find('[role="dialog"]').exists()).toBe(false)
    expect(document.activeElement).toBe(opener.element)
  },
)
it.each([
  { name: 'sheet', component: NvBottomSheet },
  { name: 'dialog', component: NvMobileDialog },
])(
  '$name uses body by default and accepts selector and element overlay targets',
  async ({ component }) => {
    for (const mode of ['body', 'selector', 'element']) {
      const target = document.createElement('section')
      target.id = 'overlay-fixture'
      document.body.append(target)
      wrapper = mount(component, {
        props: { open: true, title: '范围' },
        slots: { default: '目标内容' },
        attachTo: document.body,
        global: {
          provide:
            mode === 'body'
              ? {}
              : {
                  [MOBILE_OVERLAY_TARGET as symbol]:
                    mode === 'selector' ? '#overlay-fixture' : target,
                },
        },
      })
      await settle()
      const dialog = body().get('[role="dialog"]').element
      expect(target.contains(dialog)).toBe(mode !== 'body')
      expect(document.body.contains(dialog)).toBe(true)
      await wrapper.setProps({ open: false })
      await settle()
      expect(body().find('[role="dialog"]').exists()).toBe(false)
      wrapper.unmount()
      target.remove()
    }
  },
)
it('dialog emits confirm, cancel and close as distinct public events', async () => {
  wrapper = mount(NvMobileDialog, { props: { open: true, title: '提醒' }, attachTo: document.body })
  await settle()
  await body()
    .findAll('button')
    .find((b) => b.text() === '取消')!
    .trigger('click')
  expect(wrapper.emitted('cancel')).toEqual([[]])
  expect(wrapper.emitted('confirm')).toBeUndefined()
  expect(wrapper.emitted('update:open')).toEqual([[false]])
  await body()
    .findAll('button')
    .find((b) => b.text() === '确定')!
    .trigger('click')
  expect(wrapper.emitted('confirm')).toEqual([[]])
})
it('sheet retains small drag snapback and downward dismissal through public pointer events', async () => {
  const original = window.matchMedia
  window.matchMedia = () => ({ matches: true }) as MediaQueryList
  try {
    wrapper = mount(NvBottomSheet, {
      props: { open: true, title: '拖动' },
      attachTo: document.body,
    })
    await settle()
    const content = body().get<HTMLElement>('[role="dialog"]').element
    Object.defineProperty(content, 'offsetHeight', { value: 400 })
    const grab = body().get('.nv-m-sheet-grab').element
    function pointer(type: string, y: number, time: number) {
      const event = new MouseEvent(type, { bubbles: true, clientY: y, buttons: 1 })
      Object.defineProperty(event, 'timeStamp', { value: time })
      grab.dispatchEvent(event)
    }
    pointer('pointerdown', 100, 0)
    pointer('pointermove', 120, 100)
    pointer('pointerup', 120, 200)
    await settle()
    expect(wrapper.emitted('update:open')).toBeUndefined()
    pointer('pointerdown', 100, 300)
    pointer('pointermove', 250, 600)
    pointer('pointerup', 250, 700)
    await settle()
    expect(wrapper.emitted('update:open')).toEqual([[false]])
  } finally {
    window.matchMedia = original
  }
})
it('dialog keeps its default overlay guard and closes only on an opted-in outside pointer', async () => {
  wrapper = mount(NvMobileDialog, { props: { open: true, title: '遮罩' }, attachTo: document.body })
  await settle()
  const outside = document.createElement('button')
  document.body.append(outside)
  outside.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, button: 0 }))
  await settle()
  expect(wrapper.emitted('update:open')).toBeUndefined()
  await wrapper.setProps({ closeOnOverlay: true })
  outside.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, button: 0 }))
  await settle()
  expect(wrapper.emitted('update:open')).toEqual([[false]])
  expect(wrapper.emitted('confirm')).toBeUndefined()
  expect(wrapper.emitted('cancel')).toBeUndefined()
})
