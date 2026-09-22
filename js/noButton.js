(function (H) {
  'use strict';
  let cleanup = () => {};
  // The affirmative button gets one small, bounded dodge inside its own row.
  // It cannot overlap NO, leave the viewport, or evade a second activation.
  let cleanupYes = () => {};
  H.yesButton = {
    reset() { cleanupYes(); },
    init(button, approve) {
      cleanupYes();
      let moved = false, busy = false, timer;
      function click(event) {
        if (event.detail === 0 || H.reducedMotion) { approve(); return; }
        if (busy) return;
        if (moved) { approve(); return; }
        moved = true; busy = true;
        button.classList.add('yes-moved');
        timer = setTimeout(() => { busy = false; }, H.CONFIG.timing.yesButtonDodgeAnimMs);
      }
      button.addEventListener('click', click);
      cleanupYes = () => {
        clearTimeout(timer); button.classList.remove('yes-moved');
        button.removeEventListener('click', click);
      };
    }
  };
  H.noButton = {
    reset() { cleanup(); },
    init(button, reaction) {
      cleanup();
      const cfg = H.CONFIG, sequence = cfg.copy.noSequence;
      const stages = { INITIAL: 0, FIRST: 1, SECOND: 2, PLEA: 3, SETTLED: 4 };
      let noAttemptState = stages.INITIAL, busy = false, timer;
      const probe = document.createElement('div'); probe.className = 'safe-probe'; document.body.append(probe);
      const home = () => { button.classList.remove('roaming'); button.style.transform = ''; };
      const settle = () => { button.textContent = sequence.settledButtonLabel; reaction.textContent = sequence.settledLabel; reaction.hidden = false; };
      function relocate() {
        if (noAttemptState === stages.SETTLED) return;
        if (H.reducedMotion) { home(); return; }
        const safe = getComputedStyle(probe), margin = cfg.presentation.noMargin;
        const view = window.visualViewport;
        const left = (view?.offsetLeft || 0) + parseFloat(safe.paddingLeft) + margin;
        const top = (view?.offsetTop || 0) + parseFloat(safe.paddingTop) + margin;
        const right = (view?.offsetLeft || 0) + (view?.width || innerWidth) - parseFloat(safe.paddingRight) - margin;
        const bottom = (view?.offsetTop || 0) + (view?.height || innerHeight) - parseFloat(safe.paddingBottom) - margin;
        const rect = button.getBoundingClientRect();
        const obstacles = [...document.querySelectorAll('button,input,textarea')].filter(e => e !== button && e.getClientRects().length).map(e => e.getBoundingClientRect());
        const candidates = [];
        for (let i = 0; i < 80; i++) candidates.push({ x: left + Math.random() * Math.max(0, right - left - rect.width), y: top + Math.random() * Math.max(0, bottom - top - rect.height) });
        const point = candidates.find(p => Math.hypot(p.x - rect.left, p.y - rect.top) >= margin && !obstacles.some(r => p.x < r.right + margin && p.x + rect.width > r.left - margin && p.y < r.bottom + margin && p.y + rect.height > r.top - margin));
        // When zoom/keyboard leaves no safe free rectangle, staying in flow is safer.
        if (!point || rect.width > right - left || rect.height > bottom - top) { home(); return; }
        button.classList.add('roaming'); button.style.transform = `translate(${point.x}px, ${point.y}px)`;
      }
      function click(event) {
        // Native keyboard/AT clicks have detail === 0. Never intercept those.
        // Browsers with MouseEvent clicks lack pointerType; positive detail still
        // identifies a real mouse/touch click. Pointer clicks must finish on button.
        if (event.detail === 0 || noAttemptState === stages.SETTLED) { H.session.declined = true; H.state.goTo('DECLINE_RESULT'); return; }
        if (busy) return;
        busy = true; H.summaryMode = 'NO_DODGE';
        const nextState = noAttemptState + 1;
        if (nextState === stages.PLEA || nextState === stages.SETTLED) {
          if (nextState === stages.SETTLED) relocate();
          const meme = nextState === stages.PLEA ? sequence.pleaMeme : sequence.paperworkMeme;
          reaction.textContent = meme.caption; reaction.hidden = false;
          H.MemePopup.show({ memeKey: meme.key, caption: meme.caption, skipOnMissing: true, onClose: () => {
            noAttemptState = nextState;
            if (noAttemptState === stages.SETTLED) settle();
            // Also debounce an immediate missing-asset dismissal.
            timer = setTimeout(() => { busy = false; }, cfg.timing.noButtonDodgeAnimMs);
          } });
          return;
        }
        noAttemptState = nextState;
        reaction.textContent = noAttemptState === stages.FIRST ? sequence.firstCaption : sequence.secondCaption;
        reaction.hidden = false;
        relocate();
        timer = setTimeout(() => { busy = false; }, cfg.timing.noButtonDodgeAnimMs);
      }
      const viewportChanged = () => { if (button.classList.contains('roaming')) home(); };
      button.addEventListener('click', click);
      window.addEventListener('resize', viewportChanged); window.addEventListener('scroll', viewportChanged, { passive: true });
      window.visualViewport?.addEventListener('resize', viewportChanged);
      cleanup = () => {
        clearTimeout(timer); home(); probe.remove(); button.removeEventListener('click', click);
        window.removeEventListener('resize', viewportChanged); window.removeEventListener('scroll', viewportChanged);
        window.visualViewport?.removeEventListener('resize', viewportChanged); H.summaryMode = null;
      };
    }
  };
})(window.HA);
