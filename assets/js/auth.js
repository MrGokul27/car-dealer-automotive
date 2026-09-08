document.addEventListener("DOMContentLoaded", () => {
  initAuth();
});

function initAuth() {
  setupEmptyLinks404Redirect();
  setupRoleSelection();
  setupPasswordToggles();
  setupPasswordStrengthValidation();
  setupNameInputRestriction();
  setupNumberInputRestriction();
  setupRegisterPasswordRequirements();
  setupFormSwitching();
  setupFormSubmissions();
  setupSocialLogins();
  setupForgotPasswordModal();
  setupQueryParamPrefill();
}

/**
 * Determines the relative home page URL depending on whether the page is inside /pages/ or at root
 */
function getHomeUrl() {
  const isPagesDir = window.location.pathname.includes("/pages/");
  return isPagesDir ? "../index.html" : "index.html";
}

/**
 * Determines the relative login page URL depending on whether the page is inside /pages/ or at root
 */
function getLoginUrl() {
  const isPagesDir = window.location.pathname.includes("/pages/");
  return isPagesDir ? "login.html" : "pages/login.html";
}

/**
 * Determines the relative dashboard page URL depending on whether the page is inside /pages/ or at root
 */
function getDashboardUrl() {
  const isPagesDir = window.location.pathname.includes("/pages/");
  return isPagesDir ? "dashboard.html" : "pages/dashboard.html";
}

/**
 * Checks query parameters for pre-filling email, role, or registered status
 */
function setupQueryParamPrefill() {
  const params = new URLSearchParams(window.location.search);
  const emailParam = params.get("email");
  const roleParam = params.get("role");
  const isRegistered = params.get("registered") === "true";

  if (emailParam) {
    const emailInput = document.getElementById("loginEmail");
    if (emailInput) {
      emailInput.value = emailParam;
    }
  }

  if (roleParam) {
    const roleRadio = document.querySelector(`input[name="loginRole"][value="${roleParam}"]`);
    if (roleRadio) {
      roleRadio.checked = true;
      document.querySelectorAll(".auth-role-card").forEach(c => c.classList.remove("active"));
      roleRadio.closest(".auth-role-card")?.classList.add("active");
    }
  }

  if (isRegistered) {
    setTimeout(() => {
      showToast(
        "success",
        "Account Ready!",
        "Registration complete! Please enter your password to sign in to your dashboard."
      );
    }, 300);
  }
}

/**
 * Role selection handling for both Customer and Dealer/Staff
 */
function setupRoleSelection() {
  const roleCards = document.querySelectorAll(".auth-role-card");

  roleCards.forEach((card) => {
    card.addEventListener("click", () => {
      const parentGrid = card.closest(".auth-role-grid");
      if (!parentGrid) return;

      // Remove active from sibling cards in same grid
      parentGrid.querySelectorAll(".auth-role-card").forEach((c) => {
        c.classList.remove("active");
        const radio = c.querySelector('input[type="radio"]');
        if (radio) radio.checked = false;
      });

      // Activate clicked card
      card.classList.add("active");
      const radio = card.querySelector('input[type="radio"]');
      if (radio) {
        radio.checked = true;
      }
    });
  });
}

/**
 * Password Visibility Toggle (Show / Hide password)
 */
function setupPasswordToggles() {
  const toggleBtns = document.querySelectorAll(".auth-toggle-pwd");

  toggleBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const wrapper = btn.closest(".auth-input-wrapper");
      if (!wrapper) return;

      const input = wrapper.querySelector("input");
      const icon = btn.querySelector("i");
      if (!input || !icon) return;

      if (input.type === "password") {
        input.type = "text";
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
        btn.setAttribute("aria-label", "Hide password");
      } else {
        input.type = "password";
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
        btn.setAttribute("aria-label", "Show password");
      }
    });
  });
}

/**
 * Password Strength Validation
 * Analyzes length, lowercase, uppercase, numbers, and special characters
 */
function evaluatePasswordStrength(password) {
  let score = 0;
  const checks = {
    length: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
  };

  if (!password || password.length === 0) {
    return { score: 0, level: "none", checks };
  }

  if (checks.length) score++;
  if (checks.hasUpper && checks.hasLower) score++;
  if (checks.hasNumber) score++;
  if (checks.hasSpecial) score++;

  let level = "weak";
  if (score >= 4) {
    level = "strong";
  } else if (score === 3) {
    level = "good";
  } else if (score === 2) {
    level = "fair";
  } else {
    level = "weak";
  }

  return { score, level, checks };
}

