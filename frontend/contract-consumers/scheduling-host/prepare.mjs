// Real local package exports for a prepared consumer, not an installed/packed release.
import { mkdirSync, symlinkSync, existsSync, realpathSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
const root = fileURLToPath(new URL('../../', import.meta.url))
const require = createRequire(root + 'packages/ui/package.json')
for (const dir of ['contract-consumers/scheduling-host', 'packages/scheduling']) {
  mkdirSync(root + dir + '/node_modules/@nerv-iip', { recursive: true })
  for (const name of ['ui', 'scheduling']) {
    const target = root + dir + '/node_modules/@nerv-iip/' + name
    if (!existsSync(target)) symlinkSync(root + 'packages/' + name, target, 'dir')
  }
  const vue = root + dir + '/node_modules/vue'
  if (!existsSync(vue)) symlinkSync(realpathSync(root + 'packages/ui/node_modules/vue'), vue, 'dir')
}
// Workbench parameter tests compile actual UI dependencies, without enrolling the vendor workspace.
for (const name of ['@lucide/vue', '@vueuse/core']) {
  const target = root + 'packages/scheduling/node_modules/' + name
  mkdirSync(target.slice(0, target.lastIndexOf('/')), { recursive: true })
  if (!existsSync(target))
    symlinkSync(
      realpathSync(require.resolve(name + '/package.json')).replace(/\/package.json$/, ''),
      target,
      'dir',
    )
}
