const heading = document.getElementById('dynamic-heading') as HTMLElement | null;
const collapsibleSpans = document.querySelectorAll('#dynamic-heading .collapsible') as NodeListOf<HTMLElement>;
const gGreat = document.getElementById('g-great') as HTMLElement | null;
const initialLetterSpans = document.querySelectorAll('.initial-letter') as NodeListOf<HTMLElement>;
const megaMissionStatement = document.getElementById('mega-mission-statement') as HTMLElement | null;
// const initialE = document.getElementById('initial-e') as HTMLElement | null; // Reverted
// const collapsibleArth = document.getElementById('collapsible-arth') as HTMLElement | null; // Reverted

const INITIAL_LETTER_BOLDNESS_OFFSET = 100;
const COLLAPSIBLE_MAX_WIDTH_PX = 500;

// Background Color Animation Config
const BG_COLOR_HUE = 237;
const BG_COLOR_LIGHTNESS = 54;
const BG_COLOR_START_SATURATION = 10;
const BG_COLOR_END_SATURATION = 94;

// Configuration for IBM Plex Sans font animation
const FONT_VARIATION_CONFIG = {
  wght: { min: 300, max: 700, default: 300 }, // Weight for IBM Plex Sans
  wdth: { min: 75, max: 100, default: 100 },   // Width for IBM Plex Sans
  ital: { off: 0, on: 1 }                      // Italic state for IBM Plex Sans
};

// FONT_SIZE_CONFIG will now use vw units for Phase 1
const FONT_SIZE_CONFIG = { min: 2.5, max: 7, unit: 'vw' }; // Increased max from 5vw to 7vw

// Pulse Animation Config - Reverted
// const PULSE_FREQUENCY_HZ = 0.75;
// const PULSE_MAGNITUDE = 0.025;
// let pulseStartTime: number | null = null;

// function animatePulse(timestamp: number) { // Reverted
//   // ... (pulse animation logic was here) ...
//   requestAnimationFrame(animatePulse);
// }

// Start the pulse animation - Reverted
// requestAnimationFrame(animatePulse);

// Phase 2 Animation Config
const MEGA_FINAL_TOP_PX = 20;
// MEGA_FINAL_FONT_SIZE will remain in EM for stability of the final logo
const MEGA_FINAL_FONT_SIZE_EM = 2; // e.g., 2em relative to body
// const MISSION_STATEMENT_FINAL_BOTTOM_PX = 40; // No longer used

// Mobile specific final state for MEGA heading
const MEGA_FINAL_TOP_PX_MOBILE = 10;
const MEGA_FINAL_FONT_SIZE_EM_MOBILE = 1.5; // e.g., 1.5em relative to body

// Mission Statement Animation Config
const MISSION_REVEAL_START_OFFSET_FROM_PHASE2_START = 0.0; // Starts when Phase 2 scroll is 0% complete (changed from 0.1)
const MISSION_REVEAL_DURATION_FACTOR = 1.0; // Takes 1.0 * onePhaseScrollHeight to animate fully

// h1Phase1EndFontSize will store the computed vw value at the end of phase 1, 
// but the transition to MEGA_FINAL_FONT_SIZE_EM will need care.
// For simplicity, let's make h1Phase1EndFontSize also target an EM value for a smoother transition to the final EM state.
// OR, the transition in phase 2 will be from a calculated VW to a fixed EM.
// Let's try the VW to EM transition first.
let h1Phase1EndFontSizeValue = FONT_SIZE_CONFIG.max; // This will store the numeric VW value at the end of Phase 1

let h1InitialTransform = "translateY(-50%) translateZ(0px)";

