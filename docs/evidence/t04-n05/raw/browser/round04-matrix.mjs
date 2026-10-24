const p=(await taskSpace(15)).page('p1');
const {scenario}=await import('file:///tmp/nerv-ui-t04-n05/browser/scenario.mjs');
await scenario(p,390,844,false);
