// Exercise page event handlers and persistence without a browser dependency.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const M=require('../practice-math.js');
function boot(storage, options={}) {
  const nodes=new Map();
  function node(id){return {id,value:'',textContent:'',disabled:false,children:[],events:{},setAttribute(){},appendChild(n){this.children.push(n);},replaceChildren(){this.children=[];},addEventListener(n,f){this.events[n]=f;},setPointerCapture(){},getBoundingClientRect(){return {top:0,width:1100,height:490};},parentElement:{scrollBy(){}}};}
  const html=fs.readFileSync('practice.html','utf8');
  for(const match of html.matchAll(/id="([^"]+)"/g))nodes.set(match[1],node(match[1]));
  nodes.get('topic').value='multiply';nodes.get('level').value='0';nodes.get('target').value='hair';
  let generated;
  const math={...M,generate(...args){generated=M.generate(...args,()=>.2);return generated;}};
  const context={PracticeMath:math,document:{getElementById:id=>nodes.get(id),createElement:()=>node(),createElementNS:()=>node()},localStorage:{getItem(){if(options.blocked)throw Error('blocked');return storage.value||null;},setItem(k,v){if(options.blocked)throw Error('blocked');storage.value=v;}}};
  vm.runInNewContext(fs.readFileSync('practice.js','utf8'),context);
  return {nodes,get problem(){return generated;},solve(){const p=generated,raw=M.read(p.scale,p.x-(p.scale==='CI'?p.slide:0));nodes.get('slide').value=p.slide;nodes.get('hair').value=p.x;nodes.get('decimal').value=p.scale==='L'?0:Math.round(Math.log10(p.answer/raw));nodes.get('check').onclick();}};
}
const storage={};let ui=boot(storage);
ui.solve();assert.match(ui.nodes.get('streak').textContent,/Streak: 1/);
ui.nodes.get('check').onclick();assert.equal(JSON.parse(storage.value).streak,1);
ui.nodes.get('next').onclick();ui.solve();assert.equal(JSON.parse(storage.value).streak,2);
ui=boot(storage);assert.match(ui.nodes.get('streak').textContent,/Streak: 2 · Best: 2/);
ui.nodes.get('slide').value=.9;ui.nodes.get('check').onclick();assert.equal(JSON.parse(storage.value).streak,0);
assert.match(ui.nodes.get('feedback').textContent,/Move the slide/);
ui.solve();assert.equal(JSON.parse(storage.value).streak,1);
ui.nodes.get('next').onclick();ui.nodes.get('next').onclick();assert.equal(JSON.parse(storage.value).streak,0);
for(const topic of ['multiply','divide','powers','cubes','reciprocals','logs','trig'])for(const level of ['0','1','2']){
  ui.nodes.get('topic').value=topic;ui.nodes.get('level').value=level;ui.nodes.get('topic').onchange();
  ui.solve();assert.match(ui.nodes.get('feedback').textContent,/Within three/);
  assert.equal(ui.nodes.get('decimal').disabled,topic==='logs');
}
assert.ok(ui.nodes.get('scales').children.length>20);
assert.doesNotThrow(()=>boot({}, {blocked:true}).solve());
assert.doesNotThrow(()=>boot({value:'broken JSON'}).solve());
console.log('Passed: all topic/level page handlers, SVG rendering, scoring once, retries, skip reset, persistence, corrupt and blocked storage.');
