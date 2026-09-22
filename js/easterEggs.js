(function (H) {
  'use strict';
  let idleTimer, eggTimer, idleShown = false, horseTaps = 0, titleTaps = 0, lastHorseTap = 0;
  const eligible = ['DATE_SELECT', 'HORSE_SELECT', 'FOOD_SELECT', 'SUMMARY'];
  function show(text, art, parade = false) {
    const egg = document.getElementById('egg'); clearTimeout(eggTimer); egg.replaceChildren();
    if (art) {
      const row = document.createElement('div'); if (parade) row.className = 'egg-parade';
      for (let i = 0; i < (parade ? 3 : 1); i++) { const img = document.createElement('img'); img.src = art; img.alt = ''; img.setAttribute('aria-hidden', 'true'); row.append(img); }
      egg.append(row);
    }
    const caption = document.createElement('span'); caption.textContent = text; egg.append(caption); egg.hidden = false;
    eggTimer = setTimeout(() => { egg.hidden = true; egg.replaceChildren(); }, art ? H.CONFIG.timing.eggPeekMs : H.CONFIG.timing.eggCaptionMs);
  }
  function activity() {
    clearTimeout(idleTimer);
    if (!idleShown && eligible.includes(H.state.currentState)) idleTimer = setTimeout(() => {
      idleShown = true; show(H.CONFIG.copy.easterEggs.idle, H.CONFIG.horseArt.peek);
    }, H.CONFIG.timing.idleEasterEggMs);
  }
  H.easterEggs = {
    screenChanged() { idleShown = false; clearTimeout(eggTimer); document.getElementById('egg').hidden = true; activity(); },
    init() {
      console.log(H.CONFIG.copy.easterEggs.console);
      ['pointerdown', 'keydown', 'touchstart'].forEach(type => document.addEventListener(type, activity, { passive: true }));
      document.addEventListener('click', event => {
        if (event.target.closest('[data-horse]')) {
          const now = Date.now(); horseTaps = now - lastHorseTap > H.CONFIG.timing.eggTapWindowMs ? 1 : horseTaps + 1; lastHorseTap = now;
          if (horseTaps >= H.CONFIG.presentation.horseTapCount) { horseTaps = 0; show(H.CONFIG.copy.easterEggs.horse); }
        }
        if (H.state.currentState === 'INTRO' && event.target.closest('h1')) {
          titleTaps++;
          if (titleTaps >= H.CONFIG.presentation.titleTapCount) { titleTaps = 0; show('', H.CONFIG.horseArt.run, true); }
        }
      });
      let index = 0; const status = document.getElementById('system-status');
      const update = () => { status.textContent = H.CONFIG.copy.systemStatusLines[index++ % H.CONFIG.copy.systemStatusLines.length]; };
      update(); setInterval(update, H.CONFIG.timing.statusIntervalMs);
    }
  };
})(window.HA);
