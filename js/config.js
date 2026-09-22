window.HA = window.HA || {};
HA.CONFIG = {
  meta: {
    applicant: "Lucy",
    submittedBy: "Andy",
    missionTitle: "HOUSTON ADVENTURE APPLICATION",
    missionSubtitle: "Mission: Horses + Food + Questionable Decision Making",
    andyReceiverLabel: "Andy" // used in share text / final screen
  },

  // Weekend options confirmed by Andy.
  weekends: [
    { id: "wk1", label: "Oct 10-11", sublabel: "Weekend 1" },
    { id: "wk2", label: "Oct 17-18", sublabel: "Weekend 2" },
    { id: "wk3", label: "Oct 24-25", sublabel: "Weekend 3" },
    { id: "wk4", label: "Nov 14-15", sublabel: "Weekend 4"}
  ],

  horseOptions: [
    { id: "firstTimer", emoji: "🐴", label: "FIRST TIMER", summaryLabel: "First Timer", tagline: "I have no idea what I'm doing.", reaction: "HORSE DEPARTMENT NOTIFIED" },
    { id: "riddenBefore", emoji: "🐎", label: "RIDDEN BEFORE", summaryLabel: "Ridden Before", tagline: "I possess previous horse-related experience.", reaction: "PREVIOUS EXPERIENCE DETECTED" },
    { id: "professional", emoji: "🏇", label: "BASICALLY A PROFESSIONAL*", summaryLabel: "Basically a Professional", tagline: "*Citation needed.", reaction: "CLAIM PENDING VERIFICATION" }
  ],

  foodOptions: [
    { id: "vietCajun", label: "VIET-CAJUN", emoji: "🦞", tagline: "Houston assignment. We should probably do this." },
    { id: "asiatown", label: "ASIATOWN FOOD CRAWL", emoji: "🍜", tagline: "Multiple stops. Poor financial discipline." },
    { id: "bbq", label: "TEXAS BBQ", emoji: "🥩", tagline: "We came to Texas. Seems legally required." },
    { id: "lucyChooses", label: "LUCY CHOOSES", emoji: "🎯", tagline: "I surrender all food-related authority.", exclusive: true }
  ],

  copy: {
    intro: {
      eyebrow: "OFFICIAL DOCUMENT · DO NOT IGNORE",
      applicantLine: "Applicant: Lucy",
      submittedByLine: "Submitted by: Andy",
      missionLine: "Mission: Horses + Food + Questionable Decision Making",
      body: "Your presence has been requested for one (1) unnecessarily elaborate Houston adventure.",
      ctaLabel: "BEGIN APPLICATION"
    },
    loading: {
      headline: "Preparing unnecessarily complicated solution to a problem that could have been one text message…",
      messages: [
        "Consulting the horses…",
        "Checking Houston temperature…",
        "Performing risk assessment…",
        "Ignoring risk assessment…",
        "Asking ChatGPT if this is a bad idea…",
        "Proceeding anyway."
      ],
      ready: "Application system ready."
    },
    date: {
      question: "When should this questionable decision occur?",
      noneWorkLabel: "None of these work 😭",
      noneWorkResponse: "Understandable. The scheduling department has failed us.",
      suggestPrompt: "Counter-propose a weekend:",
      suggestPlaceholder: "e.g. Nov 7–8",
      suggestSubmitLabel: "Submit counter-offer",
      acquiredLabel: "DATE ACQUIRED",
      reactions: ["LET'S GOOOO", "Mission calendar updated.", "Andy's PTO balance has entered the chat."]
    },
    horse: {
      question: "EQUINE PERSONNEL ASSESSMENT",
      helper: "How much prior horse-related experience are we working with?"
    },
    food: {
      title: "POST-HORSE RECOVERY PROTOCOL",
      helper: "Select all required recovery procedures."
    },
    summary: {
      title: "MISSION PARAMETERS",
      weekendLabel: "Weekend",
      horseLabel: "Horse Experience",
      foodLabel: "Food",
      probabilityLine: "Estimated success probability: suspiciously high.",
      approveLabel: "APPROVE MISSION 🐴",
      declineLabel: "NO"
    },
    noSequence: {
      firstCaption: "REQUEST FAILED SUCCESSFULLY.",
      secondCaption: "Interesting choice.",
      pleaMeme: { key: "noPlea", caption: "The horses have already been notified." },
      paperworkMeme: { key: "noPaperwork", caption: "This is now a paperwork problem." },
      settledButtonLabel: "DECLINE MISSION",
      settledLabel: "Okay fine. You may actually say no."
    },
    decline: {
      title: "MISSION DENIED",
      line1: "The horses have been notified.",
      line2: "Houston Adventure Department respects your decision.",
      line3: "No hard feelings.",
      shareLabel: "SEND ANDY THE RESULTS"
    },
    approval: {
      processingLabel: "PROCESSING APPLICATION…",
      terminalLines: [
        "Validating Lucy…",
        "Checking horse inventory…",
        "Securing snacks…",
        "Evaluating questionable decisions…",
        "Contacting Houston Adventure Department…",
        "Result received."
      ],
      stampText: "APPROVED",
      summonedText: "THE HORSES HAVE BEEN SUMMONED",
      celebrationCaptionOptions: ["Andy right now:", "Live footage from California:"]
    },
    finalConfirmation: {
      title: "MISSION APPROVED 🐴",
      subtitle: "Houston Adventure",
      horseExperienceLabel: "Horse Experience",
      foodMissionLabel: "Food Mission",
      statusHorses: "HORSES: SUMMONED",
      statusAndy: "ANDY: INVESTIGATING FLIGHTS",
      shareLabel: "SEND ANDY THE RESULTS"
    },
    shareCopiedFallback: "Copied. Deliver mission results to Andy 🫡"
  },

  // See §13 for the templating function that fills these
  shareTemplates: {
    approved: "Houston Adventure approved 🐴\n\n📅 {weekendLabel}\n🐴 Horse Experience: {horseLabel}\n🍜 Food: {foodLabelList}\n\nThe horses have been summoned.",
    declined: "Houston Adventure: mission denied 😂\n\nThe horses have been notified. No hard feelings."
  },

  timing: {
    // all values ms; a `Reduced` sibling value is used instead when prefers-reduced-motion is set (§10)
    loadingMessageIntervalMs: 650,
    loadingMessageIntervalMsReduced: 0, // reduced motion: skip straight to "ready" after one short pause
    memePopupDurationMs: 4500,
    memePopupDurationMsReduced: 4500,
    noButtonDodgeAnimMs: 220,
    stampImpactMs: 500,
    stampImpactMsReduced: 0,
    horseGallopMs: 1400,
    horseGallopMsReduced: 0,
    confettiDurationMs: 1800,
    confettiDurationMsReduced: 0,
    approvalSequenceTotalTargetMs: 3900, // §5 says 3-5s end-to-end; tune terminalLines cadence to hit this
    idleEasterEggMs: 45000 // §14 "u still there?" horse peek
  },

  // §9 meme map — keys referenced from copy/logic above and from screen code.
  // Every value is a relative path under assets/memes/. Missing file = component fails silently (§9, §15).
  memes: {
    dateSelected: "assets/memes/date-approved.png",
    // Asset slots: missing images skip the NO popup and preserve progression.
    noPlea: "assets/memes/no-plea.png",
    noPaperwork: "assets/memes/no-paperwork.png",
    approved: "assets/memes/mission-approved.png"
  },

  horseArt: {
    run: "assets/horses/horse-run.svg",
    sad: "assets/horses/sad-horse.svg",
    idle: "assets/horses/horse-idle.svg",
    peek: "assets/horses/horse-peek.svg"
  }
};

