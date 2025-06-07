document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById('project-overlay');
  if (!overlay) return;

  let activeCard: HTMLElement | null = null;

  document.querySelectorAll('.toggle-description').forEach(button => {
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = (e.target as HTMLElement).closest('.project-card') as HTMLElement;
      if (!card) return;

      activeCard = card;
      const cardRect = card.getBoundingClientRect();
      const cardContent = card.cloneNode(true) as HTMLElement;
      
      const buttonInOverlay = cardContent.querySelector('.toggle-description');
      if (buttonInOverlay) {
        buttonInOverlay.innerHTML = '&times;';
      }

      overlay.innerHTML = '';
      overlay.appendChild(cardContent);

      overlay.style.top = `${cardRect.top}px`;
      overlay.style.left = `${cardRect.left}px`;
      overlay.style.width = `${cardRect.width}px`;
      overlay.style.height = `${cardRect.height}px`;
      
      overlay.classList.add('is-visible');
      card.classList.add('is-hidden');
      document.body.classList.add('overlay-open');
      document.body.style.overflow = 'hidden';

      requestAnimationFrame(() => {
        overlay.classList.add('is-animating');
        const targetWidth = Math.min(1200, window.innerWidth * 0.8);
        overlay.style.top = '50%';
        overlay.style.left = '50%';
        overlay.style.width = `${targetWidth}px`;
        overlay.style.height = `${window.innerHeight * 0.8}px`;
        overlay.style.transform = 'translate(-50%, -50%)';
      });

      const closeButton = overlay.querySelector('.toggle-description');
      if (closeButton) {
        closeButton.addEventListener('click', (closeEvent) => {
          closeEvent.stopPropagation();
          closeOverlay(overlay);
        });
      }
    });
  });

  function closeOverlay(overlay: HTMLElement) {
    if (!activeCard) return;

    const cardRect = activeCard.getBoundingClientRect();
    
    overlay.style.transform = 'none';
    overlay.style.top = `${cardRect.top}px`;
    overlay.style.left = `${cardRect.left}px`;
    overlay.style.width = `${cardRect.width}px`;
    overlay.style.height = `${cardRect.height}px`;

    const onTransitionEnd = () => {
      overlay.removeEventListener('transitionend', onTransitionEnd);
      overlay.classList.remove('is-visible', 'is-animating');
      overlay.innerHTML = '';
      if (activeCard) {
        activeCard.classList.remove('is-hidden');
        activeCard = null;
      }
      document.body.classList.remove('overlay-open');
      document.body.style.overflow = '';
    };

    overlay.addEventListener('transitionend', onTransitionEnd);
  }

  // Optional: Close overlay with Escape key or click on backdrop
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeOverlay(overlay);
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && activeCard) closeOverlay(overlay);
  });

  const pinContainer = document.getElementById('pin-container');
  if (pinContainer) {
    const contentAfterPin = document.getElementById('content-after-pin');

    if (contentAfterPin) {
      const initPinAnimation = () => {
        const headingElement = document.querySelector('#dynamic-heading') as HTMLElement;
        const wordElements = headingElement.querySelectorAll('.mega-word') as NodeListOf<HTMLElement>;

        let centerTranslateX = 0;
        let finalScale = 0.1;
        let finalTranslateY = 0;
        let totalLettersWidth = 0;
        let finalCenteringTranslateX = 0;
        let acronymCenterX = 0;

        const calculateMetrics = () => {
          // --- 1. Reset styles and remove final state classes ---
          headingElement.classList.remove('is-acronym');
          headingElement.style.transform = 'scale(1) translateY(0) translateX(0)';
          wordElements.forEach(word => {
            word.style.transform = 'translateX(0px)';
            const letters = word.querySelectorAll('.letter') as NodeListOf<HTMLElement>;
            letters.forEach(letter => {
                letter.style.transform = 'translateX(0px)';
                letter.style.opacity = '1';
            });
          });

          // --- 2. Calculate initial state metrics (for Phase 1) ---
          const initialRect = headingElement.getBoundingClientRect();
          centerTranslateX = window.innerWidth - (2 * initialRect.left) - headingElement.scrollWidth;

          // --- 3. Calculate collapse metrics (font-independent) ---
          let accumulatedInitialWidths = 0;
          wordElements.forEach((word) => {
            const initial = word.querySelector('.mega-char') as HTMLElement;
            if (!initial) return;
            const wordDisplacement = word.offsetLeft - accumulatedInitialWidths;
            word.dataset.wordDisplacement = String(wordDisplacement);
            accumulatedInitialWidths += initial.offsetWidth;

            const letters = word.querySelectorAll('.letter') as NodeListOf<HTMLElement>;
            letters.forEach(letter => {
                const displacement = letter.offsetLeft - initial.offsetLeft;
                letter.dataset.displacement = String(displacement);
            });
          });
          
          // --- 4. Calculate final state metrics (for Phases 2-4) ---
          headingElement.classList.add('is-acronym'); // Temporarily apply final styles

          // Temporarily apply collapse transforms to measure final acronym state
          wordElements.forEach(word => {
            const wordDisplacement = parseFloat(word.dataset.wordDisplacement || '0');
            word.style.transform = `translateX(-${wordDisplacement}px)`;
            const letters = word.querySelectorAll('.letter') as NodeListOf<HTMLElement>;
            letters.forEach(letter => {
              const displacement = parseFloat(letter.dataset.displacement || '0');
              letter.style.transform = `translateX(-${displacement}px)`;
            });
          });

          const initials = headingElement.querySelectorAll('.mega-char') as NodeListOf<HTMLElement>;
          const firstInitialRect = initials[0].getBoundingClientRect();
          const lastInitialRect = initials[initials.length - 1].getBoundingClientRect();
          const finalAcronymWidth = lastInitialRect.right - firstInitialRect.left;
          const finalAcronymLeft = firstInitialRect.left;
          const finalAcronymCenter = finalAcronymLeft + finalAcronymWidth / 2;
          
          finalCenteringTranslateX = (window.innerWidth / 2) - finalAcronymCenter;
          acronymCenterX = finalAcronymCenter - initialRect.left;

          // Reset transforms that were temporarily applied
          wordElements.forEach(word => {
            word.style.transform = 'translateX(0px)';
            const letters = word.querySelectorAll('.letter') as NodeListOf<HTMLElement>;
            letters.forEach(letter => {
              letter.style.transform = 'translateX(0px)';
            });
          });
          
          const vh = window.innerHeight;
          const initialFontSize = vh * 0.95;
          const finalFontSize = 40;
          finalScale = finalFontSize / initialFontSize;
          
          finalTranslateY = (20 + (vh * finalScale / 2)) - (vh / 2);

          // --- 5. Final cleanup ---
          headingElement.classList.remove('is-acronym'); // Remove temporary class
          
          (contentAfterPin as HTMLElement).style.opacity = '0';
          headingElement.style.transform = 'scale(1) translateY(0) translateX(0)';
        };

        calculateMetrics();
        window.addEventListener('resize', calculateMetrics);

        let currentPhase = -1;

        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            const pinContainerTop = pinContainer.offsetTop;
            const pinContainerHeight = pinContainer.offsetHeight;
            const viewHeight = window.innerHeight;
            const pinDuration = pinContainerHeight - viewHeight;

            if (scrollY >= pinContainerTop && scrollY < pinContainerTop + pinDuration) {
              const progress = (scrollY - pinContainerTop) / pinDuration;

              if (progress >= 0.7) {
                headingElement.classList.add('is-acronym');
              } else {
                headingElement.classList.remove('is-acronym');
              }
              
              let phase: number, phaseProgress: number;

              /**
               * Phase 1: Reveal
               * The oversized text, initially clipped, scrolls into the viewport from the right.
               */
              if (progress < 0.4) { 
                phase = 1;
                phaseProgress = progress / 0.4;
                if (currentPhase !== phase) {
                    currentPhase = phase;
                    console.log(`Entering Phase ${phase}: Reveal`);
                    headingElement.style.transformOrigin = '';
                }
                const currentX = centerTranslateX * phaseProgress;
                headingElement.style.transform = `translateX(${currentX}px)`;
              } else if (progress < 0.7) {
                phase = 2;
                phaseProgress = (progress - 0.4) / 0.3;
                if (currentPhase !== phase) {
                    currentPhase = phase;
                    console.log(`Entering Phase ${phase}: Collapse & Center`);
                    headingElement.style.transformOrigin = '';
                }
                const currentX = centerTranslateX + (finalCenteringTranslateX - centerTranslateX) * phaseProgress;
                headingElement.style.transform = `translateX(${currentX}px)`;
                wordElements.forEach(word => {
                  const wordDisplacement = parseFloat(word.dataset.wordDisplacement || '0');
                  word.style.transform = `translateX(-${wordDisplacement * phaseProgress}px)`;

                  const letters = word.querySelectorAll('.letter') as NodeListOf<HTMLElement>;
                  letters.forEach(letter => {
                      const displacement = parseFloat(letter.dataset.displacement || '0');
                      letter.style.transform = `translateX(-${displacement * phaseProgress}px)`;
                      letter.style.opacity = String(1 - phaseProgress);
                  });
                });
              } else if (progress < 0.8) {
                  phase = 2.5;
                   if (currentPhase !== phase) {
                    currentPhase = phase;
                    console.log(`Entering Phase ${phase}: Hold`);
                  }
                  headingElement.style.transform = `translateX(${finalCenteringTranslateX}px)`;
              } else if (progress < 0.9) {
                phase = 3;
                phaseProgress = (progress - 0.8) / 0.1;
                if (currentPhase !== phase) {
                    currentPhase = phase;
                    console.log(`Entering Phase ${phase}: Shrink`);
                    headingElement.style.transformOrigin = `${acronymCenterX}px center`;
                }
                const currentScale = 1 - (1 - finalScale) * phaseProgress;
                headingElement.style.transform = `translateX(${finalCenteringTranslateX}px) scale(${currentScale})`;
              } else {
                phase = 4;
                phaseProgress = (progress - 0.9) / 0.1;
                if (currentPhase !== phase) {
                    currentPhase = phase;
                    console.log(`Entering Phase ${phase}: Position`);
                    headingElement.style.transformOrigin = `${acronymCenterX}px center`;
                }
                const currentY = finalTranslateY * phaseProgress;
                headingElement.style.transform = `translateX(${finalCenteringTranslateX}px) scale(${finalScale}) translateY(${currentY}px)`;
              }

              requestAnimationFrame(() => {
                if (progress >= 0.7) {
                  wordElements.forEach(word => {
                    const wordDisplacement = parseFloat(word.dataset.wordDisplacement || '0');
                    word.style.transform = `translateX(-${wordDisplacement}px)`;
                    const letters = word.querySelectorAll('.letter') as NodeListOf<HTMLElement>;
                    letters.forEach(letter => {
                      const displacement = parseFloat(letter.dataset.displacement || '0');
                      letter.style.transform = `translateX(-${displacement}px)`;
                      letter.style.opacity = '0';
                    });
                  });
                } else if (progress < 0.4) {
                    wordElements.forEach(word => {
                        word.style.transform = 'translateX(0px)';
                        const letters = word.querySelectorAll('.letter') as NodeListOf<HTMLElement>;
                        letters.forEach(letter => {
                            letter.style.transform = 'translateX(0px)';
                            letter.style.opacity = '1';
                        });
                    });
                }
                if (progress < 1) {
                    (contentAfterPin as HTMLElement).style.opacity = '0';
                } else {
                    (contentAfterPin as HTMLElement).style.opacity = '1';
                }
              });
            } else if (scrollY < pinContainerTop) {
                if (currentPhase !== 0) {
                    currentPhase = 0;
                    console.log("Before animation starts");
                    headingElement.style.transformOrigin = '';
                }
              requestAnimationFrame(() => {
                headingElement.classList.remove('is-acronym');
                headingElement.style.transform = 'translateX(0px)';
                wordElements.forEach(word => {
                    word.style.transform = 'translateX(0px)';
                    const letters = word.querySelectorAll('.letter') as NodeListOf<HTMLElement>;
                    letters.forEach(letter => {
                        letter.style.transform = 'translateX(0px)';
                        letter.style.opacity = '1';
                    });
                  });
                (contentAfterPin as HTMLElement).style.opacity = '0';
              });
            } else {
                if (currentPhase !== 5) {
                    currentPhase = 5;
                    console.log("Animation finished");
                }
              requestAnimationFrame(() => {
                headingElement.classList.add('is-acronym');
                headingElement.style.transformOrigin = `${acronymCenterX}px center`;
                headingElement.style.transform = `translateX(${finalCenteringTranslateX}px) scale(${finalScale}) translateY(${finalTranslateY}px)`;
                wordElements.forEach(word => {
                    const wordDisplacement = parseFloat(word.dataset.wordDisplacement || '0');
                    word.style.transform = `translateX(-${wordDisplacement}px)`;
                    const letters = word.querySelectorAll('.letter') as NodeListOf<HTMLElement>;
                    letters.forEach(letter => {
                        const displacement = parseFloat(letter.dataset.displacement || '0');
                        letter.style.transform = `translateX(-${displacement}px)`;
                        letter.style.opacity = '0';
                    });
                  });
                (contentAfterPin as HTMLElement).style.opacity = '1';
              });
            }
        }, { passive: true });
      };

      document.fonts.ready.then(initPinAnimation);
    }
  }
});