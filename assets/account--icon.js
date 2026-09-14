class AccountIcon extends HTMLElement {
  constructor() {
    super();

    this.icon = this.querySelector(".icon");
  }

  connectedCallback() {
    document.addEventListener(
      "storefront:signincompleted",
      this.handleStorefrontSignInCompleted.bind(this)
    );
  }

  handleStorefrontSignInCompleted(event) {
    if (event?.detail?.avatar) {
      this.icon?.replaceWith(event.detail.avatar.cloneNode());
    }
  }
}

if (!customElements.get("account-icon")) {
  customElements.define("account-icon", AccountIcon);
}
