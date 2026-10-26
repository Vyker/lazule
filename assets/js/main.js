/**
 * LAZULE — main.js
 * Side-nav drawer, quick-add feedback, newsletter placeholder, year stamp.
 */
(function () {
  "use strict";

  /* ---------- Side navigation drawer ---------- */
  var toggleBtn = document.getElementById("nav-menu-toggle-btn");
  var overlay = document.getElementById("side-nav-drawer-overlay");
  var backdrop = document.getElementById("side-nav-backdrop");
  var panel = document.getElementById("side-nav-panel");
  var closeBtn = document.getElementById("side-nav-close-btn");

  function openDrawer() {
    overlay.style.visibility = "visible";
    overlay.classList.remove("opacity-0", "pointer-events-none");
    backdrop.classList.remove("opacity-0");
    panel.classList.remove("-translate-x-full");
    document.body.style.overflow = "hidden";
  }

  function closeDrawer() {
    panel.classList.add("-translate-x-full");
    backdrop.classList.add("opacity-0");
    overlay.classList.add("opacity-0", "pointer-events-none");
    setTimeout(function () {
      if (panel.classList.contains("-translate-x-full")) {
        overlay.style.visibility = "hidden";
      }
    }, 500);
    document.body.style.overflow = "";
  }

  if (toggleBtn) toggleBtn.addEventListener("click", openDrawer);
  if (closeBtn) closeBtn.addEventListener("click", closeDrawer);
  if (backdrop) backdrop.addEventListener("click", closeDrawer);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && overlay && overlay.style.visibility === "visible") {
      closeDrawer();
    }
  });
  // Close the drawer when a destination link inside it is chosen
  if (panel) {
    panel.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener("click", closeDrawer);
    });
  }

  /* ---------- Quick Add feedback notification ---------- */
  document.querySelectorAll(".quick-add").forEach(function (el) {
    el.addEventListener("click", function (e) {
      e.preventDefault();
      if (el.dataset.busy) return;
      el.dataset.busy = "1";
      var prevText = el.textContent;
      el.textContent = "ADDED TO BAG ✦";
      el.classList.add("bg-secondary");
      setTimeout(function () {
        el.textContent = prevText;
        el.classList.remove("bg-secondary");
        delete el.dataset.busy;
      }, 1800);
    });
  });

  /* ---------- Newsletter (frontend placeholder — no backend yet) ---------- */
  var form = document.getElementById("newsletter-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = form.querySelector('input[type="email"]');
      if (!email || !email.value || email.validity.typeMismatch || email.validity.valueMissing) {
        email.focus();
        return;
      }
      form.classList.add("hidden");
      var thanks = document.getElementById("newsletter-thanks");
      if (thanks) thanks.classList.remove("hidden");
    });
  }

  /* ---------- Year stamp ---------- */
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
