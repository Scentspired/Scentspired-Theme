class CartRemoveButton extends HTMLElement {
  constructor() {
    super();
    this.addEventListener('click', (event) => {
      event.preventDefault();
      const cartItems = this.closest('cart-items') || this.closest('cart-drawer-items');
      if (cartItems && typeof cartItems.updateQuantity === 'function') {
        cartItems.updateQuantity(this.dataset.index, 0, event);
      }
    });
  }
}

customElements.define('cart-remove-button', CartRemoveButton);

class CartItems extends HTMLElement {
  constructor() {
    super();
    this.lineItemStatusElement =
      document.getElementById('shopping-cart-line-item-status') || document.getElementById('CartDrawer-LineItemStatus');

    const debouncedOnChange = debounce((event) => {
      this.onChange(event);
    }, ON_CHANGE_DEBOUNCE_TIMER);

    this.addEventListener('change', debouncedOnChange.bind(this));
  }

  cartUpdateUnsubscriber = undefined;

  connectedCallback() {
    this.cartUpdateUnsubscriber = subscribe(PUB_SUB_EVENTS.cartUpdate, (event) => {
      if (event.source === 'cart-items') return;
      return this.onCartUpdate();
    });
  }

  disconnectedCallback() {
    if (this.cartUpdateUnsubscriber) this.cartUpdateUnsubscriber();
  }

  resetQuantityInput(id) {
    const input = this.querySelector(`#Quantity-${id}`);
    if (input) {
      input.value = input.getAttribute('value') || '';
    }
    this.isEnterPressed = false;
  }

  setValidity(event, index, message) {
    if (!event || !event.target) return;
    event.target.setCustomValidity(message);
    event.target.reportValidity();
    this.resetQuantityInput(index);
    if (typeof event.target.select === 'function') event.target.select();
  }

  validateQuantity(event) {
    if (!event || !event.target) return;
    const inputValue = parseInt(event.target.value);
    const index = event.target.dataset.index;
    let message = '';

    if (inputValue < event.target.dataset.min) {
      message = (window.quickOrderListStrings?.min_error || '').replace('[min]', event.target.dataset.min);
    } else if (inputValue > parseInt(event.target.max)) {
      message = (window.quickOrderListStrings?.max_error || '').replace('[max]', event.target.max);
    } else if (inputValue % parseInt(event.target.step || 1) !== 0) {
      message = (window.quickOrderListStrings?.step_error || '').replace('[step]', event.target.step);
    }

    if (message) {
      this.setValidity(event, index, message);
    } else {
      event.target.setCustomValidity('');
      event.target.reportValidity();

      // Instant price update
      this.updateLinePrice(index, inputValue);
      this.updateCartTotal();

      // Backend sync
      const activeName = document.activeElement ? document.activeElement.getAttribute('name') : null;
      this.updateQuantity(
        index,
        inputValue,
        event,
        activeName,
        event.target.dataset.quantityVariantId
      );
    }
  }

  onChange(event) {
    this.validateQuantity(event);
  }

  updateLinePrice(index, quantity) {
    const cartItem =
      this.querySelector(`#CartItem-${index}`) || this.querySelector(`#CartDrawer-Item-${index}`);
    if (!cartItem) return;

    const pricePerItem = parseFloat(cartItem.dataset.price || 0);
    const lineTotal = (pricePerItem * quantity).toFixed(2);

    const linePriceEl = cartItem.querySelector('.cart-item__line-price');
    if (linePriceEl) linePriceEl.textContent = `£${lineTotal}`;
  }

  updateCartTotal() {
    let total = 0;
    this.querySelectorAll('.cart-item').forEach((cartItem) => {
      const input = cartItem.querySelector('input[type="number"]');
      const quantity = input ? parseInt(input.value || 0) : 0;
      const price = parseFloat(cartItem.dataset.price || 0);
      total += price * quantity;
    });

    const totalEl =
      document.getElementById('Cart-Total') || document.getElementById('CartDrawer-Total');
    if (totalEl) totalEl.textContent = `£${total.toFixed(2)}`;
  }

