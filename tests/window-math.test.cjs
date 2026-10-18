const assert = require('node:assert/strict');
const m = require('../window-math.js');
const near = (a,b) => assert.ok(Math.abs(a-b)<1e-9, `${a} != ${b}`);
for (const width of [280,390,1200,1868]) for (const zoom of [.5,1,1.5]) {
  const end = Math.max(0,1868*zoom-width);
  near(m.offset(-10,width,zoom),0); near(m.offset(1e5,width,zoom),end);
  for (const cursor of [.0505,.3,.5,.9495]) {
    const left=m.follow(cursor,width,zoom), screen=cursor*1868*zoom-left;
    near(m.world(screen,left,zoom)/1868,cursor);
    assert.ok(left>=0 && left<=end);
    const box=m.overview(left,width,zoom);
    assert.ok(box.start>=0 && box.start+box.size<=1+1e-10);
    near(box.start*1868*zoom,left);
  }
}
// Zoom preserves the point under the pointer unless a physical edge prevents it.
for(const point of [0,80,195,390]) {
 const before=m.world(point,500,1);
 const left=m.anchor(500,point,1,1.5,390);
 near(m.world(point,left,1.5),before);
 near(m.anchor(left,point,1.5,1,390),500);
}
near(m.anchor(0,0,1,.5,1200),0);
// Moving the camera never changes the C/D values at the hairline.
const scale=require('../teaching-math.js');
for(const zoom of [.5,1,1.5]) for(const left of [0,400,1000]) {
 const start=scale.start*.9787*1868, span=scale.span*.9787*1868;
 const cursor=start+Math.log10(6)*span, slide=Math.log10(2)*span;
 const recovered=m.world(cursor*zoom-left,left,zoom);
 near(scale.value('D',(recovered-start)/span),6);
 near(scale.value('C',(recovered-start-slide)/span),3);
}
console.log('Window bounds, cursor projection, overview, pointer zoom and scale invariance passed.');
// Exercise the actual rule controller across native-window and zoom resizes.
const vm = require('node:vm');
const fs = require('node:fs');
class Element extends EventTarget {
  style = {}; classList = {add(){},remove(){}};
}
const rule = new Element(), stage = new Element(), cursorEl = new Element(), slideEl = new Element();
let stageWidth = 320;
stage.getBoundingClientRect = () => ({width:stageWidth});
cursorEl.getBoundingClientRect = () => ({width:stageWidth*.101});
const win = new EventTarget();
class DetailEvent extends Event { constructor(type, init){super(type);this.detail=init.detail;} }
vm.runInNewContext(fs.readFileSync(require.resolve('../rule.js'),'utf8'), {
 document:{getElementById:id=>({rule,ruleStage:stage,cursor:cursorEl,slideWrap:slideEl}[id])},
 window:win,location:{search:'?window=1'},URLSearchParams,Event,CustomEvent:DetailEvent
});
rule.teaching.set(.2,.7);
for(const nextWidth of [1868,2802,934,1868]) {
 stageWidth=nextWidth;rule.dispatchEvent(new Event('window-resize'));
 near(rule.teaching.get().slide,.2);near(rule.teaching.get().cursor,.7);
 near(parseFloat(cursorEl.style.left),stageWidth*.7);
}
rule.teaching.set(5,-1);
near(rule.teaching.get().slide,1.1);near(rule.teaching.get().cursor,.0505);
rule.teaching.set(-5,2);
near(rule.teaching.get().slide,-1.1);near(rule.teaching.get().cursor,.9495);
console.log('Actual rule controller preserves normalized slide/cursor on zoom and clamps bounds.');
