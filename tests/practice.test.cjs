const assert=require('node:assert/strict');
const M=require('../practice-math.js');
for(const [scale,values] of Object.entries({D:[1,2,6,10],C:[1,3,10],A:[1,4,25,100],K:[1,8,125,1000],CI:[1,2,10],L:[0,.3,1],S:[6,30,90],T:[6,30,45]})) {
  for(const n of values)assert.ok(Math.abs(M.read(scale,M.pos(scale,n))-n)<1e-10,`${scale} ${n}`);
}
assert.equal(M.pos('D',10),1);assert.equal(M.pos('A',100),1);assert.equal(M.pos('K',1000),1);
assert.ok(Math.abs(M.pos('S',30)-Math.log10(5))<1e-14);
let seed=42;const rng=()=>((seed=(seed*1664525+1013904223)>>>0)/2**32);
let overflow=0,left=0,right=0,roots=0,squares=0;
for(const topic of ['multiply','divide','powers','cubes','reciprocals','logs','trig'])for(let level=0;level<3;level++)for(let i=0;i<150;i++){
  const p=M.generate(topic,level,rng);
  assert.ok(p.x>=-1e-12&&p.x<=1+1e-12,JSON.stringify(p));
  const raw=M.read(p.scale,p.x-(p.scale==='CI'?p.slide:0));
  const decimal=p.scale==='L'?0:Math.round(Math.log10(p.answer/raw));
  const result=M.assess(p,p.slide,p.x,decimal);
  assert.ok(result.correct,JSON.stringify({p,raw,decimal,result}));
  assert.ok(!M.assess(p,p.slide+.03,p.x,decimal).correct);
  assert.ok(!M.assess(p,p.slide,p.x<.5?p.x+.05:p.x-.05,decimal).correct);
  if(p.scale!=='L')assert.ok(!M.assess(p,p.slide,p.x,decimal+1).correct);
  if(topic==='multiply'&&p.slide<0)overflow++;
  if(topic==='divide')p.slide<0?right++:left++;
  if(topic==='powers')p.scale==='D'?roots++:squares++;
}
assert.ok(overflow&&left&&right&&roots&&squares);
const p={answer:6,scale:'D',slide:0,x:Math.log10(6)};
assert.ok(M.assess(p,0,Math.log10(6.004),0).correct);
assert.ok(!M.assess(p,0,Math.log10(6.006),0).correct);
console.log('Passed: scale inverses, 3,150 generated solutions, incorrect settings, decimal errors, tolerance boundaries and both indices.');
