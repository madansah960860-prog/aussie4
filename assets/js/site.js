/* =========================================================================
   SOUTHERN LIGHT — behaviour
   Principles: nothing here is required to read the page. Every enhancement
   degrades to the visible, working default if JS or the observer never runs.
   ========================================================================= */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------------------------------------------------------- header */
  var header = $(".site-header");

  function measureHeader() {
    if (!header) return;
    document.documentElement.style.setProperty("--header-h", header.offsetHeight + "px");
  }

  function pinHeader() {
    if (!header) return;
    header.classList.toggle("is-pinned", window.scrollY > 24);
  }

  measureHeader();
  pinHeader();
  window.addEventListener("resize", measureHeader, { passive: true });
  window.addEventListener("scroll", pinHeader, { passive: true });

  /* ------------------------------------------------------ mobile nav */
  var toggle = $(".nav-toggle");
  var panel  = $(".nav-panel");

  if (toggle && panel) {
    var lastFocus = null;

    var setNav = function (open) {
      toggle.setAttribute("aria-expanded", String(open));
      panel.classList.toggle("is-open", open);
      if (header) header.classList.toggle("is-nav-open", open);
      document.body.style.overflow = open ? "hidden" : "";
      toggle.querySelector(".nav-toggle__label").textContent = open ? "Close" : "Menu";
      if (open) {
        lastFocus = document.activeElement;
        var first = panel.querySelector("a");
        if (first) first.focus();
      } else if (lastFocus) {
        lastFocus.focus();
      }
    };

    toggle.addEventListener("click", function () {
      setNav(toggle.getAttribute("aria-expanded") !== "true");
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") setNav(false);
    });

    // keep focus inside the panel while it owns the screen
    panel.addEventListener("keydown", function (e) {
      if (e.key !== "Tab") return;
      var items = $$("a, button", panel).filter(function (el) { return el.offsetParent !== null; });
      if (!items.length) return;
      var first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });

    $$(".nav-panel__link", panel).forEach(function (a) {
      a.addEventListener("click", function () { setNav(false); });
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 880 && toggle.getAttribute("aria-expanded") === "true") setNav(false);
    }, { passive: true });
  }

  /* --------------------------------------------------------- reveals */
  var revealSel = ".reveal, .reveal--wipe, .reveal--rule, .reveal--zoom, .stagger";
  var targets = $$(revealSel);

  // stagger children get their index up front so CSS can offset the delay
  $$(".stagger").forEach(function (group) {
    Array.prototype.forEach.call(group.children, function (child, i) {
      child.style.setProperty("--i", i);
    });
  });

  function revealAll() {
    targets.forEach(function (el) { el.classList.add("is-in"); });
  }

  if (reduced.matches || !("IntersectionObserver" in window)) {
    revealAll();
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.08 });

    targets.forEach(function (el) { io.observe(el); });

    // failsafe: if the observer never fires (hidden tab, headless render,
    // prerender), the page must not ship blank.
    window.setTimeout(revealAll, 1400);
    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "visible") window.setTimeout(revealAll, 600);
    });
  }

  /* ------------------------------------------------------------ hero */
  var hero = $(".hero, .pagehead");
  if (hero) {
    var lockup = $(".hero__inner, .pagehead__inner", hero);
    if (lockup) {
      Array.prototype.forEach.call(lockup.children, function (child, i) {
        child.style.setProperty("--i", i);
      });
    }
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { hero.classList.add("is-ready"); });
    });
  }

  /* -------------------------------------------------------- parallax */
  var parallax = $$(".media--parallax");
  var canParallax = parallax.length &&
                    !reduced.matches &&
                    window.matchMedia("(min-width: 56rem) and (pointer: fine)").matches;

  if (canParallax) {
    var ticking = false;

    var frame = function () {
      var vh = window.innerHeight;
      parallax.forEach(function (box) {
        var r = box.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        var img = box.querySelector("img");
        if (!img) return;
        // -1 when the box is below the fold, +1 when above it
        var progress = (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2);
        var shift = Math.max(-1, Math.min(1, progress)) * (parseFloat(box.dataset.depth) || 7);
        img.style.transform = "scale(1.14) translate3d(0," + shift.toFixed(2) + "%,0)";
      });
      ticking = false;
    };

    var onScroll = function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(frame);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    frame();
  }

  /* --------------------------------------------------- experience filter */
  var filterBar = $("[data-filters]");
  if (filterBar) {
    var items = $$("[data-tags]");
    var status = $("[data-filter-status]");
    var empty = $("[data-filter-empty]");
    var buttons = $$(".filter", filterBar);

    // show the real count on each filter up front
    buttons.forEach(function (btn) {
      var key = btn.dataset.filter;
      var n = key === "all"
        ? items.length
        : items.filter(function (el) { return el.dataset.tags.split(" ").indexOf(key) > -1; }).length;
      var slot = btn.querySelector(".filter__n");
      if (slot) slot.textContent = n;
    });

    var apply = function (key) {
      var shown = 0;
      items.forEach(function (el) {
        var match = key === "all" || el.dataset.tags.split(" ").indexOf(key) > -1;
        el.classList.toggle("is-filtered-out", !match);
        if (match) shown++;
      });
      buttons.forEach(function (b) {
        b.setAttribute("aria-pressed", String(b.dataset.filter === key));
      });
      if (status) {
        status.textContent = shown === items.length
          ? "Showing all " + items.length + " experiences."
          : "Showing " + shown + " of " + items.length + " experiences.";
      }
      if (empty) empty.hidden = shown !== 0;
    };

    buttons.forEach(function (b) {
      b.addEventListener("click", function () { apply(b.dataset.filter); });
    });
    apply("all");
  }

  /* ------------------------------------------------------- scroll spy */
  var subnav = $(".subnav");
  if (subnav && "IntersectionObserver" in window) {
    var links = $$(".subnav__link", subnav);
    var sections = links
      .map(function (a) { return document.getElementById(a.getAttribute("href").slice(1)); })
      .filter(Boolean);

    if (sections.length) {
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          links.forEach(function (a) {
            a.classList.toggle("is-active", a.getAttribute("href") === "#" + entry.target.id);
          });
        });
      }, { rootMargin: "-30% 0px -60% 0px" });
      sections.forEach(function (s) { spy.observe(s); });
    }
  }

  /* -------------------------------------------------------------- form */
  var form = $("[data-enquiry]");
  if (form) {
    var out = $("[data-form-status]", form);

    var fieldOf = function (input) { return input.closest(".field"); };

    var validate = function (input) {
      var field = fieldOf(input);
      if (!field) return true;
      var ok = input.checkValidity();
      field.setAttribute("data-invalid", String(!ok));
      var msg = field.querySelector(".field__error");
      if (msg && !ok) {
        msg.textContent = input.dataset.error || input.validationMessage;
      }
      input.setAttribute("aria-invalid", String(!ok));
      return ok;
    };

    $$("input, select, textarea", form).forEach(function (input) {
      // validate on the way out, not on every keystroke
      input.addEventListener("blur", function () { validate(input); });
      input.addEventListener("input", function () {
        if (fieldOf(input) && fieldOf(input).getAttribute("data-invalid") === "true") validate(input);
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var inputs = $$("input, select, textarea", form);
      var bad = inputs.filter(function (i) { return !validate(i); });

      if (bad.length) {
        if (out) out.hidden = true;
        bad[0].focus();
        return;
      }

      if (out) {
        out.hidden = false;
        out.querySelector("[data-form-name]").textContent =
          (form.querySelector("#name") || {}).value || "Traveller";
      }
      form.reset();
      $$(".field", form).forEach(function (f) { f.setAttribute("data-invalid", "false"); });
    });
  }

  /* -------------------------------------------------------------- misc */
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
