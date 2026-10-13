const assert = require('node:assert/strict');
const test = require('node:test');
const { definitions, tickValues, renderScale, positionOf, valueAtPosition, readScaleAt } = require('./scales.js');

function expectedPosition(scale, value) {
  switch (scale.id) {
    case 'K': return Math.log10(value) / 3;
    case 'A': return Math.log10(value) / 2;
    case 'CI': return 1 - Math.log10(value);
    case 'C':
    case 'D': return Math.log10(value);
    case 'L': return value;
    case 'S': return 1 + Math.log10(Math.sin(value * Math.PI / 180));
    case 'T': return 1 + Math.log10(Math.tan(value * Math.PI / 180));
    case 'ST': return 2 + Math.log10(Math.tan(value * Math.PI / 180));
    default: throw new Error(`Missing independent formula for ${scale.id}`);
  }
}

for (const scale of definitions) {
  test(`${scale.id} tick positions follow its formula within 0.01%`, () => {
    const ticks = tickValues(scale);
    assert.ok(ticks.length > 0);
    const width = 10000;
    const renderedTicks = [...renderScale(scale, 20, width).matchAll(/<line x1="([^"]+)" y1="20" x2="[^"]+" y2="[^"]+" class="tick(?: major)?"/g)];
    assert.equal(renderedTicks.length, ticks.length);
    for (const value of ticks) {
      const expected = expectedPosition(scale, value);
      const actual = Number(renderedTicks[ticks.indexOf(value)][1]) / width;
      assert.ok(Math.abs(actual - expected) <= 0.0001, `${value} has an inaccurate rendered position`);
      assert.ok(Math.abs(positionOf(scale, value) - expected) <= 0.0001, `${value} has an inaccurate position`);
      assert.ok(Math.abs(valueAtPosition(scale, expected) - value) < 1e-8, `${value} does not invert`);
    }
  });
}

test('C 3 over D 2 reads 6 at the cursor', () => {
  const c = definitions.find((scale) => scale.id === 'C');
  const d = definitions.find((scale) => scale.id === 'D');
  const offset = positionOf(d, 2) - positionOf(c, 1);
  const cursor = positionOf(d, 6);
  assert.ok(Math.abs(readScaleAt('C', cursor, offset) - 3) < 1e-10);
  assert.ok(Math.abs(readScaleAt('D', cursor) - 6) < 1e-10);
});
