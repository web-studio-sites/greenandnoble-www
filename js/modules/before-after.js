// Before & after sliders (BeforeAfter.astro): drag across the photo, or use
// the arrow keys on the hidden range input; tabs swap the project.

export function initBeforeAfter() {
  document.querySelectorAll('[data-before-after]').forEach((root) => {
    const stage = root.querySelector('[data-ba-stage]');
    const range = root.querySelector('[data-ba-range]');
    const before = root.querySelector('[data-ba-before]');
    const after = root.querySelector('[data-ba-after]');
    const label = root.querySelector('[data-ba-label]');
    const tabs = [...root.querySelectorAll('[data-ba-tab]')];

    const set = (pct) => {
      const p = Math.min(100, Math.max(0, pct));
      stage.style.setProperty('--ba-pos', `${p}%`);
      stage.style.setProperty('--ba-clip', `${100 - p}%`);
      range.value = String(Math.round(p));
    };
    const fromPointer = (e) => {
      const r = stage.getBoundingClientRect();
      set(((e.clientX - r.left) / r.width) * 100);
    };

    let dragging = false;
    stage.addEventListener('pointerdown', (e) => {
      dragging = true;
      stage.setPointerCapture?.(e.pointerId);
      fromPointer(e);
    });
    stage.addEventListener('pointermove', (e) => { if (dragging) fromPointer(e); });
    const stop = () => { dragging = false; };
    stage.addEventListener('pointerup', stop);
    stage.addEventListener('pointercancel', stop);
    range.addEventListener('input', () => set(Number(range.value)));

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        tabs.forEach((t) => t.setAttribute('aria-selected', String(t === tab)));
        const title = tab.dataset.title;
        after.src = tab.dataset.after;
        after.alt = `${title}, after`;
        before.src = tab.dataset.before;
        before.alt = `${title}, ${tab.dataset.label.toLowerCase()}`;
        label.textContent = tab.dataset.label;
        set(50);
      });
    });

    set(50);
  });
}
