// Our Work gallery (ProjectGallery.astro): category filters (also set from
// ?category=… in the address, e.g. from a service page) and a pop-up per
// project.

export function initGallery() {
  const gallery = document.querySelector('[data-gallery]');
  if (!gallery) return;

  const chips = [...gallery.querySelectorAll('[data-filter]')];
  const cards = [...gallery.querySelectorAll('[data-category]')];

  const show = (filter) => {
    if (!chips.some((c) => c.dataset.filter === filter)) filter = 'all';
    chips.forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.filter === filter)));
    cards.forEach((card) => { card.hidden = filter !== 'all' && card.dataset.category !== filter; });
  };

  chips.forEach((chip) => chip.addEventListener('click', () => {
    show(chip.dataset.filter);
    // Keep the address in step so the filtered view can be shared.
    try {
      const url = new URL(window.location.href);
      if (chip.dataset.filter === 'all') url.searchParams.delete('category');
      else url.searchParams.set('category', chip.dataset.filter);
      history.replaceState(null, '', url);
    } catch { /* CMS preview: no address to update */ }
  }));
  show(new URLSearchParams(window.location.search).get('category') || 'all');

  gallery.querySelectorAll('[data-project-open]').forEach((btn) => {
    const dialog = document.getElementById(btn.dataset.projectOpen);
    if (!dialog) return;
    btn.addEventListener('click', () => dialog.showModal());
    dialog.querySelector('[data-project-close]').addEventListener('click', () => dialog.close());
    // Clicking the dark area around the pop-up closes it.
    dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
  });
}
