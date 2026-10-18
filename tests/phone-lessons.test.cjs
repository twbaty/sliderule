const assert=require('node:assert/strict');
const fs=require('node:fs');
const m=require('../teaching-math.js');
const lessons=require('../phone-lessons.js');
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-10,`${a} != ${b}`);
for(const lesson of Object.values(lessons).flat()) {
 const [lo,hi]=lesson.range.map(Math.log10);
 lesson.steps.forEach(([slide,hairline],i)=>{
   assert.ok(hairline>=lo-1e-10&&hairline<=hi+1e-10);
   const svg=fs.readFileSync(`phone-steps/${lesson.id}_step${i+1}.svg`,'utf8');
   // Every drawn tick must be its formula-derived position within the crop.
   for(const tick of svg.matchAll(/data-scale="([A-Z]+)" data-value="([\d.]+)" d="M([\d.]+)/g)) {
    const pos=m.position(tick[1],Number(tick[2]))+(m.moving.has(tick[1])?slide:0);
    assert.ok(pos>=lo-1e-10&&pos<=hi+1e-10);
    assert.ok(Math.abs(Number(tick[3])-(65+485*(pos-lo)/(hi-lo)))<.000051);
   }
 });
}
near(Math.log10(2)+m.position('C',3),m.position('D',6));
near(m.position('D',6)-m.position('C',3),m.position('D',2));
near(m.position('D',2)+m.position('C',1.5),m.position('D',3));
near(m.position('D',2)+m.position('C',2.5),m.position('D',5));
near(m.position('A',4),m.position('D',2));
near(m.position('K',8),m.position('D',2));
near(m.value('CI',m.position('C',4))/10,.25);
near(m.value('L',m.position('D',2)),Math.log10(2));
near(m.value('C',m.position('S',30))/10,.5);
near(m.value('C',m.position('T',45))/10,1);
console.log('Phone examples, crop bounds and every SVG tick position passed.');
