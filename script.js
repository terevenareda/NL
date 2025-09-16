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
// ===== Elements =====
const slider = document.getElementById("cardSlider");
const cards = Array.from(slider.querySelectorAll(".card"));
const arrowLeft = document.querySelector(".arrow-svg.left");
const arrowRight = document.querySelector(".arrow-svg.right");

let currentIndex = 0;
let cardWidth = 0;
let autoSlideInterval;
let isDragging = false;
let isSwiping = false;     // whether we've detected horizontal intent
let startPos = 0;
let startY = 0;
let currentTranslate = 0;
let prevTranslate = 0;
let animationID;

// ===== Helpers =====
function getCardWidth() {
  if (!slider || !cards.length) return 0;
  const gap = parseInt(getComputedStyle(slider).gap) || 0;
  return cards[0].offsetWidth + gap;
}

function getPositionX(e) {
  if (e.type.includes("mouse")) return e.pageX;
  if (e.touches && e.touches[0]) return e.touches[0].clientX;
  if (e.changedTouches && e.changedTouches[0]) return e.changedTouches[0].clientX;
  return e.clientX || 0;
}
function getPositionY(e) {
  if (e.type.includes("mouse")) return e.pageY;
  if (e.touches && e.touches[0]) return e.touches[0].clientY;
  if (e.changedTouches && e.changedTouches[0]) return e.changedTouches[0].clientY;
  return e.clientY || 0;
}

function updateSlider() {
  slider.style.transition = "transform 0.6s ease-in-out";
  slider.style.transform = `translateX(-${cardWidth * currentIndex}px)`;
  prevTranslate = -currentIndex * cardWidth;
}

function updateCardWidth() {
  cardWidth = getCardWidth();
  updateSlider();
}

// ===== Resize / init =====
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
  currentIndex = currentIndex > 0 ? currentIndex - 1 : cards.length - 1;
  updateSlider();
  startAutoSlide();
});
arrowRight?.addEventListener("click", () => {
  currentIndex = currentIndex < cards.length - 1 ? currentIndex + 1 : 0;
  updateSlider();
  startAutoSlide();
});

// ===== Prevent image dragging on cards =====
cards.forEach(c => {
  c.addEventListener('dragstart', e => e.preventDefault());
});

// ===== Drag & Touch (with vertical/horizontal detection) =====
slider.addEventListener("mousedown", touchStart);
slider.addEventListener("mousemove", touchMove);
slider.addEventListener("mouseup", touchEnd);
slider.addEventListener("mouseleave", touchEnd);

slider.addEventListener("touchstart", touchStart, { passive: false });
slider.addEventListener("touchmove", touchMove, { passive: false });
slider.addEventListener("touchend", touchEnd, { passive: false });
slider.addEventListener("touchcancel", touchEnd, { passive: false });

function touchStart(event) {
  // ignore non-left mouse buttons
  if (event.type === "mousedown" && event.button !== 0) return;

  isDragging = true;
  isSwiping = false;
  startPos = getPositionX(event);
  startY = getPositionY(event);
  stopAutoSlide();
  slider.style.transition = "none";
  slider.classList.add('dragging');
  animationID = requestAnimationFrame(animation);

  // some events are cancelable; if so we can prevent default right away
  if (event.cancelable) event.preventDefault();
}

function touchMove(event) {
  if (!isDragging) return;

  const currentX = getPositionX(event);
  const currentY = getPositionY(event);
  const deltaX = currentX - startPos;
  const deltaY = currentY - startY;

  // If we haven't decided whether it's horizontal or vertical, detect intent:
  if (!isSwiping) {
    // small threshold so tiny moves don't block
    if (Math.abs(deltaX) > 10 && Math.abs(deltaX) > Math.abs(deltaY)) {
      isSwiping = true; // horizontal
    } else if (Math.abs(deltaY) > 10 && Math.abs(deltaY) > Math.abs(deltaX)) {
      // vertical scroll intent -> stop handling the drag so page scrolls
      isDragging = false;
      slider.classList.remove('dragging');
      startAutoSlide();
      return;
    } else {
      // uncertain yet
      return;
    }
  }

  // if we get here, it's horizontal swipe — prevent page scroll and update translate
  if (event.cancelable) event.preventDefault();
  currentTranslate = prevTranslate + deltaX;

  // optional: soft clamp to avoid too much overscroll visual
  const maxTranslate = 0 + 100; // allow 100px overscroll on first slide
  const minTranslate = -((cards.length - 1) * cardWidth) - 100; // overscroll last
  if (currentTranslate > maxTranslate) currentTranslate = maxTranslate;
  if (currentTranslate < minTranslate) currentTranslate = minTranslate;
}

function touchEnd() {
  cancelAnimationFrame(animationID);
  if (!isSwiping && !isDragging) {
    // we likely aborted due to vertical scroll - nothing to do
    return;
  }

  isDragging = false;
  slider.classList.remove('dragging');

  const movedBy = currentTranslate - prevTranslate;

  // threshold for change slide
  if (movedBy < -cardWidth * 0.25 && currentIndex < cards.length - 1) currentIndex++;
  if (movedBy > cardWidth * 0.25 && currentIndex > 0) currentIndex--;

  setPositionByIndex();
  startAutoSlide();
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