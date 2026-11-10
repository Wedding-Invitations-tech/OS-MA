(() => {
  'use strict';

  const body = document.body;
  const envelope = document.getElementById('envelope');
  const openButton = document.getElementById('openInvitation');
  const envelopeCard = document.getElementById('envelopeCard');
  const OPEN_SEQUENCE_MS = 6300;

  function openInvitation() {
    if (!envelope || envelope.classList.contains('is-opening')) return;
    envelope.classList.add('is-opening');
    body.classList.add('has-opened');
    if (navigator.vibrate) navigator.vibrate(14);
    window.setTimeout(() => {
      body.classList.remove('is-locked');
      envelope.classList.add('is-open');
      envelope.setAttribute('aria-hidden', 'true');
      openButton?.setAttribute('tabindex', '-1');
      openButton?.blur();
      startAutoCycle();
    }, OPEN_SEQUENCE_MS);
  }

  function beginInvitation() {
    // This must run directly in the real user gesture. Calling play() from a
    // timeout or after awaiting another promise may fail on iOS/Android.
    // If a touch pointerup is followed by click, a rejected play can retry.
    window.startInvitationSoundtrack?.();
    openInvitation();
  }

  // The whole envelope (artwork, background, and wax seal) opens the invitation.
  // Pointer-up supports touch browsers; click supports mouse, keyboard, and
  // browsers which only grant audio permission on the synthesised click.
  envelope?.addEventListener('pointerup', (event) => {
    if (event.pointerType === 'touch' || event.pointerType === 'pen') {
      beginInvitation();
    }
  }, { passive: true });
  envelope?.addEventListener('click', beginInvitation);

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

  // Provide a tactile press on touch, mouse and keyboard while preserving the
  // browser's native target=_blank link (no navigation delay or interception).
  if (mapsLink) {
    let releaseTimer;
    const press = () => {
      window.clearTimeout(releaseTimer);
      mapsLink.classList.add('is-pressed');
    };
    const release = () => {
      window.clearTimeout(releaseTimer);
      releaseTimer = window.setTimeout(() => mapsLink.classList.remove('is-pressed'), 180);
    };
    mapsLink.addEventListener('pointerdown', press);
    mapsLink.addEventListener('pointerup', release);
    mapsLink.addEventListener('pointercancel', release);
    mapsLink.addEventListener('pointerleave', release);
    mapsLink.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') press();
    });
    mapsLink.addEventListener('keyup', release);
    mapsLink.addEventListener('blur', release);
  }

  const scroller = document.getElementById('continuumScroll');
  const canvas = document.getElementById('continuumCanvas');
  const layers = [
    document.querySelector('.scene-layer--1'),
    document.querySelector('.scene-layer--2'),
    document.querySelector('.scene-layer--3')
  ].filter(Boolean);
  const ambientLayers = [
    document.querySelector('.ambient-scene--1'),
    document.querySelector('.ambient-scene--2'),
    document.querySelector('.ambient-scene--3')
  ].filter(Boolean);
  const edgeLayers = [1, 2, 3].map(index =>
    [...document.querySelectorAll(`.edge-bleed--${index}`)]
  );
  const dots = [...document.querySelectorAll('[data-progress-dot]')];
  const hint = document.getElementById('sceneHint');
  const swipeCue = document.getElementById('swipeCue');

  // Automatic presentation: holds of 12 / 8 / 8 seconds, then loops.
  // The existing scroll-driven presentation remains available immediately
  // when a visitor swipes, wheels, or uses the keyboard.
  const SCENE_HOLD_MS = [12000, 8000, 8000];
  const SWIPE_CUE_MS = 3000;
  const TRANSITION_MS = 1300;
  const MANUAL_IDLE_MS = 12000;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let autoStarted = false;
  let autoMode = false;
  let currentScene = 0;
  let currentWeights = [1, 0, 0];
  let holdTimer = null;
  let cueTimer = null;
  let resumeTimer = null;
  let fadeFrame = null;
  let frameId = null;

  function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }
  function smoothstep(edge0, edge1, x) {
    const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
    return t * t * (3 - 2 * t);
  }
  function oneHot(scene) { return [0, 1, 2].map(index => index === scene ? 1 : 0); }
  function mostVisible(weights) {
    return weights.indexOf(Math.max(...weights));
  }

  function renderScene(weights) {
    if (!canvas || layers.length !== 3) return;
    currentWeights = weights;
    layers.forEach((layer, index) => {
      const opacity = weights[index];
      layer.style.opacity = opacity.toFixed(4);
      // Fixed geometry prevents the gold arch and map hotspot drifting.
      layer.style.transform = 'translateY(0) scale(1)';
      layer.style.filter = `saturate(${(1.01 + opacity * 0.02).toFixed(3)}) brightness(${(0.97 + opacity * 0.05).toFixed(3)})`;
      layer.classList.toggle('is-visible', opacity > 0.015);
    });
    ambientLayers.forEach((layer, index) => {
      layer.style.opacity = weights[index].toFixed(4);
    });
    edgeLayers.forEach((pair, index) => {
      pair.forEach(edge => {
        edge.style.opacity = weights[index].toFixed(4);
        edge.style.filter = layers[index].style.filter;
      });
    });

    const dominant = mostVisible(weights);
    canvas.dataset.scene = String(dominant + 1);
    dots.forEach((dot, index) => dot.classList.toggle('is-active', index === dominant));
    // Only the fully revealed venue page gets an interactive map button.
    if (mapsLink) mapsLink.classList.toggle('is-active', weights[1] >= 0.90 && !!validMapsUrl);
    if (hint) hint.classList.toggle('is-hidden', autoStarted || window.scrollY > 20);
  }

  function manualProgress() {
    if (!scroller) return 0;
    const scrollTop = -scroller.getBoundingClientRect().top;
    const step = Math.max(window.innerHeight * 1.02, 420);
    return clamp(scrollTop / step, 0, 2);
  }

  function renderManual() {
    const progress = manualProgress();
    if (progress < 1) {
      const blend = smoothstep(0.12, 0.88, progress);
      renderScene([1 - blend, blend, 0]);
    } else {
      const blend = smoothstep(1.12, 1.88, progress);
      renderScene([0, 1 - blend, blend]);
    }
  }

  function requestManualRender() {
    if (autoMode || frameId !== null) return;
    frameId = window.requestAnimationFrame(() => {
      frameId = null;
      if (!autoMode) renderManual();
    });
  }

  function stopAutoTimers() {
    window.clearTimeout(holdTimer);
    holdTimer = null;
    window.clearTimeout(cueTimer);
    cueTimer = null;
    swipeCue?.classList.remove('is-visible');
    if (fadeFrame !== null) window.cancelAnimationFrame(fadeFrame);
    fadeFrame = null;
  }

  // Keep the original manual scroll positions in sync with auto mode.
  // This lets a guest take over with a swipe without jumping to another page.
  function syncScrollToScene(scene) {
    if (!scroller) return;
    const start = scroller.getBoundingClientRect().top + window.scrollY;
    const step = Math.max(window.innerHeight * 1.02, 420);
    window.scrollTo({ top: start + step * scene, behavior: 'instant' });
  }

  function scheduleHold() {
    stopAutoTimers();
    if (!autoMode || document.hidden) return;
    const duration = SCENE_HOLD_MS[currentScene];
    // Display the cue only over Scenes 1 and 2, and only in their last 3 seconds.
    if (currentScene < 2) {
      cueTimer = window.setTimeout(() => {
        if (autoMode && !document.hidden && currentScene < 2) {
          swipeCue?.classList.add('is-visible');
        }
      }, duration - SWIPE_CUE_MS);
    }
    holdTimer = window.setTimeout(advanceAutoScene, duration);
  }

  function advanceAutoScene() {
    if (!autoMode || document.hidden) return;
    window.clearTimeout(cueTimer);
    cueTimer = null;
    swipeCue?.classList.remove('is-visible');
    const from = currentScene;
    const to = (from + 1) % 3;
    const startWeights = [...currentWeights];
    const endWeights = oneHot(to);
    const duration = reducedMotion.matches ? 1 : TRANSITION_MS;
    let began = null;
    syncScrollToScene(to);

    const tick = (now) => {
      if (!autoMode || document.hidden) return;
      if (began === null) began = now;
      const t = smoothstep(0, 1, (now - began) / duration);
      renderScene(startWeights.map((weight, index) => weight * (1 - t) + endWeights[index] * t));
      if (t < 1) {
        fadeFrame = window.requestAnimationFrame(tick);
      } else {
        fadeFrame = null;
        currentScene = to;
        renderScene(endWeights);
        // Notify the optional soundtrack only when a complete automatic
        // Scene 3 -> Scene 1 loop has actually finished. The music is not
        // stopped by a wall-clock timeout, so manual pauses stay in sync.
        if (from === 2 && to === 0) {
          window.dispatchEvent(new Event('invitation:rotation-complete'));
        }
        scheduleHold();
      }
    };
    fadeFrame = window.requestAnimationFrame(tick);
  }

  function startAutoCycle() {
    if (!scroller || !canvas || layers.length !== 3) return;
    autoStarted = true;
    autoMode = true;
    window.clearTimeout(resumeTimer);
    stopAutoTimers();
    // Visitors begin at the invitation (not part way through a prior scroll).
    currentScene = 0;
    syncScrollToScene(0);
    renderScene(oneHot(0));
    scheduleHold();
  }

  // Real interactions take priority over automatic presentation.
  function visitorTookControl() {
    if (!autoStarted || body.classList.contains('is-locked') || document.hidden) return;
    stopAutoTimers();
    autoMode = false;
    window.clearTimeout(resumeTimer);
    requestManualRender();
    // Resume from the page the guest actually reached, once they are idle.
    resumeTimer = window.setTimeout(() => {
      if (document.hidden || body.classList.contains('is-locked')) return;
      currentScene = mostVisible(currentWeights);
      autoMode = true;
      syncScrollToScene(currentScene);
      renderScene(oneHot(currentScene));
      scheduleHold();
    }, MANUAL_IDLE_MS);
  }

  window.addEventListener('wheel', visitorTookControl, { passive: true });
  window.addEventListener('touchstart', visitorTookControl, { passive: true });
  window.addEventListener('pointerdown', event => {
    if (event.target.closest?.('#mapsLink')) visitorTookControl();
  }, { passive: true });
  window.addEventListener('keydown', event => {
    if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ', 'Spacebar'].includes(event.key)) visitorTookControl();
  });
  window.addEventListener('scroll', requestManualRender, { passive: true });
  window.addEventListener('resize', () => {
    if (autoMode) syncScrollToScene(currentScene);
    else requestManualRender();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopAutoTimers();
      window.clearTimeout(resumeTimer);
    } else if (autoStarted) {
      autoMode = true;
      currentScene = mostVisible(currentWeights);
      syncScrollToScene(currentScene);
      renderScene(oneHot(currentScene));
      scheduleHold();
    }
  });
  renderManual();
})();
