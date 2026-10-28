import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import { it, expect } from 'vitest'
import { createServer } from 'vite'
import { makeModel, makeBlockDemoModel, makeCalendarModel } from './docs/.vitepress/schedulingDemo'
import { repositoryLink } from './docs/.vitepress/repositoryLinks'
const app = dirname(fileURLToPath(import.meta.url)),
  root = resolve(app, '../../..')
const json = (file: string) => JSON.parse(readFileSync(file, 'utf8'))
function files(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    ['node_modules', 'dist', 'cache', '.temp'].includes(e.name)
      ? []
      : e.isDirectory()
        ? files(resolve(dir, e.name))
        : [resolve(dir, e.name)],
  )
}
it('resolves public subentries without swallowing suffixes', async () => {
  const server = await createServer({
    configFile: false,
    root: app,
    server: { middlewareMode: true },
    resolve: { dedupe: ['vue'] },
  })
  const req = createRequire(resolve(app, 'package.json'))
  try {
    for (const id of [
      '@nerv-iip/ui',
      '@nerv-iip/ui/schedule-model',
      '@nerv-iip/ui/file-preview',
      '@nerv-iip/ui/styles.css',
      '@nerv-iip/ui/theme.css',
      '@nerv-iip/ui/overrides.css',
      '@nerv-iip/ui-mobile',
      '@nerv-iip/ui-mobile/styles/mobile.css',
      '@nerv-iip/scheduling',
      '@nerv-iip/scheduling/model',
      '@nerv-iip/scheduling/host',
      '@nerv-iip/scheduling/styles.css',
      '@nerv-iip/scheduling/vendor',
      '@nerv-iip/scheduling/vendor.css',
      '@nerv-iip/scheduling/vite',
    ]) {
      const result = await server.pluginContainer.resolveId(
        id,
        resolve(app, 'docs/.vitepress/schedulingDemo.ts'),
      )
      expect(result?.id).toBe(req.resolve(id))
      expect(existsSync(result!.id)).toBe(true)
    }
    for (const id of ['@nerv-iip/ui', '@nerv-iip/scheduling', '@nerv-iip/ui-mobile'])
      expect(createRequire(req.resolve(id)).resolve('vue')).toBe(req.resolve('vue'))
  } finally {
    await server.close()
  }
})
it('admits neutral dependencies and forbids SDK imports', () => {
  expect(
    Object.keys(json(resolve(app, 'package.json')).dependencies)
      .filter((k) => k.startsWith('@nerv-iip/'))
      .sort(),
  ).toEqual(['@nerv-iip/scheduling', '@nerv-iip/ui', '@nerv-iip/ui-mobile'])
  for (const f of files(app).filter(
    (f) => /\.(ts|mts|vue|css|md)$/.test(f) && !f.endsWith('.test.ts'),
  ))
    expect(readFileSync(f, 'utf8'), f).not.toMatch(
      /(?:from\s*|import\s*|@import\s*)['"]@nerv-iip\/(?:api-client|auth|business-core)/,
    )
})
it('preserves all three complete source model facts', () => {
  const normalize = (value: unknown, base?: number) =>
    JSON.parse(
      JSON.stringify(value, (_k, v) =>
        typeof v === 'string' && /^2026-\d\d-\d\dT/.test(v) && base !== undefined
          ? `hours:${(Date.parse(v) - base) / 3600000}`
          : v,
      ),
    )
  expect([
    normalize(makeModel()),
    normalize(makeBlockDemoModel()),
    normalize(makeCalendarModel(), new Date(2026, 5, 12, 12).getTime()),
  ]).toEqual(json(resolve(root, 'docs/evidence/t09-a/scheduling-models.json')))
  const changed = makeModel()
  changed.tasks[0].text = 'changed'
  changed.loads[0].utilization = -1
  expect(makeModel().tasks[0].text).toBe('WO-2026-001')
  expect(makeModel().loads[0].utilization).toBe(0.88)
})
it('retains the frozen 174 pages and 206 site files', () => {
  const list: string[] = json(resolve(root, 'docs/evidence/t09-a/site-files.json'))
  expect(list).toHaveLength(206)
  expect(list.filter((f) => f.endsWith('.md'))).toHaveLength(174)
  for (const f of list) expect(existsSync(resolve(root, f)), f).toBe(true)
})
it('links repository sources and preserves detectable dead links', () => {
  const page = resolve(app, 'docs/components/desktop/gantt-chart.md')
  expect(repositoryLink('../../../../../../docs/scheduling-renderer.md#p04', page)).toBe(
    'https://github.com/Mang-X/nerv-ui/blob/integration/nerv-ui-extraction/docs/scheduling-renderer.md#p04',
  )
  for (const href of ['./button.md', './missing.md', '../../../../../../docs/missing.md'])
    expect(repositoryLink(href, page)).toBe(href)
})
