(() => {
  'use strict';

  const body = document.body;
  const envelope = document.getElementById('envelope');
  const openButton = document.getElementById('openInvitation');
  const envelopeCard = document.getElementById('envelopeCard');
  const OPEN_SEQUENCE_MS = 6300;
  const AUTO_OPEN_DELAY_MS = 3000;
  let autoOpenTimer = null;

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

  openButton?.addEventListener('click', openInvitation);
  envelope?.addEventListener('pointerup', (event) => {
    if (event.target === openButton || envelope.classList.contains('is-opening') || !envelopeCard) return;
    const card = envelopeCard.getBoundingClientRect();
    const cx = card.left + card.width / 2;
    const cy = card.top + card.height * 0.532;
    const radius = Math.max(54, card.width * 0.145);
    if (Math.hypot(event.clientX - cx, event.clientY - cy) <= radius) openInvitation();
  });
  function scheduleAutoOpen() {
    const immediatePreview = new URLSearchParams(window.location.search).get('preview') === 'open';
    autoOpenTimer = window.setTimeout(openInvitation, immediatePreview ? 120 : AUTO_OPEN_DELAY_MS);
  }
  if (document.readyState === 'complete') scheduleAutoOpen();
  else window.addEventListener('load', scheduleAutoOpen, { once: true });

  const config = window.INVITATION_CONFIG || {};
  const mapsLink = document.getElementById('mapsLink');
  let validMapsUrl = null;
  if (mapsLink && typeof config.googleMapsUrl === 'string') {
    try {
      const url = new URL(config.googleMapsUrl);
      const hostname = url.hostname.toLowerCase();
      const approved = hostname === 'google.com' || hostname.endsWith('.google.com') || hostname === 'maps.app.goo.gl' || hostname === 'goo.gl';
      if (url.protocol === 'https:' && approved) validMapsUrl = url.href;
    } catch {}
    if (validMapsUrl) {
      mapsLink.href = validMapsUrl;
      mapsLink.target = '_blank';
      mapsLink.rel = 'noopener noreferrer';
      mapsLink.removeAttribute('aria-disabled');
    }
  }

  const scroller = document.getElementById('continuumScroll');
  const canvas = document.getElementById('continuumCanvas');
  const layers = [
    document.querySelector('.scene-layer--1'),
    document.querySelector('.scene-layer--2'),
    document.querySelector('.scene-layer--3')
  ].filter(Boolean);
  const dots = [...document.querySelectorAll('[data-progress-dot]')];
  const hint = document.getElementById('sceneHint');

  function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }
  function smoothstep(edge0, edge1, x) {
    const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
    return t * t * (3 - 2 * t);
  }

  let ticking = false;
  function updateContinuum() {
    ticking = false;
    if (!scroller || layers.length < 3 || !canvas) return;

    const scrollTop = -scroller.getBoundingClientRect().top;
    const step = Math.max(window.innerHeight * 1.02, 420);
    const progress = clamp(scrollTop / step, 0, 2);

    let o1 = 1, o2 = 0, o3 = 0;
    let t12 = 0, t23 = 0;
    if (progress < 1) {
      t12 = smoothstep(0.12, 0.88, progress);
      o1 = 1 - t12;
      o2 = t12;
      o3 = 0;
    } else {
      t23 = smoothstep(1.12, 1.88, progress);
      o1 = 0;
      o2 = 1 - t23;
      o3 = t23;
    }

    const ops = [o1, o2, o3];
    layers.forEach((layer, index) => {
      const opacity = ops[index];
      const lift = 0;
      const scale = 1;
      layer.style.opacity = opacity.toFixed(4);
      layer.style.transform = `translateY(${lift.toFixed(2)}px) scale(${scale.toFixed(4)})`;
      layer.style.filter = `saturate(${(1.01 + opacity * 0.02).toFixed(3)}) brightness(${(0.97 + opacity * 0.05).toFixed(3)})`;
      layer.classList.toggle('is-visible', opacity > 0.015);
    });

    const dominantIndex = o3 > 0.5 ? 2 : o2 > 0.5 ? 1 : 0;
    canvas.dataset.scene = String(dominantIndex + 1);
    dots.forEach((dot, index) => dot.classList.toggle('is-active', index === dominantIndex));

    if (mapsLink) mapsLink.classList.toggle('is-active', dominantIndex === 1 && !!validMapsUrl);
    if (hint) hint.classList.toggle('is-hidden', progress > 0.08);
  }

  function requestUpdate() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(updateContinuum);
    }
  }

  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate);
  updateContinuum();
})();
