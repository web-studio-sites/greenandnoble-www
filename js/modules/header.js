// Header: solid background once the page scrolls, the current page marked
// in the nav, the Services mega menu (desktop) and the full-screen mobile
// menu with its Services list (below 1180px).

export function initHeader() {
  const header = document.querySelector('[data-site-header]');
  if (!header) return;

  const onScroll = () => {
    header.classList.toggle('is-scrolled', (window.scrollY || 0) > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mark whichever nav item matches the page we're on. document.baseURI
  // rather than location.origin: in the CMS live preview the page is shown
  // via srcdoc, where location.origin is "null" and would throw here.
  const path = window.location.pathname;
  const current = (href) => {
    const url = new URL(href, document.baseURI);
    return !url.hash && url.pathname !== '/' && path.startsWith(url.pathname);
  };
  header.querySelectorAll('[data-nav-link]').forEach((link) => {
    if (current(link.getAttribute('href'))) link.setAttribute('aria-current', 'page');
  });
  // Menu items match their own page only (/services/ isn't "current" on a service).
  header.querySelectorAll('.mega__item').forEach((link) => {
    if (new URL(link.getAttribute('href'), document.baseURI).pathname === path) link.setAttribute('aria-current', 'page');
  });

  initMega(header, current);
  initMobileMenu(header);
}

function initMega(header, current) {
  const item = header.querySelector('[data-mega]');
  if (!item) return;
  const trigger = item.querySelector('[data-mega-trigger]');
  const panel = item.querySelector('[data-mega-panel]');
  if (current(trigger.dataset.navSection) || header.querySelector('.mega__item[aria-current]')) {
    trigger.classList.add('is-current');
  }

  let closeTimer;
  let openedAt = 0;
  const open = () => {
    clearTimeout(closeTimer);
    if (panel.hidden) openedAt = Date.now();
    panel.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    header.classList.add('is-mega-open');
  };
  const close = () => {
    panel.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    header.classList.remove('is-mega-open');
  };
  // A short delay so the menu doesn't vanish while the pointer crosses the gap.
  const closeSoon = () => { closeTimer = setTimeout(close, 180); };

  trigger.addEventListener('click', () => {
    // A click straight after hovering open shouldn't shut it again.
    if (!panel.hidden && Date.now() - openedAt < 500) return;
    panel.hidden ? open() : close();
  });
  item.addEventListener('mouseenter', open);
  item.addEventListener('mouseleave', closeSoon);
  panel.addEventListener('mouseenter', () => clearTimeout(closeTimer));
  item.addEventListener('focusout', (e) => {
    if (!item.contains(e.relatedTarget)) close();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !panel.hidden) { close(); trigger.focus(); }
  });
  document.addEventListener('click', (e) => {
    if (!panel.hidden && !item.contains(e.target)) close();
  });
}

function initMobileMenu(header) {
  const menu = document.querySelector('[data-mobile-menu]');
  const openBtn = header.querySelector('[data-menu-open]');
  if (!menu || !openBtn) return;
  const closeBtn = menu.querySelector('[data-menu-close]');

  const open = () => {
    menu.hidden = false;
    openBtn.setAttribute('aria-expanded', 'true');
    document.body.classList.add('nav-open');
    closeBtn.focus();
  };
  const close = () => {
    menu.hidden = true;
    openBtn.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('nav-open');
  };

  openBtn.addEventListener('click', open);
  closeBtn.addEventListener('click', () => { close(); openBtn.focus(); });
  // Following any link closes the menu (anchors on the same page included).
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', close));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !menu.hidden) { close(); openBtn.focus(); }
  });
  window.matchMedia('(min-width: 1180px)').addEventListener('change', (e) => {
    if (e.matches) close();
  });

  // Services list inside the menu opens and closes in place.
  menu.querySelectorAll('[data-submenu-toggle]').forEach((btn) => {
    const sub = document.getElementById(btn.getAttribute('aria-controls'));
    btn.addEventListener('click', () => {
      const show = sub.hidden;
      sub.hidden = !show;
      btn.setAttribute('aria-expanded', String(show));
    });
  });
}
