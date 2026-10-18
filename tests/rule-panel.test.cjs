const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');

function fixture(search = '?slim=1', stored = null, blocked = false) {
  function element() {
    const classes = new Set();
    return {
      style: {}, attributes: {}, listeners: {},
      classList: { add: c => classes.add(c), remove: c => classes.delete(c),
        contains: c => classes.has(c), toggle(c, on) { on ? classes.add(c) : classes.delete(c); } },
      addEventListener(type, fn) { this.listeners[type] = fn; },
      dispatchEvent() {}, setAttribute(k, v) { this.attributes[k] = v; },
      getBoundingClientRect: () => ({ width: 1000 }),
    };
  }
  const panel = element(), section = element();
  section.querySelector = () => panel;
  panel.prepend = pin => { panel.pin = pin; };
  const ids = Object.fromEntries(['rule', 'ruleStage', 'slideWrap', 'cursor', 'centerBtn'].map(id => [id, element()]));
  ids.rule.closest = () => section;
  const link = { href: 'https://example.test/ab.html?teach=1' };
  const window = { scrollY: 0, listeners: {}, addEventListener(type, fn) { this.listeners[type] = fn; } };
  let value = stored;
  vm.runInNewContext(fs.readFileSync('rule.js', 'utf8'), {
    document: { getElementById: id => ids[id], createElement: element, querySelectorAll: () => [link] },
    window, location: { search, href: `https://example.test/cd.html${search}`, origin: 'https://example.test' },
    localStorage: { getItem() { if (blocked) throw Error('blocked'); return value; },
      setItem(k, v) { if (blocked) throw Error('blocked'); value = v; } },
    URL, URLSearchParams, Event: class {}, CustomEvent: class {},
  });
  return { section, panel, ids, window, link, stored: () => value };
}

test('preview stays opt-in', () => {
  const f = fixture('');
  assert.equal(f.panel.pin, undefined);
  assert.equal(f.section.classList.contains('rule-slim-preview'), false);
});
test('scroll compacts, returning to top restores, pin persists both choices', () => {
  const f = fixture();
  assert.equal(f.panel.pin.attributes['aria-pressed'], 'true');
  const geometry = JSON.stringify(f.ids.ruleStage.style);
  f.window.scrollY = 300; f.window.listeners.scroll();
  assert.equal(f.section.classList.contains('rule-compact'), true);
  assert.equal(JSON.stringify(f.ids.ruleStage.style), geometry);
  f.window.scrollY = 0; f.window.listeners.scroll();
  assert.equal(f.section.classList.contains('rule-compact'), false);
  f.panel.pin.listeners.click();
  assert.equal(f.stored(), 'false');
  assert.equal(f.section.classList.contains('rule-unpinned'), true);
  assert.equal(f.panel.pin.attributes['aria-pressed'], 'false');
  assert.equal(fixture('?slim=1', f.stored()).section.classList.contains('rule-unpinned'), true);
  f.panel.pin.listeners.click();
  assert.equal(f.stored(), 'true');
});
test('blocked storage still permits toggling and scrolling', () => {
  const f = fixture('?slim=1', null, true);
  f.panel.pin.listeners.click();
  f.window.scrollY = 500; f.window.listeners.scroll();
  assert.equal(f.section.classList.contains('rule-compact'), false);
  f.panel.pin.listeners.click();
  assert.equal(f.section.classList.contains('rule-compact'), true);
});
test('lesson links preserve the teaching preview alongside slim preview', () => {
  const url = new URL(fixture().link.href);
  assert.equal(url.searchParams.get('slim'), '1');
  assert.equal(url.searchParams.get('teach'), '1');
});
