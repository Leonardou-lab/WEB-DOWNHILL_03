(() => {
  const liveClock = document.querySelector('[data-live-clock]');
  if (liveClock) {
    const updateClock = () => {
      const now = new Date();
      liveClock.textContent = now.toLocaleTimeString('es-MX', { hour12: false });
    };
    updateClock();
    setInterval(updateClock, 1000);
  }

  const body = document.body;
  const cursorDot = document.querySelector('.cursor-dot');
  const cursorRing = document.querySelector('.cursor-ring');
  if (cursorDot && cursorRing) {
    body.classList.add('has-custom-cursor');
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;

    const updateDot = (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
      cursorDot.style.left = `${mouseX}px`;
      cursorDot.style.top = `${mouseY}px`;
    };

    const animateRing = () => {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      cursorRing.style.left = `${ringX}px`;
      cursorRing.style.top = `${ringY}px`;
      requestAnimationFrame(animateRing);
    };

    document.addEventListener('mousemove', updateDot, { passive: true });
    animateRing();

    const hoverSelector = '[data-cursor="focus"], a, button, .athlete-hero';
    document.addEventListener('pointerover', (event) => {
      if (event.target.closest(hoverSelector)) body.classList.add('cursor-hover');
    });
    document.addEventListener('pointerout', (event) => {
      if (event.target.closest(hoverSelector)) body.classList.remove('cursor-hover');
    });
  }

  const progress = document.querySelector('.reading-progress');
  if (progress) {
    let ticking = false;
    const updateProgress = () => {
      const doc = document.documentElement;
      const total = doc.scrollHeight - window.innerHeight;
      const scrolled = total > 0 ? (doc.scrollTop / total) : 0;
      progress.style.transform = `scaleX(${scrolled})`;
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateProgress);
      }
    };
    updateProgress();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', updateProgress);
  }

  const tiltTarget = document.querySelector('[data-tilt]');
  if (tiltTarget && !document.body.classList.contains('athlete-detail')) {
    const updateTilt = (event) => {
      const rect = tiltTarget.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      const moveX = (x - 0.5) * 24;
      const moveY = (y - 0.5) * 24;
      tiltTarget.style.setProperty('--tilt-x', `${moveX}px`);
      tiltTarget.style.setProperty('--tilt-y', `${moveY}px`);
    };
    const resetTilt = () => {
      tiltTarget.style.setProperty('--tilt-x', '0px');
      tiltTarget.style.setProperty('--tilt-y', '0px');
    };
    tiltTarget.addEventListener('mousemove', updateTilt);
    tiltTarget.addEventListener('mouseleave', resetTilt);
  }

  const hero = document.querySelector('.athlete-hero');
  if (hero && !document.body.classList.contains('athlete-detail')) {
    let ticking = false;
    const updateParallax = () => {
      const offset = window.scrollY * 0.2;
      hero.style.setProperty('--parallax', `${offset}px`);
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateParallax);
      }
    };
    updateParallax();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', updateParallax);
  }

  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const scramble = (el) => {
    if (el.dataset.scrambling === 'true') return;
    el.dataset.scrambling = 'true';
    const original = el.dataset.text || el.textContent.trim();
    el.dataset.text = original;
    let iteration = 0;
    const maxIterations = Math.max(original.length, 6);
    const interval = setInterval(() => {
      const next = original
        .split('')
        .map((char, index) => {
          if (index < iteration) return char;
          if (char === ' ') return ' ';
          return letters[Math.floor(Math.random() * letters.length)];
        })
        .join('');
      el.textContent = next;
      iteration += 1;
      if (iteration > maxIterations) {
        clearInterval(interval);
        el.textContent = original;
        el.dataset.scrambling = 'false';
      }
    }, 35);
  };

  const scrambleTargets = document.querySelectorAll('.scramble:not(.scramble-hover)');
  if (scrambleTargets.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) scramble(entry.target);
      });
    }, { threshold: 0.6 });
    scrambleTargets.forEach((el) => {
      el.dataset.text = el.dataset.text || el.textContent.trim();
      el.addEventListener('mouseenter', () => scramble(el));
      observer.observe(el);
    });
  }

  const hoverOnlyTargets = document.querySelectorAll('.scramble-hover');
  if (hoverOnlyTargets.length) {
    hoverOnlyTargets.forEach((el) => {
      el.dataset.text = el.dataset.text || el.textContent.trim();
      el.addEventListener('mouseenter', () => scramble(el));
    });
  }

  const scrambleOnLoad = document.querySelectorAll('[data-scramble-load]');
  if (scrambleOnLoad.length) {
    scrambleOnLoad.forEach((el) => {
      el.dataset.text = el.dataset.text || el.textContent.trim();
      requestAnimationFrame(() => scramble(el));
    });
  }

  const scrambleNumbers = document.querySelectorAll('.scramble-number');
  if (scrambleNumbers.length) {
    const digits = '0123456789';
    const scrambleNumber = (el) => {
      if (el.dataset.scrambling === 'true') return;
      el.dataset.scrambling = 'true';
      const original = el.dataset.value || el.textContent.trim();
      let iteration = 0;
      const maxIterations = Math.max(original.length, 6);
      const interval = setInterval(() => {
        const next = original
          .split('')
          .map((char, index) => {
            if (index < iteration) return char;
            if (!/[0-9]/.test(char)) return char;
            return digits[Math.floor(Math.random() * digits.length)];
          })
          .join('');
        el.textContent = next;
        iteration += 1;
        if (iteration > maxIterations) {
          clearInterval(interval);
          el.textContent = original;
          el.dataset.scrambling = 'false';
        }
      }, 32);
    };

    const numberObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) scrambleNumber(entry.target);
      });
    }, { threshold: 0.6 });

    scrambleNumbers.forEach((el) => {
      el.dataset.value = el.dataset.value || el.textContent.trim();
      numberObserver.observe(el);
    });
  }

  const sponsorGrids = document.querySelectorAll('.sponsor-grid');
  if (sponsorGrids.length) {
    const sponsorObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const grid = entry.target;
        if (grid.dataset.animated === 'true') return;
        grid.dataset.animated = 'true';
        const logos = grid.querySelectorAll('.sponsor-logo');
        logos.forEach((logo, index) => {
          setTimeout(() => logo.classList.add('in'), index * 120);
        });
      });
    }, { threshold: 0.4 });
    sponsorGrids.forEach((grid) => sponsorObserver.observe(grid));
  }
})();
