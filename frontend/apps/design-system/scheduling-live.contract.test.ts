import { readFileSync } from 'node:fs'
import { expect, it } from 'vitest'
it('connects both public live compositions from the existing scheduling pages and sidebar', () => {
  const read = (p: string) => readFileSync(new URL(p, import.meta.url), 'utf8')
  for (const name of ['gantt-chart', 'resource-scheduler'])
    expect(read(`./docs/components/desktop/${name}.md`)).toContain('./scheduling-live')
  expect(read('./docs/.vitepress/config.mts')).toContain('/components/desktop/scheduling-live')
  const page = read('./docs/components/desktop/scheduling-live.md')
  expect(page).toMatch(/<SchedulingPanelsExample\s*\/>/)
  expect(page).toMatch(/<SchedulingDraftExample\s*\/>/)
})
