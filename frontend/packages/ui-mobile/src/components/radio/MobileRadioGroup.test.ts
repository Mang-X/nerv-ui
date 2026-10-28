import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { h, nextTick, ref } from 'vue'
import { NvMobileRadioGroup, NvMobileRadioItem } from '../../index'

const wrappers: ReturnType<typeof mount>[] = []
beforeEach(() => vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] }))
afterEach(async () => {
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount())
  await vi.runAllTimersAsync()
  vi.useRealTimers()
  document.body.innerHTML = ''
})
function fixture() {
  const selected = ref('desk')
  const order = ref(['pocket', 'desk', 'travel'])
  const disabled = ref(false)
  const disabledItem = ref('')
  const select = vi.fn()
  const focus = vi.fn()
  const wrapper = mount(
    {
      render: () =>
        h(
          NvMobileRadioGroup,
          {
            modelValue: selected.value,
            disabled: disabled.value,
            'onUpdate:modelValue': (value) => {
              selected.value = String(value)
            },
          },
          () =>
            order.value.map((value) =>
              h(
                NvMobileRadioItem,
                {
                  key: value,
                  value,
                  disabled: value === disabledItem.value,
                  onSelect: select,
                  onFocus: () => focus(value),
                },
                () => value,
              ),
            ),
        ),
    },
    { attachTo: document.body },
  )
  wrappers.push(wrapper)
  const radio = (value: string) =>
    wrapper.get<HTMLElement>(`[role="radio"][value="${value}"]`).element
  return { wrapper, selected, order, disabled, disabledItem, select, focus, radio }
}
function key(
  target: EventTarget,
  type: string,
  name = 'ArrowDown',
  options: KeyboardEventInit = {},
) {
  const event = new KeyboardEvent(type, { key: name, bubbles: true, cancelable: true, ...options })
  target.dispatchEvent(event)
  return event
}
async function settle() {
  await nextTick()
  await vi.runAllTimersAsync()
  await nextTick()
}
it.each([
  { name: 'ordinary order', reordered: false, target: 'travel' },
  { name: 'keyed reorder', reordered: true, target: 'pocket' },
])('selects the roving focus after immediate keyup in $name', async ({ reordered, target }) => {
  const f = fixture()
  if (reordered) {
    f.order.value.reverse()
    await nextTick()
  }
  f.radio('desk').focus()
  await settle()
  key(f.radio('desk'), 'keydown')
  key(window, 'keyup')
  expect(document.activeElement).toBe(f.radio('desk'))
  await settle()
  expect(document.activeElement).toBe(f.radio(target))
  expect(f.selected.value).toBe(target)
  expect(f.radio(target).getAttribute('aria-checked')).toBe('true')
  expect(f.select).toHaveBeenCalledTimes(1)
})
it('selects once when released after focus but before the selection timer', async () => {
  const f = fixture()
  f.radio('desk').focus()
  await settle()
  key(f.radio('desk'), 'keydown')
  await nextTick()
  expect(document.activeElement).toBe(f.radio('travel'))
  key(window, 'keyup')
  await settle()
  expect(f.selected.value).toBe('travel')
  expect(f.select).toHaveBeenCalledTimes(1)
})
it('keeps long press and repeat navigation single-selection per movement', async () => {
  const f = fixture()
  f.radio('desk').focus()
  await settle()
  key(f.radio('desk'), 'keydown')
  await settle()
  expect(f.selected.value).toBe('travel')
  key(f.radio('travel'), 'keydown', 'ArrowDown', { repeat: true })
  await settle()
  key(window, 'keyup')
  await settle()
  expect(document.activeElement).toBe(f.radio('pocket'))
  expect(f.selected.value).toBe('pocket')
  expect(f.select).toHaveBeenCalledTimes(2)
})
it('keeps programmatic focus and Tab inert while mouse click selects', async () => {
  const f = fixture()
  f.radio('pocket').focus()
  await settle()
  expect(f.selected.value).toBe('desk')
  key(f.radio('pocket'), 'keydown', 'Tab')
  key(window, 'keyup', 'Tab')
  f.radio('travel').focus()
  await settle()
  expect(f.selected.value).toBe('desk')
  f.radio('pocket').click()
  await settle()
  expect(f.selected.value).toBe('pocket')
  expect(f.select).toHaveBeenCalledTimes(1)
})
it('skips disabled items and keeps a disabled group inert', async () => {
  const f = fixture()
  f.disabledItem.value = 'travel'
  await nextTick()
  f.radio('desk').focus()
  await settle()
  key(f.radio('desk'), 'keydown')
  key(window, 'keyup')
  await settle()
  expect(document.activeElement).toBe(f.radio('pocket'))
  expect(f.selected.value).toBe('pocket')
  f.disabled.value = true
  await nextTick()
  f.radio('desk').click()
  await settle()
  expect(f.selected.value).toBe('pocket')
  expect(f.select).toHaveBeenCalledTimes(1)
})
it('isolates instances and abandons pending navigation on unmount', async () => {
  const a = fixture()
  const b = fixture()
  a.radio('desk').focus()
  await settle()
  key(a.radio('desk'), 'keydown')
  key(window, 'keyup')
  await settle()
  expect(a.selected.value).toBe('travel')
  expect(b.selected.value).toBe('desk')
  expect(b.select).not.toHaveBeenCalled()
  key(a.radio('travel'), 'keydown')
  key(window, 'keyup')
  a.wrapper.unmount()
  wrappers.splice(wrappers.indexOf(a.wrapper), 1)
  await settle()
  expect(a.select).toHaveBeenCalledTimes(1)
  b.radio('pocket').focus()
  await settle()
  expect(b.selected.value).toBe('desk')
})
it('does not repair an already prevented keydown', async () => {
  const f = fixture()
  f.radio('desk').focus()
  await settle()
  const event = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true })
  event.preventDefault()
  f.radio('desk').dispatchEvent(event)
  key(window, 'keyup')
  await settle()
  // Reka still moves focus for this event; the wrapper must not add selection.
  expect(f.selected.value).toBe('desk')
  expect(f.select).not.toHaveBeenCalled()
})
it('honors a canceled select without retrying it', async () => {
  const f = fixture()
  f.select.mockImplementation((event: Event) => event.preventDefault())
  f.radio('desk').focus()
  await settle()
  key(f.radio('desk'), 'keydown')
  await settle()
  key(window, 'keyup')
  await settle()
  expect(f.selected.value).toBe('desk')
  expect(f.select).toHaveBeenCalledTimes(1)
  key(f.radio('travel'), 'keydown')
  key(window, 'keyup')
  await settle()
  expect(f.selected.value).toBe('desk')
  expect(f.select).toHaveBeenCalledTimes(2)
})
it('abandons repair when focus leaves or the group becomes disabled', async () => {
  const f = fixture()
  const outside = document.createElement('button')
  document.body.append(outside)
  f.radio('desk').focus()
  await settle()
  key(f.radio('desk'), 'keydown')
  key(window, 'keyup')
  await nextTick()
  outside.focus()
  await settle()
  expect(f.selected.value).toBe('desk')
  expect(f.select).not.toHaveBeenCalled()
  f.radio('desk').focus()
  await settle()
  key(f.radio('desk'), 'keydown')
  key(window, 'keyup')
  await nextTick()
  f.disabled.value = true
  await settle()
  expect(f.selected.value).toBe('desk')
  expect(f.select).not.toHaveBeenCalled()
})
it('abandons selection when a same-turn keyed DOM reorder loses focus', async () => {
  const f = fixture()
  f.radio('desk').focus()
  await settle()
  key(f.radio('desk'), 'keydown')
  key(window, 'keyup')
  f.order.value.reverse()
  await settle()
  expect(document.activeElement).toBe(document.body)
  expect(f.selected.value).toBe('desk')
  expect(f.select).not.toHaveBeenCalled()
})
it('abandons old navigation when the host replaces its controlled value before the repair timer', async () => {
  const f = fixture()
  f.radio('desk').focus()
  await settle()
  key(f.radio('desk'), 'keydown')
  key(window, 'keyup')
  await nextTick()
  expect(document.activeElement).toBe(f.radio('travel'))
  f.selected.value = 'pocket'
  await nextTick()
  await settle()
  expect(f.selected.value).toBe('pocket')
  expect(f.select).not.toHaveBeenCalled()
})
it('does not turn a host focus callback redirect into a keyboard selection', async () => {
  const f = fixture()
  f.radio('desk').focus()
  await settle()
  f.focus.mockImplementation((value) => {
    if (value === 'travel') f.radio('pocket').focus()
  })
  key(f.radio('desk'), 'keydown')
  key(window, 'keyup')
  await settle()
  expect(document.activeElement).toBe(f.radio('pocket'))
  expect(f.selected.value).toBe('desk')
  expect(f.select).not.toHaveBeenCalled()
})
it.each(['same group', 'outside group'])(
  'permanently cancels navigation after focus leaves its target for %s even when it returns',
  async (destination) => {
    const f = fixture()
    const outside = document.createElement('button')
    document.body.append(outside)
    f.radio('desk').focus()
    await settle()
    key(f.radio('desk'), 'keydown')
    key(window, 'keyup')
    await nextTick()
    expect(document.activeElement).toBe(f.radio('travel'))
    ;(destination === 'same group' ? f.radio('pocket') : outside).focus()
    f.radio('travel').focus()
    await settle()
    expect(document.activeElement).toBe(f.radio('travel'))
    expect(f.selected.value).toBe('desk')
    expect(f.select).not.toHaveBeenCalled()
  },
)
it('does not adopt a synchronous host focus change before the queued roving navigation', async () => {
  const f = fixture()
  f.radio('desk').focus()
  await settle()
  key(f.radio('desk'), 'keydown')
  key(window, 'keyup')
  f.radio('travel').focus()
  await settle()
  expect(document.activeElement).toBe(f.radio('travel'))
  expect(f.selected.value).toBe('desk')
  expect(f.select).not.toHaveBeenCalled()
})
