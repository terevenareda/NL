document.addEventListener("DOMContentLoaded", () => {
  const transitionEl = document.querySelector(".page-transition");
  const nav = document.querySelector(".navItems");
  const navLinks = nav ? Array.from(nav.querySelectorAll(".nav-link")) : [];
  let current = normalizePath(location.href);
  let redirected = false;

  // ---- Helpers ----
  function normalizePath(href) {
    try {
      const url = new URL(href, location.href);
      let name = url.pathname.split("/").pop() || "index.html";
      if (!name.includes(".")) name += ".html";
      return name;
    } catch {
      return href;
    }
  }

  function setActiveLink(name) {
    navLinks.forEach(link => {
      link.classList.toggle("active", normalizePath(link.href) === name);
    });
  }

  function navigate(url) {
    if (redirected) return;
    redirected = true;
    window.location.href = url;
  }

  function startTransition(url) {
    if (!transitionEl) {
      navigate(url);
      return;
    }

    setTimeout(() => transitionEl.classList.remove("fade-in"), 10);

    transitionEl.addEventListener("transitionend", () => navigate(url), { once: true });
    setTimeout(() => navigate(url), 800); // fallback
  }

  // ---- Initial setup ----
  if (transitionEl && !transitionEl.classList.contains("fade-in")) {
    requestAnimationFrame(() => transitionEl.classList.add("fade-in"));
  }
  if (nav) setActiveLink(current);

  navLinks.forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();
    if (redirected) return;

    navLinks.forEach(l => l.classList.remove("active"));
    link.classList.add("active");

    startTransition(link.href);
  });
});



  // ---- Global links ----
  // Global links outside nav
  document.querySelectorAll("a").forEach(link => {
    if (link.closest(".navItems")) return; // Correctly skip nav links
    if (link.classList.contains("no-transition")) return;

    link.addEventListener("click", e => {
      e.preventDefault();
      startTransition(link.href);
    });
  });


  // ===== Slider =====
  const slider = document.getElementById("cardSlider");
  const cards = document.querySelectorAll(".card");
  let currentIndex = 0;

  const dotLeft = document.getElementById("dotLeft");
  const dotCenter = document.getElementById("dotCenter");
  const dotRight = document.getElementById("dotRight");
  const dots = document.querySelectorAll(".dot");

  function getCardWidth() {
    if (!slider || !cards.length) return 0;
    const gap = parseInt(getComputedStyle(slider).gap) || 20;
    return cards[0].offsetWidth + gap;
  }

  let cardWidth = getCardWidth();

  function updateSlider() {
    if (!slider || !cards.length) return;
    slider.style.transform = `translateX(-${cardWidth * currentIndex}px)`;
  }

  function setActiveDot(dot) {
    dots.forEach(d => d.classList.remove("active"));
    dot.classList.add("active");
  }

  dotLeft?.addEventListener("click", () => {
    if (currentIndex > 0) currentIndex--;
    updateSlider();
    setActiveDot(dotLeft);
  });

  dotRight?.addEventListener("click", () => {
    if (currentIndex < cards.length - 1) currentIndex++;
    updateSlider();
    setActiveDot(dotRight);
  });

  dotCenter?.addEventListener("click", () => {
    if (dotCenter.classList.contains("active")) return;
    if (currentIndex < cards.length - 1) currentIndex++;
    else if (currentIndex > 0) currentIndex--;
    updateSlider();
    setActiveDot(dotCenter);
  });

  // ===== Ring Animation =====
  const ring = document.querySelector(".dot-ring");
  let ringBusy = false;

  function moveRing(dot) {
    if (ringBusy) return;
    ringBusy = true;

    const dotRect = dot.getBoundingClientRect();
    const parentRect = dot.parentElement.getBoundingClientRect();
    const offsetLeft = dotRect.left - parentRect.left + dotRect.width / 2;

    ring.style.left = `${offsetLeft}px`;
    ring.classList.add("active");

    setTimeout(() => (ringBusy = false), 400);
  }

  dots.forEach(dot => dot.addEventListener("click", () => moveRing(dot)));

  // ===== Resize Fix =====
  function updateCardWidth() {
    if (!slider || !cards.length) return;
    if (window.innerWidth <= 768) {
      const gap = parseInt(getComputedStyle(slider).gap) || 20;
      cardWidth = cards[0].offsetWidth + gap;
    } else {
      const style = getComputedStyle(cards[0]);
      const marginLeft = parseInt(style.marginLeft);
      const marginRight = parseInt(style.marginRight);
      cardWidth = cards[0].offsetWidth + marginLeft + marginRight;
    }
    updateSlider();
  }

  window.addEventListener("resize", updateCardWidth);
  window.addEventListener("load", updateCardWidth);

  // ===== Offcanvas Sidebar Close on Mobile =====
  const offcanvasElement = document.getElementById("sidebarOffcanvas");
  if (offcanvasElement) {
    const offcanvasLinks = offcanvasElement.querySelectorAll(".nav-link");
    offcanvasLinks.forEach(link => {
      link.addEventListener("click", () => {
        if (window.innerWidth < 992) {
          const offcanvas = bootstrap.Offcanvas.getInstance(offcanvasElement);
          if (offcanvas) offcanvas.hide();
        }
      });
    });
  }
});