window.addEventListener('scroll', () => {
  if (!heading) return;

  // Define FONT_SWITCH constants here to be accessible for currentWidth calculation
  const FONT_SWITCH_START = 0.48;
  const FONT_SWITCH_MID = 0.50;
  const FONT_SWITCH_END = 0.52;

  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const onePhaseScrollHeight = window.innerHeight;
  const isMobile = window.innerWidth <= 768;

  let phase1Progress = 0;
  let phase2Progress = 0;
  let phase3Progress = 0;
  let missionRevealProgress = 0;

  if (scrollTop < onePhaseScrollHeight) {
    phase1Progress = scrollTop / onePhaseScrollHeight;
  } else if (scrollTop < 2 * onePhaseScrollHeight) {
    phase1Progress = 1;
    phase2Progress = (scrollTop - onePhaseScrollHeight) / onePhaseScrollHeight;
  } else {
    phase1Progress = 1;
    phase2Progress = 1;
  }
  phase1Progress = Math.min(phase1Progress, 1);
  phase2Progress = Math.min(phase2Progress, 1);

  // Calculate missionRevealProgress
  const missionRevealStartScrollTop = onePhaseScrollHeight + (MISSION_REVEAL_START_OFFSET_FROM_PHASE2_START * onePhaseScrollHeight);
  const missionRevealDurationScroll = MISSION_REVEAL_DURATION_FACTOR * onePhaseScrollHeight;

  if (scrollTop >= missionRevealStartScrollTop) {
    missionRevealProgress = Math.min((scrollTop - missionRevealStartScrollTop) / missionRevealDurationScroll, 1);
  } else {
    missionRevealProgress = 0;
  }

  const currentMegaFinalTopPx = isMobile ? MEGA_FINAL_TOP_PX_MOBILE : MEGA_FINAL_TOP_PX;
  // This is now EM for the final MEGA logo state
  const currentMegaFinalFontSizeEmValue = isMobile ? MEGA_FINAL_FONT_SIZE_EM_MOBILE : MEGA_FINAL_FONT_SIZE_EM;

  // --- Phase 1 related calculations ---
  let baseWeight = FONT_VARIATION_CONFIG.wght.min + phase1Progress * (FONT_VARIATION_CONFIG.wght.max - FONT_VARIATION_CONFIG.wght.min);
  baseWeight = Math.round(baseWeight);
  baseWeight = Math.max(FONT_VARIATION_CONFIG.wght.min, Math.min(FONT_VARIATION_CONFIG.wght.max, baseWeight));
  
  // let currentWidth = FONT_VARIATION_CONFIG.wdth.min + phase1Progress * (FONT_VARIATION_CONFIG.wdth.max - FONT_VARIATION_CONFIG.wdth.min); // Old logic: min to max
  // New logic for wdth: max to min for the segment after font switch
  let currentWidth;
  const progressAfterSwitch = (phase1Progress - FONT_SWITCH_END) / (1 - FONT_SWITCH_END);
  if (phase1Progress >= FONT_SWITCH_END) {
    currentWidth = FONT_VARIATION_CONFIG.wdth.max - progressAfterSwitch * (FONT_VARIATION_CONFIG.wdth.max - FONT_VARIATION_CONFIG.wdth.min);
  } else {
    // Before FONT_SWITCH_END, IBM Plex Sans is only briefly visible during fade-in, 
    // at its FONT_VARIATION_CONFIG.wdth.min. Let's ensure currentWidth has a sensible default for that.
    currentWidth = FONT_VARIATION_CONFIG.wdth.min; 
  }
  currentWidth = Math.round(currentWidth);
  currentWidth = Math.max(FONT_VARIATION_CONFIG.wdth.min, Math.min(FONT_VARIATION_CONFIG.wdth.max, currentWidth));

  // h1CurrentFontSizeForPhase1 will be in VW units
  let h1CurrentFontSizeForPhase1 = FONT_SIZE_CONFIG.min + phase1Progress * (FONT_SIZE_CONFIG.max - FONT_SIZE_CONFIG.min);
  h1CurrentFontSizeForPhase1 = Math.round(h1CurrentFontSizeForPhase1 * 100) / 100; // Keep precision for vw
  
  document.body.style.backgroundColor = `hsl(${BG_COLOR_HUE}, ${BG_COLOR_START_SATURATION + phase1Progress * (BG_COLOR_END_SATURATION - BG_COLOR_LIGHTNESS)}%, ${BG_COLOR_LIGHTNESS}%)`;

  // --- Apply styles to H1 (MEGA heading) ---
  if (phase2Progress < 1) { 
    if (phase2Progress === 0) { // Purely Phase 1: Font size in VW
      heading.style.top = '50%';
      heading.style.transform = h1InitialTransform;
      heading.style.fontSize = `${h1CurrentFontSizeForPhase1}${FONT_SIZE_CONFIG.unit}`;
      // heading.style.fontWeight = baseWeight.toString(); // Replaced by class or font-variation-settings

      let currentOpacity = 1;
      // let targetFontFamily = '"Tinos", serif'; // Not needed, class driven for Serif
      // let targetFontStyle = 'normal'; // Not needed, class driven for Serif or FVS for Sans

      // Clear existing Plex classes and settings before applying new ones
      heading.classList.remove('ibm-plex-serif-light', 'ibm-plex-serif-regular'); // Add other serif classes if used
      heading.style.fontVariationSettings = '';
      heading.style.fontFamily = ''; // Clear explicit font family to let CSS or new setting take over

      if (phase1Progress >= FONT_SWITCH_START && phase1Progress < FONT_SWITCH_MID) {
        const fadeOutProgress = (phase1Progress - FONT_SWITCH_START) / (FONT_SWITCH_MID - FONT_SWITCH_START);
        currentOpacity = 1 - fadeOutProgress;
        heading.classList.add('ibm-plex-serif-light'); // Or the appropriate base Serif weight
        heading.style.fontStyle = 'normal'; // Ensure normal style for Serif during fade-out
        // Initial letters should also be serif and boldened
        initialLetterSpans.forEach(span => {
          span.classList.remove('ibm-plex-serif-medium'); // remove any previous one
          span.classList.add('ibm-plex-serif-medium'); // apply correct one for serif
          span.style.fontVariationSettings = '';
          span.style.fontStyle = 'normal'; // Ensure normal style for initial letters in Serif
        });
      } else if (phase1Progress >= FONT_SWITCH_MID && phase1Progress < FONT_SWITCH_END) {
        const fadeInProgress = (phase1Progress - FONT_SWITCH_MID) / (FONT_SWITCH_END - FONT_SWITCH_MID);
        currentOpacity = fadeInProgress;
        heading.style.fontFamily = '"IBM Plex Sans", sans-serif';
        heading.style.fontVariationSettings = `"wght" ${FONT_VARIATION_CONFIG.wght.min}, "wdth" ${FONT_VARIATION_CONFIG.wdth.min}, "ital" ${FONT_VARIATION_CONFIG.ital.on}`;
        heading.style.fontStyle = 'italic'; // Ensure italic style for Sans
        // Initial letters switch to Sans with offset
        initialLetterSpans.forEach(span => {
          span.classList.remove('ibm-plex-serif-medium');
          const initialLetterWeight = Math.min(FONT_VARIATION_CONFIG.wght.max + INITIAL_LETTER_BOLDNESS_OFFSET, 700); // Cap at max font weight
          span.style.fontVariationSettings = `"wght" ${initialLetterWeight}, "wdth" ${FONT_VARIATION_CONFIG.wdth.min}, "ital" ${FONT_VARIATION_CONFIG.ital.on}`;
          span.style.fontStyle = 'italic'; // Ensure italic for initial letters in Sans
        });
      } else if (phase1Progress >= FONT_SWITCH_END) {
        currentOpacity = 1;
        heading.style.fontFamily = '"IBM Plex Sans", sans-serif';
        // baseWeight is already calculated based on overall phase1Progress for wght animation 300->700
        // currentWidth is now calculated to go 100->75 for the segment FONT_SWITCH_END to 1.0
        heading.style.fontVariationSettings = `"wght" ${baseWeight}, "wdth" ${currentWidth}, "ital" ${FONT_VARIATION_CONFIG.ital.on}`;
        heading.style.fontStyle = 'italic'; // Ensure italic style for Sans
        // Initial letters are Sans with offset
        initialLetterSpans.forEach(span => {
          span.classList.remove('ibm-plex-serif-medium');
          const initialLetterWeight = Math.min(baseWeight + INITIAL_LETTER_BOLDNESS_OFFSET, 700);
          span.style.fontVariationSettings = `"wght" ${initialLetterWeight}, "wdth" ${currentWidth}, "ital" ${FONT_VARIATION_CONFIG.ital.on}`;
          span.style.fontStyle = 'italic'; // Ensure italic for initial letters in Sans
        });
      } else { // phase1Progress < FONT_SWITCH_START
        currentOpacity = 1;
        heading.classList.add('ibm-plex-serif-light'); // Or the appropriate base Serif weight
        heading.style.fontStyle = 'normal'; // Ensure normal style for Serif via class or explicit
        // Initial letters are serif and boldened
        initialLetterSpans.forEach(span => {
          span.classList.remove('ibm-plex-serif-medium');
          span.classList.add('ibm-plex-serif-medium');
          span.style.fontVariationSettings = '';
          span.style.fontStyle = 'normal'; // Ensure normal style for initial letters in Serif
        });
      }

      heading.style.opacity = Math.max(0, Math.min(1, currentOpacity)).toString();
      // heading.style.fontFamily = targetFontFamily; // Handled by class or direct set
      // heading.style.fontStyle = targetFontStyle; // Handled by class or FVS

      if (phase1Progress === 1) { // This check is for when MEGA is fully formed
        heading.classList.remove('ibm-plex-serif-light', 'ibm-plex-serif-regular');
        heading.style.fontFamily = '"IBM Plex Sans", sans-serif'; 
        heading.style.fontVariationSettings = `"wght" ${FONT_VARIATION_CONFIG.wght.max}, "wdth" ${FONT_VARIATION_CONFIG.wdth.min}, "ital" ${FONT_VARIATION_CONFIG.ital.on}`;
        heading.style.fontStyle = 'italic'; // Ensure italic
        heading.style.opacity = '1'; 
        h1Phase1EndFontSizeValue = h1CurrentFontSizeForPhase1; 
        initialLetterSpans.forEach(span => {
            span.classList.remove('ibm-plex-serif-medium');
            const initialLetterWeight = Math.min(FONT_VARIATION_CONFIG.wght.max + INITIAL_LETTER_BOLDNESS_OFFSET, 700);
            span.style.fontVariationSettings = `"wght" ${initialLetterWeight}, "wdth" ${FONT_VARIATION_CONFIG.wdth.min}, "ital" ${FONT_VARIATION_CONFIG.ital.on}`;
            span.style.fontStyle = 'italic'; // Ensure italic for initial letters in Sans
        });
      }
    } else { // In Phase 2 (MEGA moving to top)
      heading.classList.remove('ibm-plex-serif-light', 'ibm-plex-serif-regular');
      const h1StartTopForPhase2 = window.innerHeight / 2;
      const targetTopPx = h1StartTopForPhase2 - (h1StartTopForPhase2 - currentMegaFinalTopPx) * phase2Progress;
      const targetYTranslatePercent = -50 * (1 - phase2Progress);

      const initialPhase2SizeMultiplier = 2.5; 
      const currentSizeMultiplier = initialPhase2SizeMultiplier * (1 - phase2Progress) + 1.0 * phase2Progress;
      heading.style.fontSize = `${currentMegaFinalFontSizeEmValue * currentSizeMultiplier}em`;

      heading.style.top = `${targetTopPx}px`;
      heading.style.transform = `translateY(${targetYTranslatePercent}%) translateZ(0px)`;
      heading.style.fontFamily = '"IBM Plex Sans", sans-serif'; 
      heading.style.fontVariationSettings = `"wght" ${FONT_VARIATION_CONFIG.wght.max}, "wdth" ${FONT_VARIATION_CONFIG.wdth.min}, "ital" ${FONT_VARIATION_CONFIG.ital.on}`;
      heading.style.fontStyle = 'italic'; // Ensure italic
      heading.style.opacity = '1'; 
      initialLetterSpans.forEach(span => {
        span.classList.remove('ibm-plex-serif-medium');
        const initialLetterWeight = Math.min(FONT_VARIATION_CONFIG.wght.max + INITIAL_LETTER_BOLDNESS_OFFSET, 700);
        span.style.fontVariationSettings = `"wght" ${initialLetterWeight}, "wdth" ${FONT_VARIATION_CONFIG.wdth.min}, "ital" ${FONT_VARIATION_CONFIG.ital.on}`;
        span.style.fontStyle = 'italic'; // Ensure italic for initial letters in Sans
      });
    }
  } else { // Phase 2 completed, MEGA is at top-center. Font size is EM.
    heading.classList.remove('ibm-plex-serif-light', 'ibm-plex-serif-regular');
    heading.style.top = `${currentMegaFinalTopPx}px`;
    heading.style.fontSize = `${currentMegaFinalFontSizeEmValue}em`;
    heading.style.transform = `translateY(0%) translateZ(0px)`;
    heading.style.fontFamily = '"IBM Plex Sans", sans-serif';
    heading.style.fontVariationSettings = `"wght" ${FONT_VARIATION_CONFIG.wght.max}, "wdth" ${FONT_VARIATION_CONFIG.wdth.min}, "ital" ${FONT_VARIATION_CONFIG.ital.on}`;
    heading.style.fontStyle = 'italic'; // Ensure italic
    heading.style.opacity = '1';
    heading.classList.remove('mega-top-right-mobile'); 
    initialLetterSpans.forEach(span => {
        span.classList.remove('ibm-plex-serif-medium');
        const initialLetterWeight = Math.min(FONT_VARIATION_CONFIG.wght.max + INITIAL_LETTER_BOLDNESS_OFFSET, 700);
        span.style.fontVariationSettings = `"wght" ${initialLetterWeight}, "wdth" ${FONT_VARIATION_CONFIG.wdth.min}, "ital" ${FONT_VARIATION_CONFIG.ital.on}`;
        span.style.fontStyle = 'italic'; // Ensure italic for initial letters in Sans
    });
  }

  // --- Styles for child elements of H1 (always based on phase1Progress or its end state) ---
  initialLetterSpans.forEach(span => {
    const initialLetterWeight = Math.min(900, baseWeight + INITIAL_LETTER_BOLDNESS_OFFSET);
    span.style.fontWeight = initialLetterWeight.toString();
  });

  if (gGreat) {
    gGreat.style.transform = 'none';
  }

  collapsibleSpans.forEach(span => {
    const shrinkProgress = phase1Progress;
    
    const currentOpacity = 1 - shrinkProgress;
    const currentFontSizeMultiplier = 1 - shrinkProgress;
    const currentMaxWidth = COLLAPSIBLE_MAX_WIDTH_PX * (1 - shrinkProgress);

    span.style.opacity = Math.max(0, currentOpacity).toString();
    span.style.maxWidth = `${Math.max(0, currentMaxWidth)}px`;
    span.style.fontSize = `${Math.max(0, currentFontSizeMultiplier)}em`;

    if (currentFontSizeMultiplier < 0.01 || currentOpacity < 0.01 || currentMaxWidth < 1) {
      span.style.display = 'none';
    } else {
      span.style.display = 'inline-block';
    }
  });

  // --- Mission Statement Animation (now driven by missionRevealProgress) ---
  if (megaMissionStatement) {
    if (missionRevealProgress > 0) {
      const initialTopVh = 150; // Start from 150vh (off-screen bottom)
      const finalTopVh = 50;    // End at 50vh (screen center)

      const currentTopVh = initialTopVh * (1 - missionRevealProgress) + finalTopVh * missionRevealProgress;
      const currentTranslateYPercent = -50 * missionRevealProgress; // Animate from 0% to -50%

      megaMissionStatement.style.top = `${currentTopVh}vh`;
      megaMissionStatement.style.transform = `translateY(${currentTranslateYPercent}%)`;
      megaMissionStatement.style.opacity = missionRevealProgress.toString();
      megaMissionStatement.style.width = '100%'; 

    } else { 
      megaMissionStatement.style.opacity = '0';
      megaMissionStatement.style.top = '150vh'; // Initial off-screen position
      megaMissionStatement.style.transform = 'translateY(0%)'; // Initial transform
      megaMissionStatement.style.width = '100%';
    }
  }
});

