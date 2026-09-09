document.addEventListener("DOMContentLoaded", () => {
  initPreloader();
  initApp();
});

function initPreloader() {
  const preloader = document.getElementById("page-preloader");
  if (!preloader) return;

  const hide = () => preloader.classList.add("hidden");

  // Hide after 2 seconds minimum, or when page fully loads — whichever is later
  const minDelay = new Promise((resolve) => setTimeout(resolve, 2000));
  const pageLoad = new Promise((resolve) => {
    if (document.readyState === "complete") resolve();
    else window.addEventListener("load", resolve, { once: true });
  });

  Promise.all([minDelay, pageLoad]).then(hide);
}

function initApp() {
  setupFavicon();
  setupEmptyLinks404Redirect();
  loadHeaderComponent();
  loadFooterComponent();
  initializeScrollToTop();
  initializeWishlistButtons();
  initializeFinanceCalculator();
  initializeNewsletterForm();
  initializeCarsFilter();
  initializeContactForm();
  initScrollReveal();
}

/* Ensures the Stackly logo is used as the favicon for all pages */
function setupFavicon() {
  const isPagesDir = window.location.pathname.includes("/pages/");
  const basePath = isPagesDir ? "../" : "./";
  const faviconHref = `${basePath}assets/images/stackly-logo.webp`;

  let favicon = document.querySelector("link[rel~='icon']");
  if (!favicon) {
    favicon = document.createElement("link");
    favicon.rel = "icon";
    favicon.type = "image/webp";
    document.head.appendChild(favicon);
  }
  favicon.href = faviconHref;
}

/* Loads header.html into the page (if a placeholder is present) or initializes existing header */
async function loadHeaderComponent() {
  const headerPlaceholder =
    document.getElementById("header-placeholder") ||
    document.querySelector("header");

  // If the header HTML is already statically in the DOM, just initialize events
  if (
    headerPlaceholder &&
    headerPlaceholder.classList.contains("site-header")
  ) {
    initializeHeaderNavigation();
    return;
  }

  if (!headerPlaceholder) return;

  const isPagesDir = window.location.pathname.includes("/pages/");
  const componentPath = isPagesDir
    ? "components/header.html"
    : "pages/components/header.html";

  try {
    const response = await fetch(componentPath);
    if (!response.ok)
      throw new Error(`Failed to load header component: ${response.status}`);

    const html = await response.text();
    headerPlaceholder.outerHTML = html;

    adjustHeaderPaths(isPagesDir);
    initializeHeaderNavigation();
  } catch (error) {
    console.warn(
      "Component fetch fallback (e.g. running from local file system without server):",
      error,
    );
    initializeHeaderNavigation();
  }
}

/**
 * Loads footer.html into the page (if a placeholder is present)
 */
async function loadFooterComponent() {
  const footerPlaceholder =
    document.getElementById("footer-placeholder") ||
    document.querySelector("footer");

  if (
    footerPlaceholder &&
    footerPlaceholder.classList.contains("site-footer")
  ) {
    initializeScrollToTop();
    return;
  }

  if (!footerPlaceholder) return;

  const isPagesDir = window.location.pathname.includes("/pages/");
  const componentPath = isPagesDir
    ? "components/footer.html"
    : "pages/components/footer.html";

  try {
    const response = await fetch(componentPath);
    if (!response.ok)
      throw new Error(`Failed to load footer component: ${response.status}`);

    const html = await response.text();
    footerPlaceholder.outerHTML = html;

    adjustFooterPaths(isPagesDir);
    initializeScrollToTop();
    if (typeof window.reobserveScrollReveal === "function") {
      window.reobserveScrollReveal();
    }
  } catch (error) {
    console.warn(
      "Component fetch fallback (e.g. running from local file system without server):",
      error,
    );
    initializeScrollToTop();
    if (typeof window.reobserveScrollReveal === "function") {
      window.reobserveScrollReveal();
    }
  }
}

/**
 * Adjusts relative paths for header links and images based on page location
 */
