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
const arrowLeft = document.querySelector(".arrow-svg.left");
const arrowRight = document.querySelector(".arrow-svg.right");

let currentIndex = 0;
let cardWidth = 0;
let autoSlideInterval;
let isDragging = false;
let startPos = 0;
let currentTranslate = 0;
let prevTranslate = 0;
let animationID;

// ===== Get Card Width =====
function getCardWidth() {
  if (!slider || !cards.length) return 0;
  const gap = parseInt(getComputedStyle(slider).gap) || 0;
  return cards[0].offsetWidth + gap;
}

// ===== Update Slider =====
function updateSlider() {
  slider.style.transition = "transform 0.6s ease-in-out"; // smoother speed
  slider.style.transform = `translateX(-${cardWidth * currentIndex}px)`;
  prevTranslate = -currentIndex * cardWidth; // Sync drag position
}

// ===== Resize Fix =====
function updateCardWidth() {
  cardWidth = getCardWidth();
  updateSlider();
}

window.addEventListener("resize", updateCardWidth);
window.addEventListener("load", () => {
  updateCardWidth();
  startAutoSlide();
});

// ===== Auto Slide =====
function startAutoSlide() {
  clearInterval(autoSlideInterval);
  autoSlideInterval = setInterval(() => {
    currentIndex = (currentIndex + 1) % cards.length;
    updateSlider();
  }, 4000);
}

function stopAutoSlide() {
  clearInterval(autoSlideInterval);
}

// ===== Arrow Navigation =====
arrowLeft?.addEventListener("click", () => {
  if (currentIndex > 0) currentIndex--;
  else currentIndex = cards.length - 1; // Loop back
  updateSlider();
  startAutoSlide();
});

arrowRight?.addEventListener("click", () => {
  if (currentIndex < cards.length - 1) currentIndex++;
  else currentIndex = 0; // Loop to first
  updateSlider();
  startAutoSlide();
});

// ===== Drag & Swipe =====
slider.addEventListener("mousedown", touchStart);
slider.addEventListener("mouseup", touchEnd);
slider.addEventListener("mouseleave", touchEnd);
slider.addEventListener("mousemove", touchMove);

slider.addEventListener("touchstart", touchStart);
slider.addEventListener("touchend", touchEnd);
slider.addEventListener("touchmove", touchMove);

function touchStart(event) {
  isDragging = true;
  startPos = getPositionX(event);
  stopAutoSlide();
  slider.style.transition = "none";
  animationID = requestAnimationFrame(animation);
}

function touchEnd() {
  cancelAnimationFrame(animationID);
  isDragging = false;
  const movedBy = currentTranslate - prevTranslate;

  if (movedBy < -100 && currentIndex < cards.length - 1) currentIndex++;
  if (movedBy > 100 && currentIndex > 0) currentIndex--;

  setPositionByIndex();
  startAutoSlide();
}

function touchMove(event) {
  if (!isDragging) return;
  const currentPosition = getPositionX(event);
  currentTranslate = prevTranslate + currentPosition - startPos;
}

function getPositionX(event) {
  return event.type.includes("mouse") ? event.pageX : event.touches[0].clientX;
}

function animation() {
  setSliderPosition();
  if (isDragging) requestAnimationFrame(animation);
}

function setSliderPosition() {
  slider.style.transform = `translateX(${currentTranslate}px)`;
}

function setPositionByIndex() {
  currentTranslate = -currentIndex * cardWidth;
  prevTranslate = currentTranslate;
  slider.style.transition = "transform 0.6s ease";
  setSliderPosition();
}

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

const faqTriggers = document.querySelectorAll(".faq-drawer__trigger");

faqTriggers.forEach(trigger => {
  trigger.addEventListener("change", () => {
    if (trigger.checked) {
      faqTriggers.forEach(other => {
        if (other !== trigger) {
          other.checked = false;
        }
      });
    }
  });
});

});