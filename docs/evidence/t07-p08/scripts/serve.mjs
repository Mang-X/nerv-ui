import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const root=fileURLToPath(new URL('../../../../',import.meta.url))
const nested=process.argv.includes('--nested'),port=nested?4309:4308,mount=nested?'/p08/':'/'
const directory=nested?'/tmp/nerv-ui-p08-nested-dist':path.join(root,'frontend/apps/playground/dist')
const marker='/tmp/nerv-ui-p08-vendor-unavailable'
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.woff2':'font/woff2','.svg':'image/svg+xml','.wasm':'application/wasm'}
http.createServer((request,response)=>{
 const url=new URL(request.url,'http://127.0.0.1:'+port)
 if(!url.pathname.startsWith(mount)){response.writeHead(404);response.end('Unknown mount');return}
 const relative=decodeURIComponent(url.pathname.slice(mount.length))||'index.html',filename=path.resolve(directory,relative)
 if(!filename.startsWith(directory+path.sep)){response.writeHead(403);response.end();return}
 if(fs.existsSync(marker)&&/dhtmlxgantt\.es-.*\.js$/.test(filename)){response.writeHead(503,{'content-type':'text/javascript; charset=utf-8','cache-control':'no-store'});response.end('/* Deliberate P08 vendor-unavailable verification. */');return}
 if(!fs.existsSync(filename)||!fs.statSync(filename).isFile()){response.writeHead(404,{'content-type':'text/plain'});response.end('Missing production asset');return}
 const body=fs.readFileSync(filename)
 response.writeHead(200,{'content-type':mime[path.extname(filename)]??'application/octet-stream','content-length':body.length,'cache-control':'no-store'})
 response.end(body)
}).listen(port,'127.0.0.1',()=>console.log(JSON.stringify({pid:process.pid,cwd:process.cwd(),directory,port,mount,marker})))
