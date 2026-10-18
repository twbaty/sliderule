/* Opt-in lesson preview: ?teach=1. No storage; readouts always start off. */
(() => {
  if (new URLSearchParams(location.search).get('teach') !== '1') return;
  const rule = document.getElementById('rule');
  if (!rule?.teaching) return;
  const m = window.TeachingMath;
  const topic = location.pathname.split('/').pop().replace('.html', '');
  const p = (v) => m.position('D', v);
  // Each step specifies slide displacement and hairline in scale-length units.
  const demos = {
    cd: [
      ['Multiply: 2 × 3 = 6', [[0, 0, 'Start with the C and D indices aligned.'], [p(2), p(2), 'Slide C’s 1 over 2 on D.'], [p(2), p(6), 'Move the cursor to 3 on C. Read 6 on D.']]],
      ['Divide: 6 ÷ 3 = 2', [[0, p(6), 'Put the cursor on 6 on D.'], [p(2), p(6), 'Slide 3 on C under the cursor.'], [p(2), p(2), 'Move to C’s 1. Read 2 on D.']]],
      ['Add: 2.3 + 4.5 = 6.8', [[p(2.3), p(4.5), 'Set C’s 1 over 2.3 on D. At D’s 4.5, C reads 4.5 ÷ 2.3 ≈ 1.957.'], [p(2.3), p(6.8), 'Add 1 mentally to the ratio. Move to that value on C; D reads 6.8.']]]
    ],
    ab: [['Square: 3² = 9 on A and B', [[0, 0, 'Align the indices. A and B have two decades.'], [0, p(3), 'At 3 on D, read 9 on A. At 3 on C, read 9 on B.']]]],
    k: [['Cube: 2³ = 8', [[0, 0, 'Align the indices. K has three decades.'], [0, p(2), 'Move to 2 on D. Read 8 on K; reverse this to find the cube root.']]]],
    'ci-di': [['Reciprocal: 1 ÷ 4 = 0.25', [[0, 0, 'Align C and D. CI runs in the opposite direction.'], [0, p(4), 'Move to 4 on C. CI reads 2.5: choose the decimal to get 0.25. This face has CI, but no DI.']]]],
    l: [['Logarithm: log₁₀(2) ≈ 0.30103', [[0, 0, 'L is fixed below D. At D’s 1, L reads 0.'], [0, p(2), 'Move to 2 on D. Read approximately 0.30103 on L.']]]],
    's-t': [
      ['Sine: sin(30°) = 0.5', [[0, 0, 'Align C and D before reading S. Use the increasing angle labels.'], [0, m.position('S', 30), 'Move to 30° on S. C reads 5; divide by 10 to get sin(30°) = 0.5.']]],
      ['Tangent: tan(45°) = 1', [[0, 0, 'Align C and D before reading T. Use the increasing angle labels.'], [0, m.position('T', 45), 'Move to 45° at T’s right index. C reads 10; divide by 10 to get 1.']]]
    ]
  };
  document.querySelectorAll('.nav a, .next a, .hub-link').forEach(a => {
    if (!a.getAttribute('href').startsWith('index')) a.search = new URLSearchParams(location.search).get('window') === '1' ? '?teach=1&window=1' : '?teach=1';
  });
  if (topic === 'ab') {
    const cards = document.querySelectorAll('.grid .card');
    cards[0].querySelector('p').textContent = 'A and B span 1 to 100. Read D against A, or C against B, to square a number. A and B read the same when aligned; they do not square each other.';
    const steps = cards[1].querySelectorAll('.step');
    steps[0].textContent = '1. Align the indices and put the cursor on 3 on D (or C).';
    steps[1].textContent = '2. Read 9 on A (or B) at the same hairline.';
    steps[2].textContent = '3. Reverse the reading for square roots: 9 on A gives 3 on D.';
    cards[1].querySelector('p').textContent = 'Try 2² = 4, then √9 = 3. Keep track of the decade and decimal place.';
  }
  const controls = document.createElement('div');
  controls.className = 'teaching-controls';
  controls.innerHTML = '<label><input type="checkbox" id="liveReadout"> Live readout</label> <button type="button" class="action" id="stopDemo" disabled>Stop</button><p id="demoCaption" role="status">Teaching preview. Choose a Show me example below.</p><div id="scaleReadout" hidden></div>';
  rule.after(controls);
  const checkbox = controls.querySelector('input');
  const output = controls.querySelector('#scaleReadout');
  const caption = controls.querySelector('#demoCaption');
  const stop = controls.querySelector('button');
  function readout() {
    if (!checkbox.checked) return;
    const state = rule.teaching.get();
    const span = rule.querySelector('.rule-top').getBoundingClientRect().width / document.getElementById('ruleStage').getBoundingClientRect().width * m.span;
    const start = span * m.start / m.span;
    output.textContent = m.scales.map(scale => {
      const value = m.value(scale, (state.cursor - start - (m.moving.has(scale) ? state.slide : 0)) / span);
      return `${scale}: ${value === null ? '—' : Number(value.toPrecision(5)) + (['S', 'T'].includes(scale) ? '°' : '')}`;
    }).join(' · ');
  }
  checkbox.addEventListener('change', () => { output.hidden = !checkbox.checked; readout(); });
  rule.addEventListener('rule-render', readout);
  let run = 0;
  function cancel() { run++; stop.disabled = true; }
  stop.addEventListener('click', () => { cancel(); caption.textContent = 'Stopped. Drag the rule or replay an example.'; });
  rule.addEventListener('rule-interrupt', () => { if (!stop.disabled) { cancel(); caption.textContent = 'Walkthrough stopped. You have control of the rule.'; } });
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
  async function play(title, steps) {
    cancel();
    const id = run;
    stop.disabled = false;
    document.querySelector('.rule-section').scrollIntoView({ behavior: 'instant', block: 'start' });
    for (let i = 0; i < steps.length; i++) {
      if (id !== run) return;
      const [slide, hairline, text] = steps[i];
      caption.textContent = `${title} · Step ${i + 1}/${steps.length}: ${text}`;
      const width = document.getElementById('ruleStage').getBoundingClientRect().width;
      const ratio = rule.querySelector('.rule-top').getBoundingClientRect().width / width;
      const target = { slide: slide * m.span * ratio, cursor: (m.start + hairline * m.span) * ratio };
      const from = rule.teaching.get();
      const duration = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 800;
      await new Promise(resolve => {
        const began = performance.now();
        function frame(now) {
          if (id !== run) return resolve();
          const t = duration ? Math.min(1, (now - began) / duration) : 1;
          const eased = t * t * (3 - 2 * t);
          rule.teaching.set(from.slide + (target.slide - from.slide) * eased, from.cursor + (target.cursor - from.cursor) * eased);
          if (t < 1) requestAnimationFrame(frame); else resolve();
        }
        requestAnimationFrame(frame);
      });
      if (i < steps.length - 1 && id === run) await delay(2000);
    }
    if (id === run) stop.disabled = true;
  }
  const section = document.createElement('section');
  section.className = 'examples teaching-examples';
  section.innerHTML = '<h2>Try a guided example</h2><p>The rule moves one step at a time. Stop or drag at any time. Readouts show printed scale values, with approximate digits; choose decimal places yourself. S and T show angles in degrees.</p>';
  for (const [index, [title, steps]] of (demos[topic] || []).entries()) {
    const item = document.createElement('div'); item.className = 'example';
    const heading = document.createElement('h3'); heading.textContent = title;
    const button = document.createElement('button'); button.type = 'button'; button.className = 'button'; button.textContent = 'Show me'; button.setAttribute('aria-label', `Show me: ${title}`);
    button.addEventListener('click', () => play(title, steps));
    if (topic === 'cd') {
      document.querySelectorAll('.examples .example')[index].querySelector('h3').after(button);
    } else { item.append(heading, button); section.append(item); }
  }
  if (topic !== 'cd') document.querySelector('.grid').before(section);
})();
