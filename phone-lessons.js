/* Formula-based picture lessons, opt-in until the phone layout is approved. */
(function(root) {
  const p = Math.log10;
  const lessons = {
    cd: [
      {id:'mult', title:'Multiply: 2 × 3 = 6', scales:['C','D'], range:[1,6], steps:[
        [p(2),p(2),'Set C’s 1 over 2 on D.'],[p(2),p(6),'Find 3 on C; read 6 on D.']]},
      {id:'div', title:'Divide: 6 ÷ 3 = 2', scales:['C','D'], range:[1,6], steps:[
        [p(2),p(6),'Set 3 on C over 6 on D.'],[p(2),p(2),'At C’s 1, read 2 on D.']]},
      {id:'add', title:'Addition trick: 2 + 3 = 5', scales:['C','D'], range:[1,5], steps:[
        [p(2),p(3),'Set C’s 1 at D’s 2; at D’s 3, read C’s 1.5.'],[p(2),p(5),'Add 1 mentally; at C’s 2.5, read D’s 5.']]}
    ],
    ab:[{id:'square',title:'Square: 2² = 4',scales:['A','D'],range:[1,2.2],steps:[
      [0,0,'Keep the indices aligned.'],[0,p(2),'At 2 on D, read 4 on A; reverse for √4.']]}],
    k:[{id:'cube',title:'Cube: 2³ = 8',scales:['K','D'],range:[1,2.1],steps:[
      [0,0,'Keep the indices aligned.'],[0,p(2),'At 2 on D, read 8 on K; reverse for ∛8.']]}],
    'ci-di':[{id:'inverse',title:'Reciprocal: 1 ÷ 4 = 0.25',scales:['CI','C'],range:[3,5],steps:[
      [0,p(4),'Find 4 on C.'],[0,p(4),'Read 2.5 on CI; choose the decimal: 0.25.']]}],
    l:[{id:'log',title:'Logarithm: log₁₀(2) ≈ 0.301',scales:['D','L'],range:[1,2.5],steps:[
      [0,0,'At D’s 1, L reads 0.'],[0,p(2),'At 2 on D, read about 0.301 on L.']]}],
    's-t':[
      {id:'sine',title:'Sine: sin(30°) = 0.5',scales:['S','C'],range:[4,6],steps:[
        [0,p(5),'Find 30° on S, using increasing labels.'],[0,p(5),'Read 5 on C; divide by 10 to get 0.5.']]},
      {id:'tangent',title:'Tangent: tan(45°) = 1',scales:['T','C'],range:[7,10],steps:[
        [0,1,'Find 45° at the right end of T.'],[0,1,'Read 10 on C; divide by 10 to get 1.']]}
    ]
  };
  if (typeof module !== 'undefined') { module.exports = lessons; return; }
  if(new URLSearchParams(location.search).get('pictures') !== '1') return;
  const topic=location.pathname.split('/').pop().replace('.html','');
  if(!lessons[topic]) return;
  document.body.classList.add('picture-preview');
  const section=document.createElement('section');
  section.className='examples phone-lessons';
  section.innerHTML='<h2>Worked examples · picture preview</h2><p>Only the useful section of each scale is shown. Track decimal places mentally. Off-the-end problems belong on the live rule.</p>';
  const link=document.createElement('a');
  link.className='button secondary';
  link.href=location.pathname+'?teach=1#rule';
  link.textContent='Open the live rule (turn your phone sideways)';
  section.append(link);
  for(const lesson of lessons[topic]) {
    const item=document.createElement('article'); item.className='example';
    const heading=document.createElement('h3'); heading.textContent=lesson.title; item.append(heading);
    const steps=document.createElement('div'); steps.className='example-steps';
    lesson.steps.forEach((step,i)=>{
      const figure=document.createElement('figure');
      const img=document.createElement('img'); img.src=`phone-steps/${lesson.id}_step${i+1}.svg`; img.alt=`${lesson.scales.join(' and ')} scale section: ${step[2]}`; img.width=600; img.height=240;
      const caption=document.createElement('figcaption'); caption.textContent=`${i+1}. ${step[2]}`;
      figure.append(img,caption); steps.append(figure);
    });
    item.append(steps); section.append(item);
  }
  document.querySelector('.hero').after(section);
  document.querySelectorAll('.nav a, .next a').forEach(a=>{
    if(!a.getAttribute('href').startsWith('index')) a.search='?pictures=1';
  });
})(typeof window==='undefined'?globalThis:window);
