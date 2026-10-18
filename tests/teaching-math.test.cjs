const assert = require('node:assert/strict');
const m = require('../teaching-math.js');
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-10, `${a} != ${b}`);
for (const [scale, values] of Object.entries({C:[1,2,3,10],D:[1,6,10],A:[1,9,100],B:[1,9,100],K:[1,8,1000],CI:[1,2.5,10],L:[0,.30103,1],S:[6,30,90],T:[6,30,45]})) {
  for (const v of values) near(m.value(scale, m.position(scale,v)), v);
  assert.equal(m.value(scale, -0.01), null);
  assert.equal(m.value(scale, 1.01), null);
}
near(m.position('C',1)+m.position('D',2)+m.position('C',3), m.position('D',6));
near(m.position('D',6)-m.position('C',3), m.position('D',2));
near(m.value('A',m.position('D',3)),9);
near(m.value('B',m.position('C',3)),9);
near(m.value('K',m.position('D',2)),8);
near(m.value('CI',m.position('C',4))/10,.25);
near(m.value('L',m.position('D',2)),Math.log10(2));
near(m.value('C',m.position('S',30))/10,.5);
near(m.value('C',m.position('T',45))/10,1);
near(m.position('D',2.3)+m.position('C',1+4.5/2.3),m.position('D',6.8));
// Photo indices and responsive projection must round-trip at both viewport sizes.
for(const width of [300,1200]) {
 const start=m.start*width, span=m.span*width, slide=Math.log10(2)*span;
 const hairline=start+Math.log10(6)*span;
 near(m.value('C',(hairline-start-slide)/span),3);
 near(m.value('D',(hairline-start)/span),6);
}
console.log('All scale inverses, worked examples, off-scale bounds and photo projections passed.');