function adjustHeaderPaths(isPagesDir) {
  const header = document.querySelector(".site-header");
  if (!header) return;

  const logoImg = header.querySelector(".logo-img");
  const logoLink = header.querySelector(".header-logo");
  const navLinks = header.querySelectorAll(".nav-link");
  const wishlistBtn = header.querySelector(".wishlist-btn");

  const allLoginBtns = header.querySelectorAll(".btn-outline-login");
  const allRegisterBtns = header.querySelectorAll(".btn-primary-drive");

  if (isPagesDir) {
    if (logoImg) logoImg.src = "../assets/images/stackly-logo.webp";
    if (logoLink) logoLink.href = "../index.html";

    navLinks.forEach((link) => {
      const page = link.getAttribute("data-page");
      if (page === "home") {
        link.href = "../index.html";
      } else {
        link.href = `${page}.html`;
      }
    });

    allLoginBtns.forEach((btn) => {
      btn.href = "login.html";
    });
    allRegisterBtns.forEach((btn) => {
      btn.href = "register.html";
    });
    if (wishlistBtn) wishlistBtn.href = "cars.html";
  } else {
    if (logoImg) logoImg.src = "assets/images/stackly-logo.webp";
    if (logoLink) logoLink.href = "index.html";

    navLinks.forEach((link) => {
      const page = link.getAttribute("data-page");
      if (page === "home") {
        link.href = "index.html";
      } else {
        link.href = `pages/${page}.html`;
      }
    });

    allLoginBtns.forEach((btn) => {
      btn.href = "pages/login.html";
    });
    allRegisterBtns.forEach((btn) => {
      btn.href = "pages/register.html";
    });
    if (wishlistBtn) wishlistBtn.href = "pages/cars.html";
  }
}

/**
 * Adjusts relative paths for footer links and images based on page location
 */
function adjustFooterPaths(isPagesDir) {
  const footer = document.querySelector(".site-footer");
  if (!footer) return;

  const logoImg = footer.querySelector(".footer-logo-img");
  const logoLink = footer.querySelector(".footer-logo");
  const carImg = footer.querySelector(".footer-car-image");
  const footerNavLinks = footer.querySelectorAll(".footer-nav-link");

  if (isPagesDir) {
    if (logoImg) logoImg.src = "../assets/images/stackly-logo.webp";
    if (logoLink) logoLink.href = "../index.html";
    if (carImg) carImg.src = "../assets/images/footer-image.webp";

    footerNavLinks.forEach((link) => {
      const href = link.getAttribute("href");
      if (href) {
        if (href === "index.html" || href.endsWith("/index.html")) {
          link.href = "../index.html";
        } else if (href.startsWith("pages/")) {
          link.href = href.replace("pages/", "");
        }
      }
    });
  } else {
    if (logoImg) logoImg.src = "assets/images/stackly-logo.webp";
    if (logoLink) logoLink.href = "index.html";
    if (carImg) carImg.src = "assets/images/footer-image.webp";

    footerNavLinks.forEach((link) => {
      const href = link.getAttribute("href");
      if (href) {
        if (href === "../index.html") {
          link.href = "index.html";
        } else if (
          !href.startsWith("pages/") &&
          !href.startsWith("http") &&
          !href.startsWith("#") &&
          !href.includes("index.html")
        ) {
          link.href = `pages/${href}`;
        }
      }
    });
  }
}

/**
 * Initializes navigation events, active item highlight, and mobile toggle
 */
function initializeHeaderNavigation() {
  const currentPath = window.location.pathname.toLowerCase();
  const navLinks = document.querySelectorAll(".nav-link");

  // Highlight active link based on current URL or body data-page
  const bodyPage = document.body.getAttribute("data-page");

  navLinks.forEach((link) => {
    link.classList.remove("active");
    const page = link.getAttribute("data-page");

    if (bodyPage && bodyPage === page) {
      link.classList.add("active");
    } else if (!bodyPage) {
      if (
        (currentPath === "/" ||
          currentPath.endsWith("index.html") ||
          currentPath === "") &&
        page === "home"
      ) {
        link.classList.add("active");
      } else if (page && currentPath.includes(page)) {
        link.classList.add("active");
      }
    }
  });

  // Mobile menu toggle
  const toggleBtn = document.getElementById("mobile-menu-toggle");
  const headerNav = document.getElementById("header-nav");

  if (toggleBtn && headerNav) {
    toggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = headerNav.classList.toggle("open");
      toggleBtn.classList.toggle("active", isOpen);
      toggleBtn.setAttribute("aria-expanded", isOpen);
    });

    // Close when clicking outside
    document.addEventListener("click", (e) => {
      if (
        !headerNav.contains(e.target) &&
        !toggleBtn.contains(e.target) &&
        headerNav.classList.contains("open")
      ) {
        headerNav.classList.remove("open");
        toggleBtn.classList.remove("active");
        toggleBtn.setAttribute("aria-expanded", "false");
      }
    });

    // Close on nav link click
    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        headerNav.classList.remove("open");
        toggleBtn.classList.remove("active");
        toggleBtn.setAttribute("aria-expanded", "false");
      });
    });
  }
}

