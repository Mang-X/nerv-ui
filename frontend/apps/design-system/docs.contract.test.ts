import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import { it, expect } from 'vitest'
import { createServer } from 'vite'
import { makeModel, makeBlockDemoModel, makeCalendarModel } from './docs/.vitepress/schedulingDemo'
import { factoryTimeInput } from '@nerv-iip/scheduling/model'
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
  const normalize = (value: ReturnType<typeof makeModel>, base?: number) => {
    const facts = structuredClone(value)
    // Keep the independent legacy oracle unchanged; display context is checked separately.
    delete facts.timezones
    for (const task of facts.tasks) delete task.timezone
    return JSON.parse(
      JSON.stringify(facts, (_k, v) =>
        typeof v === 'string' && /^2026-\d\d-\d\dT/.test(v) && base !== undefined
          ? `hours:${(Date.parse(v) - base) / 3600000}`
          : v,
      ),
    )
  }
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
it('provides an explicit UTC display context for every final demo node', () => {
  for (const model of [makeModel(), makeBlockDemoModel(), makeCalendarModel()]) {
    expect(model.timezones).toEqual(['UTC'])
    expect(model.tasks.length).toBeGreaterThan(0)
    for (const task of model.tasks) {
      expect(task.timezone, task.id).toBe('UTC')
      expect(factoryTimeInput(task.startUtc, task.timezone!)).not.toBe('')
      expect(factoryTimeInput(task.endUtc, task.timezone!)).not.toBe('')
    }
  }
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

it('links the fixed scheduling sidebar to the existing readonly timeline page', async () => {
  const { default: config } = await import('./docs/.vitepress/config.mts')
  const sidebar = config.themeConfig!.sidebar as Record<
    string,
    { text: string; items: { text: string; link: string }[] }[]
  >
  const scheduling = sidebar['/components/desktop'].find(
    (group) => group.text === '排产 Scheduling',
  )!
  expect(
    scheduling.items.filter((item) => item.link === '/components/desktop/schedule-timeline'),
  ).toEqual([{ text: '只读时间安排', link: '/components/desktop/schedule-timeline' }])
  expect(existsSync(resolve(app, 'docs/components/desktop/schedule-timeline.md'))).toBe(true)
})

it('registers component layers before stylesheets in both documentation HTML paths', async () => {
  const { default: config } = await import('./docs/.vitepress/config.mts')
  const html =
    '<!DOCTYPE html><html><head><link rel="stylesheet" href="/assets/site.css"></head><body>page</body></html>'
  const devPlugin = (
    config.vite!.plugins as { name?: string; transformIndexHtml?: unknown }[]
  ).find((plugin) => plugin.name === 'docs-css-layer-order')
  expect(devPlugin).toBeDefined()
  const hooks = [config.transformHtml, devPlugin!.transformIndexHtml]
  for (const hook of hooks) {
    expect(typeof hook).toBe('function')
    const output = (hook as (html: string) => string)(html)
    expect(output).toBe(
      html.replace(
        '<head>',
        '<head><style data-docs-layer-order>@layer theme, nv-tokens, base, components, nv-components;</style>',
      ),
    )
    expect(output.indexOf('@layer theme')).toBeLessThan(output.indexOf('<link'))
    expect((hook as (html: string) => string)(output)).toBe(output)
  }
})
