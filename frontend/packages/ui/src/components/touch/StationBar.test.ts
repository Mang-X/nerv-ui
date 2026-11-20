import { mount } from '@vue/test-utils'
import { expect, it } from 'vitest'
import { NvStationBar } from '@nerv-ui/ui'

it.each(['success', 'warning', 'danger', 'info', 'neutral'] as const)(
  'renders identity status and interactive right slot for tone %s',
  async (tone) => {
    const wrapper = mount(NvStationBar, {
      props: { station: '阅读角', statusLabel: '开放中', tone, pulse: true },
      slots: { right: '<button type="button">切换主题</button>' },
    })
    expect(wrapper.get('h1').text()).toBe('阅读角')
    expect(wrapper.text()).toContain('开放中')
    expect(wrapper.get('button').text()).toBe('切换主题')
    expect(wrapper.find('[aria-hidden="true"]').exists()).toBe(true)
    await wrapper.setProps({ statusLabel: '稍作休息', pulse: false })
    expect(wrapper.text()).toContain('稍作休息')
    expect(wrapper.text()).not.toContain('开放中')
    // Tone/pulse appearance is measured in the real browser; text remains accessible.
    expect(wrapper.find('[aria-hidden="true"]').exists()).toBe(false)
    await wrapper.setProps({ statusLabel: undefined })
    expect(wrapper.text()).not.toContain('稍作休息')
    expect(wrapper.get('button').text()).toBe('切换主题')
    wrapper.unmount()
  },
)