/**
 * Initializes wishlist heart button toggle functionality
 */
function initializeWishlistButtons() {
  const wishlistButtons = document.querySelectorAll(".wishlist-toggle-btn");
  wishlistButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      btn.classList.toggle("active");
      const icon = btn.querySelector("i");
      if (icon) {
        if (btn.classList.contains("active")) {
          icon.classList.remove("fa-regular");
          icon.classList.add("fa-solid");
        } else {
          icon.classList.remove("fa-solid");
          icon.classList.add("fa-regular");
        }
      }
    });
  });
}

/**
 * Initializes Finance EMI Calculator with interactive calculations and Indian currency formatting
 */
function initializeFinanceCalculator() {
  const priceInput = document.getElementById("car-price");
  const downPaymentInput = document.getElementById("down-payment");
  const interestInput = document.getElementById("interest-rate");
  const tenureInput = document.getElementById("loan-tenure");
  const calculateBtn = document.getElementById("calculate-emi-btn");
  const emiDisplay = document.getElementById("result-emi-display");

  if (
    !priceInput ||
    !downPaymentInput ||
    !interestInput ||
    !tenureInput ||
    !emiDisplay
  ) {
    return;
  }

  function parseNumber(val) {
    if (typeof val !== "string") val = String(val || "");
    const cleaned = val.replace(/[^0-9.]/g, "");
    return parseFloat(cleaned) || 0;
  }

  function formatCurrency(num) {
    return "₹ " + Math.round(num).toLocaleString("en-IN");
  }

  function calculateEMI() {
    const carPrice = parseNumber(priceInput.value);
    const downPayment = parseNumber(downPaymentInput.value);
    const annualRate = parseNumber(interestInput.value);
    const tenureYears = parseNumber(tenureInput.value);

    const principal = Math.max(0, carPrice - downPayment);
    const monthlyRate = annualRate / 12 / 100;
    const months = tenureYears * 12;

    if (principal <= 0 || months <= 0) {
      emiDisplay.textContent = "₹ 0 /-";
      return;
    }

    let monthlyEMI = 0;
    if (monthlyRate === 0) {
      monthlyEMI = principal / months;
    } else {
      const compoundFactor = Math.pow(1 + monthlyRate, months);
      monthlyEMI =
        (principal * monthlyRate * compoundFactor) / (compoundFactor - 1);
    }

    if (isNaN(monthlyEMI) || !isFinite(monthlyEMI)) {
      emiDisplay.textContent = "₹ 0 /-";
    } else {
      emiDisplay.textContent = `${formatCurrency(monthlyEMI)} /-`;
    }
  }

  // Format currency inputs on blur / focus
  [priceInput, downPaymentInput].forEach((input) => {
    input.addEventListener("blur", () => {
      const num = parseNumber(input.value);
      if (num > 0) {
        input.value = formatCurrency(num);
      }
    });

    input.addEventListener("focus", () => {
      const num = parseNumber(input.value);
      if (num > 0) {
        input.value = num;
      }
    });
  });

  if (calculateBtn) {
    calculateBtn.addEventListener("click", (e) => {
      e.preventDefault();
      calculateEMI();
    });
  }
}

/**
 * Handles Newsletter Subscription Form submission
 */
function initializeNewsletterForm() {
  const newsletterForm = document.getElementById("newsletter-form");
  const emailInput = document.getElementById("newsletter-email");
  const submitBtn = newsletterForm?.querySelector(".btn-newsletter-subscribe");

  if (!newsletterForm || !emailInput || !submitBtn) return;

  newsletterForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();

    if (!email || !email.includes("@")) {
      emailInput.focus();
      return;
    }

    const originalBtnHTML = submitBtn.innerHTML;
    submitBtn.innerHTML =
      '<i class="fa-solid fa-check"></i> <span>Subscribed!</span>';
    submitBtn.style.backgroundColor = "#16a34a";
    emailInput.value = "";
    emailInput.disabled = true;

    setTimeout(() => {
      submitBtn.innerHTML = originalBtnHTML;
      submitBtn.style.backgroundColor = "";
      emailInput.disabled = false;
    }, 3500);
  });
}

