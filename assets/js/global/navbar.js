(() => {
  const nav = document.querySelector(".rb-nav");
  if (!nav) return;

  const navRow = nav.querySelector(".rb-nav-row");
  const pill = nav.querySelector(".rb-pill");
  const actions = nav.querySelector(".rb-actions");
  const menu = nav.querySelector(".rb-menu");
  const loginBtn = nav.querySelector(".rb-login-btn");

  if (!navRow || !pill || !actions || !menu || !loginBtn) return;

  const mobileQuery = window.matchMedia("(max-width: 860px)");
  let mobileOpen = false;

  const mobileLinks = Array.from(menu.querySelectorAll(".rb-item"));
  const setActiveLink = () => {
    const path = window.location.pathname;
    let activeKey = "";

    if (path.includes("/atletas/")) activeKey = "atletas";
    else if (path.includes("/eventos/")) activeKey = "eventos";
    else if (path.includes("/novedades/")) activeKey = "novedades";
    else if (path.includes("standings")) activeKey = "standings";
    else if (path.includes("nosotros")) activeKey = "nosotros";
    else if (path.includes("checkout")) activeKey = "checkout";
    else if (path.includes("perfil")) activeKey = "perfil";
    else activeKey = "index";

    mobileLinks.forEach((link) => {
      const href = link.getAttribute("href") || "";
      const matches =
        (activeKey === "atletas" && href.includes("atletas")) ||
        (activeKey === "eventos" && href.includes("eventos")) ||
        (activeKey === "standings" && href.includes("standings")) ||
        (activeKey === "nosotros" && href.includes("nosotros")) ||
        (activeKey === "perfil" && href.includes("perfil")) ||
        (activeKey === "index" && href.endsWith("#top"));

      if (matches) {
        link.classList.add("rb-item--active");
        link.setAttribute("aria-current", "page");
      }
    });
  };

  const ensureMobileToggle = () => {
    let toggle = nav.querySelector(".rb-menu-toggle");
    if (toggle) return toggle;

    toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "rb-menu-toggle";
    toggle.setAttribute("aria-label", "Abrir menú");
    toggle.setAttribute("aria-expanded", "false");
    toggle.innerHTML = '<span></span><span></span><span></span>';

    navRow.insertBefore(toggle, actions);
    return toggle;
  };

  const setNavHeight = () => {
    const navRect = nav.getBoundingClientRect();
    const navOffset = 20;
    const totalHeight = Math.ceil(navRect.height + navOffset);
    document.documentElement.style.setProperty("--nav-h", `${totalHeight}px`);
  };

  const hideNav = () => {
    if (mobileQuery.matches && mobileOpen) return;
    nav.classList.add("rb-nav--hidden", "is-hidden");
    nav.classList.remove("is-sticky");
  };

  const showNav = (y) => {
    nav.classList.remove("rb-nav--hidden", "is-hidden");
    if (y > 0) nav.classList.add("is-sticky");
    else nav.classList.remove("is-sticky");
  };

  const closeMobileMenu = () => {
    mobileOpen = false;
    nav.classList.remove("rb-nav--menu-open");
    nav.querySelector(".rb-menu-toggle")?.setAttribute("aria-expanded", "false");
    nav.querySelector(".rb-menu-toggle")?.setAttribute("aria-label", "Abrir menú");
    document.body.classList.remove("rb-nav-open");
  };

  const openMobileMenu = () => {
    mobileOpen = true;
    nav.classList.add("rb-nav--menu-open");
    nav.querySelector(".rb-menu-toggle")?.setAttribute("aria-expanded", "true");
    nav.querySelector(".rb-menu-toggle")?.setAttribute("aria-label", "Cerrar menú");
    document.body.classList.add("rb-nav-open");
  };

  const syncMobileMenu = () => {
    const toggle = ensureMobileToggle();
    const isMobile = mobileQuery.matches;
    pill.hidden = false;
    actions.hidden = false;
    toggle.hidden = !isMobile;
    nav.classList.toggle("rb-nav--mobile", isMobile);
    if (!isMobile) closeMobileMenu();
  };

  const candidates = [document.scrollingElement, document.documentElement, document.body, document.querySelector("main.events-page"), document.querySelector(".events-page")].filter(Boolean);

  const pickScrollContainer = () => {
    for (const el of candidates) {
      if (el.scrollHeight > el.clientHeight + 2) return el;
    }
    return document.scrollingElement || document.documentElement;
  };

  let scroller = pickScrollContainer();
  const getScrollTop = () => scroller.scrollTop || 0;

  const refreshScroller = () => {
    const newScroller = pickScrollContainer();
    if (newScroller !== scroller) {
      scroller.removeEventListener("scroll", onScroll);
      scroller = newScroller;
      scroller.addEventListener("scroll", onScroll, { passive: true });
    }
  };

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
    } else if (acc > trigger && y > hideAfter) {
      hideNav();
      acc = 0;
    } else if (acc < -trigger) {
      showNav(y);
      acc = 0;
    } else if (!nav.classList.contains("is-hidden")) {
      showNav(y);
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

  const updateLoginBtn = () => {
    const userName = localStorage.getItem("user_name");
    if (userName) {
      const firstName = userName.trim().split(/\s+/)[0];
      loginBtn.textContent = firstName.toUpperCase();
    } else {
      loginBtn.textContent = "INICIAR SESIÓN";
    }
  };

  window.addEventListener("storage", (e) => {
    if (e.key === "user_name") updateLoginBtn();
  });

  const toggle = ensureMobileToggle();
  toggle.addEventListener("click", () => {
    if (mobileOpen) closeMobileMenu();
    else openMobileMenu();
  });

  nav.addEventListener("click", (e) => {
    if (e.target.closest(".rb-item") || e.target.closest(".rb-login-btn")) closeMobileMenu();
  });

  document.addEventListener("click", (e) => {
    if (!mobileOpen) return;
    if (nav.contains(e.target)) return;
    closeMobileMenu();
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMobileMenu();
  });

  setActiveLink();
  setNavHeight();
  updateLoginBtn();
  syncMobileMenu();
  refreshScroller();

  lastY = getScrollTop();
  showNav(lastY);

  scroller.addEventListener("scroll", onScroll, { passive: true });

  window.addEventListener("resize", () => {
    requestAnimationFrame(() => {
      setNavHeight();
      refreshScroller();
      syncMobileMenu();
    });
  });

  window.addEventListener("wheel", () => requestAnimationFrame(update), { passive: true });
  window.addEventListener("touchmove", () => requestAnimationFrame(update), { passive: true });
})();
