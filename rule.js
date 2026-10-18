(function () {
  const rule = document.getElementById('rule');
  const ruleStage = document.getElementById('ruleStage');
  const slideWrap = document.getElementById('slideWrap');
  const cursor = document.getElementById('cursor');
  const centerBtn = document.getElementById('centerBtn');

  if (!rule || !ruleStage || !slideWrap || !cursor) return;

  // Review switch: leave the public layout alone until the preview is approved.
  if (new URLSearchParams(location.search).get('slim') === '1') {
    const section = rule.closest('.rule-section');
    const panel = section.querySelector('.panel');
    const pin = document.createElement('button');
    pin.type = 'button';
    pin.className = 'action rule-pin';
    pin.textContent = 'Pin rule';
    pin.setAttribute('aria-label', 'Pin rule while reading');
    let pinned = true;
    try {
      pinned = localStorage.getItem('rule-pinned') !== 'false';
    } catch (error) { /* Storage may be unavailable; keep the default. */ }

    function updatePanel() {
      section.classList.toggle('rule-unpinned', !pinned);
      section.classList.toggle('rule-compact', pinned && window.scrollY > 64);
      pin.setAttribute('aria-pressed', String(pinned));
      pin.title = pinned ? 'Unpin rule' : 'Pin rule while reading';
    }
    pin.addEventListener('click', () => {
      pinned = !pinned;
      try {
        localStorage.setItem('rule-pinned', String(pinned));
      } catch (error) { /* The toggle still works without storage. */ }
      updatePanel();
    });
    panel.prepend(pin);
    section.classList.add('rule-slim-preview');
    window.addEventListener('scroll', updatePanel, { passive: true });
    updatePanel();

    // Keep both independent review switches when moving between lessons.
    document.querySelectorAll('a[href]').forEach(link => {
      const url = new URL(link.href, location.href);
      if (url.origin !== location.origin || !url.pathname.endsWith('.html')) return;
      url.searchParams.set('slim', '1');
      link.href = url.href;
    });
  }

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
  if (!['teach', 'window'].some(key => new URLSearchParams(location.search).get(key) === '1')) window.addEventListener('resize', render);

  if (centerBtn) centerBtn.addEventListener('click', resetPositions);

  if (['teach', 'window'].some(key => new URLSearchParams(location.search).get(key) === '1')) {
    rule.teaching = {
      get: () => ({ slide: slideOffsetPx / stageWidth(), cursor: cursorPx / stageWidth() }),
      set: (slide, hairline) => { slideOffsetPx = slide * stageWidth(); cursorPx = hairline * stageWidth(); render(); }
    };
    let previousWidth = stageWidth();
    const resize = () => {
      const width = stageWidth();
      slideOffsetPx *= width / previousWidth;
      cursorPx *= width / previousWidth;
      previousWidth = width;
      render();
    };
    window.addEventListener('resize', resize);
    rule.addEventListener('window-resize', resize);
  }
  resetPositions();
})();
