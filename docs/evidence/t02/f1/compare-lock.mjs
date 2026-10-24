// One-off F1 migration evidence, not a permanent registry or CI gate.
// Run from the repository root, after frozen install (yaml is already locked):
// node docs/evidence/t02/f1/compare-lock.mjs <base-lock> <candidate-lock> <report>
import { readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { createHash } from 'node:crypto'
import { isDeepStrictEqual as equal } from 'node:util'

const require = createRequire(`${process.cwd()}/frontend/package.json`)
const { parse } = require('./node_modules/.pnpm/yaml@2.9.0/node_modules/yaml')
const [basePath, candidatePath, outputPath] = process.argv.slice(2)
const baseText = readFileSync(basePath, 'utf8')
const candidateText = readFileSync(candidatePath, 'utf8')
const base = parse(baseText)
const candidate = parse(candidateText)
const groups = ['dependencies', 'devDependencies', 'optionalDependencies']
const withoutOptional = ({ optional: _optional, ...rest }) => rest
const delta = (a, b) =>
  [...new Set([...Object.keys(a), ...Object.keys(b)])]
    .filter((key) => !equal(a[key], b[key]))
    .map((key) => ({ field: key, base: a[key] ?? null, candidate: b[key] ?? null }))

// Resolve the entire serialized snapshot ID, including peer suffixes and aliases.
function target(snapshots, name, reference) {
  if (reference.startsWith('link:')) return null
  if (`${name}@${reference}` in snapshots) return `${name}@${reference}`
  if (reference in snapshots) return reference
  throw new Error(`Unresolved lock edge ${name} -> ${reference}`)
}

function closure(snapshots, importers) {
  const seen = new Set()
  const queue = []
  const edges = []
  function visit(owner, group, name, reference) {
    const key = target(snapshots, name, reference)
    edges.push({ owner, group, name, reference, target: key })
    if (key && !seen.has(key)) {
      seen.add(key)
      queue.push(key)
    }
  }
  for (const [owner, importer] of Object.entries(importers)) {
    for (const group of groups) {
      for (const [name, entry] of Object.entries(importer[group] ?? {})) {
        visit(`importer:${owner}`, group, name, entry.version)
      }
    }
  }
  for (let i = 0; i < queue.length; i++) {
    const owner = queue[i]
    for (const group of groups) {
      for (const [name, reference] of Object.entries(snapshots[owner][group] ?? {})) {
        visit(owner, group, name, reference)
      }
    }
  }
  return { nodes: [...seen].sort(), edges }
}

const sections = {}
for (const section of ['packages', 'snapshots']) {
  const a = base[section]
  const b = candidate[section]
  const retained = Object.keys(b).filter((key) => key in a)
  sections[section] = {
    baseCount: Object.keys(a).length,
    candidateCount: Object.keys(b).length,
    retainedCount: retained.length,
    added: Object.keys(b).filter((key) => !(key in a)),
    removed: Object.keys(a).filter((key) => !(key in b)),
    // Full objects: resolution/integrity, dependencies, optionalDependencies,
    // peerDependencies/meta, transitivePeerDependencies and unknown fields.
    changes: retained
      .filter((key) => !equal(a[key], b[key]))
      .map((key) => ({ key, fields: delta(a[key], b[key]) })),
    semanticChanges: retained.filter(
      (key) =>
        !equal(
          section === 'snapshots' ? withoutOptional(a[key]) : a[key],
          section === 'snapshots' ? withoutOptional(b[key]) : b[key],
        ),
    ),
  }
}
const expectedPlayground = {
  dependencies: {
    '@nerv-iip/ui': { specifier: 'workspace:*', version: 'link:../../packages/ui' },
    vue: { specifier: '3.5.39', version: base.importers['packages/ui'].dependencies.vue.version },
  },
}
const importers = {
  base: Object.keys(base.importers),
  candidate: Object.keys(candidate.importers),
  rootUnchanged: equal(base.importers['.'], candidate.importers['.']),
  uiUnchanged: equal(base.importers['packages/ui'], candidate.importers['packages/ui']),
  playgroundMatchesPublicWorkspaceAndSourceVue: equal(
    expectedPlayground,
    candidate.importers['apps/playground'],
  ),
  onlyActiveImporters: equal(Object.keys(candidate.importers).sort(), [
    '.',
    'apps/playground',
    'packages/ui',
  ]),
}
const topLevelChanges = delta(
  Object.fromEntries(
    Object.entries(base).filter(([key]) => !['packages', 'snapshots', 'importers'].includes(key)),
  ),
  Object.fromEntries(
    Object.entries(candidate).filter(
      ([key]) => !['packages', 'snapshots', 'importers'].includes(key),
    ),
  ),
)
// The approved importer changes select roots. Reachability always follows SOURCE
// edges, so changed candidate edges cannot make incorrectly pruned nodes disappear.
const sourceClosure = closure(base.snapshots, candidate.importers)
const candidateClosure = closure(candidate.snapshots, candidate.importers)
const sourceSnapshots = new Set(sourceClosure.nodes)
const sourcePackages = new Set(sourceClosure.nodes.map((key) => key.split('(')[0]))
const reachability = {
  sourceSnapshotCount: sourceSnapshots.size,
  sourcePackageCount: sourcePackages.size,
  sourceEdgeCount: sourceClosure.edges.length,
  candidateEdgeCount: candidateClosure.edges.length,
  missingSourceSnapshots: [...sourceSnapshots].filter((key) => !(key in candidate.snapshots)),
  missingSourcePackages: [...sourcePackages].filter((key) => !(key in candidate.packages)),
  extraSnapshots: Object.keys(candidate.snapshots).filter((key) => !sourceSnapshots.has(key)),
  extraPackages: Object.keys(candidate.packages).filter((key) => !sourcePackages.has(key)),
  unreachableCandidateSnapshots: Object.keys(candidate.snapshots).filter(
    (key) => !candidateClosure.nodes.includes(key),
  ),
}
const optionalOnly = sections.snapshots.changes.filter(({ key }) =>
  equal(withoutOptional(base.snapshots[key]), withoutOptional(candidate.snapshots[key])),
)
// These five classification-only changes were independently reviewed in R1.
// Keep them visible and permit only absence -> true; never ignore edge changes.
const expectedOptionalNames = ['@noble/hashes', '@pinia/colada', 'esbuild', 'pinia', 'rollup']
const optionalClassificationValid =
  optionalOnly.length === 5 &&
  optionalOnly.every(
    ({ key, fields }) =>
      expectedOptionalNames.includes(
        key.slice(0, key.lastIndexOf('@', key.indexOf('(') < 0 ? key.length : key.indexOf('('))),
      ) && equal(fields, [{ field: 'optional', base: null, candidate: true }]),
  )
const pass =
  !topLevelChanges.length &&
  Object.values(importers)
    .filter((v) => typeof v === 'boolean')
    .every(Boolean) &&
  Object.values(sections).every((s) => !s.added.length && !s.semanticChanges.length) &&
  optionalClassificationValid &&
  Object.entries(reachability)
    .filter(([, v]) => Array.isArray(v))
    .every(([, v]) => !v.length)
const report = {
  baseCommit: '274d12baf1d5d27857beab0c7183d56623ffcefd',
  rejectedHead: '621ca3d868f0cc34a35640cc011915029e19ca2d',
  baseLockSha256: createHash('sha256').update(baseText).digest('hex'),
  candidateLockSha256: createHash('sha256').update(candidateText).digest('hex'),
  sections,
  importers,
  topLevelChanges,
  reachability,
  optionalOnly,
  optionalClassificationValid,
  wrapAnsi7: {
    base: base.snapshots['wrap-ansi@7.0.0'],
    candidate: candidate.snapshots['wrap-ansi@7.0.0'],
  },
  pass,
}
writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`)
console.log(
  JSON.stringify(
    {
      pass,
      packages: sections.packages.candidateCount,
      snapshots: sections.snapshots.candidateCount,
      packageSemanticChanges: sections.packages.semanticChanges,
      snapshotSemanticChanges: sections.snapshots.semanticChanges,
      reachability,
      optionalClassificationValid,
      wrapAnsi7: report.wrapAnsi7,
    },
    null,
    2,
  ),
)
if (!pass) process.exitCode = 1