/**
 * Initializes interactive filtering on the Cars page hero filter bar
 */
function initializeCarsFilter() {
  const filterMake = document.getElementById("filter-make");
  const filterModel = document.getElementById("filter-model");
  const filterPrice = document.getElementById("filter-price");
  const filterFuel = document.getElementById("filter-fuel");
  const filterTransmission = document.getElementById("filter-transmission");
  const carCards = document.querySelectorAll(".cars-grid .car-card");

  if (!filterMake || !carCards.length) return;

  const filters = [
    filterMake,
    filterModel,
    filterPrice,
    filterFuel,
    filterTransmission,
  ];

  function applyFilters() {
    const selectedMake = filterMake.value.toLowerCase().trim();
    const selectedModel = filterModel.value.toLowerCase().trim();
    const selectedPrice = filterPrice.value.trim();
    const selectedFuel = filterFuel.value.toLowerCase().trim();
    const selectedTransmission = filterTransmission.value.toLowerCase().trim();

    let minPrice = 0;
    let maxPrice = Infinity;
    if (selectedPrice && selectedPrice.includes("-")) {
      const [minStr, maxStr] = selectedPrice.split("-");
      minPrice = parseFloat(minStr) || 0;
      maxPrice = parseFloat(maxStr) || Infinity;
    }

    let matchCount = 0;

    carCards.forEach((card) => {
      const make = (card.getAttribute("data-make") || "").toLowerCase();
      const model = (card.getAttribute("data-model") || "").toLowerCase();
      const price = parseFloat(card.getAttribute("data-price")) || 0;
      const fuel = (card.getAttribute("data-fuel") || "").toLowerCase();
      const transmission = (
        card.getAttribute("data-transmission") || ""
      ).toLowerCase();

      const matchesMake = !selectedMake || make === selectedMake;
      const matchesModel = !selectedModel || model === selectedModel;
      const matchesPrice =
        !selectedPrice || (price >= minPrice && price <= maxPrice);
      const matchesFuel = !selectedFuel || fuel === selectedFuel;
      const matchesTransmission =
        !selectedTransmission || transmission === selectedTransmission;

      if (
        matchesMake &&
        matchesModel &&
        matchesPrice &&
        matchesFuel &&
        matchesTransmission
      ) {
        card.style.display = "";
        matchCount++;
      } else {
        card.style.display = "none";
      }
    });

    const grid = document.querySelector(".cars-grid");
    let noResultsMsg = document.getElementById("cars-no-results");
    if (matchCount === 0) {
      if (!noResultsMsg && grid) {
        noResultsMsg = document.createElement("div");
        noResultsMsg.id = "cars-no-results";
        noResultsMsg.className = "no-cars-message";
        noResultsMsg.innerHTML =
          '<p style="text-align: center; grid-column: 1 / -1; padding: 3rem 1rem; font-size: 1.15rem; color: #64748b;"><i class="fa-solid fa-car" style="font-size: 2rem; display: block; margin-bottom: 0.75rem; color: #94a3b8;"></i>No cars found matching your selected criteria. Try resetting the filters.</p>';
        grid.appendChild(noResultsMsg);
      } else if (noResultsMsg) {
        noResultsMsg.style.display = "";
      }
    } else if (noResultsMsg) {
      noResultsMsg.style.display = "none";
    }
  }

  filters.forEach((filter) => {
    if (filter) {
      filter.addEventListener("change", applyFilters);
    }
  });
}

/**
 * Initializes Scroll to Top button behavior and interactions
 */
function initializeScrollToTop() {
  let scrollBtn = document.getElementById("scroll-to-top");

  // Fallback: If button does not exist in DOM yet, create it dynamically
  if (!scrollBtn) {
    scrollBtn = document.createElement("button");
    scrollBtn.type = "button";
    scrollBtn.id = "scroll-to-top";
    scrollBtn.className = "scroll-to-top";
    scrollBtn.setAttribute("aria-label", "Scroll to top");
    scrollBtn.setAttribute("title", "Scroll to top");
    scrollBtn.innerHTML =
      '<i class="fa-solid fa-arrow-up" aria-hidden="true"></i>';
    document.body.appendChild(scrollBtn);
  }

  // Prevent attaching duplicate listeners
  if (scrollBtn.dataset.initialized === "true") return;
  scrollBtn.dataset.initialized = "true";

  // Toggle visibility depending on scroll distance
  const handleScroll = () => {
    if (window.scrollY > 300) {
      scrollBtn.classList.add("visible");
    } else {
      scrollBtn.classList.remove("visible");
    }
  };

  window.addEventListener("scroll", handleScroll, { passive: true });
  // Initial check on load
  handleScroll();

  // Smooth scroll to top on click
  scrollBtn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
}

