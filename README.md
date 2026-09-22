# Houston Adventure Application

A buildless, mobile-first mission invitation from Andy to Lucy. Every screen, reaction, date, option, and share template is editable in `js/config.js`. No backend, accounts, tracking, external fonts, or runtime dependencies.

## Preview and edit

1. From this folder, run `python3 -m http.server 8765 --bind 127.0.0.1` and open `http://127.0.0.1:8765`. No install or build step. Stop the server with Ctrl+C. A different static server or VS Code Live Server also works.
2. Edit `js/config.js` to change `weekends`, `horseOptions`, `foodOptions`, `copy`, `shareTemplates`, or `timing`. The four configured October/November weekends need confirmation; confirm them before sending the invitation. Preserve IDs referenced by the configuration and code. All user-facing copy is here, including accessibility text and easter eggs.
3. Active reaction assets are `date-approved.png` and `mission-approved.png`; NO asset slots are `no-plea.png` and `no-paperwork.png` in `assets/memes/`. Both supplied NO assets are present: `no-plea.png` on attempt 3 and `no-paperwork.png` on attempt 4. Missing or failed images still skip gracefully. Old horse/food/numbered-NO images and `no-dramatic.png` remain unused. Update `CONFIG.memes` to replace an active asset; use real image files, not renamed extensions. Relative paths remain GitHub Pages-safe.
4. Date selection and the third/fourth NO activations show popups when their assets are available. Horse experience uses a brief inline status; food uses existing selection marks. The approval meme stays on the final result card. Missing popup images fall back to text.

## GitHub Pages, when ready

1. Commit the root files to your GitHub repository's `main` branch. Do not move them into a `dist` folder. Include the empty `.nojekyll` file.
2. Go to **Settings → Pages → Build and deployment → Deploy from a branch**.
3. Choose **main** and **/ (root)**, then **Save**. No Actions workflow or build command is required.
4. GitHub will display a URL in the form `https://<username>.github.io/<repository-name>/`.
5. At that real URL, click through both endings, including a custom date and the share fallback. Verify assets load from the repository subpath and their filename casing matches. Local testing does not replace this deployment check.

This version is intentionally local-only at Andy's request. Nothing has been pushed or published.

## Behavior and accessibility

- `state.js` owns the allowed transition map and clears screen timers on exit. `DATE_SUGGEST` is an inline sub-view of the date screen; `NO_DODGE` is a summary mode, not a separate screen.
- `app.js` owns the in-memory selections. Reloading restarts the invitation. The only storage access is the optional `sessionStorage.ha_intro_seen` flag; denied storage access is caught. Easter-egg counters and idle guards live in memory.
- Radio cards support Tab then Enter/Space. Focus moves to each new heading. Food choices use toggle buttons; an exclusive choice disables the others until deselected.
- The APPROVE button slides once within its row on a pointer tap; the next tap approves. Rapid taps during the slide are ignored. Keyboard and reduced-motion activation approve immediately.
- Pointer NO activation uses four attempts: two safe relocations with inline captions, then the plea popup on attempt 3 and a final relocation with the paperwork popup on attempt 4. Dismissing the second popup settles the button; the fifth activation declines immediately. Candidates stay inside the visual viewport and safe-area margins and avoid other controls. If no safe space is available, it stays in flow. Resize/scroll returns it to its normal location. Keyboard and assistive-technology clicks (`event.detail === 0`) decline immediately. Reduced-motion pointer taps keep the same four attempts without moving the button.
- The approval beats overlap to meet the overall runtime: approximately 3.9 seconds normally, 1.45 seconds with reduced motion. The reduced version presents the log, stamp, and horses statically. On returning from a backgrounded approval, the final screen appears immediately.
- Sharing invokes native `navigator.share({text})` directly from the click. Cancellation does nothing. Other failures try Clipboard, then legacy copy, then a visible selectable textarea. Some browsers consume user activation after a native-share rejection, so the final manual-copy route is always available.
- The popup is a temporary status region, not a focus-trapping dialog. Replacement and screen exits cancel stale callbacks. Videos do not autoplay under reduced motion.
- Easter eggs: five horse taps (no gap over three seconds), seven title taps, a console message, one idle peek per eligible screen visit, and rotating footer status text.

## Validation

Local Chrome was exercised with emulated Android touch input through approval and decline, including custom date entry, empty-date feedback, exclusive food selection, and the capped NO sequence. Normal approval completed in about 4.6 seconds including automation overhead; no JavaScript page errors occurred. Additional local checks passed for keyboard-only completion, reduced-motion taps and approval (under two seconds), 320px layout, 200% text, blocked storage, missing meme assets, mocked native sharing and cancellation, Clipboard and manual-copy fallbacks, title/horse/idle easter eggs, and backgrounded approval recovery. No external requests were observed. Text color pairs measured at least 4.5:1 contrast. A Chrome Slow 4G profile (1.6 Mbps down, 150ms latency) with 4× CPU throttling reached an interactive intro in 878ms locally. These are emulation results, not real-device measurements.

Real Android hardware, Instagram's embedded browser, iOS Safari, and GitHub Pages have not been tested. Web Share behavior is feature-detected; mocked checks cannot certify a real device's native share sheet. Test those environments before sending the final invitation.

### September 21 modification

Horse difficulty is now prior horse experience, including summary and share text. Houston food choices are Viet-Cajun, Asiatown Food Crawl, Texas BBQ, and the existing exclusive Lucy Chooses option. DATE is marked complete immediately on selection, including a valid counter-offer. Approval results use a 35svh image cap and tighter spacing without reducing touch targets.

The previous NO mapping explicitly selected `noAttempt1` for both first and second activations; it was not a double increment. Named states 0–4 now own progression independently of assets. The latest prompt adds distinct plea/paperwork asset slots; neither is generated or substituted with a numbered image.

See [MODIFICATION-NOTES.md](MODIFICATION-NOTES.md) for the inspection map and current validation results. The earlier Validation section records the original build's checks, not a rerun of every original scenario.
