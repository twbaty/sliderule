(function () {
  const rule = document.getElementById('rule');
  const ruleStage = document.getElementById('ruleStage');
  const slideWrap = document.getElementById('slideWrap');
  const cursor = document.getElementById('cursor');
  const centerBtn = document.getElementById('centerBtn');

  if (!rule || !ruleStage || !slideWrap || !cursor) return;

  let slideOffsetPx = 0;
  let cursorPx = 0;
  let dragging = false;
  let dragTarget = null;
  let dragStartX = 0;
  let dragStartOffset = 0;

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function stageWidth() {
    return Math.max(1, ruleStage.getBoundingClientRect().width);
  }

  function cursorHalfWidth() {
    return Math.max(1, cursor.getBoundingClientRect().width / 2);
  }

  function slideBounds() {
    const w = stageWidth();
    return { min: -w * 1.1, max: w * 1.1 };
  }

  function cursorBounds() {
    const half = cursorHalfWidth();
    const w = stageWidth();
    return { min: half, max: Math.max(half, w - half) };
  }

  function render() {
    const sb = slideBounds();
    const cb = cursorBounds();
    slideOffsetPx = clamp(slideOffsetPx, sb.min, sb.max);
    cursorPx = clamp(cursorPx, cb.min, cb.max);
    slideWrap.style.transform = `translateX(${slideOffsetPx}px)`;
    cursor.style.left = `${cursorPx}px`;
    rule.dispatchEvent(new CustomEvent("rule-render", { detail: { slide: slideOffsetPx / stageWidth(), cursor: cursorPx / stageWidth() } }));
  }

  function resetPositions() {
    rule.dispatchEvent(new Event("rule-interrupt"));
    slideOffsetPx = 0;
    cursorPx = stageWidth() / 2;
    render();
  }

  function beginDrag(target, pointerId, clientX, captureEl) {
    rule.dispatchEvent(new Event("rule-interrupt"));
    dragging = true;
    dragTarget = target;
    dragStartX = clientX;
    dragStartOffset = target === 'slide' ? slideOffsetPx : cursorPx;
    ruleStage.classList.add('dragging');
    if (target === 'cursor') cursor.classList.add('dragging');
    try { captureEl.setPointerCapture(pointerId); } catch (error) { /* ignore */ }
  }

  function endDrag() {
    if (!dragging) return;
    dragging = false;
    dragTarget = null;
    ruleStage.classList.remove('dragging');
    cursor.classList.remove('dragging');
  }

  cursor.addEventListener('pointerdown', (event) => {
    beginDrag('cursor', event.pointerId, event.clientX, cursor);
    event.preventDefault();
    event.stopPropagation();
  });

  ruleStage.addEventListener('pointerdown', (event) => {
    beginDrag('slide', event.pointerId, event.clientX, ruleStage);
    event.preventDefault();
  });

  window.addEventListener('pointermove', (event) => {
    if (!dragging) return;
    const deltaX = event.clientX - dragStartX;
    if (dragTarget === 'slide') {
      slideOffsetPx = dragStartOffset + deltaX;
    } else if (dragTarget === 'cursor') {
      cursorPx = dragStartOffset + deltaX;
    }
    render();
  });

  window.addEventListener('pointerup', endDrag);
  window.addEventListener('pointercancel', endDrag);
  if (new URLSearchParams(location.search).get('teach') !== '1') window.addEventListener('resize', render);

  if (centerBtn) centerBtn.addEventListener('click', resetPositions);

  if (new URLSearchParams(location.search).get('teach') === '1') {
    rule.teaching = {
      get: () => ({ slide: slideOffsetPx / stageWidth(), cursor: cursorPx / stageWidth() }),
      set: (slide, hairline) => { slideOffsetPx = slide * stageWidth(); cursorPx = hairline * stageWidth(); render(); }
    };
    let previousWidth = stageWidth();
    window.addEventListener('resize', () => {
      const width = stageWidth();
      slideOffsetPx *= width / previousWidth;
      cursorPx *= width / previousWidth;
      previousWidth = width;
      render();
    });
  }
  resetPositions();
})();
