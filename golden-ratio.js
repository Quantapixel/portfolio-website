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
  let animationFrame = 0;
  let scrollRange = 1;
  let blurStart = Infinity;
  let blurRange = 1;
  let targetZoom = 1;
  let targetBlur = 0;
  let targetStrength = 1;
  let smoothZoom = 1;
  let smoothBlur = 0;
  let smoothStrength = 1;

  function applySpiral(zoom, blur, strength) {
    field.style.setProperty('--spiral-zoom', zoom.toFixed(6));
    field.style.setProperty('--spiral-blur', `${blur.toFixed(2)}px`);
    field.style.setProperty('--spiral-strength', strength.toFixed(3));
  }

  function stopAnimation() {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    }
  }

  function tick() {
    animationFrame = 0;
    const zoomStep = (targetZoom - smoothZoom) * 0.14;
    const blurStep = (targetBlur - smoothBlur) * 0.16;
    const strengthStep = (targetStrength - smoothStrength) * 0.16;
    smoothZoom += zoomStep;
    smoothBlur += blurStep;
    smoothStrength += strengthStep;

    const settled =
      Math.abs(zoomStep) < 0.0001 &&
      Math.abs(blurStep) < 0.0001 &&
      Math.abs(strengthStep) < 0.0001;

    if (settled) {
      smoothZoom = targetZoom;
      smoothBlur = targetBlur;
      smoothStrength = targetStrength;
    }

    applySpiral(smoothZoom, smoothBlur, smoothStrength);
    if (!settled) animationFrame = requestAnimationFrame(tick);
  }

  function paint() {
    frame = 0;
    const scrollY = window.scrollY;
    field.hidden = !home || home.hidden;
    if (field.hidden) {
      stopAnimation();
      return;
    }
    const progress = motion.matches ? 0 : Math.max(0, Math.min(1, scrollY / scrollRange));
    targetZoom = Math.pow(maxZoom, progress);
    const approach = Math.max(0, Math.min(1, (scrollY - blurStart) / blurRange));
    const softness = approach * approach * (3 - 2 * approach);
    targetBlur = softness * 3;
    targetStrength = 1 - softness * 0.3;

    if (motion.matches) {
      smoothZoom = targetZoom;
      smoothBlur = targetBlur;
      smoothStrength = targetStrength;
      applySpiral(smoothZoom, smoothBlur, smoothStrength);
      return;
    }

    if (!animationFrame) animationFrame = requestAnimationFrame(tick);
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
