import {session,root,fs} from './browser-common.mjs'
const {task,page}=await session();
const before=await page.evaluate(()=>({url:location.href,timezone:Intl.DateTimeFormat().resolvedOptions().timeZone,visualScale:visualViewport?.scale,width:innerWidth,height:innerHeight,dpr:devicePixelRatio,theme:document.documentElement.className}));
const pages=await task.pages();const result=await task.finish({keep:[]});
await fs.writeFile(root+'/raw/browser-cleanup.json',JSON.stringify({before,pages:pages.map(p=>({label:p.label})),finish:result,finishedOnce:true,timezoneOverrideSet:false,nativeZoomChanged:false,upgraded:false},null,2)+'\n');
console.log({before,result});
