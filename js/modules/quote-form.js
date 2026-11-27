// Quotation form (QuoteSection.astro): "Enquire" links choose their service
// in the form, the photo picker shows how many are attached, and the form is
// sent to Splitforms (address and key in Site settings) without leaving the
// page. Photos are shrunk in the browser first: Splitforms takes up to 5
// files of 5 MB each, and phone photos are often bigger than that.

const MAX_PHOTOS = 5;
const MAX_SIDE = 2000;   // px, longest side
const QUALITY = 0.82;    // JPEG

// Returns a smaller JPEG of an image file, or the original if it can't be
// read (e.g. HEIC on some browsers) and is already small enough.
async function shrink(file) {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', QUALITY));
    if (!blob) throw new Error('toBlob');
    const name = file.name.replace(/\.[^.]+$/, '') + '.jpg';
    return new File([blob], name, { type: 'image/jpeg' });
  } catch {
    return file.size <= 5 * 1024 * 1024 ? file : null;
  }
}

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
      note.textContent = !n
        ? note.dataset.default
        : n > MAX_PHOTOS
          ? `${n} photos chosen: the first ${MAX_PHOTOS} will be sent`
          : `${n} photo${n > 1 ? 's' : ''} attached`;
    });
  }

  const status = form.querySelector('[data-form-status]');
  const submit = form.querySelector('[type="submit"]');
  submit.dataset.label = submit.textContent;
  const thanks = document.querySelector('[data-quote-thanks]');

  // Splitforms' spam check: how long the form was open before sending.
  const loadedAt = form.querySelector('[data-loaded-at]');
  if (loadedAt) loadedAt.value = String(Date.now());

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
      const data = new FormData(form);
      if (input && input.files.length) {
        submit.textContent = submit.dataset.sending || 'Sending…';
        data.delete('photos');
        const photos = await Promise.all([...input.files].slice(0, MAX_PHOTOS).map(shrink));
        photos.filter(Boolean).forEach((photo) => data.append('photos', photo));
      }
      const res = await fetch(endpoint, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      });
      const reply = await res.json().catch(() => ({}));
      if (!res.ok || reply.success === false) throw new Error(reply.message || String(res.status));
      form.hidden = true;
      thanks.hidden = false;
      thanks.focus();
    } catch {
      status.textContent = `Sorry, something went wrong sending your enquiry. ${form.dataset.fallback.replace(/^.*?Please/, 'Please')}`;
    } finally {
      submit.disabled = false;
      submit.textContent = submit.dataset.label;
    }
  });
}
