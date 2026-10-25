import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const root = fileURLToPath(new URL('../../../../', import.meta.url))
const [name, directory, command, ...args] = process.argv.slice(2)
if (!name || !directory || !command) throw new Error('name cwd command args required')
const raw = path.join(root, 'docs/evidence/t07-p07/raw')
const shim = '/tmp/nerv-ui-p07-bin'
fs.mkdirSync(shim, { recursive: true })
fs.writeFileSync(path.join(shim, 'pnpm'), '#!/bin/sh\nexec corepack pnpm "$@"\n', { mode: 0o755 })
const cwd = path.resolve(root, directory)
const started = new Date().toISOString()
const result = spawnSync(command, args, { cwd, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024, env: { ...process.env, PATH: shim + path.delimiter + process.env.PATH } })
fs.writeFileSync(path.join(raw, name + '.log'), (result.stdout ?? '') + (result.stderr ?? ''))
const registry = path.join(raw, 'gates.json')
const gates = fs.existsSync(registry) ? JSON.parse(fs.readFileSync(registry, 'utf8')) : []
gates.push({ name, cwd, command, args, started, finished: new Date().toISOString(), exit: result.status, signal: result.signal, error: result.error?.message ?? null })
fs.writeFileSync(registry, JSON.stringify(gates, null, 2) + '\n')
console.log(JSON.stringify(gates.at(-1)))
process.exitCode = result.status ?? 1