// Additional presentation copy and timing stay here, alongside the copy of record.
Object.assign(HA.CONFIG.copy, {
  department: 'HOUSTON ADVENTURE DEPT.', fileNumber: 'FIELD OFFICE / TX',
  documentNumber: 'FORM HA–001', classification: 'HIGHLY UNNECESSARY',
  issue: 'PERSONNEL REQUEST', footer: 'NO ACTUAL PAPERWORK WAS NECESSARY.',
  foodReaction: 'Refueling plans secured.', continueLabel: 'CONTINUE', customWeekendLabel: 'Counter-offer', progressLabels: ['DATE', 'HORSE', 'FOOD', 'APPROVAL'],
  dateNudge: 'Type something, Houston Adventure Dept. needs a date.',
  copyInstruction: 'Copy this and send it to Andy', selectAll: 'SELECT ALL',
  approvalAnnouncement: 'Processing application. Approved. The horses have been summoned.',
  alt: { horse: 'Original illustration of a standing horse', run: 'Cartoon horse galloping', sad: 'Cartoon horse with drooped ears', peek: 'A curious horse peeking in', meme: 'Reaction meme' },
  easterEggs: { horse: 'Please stop harassing the employee.', idle: 'u still there?', console: 'Lucy why are you inspecting my questionable engineering decisions 🤨' },
  systemStatusLines: ['Horse API: operational', 'Andy confidence level: fluctuating', 'Houston temperature: probably disrespectful']
});
Object.assign(HA.CONFIG.timing, {
  repeatLoadingMs: 400, loadingReadyMs: 600, dateHoldMs: 600, reactionHoldMs: 180,
  yesButtonDodgeAnimMs: 220, memeLoadTimeoutMs: 8000,
  noCaptionMs: 1500, copyToastMs: 2500, eggTapWindowMs: 3000, eggCaptionMs: 2000,
  eggPeekMs: 3000, statusIntervalMs: 8000, screenFadeMs: 220, touchFeedbackMs: 80,
  approvalSequenceTotalTargetMsReduced: 1450, approvalStampAtMs: 1400,
  approvalHorsesAtMs: 1900, approvalMemeAtMs: 2600, approvalTerminalStartMs: 300,
  approvalTerminalIntervalMs: 180, horseStaggerMs: 150, sadIdleMs: 4000
});
HA.CONFIG.presentation = { noMargin: 16, confettiCount: 32, horseTapCount: 5, titleTapCount: 7 };
