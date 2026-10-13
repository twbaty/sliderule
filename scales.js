(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.PickettScales = api;
})(typeof globalThis === 'object' ? globalThis : this, function () {
  const logBands = [
    { from: 1, to: 2, step: 0.1 },
    { from: 2, to: 5, step: 0.1 },
    { from: 5, to: 10, step: 0.2 }
  ];
  const radians = (degrees) => degrees * Math.PI / 180;
  const definitions = [
    {
      id: 'K', name: 'K', section: 'top', formula: 'log10(v) / 3',
      min: 1, max: 1000, from: (v) => Math.log10(v) / 3,
      to: (x) => 10 ** (3 * x), subdivisions: logBands, decades: 3, color: 'ink',
      labels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000]
    },
    {
      id: 'A', name: 'A', section: 'top', formula: 'log10(v) / 2',
      min: 1, max: 100, from: (v) => Math.log10(v) / 2,
      to: (x) => 10 ** (2 * x), subdivisions: logBands, decades: 2, color: 'ink',
      labels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
    },
    {
      id: 'CI', name: 'CI', section: 'slide', formula: '1 - log10(v)',
      min: 1, max: 10, from: (v) => 1 - Math.log10(v),
      to: (x) => 10 ** (1 - x), subdivisions: logBands, decades: 1, color: 'red',
      labels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    },
    {
      id: 'C', name: 'C', section: 'slide', formula: 'log10(v)',
      min: 1, max: 10, from: (v) => Math.log10(v),
      to: (x) => 10 ** x, subdivisions: logBands, decades: 1, color: 'ink',
      labels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], gauges: [Math.PI]
    },
    {
      id: 'D', name: 'D', section: 'bottom', formula: 'log10(v)',
      min: 1, max: 10, from: (v) => Math.log10(v),
      to: (x) => 10 ** x, subdivisions: logBands, decades: 1, color: 'ink',
      labels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], gauges: [Math.PI]
    },
    {
      id: 'L', name: 'L', section: 'bottom', formula: 'v',
      min: 0, max: 1, from: (v) => v, to: (x) => x,
      subdivisions: [{ from: 0, to: 1, step: 0.01 }], color: 'ink',
      labels: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]
    },
    {
      id: 'S', name: 'S', section: 'bottom', formula: '1 + log10(sin(theta))',
      min: 5.7391704773, max: 90,
      from: (theta) => 1 + Math.log10(Math.sin(radians(theta))),
      to: (x) => Math.asin(10 ** (x - 1)) * 180 / Math.PI,
      subdivisions: [{ from: 6, to: 90, step: 1 }], color: 'red',
      labels: [6, 7, 8, 9, 10, 12, 15, 20, 25, 30, 40, 50, 60, 70, 80, 90]
    },
    {
      id: 'T', name: 'T', section: 'slide', formula: '1 + log10(tan(theta))',
      min: 5.7105931375, max: 45,
      from: (theta) => 1 + Math.log10(Math.tan(radians(theta))),
      to: (x) => Math.atan(10 ** (x - 1)) * 180 / Math.PI,
      subdivisions: [{ from: 6, to: 45, step: 1 }], color: 'red',
      labels: [6, 7, 8, 9, 10, 12, 15, 20, 25, 30, 35, 40, 45]
    },
    {
      id: 'ST', name: 'ST', section: 'bottom', formula: '2 + log10(tan(theta))',
      min: 0.5729386977, max: 5.7105931375,
      from: (theta) => 2 + Math.log10(Math.tan(radians(theta))),
      to: (x) => Math.atan(10 ** (x - 2)) * 180 / Math.PI,
      subdivisions: [{ from: 0.6, to: 5.7, step: 0.1 }], color: 'red',
      labels: [0.6, 0.7, 0.8, 0.9, 1, 1.2, 1.5, 2, 2.5, 3, 4, 5]
    }
  ];

  function tickValues(scale) {
    const ticks = [];
    if (scale.decades) {
      for (let decade = 0; decade < scale.decades; decade += 1) {
        for (const band of scale.subdivisions) {
          const factor = 10 ** decade;
          const start = Math.ceil((band.from - 1e-9) / band.step);
          const end = Math.floor((band.to + 1e-9) / band.step);
          for (let i = start; i <= end; i += 1) {
            const value = i * band.step * factor;
            if (value >= scale.min && value <= scale.max) ticks.push(value);
          }
        }
      }
      ticks.push(scale.max);
    } else {
      for (const band of scale.subdivisions) {
        const start = Math.ceil((band.from - 1e-9) / band.step);
        const end = Math.floor((band.to + 1e-9) / band.step);
        for (let i = start; i <= end; i += 1) {
          const value = i * band.step;
          if (value >= scale.min && value <= scale.max) ticks.push(value);
        }
      }
    }
    return [...new Set(ticks)].sort((a, b) => a - b);
  }

  function isLabeled(scale, value) {
    return scale.labels.some((label) => Math.abs(label - value) < 1e-8);
  }

  function formatNumber(value) {
    return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(1)));
  }

  function renderScale(scale, y, width = 1000) {
    const x = (value) => scale.from(value) * width;
    const color = scale.color === 'red' ? '#bd332b' : '#203040';
    const ticks = tickValues(scale).map((value) => {
      const labeled = isLabeled(scale, value);
      const half = Math.abs(value * 2 - Math.round(value * 2)) < 1e-8;
      const length = labeled ? 19 : half ? 12 : 7;
      const label = labeled
        ? `<text x="${x(value)}" y="${y - 23}" text-anchor="middle">${formatNumber(value)}</text>`
        : '';
      return `<line x1="${x(value)}" y1="${y}" x2="${x(value)}" y2="${y + length}" class="tick${labeled ? ' major' : ''}"/>${label}`;
    }).join('');
    const gauges = (scale.gauges || []).map((value) =>
      `<path d="M ${x(value) - 4} ${y + 26} L ${x(value)} ${y + 20} L ${x(value) + 4} ${y + 26}" class="gauge"/><text x="${x(value)}" y="${y + 40}" text-anchor="middle" class="gauge-label">π</text>`
    ).join('');
    return `<g class="scale scale-${scale.color}" data-scale="${scale.id}" style="--scale-color:${color}"><text x="-15" y="${y + 5}" text-anchor="end" class="scale-name">${scale.name}</text><line x1="0" y1="${y}" x2="${width}" y2="${y}" class="baseline"/>${ticks}${gauges}</g>`;
  }

  function valueAtPosition(scale, position) {
    return scale.to(position);
  }

  function positionOf(scale, value) {
    if (value < scale.min || value > scale.max) throw new RangeError(`${scale.id} value outside its range`);
    return scale.from(value);
  }

  function readScaleAt(scaleId, screenPosition, offset = 0) {
    const scale = definitions.find((item) => item.id === scaleId);
    if (!scale) throw new RangeError(`Unknown scale: ${scaleId}`);
    const position = screenPosition - offset;
    if (position < 0 || position > 1) return null;
    return valueAtPosition(scale, position);
  }

  return { definitions, tickValues, renderScale, valueAtPosition, positionOf, readScaleAt };
});
