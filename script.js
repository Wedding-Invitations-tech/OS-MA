(() => {
  'use strict';

  const body = document.body;
  const envelope = document.getElementById('envelope');
  const openButton = document.getElementById('openInvitation');
  const envelopeCard = document.getElementById('envelopeCard');
  const stages = [...document.querySelectorAll('.stage')];
  const OPEN_SEQUENCE_MS = 6300; // Original envelope timing preserved.
  const AUTO_OPEN_DELAY_MS = 3000;
  let autoOpenTimer = null;

  stages[0]?.classList.add('is-active');

  function openInvitation() {
    if (!envelope || envelope.classList.contains('is-opening')) return;
    window.clearTimeout(autoOpenTimer);
    envelope.classList.add('is-opening');
    body.classList.add('has-opened');

    if (navigator.vibrate) navigator.vibrate(14);

    window.setTimeout(() => {
      body.classList.remove('is-locked');
      envelope.classList.add('is-open');
      envelope.setAttribute('aria-hidden', 'true');
      openButton?.setAttribute('tabindex', '-1');
      openButton?.blur();
    }, OPEN_SEQUENCE_MS);
  }

  // Keep the original seal-to-open interaction. A tap also cancels auto-open.
  openButton?.addEventListener('click', openInvitation);

  envelope?.addEventListener('pointerup', (event) => {
    if (event.target === openButton || envelope.classList.contains('is-opening') || !envelopeCard) return;
    const card = envelopeCard.getBoundingClientRect();
    const cx = card.left + card.width / 2;
    const cy = card.top + card.height * 0.532;
    const radius = Math.max(54, card.width * 0.145);
    if (Math.hypot(event.clientX - cx, event.clientY - cy) <= radius) openInvitation();
  });

  // Start 3 seconds AFTER the complete page load (not merely DOM ready).
  // If the visitor opens manually during those seconds, this timer is cancelled.
  function scheduleAutoOpen() {
    const immediatePreview = new URLSearchParams(window.location.search).get('preview') === 'open';
    autoOpenTimer = window.setTimeout(openInvitation, immediatePreview ? 120 : AUTO_OPEN_DELAY_MS);
  }
  if (document.readyState === 'complete') scheduleAutoOpen();
  else window.addEventListener('load', scheduleAutoOpen, { once: true });

  if ('IntersectionObserver' in window) {
    const stageObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting && entry.intersectionRatio > 0.18) {
          entry.target.classList.add('is-active');
        }
      }
    }, { threshold: [0.08, 0.18, 0.42] });
    stages.forEach(stage => stageObserver.observe(stage));
  } else stages.forEach(stage => stage.classList.add('is-active'));

  // Bind a VERIFIED Maps destination when supplied in config.js.
  // The button is deliberately inactive until the URL is set.
  const config = window.INVITATION_CONFIG || {};
  const venueText = document.getElementById('venueName');
  const mapsLink = document.getElementById('mapsLink');
  if (venueText && typeof config.venueName === 'string' && config.venueName.trim()) {
    venueText.textContent = config.venueName.trim();
  }
  if (mapsLink && typeof config.googleMapsUrl === 'string') {
    let validMapsUrl = null;
    try {
      const url = new URL(config.googleMapsUrl);
      const hostname = url.hostname.toLowerCase();
      const approved = hostname === 'google.com' || hostname.endsWith('.google.com') ||
        hostname === 'maps.app.goo.gl' || hostname === 'goo.gl';
      if (url.protocol === 'https:' && approved) validMapsUrl = url.href;
    } catch { /* Keep the placeholder if no map destination has been provided. */ }
    if (validMapsUrl) {
      mapsLink.href = validMapsUrl;
      mapsLink.target = '_blank';
      mapsLink.rel = 'noopener noreferrer';
      mapsLink.textContent = 'اضغط هنا لفتح رابط الموقع';
      mapsLink.removeAttribute('aria-disabled');
      mapsLink.classList.remove('maps-button--pending');
    }
  }
})();
