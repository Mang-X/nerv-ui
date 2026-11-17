#!/usr/bin/env node
/**
 * StyleX var-group hashes are derived per compilation unit, so variables must be
 * compiled inside each package rather than imported from a precompiled package.
 * Keep one canonical source (packages/theme/src) and mirror it into every consumer.
 *
 * Usage: node scripts/sync-theme.mjs
 */
import { copyFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const files = ['tokens.stylex.ts', 'shared.stylex.ts']
const targets = [
  'packages/desktop/src/theme',
  'packages/mobile/src/theme',
  'packages/pad/src/theme',
  'packages/screen/src/theme',
  'apps/docs-next/.vitepress/theme/gen',
]

for (const target of targets) {
  mkdirSync(join(root, target), { recursive: true })
  for (const file of files) {
    copyFileSync(join(root, 'packages/theme/src', file), join(root, target, file))
  }
  console.log('synced', target)
}
