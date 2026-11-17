import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
const base = 'a20825e0477f446737a6bfc07d84b8ec20a143b6'
const sha = value => createHash('sha256').update(value).digest('hex')
const git = (...args) => execFileSync('git',args)
const files = git('ls-files','-z').toString().split('\0').filter(Boolean)
const protectedFiles = files.filter(p=>/(^|\/)(package\.json|pnpm-lock\.yaml|pnpm-workspace\.yaml)$/.test(p))
const manifests = protectedFiles.map(path=>{const before=git('show',`${base}:${path}`),after=readFileSync(path);return {path,equal:before.equals(after),baseSha256:sha(before),currentSha256:sha(after)}})
const mobile = files.filter(p=>p.startsWith('frontend/packages/ui-mobile/') && /\.(vue|ts|css)$/.test(p)).map(path=>({path,equal:git('show',`${base}:${path}`).equals(readFileSync(path))}))
const audit = {base,baseTree:git('rev-parse',`${base}^{tree}`).toString().trim(),comparison:'complete raw bytes, including retained inactive manifests and full lockfile; no keys-only comparison',manifests,mobileChanges:mobile.filter(x=>!x.equal),unchangedMobileSourceFiles:mobile.filter(x=>x.equal).length,pnpm:execFileSync('/tmp/nerv-ui-t04-n02/bin/pnpm',['-C','frontend','exec','pnpm','--version'],{env:{...process.env,PATH:`/tmp/nerv-ui-t04-n02/bin:${process.env.PATH}`}}).toString().trim()}
writeFileSync('/tmp/nerv-ui-t04-n02/dependency-source-audit.json',JSON.stringify(audit,null,2)+'\n')
console.log(JSON.stringify({retainedManifestsAndLocks:manifests.length,changed:manifests.filter(x=>!x.equal),mobileChanges:audit.mobileChanges,unchangedMobileSourceFiles:audit.unchangedMobileSourceFiles,nestedPnpm:audit.pnpm},null,2))
if(manifests.some(x=>!x.equal)) process.exit(1)
