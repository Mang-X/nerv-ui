import { mount } from '@vue/test-utils'
import { expect, it } from 'vitest'
import { NvStatTile } from '@nerv-ui/ui'

it.each(['neutral', 'brand', 'success', 'warning', 'danger'] as const)(
  'renders values units and supporting slot for tone %s',
  async (tone) => {
    const wrapper = mount(NvStatTile, {
      props: { label: '阅读', value: 0, unit: '册', tone },
      slots: { default: '<p>由本页设置</p>' },
    })
    expect(wrapper.text()).toContain('阅读')
    expect(wrapper.text()).toContain('0')
    expect(wrapper.text()).toContain('册')
    expect(wrapper.text()).toContain('由本页设置')
    await wrapper.setProps({ value: '随心', unit: undefined })
    expect(wrapper.text()).toContain('随心')
    expect(wrapper.text()).not.toContain('0')
    expect(wrapper.text()).not.toContain('册')
    wrapper.unmount()
  },
)
