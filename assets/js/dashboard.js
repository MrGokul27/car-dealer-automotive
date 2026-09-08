/**
 * AutoDrive Automotive Theme - Role-Based Dashboard Controller
 * Handles Role Switching, Dynamic User Session Data, Sidebar Navigation,
 * Responsive Tables, Live EMI Calculator, and 404 Interceptors for Dummy Links.
 */

document.addEventListener("DOMContentLoaded", () => {
  initDashboard();
});

function initDashboard() {
  initUserSession();
  initRoleSwitcher();
  initSidebarNavigation();
  initMobileSidebar();
  initEmiCalculator();
  initInventorySearch();
  initModalsAndForms();
  initLogoutHandler();
  initDashboard404Interceptor();
}

/**
 * 1. User Session & Dynamic Data Population
 * Reads user data saved from Login / Register form and populates throughout the dashboard.
 */
function initUserSession() {
  let userData = null;
  try {
    const raw = localStorage.getItem("autoDrive_user");
    if (raw) {
      userData = JSON.parse(raw);
    }
  } catch (e) {
    console.error("Error reading session:", e);
  }

  // Fallback defaults if accessed directly
  if (!userData || !userData.email) {
    userData = {
      name: "Alex Morgan",
      email: "alex.morgan@autodrive.com",
      role: "customer",
      phone: "+1 (555) 234-8920",
      city: "Los Angeles, CA",
      loginTime: new Date().toISOString(),
    };
    localStorage.setItem("autoDrive_user", JSON.stringify(userData));
  }

  // Bind to DOM Elements
  const displayNames = document.querySelectorAll(
    ".user-display-name, #profileNameInput, .dash-topbar-profile-name",
  );
  displayNames.forEach((el) => {
    if (el.tagName === "INPUT") {
      el.value = userData.name || "AutoDrive Member";
    } else {
      el.textContent = userData.name || "AutoDrive Member";
    }
  });

  const displayEmails = document.querySelectorAll(
    ".user-display-email, #profileEmailInput, .dash-topbar-profile-email",
  );
  displayEmails.forEach((el) => {
    if (el.tagName === "INPUT") {
      el.value = userData.email || "user@autodrive.com";
    } else {
      el.textContent = userData.email || "user@autodrive.com";
    }
  });

  const phoneInput = document.getElementById("profilePhoneInput");
  if (phoneInput && userData.phone) {
    phoneInput.value = userData.phone;
  }

  const cityInput = document.getElementById("profileCityInput");
  if (cityInput && userData.city) {
    cityInput.value = userData.city;
  }

  // Set active role view
  const currentRole = userData.role === "dealer" ? "dealer" : "customer";
  switchRole(currentRole, false);
}

/**
 * 2. Role Switcher (Customer vs Dealer/Staff)
 */
function initRoleSwitcher() {
  const roleButtons = document.querySelectorAll(".role-switch-btn");
  roleButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetRole = btn.getAttribute("data-role");
      if (targetRole) {
        switchRole(targetRole, true);
      }
    });
  });
}

function switchRole(role, notify) {
  // Update local storage
  try {
    const raw = localStorage.getItem("autoDrive_user");
    if (raw) {
      const data = JSON.parse(raw);
      data.role = role;
      localStorage.setItem("autoDrive_user", JSON.stringify(data));
    }
  } catch (e) {}

  // Update switcher buttons
  document.querySelectorAll(".role-switch-btn").forEach((btn) => {
    if (btn.getAttribute("data-role") === role) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  // Update Role Badges
  const roleBadges = document.querySelectorAll(".dash-user-meta-role");
  roleBadges.forEach((badge) => {
    if (role === "dealer") {
      badge.className = "dash-user-meta-role role-badge-dealer";
      badge.innerHTML = `<i class="fa-solid fa-briefcase"></i> Dealer / Staff`;
    } else {
      badge.className = "dash-user-meta-role role-badge-customer";
      badge.innerHTML = `<i class="fa-solid fa-user-check"></i> VIP Customer`;
    }
  });

  // Toggle Sidebar Menus & Sections
  const customerNav = document.getElementById("customerSidebarNav");
  const dealerNav = document.getElementById("dealerSidebarNav");

  if (role === "dealer") {
    if (customerNav) customerNav.style.display = "none";
    if (dealerNav) dealerNav.style.display = "block";
    navigateToSection("dealer-overview");
  } else {
    if (dealerNav) dealerNav.style.display = "none";
    if (customerNav) customerNav.style.display = "block";
    navigateToSection("customer-overview");
  }

  if (notify) {
    showDashboardToast(
      "success",
      `Switched to ${role === "dealer" ? "Dealer / Staff Command Center" : "Customer Portal"}`,
      `Loaded customized workspace and permissions for ${role === "dealer" ? "Dealership Management" : "Vehicle Shopper"}.`,
    );
  }
}

/**
 * 3. Sidebar Navigation & Tab Switching
 */
function initSidebarNavigation() {
  const navLinks = document.querySelectorAll(".dash-nav-link[data-nav-target]");
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = link.getAttribute("data-nav-target");
      if (targetId) {
        navigateToSection(targetId);
        // On mobile, close sidebar after clicking
        closeMobileSidebar();
      }
    });
  });
}

