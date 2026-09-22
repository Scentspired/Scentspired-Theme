/**
 * ============================================================================
 * SCENTSPIRED THEME CORE ENGINE — Modern Shopify Customer & UI Utilities
 * ============================================================================
 */

window.Shopify = window.Shopify || {};

/**
 * Selects an option in a <select> element by value or textContent.
 */
Shopify.setSelectorByValue = function (selector, value) {
  if (!selector) return -1;
  for (let i = 0; i < selector.options.length; i++) {
    const option = selector.options[i];
    if (value === option.value || value === option.textContent) {
      selector.selectedIndex = i;
      return i;
    }
  }
  return -1;
};

/**
 * Posts data using a temporary form submission.
 */
Shopify.postLink = function (path, options = {}) {
  const method = options.method || "post";
  const params = options.parameters || {};

  const form = document.createElement("form");
  form.method = method;
  form.action = path;

  for (const [key, value] of Object.entries(params)) {
    const hiddenField = document.createElement("input");
    hiddenField.type = "hidden";
    hiddenField.name = key;
    hiddenField.value = value;
    form.appendChild(hiddenField);
  }

  document.body.appendChild(form);
  form.submit();
  form.remove();
};

/**
 * Modern Country & Province Dynamic Dropdown Selector
 */
class CountryProvinceSelector {
  constructor(countryDomId, provinceDomId, options = {}) {
    this.countryEl = document.getElementById(countryDomId);
    this.provinceEl = document.getElementById(provinceDomId);
    this.provinceContainer = document.getElementById(options.hideElement || provinceDomId);

    if (!this.countryEl || !this.provinceEl) return;

    this.countryEl.addEventListener("change", () => this.countryHandler());

    this.initCountry();
    this.initProvince();
  }

  initCountry() {
    const defaultValue = this.countryEl.getAttribute("data-default");
    if (defaultValue) {
      Shopify.setSelectorByValue(this.countryEl, defaultValue);
    }
    this.countryHandler();
  }

  initProvince() {
    const defaultValue = this.provinceEl.getAttribute("data-default");
    if (defaultValue && this.provinceEl.options.length > 0) {
      Shopify.setSelectorByValue(this.provinceEl, defaultValue);
    }
  }

  countryHandler() {
    const selectedOption = this.countryEl.options[this.countryEl.selectedIndex];
    if (!selectedOption) return;

    const rawProvinces = selectedOption.getAttribute("data-provinces");
    let provinces = [];
    try {
      provinces = JSON.parse(rawProvinces) || [];
    } catch (e) {
      provinces = [];
    }

    this.clearOptions(this.provinceEl);

    if (provinces.length === 0) {
      if (this.provinceContainer) this.provinceContainer.style.display = "none";
    } else {
      for (const [code, name] of provinces) {
        const opt = document.createElement("option");
        opt.value = code;
        opt.textContent = name;
        this.provinceEl.appendChild(opt);
      }

      if (this.provinceContainer) this.provinceContainer.style.display = "";
    }
  }

  clearOptions(selector) {
    while (selector.firstChild) {
      selector.removeChild(selector.firstChild);
    }
  }

  setOptions(selector, values) {
    for (const value of values) {
      const opt = document.createElement("option");
      opt.value = value;
      opt.textContent = value;
      selector.appendChild(opt);
    }
  }
}

Shopify.CountryProvinceSelector = CountryProvinceSelector;

/**
 * Global Media Pause Utility
 * Pauses all embedded YouTube, Vimeo, HTML5 videos, and 3D models across the page.
 */
window.pauseAllMedia = function pauseAllMedia() {
  document.querySelectorAll(".js-youtube").forEach(video => {
    video.contentWindow?.postMessage('{"event":"command","func":"pauseVideo","args":""}', "*");
  });
  document.querySelectorAll(".js-vimeo").forEach(video => {
    video.contentWindow?.postMessage('{"method":"pause"}', "*");
  });
  document.querySelectorAll("video").forEach(video => video.pause());
  document.querySelectorAll("product-model").forEach(model => {
    model.modelViewerUI?.pause();
  });
};

/**
 * Details / Summary ARIA Keyboard & Click Setup
 */
document.querySelectorAll('[id^="Details-"] summary').forEach(summary => {
  summary.setAttribute("role", "button");
  summary.setAttribute("aria-expanded", summary.parentNode.hasAttribute("open"));

  if (summary.nextElementSibling?.getAttribute("id")) {
    summary.setAttribute("aria-controls", summary.nextElementSibling.id);
  }

  summary.addEventListener("click", event => {
    event.currentTarget.setAttribute(
      "aria-expanded",
      !event.currentTarget.closest("details").hasAttribute("open")
    );
  });

  if (summary.closest("header-drawer, menu-drawer")) return;
  if (typeof onKeyUpEscape === "function") {
    summary.parentElement.addEventListener("keyup", onKeyUpEscape);
  }
});