/**
 * Real-time Password Strength Feedback
 */
function setupPasswordStrengthValidation() {
  const pwdInputs = document.querySelectorAll(
    "#loginPassword, #registerPassword",
  );

  pwdInputs.forEach((input) => {
    const container = input
      .closest(".auth-input-group")
      ?.querySelector(".auth-pwd-strength-container");
    if (!container) return;

    const segments = container.querySelectorAll(".auth-strength-segment");
    const valueLabel = container.querySelector(".auth-strength-value");
    const hints = container.querySelectorAll(".auth-hint-item");

    input.addEventListener("input", () => {
      const val = input.value;

      if (!val) {
        container.classList.remove("active");
        resetStrengthMeter(segments, valueLabel, hints);
        return;
      }

      container.classList.add("active");
      const { score, level, checks } = evaluatePasswordStrength(val);

      // Reset segments
      segments.forEach((seg) => {
        seg.className = "auth-strength-segment";
      });

      // Fill segments based on score
      for (let i = 0; i < score; i++) {
        if (segments[i]) {
          segments[i].classList.add(`active-${level}`);
        }
      }

      // Update text label
      if (valueLabel) {
        valueLabel.textContent = level.toUpperCase();
        valueLabel.className = `auth-strength-value ${level}`;
      }

      // Update hint items checklist if present
      if (hints.length > 0) {
        updateHintItem(
          container.querySelector('[data-hint="length"]'),
          checks.length,
        );
        updateHintItem(
          container.querySelector('[data-hint="upper"]'),
          checks.hasUpper,
        );
        updateHintItem(
          container.querySelector('[data-hint="number"]'),
          checks.hasNumber,
        );
        updateHintItem(
          container.querySelector('[data-hint="special"]'),
          checks.hasSpecial,
        );
      }
    });
  });
}

function resetStrengthMeter(segments, valueLabel, hints) {
  segments.forEach((seg) => {
    seg.className = "auth-strength-segment";
  });
  if (valueLabel) {
    valueLabel.textContent = "WEAK";
    valueLabel.className = "auth-strength-value weak";
  }
  hints.forEach((hint) => {
    hint.className = "auth-hint-item invalid";
    const icon = hint.querySelector("i");
    if (icon) {
      icon.className = "fa-solid fa-circle-xmark";
    }
  });
}

function updateHintItem(element, isValid) {
  if (!element) return;
  const icon = element.querySelector("i");
  if (isValid) {
    element.classList.remove("invalid");
    element.classList.add("valid");
    if (icon) icon.className = "fa-solid fa-circle-check";
  } else {
    element.classList.remove("valid");
    element.classList.add("invalid");
    if (icon) icon.className = "fa-solid fa-circle-xmark";
  }
}

/**
 * Prevent user from typing numbers or special characters in the name/username field
 */
function setupNameInputRestriction() {
  const nameInputs = document.querySelectorAll(
    "#registerName, #registerUsername, input[name='name'], input[data-letters-only]",
  );

  nameInputs.forEach((input) => {
    // 1. Prevent keypress/keydown of numbers & special characters
    input.addEventListener("keydown", (e) => {
      // Allow navigation and action keys
      const allowedKeys = [
        "Backspace",
        "Tab",
        "Enter",
        "Escape",
        "Delete",
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "Home",
        "End",
        "Shift",
        "CapsLock",
      ];
      if (allowedKeys.includes(e.key)) return;

      // Allow Ctrl/Cmd shortcuts like Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+Z
      if (e.ctrlKey || e.metaKey) return;

      // Check single printable character: allow ONLY letters (a-z, A-Z) and spaces
      if (e.key.length === 1) {
        if (!/^[a-zA-Z\s]$/.test(e.key)) {
          e.preventDefault();
        }
      }
    });

    // 2. Prevent invalid characters from beforeinput (mobile keyboards, composition)
    input.addEventListener("beforeinput", (e) => {
      if (e.data && /[^a-zA-Z\s]/.test(e.data)) {
        e.preventDefault();
      }
    });

    // 3. Real-time sanitization on input event (handles paste, auto-fill, drag-and-drop)
    input.addEventListener("input", () => {
      const original = input.value;
      const clean = original.replace(/[^a-zA-Z\s]/g, "");
      if (original !== clean) {
        input.value = clean;
      }
      if (clean.trim()) {
        clearFieldSingleError(input);
      }
    });

    // 4. Handle paste event explicitly
    input.addEventListener("paste", (e) => {
      e.preventDefault();
      const pasteText =
        (e.clipboardData || window.clipboardData)?.getData("text") || "";
      const cleanText = pasteText.replace(/[^a-zA-Z\s]/g, "");
      const start = input.selectionStart || 0;
      const end = input.selectionEnd || 0;
      const current = input.value;
      input.value =
        current.substring(0, start) + cleanText + current.substring(end);
      input.selectionStart = input.selectionEnd = start + cleanText.length;
      input.dispatchEvent(new Event("input"));
    });
  });
}

