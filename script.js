/* =============================================
   LINGUA CONCEPT – Interactive behaviour
   ============================================= */

document.addEventListener("DOMContentLoaded", () => {
  /* ---------- Header scroll effect ---------- */
  const header = document.querySelector(".header");

  const onScroll = () => {
    header.classList.toggle("scrolled", window.scrollY > 40);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile nav toggle ---------- */
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");

  navToggle.addEventListener("click", () => {
    navLinks.classList.toggle("active");
    navToggle.classList.toggle("active");
  });

  // Close mobile menu on link click
  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("active");
      navToggle.classList.remove("active");
    });
  });

  /* ---------- Scroll-triggered animations ---------- */
  const observerOptions = {
    threshold: 0.15,
    rootMargin: "0px 0px -40px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Tag elements for animation
  const animateSelectors = [
    ".builder-card",
    ".governance__inner",
  ];

  animateSelectors.forEach((selector) => {
    document.querySelectorAll(selector).forEach((el, i) => {
      el.classList.add("fade-in");
      el.style.transitionDelay = `${i * 80}ms`;
      observer.observe(el);
    });
  });

  /* ---------- Perks horizontal drag slider ---------- */
  const slider = document.querySelector(".about-perks__scroll");
  if (slider) {
    let isDown = false;
    let startX;
    let scrollLeft;

    slider.addEventListener("mousedown", (e) => {
      isDown = true;
      slider.classList.add("is-dragging");
      startX = e.pageX - slider.offsetLeft;
      scrollLeft = slider.scrollLeft;
    });

    slider.addEventListener("mouseleave", () => {
      isDown = false;
      slider.classList.remove("is-dragging");
    });

    slider.addEventListener("mouseup", () => {
      isDown = false;
      slider.classList.remove("is-dragging");
    });

    slider.addEventListener("mousemove", (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - startX) * 1.5;
      slider.scrollLeft = scrollLeft - walk;
    });

    /* Auto-scroll */
    const scrollSpeed = 1;
    let paused = false;

    function autoScroll() {
      if (!paused) {
        slider.scrollLeft += scrollSpeed;
        if (slider.scrollLeft >= slider.scrollWidth - slider.clientWidth) {
          slider.scrollLeft = 0;
        }
      }
      requestAnimationFrame(autoScroll);
    }

    requestAnimationFrame(autoScroll);

    // Pause on hover / drag / touch — use the whole slider wrapper
    const sliderWrapper = slider.closest(".about-perks__slider");
    const perksSection = slider.closest(".about-perks");

    if (sliderWrapper) {
      sliderWrapper.addEventListener("mouseenter", () => { paused = true; });
      sliderWrapper.addEventListener("mouseleave", () => { paused = false; isDown = false; slider.classList.remove("is-dragging"); });
    }
    slider.addEventListener("touchstart", () => { paused = true; }, { passive: true });
    slider.addEventListener("touchend", () => { paused = false; });

    /* Arrow buttons — manual smooth scroll */
    const leftBtn = document.querySelector(".about-perks__arrow--left");
    const rightBtn = document.querySelector(".about-perks__arrow--right");
    const cardWidth = 280 + 16; // card flex-basis + gap

    function smoothScrollBy(distance) {
      paused = true;
      const start = slider.scrollLeft;
      const target = start + distance;
      const duration = 350;
      let startTime = null;

      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const ease = progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        slider.scrollLeft = start + distance * ease;
        if (progress < 1) {
          requestAnimationFrame(step);
        }
      }
      requestAnimationFrame(step);
    }

    if (leftBtn) {
      leftBtn.addEventListener("click", () => smoothScrollBy(-cardWidth));
    }
    if (rightBtn) {
      rightBtn.addEventListener("click", () => smoothScrollBy(cardWidth));
    }
  }

  /* ---------- Pill staggered fade-in on scroll ---------- */
  const pillsContainer = document.getElementById("uslugePills");
  if (pillsContainer) {
    const groups = pillsContainer.querySelectorAll(".usluge-table__group");
    const pillObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          groups.forEach((group, i) => {
            group.style.animationDelay = `${i * 80}ms`;
            group.classList.add("pill-visible");
          });
          pillObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    pillObserver.observe(pillsContainer);
  }

  /* ---------- Section title word-by-word animations ---------- */
  const sectionTitles = document.querySelectorAll([
    ".section-title",
    ".about-hero__heading",
    ".about-vcard__title",
    ".about-perks__title",
    ".about-services__title",
    ".usluge-hero__title",
    ".usluge-section__title",
    ".page-hero__title",
    ".quote-section__title",
    ".price-cta__title",
    ".kontakt-form-card__title",
  ].join(", "));

  // Split each title's text into individual word <span>s
  sectionTitles.forEach((el) => {
    const words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words.map((w) => `<span class="title-word">${w}</span>`).join(" ");
  });

  const titleTimers = new Map();

  const titleObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const el = entry.target;
      const words = el.querySelectorAll(".title-word");

      // Cancel any pending timers for this element
      (titleTimers.get(el) || []).forEach(clearTimeout);

      if (entry.isIntersecting) {
        const timers = Array.from(words).map((word, i) =>
          setTimeout(() => word.classList.add("word-visible"), i * 90)
        );
        titleTimers.set(el, timers);
      } else {
        words.forEach((word) => word.classList.remove("word-visible"));
      }
    });
  }, { threshold: 0.3 });

  sectionTitles.forEach((el) => titleObserver.observe(el));

  /* ---------- Section block reveal on scroll (forms, cards) ---------- */
  const revealEls = document.querySelectorAll(".section-reveal");
  if (revealEls.length) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    revealEls.forEach((el) => revealObserver.observe(el));
  }

  /* ---------- Hero illustration: typing + direction switching ---------- */
  const heroSrcFlag  = document.getElementById("heroSrcFlag");
  const heroSrcCode  = document.getElementById("heroSrcCode");
  const heroSrcText  = document.getElementById("heroSrcText");
  const heroDestFlag = document.getElementById("heroDestFlag");
  const heroDestCode = document.getElementById("heroDestCode");
  const heroDestLang = document.getElementById("heroDestLang");
  const heroDestText = document.getElementById("heroDestText");
  const heroTypingCursor = document.getElementById("heroTypingCursor");
  const heroDocLang  = document.querySelector(".hero__doc--left .hero__doc-lang");
  const langBadges   = document.querySelectorAll(".hero__lang-badge");
  const swapBtn      = document.getElementById("swapBtn");

  const HR_TEXT = "Točni i pouzdani prijevodi za vaše poslovne potrebe.";
  let typingTimer = null;
  let loopTimer = null;
  let mode = "to-hr"; // "to-hr" | "from-hr"

  function typeText(text, delay = 0) {
    if (!heroDestText || !heroTypingCursor) return;
    clearTimeout(typingTimer);
    clearTimeout(loopTimer);
    heroDestText.textContent = "";
    heroTypingCursor.classList.remove("hero__typing-cursor--done");
    let i = 0;
    function type() {
      if (i < text.length) {
        heroDestText.textContent += text[i++];
        typingTimer = setTimeout(type, 38);
      } else {
        // Wait 4 seconds, then clear and restart
        loopTimer = setTimeout(() => typeText(text, 0), 4000);
      }
    }
    typingTimer = setTimeout(type, delay);
  }

  function getActiveLang() {
    const b = document.querySelector(".hero__lang-badge--active");
    return b ? { flag: b.dataset.flag, code: b.dataset.code, text: b.dataset.text } : null;
  }

  function swapLeftCard(flag, code, text) {
    heroDocLang.style.opacity = "0";
    heroSrcText.style.opacity = "0";
    setTimeout(() => {
      heroSrcFlag.textContent = flag;
      heroSrcCode.textContent = code;
      heroSrcText.textContent = text;
      heroDocLang.style.opacity = "1";
      heroSrcText.style.opacity = "1";
    }, 300);
  }

  function swapRightLang(flag, code) {
    heroDestLang.style.opacity = "0";
    setTimeout(() => {
      heroDestFlag.textContent = flag;
      heroDestCode.textContent = code;
      heroDestLang.style.opacity = "1";
    }, 300);
  }

  function setMode(newMode) {
    if (mode === newMode) return;
    mode = newMode;
    const lang = getActiveLang();

    if (swapBtn) swapBtn.classList.toggle("hero__swap-btn--swapped", mode === "from-hr");

    if (mode === "to-hr") {
      if (lang) swapLeftCard(lang.flag, lang.code, lang.text);
      swapRightLang("🇭🇷", "HR");
      typeText(HR_TEXT, 400);
    } else {
      swapLeftCard("🇭🇷", "HR", HR_TEXT);
      if (lang) swapRightLang(lang.flag, lang.code);
      if (lang) typeText(lang.text, 400);
    }
  }

  if (swapBtn) swapBtn.addEventListener("click", () => setMode(mode === "to-hr" ? "from-hr" : "to-hr"));

  // Initial page-load type
  typeText(HR_TEXT, 800);

  langBadges.forEach((badge) => {
    badge.addEventListener("click", () => {
      if (badge.classList.contains("hero__lang-badge--active")) return;
      langBadges.forEach((b) => b.classList.remove("hero__lang-badge--active"));
      badge.classList.add("hero__lang-badge--active");

      if (mode === "to-hr") {
        swapLeftCard(badge.dataset.flag, badge.dataset.code, badge.dataset.text);
        typeText(HR_TEXT, 380);
      } else {
        swapRightLang(badge.dataset.flag, badge.dataset.code);
        typeText(badge.dataset.text, 0);
      }
    });
  });

  /* ---------- Page hero: 3D tilt + parallax scroll ---------- */
  const pageHeroWraps = document.querySelectorAll(".page-hero__image-wrap");

  pageHeroWraps.forEach((wrap) => {
    let tiltX = 0, tiltY = 0;

    function applyHeroTransform() {
      if (window.matchMedia("(max-width: 768px)").matches) {
        wrap.style.transform = "none";
        return;
      }
      const parallax = window.pageYOffset * 0.2;
      wrap.style.transform = `perspective(900px) rotateY(${tiltY}deg) rotateX(${tiltX}deg) translateY(${parallax}px)`;
    }

    wrap.addEventListener("mousemove", (e) => {
      wrap.classList.remove("tilt-resetting");
      const rect = wrap.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      tiltY = ((e.clientX - cx) / (rect.width / 2)) * 8;
      tiltX = -((e.clientY - cy) / (rect.height / 2)) * 6;
      applyHeroTransform();
    });

    wrap.addEventListener("mouseleave", () => {
      wrap.classList.add("tilt-resetting");
      tiltX = 0;
      tiltY = 0;
      applyHeroTransform();
      setTimeout(() => wrap.classList.remove("tilt-resetting"), 500);
    });

    window.addEventListener("scroll", applyHeroTransform, { passive: true });
    applyHeroTransform();
  });

  /* ---------- Kontakt form — client-side validation ---------- */
  const kontaktForm = document.getElementById("kontaktForm");
  if (kontaktForm) {
    const fields = {
      ime:    { input: document.getElementById("kf-ime"),    error: document.getElementById("err-ime") },
      email:  { input: document.getElementById("kf-email"),  error: document.getElementById("err-email") },
      poruka: { input: document.getElementById("kf-poruka"), error: document.getElementById("err-poruka") },
    };

    function validateField(key) {
      const { input, error } = fields[key];
      const val = input.value.trim();
      let msg = "";

      if (key === "ime") {
        if (val.length === 0)        msg = "Ime i prezime je obavezno.";
        else if (val.length > 100)   msg = "Ime može sadržavati najviše 100 znakova.";
      } else if (key === "email") {
        if (val.length === 0)                                  msg = "E-mail adresa je obavezna.";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val))    msg = "Unesite valjanu e-mail adresu.";
      } else if (key === "poruka") {
        if (val.length === 0)        msg = "Poruka je obavezna.";
        else if (val.length < 10)    msg = "Poruka mora sadržavati najmanje 10 znakova.";
        else if (val.length > 2000)  msg = "Poruka može sadržavati najviše 2000 znakova.";
      }

      const valid = msg === "";
      error.textContent = msg;
      input.classList.toggle("is-invalid", !valid);
      error.classList.toggle("is-visible", !valid);
      return valid;
    }

    // Live validation on blur
    Object.keys(fields).forEach((key) => {
      fields[key].input.addEventListener("blur", () => validateField(key));
      fields[key].input.addEventListener("input", () => {
        if (fields[key].input.classList.contains("is-invalid")) validateField(key);
      });
    });

    const successPanel = document.getElementById("kontaktSuccess");
    const resetBtn = document.getElementById("kontaktReset");
    const formHeader = kontaktForm.closest(".kontakt-form-card").querySelector(".kontakt-form-card__header");

    function showSuccess() {
      if (formHeader) formHeader.hidden = true;
      kontaktForm.hidden = true;
      successPanel.hidden = false;
    }

    function resetForm() {
      kontaktForm.reset();
      Object.keys(fields).forEach((key) => {
        fields[key].input.classList.remove("is-invalid");
        fields[key].error.classList.remove("is-visible");
      });
      successPanel.hidden = true;
      kontaktForm.hidden = false;
      if (formHeader) formHeader.hidden = false;
    }

    // Generic form-level error
    const submitBtn = document.getElementById("kfSubmit");
    let formErrorEl = null;
    function showFormError(msg) {
      if (!formErrorEl) {
        formErrorEl = document.createElement("p");
        formErrorEl.className = "kontakt-form__form-error";
        submitBtn.parentElement.insertBefore(formErrorEl, submitBtn);
      }
      formErrorEl.textContent = msg;
      formErrorEl.hidden = false;
    }
    function clearFormError() {
      if (formErrorEl) formErrorEl.hidden = true;
    }

    kontaktForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearFormError();
      const allValid = Object.keys(fields).map(validateField).every(Boolean);
      if (!allValid) return;

      submitBtn.classList.add("is-loading");
      submitBtn.disabled = true;

      const telefon = document.getElementById("kf-telefon")?.value.trim();
      let message = fields.poruka.input.value.trim();
      if (telefon) message = `Tel: ${telefon}\n\n${message}`;

      try {
        const res = await fetch("https://web-compose.onrender.com/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            "app-id": "my-app",
            "service-id": "contact-service",
            name: fields.ime.input.value.trim(),
            email: fields.email.input.value.trim(),
            message,
          }),
        });

        if (res.ok) {
          showSuccess();
        } else if (res.status === 429) {
          showFormError("Previše zahtjeva. Molimo pokušajte za nekoliko minuta.");
        } else {
          showFormError("Došlo je do pogreške. Molimo pokušajte ponovno.");
        }
      } catch {
        showFormError("Nije moguće uspostaviti vezu. Provjerite internetsku vezu i pokušajte ponovno.");
      } finally {
        submitBtn.classList.remove("is-loading");
        submitBtn.disabled = false;
      }
    });

    if (resetBtn) resetBtn.addEventListener("click", resetForm);
  }

  /* ---------- O nama: read-more toggle (mobile only) ---------- */
  const readMoreBtn = document.getElementById("aboutReadMore");
  const expandable  = document.getElementById("aboutExpandable");

  if (readMoreBtn && expandable) {
    readMoreBtn.addEventListener("click", () => {
      const isOpen = expandable.classList.toggle("is-open");
      readMoreBtn.classList.toggle("is-open", isOpen);
      readMoreBtn.setAttribute("aria-expanded", isOpen);
      readMoreBtn.querySelector(".about-intro__read-more-text").textContent =
        isOpen ? "Prikaži manje" : "Pročitaj više o meni";
    });
  }

  /* ---------- Smooth scroll for anchor links ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const href = anchor.getAttribute("href");
      if (href === "#") return;

      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  /* ---------- CTA inline contact form ---------- */
  const ctaContactBtn = document.getElementById("ctaContactBtn");
  const ctaFormWrap   = document.getElementById("ctaFormWrap");

  if (ctaContactBtn && ctaFormWrap) {
    ctaContactBtn.addEventListener("click", () => {
      const opening = ctaFormWrap.hidden;
      ctaFormWrap.hidden = !opening;
      if (opening) {
        // Re-trigger the animation by forcing a reflow
        ctaFormWrap.style.animation = "none";
        ctaFormWrap.offsetHeight; // reflow
        ctaFormWrap.style.animation = "";
        setTimeout(() => ctaFormWrap.scrollIntoView({ behavior: "smooth", block: "nearest" }), 50);
      }
    });

    const ctaFields = {
      ime:    { input: document.getElementById("cf-ime"),    error: document.getElementById("cerr-ime") },
      email:  { input: document.getElementById("cf-email"),  error: document.getElementById("cerr-email") },
      poruka: { input: document.getElementById("cf-poruka"), error: document.getElementById("cerr-poruka") },
    };

    function validateCtaField(key) {
      const { input, error } = ctaFields[key];
      const val = input.value.trim();
      let msg = "";

      if (key === "ime") {
        if (val.length === 0)        msg = "Ime i prezime je obavezno.";
        else if (val.length > 100)   msg = "Ime može sadržavati najviše 100 znakova.";
      } else if (key === "email") {
        if (val.length === 0)                                  msg = "E-mail adresa je obavezna.";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val))    msg = "Unesite valjanu e-mail adresu.";
      } else if (key === "poruka") {
        if (val.length === 0)        msg = "Poruka je obavezna.";
        else if (val.length < 10)    msg = "Poruka mora sadržavati najmanje 10 znakova.";
        else if (val.length > 2000)  msg = "Poruka može sadržavati najviše 2000 znakova.";
      }

      const valid = msg === "";
      error.textContent = msg;
      input.classList.toggle("is-invalid", !valid);
      error.classList.toggle("is-visible", !valid);
      return valid;
    }

    Object.keys(ctaFields).forEach((key) => {
      ctaFields[key].input.addEventListener("blur", () => validateCtaField(key));
      ctaFields[key].input.addEventListener("input", () => {
        if (ctaFields[key].input.classList.contains("is-invalid")) validateCtaField(key);
      });
    });

    const ctaForm    = document.getElementById("ctaForm");
    const ctaSuccess = document.getElementById("ctaSuccess");
    const ctaReset   = document.getElementById("ctaReset");
    const ctaSubmit  = document.getElementById("ctaSubmit");
    let ctaFormErrorEl = null;

    function showCtaFormError(msg) {
      if (!ctaFormErrorEl) {
        ctaFormErrorEl = document.createElement("p");
        ctaFormErrorEl.className = "price-cta__form-error is-visible";
        ctaSubmit.parentElement.insertBefore(ctaFormErrorEl, ctaSubmit);
      }
      ctaFormErrorEl.textContent = msg;
      ctaFormErrorEl.hidden = false;
    }

    function clearCtaFormError() {
      if (ctaFormErrorEl) ctaFormErrorEl.hidden = true;
    }

    ctaForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearCtaFormError();
      const allValid = Object.keys(ctaFields).map(validateCtaField).every(Boolean);
      if (!allValid) return;

      ctaSubmit.classList.add("is-loading");
      ctaSubmit.disabled = true;

      const telefon = document.getElementById("cf-telefon")?.value.trim();
      let message = ctaFields.poruka.input.value.trim();
      if (telefon) message = `Tel: ${telefon}\n\n${message}`;

      try {
        const res = await fetch("https://web-compose.onrender.com/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            "app-id": "my-app",
            "service-id": "contact-service",
            name: ctaFields.ime.input.value.trim(),
            email: ctaFields.email.input.value.trim(),
            message,
          }),
        });

        if (res.ok) {
          ctaForm.hidden = true;
          ctaSuccess.hidden = false;
          ctaSuccess.scrollIntoView({ behavior: "smooth", block: "nearest" });
        } else if (res.status === 429) {
          showCtaFormError("Previše zahtjeva. Molimo pokušajte za nekoliko minuta.");
        } else {
          showCtaFormError("Došlo je do pogreške. Molimo pokušajte ponovno.");
        }
      } catch {
        showCtaFormError("Nije moguće uspostaviti vezu. Provjerite internetsku vezu i pokušajte ponovno.");
      } finally {
        ctaSubmit.classList.remove("is-loading");
        ctaSubmit.disabled = false;
      }
    });

    if (ctaReset) {
      ctaReset.addEventListener("click", () => {
        ctaForm.reset();
        Object.keys(ctaFields).forEach((key) => {
          ctaFields[key].input.classList.remove("is-invalid");
          ctaFields[key].error.classList.remove("is-visible");
        });
        clearCtaFormError();
        ctaSuccess.hidden = true;
        ctaForm.hidden = false;
      });
    }
  }

  /* ---------- Mobile accordion (Cjenik page) ---------- */
  (function initCjenikAccordion() {
    const sections = document.querySelectorAll(".accordion-section");
    if (!sections.length) return;

    const MOBILE_BP = 768;
    const chevronSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`;

    sections.forEach((section) => {
      const h2 = section.querySelector(".usluge-section__title");
      const body = section.querySelector(".accordion-body");
      if (!h2 || !body) return;

      // Wrap h2 in accordion-header and append chevron button
      const header = document.createElement("div");
      header.className = "accordion-header";
      h2.parentNode.insertBefore(header, h2);
      header.appendChild(h2);

      const btn = document.createElement("button");
      btn.className = "accordion-toggle";
      btn.type = "button";
      btn.setAttribute("aria-expanded", "false");
      btn.innerHTML = chevronSVG;
      header.appendChild(btn);

      function openSection() {
        section.classList.add("accordion-section--open");
        btn.setAttribute("aria-expanded", "true");
        body.style.maxHeight = body.scrollHeight + "px";
      }

      function closeSection() {
        section.classList.remove("accordion-section--open");
        btn.setAttribute("aria-expanded", "false");
        body.style.maxHeight = "0";
      }

      header.addEventListener("click", () => {
        if (window.innerWidth > MOBILE_BP) return;
        section.classList.contains("accordion-section--open")
          ? closeSection()
          : openSection();
      });

      // Reset inline styles when resizing between desktop and mobile
      function syncState() {
        if (window.innerWidth > MOBILE_BP) {
          body.style.maxHeight = "";
          body.style.opacity = "";
          section.classList.remove("accordion-section--open");
          btn.setAttribute("aria-expanded", "false");
        } else {
          if (!section.classList.contains("accordion-section--open")) {
            body.style.maxHeight = "0";
          }
        }
      }

      window.addEventListener("resize", syncState, { passive: true });
    });
  })();

  /* ---------- Cookie consent banner ---------- */
  const COOKIE_KEY = "lc_cookie_consent";

  if (!localStorage.getItem(COOKIE_KEY)) {
    const banner = document.createElement("div");
    banner.className = "cookie-banner";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-label", "Obavijest o kolačićima");
    banner.innerHTML = `
      <p class="cookie-banner__text">
        Ova web stranica koristi kolačiće kako bi poboljšala korisničko iskustvo.
        <a href="kolacici.html">Saznajte više</a>
      </p>
      <div class="cookie-banner__actions">
        <button class="cookie-banner__btn cookie-banner__btn--ghost" id="cookieNecessary">Samo nužni</button>
        <button class="cookie-banner__btn cookie-banner__btn--accept" id="cookieAcceptAll">Prihvati sve</button>
      </div>
    `;
    document.body.appendChild(banner);

    // Animate in after a short delay
    requestAnimationFrame(() => {
      requestAnimationFrame(() => banner.classList.add("cookie-banner--visible"));
    });

    function dismissBanner(choice) {
      localStorage.setItem(COOKIE_KEY, choice);
      banner.classList.remove("cookie-banner--visible");
      banner.addEventListener("transitionend", () => banner.remove(), { once: true });
    }

    document.getElementById("cookieNecessary").addEventListener("click", () => dismissBanner("necessary"));
    document.getElementById("cookieAcceptAll").addEventListener("click", () => dismissBanner("all"));
  }

  /* ---------- Quote form (Cjenik page) ---------- */
  const quoteForm    = document.getElementById("quoteForm");
  const quoteSuccess = document.getElementById("quoteSuccess");
  const quoteReset   = document.getElementById("quoteReset");
  const quoteSubmit  = document.getElementById("quoteSubmit");

  if (quoteForm) {
    const quoteFields = {
      ime:   { input: document.getElementById("qf-ime"),   error: document.getElementById("qerr-ime") },
      email: { input: document.getElementById("qf-email"), error: document.getElementById("qerr-email") },
      jezik: { input: document.getElementById("qf-jezik"), error: document.getElementById("qerr-jezik") },
      tekst: { input: document.getElementById("qf-tekst"), error: document.getElementById("qerr-tekst") },
    };

    function validateQuoteField(key) {
      const { input, error } = quoteFields[key];
      const val = input.value.trim();
      let msg = "";

      if (key === "ime") {
        if (val.length === 0)      msg = "Ime i prezime je obavezno.";
        else if (val.length > 100) msg = "Ime može sadržavati najviše 100 znakova.";
      } else if (key === "email") {
        if (val.length === 0)                                 msg = "E-mail adresa je obavezna.";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val))   msg = "Unesite valjanu e-mail adresu.";
      } else if (key === "jezik") {
        if (val.length === 0) msg = "Odaberite jezični par.";
      } else if (key === "tekst") {
        if (val.length === 0)       msg = "Tekst ili opis upita je obavezan.";
        else if (val.length < 10)   msg = "Opis mora sadržavati najmanje 10 znakova.";
        else if (val.length > 5000) msg = "Tekst može sadržavati najviše 5000 znakova.";
      }

      const valid = msg === "";
      error.textContent = msg;
      input.classList.toggle("is-invalid", !valid);
      error.classList.toggle("is-visible", !valid);
      return valid;
    }

    Object.keys(quoteFields).forEach((key) => {
      quoteFields[key].input.addEventListener("blur", () => validateQuoteField(key));
      quoteFields[key].input.addEventListener("input", () => {
        if (quoteFields[key].input.classList.contains("is-invalid")) validateQuoteField(key);
      });
      // Also validate selects on change
      quoteFields[key].input.addEventListener("change", () => validateQuoteField(key));
    });

    let quoteFormErrorEl = null;

    function showQuoteFormError(msg) {
      if (!quoteFormErrorEl) {
        quoteFormErrorEl = document.createElement("p");
        quoteFormErrorEl.className = "quote-form__error is-visible";
        quoteSubmit.parentElement.insertBefore(quoteFormErrorEl, quoteSubmit);
      }
      quoteFormErrorEl.textContent = msg;
      quoteFormErrorEl.hidden = false;
    }

    function clearQuoteFormError() {
      if (quoteFormErrorEl) quoteFormErrorEl.hidden = true;
    }

    quoteForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearQuoteFormError();
      const allValid = Object.keys(quoteFields).map(validateQuoteField).every(Boolean);
      if (!allValid) return;

      quoteSubmit.classList.add("is-loading");
      quoteSubmit.disabled = true;

      const jezik = document.getElementById("qf-jezik").value;
      const rok   = document.getElementById("qf-rok")?.value;
      let message = `Jezični par: ${jezik}`;
      if (rok) message += `\nRok isporuke: ${rok}`;
      message += `\n\nTekst / opis upita:\n${quoteFields.tekst.input.value.trim()}`;

      try {
        const res = await fetch("https://web-compose.onrender.com/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            "app-id": "my-app",
            "service-id": "contact-service",
            name: quoteFields.ime.input.value.trim(),
            email: quoteFields.email.input.value.trim(),
            message,
          }),
        });

        if (res.ok) {
          quoteForm.hidden = true;
          quoteSuccess.hidden = false;
          quoteSuccess.scrollIntoView({ behavior: "smooth", block: "nearest" });
        } else if (res.status === 429) {
          showQuoteFormError("Previše zahtjeva. Molimo pokušajte za nekoliko minuta.");
        } else {
          showQuoteFormError("Došlo je do pogreške. Molimo pokušajte ponovno.");
        }
      } catch {
        showQuoteFormError("Nije moguće uspostaviti vezu. Provjerite internetsku vezu i pokušajte ponovno.");
      } finally {
        quoteSubmit.classList.remove("is-loading");
        quoteSubmit.disabled = false;
      }
    });

    if (quoteReset) {
      quoteReset.addEventListener("click", () => {
        quoteForm.reset();
        Object.keys(quoteFields).forEach((key) => {
          quoteFields[key].input.classList.remove("is-invalid");
          quoteFields[key].error.classList.remove("is-visible");
        });
        clearQuoteFormError();
        quoteSuccess.hidden = true;
        quoteForm.hidden = false;
      });
    }
  }
});
