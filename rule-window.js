/* Opt-in camera preview. Photos have a hard 1.5× native-resolution ceiling. */
(() => {
  if (new URLSearchParams(location.search).get('window') !== '1') return;
  const rule = document.getElementById('rule'), stage = document.getElementById('ruleStage');
  if (!stage) return;
  const m = WindowMath;
  rule.classList.add('window-rule');
  const viewport = document.createElement('div'); viewport.className = 'rule-viewport';
  viewport.tabIndex = 0; viewport.setAttribute('aria-label', 'Rule window. Left and right arrows pan; plus and minus zoom.');
  stage.before(viewport); viewport.append(stage);
  const tools = document.createElement('div'); tools.className = 'window-tools';
  tools.innerHTML = '<button type="button" class="action" aria-label="Zoom out">−</button><output aria-live="polite"></output><button type="button" class="action" aria-label="Zoom in">+</button><button type="button" class="action" aria-label="Magnifier" aria-pressed="false">🔍</button>';
  rule.before(tools);
  const strip = document.createElement('div'); strip.className = 'rule-overview'; strip.tabIndex = 0;
  strip.setAttribute('role','slider'); strip.setAttribute('aria-label','Rule overview position'); strip.setAttribute('aria-valuemin','0'); strip.setAttribute('aria-valuemax','100');
  const mini = stage.cloneNode(true); mini.removeAttribute('id'); mini.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
  mini.className = 'overview-art'; strip.append(mini);
  const box = document.createElement('span'); box.className = 'overview-box'; strip.append(box); rule.after(strip);
  const hint = document.createElement('p'); hint.className = 'rule-hint'; hint.textContent = 'Drag the fixed bars to pan; drag the slide or cursor to move them. Wheel, pinch or +/− to zoom. Photo zoom and lens capped at 1.5× until the drawn rule is ready.'; strip.after(hint);
  const lens = document.createElement('div'); lens.className = 'rule-lens'; lens.hidden = true; lens.setAttribute('aria-hidden','true'); viewport.append(lens);
  const lensArt = stage.cloneNode(true); lensArt.removeAttribute('id'); lensArt.querySelectorAll('[id]').forEach(el => el.removeAttribute('id')); lensArt.className = 'lens-art'; lens.append(lensArt);
  let zoom = 1, left = 0, cursor = .5, slide = 0, previousCursor = null, resizing = false;
  const width = () => viewport.clientWidth;
  function paint() {
    left = m.offset(left, width(), zoom);
    stage.style.width = `${1868 * zoom}px`; stage.style.height = `${290 * zoom}px`;
    stage.style.marginLeft = `${-left}px`;
    const view = m.overview(left, width(), zoom);
    box.style.left = `${view.start * 100}%`; box.style.width = `${view.size * 100}%`;
    strip.setAttribute('aria-valuenow', Math.round(view.start * 100));
    tools.querySelector('output').textContent = `${Math.round(zoom * 100)}%`;
    const buttons = tools.querySelectorAll('button'); buttons[0].disabled = zoom <= .5; buttons[1].disabled = zoom >= 1.5;
    const miniHeight = strip.clientWidth * 290 / 1868;
    mini.style.height = `${miniHeight}px`; mini.style.transform = `scaleY(${strip.clientHeight / miniHeight})`;
    mini.querySelector('.rule-slider-wrap').style.transform = `translateX(${slide * strip.clientWidth}px)`;
    lens.style.left = `${m.clamp(cursor * 1868 * zoom - left, 80, Math.max(80, width()-80))}px`;
    lensArt.style.width = '2802px'; lensArt.style.height = '435px';
    lensArt.style.left = `${80 - cursor * 2802}px`; lensArt.style.top = '-137px';
    lensArt.querySelector('.rule-slider-wrap').style.transform = `translateX(${slide * 2802}px)`;
    lensArt.querySelector('img:last-child').style.left = `${cursor * 100}%`;
    mini.querySelector('img:last-child').style.left = `${cursor * 100}%`;
  }
  function setZoom(next, point = width()/2) {
    rule.dispatchEvent(new Event('rule-interrupt'));
    next = m.clamp(next,.5,1.5); left = m.anchor(left,point,zoom,next,width());
    resizing = true; zoom = next; paint();
    rule.dispatchEvent(new Event('window-resize')); resizing = false;
  }
  rule.addEventListener('rule-render', e => {
    ({cursor,slide} = e.detail);
    if (!resizing && Math.abs(cursor - (previousCursor ?? -1)) > 1e-12) left = m.follow(cursor,width(),zoom);
    previousCursor = cursor; paint();
  });
  const buttons = tools.querySelectorAll('button');
  buttons[0].onclick = () => setZoom(zoom / 1.2); buttons[1].onclick = () => setZoom(zoom * 1.2);
  buttons[2].onclick = () => {lens.hidden = !lens.hidden; buttons[2].setAttribute('aria-pressed',String(!lens.hidden)); paint();};
  viewport.addEventListener('wheel', e => {e.preventDefault(); setZoom(zoom * Math.exp(-e.deltaY * .002),e.clientX-viewport.getBoundingClientRect().left);}, {passive:false});
  const pointers = new Map(); let pan = false, lastX = 0, distance = 0;
  viewport.addEventListener('pointerdown', e => {
    if (e.button !== 0) return;
    pointers.set(e.pointerId,e.clientX);
    if (pointers.size === 2 || (!e.target.closest('#cursor, #slideWrap'))) {
      rule.dispatchEvent(new Event('rule-interrupt')); pan = true; lastX = e.clientX;
      viewport.setPointerCapture(e.pointerId); e.stopImmediatePropagation(); e.preventDefault();
    }
    if (pointers.size === 2) { window.dispatchEvent(new Event('pointercancel')); distance = Math.abs([...pointers.values()][0]-[...pointers.values()][1]); }
  },true);
  viewport.addEventListener('pointermove', e => {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId,e.clientX);
    if (pointers.size === 2) {
      const xs = [...pointers.values()], next = Math.abs(xs[0]-xs[1]);
      if(distance > 0) setZoom(zoom * next/distance,(xs[0]+xs[1])/2-viewport.getBoundingClientRect().left);
      distance = next; e.stopPropagation();
    } else if(pan) {left -= e.clientX-lastX; lastX=e.clientX; paint(); e.stopPropagation();}
  },true);
  function end(e) {pointers.delete(e.pointerId); if (!pointers.size) pan=false; else lastX=[...pointers.values()][0]; distance=0;}
  viewport.addEventListener('pointerup',end); viewport.addEventListener('pointercancel',end);
  function jump(e) {rule.dispatchEvent(new Event('rule-interrupt')); left=m.offset((e.clientX-strip.getBoundingClientRect().left)/strip.clientWidth*1868*zoom-width()/2,width(),zoom); paint();}
  strip.addEventListener('pointerdown',e => {strip.setPointerCapture(e.pointerId); jump(e);});
  strip.addEventListener('pointermove',e => {if(strip.hasPointerCapture(e.pointerId)) jump(e);});
  function key(e) {
    if(['ArrowLeft','ArrowRight','+','=','-'].includes(e.key)) {e.preventDefault(); if(e.key.startsWith('Arrow')) {left += e.key==='ArrowLeft'?-100:100; paint();} else setZoom(zoom*(e.key==='-'?1/1.2:1.2));}
  }
  viewport.addEventListener('keydown',key); strip.addEventListener('keydown',key);
  document.getElementById('centerBtn')?.addEventListener('click', () => {left=m.follow(cursor,width(),zoom); paint();});
  window.addEventListener('resize',() => {left=m.follow(cursor,width(),zoom); paint();});
  document.querySelectorAll('a[href$=".html"]').forEach(a => {const u=new URL(a.href); u.searchParams.set('window','1'); a.href=u.href;});
  paint(); rule.dispatchEvent(new Event('window-resize')); left=m.follow(cursor,width(),zoom); paint();
})();