/**
 * Prevent user from typing alphabets or special characters in number/phone fields.
 * Disallows all non-numeric keystrokes, input, composition, and paste.
 */
function setupNumberInputRestriction() {
  const numberInputs = document.querySelectorAll(
    "#registerPhone, input[type='tel'], input[data-numbers-only], input[name='phone']",
  );

  numberInputs.forEach((input) => {
    // 1. Block keydown of letters and special characters
    input.addEventListener("keydown", (e) => {
      // Allow navigation and operational control keys
      const allowedKeys = [
        "Backspace",
        "Tab",
        "Enter",
        "Escape",
        "Delete",
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "Home",
        "End",
      ];
      if (allowedKeys.includes(e.key)) return;

      // Allow Ctrl/Cmd keyboard shortcuts (e.g. Select All, Copy, Paste, Cut, Undo)
      if (e.ctrlKey || e.metaKey) return;

      // Check single printable character: allow ONLY digits (0-9)
      if (e.key.length === 1) {
        if (!/^[0-9]$/.test(e.key)) {
          e.preventDefault();
        }
      }
    });

    // 2. Prevent invalid input from mobile keyboards / IME / virtual input
    input.addEventListener("beforeinput", (e) => {
      if (e.data && /\D/.test(e.data)) {
        e.preventDefault();
      }
    });

    // 3. Real-time sanitization on input event (handles drag-and-drop, autofill, etc.)
    input.addEventListener("input", () => {
      const original = input.value;
      const clean = original.replace(/\D/g, "");
      if (original !== clean) {
        input.value = clean;
      }
      if (clean.trim()) {
        clearFieldSingleError(input);
      }
    });

    // 4. Handle paste event explicitly (strip non-digits)
    input.addEventListener("paste", (e) => {
      e.preventDefault();
      const pasteText =
        (e.clipboardData || window.clipboardData)?.getData("text") || "";
      const cleanText = pasteText.replace(/\D/g, "");
      const start = input.selectionStart || 0;
      const end = input.selectionEnd || 0;
      const current = input.value;
      input.value =
        current.substring(0, start) + cleanText + current.substring(end);
      input.selectionStart = input.selectionEnd = start + cleanText.length;
      input.dispatchEvent(new Event("input"));
    });
  });
}

/**
 * Real-time Password Requirements & Confirm Password Match Validation
 */
function setupRegisterPasswordRequirements() {
  const pwdInput = document.getElementById("registerPassword");
  const confirmPwdInput = document.getElementById("registerConfirmPassword");

  const reqLength = document.getElementById("reqLength");
  const reqNumber = document.getElementById("reqNumber");
  const reqSpecial = document.getElementById("reqSpecial");

  if (pwdInput) {
    pwdInput.addEventListener("input", () => {
      const val = pwdInput.value;
      const isLenValid = val.length >= 8;
      const isNumValid = /[0-9]/.test(val);
      const isSpecialValid = /[^A-Za-z0-9]/.test(val);

      updateRequirementBadge(reqLength, isLenValid);
      updateRequirementBadge(reqNumber, isNumValid);
      updateRequirementBadge(reqSpecial, isSpecialValid);

      if (isLenValid && isNumValid && isSpecialValid) {
        clearFieldSingleError(pwdInput);
      }

      // Check confirm password match in real time if it already has value
      if (confirmPwdInput && confirmPwdInput.value) {
        if (confirmPwdInput.value !== val) {
          showFieldError(confirmPwdInput, "Passwords do not match.");
        } else {
          clearFieldSingleError(confirmPwdInput);
        }
      }
    });
  }

  if (confirmPwdInput && pwdInput) {
    confirmPwdInput.addEventListener("input", () => {
      if (!confirmPwdInput.value) {
        clearFieldSingleError(confirmPwdInput);
        return;
      }
      if (confirmPwdInput.value !== pwdInput.value) {
        showFieldError(confirmPwdInput, "Passwords do not match.");
      } else {
        clearFieldSingleError(confirmPwdInput);
      }
    });
  }
}

