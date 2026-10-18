/* Camera coordinates are CSS pixels; rule coordinates are native artwork pixels. */
(function(root) {
  const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
  const offset = (x, width, zoom) => clamp(x, 0, Math.max(0, 1868 * zoom - width));
  const world = (screen, left, zoom) => (screen + left) / zoom;
  const anchor = (left, screen, oldZoom, zoom, width) => offset(world(screen, left, oldZoom) * zoom - screen, width, zoom);
  const follow = (cursor, width, zoom) => offset(cursor * 1868 * zoom - width / 2, width, zoom);
  const overview = (left, width, zoom) => ({start: left / (1868 * zoom), size: Math.min(1, width / (1868 * zoom))});
  const api = {clamp, offset, world, anchor, follow, overview};
  if (typeof module !== 'undefined') module.exports = api; else root.WindowMath = api;
})(typeof window === 'undefined' ? globalThis : window);
