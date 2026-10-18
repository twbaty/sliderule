(function () {
  const M=PracticeMath, $=id=>document.getElementById(id), svg=$('scales');
  const rows=['K','A','S','T','C','CI','D','L'];
  let problem, solved=true, streak=0,best=0;
  try { const saved=JSON.parse(localStorage.getItem('pickett-practice-v1')); if(saved) {streak=Number.isSafeInteger(saved.streak)&&saved.streak>=0?saved.streak:0;best=Number.isSafeInteger(saved.best)&&saved.best>=streak?saved.best:streak;} } catch {}
  function save() {best=Math.max(best,streak);try{localStorage.setItem('pickett-practice-v1',JSON.stringify({streak,best}));}catch{} $('streak').textContent=`Streak: ${streak} · Best: ${best}`;}
  function el(name,attrs,text,parent=svg) {const node=document.createElementNS('http://www.w3.org/2000/svg',name);for(const [k,v] of Object.entries(attrs))node.setAttribute(k,v);if(text!==undefined)node.textContent=text;parent.appendChild(node);return node;}
  function values(scale) {
    if(scale==='L')return Array.from({length:51},(_,i)=>i/50);
    if(scale==='S')return [6,7,8,9,10,12,15,20,25,30,40,50,60,70,80,90];
    if(scale==='T')return [6,7,8,9,10,12,15,20,25,30,35,40,45];
    const decades=scale==='A'?2:scale==='K'?3:1, out=[];
    for(let d=0;d<decades;d++)for(let i=10;i<100;i++)out.push(i/10*10**d);
    out.push(10**decades);return out;
  }
  function draw() {
    svg.replaceChildren();const slide=+$('slide').value,x=+$('hair').value;
    rows.forEach((scale,i)=>{
      const y=25+i*58, moving=['C','CI'].includes(scale);
      el('rect',{x:0,y:y-18,width:1100,height:57,fill:moving?'#e1d49f':'#f7ebc4'});
      const group=el('g',{'data-scale':scale,transform:`translate(${moving?slide*960:0} 0)`});
      el('line',{x1:90,y1:y+22,x2:1050,y2:y+22,stroke:'#253b45'},undefined,group);
      values(scale).forEach(v=>{
        const p=M.pos(scale,v);if(p<0||p>1.000001)return;
        const xx=90+960*p;
        const major=scale==='L'?Math.abs(v*10-Math.round(v*10))<1e-8:['S','T'].includes(scale)||Math.abs(v/10**Math.floor(Math.log10(v))-Math.round(v/10**Math.floor(Math.log10(v))))<1e-8;
        el('line',{x1:xx,x2:xx,y1:y+(major?8:15),y2:y+22,stroke:'#253b45'},undefined,group);
        if(major)el('text',{x:xx,y:y+3,'text-anchor':'middle','font-size':14,fill:'#163049'},+v.toPrecision(4),group);
      });
      el('rect',{x:0,y:y-18,width:65,height:57,fill:'#183149'});
      el('text',{x:30,y:y+14,fill:'white','font-size':20,'text-anchor':'middle'},scale);
    });
    el('rect',{x:90+x*960-10,y:2,width:20,height:480,fill:'#c46b2f','fill-opacity':0.12});
    el('line',{x1:90+x*960,x2:90+x*960,y1:2,y2:482,stroke:'#b33c24','stroke-width':2});
    const raw=M.read(problem.scale,x-(problem.scale==='CI'?slide:0));
    $('reading').textContent=`Under the cursor on ${problem.scale}: ${Number.isFinite(raw)?raw.toPrecision(4):'outside scale'}`;
  }
  for(let n=-5;n<=5;n++){const o=document.createElement('option');o.value=n;o.textContent=`${10**n} (10^${n})`;$('decimal').appendChild(o);}
  function next() {
    if(!solved)streak=0;
    problem=M.generate($('topic').value,+$('level').value);solved=false;
    $('problem').textContent=problem.text+' = ?';$('guide').textContent=problem.guide;
    $('task').textContent=`Set the slide and cursor. Read the answer on ${problem.scale}${problem.scale==='L'?'':', then choose its decimal place'}.`;
    $('decimal').value=0;$('decimal').disabled=problem.scale==='L';
    $('decimalHelp').textContent=problem.scale==='L'?'L gives the logarithm directly; no decimal multiplier is needed.':'The rule says 6: does your estimate make that 0.6, 6, or 60?';
    $('slide').value=0;$('hair').value=.5;$('feedback').textContent='Set the rule, then check your reading.';save();draw();
  }
  $('next').onclick=next;$('topic').onchange=next;$('level').onchange=next;
  $('slide').oninput=draw;$('hair').oninput=draw;
  function nudge(direction) {const target=$($('target').value);target.value=+target.value+direction*.00005;draw();}
  $('left').onclick=()=>nudge(-1);$('right').onclick=()=>nudge(1);
  $('reset').onclick=()=>{$('slide').value=0;draw();};
  let drag;
  svg.addEventListener('pointerdown',e=>{const box=svg.getBoundingClientRect();const y=(e.clientY-box.top)/box.height*490;drag={id:e.pointerId,start:e.clientX,which:y>=239&&y<355?'slide':'hair',width:box.width/1100*960};drag.initial=+$(drag.which).value;svg.setPointerCapture(e.pointerId);});
  svg.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;$(drag.which).value=drag.initial+(e.clientX-drag.start)/drag.width;draw();});
  $('viewLeft').onclick=()=>svg.parentElement.scrollBy({left:-280,behavior:'smooth'});
  $('viewRight').onclick=()=>svg.parentElement.scrollBy({left:280,behavior:'smooth'});
  const end=()=>{drag=null;};svg.addEventListener('pointerup',end);svg.addEventListener('pointercancel',end);
  $('check').onclick=()=>{
    if(solved){$('feedback').textContent='Already counted. Choose New problem to continue.';return;}
    const result=M.assess(problem,+$('slide').value,+$('hair').value,+$('decimal').value);
    if(result.correct){solved=true;streak++;$('feedback').textContent=`Within three-significant-figure tolerance. Your reading: ${result.value.toPrecision(4)}; answer: ${problem.answer.toPrecision(4)} (${result.percent.toFixed(3)}% away).`;}
    else {streak=0;$('feedback').textContent=`Your reading: ${Number.isFinite(result.value)?result.value.toPrecision(4):'outside scale'} (${Number.isFinite(result.percent)?result.percent.toFixed(2):'—'}% away).\n${result.hint}`;}
    save();
  };
  next();
})();
