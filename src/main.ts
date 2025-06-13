import { translations } from './localization';

type TranslationKey = keyof typeof translations['en'];

// Font loading check
function checkFontLoading() {
  if ('fonts' in document) {
    document.fonts.ready.then(() => {
      console.log('All fonts loaded');
      
      // Check if GT-America is loaded
      const testElement = document.createElement('span');
      testElement.style.fontFamily = 'GT-America-Standard, Arial';
      testElement.style.fontSize = '72px';
      testElement.style.visibility = 'hidden';
      testElement.textContent = 'MEGA';
      document.body.appendChild(testElement);
      
      const gtAmericaWidth = testElement.offsetWidth;
      
      testElement.style.fontFamily = 'Arial';
      const arialWidth = testElement.offsetWidth;
      
      document.body.removeChild(testElement);
      
      if (gtAmericaWidth !== arialWidth) {
        console.log('✅ GT-America font is loaded and being used');
      } else {
        console.log('❌ GT-America font is not loaded, falling back to Arial');
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Check font loading
  checkFontLoading();
  
  const overlay = document.getElementById('project-overlay');
  if (!overlay) return;

  let activeCard: HTMLElement | null = null;

  document.querySelectorAll('.project-card').forEach(cardElement => {
    const card = cardElement as HTMLElement;
    card.addEventListener('click', (e) => {
      e.stopPropagation();
      if (overlay.classList.contains('is-visible')) return;

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

  const langToggle = document.getElementById('lang-toggle');
  const langOptions = langToggle?.querySelectorAll('.lang-option');
  const translatableElements = document.querySelectorAll('[data-key]');

  const setLanguage = (lang: 'en' | 'fr') => {
    translatableElements.forEach(element => {
      const key = element.getAttribute('data-key') as TranslationKey;
      if (key && translations[lang][key]) {
        element.innerHTML = translations[lang][key];
      }
    });

    langOptions?.forEach(option => {
      if (option.getAttribute('data-lang') === lang) {
        option.classList.add('active');
      } else {
        option.classList.remove('active');
      }
    });
    
    document.documentElement.lang = lang;
  };

  langOptions?.forEach(option => {
    option.addEventListener('click', (e) => {
      const lang = (e.target as HTMLElement).getAttribute('data-lang') as 'en' | 'fr';
      if (lang) {
        setLanguage(lang);
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
  
  const backdrop = document.getElementById('backdrop');
  backdrop?.addEventListener('click', () => {
    if (activeCard) closeOverlay(overlay);
  });
  
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && activeCard) closeOverlay(overlay);
  });

  // Initialize language
  setLanguage('en');

  // MEGA heading blur effect on scroll
  const megaHeading = document.getElementById('mega-heading');
  const missionWrapper = document.getElementById('mission-wrapper');
  const projectsSection = document.getElementById('projects-section');
  const maxBlur = 30; // Maximum blur in pixels
  const blurTransitionDistance = 500; // Distance in pixels to transition from max blur to no blur
  let scrollTimeout: number | null = null;

  window.addEventListener('scroll', () => {
    if (megaHeading) {
      const scrollY = window.scrollY;
      const blurAmount = Math.max(0, maxBlur - (scrollY / blurTransitionDistance) * maxBlur);
      
      // Clear existing scroll timeout
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      
      // Check if scrolled to bottom
      const isAtBottom = scrollY + window.innerHeight >= document.documentElement.scrollHeight - 10; // 10px tolerance
      
      if (isAtBottom) {
        // Hide everything except contact section when at bottom
        if (megaHeading) {
          megaHeading.style.opacity = '0';
        }
        if (projectsSection) {
          projectsSection.style.opacity = '0';
          projectsSection.style.pointerEvents = 'none'; // Make non-clickable
        }
        if (missionWrapper) {
          missionWrapper.style.opacity = '0';
        }
        // Hide corner words
        const cornerWords = document.querySelectorAll('.corner-word');
        cornerWords.forEach(word => {
          word.classList.remove('slide-in');
        });
        
        // Show footer branding when at bottom
        const footerBranding = document.getElementById('footer-branding');
        if (footerBranding) {
          footerBranding.classList.add('is-visible');
        }
        
        // Hide language toggle when at bottom
        const langToggle = document.getElementById('lang-toggle');
        if (langToggle) {
          langToggle.classList.remove('is-visible');
        }
      } else {
        // Normal behavior when not at bottom
        // MEGA heading blur effect
        megaHeading.style.filter = `blur(${blurAmount}px)`;
        megaHeading.style.opacity = '1';
        
        // Show projects section when scrolled enough
        if (scrollY >= 650) {
          if (projectsSection) {
            projectsSection.style.opacity = '1';
            projectsSection.style.pointerEvents = 'auto'; // Re-enable clicking
          }
          // Make MEGA transparent and blurred in Phase 3
          megaHeading.style.opacity = '0.6';
          megaHeading.style.filter = 'blur(30px)';
        } else {
          if (projectsSection) {
            projectsSection.style.opacity = '0';
            projectsSection.style.pointerEvents = 'none'; // Disable clicking when hidden
          }
          // Full opacity and normal blur when not in Phase 3
          megaHeading.style.opacity = '1';
          megaHeading.style.filter = `blur(${blurAmount}px)`;
        }
        
        // Show mission statement when scrolled enough
        if (scrollY >= 600) {
          if (missionWrapper) {
            missionWrapper.style.opacity = '1';
          }
          // Show language toggle when mission statement is visible
          const langToggle = document.getElementById('lang-toggle');
          if (langToggle) {
            langToggle.classList.add('is-visible');
          }
        } else {
          if (missionWrapper) {
            missionWrapper.style.opacity = '0';
          }
          // Hide language toggle when mission statement is not visible
          const langToggle = document.getElementById('lang-toggle');
          if (langToggle) {
            langToggle.classList.remove('is-visible');
          }
        }
        
        // Hide centered stacked text and vertical MEGA when not at bottom
        const centeredStack = document.getElementById('centered-stack');
        if (centeredStack) {
          centeredStack.style.opacity = '0';
        }
        
        // Simple corner words logic: appear when scroll is different than 0
        const cornerWords = document.querySelectorAll('.corner-word');
        if (scrollY > 0) {
          // Show corner words when scrolled
          cornerWords.forEach(word => {
            word.classList.add('slide-in');
          });
          
          // Set timeout to hide MEGA when scrolling stops (but only if scrolled enough)
          if (scrollY >= 650) {
            scrollTimeout = window.setTimeout(() => {
              if (scrollY >= 650) { // Only hide if still in higher scroll range
                megaHeading.style.opacity = '0';
              }
            }, 300);
          }
        } else {
          // Hide corner words when at top
          cornerWords.forEach(word => {
            word.classList.remove('slide-in');
          });
          
          // Show MEGA heading with proper blur at top
          megaHeading.style.opacity = '1';
          megaHeading.style.filter = `blur(${blurAmount}px)`;
        }
        
        // Hide footer branding when not at bottom
        const footerBranding = document.getElementById('footer-branding');
        if (footerBranding) {
          footerBranding.classList.remove('is-visible');
        }
      }
    }
  });

  // Debug: Manual trigger for testing (uncomment to test)
  // setTimeout(() => {
  //   console.log('Manual trigger test');
  //   const cornerWords = document.querySelectorAll('.corner-word');
  //   cornerWords.forEach((word, index) => {
  //     setTimeout(() => {
  //       word.classList.add('slide-in');
  //       console.log('Manual slide-in added to word', index, word.textContent);
  //     }, index * 200);
  //   });
  // }, 2000);
});