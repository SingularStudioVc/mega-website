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
        if (element instanceof HTMLInputElement && element.type !== 'submit') {
          element.value = translations[lang][key];
        } else {
        element.innerHTML = translations[lang][key];
        }
      }
    });

    // After setting text content, duplicate it for the knockout effect
    document.querySelectorAll('.project-card').forEach(card => {
      const baseContent = card.querySelector('.card-content-base');
      const clippedContent = card.querySelector('.card-content-clipped');
      if (baseContent && clippedContent) {
        clippedContent.innerHTML = baseContent.innerHTML;
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
  
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    
    // Check if scrolled to bottom
    const isAtBottom = scrollY + window.innerHeight >= document.documentElement.scrollHeight - 10;
    
    // Add or remove at-bottom class
    if (isAtBottom) {
      document.body.classList.add('at-bottom');
    } else {
      document.body.classList.remove('at-bottom');
    }
    
    // Handle mission statement and language toggle
    const langToggle = document.getElementById('lang-toggle');
    if (langToggle && missionWrapper) {
      const shouldShow = scrollY >= 700 && !isAtBottom;  // Don't show if at bottom
      
      if (shouldShow) {
        langToggle.classList.add('is-visible');
        missionWrapper.classList.add('is-visible');
      } else {
        langToggle.classList.remove('is-visible');
        missionWrapper.classList.remove('is-visible');
      }
    }
    
    // Handle MEGA heading fade
    if (megaHeading) {
      // Handle bottom state first
      if (isAtBottom) {
        megaHeading.style.opacity = '0';
        megaHeading.style.filter = 'blur(0px)';
        return; // Exit early when at bottom
      }
      
      // Normal scroll behavior (not at bottom)
      if (scrollY >= 700) {
        // Calculate fade and blur progress from 700px to 1000px (300px range)
        const fadeProgress = Math.min(1, (scrollY - 700) / 300);
        const newOpacity = Math.max(0, 1 - fadeProgress);
        const newBlur = Math.min(10, fadeProgress * 10); // Blur from 0px to 10px
        
        // Apply the changes directly
        megaHeading.style.opacity = newOpacity.toString();
        megaHeading.style.filter = `blur(${newBlur}px)`;
      } else if (scrollY >= 0) {
        // Keep heading visible and clear
        megaHeading.style.opacity = '1';
        megaHeading.style.filter = 'blur(0px)';
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

  // Custom cursor logic
  const customCursor = document.getElementById('custom-cursor');
  let cursorTimeout: number | undefined;

  if (customCursor) {
    window.addEventListener('mousemove', (e) => {
      customCursor.classList.add('active');
      customCursor.style.left = `${e.clientX}px`;
      customCursor.style.top = `${e.clientY}px`;
      if (cursorTimeout) clearTimeout(cursorTimeout);
      cursorTimeout = window.setTimeout(() => {
        customCursor.classList.remove('active');
      }, 200);
    });
  }
});