function navigateToSection(targetId) {
  // Update sidebar active link
  document.querySelectorAll(".dash-nav-link").forEach((l) => {
    if (l.getAttribute("data-nav-target") === targetId) {
      l.classList.add("active");
    } else {
      l.classList.remove("active");
    }
  });

  // Show matching section
  const sections = document.querySelectorAll(".dash-section");
  let found = false;
  sections.forEach((sec) => {
    if (sec.id === targetId) {
      sec.classList.add("active");
      found = true;
    } else {
      sec.classList.remove("active");
    }
  });

  if (found) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

/**
 * 4. Mobile Sidebar Collapse & Toggle
 */
function initMobileSidebar() {
  const toggleBtn = document.getElementById("mobileSidebarToggle");
  const closeBtn = document.getElementById("closeSidebarBtn");
  const sidebar = document.getElementById("dashSidebar");
  const backdrop = document.getElementById("dashSidebarBackdrop");

  if (toggleBtn && sidebar && backdrop) {
    toggleBtn.addEventListener("click", () => {
      sidebar.classList.toggle("active");
      backdrop.classList.toggle("active");
    });
  }

  if (closeBtn && sidebar && backdrop) {
    closeBtn.addEventListener("click", closeMobileSidebar);
  }

  if (backdrop) {
    backdrop.addEventListener("click", closeMobileSidebar);
  }
}

function closeMobileSidebar() {
  const sidebar = document.getElementById("dashSidebar");
  const backdrop = document.getElementById("dashSidebarBackdrop");
  if (sidebar) sidebar.classList.remove("active");
  if (backdrop) backdrop.classList.remove("active");
}

/**
 * 5. Interactive Car Loan EMI Calculator
 */
function initEmiCalculator() {
  const priceInput = document.getElementById("emiCarPrice");
  const downInput = document.getElementById("emiDownPayment");
  const rateInput = document.getElementById("emiInterestRate");
  const tenureInput = document.getElementById("emiLoanTenure");

  if (!priceInput || !downInput || !rateInput || !tenureInput) return;

  const priceValLabel = document.getElementById("emiCarPriceVal");
  const downValLabel = document.getElementById("emiDownPaymentVal");
  const rateValLabel = document.getElementById("emiInterestRateVal");
  const tenureValLabel = document.getElementById("emiLoanTenureVal");

  const monthlyDisplay = document.getElementById("emiMonthlyAmount");
  const totalLoanDisplay = document.getElementById("emiTotalLoan");
  const totalInterestDisplay = document.getElementById("emiTotalInterest");
  const totalPayableDisplay = document.getElementById("emiTotalPayable");

  function calculateEMI() {
    const price = parseFloat(priceInput.value) || 0;
    const down = parseFloat(downInput.value) || 0;
    const annualRate = parseFloat(rateInput.value) || 0;
    const months = parseInt(tenureInput.value) || 12;

    // Update labels
    if (priceValLabel) priceValLabel.textContent = `$${price.toLocaleString()}`;
    if (downValLabel) downValLabel.textContent = `$${down.toLocaleString()}`;
    if (rateValLabel) rateValLabel.textContent = `${annualRate.toFixed(1)}%`;
    if (tenureValLabel)
      tenureValLabel.textContent = `${months} Mo (${(months / 12).toFixed(1)} Yrs)`;

    const principal = Math.max(0, price - down);
    const monthlyRate = annualRate / 100 / 12;

    let emi = 0;
    if (monthlyRate > 0 && principal > 0) {
      emi =
        (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
        (Math.pow(1 + monthlyRate, months) - 1);
    } else if (principal > 0) {
      emi = principal / months;
    }

    const totalPayable = emi * months + down;
    const totalInterest = Math.max(0, emi * months - principal);

    if (monthlyDisplay)
      monthlyDisplay.textContent = `$${Math.round(emi).toLocaleString()}`;
    if (totalLoanDisplay)
      totalLoanDisplay.textContent = `$${Math.round(principal).toLocaleString()}`;
    if (totalInterestDisplay)
      totalInterestDisplay.textContent = `$${Math.round(totalInterest).toLocaleString()}`;
    if (totalPayableDisplay)
      totalPayableDisplay.textContent = `$${Math.round(totalPayable).toLocaleString()}`;
  }

  [priceInput, downInput, rateInput, tenureInput].forEach((slider) => {
    slider.addEventListener("input", calculateEMI);
  });

  calculateEMI();
}

/**
 * 6. Live Search & Category Filtering in Dealership Inventory
 */
function initInventorySearch() {
  const searchInput = document.getElementById("inventorySearchInput");
  const statusFilter = document.getElementById("inventoryStatusFilter");
  const table = document.getElementById("dealerInventoryTable");

  if (!table) return;

  function filterInventory() {
    const query = (searchInput?.value || "").toLowerCase().trim();
    const selectedStatus = (statusFilter?.value || "all").toLowerCase();

    const rows = table.querySelectorAll("tbody tr");
    rows.forEach((row) => {
      const text = row.textContent.toLowerCase();
      const statusAttr = (row.getAttribute("data-status") || "").toLowerCase();

      const matchesQuery = !query || text.includes(query);
      const matchesStatus =
        selectedStatus === "all" || statusAttr === selectedStatus;

      if (matchesQuery && matchesStatus) {
        row.style.display = "";
      } else {
        row.style.display = "none";
      }
    });
  }

  if (searchInput) searchInput.addEventListener("input", filterInventory);
  if (statusFilter) statusFilter.addEventListener("change", filterInventory);
}

/**
 * 7. Modals, Forms & Actions
 */
function initModalsAndForms() {
  // Add Vehicle Form submission
  const addCarForm = document.getElementById("addNewCarForm");
  if (addCarForm) {
    addCarForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const make = document.getElementById("addCarMake")?.value || "Custom";
      const model = document.getElementById("addCarModel")?.value || "Vehicle";
      const price = document.getElementById("addCarPrice")?.value || "$65,000";

      showDashboardToast(
        "success",
        "Vehicle Added to Showroom",
        `${make} ${model} (${price}) has been added to active stock inventory.`,
      );

      // Close modal
      const modalEl = document.getElementById("addVehicleModal");
      if (modalEl && window.bootstrap && bootstrap.Modal) {
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
      }
      addCarForm.reset();
    });
  }

  // Profile Save Form
  const profileForm = document.getElementById("customerProfileForm");
  if (profileForm) {
    profileForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("profileNameInput")?.value || "User";
      const email =
        document.getElementById("profileEmailInput")?.value ||
        "user@autodrive.com";
      const phone = document.getElementById("profilePhoneInput")?.value || "";
      const city = document.getElementById("profileCityInput")?.value || "";

      try {
        const raw = localStorage.getItem("autoDrive_user");
        const data = raw ? JSON.parse(raw) : {};
        data.name = name;
        data.email = email;
        data.phone = phone;
        data.city = city;
        localStorage.setItem("autoDrive_user", JSON.stringify(data));
      } catch (err) {}

      // Update name in headers
      document
        .querySelectorAll(".user-display-name, .dash-topbar-profile-name")
        .forEach((el) => {
          el.textContent = name;
        });

      showDashboardToast(
        "success",
        "Profile Updated",
        "Your account information and preferences have been saved.",
      );
    });
  }

  // Test drive booker buttons
  document.querySelectorAll(".book-testdrive-action").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const carName = btn.getAttribute("data-car") || "Selected Car";
      showDashboardToast(
        "success",
        "Test Drive Scheduled",
        `Appointment confirmed for ${carName}. Our advisor will contact you shortly.`,
      );
    });
  });
}

