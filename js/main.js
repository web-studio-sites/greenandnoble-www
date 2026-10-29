import { initConsent } from './modules/consent.js';
import { initHeader } from './modules/header.js';
import { initMotion } from './modules/motion.js';
import { initBeforeAfter } from './modules/before-after.js';
import { initQuoteForm } from './modules/quote-form.js';
import { initGallery } from './modules/gallery.js';

// Header/footer are composed at build time by Astro, so these can safely
// query the DOM straight away.
initConsent();
initHeader();
initMotion();
initBeforeAfter();
initQuoteForm();
initGallery();
