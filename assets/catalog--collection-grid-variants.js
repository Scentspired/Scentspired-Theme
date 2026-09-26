/* The collection grid's variant buttons: price and selection on the card. Moved from sections/catalog--collection-grid.liquid. */
  // This script is likely for handling hover effects or variant selections on product cards
  document.addEventListener('DOMContentLoaded', function () {
    // Listen for variant button clicks and update price
    document.querySelectorAll('.hover-variant-wrapper').forEach(function (wrapper) {
      const variantButtons = wrapper.querySelectorAll('.hover-variant-btn');
      const scentCard = wrapper.closest('.scent-card');
      const priceElement = scentCard?.querySelector('.scent-price');

      variantButtons.forEach(function (btn) {
        btn.addEventListener('click', function () {
          const newPrice = btn.getAttribute('data-variant-price-raw');

          // Update the scent-price element when variant is selected
          if (priceElement && newPrice) {
            console.log('[v0] Updating price to:', newPrice);
            priceElement.innerHTML = newPrice;
            priceElement.setAttribute('data-product-price', newPrice);
          }
        });
      });
    });

    // This part seems to be related to form submission and variant IDs
    document.querySelectorAll('.product-form').forEach(function (form) {
      const variantInput = form.querySelector('.form-variant-id');
      const selectedVariantInput =
        form.closest('.scent-overlay')?.previousElementSibling?.querySelector('.hover-selected-variant') ||
        form.parentElement?.querySelector('.hover-selected-variant');

      form.addEventListener('submit', function (e) {
        if (selectedVariantInput) {
          variantInput.value = selectedVariantInput.value;
        }
      });
    });
  });
