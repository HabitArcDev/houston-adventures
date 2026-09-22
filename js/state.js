(function (H) {
  'use strict';
  const transitions = {
    INTRO: ['LOADING'], LOADING: ['DATE_SELECT'], DATE_SELECT: ['DATE_SUGGEST', 'HORSE_SELECT'],
    DATE_SUGGEST: ['DATE_SELECT'], HORSE_SELECT: ['FOOD_SELECT'], FOOD_SELECT: ['SUMMARY'],
    SUMMARY: ['APPROVAL_SEQUENCE', 'DECLINE_RESULT'], APPROVAL_SEQUENCE: ['FINAL_APPROVED'],
    FINAL_APPROVED: [], DECLINE_RESULT: []
  };
  const hooks = {}, timers = new Set();
  const screenFor = state => document.getElementById(state === 'DATE_SUGGEST' ? 'DATE_SELECT' : state);
  H.state = {
    currentState: null, transitions, hooks,
    later(fn, ms) { const id = setTimeout(() => { timers.delete(id); fn(); }, ms); timers.add(id); return id; },
    goTo(next) {
      const previous = this.currentState;
      if (previous && !transitions[previous].includes(next)) return false;
      const oldScreen = screenFor(previous);
      timers.forEach(clearTimeout); timers.clear();
      if (hooks[previous]?.onExit) hooks[previous].onExit(next);
      H.MemePopup?.cancel();
      if (oldScreen) { oldScreen.hidden = true; oldScreen.getAnimations?.().forEach(a => a.cancel()); }
      this.currentState = next;
      const screen = screenFor(next); screen.hidden = false;
      hooks[next]?.onEnter(previous);
      H.updateProgress?.(next);
      const target = next === 'DATE_SUGGEST' ? screen.querySelector('input') : screen.querySelector('h1,h2');
      target?.focus({ preventScroll: true });
      if (next !== 'DATE_SUGGEST') window.scrollTo({ top: 0, behavior: 'instant' });
      H.easterEggs?.screenChanged();
      return true;
    }
  };
})(window.HA);
