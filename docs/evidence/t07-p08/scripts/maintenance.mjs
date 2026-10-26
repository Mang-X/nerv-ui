import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync,spawnSync } from 'node:child_process'
const root=fileURLToPath(new URL('../../../../',import.meta.url)),base='b56ef5f6ba4aada18190887335696864d13ad1d7'
const git=args=>execFileSync('git',args,{cwd:root,encoding:'utf8'}).trim().split('\n').filter(Boolean)
const files=[...new Set([...git(['diff','--name-only',base]),...git(['ls-files','--others','--exclude-standard'])])]
const frontend=files.filter(p=>p.startsWith('frontend/')&&/\.(vue|ts|md)$/.test(p)).map(p=>p.slice(9)),source=frontend.filter(p=>/\.(vue|ts)$/.test(p))
const commands=[['source-fmt','frontend','pnpm','exec','vp','fmt','--check',...frontend],['source-lint','frontend','pnpm','exec','vp','lint',...source],['docs-maintenance','.','node','docs/evidence/t07-p08/scripts/format-docs.mjs','--check',...files.filter(p=>!p.startsWith('frontend/')&&!p.startsWith('docs/evidence/')&&p.endsWith('.md'))]]
fs.writeFileSync(path.join(root,'docs/evidence/t07-p08/raw/maintenance-files.json'),JSON.stringify({frontend,source},null,2)+'\n')
let fail=false;for(const args of commands){const r=spawnSync('node',['docs/evidence/t07-p08/scripts/gate.mjs',...args],{cwd:root,stdio:'inherit'});if(r.status!==0)fail=true}process.exitCode=fail?1:0