// Initial state setup
if (heading) {
  const computedTransform = getComputedStyle(heading).transform;
  if (computedTransform && computedTransform !== 'none') {
    h1InitialTransform = computedTransform;
  }
  h1Phase1EndFontSizeValue = FONT_SIZE_CONFIG.max; // Store the max VW value as the end of phase 1 default
  document.body.style.backgroundColor = `hsl(${BG_COLOR_HUE}, ${BG_COLOR_START_SATURATION}%, ${BG_COLOR_LIGHTNESS}%)`;
  heading.style.top = '50%';
  heading.style.transform = h1InitialTransform;
  heading.style.fontSize = `${FONT_SIZE_CONFIG.min}${FONT_SIZE_CONFIG.unit}`;
  
  // Initial style for h1 (IBM Plex Serif)
  heading.classList.add('ibm-plex-serif-light'); // Example: light weight for initial Plex Serif
  heading.style.fontFamily = ''; // Allow class to dictate font family for Serif
  heading.style.fontStyle = ''; // Remove direct styles
  heading.style.fontWeight = ''; // Remove direct styles
  heading.style.fontVariationSettings = ''; // Clear any potential variation settings

  heading.style.opacity = '1'; // Initial opacity is 1
  heading.classList.remove('mega-top-right-mobile'); // Ensure class is not present initially

  initialLetterSpans.forEach(span => {
    // For IBM Plex Serif, apply a bolder class. If base is light (300), medium (500) could be +200.
    // This needs to be coordinated with the actual class applied to the heading.
    // Assuming heading starts with ibm-plex-serif-light, initial letters could be ibm-plex-serif-medium.
    // This is a simplification; direct wght manipulation is easier with variable fonts.
    // For now, let's assume a fixed bolder class for initial letters in Serif mode.
    span.classList.add('ibm-plex-serif-medium'); 
    span.style.fontWeight = ''; // Rely on class
    span.style.fontVariationSettings = ''; // Clear settings if any
  });
  if (gGreat) {
    gGreat.style.transform = 'none';
  }
  if (megaMissionStatement) {
    megaMissionStatement.style.opacity = '0';
    megaMissionStatement.style.top = '150vh'; // Initial off-screen position
    megaMissionStatement.style.transform = 'translateY(0%)'; // Initial transform
    megaMissionStatement.style.width = '100%'; // Initial width is full
  }
  collapsibleSpans.forEach(span => {
    span.style.opacity = '1';
    span.style.maxWidth = `${COLLAPSIBLE_MAX_WIDTH_PX}px`;
    span.style.fontSize = '1em';
    span.style.display = 'inline-block';
  });
  window.dispatchEvent(new Event('scroll'));
} else {
  console.error('Heading not found for initial state set');
}