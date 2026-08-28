/* Coverio — front-end interactions (no dependencies) */
(function () {
  "use strict";
  document.documentElement.classList.add("js");
  var nav = document.getElementById("nav");
  var toggle = document.getElementById("navToggle");
  var links = document.getElementById("navLinks");
  var scrim = document.getElementById("navScrim");
  if (toggle && nav && links) {
    var setMenu = function (open) {
      nav.classList.toggle("open", open);
      links.classList.toggle("is-open", open);
      toggle.classList.toggle("is-open", open);
      if (scrim) scrim.classList.toggle("is-open", open);
      document.body.style.overflow = open ? "hidden" : "";
    };
    var closeMenu = function () { setMenu(false); };
    toggle.addEventListener("click", function () { setMenu(!nav.classList.contains("open")); });
    links.addEventListener("click", function (e) {
      var a = e.target.closest("a");
      if (!a) return;
      document.body.style.overflow = "";
      setTimeout(closeMenu, 0);
      var href = a.getAttribute("href") || "";
      if (href.charAt(0) === "#" && href.length > 1) {
        e.preventDefault();
        var target = document.querySelector(href);
        if (target) {
          setTimeout(function () {
            target.scrollIntoView({ behavior: "instant", block: "start" });
            if (history.pushState) history.pushState(null, "", href);
          }, 80);
        }
      }
    });
    if (scrim) scrim.addEventListener("click", closeMenu);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("open")) closeMenu();
    });
  }

  var revealSel = ".reveal, .section h2, .tl-col, .cap-card, .hiw-card, .infra-row2, .traction-big, .traction-sm, .road-item, .member-card";
  var revealEls = document.querySelectorAll(revealSel);
  revealEls.forEach(function (el) { el.classList.add("reveal"); });
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add("in"); io.unobserve(entry.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  var counters = document.querySelectorAll(".count[data-to]");
  var animateCount = function (el) {
    var target = parseFloat(el.getAttribute("data-to")) || 0;
    var dur = 1400, start = null;
    var ease = function (t) { return 1 - Math.pow(1 - t, 3); };
    var step = function (ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      el.textContent = Math.round(ease(p) * target).toLocaleString();
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target.toLocaleString();
    };
    requestAnimationFrame(step);
  };
  if (counters.length) {
    if ("IntersectionObserver" in window) {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { animateCount(entry.target); cio.unobserve(entry.target); }
        });
      }, { threshold: 0.5 });
      counters.forEach(function (el) { cio.observe(el); });
    } else {
      counters.forEach(function (el) { el.textContent = el.getAttribute("data-to"); });
    }
  }

  var form = document.getElementById("demoForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var required = form.querySelectorAll("[required]"), ok = true;
      required.forEach(function (input) {
        if (!input.value.trim() || (input.type === "email" && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(input.value))) {
          ok = false; input.style.borderColor = "#B42318";
        } else { input.style.borderColor = ""; }
      });
      /* the success state is styled on the CTA slab that wraps this form */
      if (ok) (form.closest(".cta-slab") || form).classList.add("sent");
    });
  }

  var pwd = document.getElementById("password");
  var meter = document.getElementById("strengthBar");
  if (pwd && meter) {
    pwd.addEventListener("input", function () {
      var v = pwd.value, score = 0;
      if (v.length >= 8) score++;
      if (/[A-Z]/.test(v) && /[a-z]/.test(v)) score++;
      if (/\d/.test(v)) score++;
      if (/[^A-Za-z0-9]/.test(v)) score++;
      meter.style.width = [0, 25, 55, 80, 100][score] + "%";
      meter.style.background = ["", "#B42318", "#F59E0B", "#2FBF9E", "#16794F"][score];
    });
  }

  /* Footer wordmark — scale font-size so the brand name spans edge-to-edge */
  var wordmark = document.querySelector(".footer__wordmark span");
  if (wordmark) {
    var fitWordmark = function () {
      var container = wordmark.parentElement;
      wordmark.style.fontSize = "100px";
      var ratio = container.clientWidth / wordmark.scrollWidth;
      if (ratio > 0 && isFinite(ratio)) wordmark.style.fontSize = (100 * ratio) + "px";
    };
    var raf = window.requestAnimationFrame || function (cb) { setTimeout(cb, 0); };
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { raf(fitWordmark); });
    }
    raf(fitWordmark);
    var wmResizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(wmResizeTimer);
      wmResizeTimer = setTimeout(fitWordmark, 120);
    });
  }

  ["loginForm", "signupForm"].forEach(function (id) {
    var f = document.getElementById(id);
    if (f) {
      f.addEventListener("submit", function (e) {
        e.preventDefault();
        var btn = f.querySelector('button[type="submit"]');
        if (btn) { var label = btn.textContent; btn.textContent = "One moment…"; btn.disabled = true;
          setTimeout(function () {
            alert("This is a front-end template. Connect your auth backend to enable sign-in.");
            btn.textContent = label; btn.disabled = false;
          }, 600);
        }
      });
    }
  });
})();
