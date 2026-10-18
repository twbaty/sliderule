/* Normalized scale distances. Photo indices: x=171 and x=1657 in 1828px artwork.
   Values describe the printed decade; decimal placement remains the user's job. */
(function (root) {
  const moving = new Set(['B', 'T', 'S', 'CI', 'C']);
  const scales = ['K', 'A', 'B', 'T', 'S', 'CI', 'C', 'D', 'L'];
  function position(scale, value) {
    if (scale === 'L') return value;
    if (scale === 'CI') return 1 - Math.log10(value);
    if (scale === 'S') return Math.log10(10 * Math.sin(value * Math.PI / 180));
    if (scale === 'T') return Math.log10(10 * Math.tan(value * Math.PI / 180));
    return Math.log10(value) / (scale === 'K' ? 3 : ['A', 'B'].includes(scale) ? 2 : 1);
  }
  function value(scale, p) {
    if (p < -1e-10 || p > 1 + 1e-10) return null;
    p = Math.max(0, Math.min(1, p));
    if (scale === 'L') return p;
    if (scale === 'CI') return 10 ** (1 - p);
    if (scale === 'S') return Math.asin(10 ** (p - 1)) * 180 / Math.PI;
    if (scale === 'T') return Math.atan(10 ** (p - 1)) * 180 / Math.PI;
    return 10 ** (p * (scale === 'K' ? 3 : ['A', 'B'].includes(scale) ? 2 : 1));
  }
  const api = { scales, moving, position, value, start: 171 / 1828, span: 1486 / 1828 };
  if (typeof module !== 'undefined') module.exports = api;
  else root.TeachingMath = api;
})(typeof window === 'undefined' ? globalThis : window);
