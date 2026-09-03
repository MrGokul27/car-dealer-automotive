document.addEventListener("DOMContentLoaded", () => {
  initApp();
});

function initApp() {
  setupFavicon();
  loadHeaderComponent();
  loadFooterComponent();
  initializeScrollToTop();
  initializeWishlistButtons();
  initializeFinanceCalculator();
  initializeNewsletterForm();
  initializeCarsFilter();
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
  } catch (error) {
    console.warn(
      "Component fetch fallback (e.g. running from local file system without server):",
      error,
    );
    initializeScrollToTop();
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
  const outlineLogin = header.querySelector(".btn-outline-login");
  const primaryDrive = header.querySelector(".btn-primary-drive");
  const wishlistBtn = header.querySelector(".wishlist-btn");

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

    if (outlineLogin) outlineLogin.href = "contact.html";
    if (primaryDrive) primaryDrive.href = "contact.html";
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

    if (outlineLogin) outlineLogin.href = "pages/contact.html";
    if (primaryDrive) primaryDrive.href = "pages/contact.html";
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

  [priceInput, downPaymentInput, interestInput, tenureInput].forEach(
    (input) => {
      input.addEventListener("input", calculateEMI);
    },
  );
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
