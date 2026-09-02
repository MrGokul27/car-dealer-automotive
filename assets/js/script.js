document.addEventListener("DOMContentLoaded", () => {
  initApp();
});

function initApp() {
  setupFavicon();
  loadHeaderComponent();
  loadFooterComponent();
  initializeWishlistButtons();
}

/**
 * Ensures the Stackly logo is used as the favicon for all pages
 */
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

/**
 * Loads header.html into the page (if a placeholder is present) or initializes existing header
 */
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
  } catch (error) {
    console.warn(
      "Component fetch fallback (e.g. running from local file system without server):",
      error,
    );
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
