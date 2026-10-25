# /// script
# requires-python = ">=3.12"
# dependencies = []
# ///
import json, os, pathlib, subprocess, sys, time
ROOT = pathlib.Path('/Users/mang/Project/nerv-ui-worktrees/t06-f02-upload-lifecycle')
OUT = pathlib.Path('/tmp/nerv-ui-t06-f02')
env = dict(os.environ, PATH=str(OUT / 'bin') + ':' + os.environ['PATH'])
name, *args = sys.argv[1:]
start = time.time()
with (OUT / (name + '.log')).open('w') as log:
    result = subprocess.run(args, cwd=ROOT, env=env, stdout=log, stderr=subprocess.STDOUT)
record = dict(name=name, args=args, cwd=str(ROOT), exit=result.returncode, seconds=time.time()-start)
with (OUT / 'commands.jsonl').open('a') as f: f.write(json.dumps(record)+'\n')
print(json.dumps(record))
print((OUT / (name + '.log')).read_text()[-3000:])
sys.exit(result.returncode)