/**
 * 8. Logout Handler
 */
function initLogoutHandler() {
  const logoutBtns = document.querySelectorAll(
    ".dash-logout-btn, #topbarLogoutBtn",
  );
  logoutBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("autoDrive_user");
      showDashboardToast(
        "info",
        "Logged Out",
        "You have been securely signed out. Redirecting to login...",
      );
      setTimeout(() => {
        window.location.href = "login.html";
      }, 900);
    });
  });
}

/**
 * 9. Dashboard 404 Interceptor
 * Intercepts clicks on empty links, '#', or dummy action buttons inside the dashboard
 * and redirects to 404.html, while strictly preserving sidebar navigation, role toggles,
 * modal triggers, and form controls.
 */
function initDashboard404Interceptor() {
  document.addEventListener("click", (e) => {
    // 1. Check anchor clicks
    const anchor = e.target.closest("a");
    if (anchor) {
      // Exclude sidebar nav links
      if (
        anchor.hasAttribute("data-nav-target") ||
        anchor.classList.contains("dash-nav-link")
      ) {
        return;
      }
      // Exclude modal triggers / dismissers
      if (
        anchor.hasAttribute("data-bs-toggle") ||
        anchor.hasAttribute("data-bs-dismiss")
      ) {
        return;
      }
      // Exclude logout buttons
      if (
        anchor.classList.contains("dash-logout-btn") ||
        anchor.id === "topbarLogoutBtn"
      ) {
        return;
      }

      const href = anchor.getAttribute("href");
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
        e.preventDefault();
        e.stopPropagation();
        window.location.href = "404.html";
        return;
      }
    }

    // 2. Check dummy buttons without explicit action handlers
    const button = e.target.closest("button");
    if (button) {
      // Exclude functional dashboard controls
      if (
        button.hasAttribute("data-bs-toggle") ||
        button.hasAttribute("data-bs-dismiss") ||
        button.classList.contains("role-switch-btn") ||
        button.classList.contains("dash-mobile-toggle") ||
        button.classList.contains("dash-sidebar-close") ||
        button.classList.contains("dash-logout-btn") ||
        button.classList.contains("book-testdrive-action") ||
        button.type === "submit" ||
        button.closest("form") ||
        button.id === "mobileSidebarToggle" ||
        button.id === "closeSidebarBtn" ||
        button.id === "topbarLogoutBtn"
      ) {
        return;
      }

      // Check if button is marked as dummy-404-trigger or has no other behavior
      if (
        button.classList.contains("btn-dummy-404") ||
        button.getAttribute("data-action") === "dummy"
      ) {
        e.preventDefault();
        e.stopPropagation();
        window.location.href = "404.html";
      }
    }
  });
}

