// Resolve actual package exports without enrolling the still-inactive scheduling workspace.
import { mkdirSync, symlinkSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
const root = fileURLToPath(new URL('../../', import.meta.url))
for (const dir of ['contract-consumers/scheduling-model', 'packages/scheduling']) {
  mkdirSync(`${root}${dir}/node_modules/@nerv-iip`, { recursive: true })
  for (const name of ['ui', 'scheduling']) {
    const target = `${root}${dir}/node_modules/@nerv-iip/${name}`
    if (!existsSync(target)) symlinkSync(`${root}packages/${name}`, target, 'dir')
  }
}
const vue = `${root}contract-consumers/scheduling-model/node_modules/vue`
if (!existsSync(vue)) symlinkSync(`${root}packages/ui/node_modules/vue`, vue, 'dir')