/**
 * Initializes Contact Page Form and strict input restrictions
 * - Prevents typing numbers or special characters in Full Name / Username field
 * - Prevents typing letters or special characters in Phone Number field
 */
function initializeContactForm() {
  const contactForm = document.getElementById("contact-us-form");
  const nameInput = document.getElementById("contact-fullname");
  const phoneInput = document.getElementById("contact-phone");
  const emailInput = document.getElementById("contact-email");
  const subjectInput = document.getElementById("contact-subject");
  const messageInput = document.getElementById("contact-message");
  const statusAlert = document.getElementById("contact-form-alert");

  /* --- Full Name / Username: STRICTLY Letters (A-Z, a-z) & Spaces only --- */
  if (nameInput) {
    // 1. Prevent non-alphabet keys on keydown before they are typed
    nameInput.addEventListener("keydown", (e) => {
      // Allow navigation and editing control keys
      const allowedKeys = [
        "Backspace",
        "Delete",
        "Tab",
        "Escape",
        "Enter",
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "Home",
        "End",
        "PageUp",
        "PageDown",
      ];

      if (allowedKeys.includes(e.key)) return;

      // Allow Ctrl/Command shortcuts (Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+Z)
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      // Only allow letters and single space (block space if last char is already a space)
      if (e.key.length === 1) {
        if (!/^[a-zA-Z\s]$/.test(e.key)) {
          e.preventDefault();
        } else if (
          e.key === " " &&
          (nameInput.value.length === 0 || nameInput.value.slice(-1) === " ")
        ) {
          e.preventDefault();
        }
      }
    });

    // 2. Prevent invalid input for mobile / virtual keyboards / IME
    nameInput.addEventListener("beforeinput", (e) => {
      if (e.data && !/^[a-zA-Z\s]+$/.test(e.data)) {
        e.preventDefault();
      }
    });

    // 3. Fallback sanitizer on input event
    nameInput.addEventListener("input", (e) => {
      let sanitized = e.target.value.replace(/[^a-zA-Z\s]/g, "");
      // Prevent leading space and multiple consecutive spaces
      sanitized = sanitized.replace(/^ +/, "").replace(/ {2,}/g, " ");
      if (e.target.value !== sanitized) {
        e.target.value = sanitized;
      }
      e.target.classList.remove("input-error");
    });

    // 4. Handle paste strictly
    nameInput.addEventListener("paste", (e) => {
      e.preventDefault();
      const clipboardText = (e.clipboardData || window.clipboardData).getData(
        "text",
      );
      const cleanText = clipboardText.replace(/[^a-zA-Z\s]/g, "");
      if (cleanText) {
        const start = nameInput.selectionStart || 0;
        const end = nameInput.selectionEnd || 0;
        const originalVal = nameInput.value;
        nameInput.value =
          originalVal.substring(0, start) +
          cleanText +
          originalVal.substring(end);
        const newPos = start + cleanText.length;
        nameInput.setSelectionRange(newPos, newPos);
      }
    });
  }

  /* --- Phone Number: STRICTLY Digits (0-9) only --- */
  if (phoneInput) {
    // 1. Prevent non-digit keys on keydown before they are typed
    phoneInput.addEventListener("keydown", (e) => {
      const allowedKeys = [
        "Backspace",
        "Delete",
        "Tab",
        "Escape",
        "Enter",
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "Home",
        "End",
        "PageUp",
        "PageDown",
      ];

      if (allowedKeys.includes(e.key)) return;

      // Allow Ctrl/Command shortcuts
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      // Only allow 0-9 digits
      if (e.key.length === 1) {
        if (!/^[0-9]$/.test(e.key)) {
          e.preventDefault();
        }
      }
    });

    // 2. Prevent invalid input on beforeinput
    phoneInput.addEventListener("beforeinput", (e) => {
      if (e.data && !/^[0-9]+$/.test(e.data)) {
        e.preventDefault();
      }
    });

    // 3. Fallback sanitizer on input event
    phoneInput.addEventListener("input", (e) => {
      const sanitized = e.target.value.replace(/[^0-9]/g, "");
      if (e.target.value !== sanitized) {
        e.target.value = sanitized;
      }
      e.target.classList.remove("input-error");
    });

    // 4. Handle paste strictly
    phoneInput.addEventListener("paste", (e) => {
      e.preventDefault();
      const clipboardText = (e.clipboardData || window.clipboardData).getData(
        "text",
      );
      const cleanText = clipboardText.replace(/[^0-9]/g, "");
      if (cleanText) {
        const start = phoneInput.selectionStart || 0;
        const end = phoneInput.selectionEnd || 0;
        const originalVal = phoneInput.value;
        phoneInput.value =
          originalVal.substring(0, start) +
          cleanText +
          originalVal.substring(end);
        const newPos = start + cleanText.length;
        phoneInput.setSelectionRange(newPos, newPos);
      }
    });
  }

  // Clear error styling on input for other fields
  [emailInput, subjectInput, messageInput].forEach((inputEl) => {
    if (inputEl) {
      inputEl.addEventListener("input", () => {
        inputEl.classList.remove("input-error");
      });
    }
  });

  /* --- Form Submit Handler --- */
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const nameVal = nameInput ? nameInput.value.trim() : "";
      const emailVal = emailInput ? emailInput.value.trim() : "";
      const phoneVal = phoneInput ? phoneInput.value.trim() : "";
      const subjectVal = subjectInput ? subjectInput.value.trim() : "";
      const messageVal = messageInput ? messageInput.value.trim() : "";

      let isValid = true;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!nameVal) {
        if (nameInput) nameInput.classList.add("input-error");
        isValid = false;
      }
      if (!emailVal || !emailRegex.test(emailVal)) {
        if (emailInput) emailInput.classList.add("input-error");
        isValid = false;
      }
      if (!phoneVal || phoneVal.length !== 10) {
        if (phoneInput) phoneInput.classList.add("input-error");
        isValid = false;
      }
      if (!subjectVal) {
        if (subjectInput) subjectInput.classList.add("input-error");
        isValid = false;
      }
      if (!messageVal) {
        if (messageInput) messageInput.classList.add("input-error");
        isValid = false;
      }

      if (!isValid) {
        if (statusAlert) {
          statusAlert.className = "contact-form-alert alert-error";
          statusAlert.style.display = "block";
          statusAlert.innerHTML =
            '<i class="fa-solid fa-triangle-exclamation" style="margin-right: 6px;"></i> Please fill in all required fields with valid information.';
        }
        return;
      }

      // Success state
      if (statusAlert) {
        statusAlert.className = "contact-form-alert alert-success";
        statusAlert.style.display = "block";
        statusAlert.innerHTML = `<i class="fa-solid fa-circle-check" style="margin-right: 6px;"></i> Thank you, <strong>${nameVal}</strong>! Your inquiry regarding "<strong>${subjectVal}</strong>" has been received. Our team will contact you shortly at <strong>${phoneVal}</strong>.`;
      }

      // Reset form
      contactForm.reset();

      // Clear success notification after 7 seconds
      setTimeout(() => {
        if (statusAlert) {
          statusAlert.style.display = "none";
        }
      }, 7000);
    });
  }
}

