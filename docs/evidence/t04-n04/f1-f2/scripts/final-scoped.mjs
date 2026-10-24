import cp from 'node:child_process';import fs from 'node:fs';const root='/Users/mang/Project/nerv-ui-worktrees/t04-n04-mobile-lists';
const files=cp.execFileSync('git',['diff','--name-only','d730e76ac576baa7c1509a50af4857fd9370a5bd','--','*.vue','*.ts','*.md'],{cwd:root,encoding:'utf8'}).trim().split('\n').filter(p=>!p.includes('/f1-f2/r1/')&&!p.includes('/raw/'));
files.push('docs/evidence/t04-n04/f1-f2/README.md');const list=[...new Set(files)].map(p=>root+'/'+p);
for(const [name,args] of [['all-scoped-fmt',['fmt','--check',...list]],['all-scoped-lint',['lint',...list.filter(p=>/\.(vue|ts)$/.test(p))]]]){const r=cp.spawnSync('node',['/tmp/nerv-ui-t04-n04-fix/run.mjs',name,'corepack','pnpm@11.22.0','-C','frontend','exec','vp',...args],{cwd:root,stdio:'inherit'});if(r.status)process.exit(r.status)}
fs.writeFileSync('/tmp/nerv-ui-t04-n04-fix/raw/scoped-paths.json',JSON.stringify(list,null,2));
