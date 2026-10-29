// Scroll reveals ([data-reveal] fades up as it enters the view) and the
// gentle parallax on [data-parallax] images. Both are off for visitors who
// ask for reduced motion (BaseLayout only adds .js-motion when allowed).

export function initMotion() {
  if (!document.documentElement.classList.contains('js-motion')) return;

  const els = [...document.querySelectorAll('[data-reveal]')];
  // Anything already on screen when the page loads stays put.
  els.forEach((el) => {
    if (el.getBoundingClientRect().top > window.innerHeight * 0.92) el.classList.add('is-pending');
  });
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.remove('is-pending');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    els.forEach((el) => io.observe(el));
  } else {
    els.forEach((el) => el.classList.remove('is-pending'));
  }

  const layers = [...document.querySelectorAll('[data-parallax]')];
  if (!layers.length) return;
  let ticking = false;
  const update = () => {
    ticking = false;
    layers.forEach((el) => {
      const r = el.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      const shift = (r.top + r.height / 2 - window.innerHeight / 2) * -parseFloat(el.dataset.parallax);
      el.style.transform = `translate3d(0, ${shift}px, 0)`;
    });
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  update();
}
