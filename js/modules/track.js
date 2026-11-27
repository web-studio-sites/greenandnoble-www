// Enquiry tracking for Google Analytics: phone, WhatsApp and email clicks,
// and successful quotation form sends (form_enquiry, sent from
// quote-form.js). Events only record when Analytics is loaded, which is
// only after the visitor accepts cookies (consent.js), so nothing is
// tracked for visitors who reject. In Analytics these four events are
// marked as key events.

export function track(name, params = {}) {
  if (typeof window.gtag === 'function') window.gtag('event', name, params);
}

// Where on the page the link was: header, footer, or the section it sits in.
function areaOf(el) {
  if (el.closest('.mobile-menu')) return 'mobile menu';
  if (el.closest('.mobile-bar')) return 'mobile bar';
  if (el.closest('header')) return 'header';
  if (el.closest('footer')) return 'footer';
  if (el.closest('.quote')) return 'quote section';
  if (el.closest('.hero')) return 'hero';
  const section = el.closest('section');
  return (section && section.id) || 'page';
}

export function initTracking() {
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href]');
    if (!link) return;
    const href = link.getAttribute('href');
    let name = '';
    if (href.startsWith('tel:')) name = 'call_click';
    else if (/^https?:\/\/(wa\.me|api\.whatsapp\.com)\//.test(href)) name = 'whatsapp_click';
    else if (href.startsWith('mailto:')) name = 'email_click';
    if (name) track(name, { link_area: areaOf(link) });
  });
}
