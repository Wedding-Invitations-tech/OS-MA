/*
 * Optional soundtrack for the Arabic wedding invitation.
 * Set soundtrack.file in config.js to an audio recording you are authorised
 * to use, e.g. assets/music/wedding-soundtrack.mp3.
 *
 * The page requests audible autoplay at load. Browsers frequently disallow
 * this before an interaction; the top-corner music control provides a graceful
 * fallback and a tap on the original envelope seal also unlocks playback.
 */
(() => {
  'use strict';
  const cfg = window.INVITATION_CONFIG?.soundtrack;
  const audio = document.getElementById('invitationSoundtrack');
  const toggle = document.getElementById('soundtrackToggle');
  const label = document.getElementById('soundtrackLabel');
  if (!cfg?.file || !audio || !toggle || !label) return;

  const maxRotations = Number.isFinite(Number(cfg.rotations)) ? Math.max(1, Number(cfg.rotations)) : 2;
  const targetVolume = Number.isFinite(Number(cfg.volume)) ? Math.max(0, Math.min(1, Number(cfg.volume))) : 0.6;
  let completedRotations = 0;
  let unavailable = false;
  let finished = false;
  let requestedPlay = false;
  let fadeId = null;

  audio.src = cfg.file;
  audio.loop = true;
  audio.volume = targetVolume;
  audio.preload = 'auto';

  function setControl(mode) {
    if (finished || unavailable) {
      toggle.hidden = true;
      return;
    }
    toggle.hidden = false;
    const isPlaying = mode === 'playing';
    toggle.classList.toggle('is-playing', isPlaying);
    label.textContent = isPlaying ? 'إيقاف الموسيقى' : 'تشغيل الموسيقى';
    toggle.setAttribute('aria-label', label.textContent);
    toggle.title = label.textContent;
  }

  async function tryPlay() {
    if (finished || unavailable) return;
    requestedPlay = true;
    try {
      if (fadeId !== null) window.cancelAnimationFrame(fadeId);
      audio.volume = targetVolume;
      await audio.play();
      if (!finished && !audio.paused) setControl('playing');
    } catch (error) {
      // NotAllowedError = browser requires a user gesture.
      // Unsupported/missing audio will fire an error event (below).
      if (!finished && !unavailable) setControl('paused');
    }
  }

  function fadeAndStop() {
    if (finished) return;
    finished = true;
    toggle.hidden = true;
    if (audio.paused) return;
    const startTime = performance.now();
    const initialVolume = audio.volume;
    const duration = 1250;
    function fade(now) {
      const t = Math.min(1, (now - startTime) / duration);
      audio.volume = initialVolume * (1 - t * t * (3 - 2 * t));
      if (t < 1) {
        fadeId = window.requestAnimationFrame(fade);
      } else {
        fadeId = null;
        audio.pause();
        audio.currentTime = 0;
      }
    }
    fadeId = window.requestAnimationFrame(fade);
  }

  // Counts complete presentation loops, rather than seconds elapsed.
  window.addEventListener('invitation:rotation-complete', () => {
    completedRotations += 1;
    if (completedRotations >= maxRotations) fadeAndStop();
  });

  audio.addEventListener('error', () => {
    unavailable = true;
    toggle.hidden = true;
  });
  audio.addEventListener('play', () => {
    if (!finished) setControl('playing');
  });
  audio.addEventListener('pause', () => {
    if (!finished && !unavailable) setControl('paused');
  });

  toggle.addEventListener('click', () => {
    if (finished || unavailable) return;
    if (audio.paused) void tryPlay();
    else {
      requestedPlay = false;
      audio.pause();
    }
  });

  // If autoplay was rejected, pressing the existing wax seal is sufficient to
  // start the audio; it also continues to open the envelope as before.
  const seal = document.getElementById('openInvitation');
  seal?.addEventListener('pointerdown', () => {
    if (!finished && !unavailable && audio.paused && requestedPlay) void tryPlay();
  }, { passive: true });
  seal?.addEventListener('click', () => {
    if (!finished && !unavailable && audio.paused && requestedPlay) void tryPlay();
  });

  // Match the presentation's visibility behaviour: do not let music play in a
  // background tab while its automatic scene rotation is paused.
  let resumeOnReturn = false;
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      resumeOnReturn = !audio.paused;
      if (resumeOnReturn) audio.pause();
    } else if (resumeOnReturn && !finished) {
      resumeOnReturn = false;
      void tryPlay();
    }
  });

  // A deferred script runs before the load event on normal navigation.
  // Make the attempt as soon as the browser can start loading the track,
  // well before the existing 3-second envelope auto-open timeout.
  void tryPlay();
})();