/**
 * Intercepts clicks on empty links, '#', or placeholder links across the entire project
 * and redirects the user to the 404 Not Found page.
 */
function setupEmptyLinks404Redirect() {
  document.addEventListener("click", (event) => {
    const anchor = event.target.closest("a");
    if (!anchor) return;

    // Ignore if on the 404 page itself and clicking 'Back to Home' or Go Back
    if (anchor.id === "homeRedirectionBtn" || anchor.id === "goBackBtn") return;

    // Allow modal toggles or specific interaction components
    if (
      anchor.hasAttribute("data-bs-toggle") ||
      anchor.hasAttribute("data-modal") ||
      anchor.classList.contains("modal-trigger") ||
      anchor.classList.contains("wishlist-toggle-btn")
    ) {
      return;
    }

    const href = anchor.getAttribute("href");

    // Detect empty href, '#', '#!', or 'javascript:void(0)' or whitespace
    const isEmptyOrHash =
      href === null ||
      href === "" ||
      href === "#" ||
      href === "#!" ||
      href.trim() === "" ||
      href.trim() === "#" ||
      href.toLowerCase() === "javascript:void(0)" ||
      href.toLowerCase() === "javascript:void(0);" ||
      href.toLowerCase() === "javascript:;";

    if (isEmptyOrHash) {
      event.preventDefault();
      event.stopPropagation();

      const isPagesDir = window.location.pathname.includes("/pages/");
      const target404 = isPagesDir ? "404.html" : "pages/404.html";
      window.location.href = target404;
    }
  });
}