  onCartUpdate() {
    if (this.tagName === 'CART-DRAWER-ITEMS') {
      return fetch(`${routes.cart_url}?section_id=cart-drawer`)
        .then((response) => response.text())
        .then((responseText) => {
          const html = new DOMParser().parseFromString(responseText, 'text/html');
          const selectors = ['cart-drawer-items', '.cart-drawer__footer'];
          for (const selector of selectors) {
            const targetElement = document.querySelector(selector);
            const sourceElement = html ? html.querySelector(selector) : null;
            if (targetElement && sourceElement) {
              targetElement.replaceWith(sourceElement);
            }
          }
        })
        .catch((e) => console.error(e));
    } else {
      return fetch(`${routes.cart_url}?section_id=main-cart-items`)
        .then((response) => response.text())
        .then((responseText) => {
          const html = new DOMParser().parseFromString(responseText, 'text/html');
          const sourceQty = html ? html.querySelector('cart-items') : null;
          if (sourceQty) this.innerHTML = sourceQty.innerHTML;
        })
        .catch((e) => console.error(e));
    }
  }

  getSectionsToRender() {
    const mainCartItems = document.getElementById('main-cart-items');
    const mainCartFooter = document.getElementById('main-cart-footer');
    return [
      {
        id: 'main-cart-items',
        section: mainCartItems ? mainCartItems.dataset.id : 'main-cart-items',
        selector: '.js-contents',
      },
      {
        id: 'cart-icon-bubble',
        section: 'cart-icon-bubble',
        selector: '.shopify-section',
      },
      {
        id: 'cart-live-region-text',
        section: 'cart-live-region-text',
        selector: '.shopify-section',
      },
      {
        id: 'main-cart-footer',
        section: mainCartFooter ? mainCartFooter.dataset.id : 'main-cart-footer',
        selector: '.js-contents',
      },
    ];
  }

  updateQuantity(line, quantity, event, name, variantId) {
    this.enableLoading(line);

    const body = JSON.stringify({
      line,
      quantity,
      sections: this.getSectionsToRender().map((section) => section.section),
      sections_url: window.location.pathname,
    });
    const eventTarget = event && event.currentTarget instanceof CartRemoveButton ? 'clear' : 'change';

    fetch(`${routes.cart_change_url}`, { ...fetchConfig(), ...{ body } })
      .then((response) => response.text())
      .then((state) => {
        const parsedState = JSON.parse(state);

        CartPerformance.measure(`${eventTarget}:paint-updated-sections"`, () => {
          const quantityElement =
            document.getElementById(`Quantity-${line}`) || document.getElementById(`Drawer-quantity-${line}`);
          const items = document.querySelectorAll('.cart-item');

          if (parsedState.errors) {
            if (quantityElement) quantityElement.value = quantityElement.getAttribute('value') || '';
            this.updateLiveRegions(line, parsedState.errors);
            return;
          }

          this.classList.toggle('is-empty', parsedState.item_count === 0);
          const cartDrawerWrapper = document.querySelector('cart-drawer') || document.querySelector('#sp-cart-drawer');
          const cartFooter = document.getElementById('main-cart-footer');

          if (cartFooter) cartFooter.classList.toggle('is-empty', parsedState.item_count === 0);
          if (cartDrawerWrapper) cartDrawerWrapper.classList.toggle('is-empty', parsedState.item_count === 0);

          this.getSectionsToRender().forEach((section) => {
            const secEl = document.getElementById(section.id);
            if (secEl && parsedState.sections && parsedState.sections[section.section]) {
              const elementToReplace = secEl.querySelector(section.selector) || secEl;
              const newContent = this.getSectionInnerHTML(
                parsedState.sections[section.section],
                section.selector
              );
              if (elementToReplace && newContent) elementToReplace.innerHTML = newContent;
            }
          });

          const updatedValue = parsedState.items && parsedState.items[line - 1] ? parsedState.items[line - 1].quantity : undefined;
          let message = '';
          if (quantityElement && items.length === (parsedState.items || []).length && updatedValue !== parseInt(quantityElement.value)) {
            if (typeof updatedValue === 'undefined') {
              message = window.cartStrings?.error || 'Error updating cart';
            } else {
              message = (window.cartStrings?.quantityError || '').replace('[quantity]', updatedValue);
            }
          }
          this.updateLiveRegions(line, message);
        });

        if (event) CartPerformance.measureFromEvent(`${eventTarget}:user-action`, event);

        publish(PUB_SUB_EVENTS.cartUpdate, { source: 'cart-items', cartData: parsedState, variantId: variantId });
      })
      .catch((err) => {
        console.error('Cart quantity update error:', err);
        this.querySelectorAll('.loading__spinner').forEach((overlay) => overlay.classList.add('hidden'));
        const errors = document.getElementById('cart-errors') || document.getElementById('CartDrawer-CartErrors');
        if (errors) errors.textContent = window.cartStrings?.error || 'Error updating cart';
      })
      .finally(() => {
        this.disableLoading(line);
      });
  }

