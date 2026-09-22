(function (H) {
  'use strict';
  let overlay, media, captionNode, secondary, timer, callback, allowDismiss, generation = 0;
  function close(notify = true) {
    clearTimeout(timer); generation++;
    if (overlay) { overlay.hidden = true; media.replaceChildren(); }
    const fn = callback; callback = null;
    if (notify) fn?.();
  }
  H.MemePopup = {
    cancel() { close(false); },
    show({ memeKey, caption, secondaryText, durationMs, dismissOnTap = true, skipOnMissing = false, onClose }) {
      close(false);
      if (!overlay) {
        overlay = document.createElement('div'); overlay.className = 'popup'; overlay.hidden = true;
        overlay.setAttribute('role', 'status'); overlay.setAttribute('aria-live', 'polite');
        const card = document.createElement('div'); card.className = 'popup-card';
        media = document.createElement('div'); captionNode = document.createElement('p'); secondary = document.createElement('small');
        card.append(media, captionNode, secondary); overlay.append(card); document.body.append(overlay);
        overlay.addEventListener('click', () => { if (allowDismiss) close(); });
      }
      callback = onClose; allowDismiss = dismissOnTap;
      captionNode.textContent = caption; secondary.textContent = secondaryText || ''; secondary.hidden = !secondaryText;
      const path = H.CONFIG.memes[memeKey]; const token = generation;
      const duration = durationMs ?? H.CONFIG.timing[H.reducedMotion ? 'memePopupDurationMsReduced' : 'memePopupDurationMs'];
      let started = false;
      const startReading = () => {
        if (token !== generation || started) return;
        started = true; clearTimeout(timer);
        overlay.hidden = false;
        timer = setTimeout(() => close(), duration);
      };
      // Give the image its full reading time after it loads, with a bounded
      // fallback for a stalled request. Manual dismissal still works immediately.
      const missing = () => {
        if (token !== generation) return;
        if (skipOnMissing) close(); else startReading();
      };
      timer = setTimeout(missing, H.CONFIG.timing.memeLoadTimeoutMs);
      if (path) {
        const video = /\.(mp4|webm)(?:\?.*)?$/i.test(path);
        const asset = document.createElement(video ? 'video' : 'img');
        if (video) { asset.muted = true; asset.playsInline = true; asset.autoplay = !H.reducedMotion; asset.loop = !H.reducedMotion; asset.setAttribute('aria-label', H.CONFIG.copy.alt.meme); }
        else { asset.alt = H.CONFIG.copy.alt.meme; asset.width = 500; asset.height = 500; }
        asset.addEventListener(video ? 'loadeddata' : 'load', startReading, { once: true });
        asset.addEventListener('error', () => { if (token === generation) { asset.remove(); missing(); } });
        asset.src = path; media.append(asset);
      }
      overlay.hidden = skipOnMissing;
      if (!path) missing();
    }
  };
})(window.HA);
