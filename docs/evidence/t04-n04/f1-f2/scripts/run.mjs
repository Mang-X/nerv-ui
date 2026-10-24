import fs from 'node:fs'
import { spawnSync } from 'node:child_process'
const root = '/Users/mang/Project/nerv-ui-worktrees/t04-n04-mobile-lists'
const [name, ...args] = process.argv.slice(2)
const cwd = name.startsWith('probe-') ? '/private/tmp/nerv-ui-t04-n04-fix/probe' : root
const result = spawnSync(args[0], args.slice(1), { cwd, env: { ...process.env, PATH: `/tmp/nerv-ui-t04-n04-fix/bin:${process.env.PATH}` }, encoding: 'utf8', maxBuffer: 50 * 1024 * 1024 })
fs.writeFileSync(`/tmp/nerv-ui-t04-n04-fix/raw/${name}.log`, (result.stdout ?? '') + (result.stderr ?? ''))
fs.writeFileSync(`/tmp/nerv-ui-t04-n04-fix/raw/${name}.run.json`, JSON.stringify({ cwd: root, command: args, exit: result.status, signal: result.signal, error: result.error?.message }, null, 2))
console.log(JSON.stringify({name, exit: result.status, tail: ((result.stdout??'')+(result.stderr??'')).slice(-2800)}))
process.exitCode = result.status ?? 1
