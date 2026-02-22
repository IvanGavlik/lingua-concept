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
});