/**
 * Toast Notification Utility for Dashboard
 */
function showDashboardToast(type, title, message) {
  let container = document.querySelector(".dash-toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "dash-toast-container";
    container.style.cssText = `
      position: fixed;
      top: 24px;
      right: 24px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
    `;
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  const isSuccess = type === "success";
  const isInfo = type === "info";
  const borderColor = isSuccess ? "#10b981" : isInfo ? "#3b82f6" : "#ff0000";
  const iconClass = isSuccess
    ? "fa-circle-check"
    : isInfo
      ? "fa-circle-info"
      : "fa-triangle-exclamation";

  toast.style.cssText = `
    background: #1e2538;
    color: #ffffff;
    border: 1px solid ${borderColor};
    border-left: 4px solid ${borderColor};
    border-radius: 8px;
    padding: 14px 18px;
    min-width: 320px;
    max-width: 420px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    display: flex;
    align-items: flex-start;
    gap: 12px;
    opacity: 0;
    transform: translateX(40px);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    pointer-events: auto;
  `;

  toast.innerHTML = `
    <i class="fa-solid ${iconClass}" style="color: ${borderColor}; font-size: 1.25rem; margin-top: 2px;"></i>
    <div style="flex: 1;">
      <div style="font-weight: 700; font-size: 0.92rem; margin-bottom: 3px; color: #ffffff;">${title}</div>
      <div style="font-size: 0.82rem; color: #94a3b8; line-height: 1.4;">${message}</div>
    </div>
  `;

  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = "1";
    toast.style.transform = "translateX(0)";
  });

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(40px)";
    setTimeout(() => toast.remove(), 350);
  }, 4000);
}
