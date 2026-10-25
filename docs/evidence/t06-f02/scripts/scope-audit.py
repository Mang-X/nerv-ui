# /// script
# requires-python = ">=3.12"
# dependencies = []
# ///
import hashlib, json, pathlib, subprocess
root=pathlib.Path('/Users/mang/Project/nerv-ui-worktrees/t06-f02-upload-lifecycle')
base='e763c0fdc3e2800975578ab402b479d56f23c6fd'
def git(*args): return subprocess.check_output(['git',*args],cwd=root).decode().strip()
allowed={
 'docs/files-standalone.md',
 'frontend/apps/design-system/docs/components/desktop/file-upload.md',
 'frontend/packages/ui/src/components/ui/file-upload/useFileUpload.ts',
 'frontend/apps/playground/src/files/UploadPanel.vue',
 'frontend/apps/playground/src/files/memoryUpload.ts',
 'frontend/apps/playground/src/files/memoryUpload.test.ts',
 'frontend/apps/playground/src/files/uploadLifecycle.test.ts',
}
changed=set(git('diff','--name-only',base).splitlines()) | set(git('ls-files','--others','--exclude-standard').splitlines())
unexpected=sorted(p for p in changed if p not in allowed and not p.startswith('docs/evidence/t06-f02/'))
assert not unexpected,unexpected
result=dict(base=base,changed=sorted(changed),unexpected=unexpected,
  codeAndDocs=[dict(path=p,sha256=hashlib.sha256((root/p).read_bytes()).hexdigest()) for p in sorted(allowed)],
  frozenPaths=git('diff','--name-only',base,'--','migration','frontend/pnpm-lock.yaml','frontend/packages/ui/src/components/ui/file-upload/types.ts','frontend/packages/ui/src/components/ui/file-upload/nativeTransport.ts','frontend/packages/ui/src/components/ui/file-upload/FileUpload.vue').splitlines())
assert not result['frozenPaths']
pathlib.Path('/tmp/nerv-ui-t06-f02/scope-check.json').write_text(json.dumps(result,indent=2))
print(json.dumps(result,indent=2))
