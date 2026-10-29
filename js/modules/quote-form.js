// Quotation form (QuoteSection.astro): "Enquire" links choose their service
// in the form, the photo picker shows how many are attached, and the form is
// sent to the address in Site settings without leaving the page.

export function initQuoteForm() {
  const form = document.querySelector('[data-quote-form]');
  if (!form) return;

  const select = form.querySelector('[data-service-select]');
  const choose = (slug) => {
    const option = select && [...select.options].find((o) => o.dataset.slug === slug);
    if (option) select.value = option.value;
  };

  // From another page: /contact/?service=hedge-tree-services
  const fromUrl = new URLSearchParams(window.location.search).get('service');
  if (fromUrl) choose(fromUrl);

  // On this page: "Enquire" links scroll to the form with their service chosen.
  document.querySelectorAll('[data-enquire]').forEach((link) => {
    link.addEventListener('click', () => choose(link.dataset.enquire));
  });

  const input = form.querySelector('[data-upload-input]');
  const note = form.querySelector('[data-upload-note]');
  if (input && note) {
    input.addEventListener('change', () => {
      const n = input.files.length;
      note.textContent = n ? `${n} photo${n > 1 ? 's' : ''} attached` : note.dataset.default;
    });
  }

  const status = form.querySelector('[data-form-status]');
  const submit = form.querySelector('[type="submit"]');
  const thanks = document.querySelector('[data-quote-thanks]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.textContent = '';
    const endpoint = form.getAttribute('action');
    if (!endpoint) {
      status.textContent = form.dataset.fallback;
      return;
    }
    submit.disabled = true;
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) throw new Error(String(res.status));
      form.hidden = true;
      thanks.hidden = false;
      thanks.focus();
    } catch {
      status.textContent = `Sorry, something went wrong sending your enquiry. ${form.dataset.fallback.replace(/^.*?Please/, 'Please')}`;
    } finally {
      submit.disabled = false;
    }
  });
}
