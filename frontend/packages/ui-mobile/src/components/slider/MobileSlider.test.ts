import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { NvMobileSlider } from '../../index'

afterEach(() => vi.restoreAllMocks())

// VTU's pointer event option mapping cannot assign jsdom 29's readonly clientX.
async function pointer(target: Element, type: string, clientX = 0, buttons = 1) {
  target.dispatchEvent(new PointerEvent(type, { bubbles: true, clientX, buttons, pointerId: 1 }))
  await nextTick()
}

describe('NvMobileSlider public input', () => {
  it('quantizes pointer drags, clamps both edges and uses updated range and controlled value', async () => {
    const wrapper = mount(NvMobileSlider, {
      props: {
        modelValue: 20,
        step: 10,
        'onUpdate:modelValue': (value: number) => wrapper.setProps({ modelValue: value }),
      },
    })
    const track = wrapper.get('[data-slot="slider"] > div')
    vi.spyOn(track.element, 'getBoundingClientRect').mockReturnValue({
      left: 10,
      width: 200,
    } as DOMRect)
    const thumb = wrapper.get('[role="slider"]')
    await pointer(track.element, 'pointerdown', 65)
    expect(thumb.attributes('aria-valuenow')).toBe('30')
    await pointer(track.element, 'pointermove', 250)
    expect(thumb.attributes('aria-valuenow')).toBe('100')
    await pointer(track.element, 'pointermove', -10)
    expect(thumb.attributes('aria-valuenow')).toBe('0')
    await pointer(track.element, 'pointerup', 0, 0)
    await wrapper.setProps({ modelValue: 40, min: 20, max: 60, step: 5 })
    expect(thumb.attributes('aria-valuenow')).toBe('40')
    await thumb.trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([45])
    await wrapper.setProps({ modelValue: 60 })
    await thumb.trigger('keydown', { key: 'ArrowRight' })
    expect(thumb.attributes('aria-valuenow')).toBe('60')
    wrapper.unmount()
  })

  it('stops an in-flight pointer edit when the host disables the slider and accepts a later re-enabled gesture', async () => {
    const wrapper = mount(NvMobileSlider, {
      props: {
        modelValue: 20,
        step: 10,
        'onUpdate:modelValue': (value: number) => wrapper.setProps({ modelValue: value }),
      },
    })
    const track = wrapper.get('[data-slot="slider"] > div')
    vi.spyOn(track.element, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      width: 200,
    } as DOMRect)
    await pointer(track.element, 'pointerdown', 60)
    expect(wrapper.props('modelValue')).toBe(30)
    await wrapper.setProps({ disabled: true })
    const updatesBeforeDisable = wrapper.emitted('update:modelValue')?.length
    await pointer(track.element, 'pointermove', 180)
    await wrapper.get('[role="slider"]').trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.props('modelValue')).toBe(30)
    expect(wrapper.emitted('update:modelValue')).toHaveLength(updatesBeforeDisable!)
    await pointer(track.element, 'pointerup', 0, 0)
    await wrapper.setProps({ disabled: false, modelValue: 50 })
    await pointer(track.element, 'pointerdown', 160)
    expect(wrapper.props('modelValue')).toBe(80)
    wrapper.unmount()
  })
})
