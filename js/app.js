(function (H) {
  'use strict';
  const C = H.CONFIG, T = C.timing, copy = C.copy;
  const motion = matchMedia('(prefers-reduced-motion: reduce)'); H.reducedMotion = motion.matches;
  const changeMotion = event => {
    H.reducedMotion = event.matches;
    if (event.matches) { const no = document.querySelector('.no-button'); no?.classList.remove('roaming'); if (no) no.style.transform = ''; }
  };
  if (motion.addEventListener) motion.addEventListener('change', changeMotion); else motion.addListener(changeMotion);
  H.session = { weekendId: null, customWeekend: '', horseExperience: null, foodIds: [], declined: false };
  let toastTimer, dateBusy = false;
  H.toast = text => { const host = document.getElementById('toast'); clearTimeout(toastTimer); host.textContent = text; host.hidden = false; toastTimer = setTimeout(() => { host.hidden = true; }, T.copyToastMs); };
  const el = (tag, text, className) => { const node = document.createElement(tag); if (text !== undefined) node.textContent = text; if (className) node.className = className; return node; };
  const button = (text, fn, className = 'primary') => { const node = el('button', text, className); node.type = 'button'; if (fn) node.addEventListener('click', fn); return node; };
  const image = (art, alt, className) => { const node = el('img', undefined, className); node.src = art; node.alt = alt; node.width = 240; node.height = 180; node.dataset.horse = ''; return node; };
  const heading = (text, level = 'h2') => { const node = el(level, text); node.tabIndex = -1; return node; };
  const screen = id => document.getElementById(id);
  const random = values => values[Math.floor(Math.random() * values.length)];
  const later = (fn, ms) => H.state.later(fn, ms);
  const reaction = host => { const node = el('p', '', 'reaction'); node.setAttribute('role', 'status'); node.hidden = true; host.append(node); return node; };
  const announce = (node, text) => { node.textContent = text; node.hidden = false; };
  const setRadio = (group, active) => { group.querySelectorAll('[role=radio]').forEach(node => node.setAttribute('aria-checked', String(node === active))); };
  H.selectionLabels = () => ({
    weekendLabel: H.session.weekendId === 'custom' ? H.session.customWeekend : C.weekends.find(x => x.id === H.session.weekendId)?.label || '',
    horseLabel: C.horseOptions.find(x => x.id === H.session.horseExperience)?.summaryLabel || '',
    foodLabelList: H.session.foodIds.map(id => C.foodOptions.find(x => x.id === id)?.label).filter(Boolean).join(' + ')
  });
  H.updateProgress = state => {
    const states = ['DATE_SELECT', 'HORSE_SELECT', 'FOOD_SELECT', 'SUMMARY'];
    const index = states.indexOf(state === 'DATE_SUGGEST' ? 'DATE_SELECT' : state);
    const nav = screen('progress'); nav.hidden = index < 0; nav.replaceChildren();
    copy.progressLabels.forEach((label, i) => { const complete = i < index || (i === 0 && !!H.session.weekendId); const step = el('span', (complete ? '✓ ' : '') + label, complete ? 'complete' : i === index ? 'current' : ''); if (i === index) step.setAttribute('aria-current', 'step'); nav.append(step); });
  };
  function option(item, fn, radio = true) {
    const node = button('', () => fn(node), 'option');
    if (radio) { node.setAttribute('role', 'radio'); node.setAttribute('aria-checked', 'false'); }
    else node.setAttribute('aria-pressed', 'false');
    if (item.emoji) { const emoji = el('span', item.emoji, 'emoji'); emoji.setAttribute('aria-hidden', 'true'); if (C.horseOptions.includes(item)) emoji.dataset.horse = ''; node.append(emoji); }
    const content = el('span'); content.append(el('strong', item.label));
    if (item.tagline || item.sublabel) content.append(el('small', item.tagline || item.sublabel));
    const mark = el('span', '', 'mark'); mark.setAttribute('aria-hidden', 'true'); node.append(content, mark); return node;
  }
  function group(className, label, radio = true) { const node = el('div', undefined, 'options ' + (className || '')); node.setAttribute('role', radio ? 'radiogroup' : 'group'); node.setAttribute('aria-label', label); return node; }
  function recap(host, final = false) {
    const values = H.selectionLabels(), list = el('dl', undefined, 'recap');
    [[copy.summary.weekendLabel, values.weekendLabel], [final ? copy.finalConfirmation.horseExperienceLabel : copy.summary.horseLabel, values.horseLabel], [final ? copy.finalConfirmation.foodMissionLabel : copy.summary.foodLabel, values.foodLabelList]].forEach(([label, value]) => { const row = el('div'); row.append(el('dt', label), el('dd', value)); list.append(row); });
    host.append(list);
  }
  function intro() {
    const host = screen('INTRO'); host.replaceChildren();
    host.append(el('p', copy.intro.eyebrow, 'eyebrow'));
    const art = el('div', undefined, 'intro-art'); art.append(image(C.horseArt.idle, copy.alt.horse));
    host.append(heading(C.meta.missionTitle, 'h1'), art);
    const details = el('div', undefined, 'details'); [copy.intro.applicantLine, copy.intro.submittedByLine, copy.intro.missionLine].forEach(text => details.append(el('p', text))); host.append(details);
    host.append(el('p', copy.intro.body, 'intro-body'), button(copy.intro.ctaLabel, () => H.state.goTo('LOADING')));
  }
  function loading() {
    const host = screen('LOADING'); host.replaceChildren(heading(copy.loading.headline));
    const track = el('div', undefined, 'loading-track'), fill = el('div', undefined, 'loading-fill'); track.append(fill);
    const line = el('p', '', 'terminal'); line.setAttribute('aria-live', 'polite'); host.append(track, line);
    let repeat = false; try { repeat = !!sessionStorage.getItem('ha_intro_seen'); } catch (_) { /* Optional convenience only. */ }
    const finish = () => { line.textContent = copy.loading.ready; fill.style.transform = 'scaleX(1)'; try { sessionStorage.setItem('ha_intro_seen', '1'); } catch (_) {} later(() => H.state.goTo('DATE_SELECT'), T.loadingReadyMs); };
    if (repeat || H.reducedMotion) { later(finish, T.repeatLoadingMs); return; }
    copy.loading.messages.forEach((text, index) => later(() => { line.textContent = text; fill.style.transform = `scaleX(${(index + 1) / copy.loading.messages.length})`; }, index * T.loadingMessageIntervalMs));
    later(finish, copy.loading.messages.length * T.loadingMessageIntervalMs);
  }
  function acquireDate() {
    dateBusy = true;
    H.updateProgress(H.state.currentState);
    const host = screen('DATE_SELECT'); host.querySelectorAll('button,input').forEach(node => { node.disabled = true; });
    announce(host.querySelector('.reaction'), copy.date.acquiredLabel);
    H.MemePopup.show({ memeKey: 'dateSelected', caption: random(copy.date.reactions), onClose: () => later(() => H.state.goTo('HORSE_SELECT'), T.dateHoldMs) });
  }
  function dates(previous) {
    const host = screen('DATE_SELECT'); host.replaceChildren(heading(copy.date.question));
    const choices = group('', copy.date.question);
    C.weekends.forEach(item => choices.append(option(item, node => { if (dateBusy) return; H.session.weekendId = item.id; H.session.customWeekend = ''; setRadio(choices, node); acquireDate(); })));
    host.append(choices); reaction(host);
    host.append(button(copy.date.noneWorkLabel, () => { if (!dateBusy) H.state.goTo('DATE_SUGGEST'); }, 'text-button'));
    if (previous === 'DATE_SUGGEST') {
      if (H.session.weekendId === 'custom') { const custom = option({ label: H.session.customWeekend, sublabel: copy.customWeekendLabel }, () => {}); choices.append(custom); setRadio(choices, custom); }
      else setRadio(choices, choices.children[C.weekends.findIndex(x => x.id === H.session.weekendId)]);
      acquireDate();
    } else dateBusy = false;
  }
  function suggest() {
    const host = screen('DATE_SELECT'); host.querySelector('.text-button').hidden = true;
    const form = el('form', undefined, 'form'); form.append(el('p', copy.date.noneWorkResponse));
    const label = el('label', copy.date.suggestPrompt); label.htmlFor = 'custom-weekend';
    const input = el('input'); input.id = 'custom-weekend'; input.placeholder = copy.date.suggestPlaceholder; input.autocomplete = 'off';
    const nudge = el('p', '', 'reaction'); nudge.hidden = true; nudge.id = 'date-nudge'; nudge.setAttribute('role', 'status'); input.setAttribute('aria-describedby', nudge.id);
    const submit = button(copy.date.suggestSubmitLabel); submit.type = 'submit';
    form.append(label, input, nudge, submit); host.append(form);
    // Original cards remain a usable alternative while the counter-offer is expanded.
    host.querySelectorAll('[role=radio]').forEach((node, i) => { node.replaceWith(option(C.weekends[i], active => { H.session.weekendId = C.weekends[i].id; H.session.customWeekend = ''; H.state.goTo('DATE_SELECT'); })); });
    form.addEventListener('submit', event => { event.preventDefault(); if (!input.value.trim()) { announce(nudge, copy.dateNudge); input.focus(); return; } H.session.weekendId = 'custom'; H.session.customWeekend = input.value.trim(); H.state.goTo('DATE_SELECT'); });
  }
  function horses() {
    const host = screen('HORSE_SELECT'); host.replaceChildren(heading(copy.horse.question), el('p', copy.horse.helper)); let locked = false;
    const choices = group('horse-options', copy.horse.question);
    C.horseOptions.forEach(item => {
      const card = el('div');
      card.append(option(item, node => {
        if (locked) return; locked = true; H.session.horseExperience = item.id; setRadio(choices, node);
        announce(reaction(card), item.reaction);
        later(() => H.state.goTo('FOOD_SELECT'), T.reactionHoldMs);
      }));
      choices.append(card);
    });
    host.append(choices);
  }

  function foods() {
    const host = screen('FOOD_SELECT'); host.replaceChildren(heading(copy.food.title), el('p', copy.food.helper));
    const choices = group('food-options', copy.food.title, false); const selected = new Set(); let locked = false;
    const proceed = button(copy.continueLabel, () => {
      if (locked || !selected.size) return; locked = true; H.session.foodIds = [...selected]; proceed.disabled = true; choices.querySelectorAll('button').forEach(b => { b.disabled = true; });
      H.state.goTo('SUMMARY');
    }); proceed.disabled = true;
    const update = () => { const exclusive = C.foodOptions.find(x => x.exclusive && selected.has(x.id)); [...choices.children].forEach((node, i) => { node.setAttribute('aria-pressed', String(selected.has(C.foodOptions[i].id))); node.disabled = !!exclusive && C.foodOptions[i].id !== exclusive.id; }); proceed.disabled = selected.size === 0; };
    C.foodOptions.forEach(item => choices.append(option(item, () => { if (selected.has(item.id)) selected.delete(item.id); else { if (item.exclusive) selected.clear(); selected.add(item.id); } update(); }, false)));
    host.append(choices, proceed);
  }
  function summary() {
    const host = screen('SUMMARY'); host.replaceChildren(heading(copy.summary.title)); recap(host); host.append(el('p', copy.summary.probabilityLine));
    const approve = button(copy.summary.approveLabel, null, 'primary yes-button');
    const yesHome = el('div', undefined, 'yes-home'); yesHome.append(approve);
    H.yesButton.init(approve, () => { approve.disabled = true; approve.setAttribute('aria-disabled', 'true'); H.state.goTo('APPROVAL_SEQUENCE'); });
    const home = el('div', undefined, 'no-home'), no = button(copy.summary.declineLabel, null, 'secondary no-button'); home.append(no); host.append(yesHome, home);
    H.noButton.init(no, reaction(host));
  }
  let confetti;
  function approval() {
    H.reducedMotion = motion.matches; document.body.classList.add('approving');
    const host = screen('APPROVAL_SEQUENCE'); host.replaceChildren(heading(copy.approval.processingLabel));
    const live = el('p', copy.approvalAnnouncement, 'sr-only'); live.setAttribute('aria-live', 'polite'); host.append(live);
    const terminal = el('div', '', 'terminal'); terminal.setAttribute('aria-hidden', 'true'); host.append(terminal);
    const stamp = el('div', copy.approval.stampText, 'stamp'); stamp.hidden = true;
    const stage = el('div', undefined, 'horse-stage'); stage.hidden = true; stage.append(image(C.horseArt.run, copy.alt.run), image(C.horseArt.run, copy.alt.run));
    const summoned = el('p', copy.approval.summonedText, 'summoned'); summoned.hidden = true; host.append(stamp, stage, summoned);
    function horsesArrive() {
      stage.hidden = false; summoned.hidden = false;
      if (H.reducedMotion) return;
      confetti = el('div', undefined, 'confetti'); confetti.setAttribute('aria-hidden', 'true');
      for (let i = 0; i < C.presentation.confettiCount; i++) { const particle = el('i'); particle.style.left = `${Math.random() * 100}%`; particle.style.animationDelay = `${Math.random() * T.horseStaggerMs}ms`; particle.style.background = ['var(--accent)', 'var(--blue)', 'var(--ink)'][i % 3]; confetti.append(particle); }
      confetti.addEventListener('animationend', event => { event.target.remove(); if (!confetti?.children.length) confetti?.remove(); }); document.body.append(confetti);
    }

    if (H.reducedMotion) { terminal.textContent = copy.approval.terminalLines.join('\n'); stamp.hidden = false; horsesArrive(); later(() => H.state.goTo('FINAL_APPROVED'), T.approvalSequenceTotalTargetMsReduced); }
    else {
      copy.approval.terminalLines.forEach((line, i) => later(() => { terminal.textContent += line + '\n'; }, T.approvalTerminalStartMs + i * T.approvalTerminalIntervalMs));
      later(() => { stamp.hidden = false; terminal.hidden = true; host.classList.add('impact'); }, T.approvalStampAtMs);
      later(horsesArrive, T.approvalHorsesAtMs);
      later(() => H.state.goTo('FINAL_APPROVED'), T.approvalSequenceTotalTargetMs);
    }
  }
  function approved() {
    const host = screen('FINAL_APPROVED'); host.replaceChildren(heading(copy.finalConfirmation.title)); recap(host, true);
    const celebration = el('figure', undefined, 'approval-meme');
    const meme = el('img'); meme.src = C.memes.approved; meme.alt = copy.alt.meme;
    meme.addEventListener('error', () => meme.remove());
    celebration.append(meme); host.append(celebration);
    host.append(el('p', copy.finalConfirmation.statusHorses, 'status-badge'), el('p', copy.finalConfirmation.statusAndy, 'status-badge'), button(copy.finalConfirmation.shareLabel, () => H.share.shareResults('approved')));
  }
  function declined() {
    const host = screen('DECLINE_RESULT'); host.replaceChildren(heading(copy.decline.title), el('p', copy.decline.line1), image(C.horseArt.sad, copy.alt.sad, 'result-horse sad'), el('p', copy.decline.line2), el('p', copy.decline.line3), button(copy.decline.shareLabel, () => H.share.shareResults('declined')));
  }
  Object.entries({ INTRO: intro, LOADING: loading, DATE_SELECT: dates, DATE_SUGGEST: suggest, HORSE_SELECT: horses, FOOD_SELECT: foods, SUMMARY: summary, APPROVAL_SEQUENCE: approval, FINAL_APPROVED: approved, DECLINE_RESULT: declined }).forEach(([name, fn]) => { H.state.hooks[name] = { onEnter: fn }; });
  H.state.hooks.SUMMARY.onExit = () => { H.noButton.reset(); H.yesButton.reset(); };
  H.state.hooks.APPROVAL_SEQUENCE.onExit = () => { confetti?.remove(); confetti = null; document.body.classList.remove('approving'); screen('APPROVAL_SEQUENCE').classList.remove('impact'); };
  let backgrounded = false;
  document.addEventListener('visibilitychange', () => {
    if (H.state.currentState !== 'APPROVAL_SEQUENCE') return;
    if (document.hidden) backgrounded = true;
    else if (backgrounded) { backgrounded = false; H.state.goTo('FINAL_APPROVED'); }
  });
  document.title = C.meta.missionTitle;
  document.querySelectorAll('[data-copy]').forEach(node => { node.textContent = copy[node.dataset.copy]; });
  Object.entries({ '--fade': T.screenFadeMs, '--dodge': T.noButtonDodgeAnimMs, '--yes-dodge': T.yesButtonDodgeAnimMs, '--gallop': T.horseGallopMs, '--confetti': T.confettiDurationMs, '--stamp': T.stampImpactMs, '--horse-stagger': T.horseStaggerMs, '--sad-idle': T.sadIdleMs }).forEach(([key, value]) => document.documentElement.style.setProperty(key, `${value}ms`));
  H.easterEggs.init(); H.state.goTo('INTRO');
})(window.HA);
