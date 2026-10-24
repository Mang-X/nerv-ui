// 文档源码结构守护；不证明文档站可独立启动（恢复责任 #10）。
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
const srcDir = dirname(fileURLToPath(import.meta.url))
const read = (rel: string) => readFileSync(resolve(srcDir, rel), 'utf8')
const stripComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '')

// ─── ADR 0020 §4.2 — VitePress doc-site style isolation ────────────────────
describe('ADR 0020 §4.2 — VitePress isolation', () => {
  const ds = (rel: string) => read(`../../../apps/design-system/${rel}`)

  it('enables postcssIsolateStyles for base.css AND vp-doc.css', () => {
    const config = ds('docs/.vitepress/config.mts')
    expect.soft(config).toContain('postcssIsolateStyles')
    expect.soft(config).toMatch(/includeFiles:\s*\[[^\]]*base\\.css[^\]]*vp-doc\\.css/)
  })

  it('wraps every demo container root in vp-raw', () => {
    expect.soft(ds('docs/.vitepress/theme/Demo.vue')).toContain('nv-demo vp-raw')
    expect.soft(ds('docs/.vitepress/theme/ScreenDemo.vue')).toContain('nv-sd vp-raw')
    expect.soft(ds('docs/.vitepress/theme/MobileDoc.vue')).toContain('nv-mdoc-phone vp-raw')
  })

  it('drops the old .vp-doc counter-hacks and never revives revert-layer', () => {
    const style = stripComments(ds('docs/.vitepress/theme/style.css'))
    expect.soft(style).not.toMatch(/\.vp-doc\s*:is\(\.(sb|nv-scr)-tbl/)
    expect.soft(style).not.toContain('revert-layer')
    // Doc site pulls host overrides (glass) in unlayered so they win in-site.
    expect.soft(style).toContain("overrides.css'")
  })
})
