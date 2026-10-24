const p=(await taskSpace(15)).page('p1');
await p.reload();
console.log(await p.snapshot({scope:'full_page'}));
await p.click('loc=css:button[aria-label="移除标签"]');
console.log(await p.evaluate(()=>({output:document.querySelector('[aria-label="标签回显"]').textContent.trim(),buttons:[...document.querySelectorAll('button')].map(b=>({text:b.textContent.trim(),w:b.getBoundingClientRect().width,h:b.getBoundingClientRect().height}))})));