  updateLiveRegions(line, message) {
    const lineItemError =
      document.getElementById(`Line-item-error-${line}`) || document.getElementById(`CartDrawer-LineItemError-${line}`);
    if (lineItemError) {
      const errText = lineItemError.querySelector('.cart-item__error-text');
      if (errText) errText.textContent = message;
    }

    if (this.lineItemStatusElement) this.lineItemStatusElement.setAttribute('aria-hidden', true);

    const cartStatus =
      document.getElementById('cart-live-region-text') || document.getElementById('CartDrawer-LiveRegionText');
    if (cartStatus) {
      cartStatus.setAttribute('aria-hidden', false);
      setTimeout(() => {
        cartStatus.setAttribute('aria-hidden', true);
      }, 1000);
    }
  }

  getSectionInnerHTML(html, selector) {
    try {
      const parsed = new DOMParser().parseFromString(html, 'text/html');
      const target = parsed ? parsed.querySelector(selector) : null;
      return target ? target.innerHTML : '';
    } catch (e) {
      return '';
    }
  }

  enableLoading(line) {
    const mainCartItems = document.getElementById('main-cart-items') || document.getElementById('CartDrawer-CartItems');
    if (mainCartItems) mainCartItems.classList.add('cart__items--disabled');

    const cartItemElements = this.querySelectorAll(`#CartItem-${line} .loading__spinner`);
    const cartDrawerItemElements = this.querySelectorAll(`#CartDrawer-Item-${line} .loading__spinner`);

    [...cartItemElements, ...cartDrawerItemElements].forEach((overlay) => overlay.classList.remove('hidden'));
    if (document.activeElement && typeof document.activeElement.blur === 'function') document.activeElement.blur();
    if (this.lineItemStatusElement) this.lineItemStatusElement.setAttribute('aria-hidden', false);
  }

  disableLoading(line) {
    const mainCartItems = document.getElementById('main-cart-items') || document.getElementById('CartDrawer-CartItems');
    if (mainCartItems) mainCartItems.classList.remove('cart__items--disabled');

    const cartItemElements = this.querySelectorAll(`#CartItem-${line} .loading__spinner`);
    const cartDrawerItemElements = this.querySelectorAll(`#CartDrawer-Item-${line} .loading__spinner`);

    cartItemElements.forEach((overlay) => overlay.classList.add('hidden'));
    cartDrawerItemElements.forEach((overlay) => overlay.classList.add('hidden'));
  }
}

customElements.define('cart-items', CartItems);

if (!customElements.get('cart-note')) {
  customElements.define(
    'cart-note',
    class CartNote extends HTMLElement {
      constructor() {
        super();

        this.addEventListener(
          'input',
          debounce((event) => {
            const body = JSON.stringify({ note: event.target.value });
            fetch(`${routes.cart_update_url}`, { ...fetchConfig(), ...{ body } })
              .then(() => CartPerformance.measureFromEvent('note-update:user-action', event))
              .catch((err) => console.error('Cart note error:', err));
          }, ON_CHANGE_DEBOUNCE_TIMER)
        );
      }
    }
  );
}