function updateRequirementBadge(badgeEl, isValid) {
  if (!badgeEl) return;
  const icon = badgeEl.querySelector("i");
  if (isValid) {
    badgeEl.classList.add("valid");
    if (icon) {
      icon.className = "fa-solid fa-circle-check";
    }
  } else {
    badgeEl.classList.remove("valid");
    if (icon) {
      icon.className = "fa-regular fa-circle-check";
    }
  }
}

function clearFieldSingleError(inputElement) {
  inputElement.classList.remove("has-error");
  const group = inputElement.closest(".auth-input-group");
  if (group) {
    const errorMsg = group.querySelector(".auth-error-msg");
    if (errorMsg) {
      errorMsg.textContent = "";
      errorMsg.classList.remove("visible");
    }
  }
}

/**
 * Switch between Login and Register Forms
 */
function setupFormSwitching() {
  const showRegisterBtn = document.getElementById("showRegisterBtn");
  const showLoginBtn = document.getElementById("showLoginBtn");
  const loginSection = document.getElementById("loginFormContainer");
  const registerSection = document.getElementById("registerFormContainer");

  if (showRegisterBtn && showLoginBtn && loginSection && registerSection) {
    showRegisterBtn.addEventListener("click", (e) => {
      e.preventDefault();
      loginSection.classList.remove("active");
      registerSection.classList.add("active");
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    showLoginBtn.addEventListener("click", (e) => {
      e.preventDefault();
      registerSection.classList.remove("active");
      loginSection.classList.add("active");
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
}

/**
 * Form Submissions and Validation (Login & Register)
 */
function setupFormSubmissions() {
  const signInForm = document.getElementById("signInForm");
  const registerForm = document.getElementById("registerForm");

  // Sign In Form Submission
  if (signInForm) {
    signInForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const emailInput = document.getElementById("loginEmail");
      const pwdInput = document.getElementById("loginPassword");
      const submitBtn = signInForm.querySelector(".auth-submit-btn");

      clearFieldErrors(signInForm);

      let isValid = true;

      // Validate Email
      if (!emailInput.value.trim()) {
        showFieldError(emailInput, "Email address is required.");
        isValid = false;
      } else if (!isValidEmail(emailInput.value.trim())) {
        showFieldError(emailInput, "Please enter a valid email address.");
        isValid = false;
      }

      // Validate Password
      if (!pwdInput.value) {
        showFieldError(pwdInput, "Password is required.");
        isValid = false;
      } else {
        const { score } = evaluatePasswordStrength(pwdInput.value);
        if (score < 2) {
          showFieldError(
            pwdInput,
            "Password is too weak. Please enter at least 8 characters with letters & numbers.",
          );
          isValid = false;
        }
      }

      if (!isValid) return;

      // Selected Role
      const roleRadio = document.querySelector('input[name="loginRole"]:checked');
      const selectedRole = roleRadio ? roleRadio.value : "customer";
      const email = emailInput.value.trim();

      // Check if we have registered name for this email
      let displayName = email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, l => l.toUpperCase());
      try {
        const regUser = JSON.parse(localStorage.getItem("autoDrive_registered_user") || "{}");
        if (regUser.email && regUser.email.toLowerCase() === email.toLowerCase() && regUser.name) {
          displayName = regUser.name;
        }
      } catch (err) {}

      const userSession = {
        name: displayName,
        email: email,
        role: selectedRole,
        loginTime: new Date().toISOString(),
        rememberMe: document.getElementById("rememberMe")?.checked || false
      };

      localStorage.setItem("autoDrive_user", JSON.stringify(userSession));

      // Disable button & show loading state
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Signing In...`;
      }

      showToast(
        "success",
        "Sign In Successful!",
        `Welcome ${displayName}! Redirecting to your ${selectedRole === "dealer" ? "Dealer" : "Customer"} Dashboard...`,
      );

      setTimeout(() => {
        window.location.href = getDashboardUrl();
      }, 1000);
    });
  }

  // Register Form Submission
  if (registerForm) {
    registerForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const nameInput = document.getElementById("registerName");
      const emailInput = document.getElementById("registerEmail");
      const phoneInput = document.getElementById("registerPhone");
      const cityInput = document.getElementById("registerCity");
      const pwdInput = document.getElementById("registerPassword");
      const confirmPwdInput = document.getElementById(
        "registerConfirmPassword",
      );
      const termsCheckbox = document.getElementById("registerTerms");
      const submitBtn = registerForm.querySelector(".auth-submit-btn");

      clearFieldErrors(registerForm);

      let isValid = true;

      // Validate Full Name / Username
      if (nameInput) {
        const nameVal = nameInput.value.trim();
        if (!nameVal) {
          showFieldError(nameInput, "Full name is required.");
          isValid = false;
        } else if (/[^a-zA-Z\s]/.test(nameVal)) {
          showFieldError(
            nameInput,
            "Name cannot contain numbers or special characters.",
          );
          isValid = false;
        }
      }

      // Validate Email
      if (emailInput) {
        if (!emailInput.value.trim()) {
          showFieldError(emailInput, "Email address is required.");
          isValid = false;
        } else if (!isValidEmail(emailInput.value.trim())) {
          showFieldError(emailInput, "Please enter a valid email address.");
          isValid = false;
        }
      }

      // Validate Phone Number
      if (phoneInput) {
        const phoneVal = phoneInput.value.trim();
        if (!phoneVal) {
          showFieldError(phoneInput, "Phone number is required.");
          isValid = false;
        } else if (!/^\d{7,15}$/.test(phoneVal)) {
          showFieldError(phoneInput, "Please enter a valid phone number");
          isValid = false;
        }
      }

      // Validate City/Location (if present)
      if (cityInput && !cityInput.value.trim()) {
        showFieldError(cityInput, "City/Location is required.");
        isValid = false;
      }

      // Validate Password (Weak Password Validation)
      if (!pwdInput || !pwdInput.value) {
        if (pwdInput) showFieldError(pwdInput, "Password is required.");
        isValid = false;
      } else {
        const val = pwdInput.value;
        const isLen = val.length >= 8;
        const isNum = /[0-9]/.test(val);
        const isSpec = /[^A-Za-z0-9]/.test(val);

        if (!isLen || !isNum || !isSpec) {
          showFieldError(
            pwdInput,
            "Weak password. Password must be at least 8 characters with at least one number and one special character.",
          );
          isValid = false;
        }
      }

      // Validate Confirm Password (Match Verification)
      if (confirmPwdInput) {
        if (!confirmPwdInput.value) {
          showFieldError(confirmPwdInput, "Please confirm your password.");
          isValid = false;
        } else if (pwdInput && confirmPwdInput.value !== pwdInput.value) {
          showFieldError(confirmPwdInput, "Passwords do not match.");
          isValid = false;
        }
      }

      // Validate Terms Checkbox
      if (termsCheckbox && !termsCheckbox.checked) {
        showToast(
          "error",
          "Agreement Required",
          "Please agree to the Terms & Conditions to proceed.",
        );
        isValid = false;
      }

      if (!isValid) return;

      const nameVal = nameInput ? nameInput.value.trim() : "AutoDrive Member";
      const emailVal = emailInput ? emailInput.value.trim() : "";
      const phoneVal = phoneInput ? phoneInput.value.trim() : "";
      const cityVal = cityInput ? cityInput.value.trim() : "";
      const roleRadio = document.querySelector('input[name="registerRole"]:checked');
      const roleVal = roleRadio ? roleRadio.value : "customer";

      const registeredUser = {
        name: nameVal,
        email: emailVal,
        phone: phoneVal,
        city: cityVal,
        role: roleVal,
        loginTime: new Date().toISOString()
      };

      localStorage.setItem("autoDrive_registered_user", JSON.stringify(registeredUser));
      localStorage.setItem("autoDrive_user", JSON.stringify(registeredUser));

      // Disable button & show loading state
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Creating Account...`;
      }

      showToast(
        "success",
        "Registration Successful!",
        "Account created! Redirecting to login page...",
      );

      // Redirect to login page with prefill parameters
      setTimeout(() => {
        window.location.href = `login.html?registered=true&email=${encodeURIComponent(emailVal)}&role=${encodeURIComponent(roleVal)}`;
      }, 1200);
    });
  }
}

/**
 * Social Logins (Google / Apple)
 */
function setupSocialLogins() {
  const googleBtns = document.querySelectorAll(".auth-social-btn.google-btn");
  const appleBtns = document.querySelectorAll(".auth-social-btn.apple-btn");

  googleBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const roleRadio = document.querySelector('input[name="loginRole"]:checked, input[name="registerRole"]:checked');
      const selectedRole = roleRadio ? roleRadio.value : "customer";

      const socialUser = {
        name: "Alex Morgan",
        email: "alex.morgan@gmail.com",
        role: selectedRole,
        loginTime: new Date().toISOString()
      };
      localStorage.setItem("autoDrive_user", JSON.stringify(socialUser));

      showToast(
        "success",
        "Google Authentication",
        `Signed in as Alex Morgan! Redirecting to ${selectedRole === "dealer" ? "Dealer" : "Customer"} Dashboard...`,
      );
      setTimeout(() => {
        window.location.href = getDashboardUrl();
      }, 1000);
    });
  });

  appleBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const roleRadio = document.querySelector('input[name="loginRole"]:checked, input[name="registerRole"]:checked');
      const selectedRole = roleRadio ? roleRadio.value : "customer";

      const socialUser = {
        name: "Alex Morgan",
        email: "alex.morgan@icloud.com",
        role: selectedRole,
        loginTime: new Date().toISOString()
      };
      localStorage.setItem("autoDrive_user", JSON.stringify(socialUser));

      showToast(
        "success",
        "Apple Authentication",
        `Signed in with Apple ID! Redirecting to ${selectedRole === "dealer" ? "Dealer" : "Customer"} Dashboard...`,
      );
      setTimeout(() => {
        window.location.href = getDashboardUrl();
      }, 1000);
    });
  });
}