/**
 * ============================================================================
 * SCROLL REVEAL ANIMATION ENGINE (All Pages & Sections Except Dashboard)
 * ============================================================================
 */
function initScrollReveal() {
  // 1. Explicitly ignore dashboard pages to maintain crisp dashboard performance
  const isDashboard =
    document.body.classList.contains("dashboard-body") ||
    document.body.getAttribute("data-page") === "dashboard" ||
    window.location.pathname.toLowerCase().includes("dashboard");

  if (isDashboard) {
    return;
  }

  // 2. Comprehensive section and grid element targeting rules
  const revealRules = [
    // Hero banner contents across pages
    {
      selector:
        ".hero-content, .about-hero-content, .services-hero-content, .cars-hero-content, .blog-hero-content, .contact-hero-content",
      effect: "sr-zoom-in",
    },
    { selector: ".cars-filter-bar", effect: "sr-from-top" },

    // Section headers & badges across all sections
    {
      selector:
        ".section-header, .about-section-header, .services-section-header, .contact-section-header",
      effect: "sr-reveal",
    },

    // Home Page card grids with stagger
    {
      container: ".popular-cars-section .cars-grid",
      items: ".car-card",
      effect: "sr-reveal",
    },
    {
      container: ".why-choose-us-section .why-cards-grid",
      items: ".why-card",
      effect: "sr-reveal",
    },
    {
      container: ".browse-brands-section .brands-grid",
      items: ".brand-card",
      effect: "sr-reveal",
    },
    {
      container: ".featured-services-section .services-grid",
      items: ".service-card",
      effect: "sr-reveal",
    },
    {
      container: ".testimonials-section .reviews-grid",
      items: ".review-card",
      effect: "sr-reveal",
    },
    {
      container: ".latest-blog-section .blog-grid",
      items: ".blog-card",
      effect: "sr-reveal",
    },

    // Home Page Finance Calculator Columns
    {
      selector: ".finance-calc-section .calc-inputs-col",
      effect: "sr-from-left",
    },
    {
      selector:
        ".finance-calc-section .calc-result-col, .finance-calc-section .calc-result-card",
      effect: "sr-from-right",
    },

    // Newsletter & CTA Banners
    {
      selector: ".newsletter-section .newsletter-top-card",
      effect: "sr-zoom-in",
    },
    {
      selector:
        ".newsletter-section .newsletter-bottom-row, .about-cta-section .newsletter-bottom-row, .services-cta-section .newsletter-bottom-row, .cars-cta-section .newsletter-bottom-row",
      effect: "sr-from-bottom",
    },

    // About Us Page Sections
    {
      selector: ".who-we-are-grid .who-we-are-img-col",
      effect: "sr-from-left",
    },
    {
      selector: ".who-we-are-grid .who-we-are-content-col",
      effect: "sr-from-right",
    },
    {
      container: ".our-values-grid",
      items: ".value-card",
      effect: "sr-reveal",
    },
    {
      container: ".our-process-grid",
      items: ".process-step",
      effect: "sr-reveal",
    },
    {
      selector: ".our-process-car-img, .about-car-visual",
      effect: "sr-from-right",
    },
    {
      container: ".our-team-grid",
      items: ".team-card",
      effect: "sr-reveal",
    },

    // Services Page Sections
    {
      container: ".services-listing-section .services-grid",
      items: ".service-detail-card",
      effect: "sr-reveal",
    },
    {
      container: ".why-service-grid",
      items: ".why-service-card",
      effect: "sr-reveal",
    },
    {
      container: ".service-process-grid",
      items: ".process-step-card",
      effect: "sr-reveal",
    },
    {
      selector: ".service-booking-section .booking-form-card",
      effect: "sr-zoom-in",
    },
    {
      container: ".services-faq-section .faq-accordion",
      items: ".faq-item",
      effect: "sr-reveal",
    },

    // Cars Page Sections
    {
      container: ".cars-page-section .cars-grid, .cars-grid",
      items: ".car-card",
      effect: "sr-reveal",
    },
    { selector: ".cars-pagination", effect: "sr-from-bottom" },

    // Blog Page Sections
    {
      container: ".blog-listing-section .blog-grid",
      items: ".blog-card",
      effect: "sr-reveal",
    },

    // Contact Page Sections
    {
      container: ".contact-info-cards-grid",
      items: ".contact-info-card",
      effect: "sr-reveal",
    },
    {
      selector: ".contact-form-card, .contact-form-wrapper",
      effect: "sr-from-left",
    },
    {
      selector: ".contact-showroom-card, .contact-showroom-wrapper",
      effect: "sr-from-right",
    },
    {
      selector: ".contact-map-section, .contact-map-wrapper",
      effect: "sr-from-bottom",
    },

    // 404 Error Page Content
    { selector: ".error-content-col", effect: "sr-from-left" },
    { selector: ".error-car-col", effect: "sr-from-right" },
    { selector: ".error-badge-wrapper", effect: "sr-zoom-in" },

    // Standalone sections fallback
    {
      selector:
        "main > section:not(.hero-section):not(.about-hero-section):not(.services-hero-section):not(.cars-hero-section):not(.blog-hero-section):not(.contact-hero-section)",
      effect: "sr-reveal",
    },

    // Site Footer Component
    {
      container: ".site-footer .footer-top-grid",
      items: ".footer-column",
      effect: "sr-reveal",
    },
    { selector: ".site-footer .footer-bottom-bar", effect: "sr-from-bottom" },
  ];

  // Helper to apply classes and stagger indices
  function applyRevealClasses(scope = document) {
    revealRules.forEach((rule) => {
      if (rule.container && rule.items) {
        const containers = scope.querySelectorAll(rule.container);
        containers.forEach((container) => {
          const items = container.querySelectorAll(rule.items);
          items.forEach((item, index) => {
            if (!item.classList.contains("sr-reveal")) {
              item.classList.add("sr-reveal");
              if (rule.effect && rule.effect !== "sr-reveal") {
                item.classList.add(rule.effect);
              }
              const delayIndex = (index % 8) + 1;
              item.classList.add(`sr-delay-${delayIndex}`);
            }
          });
        });
      } else if (rule.selector) {
        const elements = scope.querySelectorAll(rule.selector);
        elements.forEach((el) => {
          if (!el.classList.contains("sr-reveal")) {
            el.classList.add("sr-reveal");
            if (rule.effect && rule.effect !== "sr-reveal") {
              el.classList.add(rule.effect);
            }
          }
        });
      }
    });

    // Also pick up any custom [data-reveal] or .reveal elements
    scope.querySelectorAll("[data-reveal], .reveal").forEach((el) => {
      el.classList.add("sr-reveal");
      const dir = el.getAttribute("data-reveal");
      if (dir === "left") el.classList.add("sr-from-left");
      else if (dir === "right") el.classList.add("sr-from-right");
      else if (dir === "top") el.classList.add("sr-from-top");
      else if (dir === "bottom" || dir === "up")
        el.classList.add("sr-from-bottom");
      else if (dir === "zoom" || dir === "scale")
        el.classList.add("sr-zoom-in");
    });
  }

  // Initial markup tagging
  applyRevealClasses();

  // Setup IntersectionObserver for smooth scroll triggering
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("sr-revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -30px 0px",
      },
    );

    const observeElements = (scope = document) => {
      scope.querySelectorAll(".sr-reveal:not(.sr-revealed)").forEach((el) => {
        // Elements already in the initial viewport
        const rect = el.getBoundingClientRect();
        const isInViewport =
          rect.top < window.innerHeight &&
          rect.bottom > 0 &&
          rect.left < window.innerWidth &&
          rect.right > 0;

        if (isInViewport) {
          // Reveal with a slight natural delay for smoothness
          setTimeout(() => {
            el.classList.add("sr-revealed");
          }, 60);
        } else {
          revealObserver.observe(el);
        }
      });
    };

    observeElements();

    // Expose global reobserve function for dynamically loaded components
    window.reobserveScrollReveal = function (scope = document) {
      applyRevealClasses(scope);
      observeElements(scope);
    };
  } else {
    // Fallback: Reveal all immediately
    document.querySelectorAll(".sr-reveal").forEach((el) => {
      el.classList.add("sr-revealed");
    });
  }
}
