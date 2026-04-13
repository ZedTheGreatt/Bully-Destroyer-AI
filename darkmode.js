/* ============================================
   SHARED DARK MODE FUNCTIONALITY
   Used by both index.html and chat.html
   ============================================ */

/**
 * Toggle dark mode on/off and sync across pages
 */
function toggleDarkMode() {
  const body = document.body;
  const isDarkMode = body.classList.toggle("dark");

  // Update all toggle buttons
  updateAllToggleButtons(isDarkMode);

  // Save preference to localStorage
  localStorage.setItem("darkMode", isDarkMode ? "enabled" : "disabled");
}

/**
 * Update all dark mode toggle buttons across the page
 * @param {boolean} isDarkMode - Whether dark mode is currently enabled
 */
function updateAllToggleButtons(isDarkMode) {
  const buttons = document.querySelectorAll(".dark-mode-toggle, #darkModeToggle");
  buttons.forEach(btn => {
    const icon = btn.querySelector("i");
    if (icon) {
      icon.className = isDarkMode ? "fas fa-sun" : "fas fa-moon";
    }
  });
}

/**
 * Initialize dark mode on page load
 * Sets the theme based on localStorage preference
 */
function initializeDarkMode() {
  const darkMode = localStorage.getItem("darkMode");
  const isDarkMode = darkMode === "enabled";

  if (isDarkMode) {
    document.body.classList.add("dark");
  }

  updateAllToggleButtons(isDarkMode);

  // Attach click listeners to all toggle buttons
  const buttons = document.querySelectorAll(".dark-mode-toggle, #darkModeToggle");
  buttons.forEach(btn => {
    btn.addEventListener("click", toggleDarkMode);
  });
}

/**
 * Sync dark mode across all open tabs/windows
 * Listens for storage changes in other tabs
 */
window.addEventListener("storage", (event) => {
  if (event.key === "darkMode") {
    const isDarkMode = event.newValue === "enabled";
    if (isDarkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
    updateAllToggleButtons(isDarkMode);
  }
});

// Initialize on page load
document.addEventListener("DOMContentLoaded", initializeDarkMode);

// Also initialize if DOM is already loaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeDarkMode);
} else {
  initializeDarkMode();
}
