(() => {
  const nav = document.querySelector(".rb-nav");
  if (!nav) return;

  // -----------------------------
  // Helpers
  // -----------------------------
  const normalize = (value) => (value || "").split("#")[0];

  const setActiveLink = () => {
    const current = window.location.pathname.split("/").pop() || "index.html";
    const normalizedCurrent = normalize(current);
    let activeTarget = normalizedCurrent;

    if (normalizedCurrent.startsWith("atleta-")) activeTarget = "atletas.html";
    else if (normalizedCurrent.startsWith("standings-detalle")) activeTarget = "standings.html";
    else if (normalizedCurrent.startsWith("evento-")) activeTarget = "eventos.html";

    const links = Array.from(nav.querySelectorAll(".rb-item"));
    links.forEach((link) => {
      const href = normalize(link.getAttribute("href"));
      if (href === activeTarget) {
        link.classList.add("rb-item--active");
        link.setAttribute("aria-current", "page");
      }
    });
  };

  const setNavHeight = () => {
    const navRect = nav.getBoundingClientRect();
    const navOffset = 20;
    const totalHeight = Math.ceil(navRect.height + navOffset);
    document.documentElement.style.setProperty("--nav-h", `${totalHeight}px`);
  };

  const hideNav = () => {
    nav.classList.add("rb-nav--hidden", "is-hidden");
    nav.classList.remove("is-sticky");
  };

  const showNav = (y) => {
    nav.classList.remove("rb-nav--hidden", "is-hidden");
    if (y > 0) nav.classList.add("is-sticky");
    else nav.classList.remove("is-sticky");
  };

  // -----------------------------
  // 🔥 Detecta el verdadero contenedor que scrollea
  // -----------------------------
  const candidates = [
    document.scrollingElement,
    document.documentElement,
    document.body,
    document.querySelector("main.events-page"),
    document.querySelector(".events-page"),
  ].filter(Boolean);

  const pickScrollContainer = () => {
    // Escoge el primero que realmente tenga overflow vertical (scrollHeight > clientHeight)
    // y que en runtime pueda cambiar scrollTop.
    for (const el of candidates) {
      if (el.scrollHeight > el.clientHeight + 2) return el;
    }
    // fallback: el estándar
    return document.scrollingElement || document.documentElement;
  };

  let scroller = pickScrollContainer();

  const getScrollTop = () => scroller.scrollTop || 0;

  // Si cambian layouts por responsive, re-evaluamos.
  const refreshScroller = () => {
    const newScroller = pickScrollContainer();
    if (newScroller !== scroller) {
      scroller.removeEventListener("scroll", onScroll);
      scroller = newScroller;
      scroller.addEventListener("scroll", onScroll, { passive: true });
    }
  };

  // -----------------------------
  // Scroll logic robusto (trackpad-friendly)
  // -----------------------------
  const hideAfter = 24;
  const trigger = 18;

  let lastY = 0;
  let acc = 0;
  let ticking = false;

  const update = () => {
    const y = getScrollTop();
    const delta = y - lastY;

    acc += delta;

    if (y <= 0) {
      acc = 0;
      showNav(0);
      nav.classList.remove("is-sticky");
    } else {
      if (acc > trigger && y > hideAfter) {
        hideNav();
        acc = 0;
      } else if (acc < -trigger) {
        showNav(y);
        acc = 0;
      } else {
        // Mantén sticky cuando ya no estás arriba
        if (!nav.classList.contains("is-hidden")) showNav(y);
      }
    }

    lastY = y;
    ticking = false;
  };

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }

  // -----------------------------
  // Init
  // -----------------------------
  setActiveLink();
  setNavHeight();
  refreshScroller();

  lastY = getScrollTop();
  showNav(lastY);

  // IMPORTANT: escuchamos el scroll en el scroller REAL, no en window
  scroller.addEventListener("scroll", onScroll, { passive: true });

  window.addEventListener("resize", () => {
    requestAnimationFrame(() => {
      setNavHeight();
      refreshScroller();
    });
  });

  // Extra: por si el navegador dispara wheel/touch sin scroll event confiable
  window.addEventListener("wheel", () => requestAnimationFrame(update), { passive: true });
  window.addEventListener("touchmove", () => requestAnimationFrame(update), { passive: true });
})();
