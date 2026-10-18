// Run from the repository root: node scripts/generate-phone-steps.cjs
const fs=require('node:fs');
const math=require('../teaching-math.js');
const lessons=require('../phone-lessons.js');
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;');
for(const lesson of Object.values(lessons).flat()) {
  const lo=Math.log10(lesson.range[0]), hi=Math.log10(lesson.range[1]);
  const x=p=>65+(p-lo)/(hi-lo)*485;
  lesson.steps.forEach(([slide,hairline,caption],index)=>{
    let svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 240" role="img" aria-label="${esc(caption)}"><rect width="600" height="240" rx="16" fill="#fbf6ea"/><g font-family="Avenir Next, Trebuchet MS, sans-serif" fill="#163049">`;
    lesson.scales.forEach((scale,row)=>{
      const y=75+row*100;
      svg+=`<text x="12" y="${y}" font-size="23" font-weight="700" fill="#256b74">${scale}</text><path d="M55 ${y}H565" stroke="#163049"/>`;
      const offset=math.moving.has(scale)?slide:0;
      // Labels at readable intervals, with fine ticks between them.
      let ticks=[];
      if(scale==='L') for(let i=0;i<=100;i++) ticks.push([i/100,i%10===0]);
      else if(['S','T'].includes(scale)) for(let i=6;i<=(scale==='S'?90:45);i++) ticks.push([i,i%5===0]);
      else {
        const max=scale==='K'?1000:['A','B'].includes(scale)?100:10;
        for(let decade=1;decade<max;decade*=10) for(let n=10;n<100;n++) ticks.push([n*decade/10,n%10===0]);
        ticks.push([max,true]);
      }
      for(const [v,baseMajor] of ticks) {
        const major=baseMajor || (lesson.id==='add' && scale==='C' && [1.5,2.5].includes(v)) || (scale==='CI' && v===2.5);
        const pos=math.position(scale,v)+offset;
        if(pos<lo-1e-10||pos>hi+1e-10) continue;
        const xx=x(pos).toFixed(4);
        svg+=`<path data-scale="${scale}" data-value="${v}" d="M${xx} ${y}v${major?20:9}" stroke="#163049" stroke-width="${major?2:1}"/>`;
        if(major) svg+=`<text x="${xx}" y="${y-12}" text-anchor="middle" font-size="22">${v}</text>`;
      }
    });
    svg+=`</g><path data-hairline="${hairline}" d="M${x(hairline).toFixed(4)} 25V210" stroke="#c46b2f" stroke-width="3" stroke-dasharray="6 4"/></svg>\n`;
    fs.writeFileSync(`phone-steps/${lesson.id}_step${index+1}.svg`,svg);
  });
}
