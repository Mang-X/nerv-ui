# /// script
# requires-python = ">=3.12"
# dependencies = []
# ///
import pathlib, subprocess, sys
root='/Users/mang/Project/nerv-ui-worktrees/t06-f02-upload-lifecycle'
commands=[
 ('ui-final',['pnpm','-C','frontend','--filter','@nerv-iip/ui','test','--maxWorkers=1','--reporter=json','--outputFile=/tmp/nerv-ui-t06-f02/ui-final.json']),
 ('mobile-final',['pnpm','-C','frontend','--filter','@nerv-iip/ui-mobile','test','--maxWorkers=1','--reporter=json','--outputFile=/tmp/nerv-ui-t06-f02/mobile-final.json']),
 ('host-final',['pnpm','-C','frontend','--filter','@nerv-iip/playground','test','--maxWorkers=1','--reporter=json','--outputFile=/tmp/nerv-ui-t06-f02/host-final.json']),
 ('docs-ui',['pnpm','-C','frontend','--filter','@nerv-iip/ui','test:docs','--maxWorkers=1','--reporter=json','--outputFile=/tmp/nerv-ui-t06-f02/docs-ui.json']),
 ('docs-mobile',['pnpm','-C','frontend','--filter','@nerv-iip/ui-mobile','test:docs','--maxWorkers=1','--reporter=json','--outputFile=/tmp/nerv-ui-t06-f02/docs-mobile.json']),
 ('build-final',['pnpm','-C','frontend','build']),
 ('fmt-check',['pnpm','-C','frontend','exec','vp','fmt','--check','packages/ui/src/components/ui/file-upload/useFileUpload.ts','apps/playground/src/files/uploadLifecycle.test.ts','apps/playground/src/files/memoryUpload.ts','apps/playground/src/files/memoryUpload.test.ts','apps/playground/src/files/UploadPanel.vue']),
 ('lint',['pnpm','-C','frontend','exec','vp','lint','packages/ui/src/components/ui/file-upload/useFileUpload.ts','apps/playground/src/files/uploadLifecycle.test.ts','apps/playground/src/files/memoryUpload.ts','apps/playground/src/files/memoryUpload.test.ts','apps/playground/src/files/UploadPanel.vue']),
]
for name,args in commands:
 result=subprocess.run(['uv','run','/tmp/nerv-ui-t06-f02/run.py',name,*args],cwd=root)
 if result.returncode: sys.exit(result.returncode)
