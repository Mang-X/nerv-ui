import { createRequire } from 'node:module';
import { realpathSync, writeFileSync } from 'node:fs';
const root='/Users/mang/Project/nerv-ui-worktrees/t06-f02-upload-lifecycle/frontend/';
const rows=['packages/ui','packages/ui-mobile','apps/playground'].map(p=>{
  const require=createRequire(root+p+'/package.json');
  return { package:p, version:require('vue/package.json').version, resolved:realpathSync(require.resolve('vue')) };
});
if(new Set(rows.map(r=>r.resolved)).size!==1 || rows.some(r=>r.version!=='3.5.39'))throw Error('Vue identity mismatch');
writeFileSync('/tmp/nerv-ui-t06-f02/vue-identity.json',JSON.stringify(rows,null,2));
console.log(rows);
