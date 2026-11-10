/* Soundtrack begins in the same user gesture that opens the envelope.
 * Provide your authorised MP3 at assets/music/wedding-soundtrack.mp3.
 * Browsers permit user-initiated playback, but may still reject unsupported files.
 */
(() => {
  'use strict';
  const cfg = window.INVITATION_CONFIG?.soundtrack;
  const audio = document.getElementById('invitationSoundtrack');
  if (!cfg?.file || !audio) return;

  const volume = Number.isFinite(Number(cfg.volume))
    ? Math.max(0, Math.min(1, Number(cfg.volume))) : 0.60;
  let started = false;
  let finished = false;
  let resumeOnReturn = false;

  audio.src = cfg.file;
  audio.preload = 'auto';
  audio.volume = volume;
  audio.loop = false;

  function playInGesture() {
    if (finished || audio.ended || (!audio.paused && started)) return;
    // Play synchronously, *inside* the visitor's trusted click/touch event.
    // No await, setTimeout, or async work occurs before audio.play().
    let playPromise;
    try {
      playPromise = audio.play();
    } catch (_error) {
      return;
    }
    if (playPromise && typeof playPromise.then === 'function') {
      playPromise.then(() => { started = true; }).catch(() => {
        // The invitation still opens if audio is missing, unsupported or blocked.
      });
    } else {
      started = true;
    }
  }

  // Called directly by script.js on the visitor's first tap anywhere on
  // the envelope, including the wax seal. No visible music button needed.
  window.startInvitationSoundtrack = playInGesture;

  audio.addEventListener('ended', () => { finished = true; });

  // Match the invitation's tab visibility behaviour. After one legitimate
  // user interaction, most browsers allow resuming an interrupted soundtrack.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      resumeOnReturn = started && !audio.paused && !finished;
      if (resumeOnReturn) audio.pause();
    } else if (resumeOnReturn && !finished) {
      resumeOnReturn = false;
      playInGesture();
    }
  });
})();
