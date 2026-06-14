/* MEDNIXIS — shared site behavior */
(function () {
  "use strict";

  const header = document.querySelector(".site-header");
  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 10);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const toggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");
  if (toggle && navLinks) {
    toggle.addEventListener("click", () => {
      const open = navLinks.classList.toggle("open");
      toggle.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", String(open));
      document.body.style.overflow = open ? "hidden" : "";
    });
    navLinks.querySelectorAll("a").forEach(a =>
      a.addEventListener("click", () => {
        navLinks.classList.remove("open");
        toggle.classList.remove("open");
        document.body.style.overflow = "";
      })
    );
    const servicesBtn = document.querySelector(".has-dropdown > a");
    if (servicesBtn) {
      servicesBtn.addEventListener("click", e => {
        if (window.innerWidth <= 960) {
          e.preventDefault();
          servicesBtn.parentElement.classList.toggle("open-sub");
        }
      });
    }
  }

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const revealEls = document.querySelectorAll(".reveal");
  if (reduced || !("IntersectionObserver" in window)) {
    revealEls.forEach(el => el.classList.add("visible"));
  } else {
    const io = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); } }),
      { threshold: 0.10, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(el => io.observe(el));
  }

  const path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a.nav-item").forEach(a => {
    if (a.getAttribute("href") === path) a.classList.add("active");
  });

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
