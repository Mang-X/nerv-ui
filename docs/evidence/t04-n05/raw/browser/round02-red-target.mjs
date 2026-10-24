const p=(await taskSpace(15)).page('p1');
const r=await p.evaluate(()=>{const b=document.querySelector('[aria-label="移除标签"]');const r=b.getBoundingClientRect();return {width:r.width,height:r.height}});
console.log(r);if(r.width<44||r.height<44)throw new Error('N05 mobile tag close target must be at least 44x44');
