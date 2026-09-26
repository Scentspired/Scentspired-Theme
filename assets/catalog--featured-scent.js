/* The featured scent section's cards: sizes, stock and add to cart. Wording from the card strings. Moved from sections/catalog--featured-scent.liquid. */
  var cardStrings = JSON.parse((document.getElementById('cardStrings') || {}).textContent || '{}');
// Currency symbol comes from the region resolved at build time. It used to be
    // a hardcoded symbol, which shipped one region's currency to every storefront.
// var, not const: several sections declare this and a top-level const is a
// global lexical binding, so the second one on the page throws and takes the
// rest of its script with it.
var currSym = (window.__STORE_CONFIG && window.__STORE_CONFIG.currencySymbol) || '';

document.addEventListener("DOMContentLoaded", () => {
  function updateVariantAvailability() {
    // Update all product cards
    document.querySelectorAll(".fragrance-container .fragrance-item").forEach((card) => {
      const variantBtns = card.querySelectorAll(".variant-option-btn")
      const cartBtn = card.querySelector(".cart-button")
      let hasAvailableVariant = false

      variantBtns.forEach((btn) => {
        const isAvailable = btn.dataset.available === "true"
        const inventory = parseInt(btn.dataset.inventory || "0", 10)
        
        // variant.available is Shopify's own answer to 'can this be bought' and
        // already accounts for stock and policy. Do not also require inventory > 0:
        // an UNTRACKED variant reports 0 while being perfectly buyable.
        const shouldDisable = !isAvailable

        if (shouldDisable) {
          btn.classList.add("disabled")
        } else {
          btn.classList.remove("disabled")
          hasAvailableVariant = true
        }
      })

      // Disable cart button if no variants available
      if (cartBtn) {
        if (hasAvailableVariant) {
          cartBtn.disabled = false
          cartBtn.classList.remove("disabled")
        } else {
          cartBtn.disabled = true
          cartBtn.classList.add("disabled")
          cartBtn.innerHTML = cardStrings.soldOutUpper
        }
      }
    })
  }

  updateVariantAvailability()

  setInterval(updateVariantAvailability, 1000)

  // Handle variant selection - using Shopify backend inventory only
  document.querySelectorAll(".fragrance-container .fragrance-item").forEach((card) => {
    const form = card.querySelector(".item-form");
    if (!form) return;
    const variantBtns = card.querySelectorAll(".variant-option-btn");
    const priceDisplay = card.querySelector("[data-price-display]");
    const variantIdInput = form.querySelector(".variant-id-input");

    let firstAvailableBtn = null;

    variantBtns.forEach((btn) => {
      const isAvailable = btn.dataset.available === "true";
      const inventory = parseInt(btn.dataset.inventory || "0", 10);
      
      // See above: available is authoritative, and inventory 0 also means
      // "not tracked", which is not the same as out of stock.
      const shouldDisable = !isAvailable;

      if (shouldDisable) {
        btn.classList.add("disabled");
        return;
      }

      if (!firstAvailableBtn) {
        firstAvailableBtn = btn;
      }

      btn.addEventListener("click", (e) => {
        e.preventDefault();

        variantBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        if (variantIdInput) {
          variantIdInput.value = btn.dataset.variantId;
        }

        const variantPrice = parseInt(btn.dataset.variantPriceRaw, 10);
        const comparePrice = parseInt(btn.dataset.variantCompare, 10);

        if (priceDisplay && variantPrice) {
          priceDisplay.textContent = currSym + (variantPrice / 100).toFixed(2);
        }

        let compareEl = card.querySelector("[data-compare-price]");
        let badgeEl = card.querySelector("[data-sale-badge]");

        // The theme's one sale rule (layout/theme.liquid).
        const showsWasPrice = window.ScentspiredSale.showsWasPrice(variantPrice, comparePrice);
        const saleBadgeText = window.ScentspiredSale.badge(variantPrice, comparePrice);

        if (showsWasPrice) {
          if (!compareEl) {
            compareEl = document.createElement("span");
            compareEl.className = "original-price";
            compareEl.setAttribute("data-compare-price", "");
            priceDisplay.after(compareEl);
          }
          compareEl.textContent = currSym + (comparePrice / 100).toFixed(2);
          compareEl.style.display = "inline";
        } else if (compareEl) {
          compareEl.remove();
        }

        if (saleBadgeText) {
          if (!badgeEl) {
            badgeEl = document.createElement("span");
            badgeEl.className = "price-badge";
            badgeEl.setAttribute("data-sale-badge", "");
            (compareEl || priceDisplay).after(badgeEl);
          }
          badgeEl.textContent = saleBadgeText;
          badgeEl.style.display = "inline";
        } else if (badgeEl) {
          badgeEl.remove();
        }
      });
    });

    if (firstAvailableBtn) {
      firstAvailableBtn.classList.add("active");
      if (variantIdInput) {
        variantIdInput.value = firstAvailableBtn.dataset.variantId;
      }

      if (priceDisplay) {
        const price = parseInt(firstAvailableBtn.dataset.variantPriceRaw, 10);
        const compare = parseInt(firstAvailableBtn.dataset.variantCompare, 10);

        priceDisplay.textContent = currSym + (price / 100).toFixed(2);

        // Trigger compare-at logic
        firstAvailableBtn.click();
      }
    }
  });

  // Handle add to cart
  document.querySelectorAll(".fragrance-container .item-form").forEach((form) => {
    let isSubmitting = false;

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      if (isSubmitting) return;

      const submitBtn = form.querySelector(".cart-button");
      if (!submitBtn) return;
      const variantIdInput = form.querySelector('input[name="id"]');
      const variantId = variantIdInput ? variantIdInput.value : null;

      if (!variantId) {
        alert(cardStrings.selectVariant);
        return;
      }

      isSubmitting = true;
      submitBtn.disabled = true;
      submitBtn.innerHTML = cardStrings.adding;

      fetch("/cart/add.js", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ id: variantId, quantity: 1 }),
      })
        .then((res) => {
          if (!res.ok) throw new Error(`cart/add.js ${res.status}`);
          return res.json();
        })
        .then(() => {
          submitBtn.innerHTML = cardStrings.added;
          updateVariantAvailability();
          return fetch('/cart.js');
        })
        .then((cartRes) => {
          if (!cartRes.ok) throw new Error(`cart.js ${cartRes.status}`);
          return cartRes.json();
        })
        .then((cartData) => {
          if (typeof window.updateDossierCartUI === 'function') {
            window.updateDossierCartUI(cartData);
          }
          if (typeof window.openDossierCart === 'function') {
            window.openDossierCart();
          }

          setTimeout(() => {
            submitBtn.disabled = false;
            submitBtn.innerHTML = cardStrings.addToCartUpper;
            isSubmitting = false;
          }, 2000);
        })
        .catch((err) => {
          console.error("Add to cart error:", err);
          submitBtn.disabled = false;
          submitBtn.innerHTML = cardStrings.addToCartUpper;
          isSubmitting = false;
        });
    });
  });

  // Mobile swipe pagination dots
  const layout = document.querySelector(".fragrance-layout");
  const dots = document.querySelectorAll(".fragrance-dot");

  if (layout && dots.length) {
    layout.addEventListener("scroll", () => {
      const firstCard = layout.querySelector(".fragrance-item");
      const cardWidth = (firstCard ? firstCard.offsetWidth : 300) + 12;
      const index = Math.round(layout.scrollLeft / cardWidth);

      dots.forEach((dot) => dot.classList.remove("active"));
      if (dots[index]) dots[index].classList.add("active");
    });
  }
})
