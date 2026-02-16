/* =============================================
   AAVE CLONE – LEARNING PROJECT
   Interactive behaviour with vanilla JS
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

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll(".faq__question").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.parentElement;
      const answer = item.querySelector(".faq__answer");
      const isOpen = item.classList.contains("active");

      // Close all
      document.querySelectorAll(".faq__item").forEach((faq) => {
        faq.classList.remove("active");
        faq.querySelector(".faq__answer").style.maxHeight = null;
        faq.querySelector(".faq__question").setAttribute("aria-expanded", "false");
      });

      // Open clicked (if it was closed)
      if (!isOpen) {
        item.classList.add("active");
        answer.style.maxHeight = answer.scrollHeight + "px";
        btn.setAttribute("aria-expanded", "true");
      }
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
    ".about__card",
    ".feature-card",
    ".stat-card",
    ".security-card",
    ".eco-logo",
    ".faq__item",
    ".governance__inner",
  ];

  animateSelectors.forEach((selector) => {
    document.querySelectorAll(selector).forEach((el, i) => {
      el.classList.add("fade-in");
      el.style.transitionDelay = `${i * 80}ms`;
      observer.observe(el);
    });
  });

  /* ---------- Counter animation for stats ---------- */
  const statValues = document.querySelectorAll(".stat-card__value");

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  statValues.forEach((el) => counterObserver.observe(el));

  function animateCounter(el) {
    const target = parseFloat(el.dataset.target);
    const prefix = el.dataset.prefix || "";
    const suffix = el.dataset.suffix || "";
    const duration = 1600;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = (target * ease).toFixed(target % 1 === 0 ? 0 : 1);
      el.textContent = `${prefix}${current}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  /* ---------- Newsletter form (demo) ---------- */
  const form = document.getElementById("newsletterForm");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = form.querySelector("input");
    const email = input.value.trim();

    if (email) {
      input.value = "";
      const btn = form.querySelector("button");
      btn.textContent = "Subscribed!";
      btn.style.opacity = "0.7";
      btn.disabled = true;

      setTimeout(() => {
        btn.textContent = "Sign Up";
        btn.style.opacity = "1";
        btn.disabled = false;
      }, 2500);
    }
  });

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
