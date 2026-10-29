import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import NvTimePicker from './NvTimePicker.vue'

const wrappers: VueWrapper[] = []
const originalScrollIntoView = Object.getOwnPropertyDescriptor(Element.prototype, 'scrollIntoView')
beforeEach(() => {
  // jsdom has no layout scrolling; candidate selection is the contract under test.
  Object.defineProperty(Element.prototype, 'scrollIntoView', {
    configurable: true,
    value: () => {},
  })
})
afterEach(() => {
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount())
  vi.useRealTimers()
  document.body.innerHTML = ''
  if (originalScrollIntoView)
    Object.defineProperty(Element.prototype, 'scrollIntoView', originalScrollIntoView)
  else delete (Element.prototype as Partial<Element>).scrollIntoView
})

describe('NvTimePicker now', () => {
  it.each([
    { case: 'ordinary-round-up', step: 5, hour: 14, minute: 3, expected: '14:05' },
    { case: 'before-hour-end-rounding', step: 5, hour: 14, minute: 57, expected: '14:55' },
    { case: 'minute-fifty-eight', step: 5, hour: 14, minute: 58, expected: '14:55' },
    { case: 'minute-fifty-nine', step: 5, hour: 14, minute: 59, expected: '14:55' },
    { case: 'default-minute-granularity', step: 1, hour: 14, minute: 59, expected: '14:59' },
    { case: 'uneven-hour-division', step: 7, hour: 14, minute: 59, expected: '14:56' },
    { case: 'end-of-day-quarter-hour', step: 15, hour: 23, minute: 59, expected: '23:45' },
    { case: 'end-of-day-hour-step', step: 60, hour: 23, minute: 59, expected: '23:00' },
    { case: 'midnight-zero', step: 5, hour: 0, minute: 0, expected: '00:00' },
  ])(
    'keeps now on a visible minute candidate for $case',
    async ({ step, hour, minute, expected }) => {
      // Freeze only the wall clock; the real Popover keeps its normal async lifecycle.
      vi.useFakeTimers({ toFake: ['Date'] })
      vi.setSystemTime(new Date(2026, 5, 18, hour, minute))
      const wrapper = mount(NvTimePicker, {
        attachTo: document.body,
        props: {
          minuteStep: step,
          modelValue: '',
          'onUpdate:modelValue': (value: string) => wrapper.setProps({ modelValue: value }),
        },
      })
      wrappers.push(wrapper)
      await wrapper.get('button').trigger('click')
      await flushPromises()
      const nowButton = Array.from(document.querySelectorAll('button')).find(
        (button) => button.textContent?.trim() === '此刻',
      )
      if (!nowButton) throw new Error('The public now action was not rendered')
      nowButton.click()
      await flushPromises()

      expect(wrapper.emitted('update:modelValue')).toEqual([[expected]])
      expect(wrapper.get('button').text()).toBe(expected)
      const minuteColumn = document.querySelectorAll('.nv-tp-col')[1]
      if (!minuteColumn) throw new Error('The minute choices were not rendered')
      expect(minuteColumn.querySelector('[data-active="true"]')?.textContent?.trim()).toBe(
        expected.slice(3),
      )
    },
  )
})
