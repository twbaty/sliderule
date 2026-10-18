/* Normalized scale length = 1. No photographic calibration. */
(function (root) {
  const log = Math.log10, rad = Math.PI / 180;
  const mantissa = n => n / 10 ** Math.floor(log(n));
  const pos = (scale, n) => ({ D: () => log(n), C: () => log(n), A: () => log(n)/2,
    K: () => log(n)/3, CI: () => 1-log(n), L: () => n,
    S: () => log(10*Math.sin(n*rad)), T: () => log(10*Math.tan(n*rad)) }[scale]());
  const read = (scale, x) => ({ D: () => 10**x, C: () => 10**x, A: () => 10**(2*x),
    K: () => 10**(3*x), CI: () => 10**(1-x), L: () => x,
    S: () => Math.asin(10**(x-1))/rad, T: () => Math.atan(10**(x-1))/rad }[scale]());
  const pick = (a, r) => a[Math.floor(r()*a.length)];
  function generate(topic, level, r = Math.random) {
    const a = level === 0 ? pick([2,3,4,5,6,8],r) : Math.round((1.2+r()*7.6)* (level===1?10:100))/(level===1?10:100);
    const b = level === 0 ? pick([2,3,4],r) : Math.round((1.2+r()*7.6)*10)/10;
    let answer, x, slide=0, scale='D', text, guide;
    const m=mantissa;
    if(topic==='multiply'||topic==='divide') {
      const aa=level===2?a*pick([0.01,0.1,10,100],r):a;
      const bb=level===2?b*pick([0.1,10],r):b;
      answer=topic==='multiply'?aa*bb:aa/bb;
      text=`${aa} ${topic==='multiply'?'×':'÷'} ${bb}`;
      if(topic==='multiply') {
        const overflow=log(a)+log(b)>1;
        slide=log(a)-(overflow?1:0); x=slide+log(b);
        guide=`Align C's ${overflow?'10 (right index)':'1 (left index)'} with ${a} on D. Move the cursor to ${b} on C; read D.${overflow?' Using C’s 1 would put the answer off the right end. Switch to C’s 10.':''}`;
      } else {
        slide=log(a)-log(b); x=slide+(slide<0?1:0);
        guide=`Align ${b} on C with ${a} on D. Move the cursor to C’s ${slide<0?'10 (right index)':'1 (left index)'} and read D. Choose the index that stays on the rule.`;
      }
    } else if(topic==='powers') {
      const root=r()<0.5;
      answer=root?a:a*a; x=log(a); scale=root?'D':'A'; text=root?`√${+(a*a).toFixed(4)}`:`${a}²`;
      guide=`Keep C and D aligned. Put the cursor on ${root?+(a*a).toFixed(4):a} on ${root?'A':'D'}; read ${scale}. A has two decades: use the correct half.`;
    } else if(topic==='cubes') {
      answer=a**3; x=log(a); scale='K'; text=`${a}³`; guide=`Keep C and D aligned. Put the cursor on ${a} on D; read K (three decades).`;
    } else if(topic==='reciprocals') {
      answer=1/a; x=log(a); scale='CI'; text=`1 ÷ ${a}`; guide=`Keep C and D aligned. Put the cursor on ${a} on D; read CI. Estimate the decimal: the reciprocal is less than 1.`;
    } else if(topic==='logs') {
      answer=log(a); x=log(a); scale='L'; text=`log₁₀(${a})`; guide=`Keep C and D aligned. Put the cursor on ${a} on D; read L. This is the fractional logarithm for a number between 1 and 10.`;
    } else {
      const angle=level===0?pick([10,20,30,40],r):Math.round((6+r()*38)*(level===2?10:1))/(level===2?10:1);
      const tangent=r()<0.5; scale='D'; answer=tangent?Math.tan(angle*rad):Math.sin(angle*rad);
      x=pos(tangent?'T':'S',angle); text=`${tangent?'tan':'sin'}(${angle}°)`;
      guide=`Keep C and D aligned. Put the cursor on ${angle}° on ${tangent?'T':'S'}; read D and place the decimal. Angles are in degrees.`;
    }
    return {topic,level,answer,x,slide,scale,text,guide};
  }
  // Half a unit in the third significant digit; 0.5% at the start of a decade.
  const tolerance = n => 0.5 * 10**(Math.floor(log(Math.abs(n)))-2);
  function assess(p, slide, cursor, decimal) {
    const raw=read(p.scale,cursor-(p.scale==='CI'?slide:0));
    const value=p.scale==='L'?raw:raw*10**decimal;
    const error=Math.abs(value-p.answer);
    const alignment=Math.abs(slide-p.slide);
    const aligned=Math.abs(10**alignment-1)<=0.001;
    const correct=Number.isFinite(value)&&error<=tolerance(p.answer)+1e-12&&aligned;
    let hint;
    if(!aligned) hint=`Move the slide ${slide<p.slide?'right':'left'}. ${p.guide}`;
    else if(Math.abs(cursor-p.x)>0.001) hint=`Move the cursor ${cursor<p.x?'right':'left'}; read ${p.scale}. ${p.guide}`;
    else hint='The positions look right. Check the decimal place by estimating the answer.';
    return {correct,value,error,percent:100*error/Math.abs(p.answer),hint};
  }
  const api={pos,read,generate,assess,tolerance,mantissa};
  if(typeof module!=='undefined') module.exports=api; else root.PracticeMath=api;
})(typeof window==='undefined'?globalThis:window);
