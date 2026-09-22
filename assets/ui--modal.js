class ModalDialog extends HTMLElement {
  constructor() {
    super();
    const closeBtn = this.querySelector('[id^="ModalClose-"]');
    if (closeBtn) closeBtn.addEventListener("click", this.hide.bind(this, false));
    this.addEventListener("keyup", event => {
      if (event.code.toUpperCase() === "ESCAPE") this.hide();
    });
    if (this.classList.contains("media-modal")) {
      this.addEventListener("pointerup", event => {
        if (event.pointerType === "mouse" && !event.target.closest("deferred-media, product-model"))
          this.hide();
      });
    } else {
      this.addEventListener("click", event => {
        if (event.target === this) this.hide();
      });
    }
  }

  connectedCallback() {
    if (this.moved) return;
    this.moved = true;
    const shopifySec = this.closest(".shopify-section");
    if (shopifySec) {
      this.dataset.section = shopifySec.id.replace("shopify-section-", "");
    }
    document.body.appendChild(this);
  }

  show(opener) {
    this.openedBy = opener;
    const popup = this.querySelector(".template-popup");
    document.body.classList.add("overflow-hidden");
    this.setAttribute("open", "");
    if (popup && typeof popup.loadContent === "function") popup.loadContent();
    trapFocus(this, this.querySelector('[role="dialog"]'));
    if (typeof window.pauseAllMedia === "function") window.pauseAllMedia();
  }

  hide() {
    document.body.classList.remove("overflow-hidden");
    document.body.dispatchEvent(new CustomEvent("modalClosed"));
    this.removeAttribute("open");
    removeTrapFocus(this.openedBy);
    if (typeof window.pauseAllMedia === "function") window.pauseAllMedia();
  }
}
if (!customElements.get("modal-dialog")) {
  customElements.define("modal-dialog", ModalDialog);
}

class BulkModal extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const handleIntersection = (entries, observer) => {
      if (!entries[0].isIntersecting) return;
      observer.unobserve(this);
      if (this.innerHTML.trim() === "") {
        const productUrl = (this.dataset.url || "").split("?")[0];
        fetch(`${productUrl}?section_id=bulk-quick-order-list`)
          .then(response => {
            if (!response.ok) throw new Error("Failed to load bulk modal");
            return response.text();
          })
          .then(responseText => {
            const html = new DOMParser().parseFromString(responseText, "text/html");
            const container = html ? html.querySelector(".quick-order-list-container") : null;
            const sourceQty = container ? container.parentNode : null;
            if (sourceQty) this.innerHTML = sourceQty.innerHTML;
          })
          .catch(e => {
            console.error(e);
          });
      }
    };

    const targetEl = document.querySelector(
      `#QuickBulk-${this.dataset.productId}-${this.dataset.sectionId}`
    );
    if (targetEl) {
      new IntersectionObserver(handleIntersection.bind(this)).observe(targetEl);
    }
  }
}

if (!customElements.get("bulk-modal")) {
  customElements.define("bulk-modal", BulkModal);
}

class ModalOpener extends HTMLElement {
  constructor() {
    super();

    const button = this.querySelector("button");

    if (!button) return;
    button.addEventListener("click", () => {
      const modal = document.querySelector(this.getAttribute("data-modal"));
      if (modal) modal.show(button);
    });
  }
}
if (!customElements.get("modal-opener")) {
  customElements.define("modal-opener", ModalOpener);
}
