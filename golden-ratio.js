(() => {
  const art = document.querySelector('.golden-bg-art');
  if (!art) return;

  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const field = art.parentElement;
  const header = document.querySelector('.site-header');
  const home = document.getElementById('home');
  const about = document.getElementById('about');
  const maxZoom = Math.pow((1 + Math.sqrt(5)) / 2, 3);
  let frame = 0;
  let scrollRange = 1;
  let blurStart = Infinity;
  let blurRange = 1;

  function applySpiral(zoom, blur, strength) {
    field.style.setProperty('--spiral-zoom', zoom.toFixed(6));
    field.style.setProperty('--spiral-blur', `${blur.toFixed(2)}px`);
    field.style.setProperty('--spiral-strength', strength.toFixed(3));
  }

  function paint() {
    frame = 0;
    const scrollY = window.scrollY;
    field.hidden = !home || home.hidden;
    if (field.hidden) return;
    const progress = motion.matches ? 0 : Math.max(0, Math.min(1, scrollY / scrollRange));
    const zoom = Math.pow(maxZoom, progress);
    const approach = Math.max(0, Math.min(1, (scrollY - blurStart) / blurRange));
    const softness = approach * approach * (3 - 2 * approach);
    const blur = softness * 3;
    const strength = 1 - softness * 0.3;
    applySpiral(zoom, blur, strength);
  }

  function schedule() {
    if (!frame) frame = requestAnimationFrame(paint);
  }

  function measure() {
    scrollRange = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const viewportHeight = window.innerHeight;
    const headerHeight = header?.offsetHeight || 0;
    field.style.setProperty('--spiral-header-height', `${headerHeight}px`);
    const aboutTop = about && !about.hidden
      ? about.getBoundingClientRect().top + window.scrollY
      : Infinity;
    blurStart = aboutTop - viewportHeight * 0.9;
    blurRange = Math.max(1, window.innerHeight * 0.9 - headerHeight);
    schedule();
  }

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', measure);
  window.addEventListener('pageshow', measure);
  motion.addEventListener('change', schedule);
  // Routes, fonts, and responsive content can all change the scroll distance.
  const resizeObserver = new ResizeObserver(measure);
  resizeObserver.observe(document.body);
  if (header) resizeObserver.observe(header);
  document.addEventListener('portfolio:route', measure);
  measure();
})();
