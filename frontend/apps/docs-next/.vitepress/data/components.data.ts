import { createContentLoader } from 'vitepress'

export interface OverviewItem {
  /** 组件页路径，例如 `/desktop/button`。 */
  url: string
  /** 组件名，取页面 frontmatter 的 `title`，例如 `NvButton 按钮`。 */
  title: string
  /** 页面首段说明，卡片上的一句话描述。 */
  desc: string
}

/**
 * 四个场景的组件清单。总览页靠它渲染卡片，不再手抄一份名单——
 * 侧栏、页面和总览页因此永远同源。
 */
export default createContentLoader(['desktop/*.md', 'mobile/*.md', 'pad/*.md', 'screen/*.md'], {
  includeSrc: true,
  transform(raw): OverviewItem[] {
    const items: OverviewItem[] = []
    for (const page of raw) {
      const url = page.url.replace(/\.html$/, '')
      // 分区首页（`/desktop/index`）不是组件，不进总览
      if (url.endsWith('/index')) continue
      const title = String(page.frontmatter.title ?? url)
      // 首段说明：h1 之后的第一段正文。frontmatter 与 <script setup> 都不参与。
      const body = (page.src ?? '').replace(/^---[\s\S]*?---\n/, '')
      const match = body.match(/\n#\s+[^\n]+\n+([^\n#<][^\n]*)/)
      const desc = match ? match[1].trim().replace(/`/g, '') : ''
      items.push({ url, title, desc })
    }
    return items
  },
})
