// @vitest-environment jsdom
import { afterEach, expect, it } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import {
  CardAction,
  NvPageHeader,
  NvToolbar,
  NvRowActions,
  NvSectionCard,
  NvSectionCards,
} from '@nerv-ui/ui'
import Example from './docs/.vitepress/examples/ListBlocksExample.vue'
let page: VueWrapper
afterEach(() => page?.unmount())
async function click(label: string) {
  const button = page.findAll('button').find((b) => b.text() === label)
  expect(button, label).toBeDefined()
  await button!.trigger('click')
}
it('renders the base card action and keeps its count comparison current', async () => {
  page = mount(Example)
  const card = page.findAllComponents(NvSectionCard)[0]!
  expect(card.getComponent(CardAction).get('[data-slot="card-action"]').text()).toBe('持平')
  await page.get('[aria-label="搜索物品"]').setValue('空')
  await click('倒序排列')
  expect(card.getComponent(CardAction).text()).toBe('持平')
  expect(card.props('value')).toBe('3')
  await click('更换清单')
  expect(card.props('value')).toBe('1')
  expect(card.getComponent(CardAction).text()).toBe('-2')
})
it('renders public list blocks with zero unknown and responsive column choices', async () => {
  page = mount(Example)
  expect(page.getComponent(NvPageHeader).props('title')).toBe('共享物品')
  expect(page.findComponent(NvToolbar).exists()).toBe(true)
  expect(page.findAllComponents(NvRowActions)).toHaveLength(3)
  expect(page.findAllComponents(NvSectionCard).map((c) => c.props('value'))).toEqual([
    '3',
    '0',
    '—',
    '12.346',
  ])
  const cards = page.findAllComponents(NvSectionCard)
  expect(cards[0]!.text()).toContain('数量单位：件')
  expect(cards[1]!.text()).toContain('数量单位：件')
  expect(cards[3]!.text()).toContain('重量单位：kg')
  for (const n of [2, 3, 4]) {
    await page.get('select').setValue(String(n))
    expect(page.getComponent(NvSectionCards).props('columns')).toBe(n)
  }
  await page.get('[aria-label="搜索物品"]').setValue('空')
  expect(page.findAllComponents(NvRowActions)).toHaveLength(1)
  await page.get('[aria-label="搜索物品"]').setValue('无匹配')
  expect(page.text()).toContain('没有匹配的物品')
})
it('row menu receipts resolve current identity after reorder replacement and stale selection', async () => {
  page = mount(Example)
  // Select is the public menu-item event; real pointer/keyboard portal interaction is a separate runtime lane.
  const item = () => page.findAllComponents({ name: 'MenuBoundary' })
  await click('倒序排列')
  const actions = page.findAllComponents(NvRowActions)
  expect(actions.map((c) => c.props('label'))).toEqual([
    '查看空盒操作',
    '查看画架操作',
    '查看书篮操作',
  ])
  // Render menu slots in place only to dispatch their public select events.
  page.unmount()
  page = mount(Example, {
    global: {
      stubs: {
        RowActions: { template: '<div><slot /></div>' },
        DropdownMenuItem: {
          name: 'MenuBoundary',
          emits: ['select'],
          template: '<button><slot /></button>',
        },
      },
    },
  })
  const old = item()[0]!
  old.vm.$emit('select')
  await page.vm.$nextTick()
  expect(page.get('[role="status"]').text()).toContain('书篮')
  await click('倒序排列')
  item()[0]!.vm.$emit('select')
  await page.vm.$nextTick()
  expect(page.get('[role="status"]').text()).toContain('空盒')
  await click('更换清单')
  old.vm.$emit('select')
  await page.vm.$nextTick()
  expect(page.get('[role="status"]').text()).not.toContain('书篮')
  item()[0]!.vm.$emit('select')
  await page.vm.$nextTick()
  expect(page.get('[role="status"]').text()).toContain('工具箱')
})

it('publishes the live host from sidebar and keeps existing related examples', async () => {
  const { readFileSync } = await import('node:fs')
  const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8')
  const doc = read('./docs/components/desktop/list-blocks.md')
  expect(doc).toContain('<ListBlocksExample />')
  expect(doc).toContain(
    "import ListBlocksExample from '../../.vitepress/examples/ListBlocksExample.vue'",
  )
  expect(read('./docs/.vitepress/config.mts')).toContain("link: '/components/desktop/list-blocks'")
  for (const name of ['dashboard', 'data-table', 'card']) {
    const source = read(`./docs/components/desktop/${name}.md`)
    expect(source).toContain('<Demo')
    expect(source).toContain('(./list-blocks.md)')
  }
})