/**
 * Forgot Password Modal
 */
function setupForgotPasswordModal() {
  const forgotLinks = document.querySelectorAll(".auth-forgot-link");
  const modal = document.getElementById("forgotPasswordModal");
  const closeBtn = document.getElementById("closeForgotModalBtn");
  const forgotForm = document.getElementById("forgotPasswordForm");

  if (!modal) return;

  forgotLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      modal.classList.add("active");
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      modal.classList.remove("active");
    });
  }

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.remove("active");
    }
  });

  if (forgotForm) {
    forgotForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const emailInput = document.getElementById("forgotEmail");
      if (!emailInput.value || !isValidEmail(emailInput.value)) {
        showToast(
          "error",
          "Invalid Email",
          "Please enter a valid email address.",
        );
        return;
      }

      showToast(
        "success",
        "Reset Link Sent",
        `A password reset link has been sent to ${emailInput.value}`,
      );
      modal.classList.remove("active");
      forgotForm.reset();
    });
  }
}

/**
 * Helper: Email format validation regex
 */
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Helper: Display field-level error message
 */
function showFieldError(inputElement, message) {
  inputElement.classList.add("has-error");
  const group = inputElement.closest(".auth-input-group");
  if (group) {
    let errorMsg = group.querySelector(".auth-error-msg");
    if (!errorMsg) {
      errorMsg = document.createElement("span");
      errorMsg.className = "auth-error-msg";
      group.appendChild(errorMsg);
    }
    errorMsg.textContent = message;
    errorMsg.classList.add("visible");
  }
}

