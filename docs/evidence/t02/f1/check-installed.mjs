// One-off F1 install check. Run in a clean checkout after frozen install:
// node /path/to/check-installed.mjs /path/to/report.json
import { createRequire } from 'node:module'
import { readFileSync, realpathSync, writeFileSync } from 'node:fs'
import { isDeepStrictEqual } from 'node:util'
const root = process.cwd()
const require = createRequire(
  root + '/frontend/node_modules/.pnpm/wrap-ansi@7.0.0/node_modules/wrap-ansi/package.json',
)
const expected = { 'string-width': '4.1.0', 'strip-ansi': '6.0.0' }
const edges = {}
for (const [name, version] of Object.entries(expected)) {
  const path = require.resolve(name + '/package.json')
  const actual = JSON.parse(readFileSync(path, 'utf8')).version
  edges[name] = { expected: version, actual, path: realpathSync(path), equal: version === actual }
}
const swRequire = createRequire(require.resolve('string-width/package.json'))
const strip5 = swRequire.resolve('strip-ansi/package.json')
const strip5Require = createRequire(strip5)
const regex4 = strip5Require.resolve('ansi-regex/package.json')
for (const [key, path, version] of [
  ['string-width>strip-ansi', strip5, '5.2.0'],
  ['strip-ansi@5.2.0>ansi-regex', regex4, '4.1.1'],
]) {
  const actual = JSON.parse(readFileSync(path, 'utf8')).version
  edges[key] = { expected: version, actual, path: realpathSync(path), equal: version === actual }
}
const yamlRequire = createRequire(root + '/frontend/package.json')
const { parse } = yamlRequire('./node_modules/.pnpm/yaml@2.9.0/node_modules/yaml')
const source = parse(readFileSync(root + '/frontend/pnpm-lock.yaml', 'utf8'))
const installed = parse(readFileSync(root + '/frontend/node_modules/.pnpm/lock.yaml', 'utf8'))
const lockedGraphMatches = isDeepStrictEqual(source, installed)
const pass = Object.values(edges).every((x) => x.equal) && lockedGraphMatches
const report = {
  edges,
  lockedGraphMatches,
  installedPackageCount: Object.keys(installed.packages).length,
  installedSnapshotCount: Object.keys(installed.snapshots).length,
  pass,
}
writeFileSync(process.argv[2], JSON.stringify(report, null, 2) + '\n')
console.log(JSON.stringify(report, null, 2))
if (!pass) process.exitCode = 1
