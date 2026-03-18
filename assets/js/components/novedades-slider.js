document.addEventListener('DOMContentLoaded', () => {
  const slider = document.getElementById('novedades-slider');
  const dots = document.getElementById('novedades-dots');
  const prevBtn = document.querySelector('.novedades-arrow.prev');
  const nextBtn = document.querySelector('.novedades-arrow.next');
  if (!slider || !dots) return;

  const slides = Array.from(slider.querySelectorAll('.novedad-slide'));
  if (!slides.length) return;

  let activeIndex = 0;
  let timerId = null;
  const intervalMs = 7000;

  function setActive(index) {
    activeIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      slide.classList.toggle('is-active', i === activeIndex);
    });
    Array.from(dots.children).forEach((dot, i) => {
      dot.classList.toggle('is-active', i === activeIndex);
      dot.setAttribute('aria-pressed', i === activeIndex ? 'true' : 'false');
    });
  }

  function startAutoplay() {
    stopAutoplay();
    timerId = setInterval(() => setActive(activeIndex + 1), intervalMs);
  }

  function stopAutoplay() {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
  }

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', `Ir a novedad ${i + 1}`);
    dot.addEventListener('click', () => {
      setActive(i);
      startAutoplay();
    });
    dots.appendChild(dot);
  });

  prevBtn?.addEventListener('click', () => {
    setActive(activeIndex - 1);
    startAutoplay();
  });

  nextBtn?.addEventListener('click', () => {
    setActive(activeIndex + 1);
    startAutoplay();
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      prevBtn?.click();
    }
    if (event.key === 'ArrowRight') {
      nextBtn?.click();
    }
  });

  slider.addEventListener('mouseenter', stopAutoplay);
  slider.addEventListener('mouseleave', startAutoplay);

  setActive(0);
  startAutoplay();
});