/**
 * Helper: Clear all field-level errors in a form
 */
function clearFieldErrors(form) {
  form.querySelectorAll(".auth-input").forEach((input) => {
    input.classList.remove("has-error");
  });
  form.querySelectorAll(".auth-error-msg").forEach((msg) => {
    msg.textContent = "";
    msg.classList.remove("visible");
  });
}

/**
 * Helper: Toast Notifications
 */
function showToast(type, title, message) {
  let container = document.querySelector(".auth-toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "auth-toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `auth-toast toast-${type}`;

  const iconClass =
    type === "success"
      ? "fa-circle-check"
      : type === "error"
        ? "fa-circle-exclamation"
        : "fa-circle-info";

  toast.innerHTML = `
    <i class="fa-solid ${iconClass} toast-icon"></i>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-message">${message}</div>
    </div>
  `;

  container.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add("show");
  });

  // Remove toast after delay
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => {
      toast.remove();
    }, 400);
  }, 3500);
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

    // Allow modal triggers or tab switchers
    if (
      anchor.hasAttribute("data-bs-toggle") ||
      anchor.hasAttribute("data-modal") ||
      anchor.classList.contains("modal-trigger") ||
      anchor.id === "showRegisterBtn" ||
      anchor.id === "showLoginBtn" ||
      anchor.id === "forgotPasswordLink" ||
      anchor.id === "backToHomeBtn"
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
