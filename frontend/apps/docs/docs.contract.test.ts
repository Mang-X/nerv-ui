import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import { it, expect } from 'vitest'
import { createServer } from 'vite'
import { repositoryLink } from './docs/.vitepress/repositoryLinks'
const app = dirname(fileURLToPath(import.meta.url))
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
      '@nerv-iip/ui/file-preview',
      '@nerv-iip/ui/styles.css',
      '@nerv-iip/ui/theme.css',
      '@nerv-iip/ui/overrides.css',
      '@nerv-iip/ui-mobile',
      '@nerv-iip/ui-mobile/styles/mobile.css',
    ]) {
      const result = await server.pluginContainer.resolveId(
        id,
        resolve(app, 'docs/.vitepress/config.mts'),
      )
      // ui-mobile ships a dist `import` condition; `require.resolve` cannot see it
      // (no `require`/`default` export), so assert resolvability via the plugin
      // container and on-disk existence rather than CJS path equality.
      if (id === '@nerv-iip/ui-mobile') {
        expect(result?.id).toBe(
          resolve(app, '../../packages/ui-mobile/dist/index.js'),
        )
      } else {
        expect(result?.id).toBe(req.resolve(id))
      }
      expect(existsSync(result!.id)).toBe(true)
    }
    // The vue-dedupe check uses the package entry as the require anchor;
    // ui-mobile resolves to dist/index.js, so anchor at that file instead.
    for (const entry of [
      req.resolve('@nerv-iip/ui'),
      resolve(app, '../../packages/ui-mobile/dist/index.js'),
    ])
      expect(createRequire(entry).resolve('vue')).toBe(req.resolve('vue'))
  } finally {
    await server.close()
  }
})
it('admits neutral dependencies and forbids SDK imports', () => {
  expect(
    Object.keys(json(resolve(app, 'package.json')).dependencies)
      .filter((k) => k.startsWith('@nerv-iip/'))
      .sort(),
  ).toEqual(['@nerv-iip/ui', '@nerv-iip/ui-mobile'])
  for (const f of files(app).filter(
    (f) => /\.(ts|mts|vue|css|md)$/.test(f) && !f.endsWith('.test.ts'),
  ))
    expect(readFileSync(f, 'utf8'), f).not.toMatch(
      /(?:from\s*|import\s*|@import\s*)['"]@nerv-iip\/(?:api-client|auth|business-core|scheduling|app-shell)/,
    )
})
it('links repository sources and preserves detectable dead links', () => {
  const page = resolve(app, 'docs/components/desktop/button.md')
  expect(repositoryLink('../../../../../../docs/desktop-standalone.md#x', page)).toBe(
    'https://github.com/Mang-X/nerv-ui/blob/integration/nerv-ui-extraction/docs/desktop-standalone.md#x',
  )
  for (const href of ['./button.md', './missing.md', '../../../../../../docs/missing.md'])
    expect(repositoryLink(href, page)).toBe(href)
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
