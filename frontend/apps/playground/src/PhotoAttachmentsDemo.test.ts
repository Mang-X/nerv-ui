import { mount, flushPromises } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Demo from './PhotoAttachmentsDemo.vue'
async function select(
  w: ReturnType<typeof mount>,
  file = new File(['image'], '光影.jpg', { type: 'image/jpeg' }),
) {
  Object.defineProperty(w.get('input').element, 'files', { configurable: true, value: [file] })
  await w.get('input').trigger('change')
  await flushPromises()
}
describe('neutral photo hosts through public DOM (jsdom)', () => {
  it.each(['library', 'studio'])(
    '%s selects, fails, retries, removes and switches without saving claims',
    async (source) => {
      const w = mount(Demo, { props: { source } })
      try {
        expect(w.text()).toContain('离开本页后不会保存')
        expect(
          w
            .get('nav')
            .findAll('a')
            .map((a) => a.attributes('href')),
        ).toEqual(['#mobile-photos/library', '#mobile-photos/studio', '#mobile'])
        await select(w)
        expect(w.findAll('li')).toHaveLength(1)
        await w
          .findAll('button')
          .find((b) => b.text() === '让下次添加暂缓')!
          .trigger('click')
        await select(w)
        expect(w.findAll('li')).toHaveLength(1)
        expect(w.get('[role="alert"]').text()).toContain('重试')
        expect(w.text()).not.toContain('page adapter rejected')
        await select(w)
        expect(w.findAll('li')).toHaveLength(2)
        await w.get('li button').trigger('click')
        expect(w.findAll('li')).toHaveLength(1)
        await w.setProps({ source: source === 'library' ? 'studio' : 'library' })
        expect(w.findAll('li')).toHaveLength(0)
        await select(w, new File(['x'], 'x.txt', { type: 'text/plain' }))
        expect(w.findAll('li')).toHaveLength(0)
      } finally {
        w.unmount()
      }
    },
  )
})
