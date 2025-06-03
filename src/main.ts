const heading = document.getElementById('dynamic-heading') as HTMLElement | null;
const collapsibleSpans = document.querySelectorAll('#dynamic-heading .collapsible') as NodeListOf<HTMLElement>;
const gGreat = document.getElementById('g-great') as HTMLElement | null;
const initialLetterSpans = document.querySelectorAll('.initial-letter') as NodeListOf<HTMLElement>;
const megaMissionStatement = document.getElementById('mega-mission-statement') as HTMLElement | null;
// const initialE = document.getElementById('initial-e') as HTMLElement | null; // Reverted
// const collapsibleArth = document.getElementById('collapsible-arth') as HTMLElement | null; // Reverted

const INITIAL_LETTER_BOLDNESS_OFFSET = 100;

// Background Color Animation Config
const BG_COLOR_HUE = 237;
const BG_COLOR_LIGHTNESS = 54;
const BG_COLOR_START_SATURATION = 10;
const BG_COLOR_END_SATURATION = 94;

// Configuration for Work Sans font animation
const FONT_VARIATION_CONFIG = {
  wght: { min: 100, max: 500, default: 100 },
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
const MISSION_STATEMENT_FINAL_BOTTOM_PX = 40;

// Mobile specific final state for MEGA heading
const MEGA_FINAL_TOP_PX_MOBILE = 10;
const MEGA_FINAL_FONT_SIZE_EM_MOBILE = 1.5; // e.g., 1.5em relative to body

// h1Phase1EndFontSize will store the computed vw value at the end of phase 1, 
// but the transition to MEGA_FINAL_FONT_SIZE_EM will need care.
// For simplicity, let's make h1Phase1EndFontSize also target an EM value for a smoother transition to the final EM state.
// OR, the transition in phase 2 will be from a calculated VW to a fixed EM.
// Let's try the VW to EM transition first.
let h1Phase1EndFontSizeValue = FONT_SIZE_CONFIG.max; // This will store the numeric VW value at the end of Phase 1

let h1InitialTransform = "translateY(-50%) translateZ(0px)";

window.addEventListener('scroll', () => {
  if (!heading) return;

  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const onePhaseScrollHeight = window.innerHeight;
  const isMobile = window.innerWidth <= 768;

  let phase1Progress = 0;
  let phase2Progress = 0;
  let phase3Progress = 0;

  if (scrollTop < onePhaseScrollHeight) {
    phase1Progress = scrollTop / onePhaseScrollHeight;
  } else if (scrollTop < 2 * onePhaseScrollHeight) {
    phase1Progress = 1;
    phase2Progress = (scrollTop - onePhaseScrollHeight) / onePhaseScrollHeight;
  } else {
    phase1Progress = 1;
    phase2Progress = 1;
    phase3Progress = Math.min((scrollTop - 2 * onePhaseScrollHeight) / onePhaseScrollHeight, 1);
  }
  phase1Progress = Math.min(phase1Progress, 1);
  phase2Progress = Math.min(phase2Progress, 1);

  const currentMegaFinalTopPx = isMobile ? MEGA_FINAL_TOP_PX_MOBILE : MEGA_FINAL_TOP_PX;
  // This is now EM for the final MEGA logo state
  const currentMegaFinalFontSizeEmValue = isMobile ? MEGA_FINAL_FONT_SIZE_EM_MOBILE : MEGA_FINAL_FONT_SIZE_EM;

  // --- Phase 1 related calculations ---
  let baseWeight = FONT_VARIATION_CONFIG.wght.min + phase1Progress * (FONT_VARIATION_CONFIG.wght.max - FONT_VARIATION_CONFIG.wght.min);
  baseWeight = Math.round(baseWeight);
  baseWeight = Math.max(FONT_VARIATION_CONFIG.wght.min, Math.min(FONT_VARIATION_CONFIG.wght.max, baseWeight));
  
  // h1CurrentFontSizeForPhase1 will be in VW units
  let h1CurrentFontSizeForPhase1 = FONT_SIZE_CONFIG.min + phase1Progress * (FONT_SIZE_CONFIG.max - FONT_SIZE_CONFIG.min);
  h1CurrentFontSizeForPhase1 = Math.round(h1CurrentFontSizeForPhase1 * 100) / 100; // Keep precision for vw
  
  const h1CurrentFontStyleForPhase1 = phase1Progress > 0.5 ? 'italic' : 'normal';
  document.body.style.backgroundColor = `hsl(${BG_COLOR_HUE}, ${BG_COLOR_START_SATURATION + phase1Progress * (BG_COLOR_END_SATURATION - BG_COLOR_START_SATURATION)}%, ${BG_COLOR_LIGHTNESS}%)`;
  const gRotationZ = phase1Progress * -360;
  let gRotationY = 180;
  const gFlipThreshold = 0.98;
  if (phase1Progress > gFlipThreshold) {
    const gFlipProgress = Math.min((phase1Progress - gFlipThreshold) / (1 - gFlipThreshold), 1);
    gRotationY = 180 - (gFlipProgress * 180);
  }
  gRotationY = Math.max(0, Math.min(180, gRotationY));

  // --- Apply styles to H1 (MEGA heading) ---
  if (phase2Progress < 1) { 
    if (phase2Progress === 0) { // Purely Phase 1: Font size in VW
      heading.style.top = '50%';
      heading.style.transform = h1InitialTransform;
      heading.style.fontSize = `${h1CurrentFontSizeForPhase1}${FONT_SIZE_CONFIG.unit}`;
      heading.style.fontStyle = h1CurrentFontStyleForPhase1;
      heading.style.fontWeight = baseWeight.toString();
      if (phase1Progress === 1) {
        h1Phase1EndFontSizeValue = h1CurrentFontSizeForPhase1; // Capture the final numeric VW value
      }
    } else { // In Phase 2 (MEGA moving to top)
      const h1StartTopForPhase2 = window.innerHeight / 2;
      const targetTopPx = h1StartTopForPhase2 - (h1StartTopForPhase2 - currentMegaFinalTopPx) * phase2Progress;
      const targetYTranslatePercent = -50 * (1 - phase2Progress);

      // Font size animation for Phase 2: Shrinks from a larger conceptual EM size to target EM size.
      const initialPhase2SizeMultiplier = 2.5; // Start P2 font conceptually 2.5x larger than final EM size.
      const currentSizeMultiplier = initialPhase2SizeMultiplier * (1 - phase2Progress) + 1.0 * phase2Progress;
      heading.style.fontSize = `${currentMegaFinalFontSizeEmValue * currentSizeMultiplier}em`;

      heading.style.top = `${targetTopPx}px`;
      heading.style.transform = `translateY(${targetYTranslatePercent}%) translateZ(0px)`;
      heading.style.fontStyle = 'italic';
      heading.style.fontWeight = FONT_VARIATION_CONFIG.wght.max.toString();
    }
  } else { // Phase 2 completed, MEGA is at top-center. Font size is EM.
    heading.style.top = `${currentMegaFinalTopPx}px`;
    heading.style.fontSize = `${currentMegaFinalFontSizeEmValue}em`;
    heading.style.transform = `translateY(0%) translateZ(0px)`;
    heading.style.fontStyle = 'italic';
    heading.style.fontWeight = FONT_VARIATION_CONFIG.wght.max.toString();
    heading.classList.remove('mega-top-right-mobile'); // Remove class if it was ever added
  }

  // --- Styles for child elements of H1 (always based on phase1Progress or its end state) ---
  initialLetterSpans.forEach(span => {
    const initialLetterWeight = Math.min(900, baseWeight + INITIAL_LETTER_BOLDNESS_OFFSET);
    span.style.fontWeight = initialLetterWeight.toString();
  });

  if (gGreat) {
    gGreat.style.transform = `rotateY(${gRotationY}deg) rotateZ(${gRotationZ}deg) translateZ(0px)`;
    gGreat.style.fontStyle = (phase1Progress > gFlipThreshold && gRotationY < 180) ? 'italic' : 'normal';
  }

  const GROW_PHASE_END = 0.3;
  const COLLAPSIBLE_MAX_WIDTH_PX = 500;
  collapsibleSpans.forEach(span => {
    if (phase1Progress <= GROW_PHASE_END) {
      const growProgress = (GROW_PHASE_END > 0) ? Math.min(phase1Progress / GROW_PHASE_END, 1) : 1;
      span.style.opacity = growProgress.toString();
      span.style.maxWidth = `${growProgress * COLLAPSIBLE_MAX_WIDTH_PX}px`;
      span.style.fontSize = '1em';
      span.style.display = 'inline-block';
    } else {
      const shrinkProgress = (1 - GROW_PHASE_END === 0) ? 1 : Math.min((phase1Progress - GROW_PHASE_END) / (1 - GROW_PHASE_END), 1);
      const currentOpacity = 1 - shrinkProgress;
      const currentFontSizeMultiplier = 1 - shrinkProgress; // Corrected typo here
      span.style.opacity = currentOpacity.toString();
      span.style.maxWidth = `${COLLAPSIBLE_MAX_WIDTH_PX}px`;
      span.style.fontSize = `${currentFontSizeMultiplier}em`;
      if (currentFontSizeMultiplier < 0.01 || currentOpacity < 0.01) {
        span.style.display = 'none';
      } else {
        span.style.display = 'inline-block';
      }
    }
  });

  // --- Mission Statement Animation (now driven by phase3Progress) ---
  if (megaMissionStatement) {
    if (phase3Progress > 0) {
      const missionStatementTargetBottomVh = -100 + (100 + MISSION_STATEMENT_FINAL_BOTTOM_PX) * phase3Progress;
      megaMissionStatement.style.bottom = `${missionStatementTargetBottomVh}vh`;
      megaMissionStatement.style.opacity = phase3Progress.toString();
      megaMissionStatement.style.width = '100%'; 
    } else { 
      megaMissionStatement.style.opacity = '0';
      megaMissionStatement.style.bottom = '-100vh';
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
  // Initial font size uses VW unit from FONT_SIZE_CONFIG
  heading.style.fontSize = `${FONT_SIZE_CONFIG.min}${FONT_SIZE_CONFIG.unit}`;
  const initialBaseWeight = FONT_VARIATION_CONFIG.wght.default;
  heading.style.fontWeight = initialBaseWeight.toString();
  heading.style.fontStyle = 'normal';
  heading.classList.remove('mega-top-right-mobile'); // Ensure class is not present initially

  initialLetterSpans.forEach(span => {
    const initialLetterWeight = Math.min(900, initialBaseWeight + INITIAL_LETTER_BOLDNESS_OFFSET);
    span.style.fontWeight = initialLetterWeight.toString();
  });
  if (gGreat) {
    gGreat.style.transform = 'rotateY(180deg) rotateZ(0deg) translateZ(0px)';
    gGreat.style.fontStyle = 'normal';
  }
  if (megaMissionStatement) {
    megaMissionStatement.style.opacity = '0';
    megaMissionStatement.style.bottom = '-100vh';
    megaMissionStatement.style.width = '100%'; // Initial width is full
    // Initial padding will be picked from CSS (global or media query)
  }
  window.dispatchEvent(new Event('scroll'));
} else {
  console.error('Heading not found for initial state set');
}