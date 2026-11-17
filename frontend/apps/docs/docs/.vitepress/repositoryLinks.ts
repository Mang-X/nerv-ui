import { existsSync } from 'node:fs'
import { dirname, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const site = fileURLToPath(new URL('..', import.meta.url))
const repo = resolve(site, '../../../..')

/** 跨出站点的仓库文件保留为源码链接；缺失目标仍交给 VitePress 报错。 */
export function repositoryLink(href: string, file: string): string {
  if (!href.startsWith('.')) return href
  const [path, hash] = href.split('#')
  const target = resolve(dirname(file), path)
  if (!relative(site, target).startsWith(`..${sep}`)) return href
  const local = relative(repo, target)
  if (local.startsWith(`..${sep}`) || !existsSync(target)) return href
  return `https://github.com/Mang-X/nerv-ui/blob/integration/nerv-ui-extraction/${local.split(sep).join('/')}${hash ? `#${hash}` : ''}`
}
