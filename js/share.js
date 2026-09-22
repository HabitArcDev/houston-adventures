(function (H) {
  'use strict';
  function manual(text) {
    const host = document.getElementById('manual-copy'); host.replaceChildren();
    const label = document.createElement('label'); label.htmlFor = 'share-text'; label.textContent = H.CONFIG.copy.copyInstruction;
    const area = document.createElement('textarea'); area.id = 'share-text'; area.readOnly = true; area.value = text;
    const select = document.createElement('button'); select.className = 'secondary'; select.textContent = H.CONFIG.copy.selectAll;
    select.onclick = () => { area.focus(); area.select(); area.setSelectionRange(0, area.value.length); };
    host.append(label, area, select); host.hidden = false; host.scrollIntoView({ block: 'nearest' }); area.focus(); area.select();
  }
  function legacyCopy(text) {
    const area = document.createElement('textarea'); area.value = text; area.className = 'sr-only'; area.readOnly = true;
    document.body.append(area); const previous = document.activeElement; area.focus(); area.select();
    let success = false;
    try { success = document.execCommand('copy'); } catch (_) { /* Locked-down browsers use the visible fallback. */ }
    area.remove(); previous?.focus({ preventScroll: true });
    if (success) H.toast(H.CONFIG.copy.shareCopiedFallback); else manual(text);
  }
  function copy(text) {
    // Call Clipboard synchronously when share is unavailable. After a rejected native
    // share, browser activation may be consumed; the manual fallback remains usable.
    try {
      if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text).then(() => H.toast(H.CONFIG.copy.shareCopiedFallback), () => legacyCopy(text));
    } catch (_) { /* Fall through without an error dialog. */ }
    legacyCopy(text);
  }
  H.share = {
    buildMessage(outcome) {
      const values = H.selectionLabels();
      return H.CONFIG.shareTemplates[outcome].replace(/\{(weekendLabel|horseLabel|foodLabelList)\}/g, (_, key) => values[key]);
    },
    shareResults(outcome) {
      const text = this.buildMessage(outcome);
      if (navigator.share) {
        try { return navigator.share({ text }).catch(err => { if (err?.name !== 'AbortError') return copy(text); }); }
        catch (err) { if (err?.name === 'AbortError') return; }
      }
      return copy(text);
    }
  };
})(window.HA);
